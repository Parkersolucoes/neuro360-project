
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

export class CompanyService {
  static async fetchAllCompanies() {
    try {
      console.log('CompanyService: Fetching all companies from database...');
      
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          plans (
            id,
            name,
            price
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('CompanyService: Error fetching companies:', error);
        throw error;
      }

      console.log('CompanyService: Companies fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('CompanyService: fetchAllCompanies error:', error);
      throw error;
    }
  }

  static async fetchUserCompanies(userId: string) {
    try {
      console.log('CompanyService: Fetching companies for user:', userId);
      
      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          companies (
            id,
            name,
            document,
            email,
            phone,
            address,
            status,
            plan_id,
            created_at,
            updated_at,
            plans (
              id,
              name,
              price
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('CompanyService: Error fetching user companies:', error);
        throw error;
      }

      console.log('CompanyService: User companies data:', data);

      const companies = (data || [])
        .map(item => item.companies)
        .filter(Boolean) as Company[];
        
      console.log('CompanyService: Processed user companies:', companies);
      return companies;
    } catch (error) {
      console.error('CompanyService: fetchUserCompanies error:', error);
      throw error;
    }
  }

  static async createCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    // Validações básicas
    if (!companyData.name?.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }
    
    if (!companyData.document?.trim()) {
      throw new Error('CNPJ é obrigatório');
    }
    
    if (!companyData.email?.trim()) {
      throw new Error('Email é obrigatório');
    }

    // Verificar se CNPJ já existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('document', companyData.document.trim())
      .maybeSingle();

    if (existingCompany) {
      throw new Error('Já existe uma empresa com este CNPJ');
    }

    // Verificar se email já existe
    const { data: existingEmailCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', companyData.email.trim().toLowerCase())
      .maybeSingle();

    if (existingEmailCompany) {
      throw new Error('Já existe uma empresa com este email');
    }

    const companyToInsert = {
      name: companyData.name.trim(),
      document: companyData.document.trim(),
      email: companyData.email.trim().toLowerCase(),
      phone: companyData.phone?.trim() || null,
      address: companyData.address?.trim() || null,
      status: companyData.status || 'active',
      plan_id: companyData.plan_id || null
    };

    const { data, error } = await supabase
      .from('companies')
      .insert([companyToInsert])
      .select(`
        *,
        plans (
          id,
          name,
          price
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        throw new Error('CNPJ ou email já está em uso por outra empresa');
      }
      throw new Error(`Erro do banco de dados: ${error.message}`);
    }

    return data;
  }

  static async updateCompany(id: string, updates: Partial<Company>) {
    // Validações para atualização
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error('Formato de email inválido');
      }

      // Verificar se email já existe em outra empresa
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('email', updates.email.toLowerCase())
        .neq('id', id)
        .maybeSingle();

      if (existingCompany) {
        throw new Error('Já existe outra empresa com este email');
      }
    }

    if (updates.document) {
      // Verificar se CNPJ já existe em outra empresa
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('document', updates.document.trim())
        .neq('id', id)
        .maybeSingle();

      if (existingCompany) {
        throw new Error('Já existe outra empresa com este CNPJ');
      }
    }

    const updateData: any = { ...updates };
    
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }
    
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    
    if (updateData.document) {
      updateData.document = updateData.document.trim();
    }
    
    if (updateData.phone) {
      updateData.phone = updateData.phone.trim();
    }
    
    if (updateData.address) {
      updateData.address = updateData.address.trim();
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        plans (
          id,
          name,
          price
        )
      `)
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      if (error.code === '23505') {
        throw new Error('CNPJ ou email já está em uso por outra empresa');
      }
      throw new Error(`Erro do banco de dados: ${error.message}`);
    }

    return data;
  }

  static async deleteCompany(id: string) {
    // Verificar se há usuários associados à empresa
    const { data: userCompanies } = await supabase
      .from('user_companies')
      .select('id')
      .eq('company_id', id)
      .limit(1);

    if (userCompanies && userCompanies.length > 0) {
      throw new Error('Não é possível excluir uma empresa que possui usuários associados');
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Erro do banco de dados: ${error.message}`);
    }
  }
}

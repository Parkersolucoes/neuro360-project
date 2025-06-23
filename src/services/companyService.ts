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
    try {
      console.log('CompanyService: Starting company creation...');
      console.log('CompanyService: Company data received:', companyData);
      
      // Verificar se há usuário logado no sistema customizado
      const savedUser = localStorage.getItem('userLogin');
      console.log('CompanyService: Checking saved user in localStorage:', savedUser);
      
      if (!savedUser) {
        throw new Error('Usuário não está logado no sistema');
      }

      let userLogin;
      try {
        userLogin = JSON.parse(savedUser);
      } catch (error) {
        console.error('CompanyService: Error parsing user data:', error);
        throw new Error('Dados de usuário inválidos');
      }

      console.log('CompanyService: Current user login data:', userLogin);
      console.log('CompanyService: User is_admin value:', userLogin.is_admin);
      console.log('CompanyService: User is_master value:', userLogin.is_master);

      // Verificar se o usuário é master (is_admin = '0')
      if (userLogin.is_admin !== '0' && !userLogin.is_master) {
        throw new Error('Apenas usuários master podem criar empresas');
      }

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
      console.log('CompanyService: Checking if document already exists...');
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('document', companyData.document.trim())
        .maybeSingle();

      if (existingCompany) {
        throw new Error('Já existe uma empresa com este CNPJ');
      }

      // Verificar se email já existe
      console.log('CompanyService: Checking if email already exists...');
      const { data: existingEmailCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('email', companyData.email.trim().toLowerCase())
        .maybeSingle();

      if (existingEmailCompany) {
        throw new Error('Já existe uma empresa com este email');
      }

      console.log('CompanyService: Attempting to create company via RPC...');
      
      // Usar RPC para criar empresa como master user
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_company_as_master', {
        company_name: companyData.name.trim(),
        company_document: companyData.document.trim(),
        company_email: companyData.email.trim().toLowerCase(),
        company_phone: companyData.phone?.trim() || null,
        company_address: companyData.address?.trim() || null,
        company_status: companyData.status || 'active',
        company_plan_id: companyData.plan_id || null,
        master_user_id: userLogin.id
      });

      if (rpcError) {
        console.error('CompanyService: RPC error:', rpcError);
        throw new Error(`Erro ao criar empresa: ${rpcError.message}`);
      }

      console.log('CompanyService: RPC response:', rpcData);

      if (!rpcData || rpcData.length === 0) {
        throw new Error('Erro: Nenhum ID de empresa retornado');
      }

      // Pegar o ID da empresa criada
      const companyId = rpcData[0]?.company_id;
      
      if (!companyId) {
        throw new Error('Erro: ID da empresa não encontrado na resposta');
      }

      console.log('CompanyService: Company created with ID:', companyId);
      
      // Buscar a empresa criada com os dados completos
      const { data: createdCompany, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          plans (
            id,
            name,
            price
          )
        `)
        .eq('id', companyId)
        .single();

      if (fetchError) {
        console.error('CompanyService: Error fetching created company:', fetchError);
        throw new Error('Empresa criada mas erro ao buscar dados completos');
      }

      console.log('CompanyService: Company created successfully:', createdCompany);
      return createdCompany;
    } catch (error) {
      console.error('CompanyService: createCompany error:', error);
      throw error;
    }
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

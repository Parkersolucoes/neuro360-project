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
            qr_code,
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

  private static validateCompanyData(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const errors: string[] = [];

    if (!companyData.name?.trim()) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (!companyData.document?.trim()) {
      errors.push('CNPJ é obrigatório');
    } else {
      // Validação básica de CNPJ (apenas números e formato)
      const cnpj = companyData.document.replace(/\D/g, '');
      if (cnpj.length !== 14) {
        errors.push('CNPJ deve conter 14 dígitos');
      }
    }

    if (!companyData.email?.trim()) {
      errors.push('Email é obrigatório');
    } else {
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyData.email)) {
        errors.push('Formato de email inválido');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  private static async checkUniqueConstraints(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>, excludeId?: string) {
    // Verificar se CNPJ já existe
    console.log('CompanyService: Checking if document already exists...');
    const documentQuery = supabase
      .from('companies')
      .select('id, name')
      .eq('document', companyData.document.trim());
    
    if (excludeId) {
      documentQuery.neq('id', excludeId);
    }

    const { data: existingCompanyByDocument } = await documentQuery.maybeSingle();

    if (existingCompanyByDocument) {
      throw new Error(`CNPJ ${companyData.document} já está sendo usado pela empresa "${existingCompanyByDocument.name}"`);
    }

    // Verificar se email já existe
    console.log('CompanyService: Checking if email already exists...');
    const emailQuery = supabase
      .from('companies')
      .select('id, name')
      .eq('email', companyData.email.trim().toLowerCase());
    
    if (excludeId) {
      emailQuery.neq('id', excludeId);
    }

    const { data: existingCompanyByEmail } = await emailQuery.maybeSingle();

    if (existingCompanyByEmail) {
      throw new Error(`Email ${companyData.email} já está sendo usado pela empresa "${existingCompanyByEmail.name}"`);
    }
  }

  static async createCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('CompanyService: Starting company creation...');
      console.log('CompanyService: Company data received:', companyData);

      // Validações básicas
      this.validateCompanyData(companyData);

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

      // Verificar se o usuário é master (is_admin = '0' ou is_master = true)
      if (userLogin.is_admin !== '0' && !userLogin.is_master) {
        console.error('CompanyService: User is not master - is_admin:', userLogin.is_admin, 'is_master:', userLogin.is_master);
        throw new Error('Apenas usuários master podem criar empresas');
      }

      // Verificar constraints únicas
      await this.checkUniqueConstraints(companyData);

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
        
        // Tratamento específico para erros de constraint
        if (rpcError.code === '23505') {
          if (rpcError.message?.includes('companies_document_key')) {
            throw new Error(`CNPJ ${companyData.document} já está em uso por outra empresa`);
          }
          if (rpcError.message?.includes('companies_email_key')) {
            throw new Error(`Email ${companyData.email} já está em uso por outra empresa`);
          }
          throw new Error('Dados já existem no sistema. Verifique CNPJ e email');
        }
        
        // Se o erro for de permissão, tentar inserção direta
        if (rpcError.message?.includes('master') || rpcError.code === '42501') {
          console.log('CompanyService: Trying direct insertion as fallback...');
          
          const { data: directData, error: directError } = await supabase
            .from('companies')
            .insert({
              name: companyData.name.trim(),
              document: companyData.document.trim(),
              email: companyData.email.trim().toLowerCase(),
              phone: companyData.phone?.trim() || null,
              address: companyData.address?.trim() || null,
              status: companyData.status || 'active',
              plan_id: companyData.plan_id || null,
              qr_code: companyData.qr_code || null
            })
            .select()
            .single();

          if (directError) {
            console.error('CompanyService: Direct insertion error:', directError);
            
            // Tratamento específico para erros de constraint na inserção direta
            if (directError.code === '23505') {
              if (directError.message?.includes('companies_document_key')) {
                throw new Error(`CNPJ ${companyData.document} já está em uso por outra empresa`);
              }
              if (directError.message?.includes('companies_email_key')) {
                throw new Error(`Email ${companyData.email} já está em uso por outra empresa`);
              }
              throw new Error('Dados já existem no sistema. Verifique CNPJ e email');
            }
            
            throw new Error(`Erro ao criar empresa: ${directError.message}`);
          }

          console.log('CompanyService: Company created via direct insertion:', directData);
          
          // Vincular automaticamente ao usuário master
          const { error: linkError } = await supabase
            .from('user_companies')
            .insert({
              user_id: userLogin.id,
              company_id: directData.id,
              role: 'admin',
              is_primary: false
            });

          if (linkError) {
            console.error('CompanyService: Error linking company to master user:', linkError);
          }

          return directData;
        }
        
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
    try {
      console.log('CompanyService: Starting company update for ID:', id);
      console.log('CompanyService: Update data:', updates);

      // Validações para atualização
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Formato de email inválido');
        }
      }

      if (updates.document) {
        const cnpj = updates.document.replace(/\D/g, '');
        if (cnpj.length !== 14) {
          throw new Error('CNPJ deve conter 14 dígitos');
        }
      }

      // Verificar constraints únicas se email ou document estão sendo atualizados
      if (updates.email || updates.document) {
        const tempData = {
          name: updates.name || '',
          document: updates.document || '',
          email: updates.email || '',
          phone: updates.phone || '',
          address: updates.address || '',
          status: updates.status || 'active',
          plan_id: updates.plan_id || '',
          qr_code: updates.qr_code || ''
        };

        if (updates.email && updates.document) {
          await this.checkUniqueConstraints(tempData, id);
        } else if (updates.email) {
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id, name')
            .eq('email', updates.email.toLowerCase())
            .neq('id', id)
            .maybeSingle();

          if (existingCompany) {
            throw new Error(`Email ${updates.email} já está sendo usado pela empresa "${existingCompany.name}"`);
          }
        } else if (updates.document) {
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id, name')
            .eq('document', updates.document.trim())
            .neq('id', id)
            .maybeSingle();

          if (existingCompany) {
            throw new Error(`CNPJ ${updates.document} já está sendo usado pela empresa "${existingCompany.name}"`);
          }
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
        console.error('CompanyService: Update error:', error);
        
        // Tratamento específico para erros de constraint
        if (error.code === '23505') {
          if (error.message?.includes('companies_document_key')) {
            throw new Error(`CNPJ ${updates.document} já está em uso por outra empresa`);
          }
          if (error.message?.includes('companies_email_key')) {
            throw new Error(`Email ${updates.email} já está em uso por outra empresa`);
          }
          throw new Error('Dados já existem no sistema. Verifique CNPJ e email');
        }
        
        throw new Error(`Erro ao atualizar empresa: ${error.message}`);
      }

      console.log('CompanyService: Company updated successfully:', data);
      return data;
    } catch (error) {
      console.error('CompanyService: updateCompany error:', error);
      throw error;
    }
  }

  static async deleteCompany(id: string) {
    try {
      console.log('CompanyService: Starting company deletion for ID:', id);

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
        console.error('CompanyService: Delete error:', error);
        throw new Error(`Erro ao excluir empresa: ${error.message}`);
      }

      console.log('CompanyService: Company deleted successfully');
    } catch (error) {
      console.error('CompanyService: deleteCompany error:', error);
      throw error;
    }
  }
}

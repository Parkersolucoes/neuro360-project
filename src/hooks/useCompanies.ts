
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  plan_id?: string;
  created_at: string;
  updated_at: string;
}

interface CompaniesContextType {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  setCurrentCompany: (company: Company | null) => void;
  createCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<Company>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLogin } = useAuth();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies...');
      
      // Se for usuário master, buscar todas as empresas
      if (userLogin?.is_master) {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        console.log('All companies fetched for master user:', data);
        setCompanies(data || []);
        
        // Se ainda não há empresa selecionada, selecionar a primeira ou a empresa padrão
        if (!currentCompany && data && data.length > 0) {
          const defaultCompany = data.find(c => c.id === '0a988013-fa43-4d9d-9bfa-22c245c0c1ea') || data[0];
          setCurrentCompany(defaultCompany);
        }
        return;
      }

      // Para usuários normais, buscar apenas empresas associadas
      if (!userLogin) {
        setCompanies([]);
        return;
      }

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
            updated_at
          )
        `)
        .eq('user_id', userLogin.id);

      if (error) throw error;

      const userCompanies = (data || [])
        .map(item => item.companies)
        .filter(Boolean) as Company[];

      console.log('User companies fetched:', userCompanies);
      setCompanies(userCompanies);

      // Se ainda não há empresa selecionada, selecionar a primeira
      if (!currentCompany && userCompanies.length > 0) {
        setCurrentCompany(userCompanies[0]);
      }

    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating company with data:', companyData);

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
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          throw new Error('CNPJ ou email já está em uso por outra empresa');
        }
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      console.log('Company created successfully:', data);

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      console.log('Updating company:', id, 'with data:', updates);

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
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        if (error.code === '23505') {
          throw new Error('CNPJ ou email já está em uso por outra empresa');
        }
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('Deleting company:', id);

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

      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });

      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userLogin]);

  return (
    <CompaniesContext.Provider value={{
      companies,
      currentCompany,
      loading,
      setCurrentCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      refetch: fetchCompanies
    }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
}

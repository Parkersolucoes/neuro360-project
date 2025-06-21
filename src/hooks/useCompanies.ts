
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
      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar empresa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso"
      });

      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover empresa",
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

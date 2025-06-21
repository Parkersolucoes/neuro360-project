import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: string;
  plan_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  plans?: {
    name: string;
    price: number;
    max_sql_connections: number;
    max_sql_queries: number;
  };
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'user' | 'manager';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  companies?: Company;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get user companies
      const { data: userCompaniesData, error: userCompaniesError } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (userCompaniesError) throw userCompaniesError;

      if (!userCompaniesData || userCompaniesData.length === 0) {
        setUserCompanies([]);
        setLoading(false);
        return;
      }

      // Get company IDs to fetch company details
      const companyIds = userCompaniesData.map(uc => uc.company_id);

      // Fetch companies with their plans
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      // Combine user_companies with companies data
      const enrichedUserCompanies: UserCompany[] = userCompaniesData.map(uc => {
        const company = companiesData?.find(c => c.id === uc.company_id);
        return {
          ...uc,
          role: uc.role as 'admin' | 'user' | 'manager',
          companies: company ? {
            ...company,
            status: company.status as 'active' | 'inactive' | 'suspended'
          } : undefined
        };
      });
      
      setUserCompanies(enrichedUserCompanies);
      
      // Set first company as current if none selected
      if (enrichedUserCompanies.length > 0 && !currentCompany && enrichedUserCompanies[0].companies) {
        setCurrentCompany(enrichedUserCompanies[0].companies);
      }
    } catch (error) {
      console.error('Error fetching user companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          status: companyData.status as 'active' | 'inactive' | 'suspended'
        }])
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .single();

      if (companyError) throw companyError;

      // Associate user as admin of the company
      const { error: userCompanyError } = await supabase
        .from('user_companies')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'admin'
        }]);

      if (userCompanyError) throw userCompanyError;

      const typedCompany = {
        ...company,
        status: company.status as 'active' | 'inactive' | 'suspended'
      };

      setCompanies(prev => [...prev, typedCompany]);
      await fetchUserCompanies();
      
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });
      
      return typedCompany;
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
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        status: data.status as 'active' | 'inactive' | 'suspended'
      };
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? typedData : company
      ));
      
      if (currentCompany?.id === id) {
        setCurrentCompany(typedData);
      }
      
      await fetchUserCompanies();
      
      return typedData;
    } catch (error) {
      console.error('Error updating company:', error);
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
      
      setCompanies(prev => prev.filter(company => company.id !== id));
      
      if (currentCompany?.id === id) {
        setCurrentCompany(null);
      }
      
      await fetchUserCompanies();
      
      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover empresa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  return {
    companies,
    userCompanies,
    currentCompany,
    setCurrentCompany,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchUserCompanies
  };
}

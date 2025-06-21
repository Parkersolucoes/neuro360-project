
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

      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          *,
          companies:company_id(
            *,
            plans:plan_id(name, price, max_sql_connections, max_sql_queries)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        role: item.role as 'admin' | 'user' | 'manager',
        companies: item.companies ? {
          ...item.companies,
          status: item.companies.status as 'active' | 'inactive' | 'suspended'
        } : undefined
      }));
      
      setUserCompanies(typedData);
      
      // Set first company as current if none selected
      if (typedData.length > 0 && !currentCompany) {
        setCurrentCompany(typedData[0].companies || null);
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
          plans:plan_id(name, price, max_sql_connections, max_sql_queries)
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
          plans:plan_id(name, price, max_sql_connections, max_sql_queries)
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

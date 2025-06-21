
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

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `);

      if (companiesError) throw companiesError;

      const typedCompanies: Company[] = (companiesData || []).map(company => ({
        ...company,
        status: company.status as 'active' | 'inactive' | 'suspended'
      }));
      
      setCompanies(typedCompanies);
      
      // Set first company as current if none selected
      if (typedCompanies.length > 0 && !currentCompany) {
        setCurrentCompany(typedCompanies[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
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

      const typedCompany = {
        ...company,
        status: company.status as 'active' | 'inactive' | 'suspended'
      };

      setCompanies(prev => [...prev, typedCompany]);
      
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
    fetchCompanies();
  }, []);

  return {
    companies,
    currentCompany,
    setCurrentCompany,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies
  };
}

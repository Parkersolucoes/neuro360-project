
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: string;
  plan_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas",
          variant: "destructive"
        });
        return;
      }

      setCompanies(data || []);
      
      // Set first company as current if none selected
      if (data && data.length > 0 && !currentCompany) {
        setCurrentCompany(data[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar empresa",
          variant: "destructive"
        });
        throw error;
      }

      setCompanies(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar empresa",
          variant: "destructive"
        });
        throw error;
      }

      setCompanies(prev => prev.map(company => 
        company.id === id ? data : company
      ));

      if (currentCompany?.id === id) {
        setCurrentCompany(data);
      }

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });

      return data;
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

      if (error) {
        console.error('Error deleting company:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover empresa",
          variant: "destructive"
        });
        throw error;
      }

      setCompanies(prev => prev.filter(company => company.id !== id));
      
      if (currentCompany?.id === id) {
        const remaining = companies.filter(c => c.id !== id);
        setCurrentCompany(remaining.length > 0 ? remaining[0] : null);
      }

      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    currentCompany,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    setCurrentCompany,
    refetch: fetchCompanies
  };
}

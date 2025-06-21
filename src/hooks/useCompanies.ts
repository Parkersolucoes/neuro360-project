import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan_id: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('companies')
        .select('*');

      // Se não for admin, filtrar apenas empresas do usuário
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userCompanies } = await supabase
            .from('user_companies')
            .select('company_id')
            .eq('user_id', user.id);
          
          if (userCompanies && userCompanies.length > 0) {
            const companyIds = userCompanies.map(uc => uc.company_id);
            query = query.in('id', companyIds);
          } else {
            // Se não há empresas associadas, retornar lista vazia
            setCompanies([]);
            setCurrentCompany(null);
            return;
          }
        }
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas",
          variant: "destructive"
        });
        setCompanies([]); // Garantir que sempre seja um array
        return;
      }

      const companiesData: Company[] = (data || []).map(company => ({
        ...company,
        status: company.status as "active" | "inactive" | "suspended"
      }));
      
      setCompanies(companiesData);
      
      // Se não há empresa selecionada e há empresas disponíveis, selecionar a primeira
      if (!currentCompany && companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]); // Garantir que sempre seja um array
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
      
      const newCompany: Company = {
        ...data,
        status: data.status as "active" | "inactive" | "suspended"
      };
      
      setCompanies(prev => [newCompany, ...prev]);
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });
      
      return newCompany;
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
      
      const updatedCompany: Company = {
        ...data,
        status: data.status as "active" | "inactive" | "suspended"
      };
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? updatedCompany : company
      ));
      
      if (currentCompany?.id === id) {
        setCurrentCompany(updatedCompany);
      }
      
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });
      
      return updatedCompany;
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
        const remainingCompanies = companies.filter(company => company.id !== id);
        setCurrentCompany(remainingCompanies.length > 0 ? remainingCompanies[0] : null);
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
  }, [isAdmin]);

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

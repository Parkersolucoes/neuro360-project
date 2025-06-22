
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

export function useSQLQueriesNew() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchQueries = async () => {
    if (!currentCompany?.id) {
      setQueries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sql_queries')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching SQL queries:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar consultas SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuery = async (queryData: any) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .insert({
          ...queryData,
          company_id: currentCompany?.id
        })
        .select()
        .single();

      if (error) throw error;

      setQueries(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      setQueries(prev => prev.map(query => 
        query.id === id ? data : query
      ));

      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Error updating SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sql_queries')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      setQueries(prev => prev.filter(query => query.id !== id));
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [currentCompany?.id]);

  return {
    queries,
    loading,
    createQuery,
    updateQuery,
    deleteQuery,
    refetch: fetchQueries
  };
}

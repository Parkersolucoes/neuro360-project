
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';

export interface SQLQuery {
  id: string;
  connection_id: string;
  name: string;
  description?: string;
  query_text: string;
  last_execution?: string;
  status: 'success' | 'error' | 'pending';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  sql_connections?: {
    name: string;
  };
}

export function useSQLQueries() {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchQueries = async () => {
    try {
      if (!currentCompany?.id) {
        setQueries([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sql_queries')
        .select(`
          *,
          sql_connections!inner(name, company_id)
        `)
        .eq('sql_connections.company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SQL queries:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar consultas SQL",
          variant: "destructive"
        });
        return;
      }

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

  const createQuery = async (query: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      if (!currentCompany?.id) {
        toast({
          title: "Erro",
          description: "Selecione uma empresa para criar consultas SQL",
          variant: "destructive"
        });
        throw new Error('No company selected');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('sql_queries')
        .insert([{
          ...query,
          created_by: currentUser.user?.id
        }])
        .select(`
          *,
          sql_connections(name)
        `)
        .single();

      if (error) {
        console.error('Error creating SQL query:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar consulta SQL",
          variant: "destructive"
        });
        throw error;
      }
      
      setQueries(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating SQL query:', error);
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQuery>) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          sql_connections(name)
        `)
        .single();

      if (error) {
        console.error('Error updating SQL query:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar consulta SQL",
          variant: "destructive"
        });
        throw error;
      }
      
      setQueries(prev => prev.map(query => 
        query.id === id ? data : query
      ));
      
      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating SQL query:', error);
      throw error;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sql_queries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting SQL query:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover consulta SQL",
          variant: "destructive"
        });
        throw error;
      }

      setQueries(prev => prev.filter(query => query.id !== id));
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  sql_connections?: {
    name: string;
  };
}

export function useSQLQueries() {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .select(`
          *,
          sql_connections!inner(name)
        `)
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

  const createQuery = async (query: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sql_queries')
        .insert([{ ...query, user_id: user.id }])
        .select(`
          *,
          sql_connections!inner(name)
        `)
        .single();

      if (error) throw error;
      
      setQueries(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso!"
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

  const updateQuery = async (id: string, updates: Partial<SQLQuery>) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          sql_connections!inner(name)
        `)
        .single();

      if (error) throw error;
      
      setQueries(prev => prev.map(query => 
        query.id === id ? { ...query, ...data } : query
      ));
      
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
        .eq('id', id);

      if (error) throw error;
      
      setQueries(prev => prev.filter(query => query.id !== id));
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso!"
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
  }, []);

  return {
    queries,
    loading,
    createQuery,
    updateQuery,
    deleteQuery,
    refetch: fetchQueries
  };
}

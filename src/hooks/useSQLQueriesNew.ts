
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';

export interface SQLQueryNew {
  id: string;
  company_id: string;
  connection_id: string;
  name: string;
  description?: string;
  query_text: string;
  created_by?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  sql_connections?: {
    name: string;
    host: string;
    port: number;
    database_name: string;
  };
}

export function useSQLQueriesNew() {
  const [queries, setQueries] = useState<SQLQueryNew[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { logError, logInfo } = useSystemLogsDB();

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
        .select(`
          *,
          sql_connections (
            name,
            host,
            port,
            database_name
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
      logInfo('Consultas SQL carregadas com sucesso', 'useSQLQueriesNew');
    } catch (error) {
      console.error('Error fetching SQL queries:', error);
      logError('Erro ao carregar consultas SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar consultas SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuery = async (queryData: Omit<SQLQueryNew, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .insert({
          ...queryData,
          company_id: currentCompany?.id
        })
        .select(`
          *,
          sql_connections (
            name,
            host,
            port,
            database_name
          )
        `)
        .single();

      if (error) throw error;

      setQueries(prev => [data, ...prev]);
      logInfo('Consulta SQL criada com sucesso', 'useSQLQueriesNew', { queryId: data.id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating SQL query:', error);
      logError('Erro ao criar consulta SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao criar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQueryNew>) => {
    try {
      const { data, error } = await supabase
        .from('sql_queries')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select(`
          *,
          sql_connections (
            name,
            host,
            port,
            database_name
          )
        `)
        .single();

      if (error) throw error;

      setQueries(prev => prev.map(query => 
        query.id === id ? data : query
      ));

      logInfo('Consulta SQL atualizada com sucesso', 'useSQLQueriesNew', { queryId: id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Error updating SQL query:', error);
      logError('Erro ao atualizar consulta SQL', 'useSQLQueriesNew', error);
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
      logInfo('Consulta SQL removida com sucesso', 'useSQLQueriesNew', { queryId: id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
      logError('Erro ao remover consulta SQL', 'useSQLQueriesNew', error);
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SQLQuery } from '@/types/sqlQuery';

export function useSQLQueries(companyId?: string) {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueries = async () => {
    try {
      console.log('SQLQueries: Table sql_queries does not exist in current database schema');
      
      // Como a tabela sql_queries não existe, retornar array vazio
      setQueries([]);
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

  const createQuery = async (queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      console.log('SQLQueries: Cannot create query - table sql_queries does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de consultas SQL está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error creating SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar consulta SQL",
        variant: "destructive"
      });
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQuery>) => {
    try {
      console.log('SQLQueries: Cannot update query - table sql_queries does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de consultas SQL está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar consulta SQL",
        variant: "destructive"
      });
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      console.log('SQLQueries: Cannot delete query - table sql_queries does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de consultas SQL está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar consulta SQL",
        variant: "destructive"
      });
    }
  };

  const updateQueryStatus = (queryId: string, status: 'success' | 'error' | 'pending') => {
    setQueries(prev => prev.map(query => 
      query.id === queryId ? { ...query, status } : query
    ));
  };

  const addQueryResult = (queryId: string, result: any) => {
    setQueries(prev => prev.map(query => 
      query.id === queryId ? { ...query, result, status: 'success' as const } : query
    ));
  };

  useEffect(() => {
    fetchQueries();
  }, [companyId]);

  return {
    queries,
    loading,
    createQuery,
    updateQuery,
    deleteQuery,
    updateQueryStatus,
    addQueryResult,
    refetch: fetchQueries
  };
}

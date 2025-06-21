

import { useState, useEffect } from 'react';
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
      // Since sql_queries table doesn't exist, return empty array
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

  const createQuery = async (query: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      // Simulate creating a query since table doesn't exist
      const mockQuery: SQLQuery = {
        id: `mock-query-${Date.now()}`,
        ...query,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sql_connections: {
          name: 'Mock Connection'
        }
      };
      
      setQueries(prev => [mockQuery, ...prev]);
      toast({
        title: "Informação",
        description: "Funcionalidade SQL Queries será implementada em uma próxima versão. Consulta simulada criada."
      });
      
      return mockQuery;
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
      // Simulate updating query
      const updatedQuery = queries.find(query => query.id === id);
      if (!updatedQuery) throw new Error('Query not found');
      
      const newQuery = { ...updatedQuery, ...updates };
      setQueries(prev => prev.map(query => 
        query.id === id ? newQuery : query
      ));
      
      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso!"
      });
      
      return newQuery;
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


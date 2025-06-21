
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { SQLQuery } from '@/types/sqlQuery';
import { SQLQueryService } from '@/services/sqlQueryService';

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

      const queriesData = await SQLQueryService.fetchQueriesForCompany(currentCompany.id);
      setQueries(queriesData);
    } catch (error) {
      console.error('Error fetching SQL queries:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar consultas SQL",
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

      const newQuery = await SQLQueryService.createQuery(query);
      setQueries(prev => [newQuery, ...prev]);
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso!"
      });
      
      return newQuery;
    } catch (error) {
      console.error('Error creating SQL query:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQuery>) => {
    try {
      const updatedQuery = await SQLQueryService.updateQuery(id, updates);
      setQueries(prev => prev.map(query => 
        query.id === id ? updatedQuery : query
      ));
      
      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso!"
      });
      
      return updatedQuery;
    } catch (error) {
      console.error('Error updating SQL query:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      await SQLQueryService.deleteQuery(id);
      setQueries(prev => prev.filter(query => query.id !== id));
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover consulta SQL",
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

export type { SQLQuery };

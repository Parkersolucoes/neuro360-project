import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { usePlans } from '@/hooks/usePlans';
import { SQLQuery } from '@/types/sqlQuery';
import { SQLQueryService } from '@/services/sqlQueryService';

export function useSQLQueries() {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { plans } = usePlans();

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

  // Função para obter o plano atual da empresa
  const getCurrentPlan = () => {
    if (!currentCompany?.plan_id) return null;
    return plans.find(plan => plan.id === currentCompany.plan_id) || null;
  };

  const validatePlanLimits = (): boolean => {
    if (!currentCompany?.plan_id) {
      toast({
        title: "Erro",
        description: "A empresa deve ter um plano associado para criar consultas SQL",
        variant: "destructive"
      });
      return false;
    }

    const currentPlan = getCurrentPlan();
    if (!currentPlan) {
      toast({
        title: "Erro",
        description: "Plano da empresa não encontrado",
        variant: "destructive"
      });
      return false;
    }

    if (queries.length >= currentPlan.max_sql_queries) {
      toast({
        title: "Limite de consultas atingido",
        description: `O plano ${currentPlan.name} permite apenas ${currentPlan.max_sql_queries} consultas SQL. Faça upgrade do plano para criar mais consultas.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
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

      // Validar limites do plano antes de criar
      if (!validatePlanLimits()) {
        throw new Error('Plan limits exceeded');
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
      if (error instanceof Error && error.message !== 'Plan limits exceeded') {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao criar consulta SQL",
          variant: "destructive"
        });
      }
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

  // Recarregar dados quando a empresa ou planos mudarem
  useEffect(() => {
    if (plans.length > 0) {
      fetchQueries();
    }
  }, [currentCompany?.id, plans]);

  return {
    queries,
    loading,
    createQuery,
    updateQuery,
    deleteQuery,
    refetch: fetchQueries,
    validatePlanLimits,
    currentPlan: getCurrentPlan()
  };
}

export type { SQLQuery };


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_sql_connections: number;
  max_sql_queries: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching plans...');

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        throw error;
      }

      console.log('Plans fetched successfully:', data);
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating plan with data:', planData);

      // Validações básicas
      if (!planData.name?.trim()) {
        throw new Error('Nome do plano é obrigatório');
      }

      if (planData.price < 0) {
        throw new Error('Preço deve ser um valor positivo');
      }

      if (planData.max_sql_connections < 1) {
        throw new Error('Número de conexões SQL deve ser pelo menos 1');
      }

      if (planData.max_sql_queries < 1) {
        throw new Error('Número de consultas SQL deve ser pelo menos 1');
      }

      // Verificar se já existe um plano com o mesmo nome
      const { data: existingPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('name', planData.name.trim())
        .maybeSingle();

      if (existingPlan) {
        throw new Error('Já existe um plano com este nome');
      }

      const planToInsert = {
        name: planData.name.trim(),
        description: planData.description?.trim() || null,
        price: Number(planData.price),
        max_sql_connections: Number(planData.max_sql_connections),
        max_sql_queries: Number(planData.max_sql_queries),
        is_active: planData.is_active !== false // Default true
      };

      const { data, error } = await supabase
        .from('plans')
        .insert([planToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        if (error.code === '23505') {
          throw new Error('Nome do plano já está em uso');
        }
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      console.log('Plan created successfully:', data);

      setPlans(prev => [...prev, data].sort((a, b) => a.price - b.price));
      toast({
        title: "Sucesso",
        description: "Plano criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating plan:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar plano";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    try {
      console.log('Updating plan:', id, 'with data:', updates);

      // Validações para atualização
      if (updates.name && !updates.name.trim()) {
        throw new Error('Nome do plano é obrigatório');
      }

      if (updates.price !== undefined && updates.price < 0) {
        throw new Error('Preço deve ser um valor positivo');
      }

      if (updates.max_sql_connections !== undefined && updates.max_sql_connections < 1) {
        throw new Error('Número de conexões SQL deve ser pelo menos 1');
      }

      if (updates.max_sql_queries !== undefined && updates.max_sql_queries < 1) {
        throw new Error('Número de consultas SQL deve ser pelo menos 1');
      }

      // Verificar se nome já existe em outro plano
      if (updates.name) {
        const { data: existingPlan } = await supabase
          .from('plans')
          .select('id')
          .eq('name', updates.name.trim())
          .neq('id', id)
          .maybeSingle();

        if (existingPlan) {
          throw new Error('Já existe outro plano com este nome');
        }
      }

      const updateData: any = { ...updates };
      
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }
      
      if (updateData.description) {
        updateData.description = updateData.description.trim();
      }

      if (updateData.price !== undefined) {
        updateData.price = Number(updateData.price);
      }

      if (updateData.max_sql_connections !== undefined) {
        updateData.max_sql_connections = Number(updateData.max_sql_connections);
      }

      if (updateData.max_sql_queries !== undefined) {
        updateData.max_sql_queries = Number(updateData.max_sql_queries);
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        if (error.code === '23505') {
          throw new Error('Nome do plano já está em uso');
        }
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      console.log('Plan updated successfully:', data);

      setPlans(prev => prev.map(plan => 
        plan.id === id ? data : plan
      ).sort((a, b) => a.price - b.price));

      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error updating plan:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar plano";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      console.log('Deleting plan:', id);

      // Verificar se há empresas usando este plano
      const { data: companiesUsingPlan } = await supabase
        .from('companies')
        .select('id')
        .eq('plan_id', id)
        .limit(1);

      if (companiesUsingPlan && companiesUsingPlan.length > 0) {
        throw new Error('Não é possível excluir um plano que está sendo usado por empresas');
      }

      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      console.log('Plan deleted successfully:', id);

      setPlans(prev => prev.filter(plan => plan.id !== id));
      toast({
        title: "Sucesso",
        description: "Plano removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover plano";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans
  };
}

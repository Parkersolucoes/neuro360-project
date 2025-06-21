
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
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar planos",
          variant: "destructive"
        });
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert([planData])
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar plano",
          variant: "destructive"
        });
        throw error;
      }

      setPlans(prev => [...prev, data].sort((a, b) => a.price - b.price));
      toast({
        title: "Sucesso",
        description: "Plano criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar plano",
          variant: "destructive"
        });
        throw error;
      }

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
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover plano",
          variant: "destructive"
        });
        throw error;
      }

      setPlans(prev => prev.filter(plan => plan.id !== id));
      toast({
        title: "Sucesso",
        description: "Plano removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  auto_renew: boolean;
  created_at?: string;
  updated_at?: string;
  plans?: {
    name: string;
    price: number;
    max_sql_connections: number;
    max_sql_queries: number;
  };
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar assinaturas",
        variant: "destructive"
      });
    }
  };

  const createSubscription = async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Cancelar assinatura ativa existente
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: user.id,
          plan_id: planId,
          status: 'active'
        }])
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .single();

      if (error) throw error;
      
      setUserSubscription(data);
      toast({
        title: "Sucesso",
        description: "Assinatura criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar assinatura",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          plans(name, price, max_sql_connections, max_sql_queries)
        `)
        .single();

      if (error) throw error;
      
      setSubscriptions(prev => prev.map(sub => 
        sub.id === id ? data : sub
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  return {
    subscriptions,
    userSubscription,
    loading,
    createSubscription,
    updateSubscription,
    fetchAllSubscriptions,
    refetch: fetchUserSubscription
  };
}

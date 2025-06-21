
import { useState, useEffect } from 'react';
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
      // Since user_subscriptions table doesn't exist, return null
      setUserSubscription(null);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubscriptions = async () => {
    try {
      // Since user_subscriptions table doesn't exist, return empty array
      setSubscriptions([]);
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
      // Simulate creating a subscription since table doesn't exist
      const mockSubscription: Subscription = {
        id: `mock-subscription-${Date.now()}`,
        user_id: 'mock-user-id',
        plan_id: planId,
        status: 'active',
        started_at: new Date().toISOString(),
        auto_renew: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plans: {
          name: 'Mock Plan',
          price: 29.90,
          max_sql_connections: 1,
          max_sql_queries: 10
        }
      };
      
      setUserSubscription(mockSubscription);
      toast({
        title: "Informação",
        description: "Funcionalidade de assinaturas será implementada em uma próxima versão. Assinatura simulada criada."
      });
      
      return mockSubscription;
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
      // Simulate updating subscription
      if (!userSubscription || userSubscription.id !== id) {
        throw new Error('Subscription not found');
      }
      
      const updatedSubscription = { ...userSubscription, ...updates };
      setUserSubscription(updatedSubscription);
      
      setSubscriptions(prev => prev.map(sub => 
        sub.id === id ? updatedSubscription : sub
      ));
      
      return updatedSubscription;
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

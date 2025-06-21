
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  user_subscriptions?: {
    plans?: {
      name: string;
    };
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user_subscriptions(
            plans(name)
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []).map(transaction => ({
        ...transaction,
        status: transaction.status as 'pending' | 'completed' | 'failed' | 'refunded'
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_subscriptions'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select(`
          *,
          user_subscriptions(
            plans(name)
          )
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        status: data.status as 'pending' | 'completed' | 'failed' | 'refunded'
      };
      
      setTransactions(prev => [typedData, ...prev]);
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!"
      });
      
      return typedData;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar transação",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user_subscriptions(
            plans(name)
          )
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        status: data.status as 'pending' | 'completed' | 'failed' | 'refunded'
      };
      
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? typedData : transaction
      ));
      
      return typedData;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    refetch: fetchTransactions
  };
}

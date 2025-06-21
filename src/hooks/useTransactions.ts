
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  company_id: string;
  user_id: string;
  plan_id: string | null;
  amount: number;
  type: 'payment' | 'refund' | 'subscription';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string | null;
  external_id: string | null;
  description: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { userLogin } = useAuth();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany) {
        setTransactions([]);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          plans(name, price)
        `)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
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

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'user_id'>) => {
    try {
      if (!currentCompany || !userLogin) throw new Error('Dados necessários não encontrados');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          company_id: currentCompany.id,
          user_id: userLogin.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso"
      });

      await fetchTransactions();
      return data;
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
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso"
      });

      await fetchTransactions();
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentCompany]);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    refetch: fetchTransactions
  };
}

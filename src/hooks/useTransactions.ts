
import { useState, useEffect } from 'react';
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
      // Since transactions table doesn't exist, return empty array
      setTransactions([]);
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
      // Simulate creating a transaction since table doesn't exist
      const mockTransaction: Transaction = {
        id: `mock-transaction-${Date.now()}`,
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_subscriptions: {
          plans: {
            name: 'Mock Plan'
          }
        }
      };
      
      setTransactions(prev => [mockTransaction, ...prev]);
      toast({
        title: "Informação",
        description: "Funcionalidade Transações será implementada em uma próxima versão. Transação simulada criada."
      });
      
      return mockTransaction;
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
      // Simulate updating transaction
      const updatedTransaction = transactions.find(transaction => transaction.id === id);
      if (!updatedTransaction) throw new Error('Transaction not found');
      
      const newTransaction = { ...updatedTransaction, ...updates };
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? newTransaction : transaction
      ));
      
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!"
      });
      
      return newTransaction;
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
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    refetch: fetchTransactions
  };
}


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Scheduling {
  id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  scheduled_time: string;
  recipient_phone: string;
  message_content: string;
  template_id?: string;
  company_id?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}

export function useScheduling() {
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedulings = async () => {
    try {
      // Simular dados enquanto a tabela não existe no banco
      setSchedulings([]);
    } catch (error) {
      console.error('Error fetching schedulings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createScheduling = async (schedulingData: Omit<Scheduling, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simular criação de agendamento
      const newScheduling: Scheduling = {
        id: Math.random().toString(36).substr(2, 9),
        ...schedulingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSchedulings(prev => [newScheduling, ...prev]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!"
      });

      return newScheduling;
    } catch (error) {
      console.error('Error creating scheduling:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateScheduling = async (id: string, updates: Partial<Scheduling>) => {
    try {
      const updatedScheduling = {
        ...schedulings.find(s => s.id === id),
        ...updates,
        updated_at: new Date().toISOString()
      } as Scheduling;

      setSchedulings(prev => prev.map(scheduling => 
        scheduling.id === id ? updatedScheduling : scheduling
      ));

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!"
      });

      return updatedScheduling;
    } catch (error) {
      console.error('Error updating scheduling:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteScheduling = async (id: string) => {
    try {
      setSchedulings(prev => prev.filter(scheduling => scheduling.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting scheduling:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSchedulings();
  }, []);

  return {
    schedulings,
    loading,
    createScheduling,
    updateScheduling,
    deleteScheduling,
    refetch: fetchSchedulings
  };
}

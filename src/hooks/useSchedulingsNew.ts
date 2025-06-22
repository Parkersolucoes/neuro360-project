
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

export function useSchedulingsNew() {
  const [schedulings, setSchedulings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchSchedulings = async () => {
    if (!currentCompany?.id) {
      setSchedulings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedulings')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedulings(data || []);
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

  const createScheduling = async (schedulingData: any) => {
    try {
      const { data, error } = await supabase
        .from('schedulings')
        .insert({
          ...schedulingData,
          company_id: currentCompany?.id
        })
        .select()
        .single();

      if (error) throw error;

      setSchedulings(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });
      
      return data;
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

  const updateScheduling = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('schedulings')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      setSchedulings(prev => prev.map(scheduling => 
        scheduling.id === id ? data : scheduling
      ));

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso"
      });

      return data;
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
      const { error } = await supabase
        .from('schedulings')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      setSchedulings(prev => prev.filter(scheduling => scheduling.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso"
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
  }, [currentCompany?.id]);

  return {
    schedulings,
    loading,
    createScheduling,
    updateScheduling,
    deleteScheduling,
    refetch: fetchSchedulings
  };
}


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';

export interface Scheduling {
  id: string;
  company_id: string;
  user_id: string | null;
  name: string;
  message_content: string;
  recipients: any[];
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  template_id: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSchedulingsNew() {
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
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

  const createScheduling = async (schedulingData: Omit<Scheduling, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Validar dados obrigatórios
      if (!schedulingData.name?.trim()) {
        throw new Error('Nome do agendamento é obrigatório');
      }
      if (!schedulingData.message_content?.trim()) {
        throw new Error('Conteúdo da mensagem é obrigatório');
      }
      if (!schedulingData.scheduled_for) {
        throw new Error('Data de agendamento é obrigatória');
      }
      if (!schedulingData.recipients || schedulingData.recipients.length === 0) {
        throw new Error('Pelo menos um destinatário é obrigatório');
      }

      // Validar data de agendamento
      const scheduledDate = new Date(schedulingData.scheduled_for);
      if (scheduledDate <= new Date()) {
        throw new Error('Data de agendamento deve ser no futuro');
      }

      const { data, error } = await supabase
        .from('schedulings')
        .insert({
          company_id: currentCompany.id,
          name: schedulingData.name.trim(),
          message_content: schedulingData.message_content.trim(),
          recipients: schedulingData.recipients,
          scheduled_for: schedulingData.scheduled_for,
          status: schedulingData.status || 'pending',
          template_id: schedulingData.template_id || null,
          user_id: schedulingData.user_id || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });

      await fetchSchedulings();
      return data;
    } catch (error: any) {
      console.error('Error creating scheduling:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateScheduling = async (id: string, updates: Partial<Scheduling>) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Validar dados obrigatórios se foram fornecidos
      if (updates.name !== undefined && !updates.name?.trim()) {
        throw new Error('Nome do agendamento é obrigatório');
      }
      if (updates.message_content !== undefined && !updates.message_content?.trim()) {
        throw new Error('Conteúdo da mensagem é obrigatório');
      }
      if (updates.scheduled_for !== undefined && new Date(updates.scheduled_for) <= new Date()) {
        throw new Error('Data de agendamento deve ser no futuro');
      }
      if (updates.recipients !== undefined && (!updates.recipients || updates.recipients.length === 0)) {
        throw new Error('Pelo menos um destinatário é obrigatório');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.message_content !== undefined) updateData.message_content = updates.message_content.trim();
      if (updates.recipients !== undefined) updateData.recipients = updates.recipients;
      if (updates.scheduled_for !== undefined) updateData.scheduled_for = updates.scheduled_for;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.template_id !== undefined) updateData.template_id = updates.template_id;

      const { data, error } = await supabase
        .from('schedulings')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', currentCompany.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso"
      });

      await fetchSchedulings();
      return data;
    } catch (error: any) {
      console.error('Error updating scheduling:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteScheduling = async (id: string) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      const { error } = await supabase
        .from('schedulings')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso"
      });

      await fetchSchedulings();
    } catch (error: any) {
      console.error('Error deleting scheduling:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover agendamento",
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

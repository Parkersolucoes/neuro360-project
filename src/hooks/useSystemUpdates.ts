
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  version: string | null;
  update_date: string;
  is_active: boolean;
  created_at: string;
}

export function useSystemUpdates() {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('system_updates')
        .select('*')
        .eq('is_active', true)
        .order('update_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (updateData: Omit<SystemUpdate, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('system_updates')
        .insert([updateData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atualização criada com sucesso!"
      });

      await fetchUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar atualização",
        variant: "destructive"
      });
    }
  };

  const updateUpdate = async (id: string, updateData: Partial<SystemUpdate>) => {
    try {
      const { error } = await supabase
        .from('system_updates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atualização editada com sucesso!"
      });

      await fetchUpdates();
    } catch (error) {
      console.error('Error updating update:', error);
      toast({
        title: "Erro",
        description: "Erro ao editar atualização",
        variant: "destructive"
      });
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_updates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atualização removida com sucesso!"
      });

      await fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover atualização",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return {
    updates,
    loading,
    createUpdate,
    updateUpdate,
    deleteUpdate,
    refetch: fetchUpdates
  };
}

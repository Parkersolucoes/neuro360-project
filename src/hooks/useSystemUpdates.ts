
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

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
  const { currentCompany } = useCompanies();

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany?.id) {
        setUpdates([]);
        return;
      }

      const { data, error } = await supabase
        .from('system_updates')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('update_date', { ascending: false });

      if (error) {
        console.error('Error fetching system updates:', error);
        throw error;
      }

      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar atualizações do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (updateData: Omit<SystemUpdate, 'id' | 'created_at'>) => {
    try {
      if (!currentCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('system_updates')
        .insert({
          ...updateData,
          company_id: currentCompany.id
        });

      if (error) {
        console.error('Error creating update:', error);
        throw error;
      }

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
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating update:', error);
        throw error;
      }

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
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting update:', error);
        throw error;
      }

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
  }, [currentCompany?.id]);

  return {
    updates,
    loading,
    createUpdate,
    updateUpdate,
    deleteUpdate,
    refetch: fetchUpdates
  };
}

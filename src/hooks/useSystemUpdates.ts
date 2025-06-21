
import { useState, useEffect } from 'react';
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
      console.log('SystemUpdates: Table system_updates does not exist in current database schema');
      
      // Como a tabela system_updates não existe, retornar array vazio
      setUpdates([]);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (updateData: Omit<SystemUpdate, 'id' | 'created_at'>) => {
    try {
      console.log('SystemUpdates: Cannot create update - table system_updates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de atualizações do sistema está temporariamente indisponível",
        variant: "destructive"
      });
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
      console.log('SystemUpdates: Cannot update update - table system_updates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de atualizações do sistema está temporariamente indisponível",
        variant: "destructive"
      });
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
      console.log('SystemUpdates: Cannot delete update - table system_updates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de atualizações do sistema está temporariamente indisponível",
        variant: "destructive"
      });
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

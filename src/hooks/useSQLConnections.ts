
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { SQLConnection } from '@/types/sqlConnection';
import { sqlConnectionService } from '@/services/sqlConnectionService';
import { connectionTestService } from '@/services/connectionTestService';

export function useSQLConnections() {
  const [connections, setConnections] = useState<SQLConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      console.log('useSQLConnections: Fetching SQL connections...');
      
      let data: SQLConnection[] = [];
      
      // Só buscar conexões se o usuário estiver logado
      if (!userLogin?.id) {
        console.log('useSQLConnections: No user logged in, skipping fetch');
        setConnections([]);
        return;
      }
      
      if (currentCompany?.id) {
        // Se há uma empresa selecionada, buscar apenas suas conexões
        console.log('useSQLConnections: Fetching connections for company:', currentCompany.id);
        data = await sqlConnectionService.fetchConnectionsByCompany(currentCompany.id);
      } else if (userLogin?.is_master) {
        // Se é usuário master sem empresa específica, buscar todas
        console.log('useSQLConnections: Fetching all connections for master user');
        data = await sqlConnectionService.fetchConnections();
      } else {
        // Usuário comum sem empresa selecionada
        console.log('useSQLConnections: No company selected for regular user');
        data = [];
      }
      
      console.log('useSQLConnections: Connections loaded:', data);
      setConnections(data);
    } catch (error) {
      console.error('useSQLConnections: Error fetching connections:', error);
      
      // Não mostrar toast de erro se for apenas falta de empresa selecionada
      if (!currentCompany && !userLogin?.is_master) {
        console.log('useSQLConnections: No company selected, this is expected');
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar conexões SQL",
          variant: "destructive"
        });
      }
      
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [toast, userLogin, currentCompany]);

  const createConnection = async (connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useSQLConnections: Creating connection:', connectionData);
      
      const data = await sqlConnectionService.createConnection(connectionData);
      console.log('useSQLConnections: Connection created successfully:', data);
      await fetchConnections();
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL criada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('useSQLConnections: Error in createConnection:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conexão SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createDemoConnection = async (companyId: string, companyName: string) => {
    try {
      console.log('useSQLConnections: Creating demo connection for:', companyName);
      
      const data = await sqlConnectionService.createDemoConnection(companyId, companyName);
      console.log('useSQLConnections: Demo connection created successfully:', data);
      await fetchConnections();
      return data;
    } catch (error) {
      console.error('useSQLConnections: Error creating demo connection:', error);
      throw error;
    }
  };

  const updateConnection = async (id: string, updates: Partial<SQLConnection>) => {
    try {
      console.log('useSQLConnections: Updating connection:', id, updates);
      
      const data = await sqlConnectionService.updateConnection(id, updates);
      console.log('useSQLConnections: Connection updated successfully:', data);
      await fetchConnections();
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL atualizada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('useSQLConnections: Error in updateConnection:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conexão SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      console.log('useSQLConnections: Deleting connection:', id);
      
      await sqlConnectionService.deleteConnection(id);
      console.log('useSQLConnections: Connection deleted successfully');
      await fetchConnections();
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL excluída com sucesso!"
      });
    } catch (error) {
      console.error('useSQLConnections: Error in deleteConnection:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conexão SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const testConnection = async (connection: SQLConnection) => {
    try {
      setTesting(true);
      console.log('useSQLConnections: Testing connection...');
      
      const result = await connectionTestService.testConnection(connection);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('useSQLConnections: Connection test failed:', error);
      toast({
        title: "Erro",
        description: "Falha no teste de conexão",
        variant: "destructive"
      });
      
      return { success: false, message: "Falha na conexão" };
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Só buscar conexões se houver usuário logado
    if (userLogin?.id) {
      fetchConnections();
    } else {
      setConnections([]);
      setLoading(false);
    }
  }, [userLogin?.id, currentCompany?.id, fetchConnections]);

  return {
    connections,
    loading,
    testing,
    createConnection,
    createDemoConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    refetch: fetchConnections
  };
}

// Re-export the interface for backward compatibility
export type { SQLConnection } from '@/types/sqlConnection';

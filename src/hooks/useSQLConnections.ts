
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SQLConnection } from '@/types/sqlConnection';
import { sqlConnectionService } from '@/services/sqlConnectionService';
import { connectionTestService } from '@/services/connectionTestService';

export function useSQLConnections() {
  const [connections, setConnections] = useState<SQLConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { userLogin } = useAuth();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      console.log('useSQLConnections: Fetching SQL connections...');
      
      const data = await sqlConnectionService.fetchConnections();
      console.log('useSQLConnections: Connections loaded:', data);
      setConnections(data);
    } catch (error) {
      console.error('useSQLConnections: Error fetching connections:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conexões SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    if (userLogin?.id) {
      fetchConnections();
    }
  }, [userLogin?.id, fetchConnections]);

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

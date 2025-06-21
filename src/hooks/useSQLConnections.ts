
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCompanies } from '@/hooks/useCompanies';

export interface SQLConnection {
  id: string;
  company_id: string;
  name: string;
  host: string;
  database_name: string;
  username: string;
  password: string;
  port: number;
  connection_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSQLConnections() {
  const [connections, setConnections] = useState<SQLConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const { currentCompany } = useCompanies();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      console.log('SQLConnections: Table sql_connections does not exist in current database schema');
      
      // Como a tabela sql_connections não existe mais, retornar array vazio
      setConnections([]);
    } catch (error) {
      console.error('Error fetching SQL connections:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conexões SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('SQLConnections: Cannot create connection - table sql_connections does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de conexões SQL está temporariamente indisponível",
        variant: "destructive"
      });
      
      throw new Error('sql_connections table does not exist');
    } catch (error) {
      console.error('Error creating SQL connection:', error);
      throw error;
    }
  };

  const updateConnection = async (id: string, updates: Partial<SQLConnection>) => {
    try {
      console.log('SQLConnections: Cannot update connection - table sql_connections does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de conexões SQL está temporariamente indisponível",
        variant: "destructive"
      });
      
      throw new Error('sql_connections table does not exist');
    } catch (error) {
      console.error('Error updating SQL connection:', error);
      throw error;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      console.log('SQLConnections: Cannot delete connection - table sql_connections does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de conexões SQL está temporariamente indisponível",
        variant: "destructive"
      });
      
      throw new Error('sql_connections table does not exist');
    } catch (error) {
      console.error('Error deleting SQL connection:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [isAdmin, currentCompany]);

  return {
    connections,
    loading,
    testing,
    createConnection,
    updateConnection,
    deleteConnection,
    refetch: fetchConnections
  };
}

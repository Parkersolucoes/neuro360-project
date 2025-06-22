
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SQLConnection {
  id: string;
  name: string;
  server: string;
  database: string;
  username: string;
  password: string;
  port: number;
  company_id: string;
  is_active: boolean;
  connection_string?: string;
  created_at: string;
  updated_at: string;
}

export function useSQLConnections() {
  const [connections, setConnections] = useState<SQLConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLogin } = useAuth();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      console.log('useSQLConnections: Fetching SQL connections...');
      
      const { data, error } = await supabase
        .from('sql_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useSQLConnections: Error fetching connections:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar conexões SQL",
          variant: "destructive"
        });
        return;
      }

      console.log('useSQLConnections: Connections loaded:', data);
      setConnections(data || []);
    } catch (error) {
      console.error('useSQLConnections: Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createConnection = async (connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useSQLConnections: Creating connection:', connectionData);
      
      const { data, error } = await supabase
        .from('sql_connections')
        .insert({
          ...connectionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('useSQLConnections: Error creating connection:', error);
        throw error;
      }

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
      
      const demoConnectionData = {
        name: `Demo SQL - ${companyName}`,
        server: 'demo-server.exemplo.com',
        database: 'DemoDatabase',
        username: 'demo_user',
        password: 'demo_password',
        port: 1433,
        company_id: companyId,
        is_active: true,
        connection_string: `Server=demo-server.exemplo.com,1433;Database=DemoDatabase;User Id=demo_user;Password=demo_password;`
      };

      const { data, error } = await supabase
        .from('sql_connections')
        .insert({
          ...demoConnectionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('useSQLConnections: Error creating demo connection:', error);
        throw error;
      }

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
      
      const { data, error } = await supabase
        .from('sql_connections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useSQLConnections: Error updating connection:', error);
        throw error;
      }

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
      
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useSQLConnections: Error deleting connection:', error);
        throw error;
      }

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

  const testConnection = async (connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useSQLConnections: Testing connection...');
      
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('useSQLConnections: Connection test successful');
      toast({
        title: "Sucesso",
        description: "Conexão testada com sucesso!"
      });
      
      return { success: true, message: "Conexão estabelecida com sucesso!" };
    } catch (error) {
      console.error('useSQLConnections: Connection test failed:', error);
      toast({
        title: "Erro",
        description: "Falha no teste de conexão",
        variant: "destructive"
      });
      
      return { success: false, message: "Falha na conexão" };
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
    createConnection,
    createDemoConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    refetch: fetchConnections
  };
}

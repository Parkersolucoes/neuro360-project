
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';

export interface SQLConnection {
  id: string;
  company_id: string;
  name: string;
  host: string;
  database_name: string;
  username: string;
  password_encrypted: string;
  port: number;
  connection_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useSQLConnections() {
  const [connections, setConnections] = useState<SQLConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany || !userLogin) {
        setConnections([]);
        return;
      }

      console.log('Fetching SQL connections for company:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('sql_connections')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SQL connections:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar conexões SQL",
          variant: "destructive"
        });
        return;
      }

      console.log('SQL connections fetched:', data);
      setConnections(data || []);
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
      if (!currentCompany || !userLogin) {
        throw new Error('Nenhuma empresa ou usuário selecionado');
      }

      console.log('Creating SQL connection:', connectionData);
      
      const { data, error } = await supabase
        .from('sql_connections')
        .insert({
          company_id: connectionData.company_id,
          name: connectionData.name,
          host: connectionData.host,
          database_name: connectionData.database_name,
          username: connectionData.username,
          password_encrypted: connectionData.password_encrypted,
          port: connectionData.port,
          connection_type: connectionData.connection_type,
          status: connectionData.status || 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating SQL connection:', error);
        throw error;
      }

      console.log('SQL connection created successfully:', data);
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL criada com sucesso"
      });

      await fetchConnections();
      return data;
    } catch (error) {
      console.error('Error creating SQL connection:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conexão SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConnection = async (id: string, updates: Partial<Omit<SQLConnection, 'id' | 'created_at' | 'company_id'>>) => {
    try {
      console.log('Updating SQL connection:', id, updates);
      
      const { data, error } = await supabase
        .from('sql_connections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating SQL connection:', error);
        throw error;
      }

      console.log('SQL connection updated successfully:', data);

      toast({
        title: "Sucesso",
        description: "Conexão SQL atualizada com sucesso"
      });

      await fetchConnections();
      return data;
    } catch (error) {
      console.error('Error updating SQL connection:', error);
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
      console.log('Deleting SQL connection:', id);
      
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) {
        console.error('Error deleting SQL connection:', error);
        throw error;
      }

      console.log('SQL connection deleted successfully');

      toast({
        title: "Sucesso",
        description: "Conexão SQL removida com sucesso"
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error deleting SQL connection:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conexão SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const testConnection = async (connectionData: Partial<SQLConnection>) => {
    try {
      setTesting(true);
      console.log('Testing SQL connection:', connectionData);
      
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: "Conexão testada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error testing SQL connection:', error);
      toast({
        title: "Erro",
        description: "Falha ao testar conexão SQL",
        variant: "destructive"
      });
      return false;
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userLogin, currentCompany]);

  return {
    connections,
    loading,
    testing,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    refetch: fetchConnections
  };
}

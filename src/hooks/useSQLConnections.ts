
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SQLConnection {
  id: string;
  company_id: string | null;
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
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('sql_connections')
        .select('*')
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

      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching SQL connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sql_connections')
        .insert([connectionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating SQL connection:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar conexão SQL",
          variant: "destructive"
        });
        throw error;
      }
      
      setConnections(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Conexão SQL criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating SQL connection:', error);
      throw error;
    }
  };

  const updateConnection = async (id: string, updates: Partial<SQLConnection>) => {
    try {
      const { data, error } = await supabase
        .from('sql_connections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating SQL connection:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar conexão SQL",
          variant: "destructive"
        });
        throw error;
      }
      
      setConnections(prev => prev.map(conn => 
        conn.id === id ? data : conn
      ));
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating SQL connection:', error);
      throw error;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting SQL connection:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover conexão SQL",
          variant: "destructive"
        });
        throw error;
      }

      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast({
        title: "Sucesso",
        description: "Conexão SQL removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting SQL connection:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    loading,
    createConnection,
    updateConnection,
    deleteConnection,
    refetch: fetchConnections
  };
}

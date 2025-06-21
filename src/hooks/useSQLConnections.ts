
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SQLConnection {
  id: string;
  name: string;
  server: string;
  database_name: string;
  username: string;
  password: string;
  port: string;
  status: 'connected' | 'disconnected' | 'testing';
  created_at?: string;
  updated_at?: string;
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

      if (error) throw error;
      setConnections(data ? data.map(conn => ({ ...conn, status: conn.status as 'connected' | 'disconnected' | 'testing' })) : []);
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

  const createConnection = async (connection: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sql_connections')
        .insert([{ ...connection, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const newConnection = { ...data, status: data.status as 'connected' | 'disconnected' | 'testing' };
      setConnections(prev => [newConnection, ...prev]);
      toast({
        title: "Sucesso",
        description: "Conexão SQL criada com sucesso!"
      });
      
      return newConnection;
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

  const updateConnection = async (id: string, updates: Partial<SQLConnection>) => {
    try {
      const { data, error } = await supabase
        .from('sql_connections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedConnection = { ...data, status: data.status as 'connected' | 'disconnected' | 'testing' };
      setConnections(prev => prev.map(conn => 
        conn.id === id ? updatedConnection : conn
      ));
      
      toast({
        title: "Sucesso",
        description: "Conexão SQL atualizada com sucesso!"
      });
      
      return updatedConnection;
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
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast({
        title: "Sucesso",
        description: "Conexão SQL removida com sucesso!"
      });
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

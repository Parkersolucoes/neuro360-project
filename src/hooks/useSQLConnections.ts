
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      let query = supabase
        .from('sql_connections')
        .select('*');

      // Se não for admin, filtrar apenas conexões das empresas do usuário
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userCompanies } = await supabase
            .from('user_companies')
            .select('company_id')
            .eq('user_id', user.id);
          
          if (userCompanies && userCompanies.length > 0) {
            const companyIds = userCompanies.map(uc => uc.company_id);
            query = query.in('company_id', companyIds);
          } else {
            setConnections([]);
            return;
          }
        }
      }

      // Se há uma empresa selecionada, filtrar por ela
      if (currentCompany) {
        query = query.eq('company_id', currentCompany.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        throw error;
      }
      
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
      setTesting(true);
      
      // Testar conexão primeiro (simulado)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data, error } = await supabase
        .from('sql_connections')
        .insert([connectionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating connection:', error);
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
      toast({
        title: "Erro",
        description: "Erro ao criar conexão SQL",
        variant: "destructive"
      });
      throw error;
    } finally {
      setTesting(false);
    }
  };

  const updateConnection = async (id: string, updates: Partial<SQLConnection>) => {
    try {
      setTesting(true);
      
      // Testar conexão primeiro (simulado)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data, error } = await supabase
        .from('sql_connections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating connection:', error);
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
      toast({
        title: "Erro",
        description: "Erro ao atualizar conexão SQL",
        variant: "destructive"
      });
      throw error;
    } finally {
      setTesting(false);
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting connection:', error);
        throw error;
      }
      
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

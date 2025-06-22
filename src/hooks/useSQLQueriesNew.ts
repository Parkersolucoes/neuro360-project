
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';

export interface SQLQueryNew {
  id: string;
  company_id: string;
  connection_id: string;
  name: string;
  description?: string;
  query_text: string;
  created_by?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  sql_connections?: {
    name: string;
    host: string;
    port: number;
    database_name: string;
  } | null;
}

export function useSQLQueriesNew() {
  const [queries, setQueries] = useState<SQLQueryNew[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { logError, logInfo } = useSystemLogsDB();

  const fetchQueries = async () => {
    if (!currentCompany?.id) {
      setQueries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Primeira consulta para buscar as queries
      const { data: queriesData, error: queriesError } = await supabase
        .from('sql_queries')
        .select(`
          id,
          company_id,
          connection_id,
          name,
          description,
          query_text,
          created_by,
          status,
          created_at,
          updated_at
        `)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (queriesError) throw queriesError;

      // Se não há queries, retorna array vazio
      if (!queriesData || queriesData.length === 0) {
        setQueries([]);
        return;
      }

      // Buscar informações das conexões separadamente
      const connectionIds = queriesData
        .map(q => q.connection_id)
        .filter(id => id !== null);

      let connectionsData: any[] = [];
      if (connectionIds.length > 0) {
        const { data: connections, error: connectionsError } = await supabase
          .from('sql_connections')
          .select('id, name, host, port, database_name')
          .in('id', connectionIds);

        if (connectionsError) {
          console.warn('Erro ao buscar conexões:', connectionsError);
        } else {
          connectionsData = connections || [];
        }
      }

      // Mapear queries com informações das conexões
      const typedData: SQLQueryNew[] = queriesData.map(item => {
        const connection = connectionsData.find(conn => conn.id === item.connection_id);
        
        return {
          id: item.id,
          company_id: item.company_id,
          connection_id: item.connection_id || '',
          name: item.name,
          description: item.description,
          query_text: item.query_text,
          created_by: item.created_by,
          status: item.status as 'active' | 'inactive',
          created_at: item.created_at,
          updated_at: item.updated_at,
          sql_connections: connection || null
        };
      });
      
      setQueries(typedData);
      logInfo('Consultas SQL carregadas com sucesso', 'useSQLQueriesNew');
    } catch (error) {
      console.error('Error fetching SQL queries:', error);
      logError('Erro ao carregar consultas SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar consultas SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuery = async (queryData: Omit<SQLQueryNew, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) => {
    try {
      console.log('Criando consulta SQL:', queryData);
      
      const { data, error } = await supabase
        .from('sql_queries')
        .insert({
          company_id: queryData.company_id,
          connection_id: queryData.connection_id,
          name: queryData.name,
          description: queryData.description,
          query_text: queryData.query_text,
          created_by: queryData.created_by,
          status: queryData.status
        })
        .select('id, company_id, connection_id, name, description, query_text, created_by, status, created_at, updated_at')
        .single();

      if (error) throw error;

      // Buscar informações da conexão se existe
      let connectionInfo = null;
      if (data.connection_id) {
        const { data: connection } = await supabase
          .from('sql_connections')
          .select('name, host, port, database_name')
          .eq('id', data.connection_id)
          .single();
        
        connectionInfo = connection;
      }

      const typedData: SQLQueryNew = {
        id: data.id,
        company_id: data.company_id,
        connection_id: data.connection_id || '',
        name: data.name,
        description: data.description,
        query_text: data.query_text,
        created_by: data.created_by,
        status: data.status as 'active' | 'inactive',
        created_at: data.created_at,
        updated_at: data.updated_at,
        sql_connections: connectionInfo
      };

      setQueries(prev => [typedData, ...prev]);
      logInfo('Consulta SQL criada com sucesso', 'useSQLQueriesNew', { queryId: data.id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso"
      });
      
      return typedData;
    } catch (error) {
      console.error('Error creating SQL query:', error);
      logError('Erro ao criar consulta SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao criar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQueryNew>) => {
    try {
      console.log('Atualizando consulta SQL:', id, updates);
      
      const { data, error } = await supabase
        .from('sql_queries')
        .update({
          connection_id: updates.connection_id,
          name: updates.name,
          description: updates.description,
          query_text: updates.query_text,
          status: updates.status
        })
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select('id, company_id, connection_id, name, description, query_text, created_by, status, created_at, updated_at')
        .single();

      if (error) throw error;

      // Buscar informações da conexão se existe
      let connectionInfo = null;
      if (data.connection_id) {
        const { data: connection } = await supabase
          .from('sql_connections')
          .select('name, host, port, database_name')
          .eq('id', data.connection_id)
          .single();
        
        connectionInfo = connection;
      }

      const typedData: SQLQueryNew = {
        id: data.id,
        company_id: data.company_id,
        connection_id: data.connection_id || '',
        name: data.name,
        description: data.description,
        query_text: data.query_text,
        created_by: data.created_by,
        status: data.status as 'active' | 'inactive',
        created_at: data.created_at,
        updated_at: data.updated_at,
        sql_connections: connectionInfo
      };

      setQueries(prev => prev.map(query => 
        query.id === id ? typedData : query
      ));

      logInfo('Consulta SQL atualizada com sucesso', 'useSQLQueriesNew', { queryId: id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso"
      });

      return typedData;
    } catch (error) {
      console.error('Error updating SQL query:', error);
      logError('Erro ao atualizar consulta SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sql_queries')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      setQueries(prev => prev.filter(query => query.id !== id));
      logInfo('Consulta SQL removida com sucesso', 'useSQLQueriesNew', { queryId: id });
      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting SQL query:', error);
      logError('Erro ao remover consulta SQL', 'useSQLQueriesNew', error);
      toast({
        title: "Erro",
        description: "Erro ao remover consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createTestRecord = async () => {
    try {
      if (!currentCompany?.id) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive"
        });
        return;
      }

      const { data: connections, error: connectionsError } = await supabase
        .from('sql_connections')
        .select('id')
        .eq('company_id', currentCompany.id)
        .limit(1);

      if (connectionsError) throw connectionsError;

      if (!connections || connections.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma conexão SQL encontrada. Crie uma conexão primeiro.",
          variant: "destructive"
        });
        return;
      }

      const testQuery = {
        company_id: currentCompany.id,
        connection_id: connections[0].id,
        name: "Consulta de Teste",
        description: "Esta é uma consulta de teste criada automaticamente",
        query_text: "SELECT 'Hello World' as mensagem",
        status: 'active' as const,
        created_by: null
      };

      await createQuery(testQuery);
      
      toast({
        title: "Sucesso",
        description: "Registro de teste criado com sucesso"
      });
    } catch (error) {
      console.error('Error creating test record:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar registro de teste",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [currentCompany?.id]);

  return {
    queries,
    loading,
    createQuery,
    updateQuery,
    deleteQuery,
    createTestRecord,
    refetch: fetchQueries
  };
}

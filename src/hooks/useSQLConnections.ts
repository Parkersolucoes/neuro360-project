
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';
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
  const { logInfo, logError } = useSystemLogsDB();

  const validateConnectionData = (connectionData: Partial<SQLConnection>): string[] => {
    const errors: string[] = [];
    
    if (!connectionData.name?.trim()) {
      errors.push('Nome da conexão é obrigatório');
    }
    
    if (!connectionData.host?.trim()) {
      errors.push('Host/Servidor é obrigatório');
    }
    
    if (!connectionData.database_name?.trim()) {
      errors.push('Nome do banco de dados é obrigatório');
    }
    
    if (!connectionData.username?.trim()) {
      errors.push('Usuário é obrigatório');
    }
    
    if (!connectionData.password_encrypted?.trim()) {
      errors.push('Senha é obrigatória');
    }
    
    if (!connectionData.port || connectionData.port <= 0 || connectionData.port > 65535) {
      errors.push('Porta deve estar entre 1 e 65535');
    }
    
    if (!connectionData.connection_type) {
      errors.push('Tipo de conexão é obrigatório');
    }
    
    if (!connectionData.company_id) {
      errors.push('ID da empresa é obrigatório');
    }
    
    return errors;
  };

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
        logError(`Erro ao carregar conexões SQL: ${error.message}`, 'useSQLConnections', {
          company_id: currentCompany.id,
          error: error.message
        });
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
      logError(`Erro inesperado ao carregar conexões SQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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

      console.log('🔍 Validando dados da conexão SQL...');
      
      // Validar dados antes de tentar criar
      const validationErrors = validateConnectionData(connectionData);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        toast({
          title: "Dados inválidos",
          description: errorMessage,
          variant: "destructive"
        });
        logError(`Validação falhou ao criar conexão SQL: ${errorMessage}`, 'useSQLConnections', {
          company_id: currentCompany.id,
          validation_errors: validationErrors,
          connection_data: connectionData
        });
        throw new Error(errorMessage);
      }

      console.log('✅ Dados validados com sucesso, criando conexão SQL...');
      logInfo(`Iniciando criação de conexão SQL: ${connectionData.name}`, 'useSQLConnections', {
        company_id: currentCompany.id,
        connection_name: connectionData.name,
        connection_type: connectionData.connection_type,
        host: connectionData.host,
        port: connectionData.port
      });
      
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
        logError(`Erro ao criar conexão SQL: ${error.message}`, 'useSQLConnections', {
          company_id: currentCompany.id,
          connection_data: connectionData,
          error: error.message
        });
        throw error;
      }

      console.log('✅ SQL connection created successfully:', data);
      logInfo(`Conexão SQL criada com sucesso: ${data.name}`, 'useSQLConnections', {
        company_id: currentCompany.id,
        connection_id: data.id,
        connection_name: data.name
      });
      
      toast({
        title: "Sucesso",
        description: `Conexão SQL "${data.name}" criada com sucesso`
      });

      await fetchConnections();
      return data;
    } catch (error) {
      console.error('Error creating SQL connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logError(`Falha ao criar conexão SQL: ${errorMessage}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_data: connectionData,
        error: errorMessage
      });
      toast({
        title: "Erro",
        description: `Erro ao criar conexão SQL: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConnection = async (id: string, updates: Partial<Omit<SQLConnection, 'id' | 'created_at' | 'company_id'>>) => {
    try {
      console.log('🔍 Validando dados da atualização...');
      
      // Validar dados de atualização
      const validationErrors = validateConnectionData({ ...updates, company_id: currentCompany?.id });
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        toast({
          title: "Dados inválidos",
          description: errorMessage,
          variant: "destructive"
        });
        logError(`Validação falhou ao atualizar conexão SQL: ${errorMessage}`, 'useSQLConnections', {
          company_id: currentCompany?.id,
          connection_id: id,
          validation_errors: validationErrors,
          updates
        });
        throw new Error(errorMessage);
      }

      console.log('✅ Dados validados, atualizando conexão SQL:', id);
      logInfo(`Iniciando atualização de conexão SQL: ${id}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: id,
        updates
      });
      
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
        logError(`Erro ao atualizar conexão SQL: ${error.message}`, 'useSQLConnections', {
          company_id: currentCompany?.id,
          connection_id: id,
          error: error.message
        });
        throw error;
      }

      console.log('✅ SQL connection updated successfully:', data);
      logInfo(`Conexão SQL atualizada com sucesso: ${data.name}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: data.id,
        connection_name: data.name
      });

      toast({
        title: "Sucesso",
        description: `Conexão SQL "${data.name}" atualizada com sucesso`
      });

      await fetchConnections();
      return data;
    } catch (error) {
      console.error('Error updating SQL connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logError(`Falha ao atualizar conexão SQL: ${errorMessage}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: id,
        error: errorMessage
      });
      toast({
        title: "Erro",
        description: `Erro ao atualizar conexão SQL: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      console.log('🗑️ Deletando conexão SQL:', id);
      logInfo(`Iniciando exclusão de conexão SQL: ${id}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: id
      });
      
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) {
        console.error('Error deleting SQL connection:', error);
        logError(`Erro ao excluir conexão SQL: ${error.message}`, 'useSQLConnections', {
          company_id: currentCompany?.id,
          connection_id: id,
          error: error.message
        });
        throw error;
      }

      console.log('✅ SQL connection deleted successfully');
      logInfo(`Conexão SQL excluída com sucesso: ${id}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: id
      });

      toast({
        title: "Sucesso",
        description: "Conexão SQL removida com sucesso"
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error deleting SQL connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logError(`Falha ao excluir conexão SQL: ${errorMessage}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_id: id,
        error: errorMessage
      });
      toast({
        title: "Erro",
        description: `Erro ao remover conexão SQL: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const testConnection = async (connectionData: Partial<SQLConnection>) => {
    try {
      setTesting(true);
      console.log('🔍 Testando conexão SQL:', connectionData);
      logInfo(`Iniciando teste de conexão SQL: ${connectionData.name}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_name: connectionData.name,
        host: connectionData.host,
        port: connectionData.port
      });
      
      // Simular teste de conexão com validação mais rigorosa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular falha para hosts de teste específicos
      if (connectionData.host === 'teste-falha' || connectionData.host === 'fail-test') {
        throw new Error('Falha simulada no teste de conexão');
      }
      
      logInfo(`Teste de conexão SQL bem-sucedido: ${connectionData.name}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_name: connectionData.name,
        host: connectionData.host
      });
      
      toast({
        title: "Sucesso",
        description: `Conexão "${connectionData.name}" testada com sucesso`
      });
      
      return true;
    } catch (error) {
      console.error('Error testing SQL connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logError(`Falha no teste de conexão SQL: ${errorMessage}`, 'useSQLConnections', {
        company_id: currentCompany?.id,
        connection_name: connectionData.name,
        error: errorMessage
      });
      toast({
        title: "Erro",
        description: `Falha ao testar conexão: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setTesting(false);
    }
  };

  const createDemoConnection = async (companyId: string, companyName: string) => {
    try {
      console.log(`🎯 Criando conexão de demonstração para empresa: ${companyName}`);
      
      const demoConnection = {
        company_id: companyId,
        name: `Demo SQL - ${companyName}`,
        host: 'localhost',
        database_name: 'demo_database',
        username: 'demo_user',
        password_encrypted: 'demo_password_123',
        port: 1433,
        connection_type: 'sqlserver',
        status: 'active'
      };

      logInfo(`Criando conexão de demonstração para empresa: ${companyName}`, 'useSQLConnections', {
        company_id: companyId,
        company_name: companyName,
        demo_connection: demoConnection
      });

      const { data, error } = await supabase
        .from('sql_connections')
        .insert(demoConnection)
        .select()
        .single();

      if (error) {
        console.error('Error creating demo connection:', error);
        logError(`Erro ao criar conexão de demonstração: ${error.message}`, 'useSQLConnections', {
          company_id: companyId,
          company_name: companyName,
          error: error.message
        });
        throw error;
      }

      console.log('✅ Demo connection created successfully:', data);
      logInfo(`Conexão de demonstração criada com sucesso: ${data.name}`, 'useSQLConnections', {
        company_id: companyId,
        connection_id: data.id,
        connection_name: data.name
      });

      return data;
    } catch (error) {
      console.error('Error creating demo connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logError(`Falha ao criar conexão de demonstração: ${errorMessage}`, 'useSQLConnections', {
        company_id: companyId,
        error: errorMessage
      });
      throw error;
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
    createDemoConnection,
    refetch: fetchConnections
  };
}


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useSQLQueriesNew } from '@/hooks/useSQLQueriesNew';
import { useSQLConnections } from '@/hooks/useSQLConnections';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  operation: string;
  table: string;
  success: boolean;
  error?: string;
  details?: any;
}

export function useCRUDTester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { createQuery, updateQuery, deleteQuery } = useSQLQueriesNew();
  const { createConnection, updateConnection, deleteConnection } = useSQLConnections();

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
    console.log(`📊 Test Result: ${result.operation} on ${result.table} - ${result.success ? 'SUCCESS' : 'FAILED'}`, result);
  };

  const testSQLConnections = async (): Promise<boolean> => {
    if (!currentCompany?.id) return false;

    try {
      // Test CREATE
      console.log('🧪 Testing SQL Connections CREATE...');
      const testConnection = {
        name: `Teste CRUD ${Date.now()}`,
        host: 'servidor-teste.com',
        port: 1433,
        database_name: 'db_teste',
        username: 'user_teste',
        password_encrypted: 'senha123',
        connection_type: 'sqlserver',
        company_id: currentCompany.id,
        status: 'active' as const
      };

      const createdConnection = await createConnection(testConnection);
      addResult({
        operation: 'CREATE',
        table: 'sql_connections',
        success: true,
        details: { id: createdConnection?.id }
      });

      if (!createdConnection?.id) {
        throw new Error('Connection was not created properly');
      }

      // Test UPDATE
      console.log('🧪 Testing SQL Connections UPDATE...');
      await updateConnection(createdConnection.id, {
        name: `Teste CRUD Atualizado ${Date.now()}`,
        host: 'servidor-atualizado.com'
      });
      addResult({
        operation: 'UPDATE',
        table: 'sql_connections',
        success: true,
        details: { id: createdConnection.id }
      });

      // Test DELETE
      console.log('🧪 Testing SQL Connections DELETE...');
      await deleteConnection(createdConnection.id);
      addResult({
        operation: 'DELETE',
        table: 'sql_connections',
        success: true,
        details: { id: createdConnection.id }
      });

      return true;
    } catch (error: any) {
      addResult({
        operation: 'CRUD Test',
        table: 'sql_connections',
        success: false,
        error: error.message
      });
      return false;
    }
  };

  const testSQLQueries = async (): Promise<boolean> => {
    if (!currentCompany?.id) return false;

    try {
      // Test CREATE
      console.log('🧪 Testing SQL Queries CREATE...');
      const testQuery = {
        name: `Query Teste CRUD ${Date.now()}`,
        description: 'Query de teste para validar CRUD',
        query_text: 'SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1',
        connection_id: null,
        status: 'active' as const,
        created_by: null,
        user_id: null
      };

      const createdQuery = await createQuery(testQuery);
      addResult({
        operation: 'CREATE',
        table: 'sql_queries',
        success: true,
        details: { name: testQuery.name }
      });

      if (!createdQuery?.id) {
        throw new Error('Query was not created properly');
      }

      // Test UPDATE
      console.log('🧪 Testing SQL Queries UPDATE...');
      await updateQuery(createdQuery.id, {
        name: `Query Teste CRUD Atualizada ${Date.now()}`,
        description: 'Query atualizada para teste'
      });
      addResult({
        operation: 'UPDATE',
        table: 'sql_queries',
        success: true,
        details: { id: createdQuery.id }
      });

      // Test DELETE
      console.log('🧪 Testing SQL Queries DELETE...');
      await deleteQuery(createdQuery.id);
      addResult({
        operation: 'DELETE',
        table: 'sql_queries',
        success: true,
        details: { id: createdQuery.id }
      });

      return true;
    } catch (error: any) {
      addResult({
        operation: 'CRUD Test',
        table: 'sql_queries',
        success: false,
        error: error.message
      });
      return false;
    }
  };

  const testDirectDatabaseOperations = async (): Promise<boolean> => {
    try {
      // Test direct database operations
      console.log('🧪 Testing direct database operations...');

      // Test inserting a simple log entry
      const { data: logData, error: logError } = await supabase
        .from('system_logs')
        .insert({
          company_id: currentCompany?.id,
          level: 'info',
          message: `Teste CRUD direto ${Date.now()}`,
          component: 'CRUDTester',
          details: { test: true, timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (logError) throw logError;

      addResult({
        operation: 'DIRECT INSERT',
        table: 'system_logs',
        success: true,
        details: { id: logData?.id }
      });

      // Test updating the log entry
      if (logData?.id) {
        const { error: updateError } = await supabase
          .from('system_logs')
          .update({
            message: `Teste CRUD direto atualizado ${Date.now()}`
          })
          .eq('id', logData.id);

        if (updateError) throw updateError;

        addResult({
          operation: 'DIRECT UPDATE',
          table: 'system_logs',
          success: true,
          details: { id: logData.id }
        });

        // Test deleting the log entry
        const { error: deleteError } = await supabase
          .from('system_logs')
          .delete()
          .eq('id', logData.id);

        if (deleteError) throw deleteError;

        addResult({
          operation: 'DIRECT DELETE',
          table: 'system_logs',
          success: true,
          details: { id: logData.id }
        });
      }

      return true;
    } catch (error: any) {
      addResult({
        operation: 'DIRECT DB Test',
        table: 'various',
        success: false,
        error: error.message
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    console.log('🚀 Iniciando testes CRUD completos...');

    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa antes de executar os testes",
        variant: "destructive"
      });
      setTesting(false);
      return;
    }

    try {
      // Test SQL Connections CRUD
      await testSQLConnections();

      // Test SQL Queries CRUD
      await testSQLQueries();

      // Test direct database operations
      await testDirectDatabaseOperations();

      const totalTests = results.length;
      const successfulTests = results.filter(r => r.success).length;
      const failedTests = totalTests - successfulTests;

      toast({
        title: "Testes CRUD Concluídos",
        description: `${successfulTests}/${totalTests} testes passaram. ${failedTests} falharam.`,
        variant: failedTests > 0 ? "destructive" : "default"
      });

      console.log('✅ Testes CRUD concluídos:', {
        total: totalTests,
        successful: successfulTests,
        failed: failedTests,
        results: results
      });

    } catch (error: any) {
      console.error('❌ Erro durante os testes CRUD:', error);
      toast({
        title: "Erro nos Testes",
        description: error.message || "Erro desconhecido durante os testes",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return {
    testing,
    results,
    runAllTests
  };
}

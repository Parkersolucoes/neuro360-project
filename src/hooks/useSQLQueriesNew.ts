
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useSQLConnections } from '@/hooks/useSQLConnections';
import { supabase } from '@/integrations/supabase/client';

export interface SQLQuery {
  id: string;
  company_id: string;
  connection_id: string | null;
  name: string;
  description: string | null;
  query_text: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  user_id: string | null;
  sql_connections?: {
    id: string;
    name: string;
    host: string;
    port: number;
    database_name: string;
  };
}

export function useSQLQueriesNew() {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { connections } = useSQLConnections();

  const fetchQueries = async () => {
    if (!currentCompany?.id) {
      setQueries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sql_queries')
        .select(`
          *,
          sql_connections (
            id,
            name,
            host,
            port,
            database_name
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que os tipos estejam corretos
      const typedData: SQLQuery[] = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'inactive'
      }));
      
      setQueries(typedData);
    } catch (error) {
      console.error('Error fetching SQL queries:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar consultas SQL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuery = async (queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Validar dados obrigatórios
      if (!queryData.name?.trim()) {
        throw new Error('Nome da consulta é obrigatório');
      }
      if (!queryData.query_text?.trim()) {
        throw new Error('Texto da consulta SQL é obrigatório');
      }

      const { data, error } = await supabase
        .from('sql_queries')
        .insert({
          company_id: currentCompany.id,
          name: queryData.name.trim(),
          description: queryData.description?.trim() || null,
          query_text: queryData.query_text.trim(),
          connection_id: queryData.connection_id || null,
          status: queryData.status || 'active',
          created_by: queryData.created_by || null,
          user_id: queryData.user_id || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Consulta SQL criada com sucesso"
      });

      await fetchQueries();
      return data;
    } catch (error: any) {
      console.error('Error creating SQL query:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateQuery = async (id: string, updates: Partial<SQLQuery>) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Validar dados obrigatórios se foram fornecidos
      if (updates.name !== undefined && !updates.name?.trim()) {
        throw new Error('Nome da consulta é obrigatório');
      }
      if (updates.query_text !== undefined && !updates.query_text?.trim()) {
        throw new Error('Texto da consulta SQL é obrigatório');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.description !== undefined) updateData.description = updates.description?.trim() || null;
      if (updates.query_text !== undefined) updateData.query_text = updates.query_text.trim();
      if (updates.connection_id !== undefined) updateData.connection_id = updates.connection_id || null;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('sql_queries')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', currentCompany.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Consulta SQL atualizada com sucesso"
      });

      await fetchQueries();
      return data;
    } catch (error: any) {
      console.error('Error updating SQL query:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      const { error } = await supabase
        .from('sql_queries')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Consulta SQL removida com sucesso"
      });

      await fetchQueries();
    } catch (error: any) {
      console.error('Error deleting SQL query:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover consulta SQL",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createTestRecord = async () => {
    try {
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      const testQuery = {
        name: `Consulta Teste ${new Date().getTime()}`,
        description: "Consulta de teste criada automaticamente",
        query_text: "SELECT COUNT(*) as total FROM usuarios WHERE status = 'ativo'",
        connection_id: connections.length > 0 ? connections[0].id : null,
        status: 'active' as const,
        created_by: null,
        user_id: null
      };

      await createQuery(testQuery);
      
      toast({
        title: "Sucesso",
        description: "Registro de teste criado com sucesso"
      });
    } catch (error: any) {
      console.error('Error creating test record:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar registro de teste",
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

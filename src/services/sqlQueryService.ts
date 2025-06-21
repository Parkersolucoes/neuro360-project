
import { supabase } from '@/integrations/supabase/client';
import { SQLQuery } from '@/types/sqlQuery';

export class SQLQueryService {
  static async fetchQueriesForCompany(companyId: string) {
    const { data, error } = await supabase
      .from('sql_queries')
      .select(`
        *,
        sql_connections!inner(name, company_id)
      `)
      .eq('sql_connections.company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao carregar consultas SQL: ${error.message}`);
    }

    return this.mapSupabaseDataToSQLQuery(data || []);
  }

  static async createQuery(queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('sql_queries')
      .insert([{
        connection_id: queryData.connection_id,
        name: queryData.name,
        description: queryData.description,
        query_text: queryData.query_text,
        created_by: currentUser.user?.id
      }])
      .select(`
        *,
        sql_connections(name)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar consulta SQL: ${error.message}`);
    }
    
    return this.mapSingleSupabaseDataToSQLQuery(data);
  }

  static async updateQuery(id: string, updates: Partial<SQLQuery>) {
    const { data, error } = await supabase
      .from('sql_queries')
      .update({ 
        name: updates.name,
        description: updates.description,
        query_text: updates.query_text,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select(`
        *,
        sql_connections(name)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar consulta SQL: ${error.message}`);
    }
    
    return this.mapSingleSupabaseDataToSQLQuery(data, updates.status);
  }

  static async deleteQuery(id: string) {
    const { error } = await supabase
      .from('sql_queries')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao remover consulta SQL: ${error.message}`);
    }
  }

  private static mapSupabaseDataToSQLQuery(data: any[]): SQLQuery[] {
    return data.map(item => ({
      id: item.id,
      connection_id: item.connection_id,
      name: item.name,
      description: item.description,
      query_text: item.query_text,
      status: 'pending' as const,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by,
      sql_connections: {
        name: item.sql_connections.name
      }
    }));
  }

  private static mapSingleSupabaseDataToSQLQuery(data: any, status?: 'success' | 'error' | 'pending'): SQLQuery {
    return {
      id: data.id,
      connection_id: data.connection_id,
      name: data.name,
      description: data.description,
      query_text: data.query_text,
      status: status || 'pending' as const,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      sql_connections: data.sql_connections ? {
        name: data.sql_connections.name
      } : undefined
    };
  }
}

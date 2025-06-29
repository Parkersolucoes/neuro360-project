
import { supabase } from '@/integrations/supabase/client';
import { SQLQuery } from '@/types/sqlQuery';

export class SQLQueryService {
  static async fetchQueriesForCompany(companyId: string) {
    try {
      console.log('SQLQueryService: Fetching queries for company:', companyId);
      
      const { data, error } = await supabase
        .from('sql_queries')
        .select(`
          *,
          sql_connections (
            name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SQLQueryService: Error fetching queries:', error);
        throw error;
      }

      console.log('SQLQueryService: Queries fetched successfully:', data);
      return this.mapSupabaseDataToSQLQuery(data || []);
    } catch (error) {
      console.error('SQLQueryService: fetchQueriesForCompany error:', error);
      throw new Error(`Erro ao carregar consultas SQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async createQuery(queryData: Partial<SQLQuery> & { 
    name: string; 
    query_text: string; 
    company_id: string;
    connection_id?: string;
    created_by?: string;
  }) {
    try {
      console.log('SQLQueryService: Creating query:', queryData);

      const { data, error } = await supabase
        .from('sql_queries')
        .insert({
          name: queryData.name,
          query_text: queryData.query_text,
          description: queryData.description || '',
          connection_id: queryData.connection_id || null,
          created_by: queryData.created_by || null,
          company_id: queryData.company_id,
          user_id: queryData.created_by || null,
          status: 'active'
        })
        .select(`
          *,
          sql_connections (
            name
          )
        `)
        .single();

      if (error) {
        console.error('SQLQueryService: Error creating query:', error);
        throw error;
      }

      console.log('SQLQueryService: Query created successfully:', data);
      return this.mapSingleSupabaseDataToSQLQuery(data);
    } catch (error) {
      console.error('SQLQueryService: createQuery error:', error);
      throw new Error(`Erro ao criar consulta SQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async updateQuery(id: string, updates: Partial<SQLQuery>) {
    try {
      console.log('SQLQueryService: Updating query:', id, updates);

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.query_text) updateData.query_text = updates.query_text;
      if (updates.description) updateData.description = updates.description;
      if (updates.connection_id) updateData.connection_id = updates.connection_id;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('sql_queries')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          sql_connections (
            name
          )
        `)
        .single();

      if (error) {
        console.error('SQLQueryService: Error updating query:', error);
        throw error;
      }

      console.log('SQLQueryService: Query updated successfully:', data);
      return this.mapSingleSupabaseDataToSQLQuery(data);
    } catch (error) {
      console.error('SQLQueryService: updateQuery error:', error);
      throw new Error(`Erro ao atualizar consulta SQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async deleteQuery(id: string) {
    try {
      console.log('SQLQueryService: Deleting query:', id);

      const { error } = await supabase
        .from('sql_queries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('SQLQueryService: Error deleting query:', error);
        throw error;
      }

      console.log('SQLQueryService: Query deleted successfully');
    } catch (error) {
      console.error('SQLQueryService: deleteQuery error:', error);
      throw new Error(`Erro ao remover consulta SQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private static mapSupabaseDataToSQLQuery(data: any[]): SQLQuery[] {
    return data.map(item => ({
      id: item.id,
      connection_id: item.connection_id,
      name: item.name,
      description: item.description,
      query_text: item.query_text,
      status: item.status || 'active',
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by,
      company_id: item.company_id,
      sql_connections: item.sql_connections ? {
        name: item.sql_connections.name
      } : undefined
    }));
  }

  private static mapSingleSupabaseDataToSQLQuery(data: any): SQLQuery {
    return {
      id: data.id,
      connection_id: data.connection_id,
      name: data.name,
      description: data.description,
      query_text: data.query_text,
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      company_id: data.company_id,
      sql_connections: data.sql_connections ? {
        name: data.sql_connections.name
      } : undefined
    };
  }
}

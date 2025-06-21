
import { useToast } from '@/hooks/use-toast';
import { SQLQuery } from '@/types/sqlQuery';

export class SQLQueryService {
  static async fetchQueriesForCompany(companyId: string) {
    try {
      console.log('SQLQueryService: Table sql_queries does not exist in current database schema');
      
      // Como a tabela sql_queries não existe, retornar array vazio
      return [];
    } catch (error) {
      throw new Error(`Erro ao carregar consultas SQL: Funcionalidade temporariamente indisponível`);
    }
  }

  static async createQuery(queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at' | 'sql_connections'>) {
    try {
      console.log('SQLQueryService: Cannot create query - table sql_queries does not exist');
      
      throw new Error('Funcionalidade de consultas SQL está temporariamente indisponível');
    } catch (error) {
      throw new Error(`Erro ao criar consulta SQL: Funcionalidade temporariamente indisponível`);
    }
  }

  static async updateQuery(id: string, updates: Partial<SQLQuery>) {
    try {
      console.log('SQLQueryService: Cannot update query - table sql_queries does not exist');
      
      throw new Error('Funcionalidade de consultas SQL está temporariamente indisponível');
    } catch (error) {
      throw new Error(`Erro ao atualizar consulta SQL: Funcionalidade temporariamente indisponível`);
    }
  }

  static async deleteQuery(id: string) {
    try {
      console.log('SQLQueryService: Cannot delete query - table sql_queries does not exist');
      
      throw new Error('Funcionalidade de consultas SQL está temporariamente indisponível');
    } catch (error) {
      throw new Error(`Erro ao remover consulta SQL: Funcionalidade temporariamente indisponível`);
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
        name: item.sql_connections?.name || 'Conexão Desconhecida'
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

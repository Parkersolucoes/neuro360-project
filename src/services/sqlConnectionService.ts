
import { supabase } from '@/integrations/supabase/client';
import { SQLConnection } from '@/types/sqlConnection';

export const sqlConnectionService = {
  async fetchConnections() {
    try {
      console.log('sqlConnectionService: Fetching all SQL connections...');
      
      const { data, error } = await supabase
        .from('sql_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('sqlConnectionService: Error fetching connections:', error);
        throw new Error(`Erro ao buscar conexões: ${error.message}`);
      }

      console.log('sqlConnectionService: Connections fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('sqlConnectionService: fetchConnections error:', error);
      throw error;
    }
  },

  async fetchConnectionsByCompany(companyId: string) {
    try {
      console.log('sqlConnectionService: Fetching connections for company:', companyId);
      
      if (!companyId) {
        console.log('sqlConnectionService: No company ID provided');
        return [];
      }
      
      const { data, error } = await supabase
        .from('sql_connections')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('sqlConnectionService: Error fetching company connections:', error);
        throw new Error(`Erro ao buscar conexões da empresa: ${error.message}`);
      }

      console.log('sqlConnectionService: Company connections fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('sqlConnectionService: fetchConnectionsByCompany error:', error);
      throw error;
    }
  },

  async createConnection(connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('sqlConnectionService: Creating connection:', connectionData);
      
      if (!connectionData.company_id) {
        throw new Error('ID da empresa é obrigatório');
      }
      
      const { data, error } = await supabase
        .from('sql_connections')
        .insert({
          name: connectionData.name,
          host: connectionData.host,
          port: connectionData.port,
          database_name: connectionData.database_name,
          username: connectionData.username,
          password_encrypted: connectionData.password_encrypted,
          connection_type: connectionData.connection_type,
          status: connectionData.status || 'active',
          company_id: connectionData.company_id
        })
        .select()
        .single();

      if (error) {
        console.error('sqlConnectionService: Error creating connection:', error);
        throw new Error(`Erro ao criar conexão: ${error.message}`);
      }

      console.log('sqlConnectionService: Connection created successfully:', data);
      return data;
    } catch (error) {
      console.error('sqlConnectionService: createConnection error:', error);
      throw error;
    }
  },

  async updateConnection(id: string, updates: Partial<SQLConnection>) {
    try {
      console.log('sqlConnectionService: Updating connection:', id, updates);
      
      if (!id) {
        throw new Error('ID da conexão é obrigatório');
      }
      
      const { data, error } = await supabase
        .from('sql_connections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('sqlConnectionService: Error updating connection:', error);
        throw new Error(`Erro ao atualizar conexão: ${error.message}`);
      }

      console.log('sqlConnectionService: Connection updated successfully:', data);
      return data;
    } catch (error) {
      console.error('sqlConnectionService: updateConnection error:', error);
      throw error;
    }
  },

  async deleteConnection(id: string) {
    try {
      console.log('sqlConnectionService: Deleting connection:', id);
      
      if (!id) {
        throw new Error('ID da conexão é obrigatório');
      }
      
      const { error } = await supabase
        .from('sql_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('sqlConnectionService: Error deleting connection:', error);
        throw new Error(`Erro ao deletar conexão: ${error.message}`);
      }

      console.log('sqlConnectionService: Connection deleted successfully');
    } catch (error) {
      console.error('sqlConnectionService: deleteConnection error:', error);
      throw error;
    }
  },

  async createDemoConnection(companyId: string, companyName: string) {
    try {
      console.log('sqlConnectionService: Creating demo connection for company:', companyName);
      
      if (!companyId) {
        throw new Error('ID da empresa é obrigatório');
      }
      
      const demoConnectionData = {
        name: `Demo SQL - ${companyName}`,
        host: 'demo-server.exemplo.com',
        database_name: 'DemoDatabase',
        username: 'demo_user',
        password_encrypted: 'demo_password',
        port: 1433,
        company_id: companyId,
        connection_type: 'sqlserver' as const,
        status: 'active' as const
      };

      const { data, error } = await supabase
        .from('sql_connections')
        .insert(demoConnectionData)
        .select()
        .single();

      if (error) {
        console.error('sqlConnectionService: Error creating demo connection:', error);
        throw new Error(`Erro ao criar conexão demo: ${error.message}`);
      }

      console.log('sqlConnectionService: Demo connection created successfully:', data);
      return data;
    } catch (error) {
      console.error('sqlConnectionService: createDemoConnection error:', error);
      throw error;
    }
  }
};

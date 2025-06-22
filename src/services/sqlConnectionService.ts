
import { supabase } from '@/integrations/supabase/client';
import { SQLConnection } from '@/types/sqlConnection';

export const sqlConnectionService = {
  async fetchConnections() {
    const { data, error } = await supabase
      .from('sql_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async createConnection(connectionData: Omit<SQLConnection, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('sql_connections')
      .insert(connectionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateConnection(id: string, updates: Partial<SQLConnection>) {
    const { data, error } = await supabase
      .from('sql_connections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async deleteConnection(id: string) {
    const { error } = await supabase
      .from('sql_connections')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async createDemoConnection(companyId: string, companyName: string) {
    const demoConnectionData = {
      name: `Demo SQL - ${companyName}`,
      host: 'demo-server.exemplo.com',
      database_name: 'DemoDatabase',
      username: 'demo_user',
      password_encrypted: 'demo_password',
      port: 1433,
      company_id: companyId,
      connection_type: 'sqlserver',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('sql_connections')
      .insert(demoConnectionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};

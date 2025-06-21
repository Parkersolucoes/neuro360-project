
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyStats {
  company_id: string;
  sql_connections_count: number;
  active_sql_connections_count: number;
  sql_queries_count: number;
}

export function useCompanyStats() {
  const [stats, setStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyStats = async () => {
    try {
      // Buscar estatísticas de conexões SQL
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('sql_connections')
        .select('company_id, is_active');

      if (connectionsError) {
        console.error('Error fetching connections stats:', connectionsError);
        return;
      }

      // Buscar estatísticas de consultas SQL
      const { data: queriesData, error: queriesError } = await supabase
        .from('sql_queries')
        .select(`
          connection_id,
          sql_connections!inner (
            company_id
          )
        `);

      if (queriesError) {
        console.error('Error fetching queries stats:', queriesError);
        return;
      }

      // Agrupar estatísticas por empresa
      const companyStatsMap = new Map<string, CompanyStats>();

      // Processar conexões
      connectionsData?.forEach(connection => {
        if (connection.company_id) {
          const existing = companyStatsMap.get(connection.company_id) || {
            company_id: connection.company_id,
            sql_connections_count: 0,
            active_sql_connections_count: 0,
            sql_queries_count: 0
          };

          existing.sql_connections_count += 1;
          if (connection.is_active) {
            existing.active_sql_connections_count += 1;
          }

          companyStatsMap.set(connection.company_id, existing);
        }
      });

      // Processar consultas
      queriesData?.forEach(query => {
        const companyId = (query.sql_connections as any)?.company_id;
        if (companyId) {
          const existing = companyStatsMap.get(companyId) || {
            company_id: companyId,
            sql_connections_count: 0,
            active_sql_connections_count: 0,
            sql_queries_count: 0
          };

          existing.sql_queries_count += 1;
          companyStatsMap.set(companyId, existing);
        }
      });

      setStats(Array.from(companyStatsMap.values()));
    } catch (error) {
      console.error('Error fetching company stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchCompanyStats
  };
}

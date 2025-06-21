
import { useState, useEffect } from 'react';

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
      // Como as tabelas sql_connections e sql_queries não existem mais,
      // vamos retornar estatísticas vazias por enquanto
      console.log('CompanyStats: Tables sql_connections and sql_queries do not exist in current database schema');
      
      // Retornar array vazio até que as tabelas sejam recriadas
      setStats([]);
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

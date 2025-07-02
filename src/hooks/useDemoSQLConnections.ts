
import { useEffect } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { useSQLConnections } from '@/hooks/useSQLConnections';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';
import { useToast } from '@/hooks/use-toast';

export function useDemoSQLConnections() {
  const { companies } = useCompanies();
  const { connections, createDemoConnection } = useSQLConnections();
  const { logInfo, logError } = useSystemLogsDB();
  const { toast } = useToast();

  const createDemoConnectionsForNewCompanies = async () => {
    try {
      console.log('🔍 Verificando empresas sem conexões de demonstração...');
      
      for (const company of companies) {
        // Verificar se a empresa já tem conexões
        const companyConnections = connections.filter(conn => conn.company_id === company.id);
        const hasDemoConnection = companyConnections.some(conn => conn.name.includes('Demo SQL'));
        
        if (!hasDemoConnection && companyConnections.length === 0) {
          console.log(`📝 Criando conexão de demonstração para: ${company.name}`);
          
          try {
            await createDemoConnection(company.id, company.name);
            
            toast({
              title: "Conexão Demo Criada",
              description: `Conexão de demonstração criada para ${company.name}`,
            });
            
            logInfo(`Conexão de demonstração criada automaticamente para empresa: ${company.name}`, 'useDemoSQLConnections', {
              company_id: company.id,
              company_name: company.name
            });
          } catch (error) {
            console.error(`Erro ao criar conexão demo para ${company.name}:`, error);
            // Não usar logError para evitar problemas de RLS
            console.log('Erro na criação de conexão demo:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar conexões de demonstração:', error);
      // Log simples sem usar o sistema de logs
      console.log('Erro geral ao processar conexões de demonstração:', error);
    }
  };

  useEffect(() => {
    if (companies.length > 0) {
      createDemoConnectionsForNewCompanies();
    }
  }, [companies]);

  return {
    createDemoConnectionsForNewCompanies
  };
}

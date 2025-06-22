
import { useEffect } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { useSQLConnections } from '@/hooks/useSQLConnections';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';
import { useToast } from '@/hooks/use-toast';

export function useDemoSQLConnections() {
  const { companies } = useCompanies();
  const { connections, createDemoConnection } = useSQLConnections();
  const { logMessage } = useSystemLogsDB();
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
            
            await logMessage('info', `Conexão de demonstração criada automaticamente para empresa: ${company.name}`, 'useDemoSQLConnections', {
              company_id: company.id,
              company_name: company.name
            });
          } catch (error) {
            console.error(`Erro ao criar conexão demo para ${company.name}:`, error);
            await logMessage('error', `Falha ao criar conexão de demonstração para empresa ${company.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useDemoSQLConnections', {
              company_id: company.id,
              company_name: company.name,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar conexões de demonstração:', error);
      await logMessage('error', `Erro geral ao processar conexões de demonstração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useDemoSQLConnections', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  useEffect(() => {
    if (companies.length > 0 && connections.length >= 0) {
      createDemoConnectionsForNewCompanies();
    }
  }, [companies, connections]);

  return {
    createDemoConnectionsForNewCompanies
  };
}


import { SQLConnection, ConnectionTestResult } from '@/types/sqlConnection';

export const connectionTestService = {
  async testConnection(connection: SQLConnection): Promise<ConnectionTestResult> {
    try {
      console.log('connectionTestService: Testing connection to:', connection.host);
      
      // Simular teste de conexão com base no tipo
      const delay = Math.random() * 2000 + 1000; // Entre 1-3 segundos
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simular falha ocasional para testar tratamento de erro
      const shouldFail = Math.random() < 0.1; // 10% de chance de falha
      
      if (shouldFail) {
        throw new Error(`Falha ao conectar com ${connection.host}:${connection.port}`);
      }
      
      console.log('connectionTestService: Connection test successful for:', connection.name);
      
      return { 
        success: true, 
        message: `Conexão estabelecida com sucesso em ${connection.name}!` 
      };
    } catch (error) {
      console.error('connectionTestService: Connection test failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Falha na conexão com o servidor";
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }
};

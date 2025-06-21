
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  columns: string[];
  data: any[];
  status: 'success' | 'error' | 'pending';
  executionTime?: number;
  errorMessage?: string;
}

export function useQueryExecution() {
  const { toast } = useToast();
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Simular execução de consulta com resultados mais realistas
  const mockQueryExecution = (query: string): Promise<QueryResult> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      setTimeout(() => {
        const executionTime = Date.now() - startTime;
        
        // Simular erro em alguns casos
        if (query.toLowerCase().includes('drop') || query.toLowerCase().includes('delete from users')) {
          resolve({
            columns: [],
            data: [],
            status: 'error',
            executionTime,
            errorMessage: 'Operação não permitida: comandos DROP e DELETE em tabelas críticas são bloqueados por segurança.'
          });
          return;
        }

        // Simular diferentes tipos de consulta baseado no conteúdo
        if (query.toLowerCase().includes('vendas') || query.toLowerCase().includes('sales')) {
          resolve({
            columns: ['id', 'data_venda', 'cliente', 'produto', 'quantidade', 'valor_unitario', 'valor_total', 'status'],
            data: [
              { 
                id: 1, 
                data_venda: '2024-01-15', 
                cliente: 'João Silva', 
                produto: 'Notebook Dell',
                quantidade: 1,
                valor_unitario: 'R$ 3.250,00',
                valor_total: 'R$ 3.250,00', 
                status: 'Pago' 
              },
              { 
                id: 2, 
                data_venda: '2024-01-15', 
                cliente: 'Maria Santos', 
                produto: 'Mouse Gamer',
                quantidade: 2,
                valor_unitario: 'R$ 145,00',
                valor_total: 'R$ 290,00', 
                status: 'Pendente' 
              },
              { 
                id: 3, 
                data_venda: '2024-01-16', 
                cliente: 'Pedro Costa', 
                produto: 'Teclado Mecânico',
                quantidade: 1,
                valor_unitario: 'R$ 420,00',
                valor_total: 'R$ 420,00', 
                status: 'Pago' 
              },
              { 
                id: 4, 
                data_venda: '2024-01-16', 
                cliente: 'Ana Paula', 
                produto: 'Monitor 4K',
                quantidade: 2,
                valor_unitario: 'R$ 890,00',
                valor_total: 'R$ 1.780,00', 
                status: 'Processando' 
              }
            ],
            status: 'success',
            executionTime
          });
        } else if (query.toLowerCase().includes('clientes') || query.toLowerCase().includes('customers')) {
          resolve({
            columns: ['id', 'nome', 'email', 'telefone', 'cidade', 'data_cadastro', 'valor_devido', 'status'],
            data: [
              { 
                id: 1,
                nome: 'Ana Paula Oliveira', 
                email: 'ana.paula@email.com',
                telefone: '(11) 99999-1234', 
                cidade: 'São Paulo',
                data_cadastro: '2024-01-10',
                valor_devido: 'R$ 450,00',
                status: 'Ativo'
              },
              { 
                id: 2,
                nome: 'Carlos Lima Silva', 
                email: 'carlos.lima@email.com',
                telefone: '(11) 88888-5678', 
                cidade: 'Rio de Janeiro',
                data_cadastro: '2024-01-12',
                valor_devido: 'R$ 1.200,00',
                status: 'Ativo'
              },
              { 
                id: 3,
                nome: 'Fernanda Costa', 
                email: 'fernanda@email.com',
                telefone: '(11) 77777-9012', 
                cidade: 'Belo Horizonte',
                data_cadastro: '2024-01-14',
                valor_devido: 'R$ 0,00',
                status: 'Ativo'
              }
            ],
            status: 'success',
            executionTime
          });
        } else if (query.toLowerCase().includes('produtos') || query.toLowerCase().includes('products')) {
          resolve({
            columns: ['id', 'nome', 'categoria', 'preco', 'estoque', 'fornecedor', 'data_cadastro'],
            data: [
              { 
                id: 1,
                nome: 'Notebook Dell Inspiron 15', 
                categoria: 'Informática',
                preco: 'R$ 3.250,00',
                estoque: 15,
                fornecedor: 'Dell Inc.',
                data_cadastro: '2024-01-05'
              },
              { 
                id: 2,
                nome: 'Mouse Gamer RGB', 
                categoria: 'Periféricos',
                preco: 'R$ 145,00',
                estoque: 43,
                fornecedor: 'Logitech',
                data_cadastro: '2024-01-08'
              },
              { 
                id: 3,
                nome: 'Teclado Mecânico RGB', 
                categoria: 'Periféricos',
                preco: 'R$ 420,00',
                estoque: 28,
                fornecedor: 'Corsair',
                data_cadastro: '2024-01-10'
              }
            ],
            status: 'success',
            executionTime
          });
        } else {
          resolve({
            columns: ['resultado', 'timestamp'],
            data: [{ 
              resultado: 'Consulta executada com sucesso',
              timestamp: new Date().toLocaleString('pt-BR')
            }],
            status: 'success',
            executionTime
          });
        }
      }, Math.random() * 1500 + 500); // Simular tempo de execução realista
    });
  };

  const executeQuery = async (queryText: string, updateQuery?: (id: string, updates: any) => Promise<any>, queryId?: string) => {
    setIsExecuting(true);
    setQueryResult(null);

    try {
      const result = await mockQueryExecution(queryText);
      setQueryResult(result);
      
      // Atualizar status da consulta se callback fornecido
      if (updateQuery && queryId) {
        await updateQuery(queryId, { 
          status: result.status,
          last_execution: new Date().toISOString()
        });
      }

      if (result.status === 'success') {
        toast({
          title: "Consulta executada",
          description: `${result.data.length} registros encontrados em ${result.executionTime}ms`,
        });
      } else {
        toast({
          title: "Erro na consulta",
          description: result.errorMessage || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      if (updateQuery && queryId) {
        await updateQuery(queryId, { status: "error" });
      }
      setQueryResult({
        columns: [],
        data: [],
        status: 'error',
        errorMessage: 'Erro interno do servidor'
      });
      toast({
        title: "Erro",
        description: "Erro interno ao executar consulta",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    queryResult,
    isExecuting,
    executeQuery,
    setQueryResult
  };
}


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Eye, Trash2, Database, CheckCircle, XCircle, Clock } from "lucide-react";
import { QueryResultTable } from "@/components/sql/QueryResultTable";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useSQLQueries } from "@/hooks/useSQLQueries";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  columns: string[];
  data: any[];
  status: 'success' | 'error' | 'pending';
  executionTime?: number;
  errorMessage?: string;
}

export default function ConsultasSQL() {
  const { connections } = useSQLConnections();
  const { queries, createQuery, updateQuery, deleteQuery } = useSQLQueries();
  const { toast } = useToast();

  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [newQuery, setNewQuery] = useState({
    name: "",
    description: "",
    query_text: "",
    connection_id: ""
  });

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

  const executeQuery = async (queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    setIsExecuting(true);
    setQueryResult(null);

    try {
      const result = await mockQueryExecution(query.query_text);
      setQueryResult(result);
      
      // Atualizar status da consulta
      await updateQuery(queryId, { 
        status: result.status,
        last_execution: new Date().toISOString()
      });

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
      await updateQuery(queryId, { status: "error" });
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

  const testQuery = async (queryId: string) => {
    await executeQuery(queryId);
  };

  const testSelectedQuery = async () => {
    if (!selectedQuery) return;
    await executeQuery(selectedQuery.id);
  };

  const handleSaveQuery = async () => {
    try {
      await createQuery({
        ...newQuery,
        status: "pending"
      });
      
      setNewQuery({ name: "", description: "", query_text: "", connection_id: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      await deleteQuery(queryId);
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas SQL</h1>
          <p className="text-gray-600 mt-2">Gerencie suas consultas e visualize os resultados em tabelas organizadas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 border-black">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-black">
            <DialogHeader>
              <DialogTitle>Nova Consulta SQL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome da consulta"
                    value={newQuery.name}
                    onChange={(e) => setNewQuery({...newQuery, name: e.target.value})}
                    className="bg-white border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection">Conexão</Label>
                  <Select value={newQuery.connection_id} onValueChange={(value) => setNewQuery({...newQuery, connection_id: value})}>
                    <SelectTrigger className="bg-white border-black">
                      <SelectValue placeholder="Selecione a conexão" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-black">
                      {connections.map((connection) => (
                        <SelectItem key={connection.id} value={connection.id}>
                          {connection.name} ({connection.host})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição da consulta"
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({...newQuery, description: e.target.value})}
                  className="bg-white border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="query">Consulta SQL</Label>
                <Textarea
                  id="query"
                  placeholder="SELECT * FROM tabela WHERE..."
                  className="min-h-32 bg-white border-black font-mono"
                  value={newQuery.query_text}
                  onChange={(e) => setNewQuery({...newQuery, query_text: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-black">
                  Cancelar
                </Button>
                <Button onClick={handleSaveQuery} disabled={!newQuery.name || !newQuery.query_text || !newQuery.connection_id} className="border-black">
                  Salvar Consulta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-black">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span>Consultas Salvas</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Lista de todas as consultas SQL configuradas</p>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {queries.map((query) => (
              <div
                key={query.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md border-black ${
                  selectedQuery?.id === query.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedQuery(query)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{query.name}</h3>
                      {getStatusIcon(query.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{query.description}</p>
                    <p className="text-xs text-gray-500">
                      Conexão: {query.sql_connections?.name}
                    </p>
                    {query.last_execution && (
                      <p className="text-xs text-gray-500 mt-1">
                        Última execução: {new Date(query.last_execution).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Badge className={
                    query.status === "success" ? "bg-green-100 text-green-800" :
                    query.status === "error" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {query.status === "success" ? "Sucesso" :
                     query.status === "error" ? "Erro" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeQuery(query.id);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800 text-white hover:bg-gray-900 border-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      testQuery(query.id);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Testar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuery(query.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader>
            <CardTitle>Selecione uma Consulta</CardTitle>
            <p className="text-sm text-gray-600">Visualize e teste a consulta selecionada</p>
          </CardHeader>
          <CardContent>
            {selectedQuery ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                    <span>{selectedQuery.name}</span>
                    {getStatusIcon(selectedQuery.status)}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedQuery.description}</p>
                </div>
                <div className="space-y-2">
                  <Label>Consulta SQL</Label>
                  <Textarea
                    value={selectedQuery.query_text}
                    readOnly
                    className="min-h-32 bg-gray-50 border-black font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conexão</Label>
                  <Input value={selectedQuery.sql_connections?.name} readOnly className="bg-gray-50 border-black" />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={testSelectedQuery} 
                    className="flex-1 border-black"
                    disabled={isExecuting}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isExecuting ? "Executando..." : "Testar Consulta"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Database className="w-16 h-16 mb-4 text-gray-300" />
                <p>Selecione uma consulta para visualizar os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados Melhorada */}
      {(queryResult || isExecuting) && (
        <QueryResultTable 
          data={queryResult?.data || []}
          columns={queryResult?.columns || []}
          isLoading={isExecuting}
          status={queryResult?.status}
          executionTime={queryResult?.executionTime}
          errorMessage={queryResult?.errorMessage}
        />
      )}
    </div>
  );
}

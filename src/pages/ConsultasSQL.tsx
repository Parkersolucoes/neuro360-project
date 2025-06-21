
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Eye, Trash2, Database } from "lucide-react";
import { QueryResultTable } from "@/components/sql/QueryResultTable";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useSQLQueries } from "@/hooks/useSQLQueries";

interface QueryResult {
  columns: string[];
  data: any[];
}

export default function ConsultasSQL() {
  const { connections } = useSQLConnections();
  const { queries, createQuery, updateQuery, deleteQuery } = useSQLQueries();

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

  // Simular execução de consulta
  const mockQueryExecution = (query: string): Promise<QueryResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulando diferentes tipos de consulta baseado no conteúdo
        if (query.toLowerCase().includes('vendas')) {
          resolve({
            columns: ['id', 'data', 'cliente', 'valor', 'status'],
            data: [
              { id: 1, data: '2024-01-15', cliente: 'João Silva', valor: 'R$ 1.250,00', status: 'Pago' },
              { id: 2, data: '2024-01-15', cliente: 'Maria Santos', valor: 'R$ 890,50', status: 'Pendente' },
              { id: 3, data: '2024-01-15', cliente: 'Pedro Costa', valor: 'R$ 2.100,00', status: 'Pago' }
            ]
          });
        } else if (query.toLowerCase().includes('clientes')) {
          resolve({
            columns: ['nome', 'telefone', 'valor_devido'],
            data: [
              { nome: 'Ana Paula', telefone: '(11) 9999-1234', valor_devido: 'R$ 450,00' },
              { nome: 'Carlos Lima', telefone: '(11) 8888-5678', valor_devido: 'R$ 1.200,00' }
            ]
          });
        } else {
          resolve({
            columns: ['resultado'],
            data: [{ resultado: 'Consulta executada com sucesso' }]
          });
        }
      }, 2000);
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
        status: "success",
        last_execution: new Date().toISOString()
      });
    } catch (error) {
      await updateQuery(queryId, { status: "error" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas SQL</h1>
          <p className="text-gray-600 mt-2">Gerencie suas consultas e teste os resultados</p>
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
                          {connection.name} ({connection.server})
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
                  className="min-h-32 bg-white border-black"
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
          <CardContent className="space-y-4">
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
                    <h3 className="font-medium text-gray-900">{query.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{query.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
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
                  <h3 className="font-medium text-gray-900">{selectedQuery.name}</h3>
                  <p className="text-sm text-gray-600">{selectedQuery.description}</p>
                </div>
                <div className="space-y-2">
                  <Label>Consulta SQL</Label>
                  <Textarea
                    value={selectedQuery.query_text}
                    readOnly
                    className="min-h-32 bg-gray-50 border-black"
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

      {/* Tabela de Resultados */}
      {(queryResult || isExecuting) && (
        <QueryResultTable 
          data={queryResult?.data || []}
          columns={queryResult?.columns || []}
          isLoading={isExecuting}
        />
      )}
    </div>
  );
}

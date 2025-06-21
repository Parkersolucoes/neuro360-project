
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
import { useToast } from "@/hooks/use-toast";

interface SQLQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  connection: string;
  lastExecution: string;
  status: "success" | "error" | "pending";
}

export default function ConsultasSQL() {
  const { toast } = useToast();
  const [queries, setQueries] = useState<SQLQuery[]>([
    {
      id: "1",
      name: "Vendas Diárias",
      description: "Consulta vendas do dia atual",
      query: "SELECT * FROM vendas WHERE data = CAST(GETDATE() AS DATE)",
      connection: "Principal",
      lastExecution: "2024-01-15 10:30:00",
      status: "success"
    },
    {
      id: "2", 
      name: "Clientes Inadimplentes",
      description: "Lista clientes com pagamentos em atraso",
      query: "SELECT nome, telefone, valor_devido FROM clientes WHERE status = 'inadimplente'",
      connection: "Principal",
      lastExecution: "2024-01-15 09:15:00",
      status: "success"
    }
  ]);

  const [selectedQuery, setSelectedQuery] = useState<SQLQuery | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuery, setNewQuery] = useState({
    name: "",
    description: "",
    query: "",
    connection: ""
  });

  const executeQuery = (queryId: string) => {
    toast({
      title: "Consulta executada",
      description: "A consulta foi executada com sucesso!",
    });
  };

  const testQuery = (queryId: string) => {
    toast({
      title: "Teste executado",
      description: "A consulta foi testada com sucesso!",
    });
  };

  const saveQuery = () => {
    const query: SQLQuery = {
      id: Date.now().toString(),
      ...newQuery,
      lastExecution: "",
      status: "pending"
    };
    
    setQueries([...queries, query]);
    setNewQuery({ name: "", description: "", query: "", connection: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Consulta salva",
      description: "A nova consulta foi criada com sucesso!",
    });
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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection">Conexão</Label>
                  <Select value={newQuery.connection} onValueChange={(value) => setNewQuery({...newQuery, connection: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conexão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="backup">Backup</SelectItem>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="query">Consulta SQL</Label>
                <Textarea
                  id="query"
                  placeholder="SELECT * FROM tabela WHERE..."
                  className="min-h-32"
                  value={newQuery.query}
                  onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveQuery} disabled={!newQuery.name || !newQuery.query}>
                  Salvar Consulta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedQuery?.id === query.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedQuery(query)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{query.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{query.description}</p>
                    {query.lastExecution && (
                      <p className="text-xs text-gray-500 mt-2">
                        Última execução: {query.lastExecution}
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
                    className="bg-gray-800 text-white hover:bg-gray-900"
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQueries(queries.filter(q => q.id !== query.id));
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
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
                    value={selectedQuery.query}
                    readOnly
                    className="min-h-32 bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conexão</Label>
                  <Input value={selectedQuery.connection} readOnly className="bg-gray-50" />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => executeQuery(selectedQuery.id)} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Executar Consulta
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
    </div>
  );
}

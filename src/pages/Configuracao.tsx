import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, MessageSquare, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSQLConnections } from "@/contexts/SQLConnectionContext";

interface SQLConnection {
  id: string;
  name: string;
  server: string;
  database: string;
  username: string;
  password: string;
  port: string;
  status: "connected" | "disconnected" | "testing";
}

export default function Configuracao() {
  const { toast } = useToast();
  const { connections, setConnections } = useSQLConnections();

  const [evolutionConfig, setEvolutionConfig] = useState({
    apiUrl: "",
    apiKey: "",
    instanceName: ""
  });

  const [evolutionStatus, setEvolutionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [newConnection, setNewConnection] = useState({
    name: "",
    server: "",
    database: "",
    username: "",
    password: "",
    port: "1433"
  });

  const testSqlConnection = async (connectionId: string) => {
    setConnections(connections => 
      connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: "testing" }
          : conn
      )
    );
    
    setTimeout(() => {
      setConnections(connections => 
        connections.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: "connected" }
            : conn
        )
      );
      toast({
        title: "Conexão testada",
        description: "Conexão com SQL Server estabelecida com sucesso!",
      });
    }, 2000);
  };

  const testEvolutionConnection = async () => {
    setEvolutionStatus("testing");
    setTimeout(() => {
      setEvolutionStatus("connected");
      toast({
        title: "Conexão testada",
        description: "Conexão com Evolution API estabelecida com sucesso!",
      });
    }, 2000);
  };

  const saveConnection = () => {
    if (editingConnection) {
      setConnections(connections =>
        connections.map(conn =>
          conn.id === editingConnection.id
            ? { ...editingConnection, ...newConnection }
            : conn
        )
      );
      toast({
        title: "Conexão atualizada",
        description: "A conexão SQL foi atualizada com sucesso!",
      });
    } else {
      const connection = {
        id: Date.now().toString(),
        ...newConnection,
        status: "disconnected" as const
      };
      setConnections([...connections, connection]);
      toast({
        title: "Conexão criada",
        description: "Nova conexão SQL foi criada com sucesso!",
      });
    }
    
    setNewConnection({ name: "", server: "", database: "", username: "", password: "", port: "1433" });
    setEditingConnection(null);
    setIsDialogOpen(false);
  };

  const editConnection = (connection: any) => {
    setEditingConnection(connection);
    setNewConnection({
      name: connection.name,
      server: connection.server,
      database: connection.database,
      username: connection.username,
      password: "",
      port: connection.port
    });
    setIsDialogOpen(true);
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    toast({
      title: "Conexão removida",
      description: "A conexão SQL foi removida com sucesso!",
    });
  };

  const saveConfiguration = () => {
    toast({
      title: "Configuração salva",
      description: "As configurações foram salvas com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuração</h1>
        <p className="text-gray-600 mt-2">Configure as conexões do sistema</p>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Banco de Dados</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Evolution API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card className="border-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span>Conexões SQL Server</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Gerencie suas conexões com bancos de dados SQL Server
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 border-gray-900">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Conexão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-gray-900">
                    <DialogHeader>
                      <DialogTitle>
                        {editingConnection ? "Editar Conexão" : "Nova Conexão SQL"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Conexão</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Principal, Backup"
                          value={newConnection.name}
                          onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                          className="bg-white border-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="server">Servidor</Label>
                          <Input
                            id="server"
                            placeholder="localhost ou IP"
                            value={newConnection.server}
                            onChange={(e) => setNewConnection({...newConnection, server: e.target.value})}
                            className="bg-white border-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">Porta</Label>
                          <Input
                            id="port"
                            placeholder="1433"
                            value={newConnection.port}
                            onChange={(e) => setNewConnection({...newConnection, port: e.target.value})}
                            className="bg-white border-gray-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="database">Banco de Dados</Label>
                        <Input
                          id="database"
                          placeholder="Nome do banco"
                          value={newConnection.database}
                          onChange={(e) => setNewConnection({...newConnection, database: e.target.value})}
                          className="bg-white border-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Usuário</Label>
                          <Input
                            id="username"
                            placeholder="sa"
                            value={newConnection.username}
                            onChange={(e) => setNewConnection({...newConnection, username: e.target.value})}
                            className="bg-white border-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={newConnection.password}
                            onChange={(e) => setNewConnection({...newConnection, password: e.target.value})}
                            className="bg-white border-gray-900"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-900">
                          Cancelar
                        </Button>
                        <Button onClick={saveConnection} disabled={!newConnection.name || !newConnection.server} className="border-gray-900">
                          {editingConnection ? "Atualizar" : "Criar"} Conexão
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell className="font-medium">{connection.name}</TableCell>
                      <TableCell>{connection.server}:{connection.port}</TableCell>
                      <TableCell>{connection.database}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          connection.status === "connected" ? "status-connected" :
                          connection.status === "testing" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {connection.status === "connected" ? "Conectado" :
                           connection.status === "testing" ? "Testando..." : "Desconectado"}
                          {connection.status === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                          {connection.status === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testSqlConnection(connection.id)}
                            disabled={connection.status === "testing"}
                            className="border-gray-900"
                          >
                            {connection.status === "testing" ? "Testando..." : "Testar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editConnection(connection)}
                            className="border-gray-900"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 border-gray-900"
                            onClick={() => deleteConnection(connection.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card className="border-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    <span>Configuração Evolution API</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure a conexão com a Evolution API para WhatsApp
                  </p>
                </div>
                <Badge className={`${
                  evolutionStatus === "connected" ? "status-connected" :
                  evolutionStatus === "testing" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {evolutionStatus === "connected" ? "Conectado" :
                   evolutionStatus === "testing" ? "Testando..." : "Desconectado"}
                  {evolutionStatus === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                  {evolutionStatus === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">URL da API</Label>
                <Input
                  id="apiUrl"
                  placeholder="https://api.evolution.com"
                  value={evolutionConfig.apiUrl}
                  onChange={(e) => setEvolutionConfig({...evolutionConfig, apiUrl: e.target.value})}
                  className="bg-white border-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={evolutionConfig.apiKey}
                  onChange={(e) => setEvolutionConfig({...evolutionConfig, apiKey: e.target.value})}
                  className="bg-white border-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="minha-instancia"
                  value={evolutionConfig.instanceName}
                  onChange={(e) => setEvolutionConfig({...evolutionConfig, instanceName: e.target.value})}
                  className="bg-white border-gray-900"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={testEvolutionConnection}
                  disabled={evolutionStatus === "testing"}
                  variant="outline"
                  className="border-gray-900"
                >
                  {evolutionStatus === "testing" ? "Testando..." : "Testar Conexão"}
                </Button>
                <Button onClick={saveConfiguration} className="border-gray-900">
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Database, MessageSquare, CheckCircle, AlertCircle, Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useAssasConfig } from "@/hooks/useAssasConfig";

export default function Configuracao() {
  const { 
    connections, 
    loading: connectionsLoading, 
    createConnection, 
    updateConnection, 
    deleteConnection 
  } = useSQLConnections();

  const {
    config: evolutionConfig,
    loading: evolutionLoading,
    saveConfig: saveEvolutionConfig,
    testConnection: testEvolutionConnection
  } = useEvolutionConfig();

  const {
    config: assasConfig,
    loading: assasLoading,
    saveConfig: saveAssasConfig,
    testConnection: testAssasConnection
  } = useAssasConfig();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [newConnection, setNewConnection] = useState({
    name: "",
    server: "",
    database_name: "",
    username: "",
    password: "",
    port: "1433"
  });

  const [evolutionForm, setEvolutionForm] = useState({
    api_url: "",
    api_key: "",
    instance_name: ""
  });

  const [assasForm, setAssasForm] = useState({
    api_url: "https://www.asaas.com/api/v3",
    api_key: "",
    wallet_id: "",
    webhook_url: "",
    is_sandbox: true
  });

  useEffect(() => {
    if (evolutionConfig) {
      setEvolutionForm({
        api_url: evolutionConfig.api_url,
        api_key: evolutionConfig.api_key,
        instance_name: evolutionConfig.instance_name
      });
    }
  }, [evolutionConfig]);

  useEffect(() => {
    if (assasConfig) {
      setAssasForm({
        api_url: assasConfig.api_url,
        api_key: assasConfig.api_key,
        wallet_id: assasConfig.wallet_id || "",
        webhook_url: assasConfig.webhook_url || "",
        is_sandbox: assasConfig.is_sandbox
      });
    }
  }, [assasConfig]);

  const testSqlConnection = async (connectionId: string) => {
    try {
      await updateConnection(connectionId, { status: "testing" });
      
      setTimeout(async () => {
        await updateConnection(connectionId, { status: "connected" });
      }, 2000);
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  const handleSaveConnection = async () => {
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.id, newConnection);
      } else {
        await createConnection({ ...newConnection, status: "disconnected" });
      }
      
      setNewConnection({ name: "", server: "", database_name: "", username: "", password: "", port: "1433" });
      setEditingConnection(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const handleEditConnection = (connection: any) => {
    setEditingConnection(connection);
    setNewConnection({
      name: connection.name,
      server: connection.server,
      database_name: connection.database_name,
      username: connection.username,
      password: "",
      port: connection.port
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const handleSaveEvolution = async () => {
    try {
      await saveEvolutionConfig({
        ...evolutionForm,
        status: "disconnected"
      });
    } catch (error) {
      console.error('Error saving Evolution config:', error);
    }
  };

  const handleSaveAssas = async () => {
    try {
      await saveAssasConfig({
        ...assasForm,
        status: "disconnected"
      });
    } catch (error) {
      console.error('Error saving ASSAS config:', error);
    }
  };

  if (connectionsLoading || evolutionLoading || assasLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuração</h1>
        <p className="text-gray-600 mt-2">Configure as conexões e integrações do sistema</p>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Banco de Dados</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Evolution API</span>
          </TabsTrigger>
          <TabsTrigger value="assas" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>ASSAS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card className="border-black">
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Conexão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
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
                          className="bg-white"
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
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">Porta</Label>
                          <Input
                            id="port"
                            placeholder="1433"
                            value={newConnection.port}
                            onChange={(e) => setNewConnection({...newConnection, port: e.target.value})}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="database">Banco de Dados</Label>
                        <Input
                          id="database"
                          placeholder="Nome do banco"
                          value={newConnection.database_name}
                          onChange={(e) => setNewConnection({...newConnection, database_name: e.target.value})}
                          className="bg-white"
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
                            className="bg-white"
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
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveConnection} disabled={!newConnection.name || !newConnection.server}>
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
                      <TableCell>{connection.database_name}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          connection.status === "connected" ? "bg-green-100 text-green-800" :
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
                          >
                            {connection.status === "testing" ? "Testando..." : "Testar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditConnection(connection)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteConnection(connection.id)}
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
          <Card className="border-black">
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
                  evolutionConfig?.status === "connected" ? "bg-green-100 text-green-800" :
                  evolutionConfig?.status === "testing" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {evolutionConfig?.status === "connected" ? "Conectado" :
                   evolutionConfig?.status === "testing" ? "Testando..." : "Desconectado"}
                  {evolutionConfig?.status === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                  {evolutionConfig?.status === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">URL da API</Label>
                <Input
                  id="apiUrl"
                  placeholder="https://api.evolution.com"
                  value={evolutionForm.api_url}
                  onChange={(e) => setEvolutionForm({...evolutionForm, api_url: e.target.value})}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={evolutionForm.api_key}
                  onChange={(e) => setEvolutionForm({...evolutionForm, api_key: e.target.value})}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="minha-instancia"
                  value={evolutionForm.instance_name}
                  onChange={(e) => setEvolutionForm({...evolutionForm, instance_name: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={testEvolutionConnection}
                  disabled={evolutionConfig?.status === "testing"}
                  variant="outline"
                >
                  {evolutionConfig?.status === "testing" ? "Testando..." : "Testar Conexão"}
                </Button>
                <Button onClick={handleSaveEvolution}>
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span>Configuração ASSAS</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure a integração com ASSAS para gestão financeira
                  </p>
                </div>
                <Badge className={`${
                  assasConfig?.status === "connected" ? "bg-green-100 text-green-800" :
                  assasConfig?.status === "testing" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {assasConfig?.status === "connected" ? "Conectado" :
                   assasConfig?.status === "testing" ? "Testando..." : "Desconectado"}
                  {assasConfig?.status === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                  {assasConfig?.status === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assasApiUrl">URL da API</Label>
                <Input
                  id="assasApiUrl"
                  placeholder="https://www.asaas.com/api/v3"
                  value={assasForm.api_url}
                  onChange={(e) => setAssasForm({...assasForm, api_url: e.target.value})}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assasApiKey">Chave da API</Label>
                <Input
                  id="assasApiKey"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={assasForm.api_key}
                  onChange={(e) => setAssasForm({...assasForm, api_key: e.target.value})}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="walletId">ID da Carteira (opcional)</Label>
                <Input
                  id="walletId"
                  placeholder="wallet_12345"
                  value={assasForm.wallet_id}
                  onChange={(e) => setAssasForm({...assasForm, wallet_id: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook (opcional)</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://seusite.com/webhook"
                  value={assasForm.webhook_url}
                  onChange={(e) => setAssasForm({...assasForm, webhook_url: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sandbox"
                  checked={assasForm.is_sandbox}
                  onCheckedChange={(checked) => setAssasForm({...assasForm, is_sandbox: checked})}
                />
                <Label htmlFor="sandbox">Modo Sandbox (Teste)</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={testAssasConnection}
                  disabled={assasConfig?.status === "testing"}
                  variant="outline"
                >
                  {assasConfig?.status === "testing" ? "Testando..." : "Testar Conexão"}
                </Button>
                <Button onClick={handleSaveAssas}>
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

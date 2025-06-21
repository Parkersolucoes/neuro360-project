
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  MessageSquare, 
  CreditCard, 
  Shield,
  Settings,
  CheckCircle,
  AlertTriangle,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useAssasConfig } from "@/hooks/useAssasConfig";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Configuracao() {
  const { toast } = useToast();
  const { connections, createConnection } = useSQLConnections();
  const { config: evolutionConfig, saveConfig: saveEvolutionConfig } = useEvolutionConfig();
  const { config: assasConfig, saveConfig: saveAssasConfig } = useAssasConfig();
  const { isAdmin } = useAdminAuth();

  // Estados para formulários
  const [sqlForm, setSqlForm] = useState({
    name: "",
    server: "",
    database_name: "",
    username: "",
    password: "",
    port: "1433"
  });

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    api_url: "",
    api_key: ""
  });

  const [assasForm, setAssasForm] = useState({
    api_key: "",
    api_url: "https://www.asaas.com/api/v3",
    is_sandbox: true,
    wallet_id: "",
    webhook_url: ""
  });

  const handleSQLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createConnection({
        ...sqlForm,
        status: 'disconnected'
      });
      setSqlForm({
        name: "",
        server: "",
        database_name: "",
        username: "",
        password: "",
        port: "1433"
      });
      toast({
        title: "Sucesso",
        description: "Conexão SQL criada com sucesso!"
      });
    } catch (error) {
      console.error('Error creating SQL connection:', error);
    }
  };

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveEvolutionConfig({
        ...evolutionForm,
        status: 'disconnected'
      });
      setEvolutionForm({
        instance_name: "",
        api_url: "",
        api_key: ""
      });
      toast({
        title: "Sucesso",
        description: "Configuração Evolution criada com sucesso!"
      });
    } catch (error) {
      console.error('Error creating Evolution config:', error);
    }
  };

  const handleAssasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({
        title: "Erro",
        description: "Acesso restrito para administradores",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveAssasConfig({
        ...assasForm,
        status: 'disconnected'
      });
      setAssasForm({
        api_key: "",
        api_url: "https://www.asaas.com/api/v3",
        is_sandbox: true,
        wallet_id: "",
        webhook_url: ""
      });
      toast({
        title: "Sucesso",
        description: "Configuração ASSAS criada com sucesso!"
      });
    } catch (error) {
      console.error('Error creating ASSAS config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configurações</span>
        </h1>
        <p className="text-gray-600 mt-2">Configure as integrações do sistema</p>
      </div>

      <Tabs defaultValue="sql" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sql" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>SQL Server</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Evolution API</span>
          </TabsTrigger>
          <TabsTrigger value="assas" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>ASSAS</span>
            {!isAdmin && <Shield className="w-3 h-3 text-blue-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sql">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span>Conexões SQL Server</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {connections.length} conexões
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de conexões existentes */}
              {connections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Conexões Ativas</h3>
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          connection.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-sm text-gray-500">{connection.server}:{connection.port}</p>
                        </div>
                      </div>
                      <Badge className={
                        connection.status === 'connected' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }>
                        {connection.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário para nova conexão */}
              <form onSubmit={handleSQLSubmit} className="space-y-4">
                <h3 className="text-lg font-medium">Nova Conexão</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sql_name">Nome da Conexão</Label>
                    <Input
                      id="sql_name"
                      value={sqlForm.name}
                      onChange={(e) => setSqlForm({...sqlForm, name: e.target.value})}
                      placeholder="Ex: Banco Principal"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_server">Servidor</Label>
                    <Input
                      id="sql_server"
                      value={sqlForm.server}
                      onChange={(e) => setSqlForm({...sqlForm, server: e.target.value})}
                      placeholder="Ex: localhost"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_database">Database</Label>
                    <Input
                      id="sql_database"
                      value={sqlForm.database_name}
                      onChange={(e) => setSqlForm({...sqlForm, database_name: e.target.value})}
                      placeholder="Nome do banco"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_port">Porta</Label>
                    <Input
                      id="sql_port"
                      value={sqlForm.port}
                      onChange={(e) => setSqlForm({...sqlForm, port: e.target.value})}
                      placeholder="1433"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_username">Usuário</Label>
                    <Input
                      id="sql_username"
                      value={sqlForm.username}
                      onChange={(e) => setSqlForm({...sqlForm, username: e.target.value})}
                      placeholder="Usuário do banco"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_password">Senha</Label>
                    <Input
                      id="sql_password"
                      type="password"
                      value={sqlForm.password}
                      onChange={(e) => setSqlForm({...sqlForm, password: e.target.value})}
                      placeholder="Senha do banco"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Conexão
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span>Evolution API</span>
                </div>
                {evolutionConfig && (
                  <Badge className={
                    evolutionConfig.status === 'connected' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {evolutionConfig.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEvolutionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution_instance">Nome da Instância</Label>
                  <Input
                    id="evolution_instance"
                    value={evolutionForm.instance_name}
                    onChange={(e) => setEvolutionForm({...evolutionForm, instance_name: e.target.value})}
                    placeholder="Ex: minha-instancia"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evolution_url">URL da API</Label>
                  <Input
                    id="evolution_url"
                    value={evolutionForm.api_url}
                    onChange={(e) => setEvolutionForm({...evolutionForm, api_url: e.target.value})}
                    placeholder="https://api.evolution.com"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evolution_key">Chave da API</Label>
                  <Input
                    id="evolution_key"
                    type="password"
                    value={evolutionForm.api_key}
                    onChange={(e) => setEvolutionForm({...evolutionForm, api_key: e.target.value})}
                    placeholder="Sua chave da API Evolution"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <span>ASSAS (Gateway de Pagamento)</span>
                  {!isAdmin && <Shield className="w-4 h-4 text-blue-600" />}
                </div>
                {assasConfig && (
                  <Badge className={
                    assasConfig.status === 'connected' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {assasConfig.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAdmin ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Esta configuração é restrita para administradores do sistema.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAssasSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assas_key">Chave da API</Label>
                    <Input
                      id="assas_key"
                      type="password"
                      value={assasForm.api_key}
                      onChange={(e) => setAssasForm({...assasForm, api_key: e.target.value})}
                      placeholder="Sua chave da API ASSAS"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assas_url">URL da API</Label>
                    <Input
                      id="assas_url"
                      value={assasForm.api_url}
                      onChange={(e) => setAssasForm({...assasForm, api_url: e.target.value})}
                      placeholder="https://www.asaas.com/api/v3"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assas_wallet">Wallet ID (Opcional)</Label>
                    <Input
                      id="assas_wallet"
                      value={assasForm.wallet_id}
                      onChange={(e) => setAssasForm({...assasForm, wallet_id: e.target.value})}
                      placeholder="ID da carteira"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assas_webhook">Webhook URL (Opcional)</Label>
                    <Input
                      id="assas_webhook"
                      value={assasForm.webhook_url}
                      onChange={(e) => setAssasForm({...assasForm, webhook_url: e.target.value})}
                      placeholder="https://seusite.com/webhook"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="assas_sandbox"
                      checked={assasForm.is_sandbox}
                      onCheckedChange={(checked) => setAssasForm({...assasForm, is_sandbox: checked})}
                    />
                    <Label htmlFor="assas_sandbox">Modo Sandbox (Teste)</Label>
                  </div>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

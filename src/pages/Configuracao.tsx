
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Configuracao() {
  const { toast } = useToast();
  const [sqlConfig, setSqlConfig] = useState({
    server: "",
    database: "",
    username: "",
    password: "",
    port: "1433"
  });

  const [evolutionConfig, setEvolutionConfig] = useState({
    apiUrl: "",
    apiKey: "",
    instanceName: ""
  });

  const [sqlStatus, setSqlStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [evolutionStatus, setEvolutionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");

  const testSqlConnection = async () => {
    setSqlStatus("testing");
    // Simulate API call
    setTimeout(() => {
      setSqlStatus("connected");
      toast({
        title: "Conexão testada",
        description: "Conexão com SQL Server estabelecida com sucesso!",
      });
    }, 2000);
  };

  const testEvolutionConnection = async () => {
    setEvolutionStatus("testing");
    // Simulate API call
    setTimeout(() => {
      setEvolutionStatus("connected");
      toast({
        title: "Conexão testada",
        description: "Conexão com Evolution API estabelecida com sucesso!",
      });
    }, 2000);
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span>Configuração SQL Server</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure a conexão com o banco de dados SQL Server
                  </p>
                </div>
                <Badge className={`${
                  sqlStatus === "connected" ? "status-connected" :
                  sqlStatus === "testing" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {sqlStatus === "connected" ? "Conectado" :
                   sqlStatus === "testing" ? "Testando..." : "Desconectado"}
                  {sqlStatus === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                  {sqlStatus === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server">Servidor</Label>
                  <Input
                    id="server"
                    placeholder="localhost ou IP do servidor"
                    value={sqlConfig.server}
                    onChange={(e) => setSqlConfig({...sqlConfig, server: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    placeholder="1433"
                    value={sqlConfig.port}
                    onChange={(e) => setSqlConfig({...sqlConfig, port: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="database">Banco de Dados</Label>
                <Input
                  id="database"
                  placeholder="Nome do banco de dados"
                  value={sqlConfig.database}
                  onChange={(e) => setSqlConfig({...sqlConfig, database: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    placeholder="sa"
                    value={sqlConfig.username}
                    onChange={(e) => setSqlConfig({...sqlConfig, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={sqlConfig.password}
                    onChange={(e) => setSqlConfig({...sqlConfig, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={testSqlConnection}
                  disabled={sqlStatus === "testing"}
                  variant="outline"
                >
                  {sqlStatus === "testing" ? "Testando..." : "Testar Conexão"}
                </Button>
                <Button onClick={saveConfiguration}>
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card>
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
                  evolutionStatus === "testing" ? "bg-yellow-100 text-yellow-800" :
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="minha-instancia"
                  value={evolutionConfig.instanceName}
                  onChange={(e) => setEvolutionConfig({...evolutionConfig, instanceName: e.target.value})}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={testEvolutionConnection}
                  disabled={evolutionStatus === "testing"}
                  variant="outline"
                >
                  {evolutionStatus === "testing" ? "Testando..." : "Testar Conexão"}
                </Button>
                <Button onClick={saveConfiguration}>
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

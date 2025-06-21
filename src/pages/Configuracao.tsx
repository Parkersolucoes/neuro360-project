
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  MessageSquare, 
  Settings,
  Save,
  Building2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useCompanies } from "@/hooks/useCompanies";

export default function Configuracao() {
  const { toast } = useToast();
  const { connections, createConnection } = useSQLConnections();
  const { config: evolutionConfig, createConfig: createEvolutionConfig, updateConfig: updateEvolutionConfig } = useEvolutionConfig();
  const { currentCompany } = useCompanies();

  // Estados para formulários
  const [sqlForm, setSqlForm] = useState({
    name: "",
    host: "",
    database_name: "",
    username: "",
    password: "",
    port: 5432
  });

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    api_url: "",
    api_key: ""
  });

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name,
        api_url: evolutionConfig.api_url,
        api_key: evolutionConfig.api_key
      });
    } else {
      setEvolutionForm({
        instance_name: "",
        api_url: "",
        api_key: ""
      });
    }
  }, [evolutionConfig]);

  const handleSQLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para configurar as conexões SQL",
        variant: "destructive"
      });
      return;
    }

    try {
      await createConnection({
        ...sqlForm,
        company_id: currentCompany.id,
        connection_type: 'postgresql',
        is_active: true
      });
      setSqlForm({
        name: "",
        host: "",
        database_name: "",
        username: "",
        password: "",
        port: 5432
      });
    } catch (error) {
      console.error('Error creating SQL connection:', error);
    }
  };

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para configurar a Evolution API",
        variant: "destructive"
      });
      return;
    }

    try {
      if (evolutionConfig) {
        // Atualizar configuração existente
        await updateEvolutionConfig(evolutionConfig.id, evolutionForm);
      } else {
        // Criar nova configuração
        await createEvolutionConfig({
          ...evolutionForm,
          company_id: currentCompany.id,
          is_active: true
        });
      }
      
      toast({
        title: "Sucesso",
        description: `Configuração Evolution ${evolutionConfig ? 'atualizada' : 'criada'} com sucesso!`
      });
    } catch (error) {
      console.error('Error saving Evolution config:', error);
    }
  };

  const CompanyAlert = () => (
    <Alert className="mb-6">
      <Building2 className="h-4 w-4" />
      <AlertDescription>
        {currentCompany ? (
          <span>Configurações para: <strong>{currentCompany.name}</strong></span>
        ) : (
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Selecione uma empresa para gerenciar as configurações
          </span>
        )}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configurações</span>
        </h1>
        <p className="text-gray-600 mt-2">Configure as integrações do sistema por empresa</p>
      </div>

      <CompanyAlert />

      <Tabs defaultValue="sql" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sql" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>SQL Server</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Evolution API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sql">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
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
                          connection.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-sm text-gray-500">{connection.host}:{connection.port}</p>
                        </div>
                      </div>
                      <Badge className={
                        connection.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }>
                        {connection.is_active ? 'Ativo' : 'Inativo'}
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
                      disabled={!currentCompany}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_host">Servidor</Label>
                    <Input
                      id="sql_host"
                      value={sqlForm.host}
                      onChange={(e) => setSqlForm({...sqlForm, host: e.target.value})}
                      placeholder="Ex: localhost"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={!currentCompany}
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
                      disabled={!currentCompany}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sql_port">Porta</Label>
                    <Input
                      id="sql_port"
                      type="number"
                      value={sqlForm.port}
                      onChange={(e) => setSqlForm({...sqlForm, port: parseInt(e.target.value) || 5432})}
                      placeholder="5432"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={!currentCompany}
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
                      disabled={!currentCompany}
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
                      disabled={!currentCompany}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!currentCompany}
                >
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
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Evolution API</span>
                </div>
                {evolutionConfig && (
                  <Badge className={
                    evolutionConfig.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {evolutionConfig.is_active ? 'Ativo' : 'Inativo'}
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
                    disabled={!currentCompany}
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
                    disabled={!currentCompany}
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
                    disabled={!currentCompany}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!currentCompany}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {evolutionConfig ? 'Atualizar' : 'Salvar'} Configuração
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

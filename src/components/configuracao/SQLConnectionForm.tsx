
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Edit, Trash2, Save, TestTube, CheckCircle, XCircle } from "lucide-react";
import { SQLConnection, useSQLConnections } from "@/hooks/useSQLConnections";
import { useDemoSQLConnections } from "@/hooks/useDemoSQLConnections";
import { usePlans } from "@/hooks/usePlans";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

interface SQLConnectionFormProps {
  companyId: string;
  connections: SQLConnection[];
}

export function SQLConnectionForm({ companyId, connections }: SQLConnectionFormProps) {
  const { createConnection, updateConnection, deleteConnection, testConnection, testing } = useSQLConnections();
  const { createDemoConnectionsForNewCompanies } = useDemoSQLConnections();
  const { plans } = usePlans();
  const { companies, currentCompany } = useCompanies();
  const { toast } = useToast();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SQLConnection | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionForm, setConnectionForm] = useState({
    name: "",
    host: "",
    port: 1433,
    database_name: "",
    username: "",
    password: "",
    connection_type: "sqlserver"
  });

  const effectiveCompanyId = companyId || currentCompany?.id;
  const company = companies.find(c => c.id === effectiveCompanyId);
  const currentPlan = company?.plan_id ? plans.find(plan => plan.id === company.plan_id) : null;
  const companyConnections = connections.filter(conn => conn.company_id === effectiveCompanyId);
  const canAddConnection = currentPlan ? companyConnections.length < currentPlan.max_sql_connections : false;

  useEffect(() => {
    if (editingConnection) {
      setConnectionForm({
        name: editingConnection.name,
        host: editingConnection.host,
        port: editingConnection.port,
        database_name: editingConnection.database_name,
        username: editingConnection.username,
        password: "",
        connection_type: editingConnection.connection_type
      });
      setIsFormVisible(true);
    } else {
      setConnectionForm({
        name: "",
        host: "",
        port: 1433,
        database_name: "",
        username: "",
        password: "",
        connection_type: "sqlserver"
      });
    }
  }, [editingConnection]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!connectionForm.name.trim()) errors.push("Nome da conexão é obrigatório");
    if (!connectionForm.host.trim()) errors.push("Host/Servidor é obrigatório");
    if (!connectionForm.database_name.trim()) errors.push("Nome do banco é obrigatório");
    if (!connectionForm.username.trim()) errors.push("Usuário é obrigatório");
    if (!connectionForm.password.trim() && !editingConnection) errors.push("Senha é obrigatória");
    if (connectionForm.port <= 0 || connectionForm.port > 65535) errors.push("Porta deve estar entre 1 e 65535");
    
    if (errors.length > 0) {
      toast({
        title: "Dados inválidos",
        description: errors.join(", "),
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!effectiveCompanyId) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }
    
    try {
      const connectionData = {
        name: connectionForm.name.trim(),
        host: connectionForm.host.trim(),
        port: connectionForm.port,
        database_name: connectionForm.database_name.trim(),
        username: connectionForm.username.trim(),
        password_encrypted: connectionForm.password.trim(),
        connection_type: connectionForm.connection_type,
        company_id: effectiveCompanyId,
        status: 'active' as const
      };

      console.log('📝 Salvando conexão SQL com dados validados:', connectionData);

      if (editingConnection) {
        await updateConnection(editingConnection.id, connectionData);
      } else {
        await createConnection(connectionData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving connection:', error);
      // O erro já foi tratado no hook useSQLConnections
    }
  };

  const resetForm = () => {
    setEditingConnection(null);
    setIsFormVisible(false);
    setConnectionForm({
      name: "",
      host: "",
      port: 1433,
      database_name: "",
      username: "",
      password: "",
      connection_type: "sqlserver"
    });
  };

  const handleEdit = (connection: SQLConnection) => {
    setEditingConnection(connection);
  };

  const handleDelete = async (connectionId: string, connectionName: string) => {
    if (confirm(`Tem certeza que deseja excluir a conexão "${connectionName}"?`)) {
      await deleteConnection(connectionId);
    }
  };

  const handleTestConnection = async (connection: SQLConnection) => {
    setTestingConnection(connection.id);
    try {
      await testConnection(connection);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleNewConnection = () => {
    if (!effectiveCompanyId) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa no menu principal antes de criar uma conexão.",
        variant: "destructive"
      });
      return;
    }
    
    if (!canAddConnection) {
      toast({
        title: "Limite atingido",
        description: `O plano ${currentPlan?.name} permite apenas ${currentPlan?.max_sql_connections} conexões.`,
        variant: "destructive"
      });
      return;
    }
    setEditingConnection(null);
    setIsFormVisible(true);
  };

  const handleCreateDemoConnections = async () => {
    try {
      await createDemoConnectionsForNewCompanies();
      toast({
        title: "Sucesso",
        description: "Conexões de demonstração criadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar conexões de demonstração",
        variant: "destructive"
      });
    }
  };

  if (!effectiveCompanyId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Empresa não selecionada</h3>
            <p className="text-gray-500">Selecione uma empresa no menu principal para configurar conexões de banco de dados.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Conexões de Banco de Dados</span>
            </div>
            <div className="flex items-center space-x-3">
              {currentPlan && (
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  {companyConnections.length}/{currentPlan.max_sql_connections} conexões
                </Badge>
              )}
              <Button 
                onClick={handleCreateDemoConnections}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Criar Demo
              </Button>
              <Button 
                onClick={handleNewConnection}
                disabled={!canAddConnection}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conexão
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Lista de Conexões */}
      {companyConnections.length > 0 && (
        <div className="grid gap-4">
          {companyConnections.map((connection) => (
            <Card key={connection.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{connection.name}</h4>
                      <Badge className={connection.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {connection.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {connection.connection_type}
                      </Badge>
                      {connection.name.includes('Demo') && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      <strong>Servidor:</strong> {connection.host}:{connection.port}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Banco:</strong> {connection.database_name} | <strong>Usuário:</strong> {connection.username}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Criado em: {new Date(connection.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTestConnection(connection)}
                      disabled={testingConnection === connection.id}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      {testingConnection === connection.id ? (
                        <div className="w-3 h-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(connection)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDelete(connection.id, connection.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulário de Nova/Editar Conexão */}
      {isFormVisible && (
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>{editingConnection ? 'Editar Conexão' : 'Nova Conexão de Banco de Dados'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="connection_name">Nome da Conexão *</Label>
                  <Input
                    id="connection_name"
                    value={connectionForm.name}
                    onChange={(e) => setConnectionForm({...connectionForm, name: e.target.value})}
                    placeholder="Ex: Banco Principal"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection_type">Tipo de Banco *</Label>
                  <Select 
                    value={connectionForm.connection_type}
                    onValueChange={(value) => setConnectionForm({...connectionForm, connection_type: value})}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqlserver">SQL Server</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="host">Servidor *</Label>
                  <Input
                    id="host"
                    value={connectionForm.host}
                    onChange={(e) => setConnectionForm({...connectionForm, host: e.target.value})}
                    placeholder="servidor.exemplo.com"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Porta *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={connectionForm.port}
                    onChange={(e) => setConnectionForm({...connectionForm, port: parseInt(e.target.value) || 1433})}
                    placeholder="1433"
                    min="1"
                    max="65535"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="database_name">Nome do Banco *</Label>
                <Input
                  id="database_name"
                  value={connectionForm.database_name}
                  onChange={(e) => setConnectionForm({...connectionForm, database_name: e.target.value})}
                  placeholder="nome_do_banco"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário *</Label>
                  <Input
                    id="username"
                    value={connectionForm.username}
                    onChange={(e) => setConnectionForm({...connectionForm, username: e.target.value})}
                    placeholder="usuario"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Senha {editingConnection ? '(deixe em branco para manter a atual)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={connectionForm.password}
                    onChange={(e) => setConnectionForm({...connectionForm, password: e.target.value})}
                    placeholder="********"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required={!editingConnection}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button type="submit" disabled={testing} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {testing ? 'Salvando...' : editingConnection ? 'Atualizar' : 'Salvar'} Conexão
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {companyConnections.length === 0 && !isFormVisible && currentPlan && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma conexão configurada</h3>
            <p className="text-gray-500 mb-6">Configure a primeira conexão de banco de dados para esta empresa.</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleCreateDemoConnections} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <CheckCircle className="w-4 h-4 mr-2" />
                Criar Demonstração
              </Button>
              <Button onClick={handleNewConnection} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira conexão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sem plano configurado */}
      {!currentPlan && (
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Plano não configurado</h3>
            <p className="text-gray-500">A empresa deve ter um plano associado para configurar conexões de banco de dados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

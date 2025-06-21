import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Edit, Trash2, Save } from "lucide-react";
import { SQLConnection, useSQLConnections } from "@/hooks/useSQLConnections";
import { usePlans } from "@/hooks/usePlans";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";

interface SQLConnectionFormProps {
  companyId: string;
  connections: SQLConnection[];
}

export function SQLConnectionForm({ companyId, connections }: SQLConnectionFormProps) {
  const { createConnection, updateConnection, deleteConnection, testing } = useSQLConnections();
  const { plans } = usePlans();
  const { companies, currentCompany } = useCompanies();
  const { toast } = useToast();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SQLConnection | null>(null);
  const [connectionForm, setConnectionForm] = useState({
    name: "",
    host: "",
    port: 1433,
    database_name: "",
    username: "",
    password: "",
    connection_type: "sqlserver"
  });

  // Usar a empresa atual do contexto se não foi passada uma específica
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
        password_encrypted: editingConnection.password,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!effectiveCompanyId) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada. Selecione uma empresa no menu principal.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const connectionData = {
        name: connectionForm.name,
        host: connectionForm.host,
        port: connectionForm.port,
        database_name: connectionForm.database_name,
        username: connectionForm.username,
        password_encrypted: connectionForm.password,
        connection_type: connectionForm.connection_type,
        company_id: effectiveCompanyId,
        status: 'active'
      };

      console.log('Salvando conexão SQL:', connectionData);

      if (editingConnection) {
        await updateConnection(editingConnection.id, connectionData);
      } else {
        await createConnection(connectionData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving connection:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conexão SQL. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
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

  const handleDelete = async (connectionId: string) => {
    if (confirm("Tem certeza que deseja excluir esta conexão?")) {
      await deleteConnection(connectionId);
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

  if (!effectiveCompanyId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Selecione uma empresa no menu principal para configurar conexões SQL.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Conexões SQL Server - {company?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {currentPlan && (
                <Badge variant="outline">
                  {companyConnections.length}/{currentPlan.max_sql_connections} conexões
                </Badge>
              )}
              <Button 
                onClick={handleNewConnection}
                disabled={!canAddConnection}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conexão
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentPlan && (
            <div className="text-center py-8 text-gray-500">
              <p>A empresa deve ter um plano associado para configurar conexões SQL.</p>
            </div>
          )}

          {currentPlan && companyConnections.length === 0 && !isFormVisible && (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma conexão SQL configurada para esta empresa.</p>
              <Button onClick={handleNewConnection} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira conexão
              </Button>
            </div>
          )}

          {companyConnections.length > 0 && (
            <div className="space-y-4">
              {companyConnections.map((connection) => (
                <div key={connection.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{connection.name}</h4>
                      <p className="text-sm text-gray-500">
                        {connection.host}:{connection.port} - {connection.database_name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={connection.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {connection.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant="outline">{connection.connection_type}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(connection)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(connection.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isFormVisible && (
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-4">
                {editingConnection ? 'Editar Conexão' : 'Nova Conexão SQL'}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="connection_name">Nome da Conexão</Label>
                    <Input
                      id="connection_name"
                      value={connectionForm.name}
                      onChange={(e) => setConnectionForm({...connectionForm, name: e.target.value})}
                      placeholder="Ex: Banco Principal"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connection_type">Tipo de Banco</Label>
                    <Select 
                      value={connectionForm.connection_type}
                      onValueChange={(value) => setConnectionForm({...connectionForm, connection_type: value})}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
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
                    <Label htmlFor="host">Servidor</Label>
                    <Input
                      id="host"
                      value={connectionForm.host}
                      onChange={(e) => setConnectionForm({...connectionForm, host: e.target.value})}
                      placeholder="servidor.exemplo.com"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Porta</Label>
                    <Input
                      id="port"
                      type="number"
                      value={connectionForm.port}
                      onChange={(e) => setConnectionForm({...connectionForm, port: parseInt(e.target.value) || 1433})}
                      placeholder="1433"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="database_name">Nome do Banco</Label>
                  <Input
                    id="database_name"
                    value={connectionForm.database_name}
                    onChange={(e) => setConnectionForm({...connectionForm, database_name: e.target.value})}
                    placeholder="nome_do_banco"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      value={connectionForm.username}
                      onChange={(e) => setConnectionForm({...connectionForm, username: e.target.value})}
                      placeholder="usuario"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={connectionForm.password}
                      onChange={(e) => setConnectionForm({...connectionForm, password: e.target.value})}
                      placeholder="********"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={testing}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {testing ? 'Testando...' : editingConnection ? 'Atualizar' : 'Salvar'} Conexão
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

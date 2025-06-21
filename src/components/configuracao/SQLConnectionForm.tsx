
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Save, AlertCircle, Loader2, Edit, Trash2, TestTube } from "lucide-react";
import { useSQLConnections, SQLConnection } from "@/hooks/useSQLConnections";
import { useCompanies } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";

interface SQLConnectionFormProps {
  companyId: string;
  connections: SQLConnection[];
}

export function SQLConnectionForm({ companyId, connections }: SQLConnectionFormProps) {
  const { createConnection, updateConnection, deleteConnection, testing } = useSQLConnections();
  const { currentCompany } = useCompanies();
  const { plans } = usePlans();

  const [sqlForm, setSqlForm] = useState({
    name: "",
    host: "",
    database_name: "",
    username: "",
    password: "",
    port: 5432
  });

  const [editingConnection, setEditingConnection] = useState<SQLConnection | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Buscar plano da empresa atual
  const currentPlan = plans.find(plan => plan.id === currentCompany?.plan_id);
  const maxConnections = currentPlan?.max_sql_connections || 1;
  
  // Filtrar conexões da empresa atual
  const companyConnections = connections.filter(conn => conn.company_id === companyId);
  const isLimitReached = companyConnections.length >= maxConnections;

  const handleSQLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLimitReached && !editingConnection) {
      return;
    }
    
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.id, {
          ...sqlForm,
          updated_at: new Date().toISOString()
        });
        setEditingConnection(null);
      } else {
        await createConnection({
          ...sqlForm,
          company_id: companyId,
          connection_type: 'postgresql',
          is_active: true
        });
      }
      
      setSqlForm({
        name: "",
        host: "",
        database_name: "",
        username: "",
        password: "",
        port: 5432
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving SQL connection:', error);
    }
  };

  const handleEdit = (connection: SQLConnection) => {
    setEditingConnection(connection);
    setSqlForm({
      name: connection.name,
      host: connection.host,
      database_name: connection.database_name,
      username: connection.username,
      password: connection.password,
      port: connection.port
    });
    setShowForm(true);
  };

  const handleDelete = async (connectionId: string) => {
    if (confirm("Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita.")) {
      try {
        await deleteConnection(connectionId);
      } catch (error) {
        console.error('Error deleting connection:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingConnection(null);
    setShowForm(false);
    setSqlForm({
      name: "",
      host: "",
      database_name: "",
      username: "",
      password: "",
      port: 5432
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Conexões SQL Server</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {companyConnections.length}/{maxConnections} conexões
            </Badge>
            {currentPlan && (
              <Badge variant="secondary" className="text-sm">
                Plano {currentPlan.name}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLimitReached && !editingConnection && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Limite de conexões atingido. Seu plano {currentPlan?.name || 'atual'} permite apenas {maxConnections} conexão(ões). 
              Faça upgrade para criar mais conexões.
            </AlertDescription>
          </Alert>
        )}

        {companyConnections.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Conexões Configuradas</h3>
              {!isLimitReached && !showForm && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Nova Conexão
                </Button>
              )}
            </div>
            
            <div className="grid gap-4">
              {companyConnections.map((connection) => (
                <div key={connection.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connection.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{connection.name}</p>
                        <p className="text-sm text-gray-500">{connection.host}:{connection.port}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        connection.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }>
                        {connection.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(connection)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(connection.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Database:</strong> {connection.database_name}</p>
                    <p><strong>Usuário:</strong> {connection.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(showForm || companyConnections.length === 0) && (
          <form onSubmit={handleSQLSubmit} className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {editingConnection ? "Editar Conexão" : "Nova Conexão"}
              </h3>
              {showForm && companyConnections.length > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelForm}
                  size="sm"
                >
                  Cancelar
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sql_name">Nome da Conexão</Label>
                <Input
                  id="sql_name"
                  value={sqlForm.name}
                  onChange={(e) => setSqlForm({...sqlForm, name: e.target.value})}
                  placeholder="Ex: Banco Principal"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={testing}
                  required
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
                  disabled={testing}
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
                  disabled={testing}
                  required
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
                  disabled={testing}
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
                  disabled={testing}
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
                  disabled={testing}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  {editingConnection ? 'Atualizar' : 'Testar e Salvar'} Conexão
                </>
              )}
            </Button>
          </form>
        )}

        {companyConnections.length === 0 && !showForm && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma conexão SQL configurada</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Database className="w-4 h-4 mr-2" />
              Criar Primera Conexão
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


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
        status: 'active' as const
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-600 rounded-t-lg px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Conexões SQL Server</h1>
            <p className="text-blue-100 mt-1">Selecione uma empresa para configurar conexões</p>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg">
            <div className="p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empresa não selecionada</h3>
              <p className="text-gray-500">Selecione uma empresa no menu principal para configurar conexões SQL.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-blue-600 rounded-t-lg px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Conexões SQL Server - {company?.name}</h1>
            <p className="text-blue-100 mt-1">Configure as conexões de banco de dados para esta empresa</p>
          </div>
          <div className="flex items-center space-x-3">
            {currentPlan && (
              <Badge variant="outline" className="bg-white text-blue-600 border-white">
                {companyConnections.length}/{currentPlan.max_sql_connections} conexões
              </Badge>
            )}
            <Button 
              onClick={handleNewConnection}
              disabled={!canAddConnection}
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conexão
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-lg">
          {!currentPlan && (
            <div className="p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Plano não configurado</h3>
              <p className="text-gray-500">A empresa deve ter um plano associado para configurar conexões SQL.</p>
            </div>
          )}

          {currentPlan && companyConnections.length === 0 && !isFormVisible && (
            <div className="p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma conexão configurada</h3>
              <p className="text-gray-500 mb-6">Configure a primeira conexão SQL para esta empresa.</p>
              <Button onClick={handleNewConnection} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira conexão
              </Button>
            </div>
          )}

          {companyConnections.length > 0 && (
            <div className="p-6">
              <div className="space-y-4">
                {companyConnections.map((connection, index) => (
                  <div key={connection.id} className={`border rounded-lg p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{connection.name}</h4>
                        <p className="text-sm text-gray-500">
                          {connection.host}:{connection.port} - {connection.database_name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={connection.status === 'active' ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                            {connection.status === 'active' ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <Badge variant="outline" className="border-gray-300 text-gray-700 bg-gray-50">
                            {connection.connection_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(connection)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDelete(connection.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isFormVisible && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-medium mb-6 text-gray-900">
                  {editingConnection ? 'Editar Conexão' : 'Nova Conexão SQL'}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="connection_name" className="text-gray-700 font-medium">Nome da Conexão *</Label>
                      <Input
                        id="connection_name"
                        value={connectionForm.name}
                        onChange={(e) => setConnectionForm({...connectionForm, name: e.target.value})}
                        placeholder="Ex: Banco Principal"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection_type" className="text-gray-700 font-medium">Tipo de Banco</Label>
                      <Select 
                        value={connectionForm.connection_type}
                        onValueChange={(value) => setConnectionForm({...connectionForm, connection_type: value})}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="sqlserver">SQL Server</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="host" className="text-gray-700 font-medium">Servidor *</Label>
                      <Input
                        id="host"
                        value={connectionForm.host}
                        onChange={(e) => setConnectionForm({...connectionForm, host: e.target.value})}
                        placeholder="servidor.exemplo.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port" className="text-gray-700 font-medium">Porta *</Label>
                      <Input
                        id="port"
                        type="number"
                        value={connectionForm.port}
                        onChange={(e) => setConnectionForm({...connectionForm, port: parseInt(e.target.value) || 1433})}
                        placeholder="1433"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="database_name" className="text-gray-700 font-medium">Nome do Banco *</Label>
                    <Input
                      id="database_name"
                      value={connectionForm.database_name}
                      onChange={(e) => setConnectionForm({...connectionForm, database_name: e.target.value})}
                      placeholder="nome_do_banco"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700 font-medium">Usuário *</Label>
                      <Input
                        id="username"
                        value={connectionForm.username}
                        onChange={(e) => setConnectionForm({...connectionForm, username: e.target.value})}
                        placeholder="usuario"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={connectionForm.password}
                        onChange={(e) => setConnectionForm({...connectionForm, password: e.target.value})}
                        placeholder="********"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={resetForm} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={testing}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-medium"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {testing ? 'Salvando...' : editingConnection ? 'Atualizar' : 'Salvar'} Conexão
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

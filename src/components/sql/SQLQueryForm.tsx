
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, AlertCircle, Database } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useAuth } from "@/hooks/useAuth";

interface SQLQueryFormProps {
  query?: any;
  onSubmit: (queryData: any) => void;
  onCancel: () => void;
}

export function SQLQueryForm({ query, onSubmit, onCancel }: SQLQueryFormProps) {
  const { currentCompany } = useCompanies();
  const { connections } = useSQLConnections();
  const { userLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    query_text: "",
    connection_id: "",
    status: "active" as "active" | "inactive"
  });

  // Filtrar conexões apenas da empresa atual
  const companyConnections = connections?.filter(
    connection => connection.company_id === currentCompany?.id
  ) || [];

  const selectedConnection = companyConnections.find(conn => conn.id === formData.connection_id);

  useEffect(() => {
    if (query) {
      setFormData({
        name: query.name || "",
        description: query.description || "",
        query_text: query.query_text || "",
        connection_id: query.connection_id || "",
        status: query.status || "active"
      });
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany?.id) {
      console.error('No company selected');
      return;
    }

    if (!formData.connection_id) {
      console.error('No connection selected');
      return;
    }

    onSubmit({
      ...formData,
      company_id: currentCompany.id,
      created_by: userLogin?.id
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{query ? 'Editar Consulta SQL' : 'Nova Consulta SQL'}</CardTitle>
      </CardHeader>
      <CardContent>
        {!currentCompany && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selecione uma empresa no menu lateral para criar consultas SQL.
            </AlertDescription>
          </Alert>
        )}

        {currentCompany && companyConnections.length === 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure pelo menos uma conexão SQL na empresa "{currentCompany.name}" antes de criar consultas.
              Acesse: Empresas &gt; Configurações &gt; SQL Server
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Consulta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Relatório de Vendas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection">Conexão de Banco de Dados *</Label>
            <Select 
              value={formData.connection_id} 
              onValueChange={(value) => setFormData({...formData, connection_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione qual conexão utilizar" />
              </SelectTrigger>
              <SelectContent>
                {companyConnections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">{connection.name}</span>
                        <span className="text-xs text-gray-500">{connection.host}:{connection.port} - {connection.database_name}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedConnection && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Conexão Selecionada:</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p><strong>{selectedConnection.name}</strong></p>
                  <p>Servidor: {selectedConnection.host}:{selectedConnection.port}</p>
                  <p>Database: {selectedConnection.database_name}</p>
                  <p>Usuário: {selectedConnection.username}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do que a consulta faz"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query_text">Consulta SQL *</Label>
            <Textarea
              id="query_text"
              value={formData.query_text}
              onChange={(e) => setFormData({...formData, query_text: e.target.value})}
              placeholder="SELECT * FROM tabela WHERE..."
              className="min-h-[200px] font-mono"
              required
            />
            <p className="text-xs text-gray-500">
              Dica: Use consultas SELECT para visualizar dados. Evite comandos que modifiquem dados (INSERT, UPDATE, DELETE).
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!currentCompany || companyConnections.length === 0 || !formData.name || !formData.query_text || !formData.connection_id}
            >
              <Save className="w-4 h-4 mr-2" />
              {query ? 'Atualizar' : 'Salvar'} Consulta
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

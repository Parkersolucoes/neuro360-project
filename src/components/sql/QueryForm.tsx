
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Database } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useToast } from "@/hooks/use-toast";
import { SQLQuery } from "@/types/sqlQuery";

interface QueryFormProps {
  query?: SQLQuery | null;
  onSubmit: (query: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function QueryForm({ query, onSubmit, onCancel }: QueryFormProps) {
  const { currentCompany } = useCompanies();
  const { connections } = useSQLConnections();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: query?.name || "",
    description: query?.description || "",
    query_text: query?.query_text || "",
    connection_id: query?.connection_id || "",
    status: query?.status || 'pending' as const
  });

  // Filtrar conexões apenas da empresa atual
  const companyConnections = connections?.filter(
    connection => connection.company_id === currentCompany?.id
  ) || [];

  const selectedConnection = companyConnections.find(conn => conn.id === formData.connection_id);

  const handleSubmit = async () => {
    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para criar consultas",
        variant: "destructive"
      });
      return;
    }

    if (!formData.connection_id) {
      toast({
        title: "Erro",
        description: "Selecione uma conexão de banco de dados",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        query_text: formData.query_text,
        connection_id: formData.connection_id,
        status: formData.status
      });
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  const isButtonDisabled = !currentCompany || companyConnections.length === 0;

  return (
    <div className="space-y-4">
      {!currentCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma empresa no menu lateral para criar consultas SQL.
          </AlertDescription>
        </Alert>
      )}

      {currentCompany && companyConnections.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure pelo menos uma conexão SQL na empresa "{currentCompany.name}" antes de criar consultas.
            Acesse: Empresas &gt; Configurações &gt; SQL Server
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Consulta</Label>
          <Input
            id="name"
            placeholder="Nome descritivo para a consulta"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="connection">Conexão de Banco de Dados</Label>
          <Select value={formData.connection_id} onValueChange={(value) => setFormData({...formData, connection_id: value})}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
            placeholder="Descrição do que a consulta faz"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="query">Consulta SQL</Label>
          <Textarea
            id="query"
            placeholder="SELECT * FROM tabela WHERE..."
            className="min-h-32 font-mono text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={formData.query_text}
            onChange={(e) => setFormData({...formData, query_text: e.target.value})}
          />
          <p className="text-xs text-gray-500">
            Dica: Use consultas SELECT para visualizar dados. Evite comandos que modifiquem dados (INSERT, UPDATE, DELETE).
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.name || !formData.query_text || !formData.connection_id || isButtonDisabled}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {query ? "Atualizar" : "Salvar"} Consulta
        </Button>
      </div>
    </div>
  );
}

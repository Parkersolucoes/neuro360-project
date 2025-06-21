
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

  const handleSubmit = async () => {
    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para criar consultas",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(formData);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder="Nome da consulta"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="connection">Conexão</Label>
          <Select value={formData.connection_id} onValueChange={(value) => setFormData({...formData, connection_id: value})}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione a conexão" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {companyConnections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  {connection.name} ({connection.host})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Descrição da consulta"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="query">Consulta SQL</Label>
        <Textarea
          id="query"
          placeholder="SELECT * FROM tabela WHERE..."
          className="min-h-32 bg-white font-mono"
          value={formData.query_text}
          onChange={(e) => setFormData({...formData, query_text: e.target.value})}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.name || !formData.query_text || !formData.connection_id || isButtonDisabled}
        >
          {query ? "Atualizar" : "Salvar"} Consulta
        </Button>
      </div>
    </div>
  );
}

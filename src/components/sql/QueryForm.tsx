
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import { SQLConnection } from "@/hooks/useSQLConnections";
import { useCompanies } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";
import { useToast } from "@/hooks/use-toast";
import { SQLQuery } from "@/types/sqlQuery";

interface QueryFormProps {
  connections: SQLConnection[];
  queries: SQLQuery[];
  onSaveQuery: (query: {
    name: string;
    description: string;
    query_text: string;
    connection_id: string;
  }) => Promise<void>;
}

export function QueryForm({ connections, queries, onSaveQuery }: QueryFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentCompany } = useCompanies();
  const { plans } = usePlans();
  const { toast } = useToast();
  
  const [newQuery, setNewQuery] = useState({
    name: "",
    description: "",
    query_text: "",
    connection_id: ""
  });

  // Filtrar conexões apenas da empresa atual
  const companyConnections = connections.filter(
    connection => connection.company_id === currentCompany?.id
  );

  // Verificar limite de consultas baseado no plano da empresa
  const checkQueryLimit = () => {
    if (!currentCompany) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para criar consultas",
        variant: "destructive"
      });
      return false;
    }

    // Buscar plano da empresa atual
    const currentPlan = plans.find(plan => plan.id === currentCompany.plan_id);
    const maxQueries = currentPlan?.max_sql_queries || 1;
    
    // Contar consultas da empresa atual (já filtradas)
    const companyQueries = queries.length;

    if (companyQueries >= maxQueries) {
      toast({
        title: "Limite atingido",
        description: `Seu plano ${currentPlan?.name || 'atual'} permite apenas ${maxQueries} consulta(s). Faça upgrade para criar mais consultas.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSaveQuery = async () => {
    if (!checkQueryLimit()) return;

    try {
      await onSaveQuery(newQuery);
      setNewQuery({ name: "", description: "", query_text: "", connection_id: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  const isButtonDisabled = !currentCompany || companyConnections.length === 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isButtonDisabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Nova Consulta SQL</DialogTitle>
        </DialogHeader>
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
                Acesse: Empresas > Configurações > SQL Server
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome da consulta"
                value={newQuery.name}
                onChange={(e) => setNewQuery({...newQuery, name: e.target.value})}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection">Conexão</Label>
              <Select value={newQuery.connection_id} onValueChange={(value) => setNewQuery({...newQuery, connection_id: value})}>
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
              value={newQuery.description}
              onChange={(e) => setNewQuery({...newQuery, description: e.target.value})}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="query">Consulta SQL</Label>
            <Textarea
              id="query"
              placeholder="SELECT * FROM tabela WHERE..."
              className="min-h-32 bg-white font-mono"
              value={newQuery.query_text}
              onChange={(e) => setNewQuery({...newQuery, query_text: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveQuery} 
              disabled={!newQuery.name || !newQuery.query_text || !newQuery.connection_id}
            >
              Salvar Consulta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

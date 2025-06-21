
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Plus, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QueryForm } from "@/components/sql/QueryForm";
import { QueryList } from "@/components/sql/QueryList";
import { QueryDetails } from "@/components/sql/QueryDetails";
import { useSQLQueries } from "@/hooks/useSQLQueries";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useCompanies } from "@/hooks/useCompanies";
import { SQLQuery } from "@/types/sqlQuery";

export default function ConsultasSQL() {
  const { queries, createQuery, updateQuery, deleteQuery, loading, validatePlanLimits, currentPlan } = useSQLQueries();
  const { connections } = useSQLConnections();
  const { currentCompany } = useCompanies();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<SQLQuery | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<SQLQuery | null>(null);

  const queriesCount = queries.length;
  const maxQueries = currentPlan?.max_sql_queries || 0;
  const connectionsCount = connections?.filter(conn => conn.company_id === currentCompany?.id).length || 0;
  const maxConnections = currentPlan?.max_sql_connections || 0;

  const handleCreateQuery = async (queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createQuery(queryData);
      setIsFormDialogOpen(false);
      setEditingQuery(null);
    } catch (error) {
      console.error('Error creating query:', error);
    }
  };

  const handleUpdateQuery = async (queryData: Omit<SQLQuery, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingQuery) return;
    
    try {
      await updateQuery(editingQuery.id, queryData);
      setIsFormDialogOpen(false);
      setEditingQuery(null);
    } catch (error) {
      console.error('Error updating query:', error);
    }
  };

  const handleEditQuery = (query: SQLQuery) => {
    setEditingQuery(query);
    setIsFormDialogOpen(true);
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta consulta?")) {
      try {
        await deleteQuery(queryId);
      } catch (error) {
        console.error('Error deleting query:', error);
      }
    }
  };

  const handleViewQuery = (query: SQLQuery) => {
    setSelectedQuery(query);
    setIsDetailsDialogOpen(true);
  };

  const handleNewQueryClick = () => {
    if (validatePlanLimits()) {
      setEditingQuery(null);
      setIsFormDialogOpen(true);
    }
  };

  const resetForm = () => {
    setEditingQuery(null);
    setIsFormDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas SQL</h1>
          <p className="text-gray-600 mt-2">Gerencie suas consultas SQL salvas</p>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNewQueryClick}
              disabled={!currentCompany || !currentPlan || queriesCount >= maxQueries}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta SQL
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuery ? "Editar Consulta SQL" : "Nova Consulta SQL"}
              </DialogTitle>
            </DialogHeader>
            <QueryForm
              query={editingQuery}
              onSubmit={editingQuery ? handleUpdateQuery : handleCreateQuery}
              onCancel={resetForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!currentCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma empresa no menu lateral para gerenciar consultas SQL.
          </AlertDescription>
        </Alert>
      )}

      {currentCompany && !currentPlan && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A empresa "{currentCompany.name}" deve ter um plano associado para criar consultas SQL.
            Configure um plano em: Empresas &gt; Editar Empresa
          </AlertDescription>
        </Alert>
      )}

      {/* Linha discreta com informações do plano */}
      {currentCompany && currentPlan && (
        <div className="flex items-center justify-between text-sm bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700">
          <span className="font-medium text-yellow-400">Plano: {currentPlan.name}</span>
          <div className="flex items-center space-x-6">
            <span>
              Conexões: <span className={connectionsCount >= maxConnections ? "text-red-400 font-medium" : "text-white"}>{connectionsCount}/{maxConnections}</span>
            </span>
            <span>
              Consultas: <span className={queriesCount >= maxQueries ? "text-red-400 font-medium" : "text-white"}>{queriesCount}/{maxQueries}</span>
            </span>
            {(queriesCount >= maxQueries || connectionsCount >= maxConnections) && (
              <Badge variant="destructive" className="text-xs">
                Limite atingido
              </Badge>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Consultas Salvas ({queriesCount})</span>
            {currentPlan && (
              <Badge variant="outline" className="ml-auto">
                {queriesCount}/{maxQueries} usadas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryList
            queries={queries}
            onEdit={handleEditQuery}
            onDelete={handleDeleteQuery}
            onView={handleViewQuery}
          />
        </CardContent>
      </Card>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Detalhes da Consulta</span>
            </DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <QueryDetails
              queryId={selectedQuery.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

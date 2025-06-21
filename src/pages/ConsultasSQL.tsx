
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Plus, Search, AlertCircle, Zap, Building2, Package } from "lucide-react";
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

      {/* Informações da Empresa e Plano */}
      {currentCompany && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Empresa Selecionada</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{currentCompany.name}</p>
                <p className="text-sm text-gray-600">{currentCompany.document}</p>
                <Badge className={
                  currentCompany.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : currentCompany.status === "inactive"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }>
                  {currentCompany.status === "active" ? "Ativa" : 
                   currentCompany.status === "inactive" ? "Inativa" : "Suspensa"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {currentPlan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>Plano Atual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{currentPlan.name}</span>
                    <span className="text-sm font-medium text-green-600">
                      R$ {currentPlan.price.toFixed(2)}/mês
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Conexões SQL:</span>
                      <span className={connectionsCount >= maxConnections ? "text-red-600 font-medium" : "text-gray-900"}>
                        {connectionsCount}/{maxConnections}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Consultas SQL:</span>
                      <span className={queriesCount >= maxQueries ? "text-red-600 font-medium" : "text-gray-900"}>
                        {queriesCount}/{maxQueries}
                      </span>
                    </div>
                  </div>
                  
                  {(queriesCount >= maxQueries || connectionsCount >= maxConnections) && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-700">
                        Limite{queriesCount >= maxQueries && connectionsCount >= maxConnections ? "s atingido" : " atingido"}. 
                        Faça upgrade do plano para continuar.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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

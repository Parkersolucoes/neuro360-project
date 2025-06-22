
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SQLQueryForm } from "@/components/sql/SQLQueryForm";
import { SQLQueryList } from "@/components/sql/SQLQueryList";
import { useSQLQueriesNew } from "@/hooks/useSQLQueriesNew";
import { useCompanies } from "@/hooks/useCompanies";

export default function ConsultasSQL() {
  const { queries, createQuery, updateQuery, deleteQuery, loading } = useSQLQueriesNew();
  const { currentCompany } = useCompanies();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<any>(null);

  const handleCreateQuery = async (queryData: any) => {
    try {
      await createQuery(queryData);
      setIsFormDialogOpen(false);
      setEditingQuery(null);
    } catch (error) {
      console.error('Error creating query:', error);
    }
  };

  const handleUpdateQuery = async (queryData: any) => {
    if (!editingQuery) return;
    
    try {
      await updateQuery(editingQuery.id, queryData);
      setIsFormDialogOpen(false);
      setEditingQuery(null);
    } catch (error) {
      console.error('Error updating query:', error);
    }
  };

  const handleEditQuery = (query: any) => {
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

  const handleExecuteQuery = (query: any) => {
    console.log('Executar consulta:', query);
    // TODO: Implementar execução de consulta
  };

  const handleNewQueryClick = () => {
    setEditingQuery(null);
    setIsFormDialogOpen(true);
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
              disabled={!currentCompany}
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
            <SQLQueryForm
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Consultas Salvas ({queries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SQLQueryList
            queries={queries}
            onEdit={handleEditQuery}
            onDelete={handleDeleteQuery}
            onExecute={handleExecuteQuery}
          />
        </CardContent>
      </Card>
    </div>
  );
}

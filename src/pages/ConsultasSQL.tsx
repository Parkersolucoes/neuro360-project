
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Database, TestTube } from "lucide-react";
import { useSQLQueriesNew } from "@/hooks/useSQLQueriesNew";
import { SQLQueryForm } from "@/components/sql/SQLQueryForm";
import { SQLQueryList } from "@/components/sql/SQLQueryList";
import { useCompanies } from "@/hooks/useCompanies";

export default function ConsultasSQL() {
  const { queries, loading, createQuery, updateQuery, deleteQuery, createTestRecord } = useSQLQueriesNew();
  const { currentCompany } = useCompanies();
  const [showForm, setShowForm] = useState(false);
  const [editingQuery, setEditingQuery] = useState<any>(null);

  const handleCreateQuery = async (queryData: any) => {
    try {
      await createQuery(queryData);
      setShowForm(false);
      setEditingQuery(null);
    } catch (error) {
      console.error('Error creating query:', error);
    }
  };

  const handleUpdateQuery = async (queryData: any) => {
    try {
      if (editingQuery?.id) {
        await updateQuery(editingQuery.id, queryData);
        setShowForm(false);
        setEditingQuery(null);
      }
    } catch (error) {
      console.error('Error updating query:', error);
    }
  };

  const handleEdit = (query: any) => {
    setEditingQuery(query);
    setShowForm(true);
  };

  const handleDelete = async (queryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta consulta SQL?")) {
      await deleteQuery(queryId);
    }
  };

  const handleExecute = (query: any) => {
    console.log('Executar consulta:', query);
    // TODO: Implementar execução de consulta
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuery(null);
  };

  const handleNewQuery = () => {
    setEditingQuery(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando consultas SQL...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingQuery ? 'Editar Consulta SQL' : 'Nova Consulta SQL'}
            </h1>
            <p className="text-gray-600 mt-2">
              {editingQuery ? 'Edite os dados da consulta SQL' : 'Crie uma nova consulta SQL'}
            </p>
          </div>
        </div>

        <SQLQueryForm
          query={editingQuery}
          onSubmit={editingQuery ? handleUpdateQuery : handleCreateQuery}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas SQL</h1>
          <p className="text-gray-600 mt-2">Gerencie suas consultas de banco de dados</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={createTestRecord}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Criar Teste
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleNewQuery}
            disabled={!currentCompany}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Lista de Consultas SQL</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SQLQueryList
            queries={queries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onExecute={handleExecute}
          />
        </CardContent>
      </Card>
    </div>
  );
}

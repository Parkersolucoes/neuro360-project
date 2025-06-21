
import { useState } from "react";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useSQLQueries, SQLQuery } from "@/hooks/useSQLQueries";
import { useQueryExecution } from "@/hooks/useQueryExecution";
import { QueryForm } from "@/components/sql/QueryForm";
import { QueryList } from "@/components/sql/QueryList";
import { QueryDetails } from "@/components/sql/QueryDetails";
import { QueryResultTable } from "@/components/sql/QueryResultTable";

export default function ConsultasSQL() {
  const { connections } = useSQLConnections();
  const { queries, createQuery, updateQuery, deleteQuery } = useSQLQueries();
  const { queryResult, isExecuting, executeQuery } = useQueryExecution();
  
  const [selectedQuery, setSelectedQuery] = useState<SQLQuery | null>(null);

  const handleSaveQuery = async (queryData: {
    name: string;
    description: string;
    query_text: string;
    connection_id: string;
  }) => {
    await createQuery({
      ...queryData,
      status: "pending"
    });
  };

  const handleExecuteQuery = async (queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    await executeQuery(query.query_text, updateQuery, queryId);
  };

  const handleTestSelectedQuery = async () => {
    if (!selectedQuery) return;
    await handleExecuteQuery(selectedQuery.id);
  };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      await deleteQuery(queryId);
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas SQL</h1>
          <p className="text-gray-600 mt-2">Gerencie suas consultas e visualize os resultados em tabelas organizadas</p>
        </div>
        <QueryForm 
          connections={connections}
          queries={queries}
          onSaveQuery={handleSaveQuery}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueryList
          queries={queries}
          selectedQuery={selectedQuery}
          onSelectQuery={setSelectedQuery}
          onExecuteQuery={handleExecuteQuery}
          onDeleteQuery={handleDeleteQuery}
        />

        <QueryDetails
          selectedQuery={selectedQuery}
          onTestQuery={handleTestSelectedQuery}
          isExecuting={isExecuting}
        />
      </div>

      {(queryResult || isExecuting) && (
        <QueryResultTable 
          data={queryResult?.data || []}
          columns={queryResult?.columns || []}
          isLoading={isExecuting}
          status={queryResult?.status}
          executionTime={queryResult?.executionTime}
          errorMessage={queryResult?.errorMessage}
        />
      )}
    </div>
  );
}

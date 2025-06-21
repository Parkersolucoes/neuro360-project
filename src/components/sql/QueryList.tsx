
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { SQLQuery } from "@/types/sqlQuery";

interface QueryListProps {
  queries: SQLQuery[];
  onEdit: (query: SQLQuery) => void;
  onDelete: (queryId: string) => Promise<void>;
  onView: (query: SQLQuery) => void;
}

export function QueryList({ 
  queries, 
  onEdit, 
  onDelete, 
  onView 
}: QueryListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-blue-600" />;
    }
  };

  if (queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Database className="w-16 h-16 mb-4 text-gray-300" />
        <p>Nenhuma consulta SQL cadastrada</p>
        <p className="text-sm">Clique em "Nova Consulta SQL" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queries.map((query) => (
        <div
          key={query.id}
          className="p-4 border rounded-lg transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900">{query.name}</h3>
                {getStatusIcon(query.status || 'pending')}
              </div>
              <p className="text-sm text-gray-600 mb-2">{query.description}</p>
              <p className="text-xs text-gray-500">
                Conexão: {query.sql_connections?.name || 'Não definida'}
              </p>
              {query.updated_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Atualizado em: {new Date(query.updated_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <Badge className={
              query.status === "success" ? "bg-green-100 text-green-800" :
              query.status === "error" ? "bg-red-100 text-red-800" :
              "bg-blue-100 text-blue-800"
            }>
              {query.status === "success" ? "Sucesso" :
               query.status === "error" ? "Erro" : "Pendente"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(query)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(query)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(query.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

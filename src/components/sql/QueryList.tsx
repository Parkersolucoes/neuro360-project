
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, Server } from "lucide-react";
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
        <p className="text-lg font-medium mb-2">Nenhuma consulta SQL cadastrada</p>
        <p className="text-sm">Clique em "Nova Consulta SQL" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queries.map((query) => (
        <div
          key={query.id}
          className="p-6 border rounded-lg transition-all hover:shadow-md bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{query.name}</h3>
                {getStatusIcon(query.status || 'pending')}
              </div>
              
              {query.description && (
                <p className="text-gray-600 mb-3">{query.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Conexão:</span>
                  <span className="text-blue-600">{query.sql_connections?.name || 'Não definida'}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Preview da Consulta:</span>
                </div>
                <code className="text-xs text-gray-600 font-mono block whitespace-pre-wrap">
                  {query.query_text.length > 150 
                    ? `${query.query_text.substring(0, 150)}...` 
                    : query.query_text
                  }
                </code>
              </div>
              
              {query.updated_at && (
                <p className="text-xs text-gray-500">
                  Última atualização: {new Date(query.updated_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-3 ml-4">
              <Badge className={
                query.status === "success" ? "bg-green-100 text-green-800" :
                query.status === "error" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }>
                {query.status === "success" ? "Sucesso" :
                 query.status === "error" ? "Erro" : "Pendente"}
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(query)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(query)}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
          </div>
        </div>
      ))}
    </div>
  );
}

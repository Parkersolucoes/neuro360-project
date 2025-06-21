
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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {queries.map((query) => (
        <Card key={query.id} className="h-full flex flex-col transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                {query.name}
              </CardTitle>
              <div className="flex items-center space-x-1 ml-2">
                {getStatusIcon(query.status || 'pending')}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 flex-1 flex flex-col">
            {query.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{query.description}</p>
            )}
            
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
              <Server className="w-3 h-3 text-blue-600" />
              <span className="font-medium">Conexão:</span>
              <span className="text-blue-600 truncate">
                {query.sql_connections?.name || 'Não definida'}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Preview:</span>
              </div>
              <code className="text-xs text-gray-600 font-mono block whitespace-pre-wrap line-clamp-3">
                {query.query_text.length > 100 
                  ? `${query.query_text.substring(0, 100)}...` 
                  : query.query_text
                }
              </code>
            </div>
            
            <div className="space-y-3">
              <Badge 
                variant="secondary"
                className={
                  query.status === "success" ? "bg-green-100 text-green-800 border-green-200" :
                  query.status === "error" ? "bg-red-100 text-red-800 border-red-200" :
                  "bg-blue-100 text-blue-800 border-blue-200"
                }
              >
                {query.status === "success" ? "Sucesso" :
                 query.status === "error" ? "Erro" : "Pendente"}
              </Badge>
              
              <div className="flex items-center justify-between space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(query)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1"
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
                  <Edit className="w-3 h-3" />
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
              
              {query.updated_at && (
                <p className="text-xs text-gray-500 text-center">
                  Atualizado: {new Date(query.updated_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

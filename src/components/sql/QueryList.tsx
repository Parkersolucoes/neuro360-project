
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
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Database className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-base font-medium mb-1">Nenhuma consulta SQL cadastrada</p>
        <p className="text-sm">Clique em "Nova Consulta SQL" para começar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {queries.map((query) => (
        <Card key={query.id} className="h-auto transition-all hover:shadow-md border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                {query.name}
              </CardTitle>
              <div className="flex items-center space-x-1 ml-2">
                {getStatusIcon(query.status || 'pending')}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {query.description && (
              <p className="text-gray-600 text-xs line-clamp-2">{query.description}</p>
            )}
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Server className="w-3 h-3 text-blue-600" />
              <span className="truncate">
                {query.sql_connections?.name || 'Não definida'}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex items-center space-x-1 mb-1">
                <Database className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">SQL:</span>
              </div>
              <code className="text-xs text-gray-600 font-mono block whitespace-pre-wrap line-clamp-2">
                {query.query_text.length > 60 
                  ? `${query.query_text.substring(0, 60)}...` 
                  : query.query_text
                }
              </code>
            </div>
            
            <Badge 
              variant="secondary"
              className={`text-xs ${
                query.status === "success" ? "bg-green-100 text-green-800 border-green-200" :
                query.status === "error" ? "bg-red-100 text-red-800 border-red-200" :
                "bg-blue-100 text-blue-800 border-blue-200"
              }`}
            >
              {query.status === "success" ? "Sucesso" :
               query.status === "error" ? "Erro" : "Pendente"}
            </Badge>
            
            <div className="flex items-center justify-between space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(query)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 text-xs h-7"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(query)}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-7 px-2"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                onClick={() => onDelete(query.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            {query.updated_at && (
              <p className="text-xs text-gray-500 text-center">
                {new Date(query.updated_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

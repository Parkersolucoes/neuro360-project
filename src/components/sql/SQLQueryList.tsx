
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Edit, Trash2, Play, Server } from "lucide-react";

interface SQLQuery {
  id: string;
  name: string;
  description?: string;
  query_text: string;
  status: 'active' | 'inactive';
  created_at: string;
  sql_connections?: {
    name: string;
    host: string;
    port: number;
    database_name: string;
  };
}

interface SQLQueryListProps {
  queries: SQLQuery[];
  onEdit: (query: SQLQuery) => void;
  onDelete: (queryId: string) => void;
  onExecute: (query: SQLQuery) => void;
}

export function SQLQueryList({ queries, onEdit, onDelete, onExecute }: SQLQueryListProps) {
  if (queries.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Nenhuma consulta SQL encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queries.map((query) => (
        <Card key={query.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">{query.name}</h4>
                  <Badge className={query.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {query.status === 'active' ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                
                {query.description && (
                  <p className="text-sm text-gray-600 mb-2">{query.description}</p>
                )}
                
                {query.sql_connections && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <Server className="w-3 h-3 text-blue-600" />
                    <span>Conexão: {query.sql_connections.name} ({query.sql_connections.host}:{query.sql_connections.port} - {query.sql_connections.database_name})</span>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-md p-2 mb-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">SQL:</div>
                  <code className="text-xs text-gray-600 font-mono block">
                    {query.query_text.length > 100 
                      ? `${query.query_text.substring(0, 100)}...` 
                      : query.query_text
                    }
                  </code>
                </div>
                
                <p className="text-xs text-gray-400">
                  Criada em: {new Date(query.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onExecute(query)}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Play className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(query)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => onDelete(query.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

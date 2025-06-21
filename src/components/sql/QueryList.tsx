
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, Clock, Eye, Play, Trash2 } from "lucide-react";
import { SQLQuery } from "@/types/sqlQuery";

interface QueryListProps {
  queries: SQLQuery[];
  selectedQuery: SQLQuery | null;
  onSelectQuery: (query: SQLQuery) => void;
  onExecuteQuery: (queryId: string) => void;
  onDeleteQuery: (queryId: string) => void;
}

export function QueryList({ 
  queries, 
  selectedQuery, 
  onSelectQuery, 
  onExecuteQuery, 
  onDeleteQuery 
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

  return (
    <Card className="border-black">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-500" />
          <span>Consultas Salvas</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Lista de todas as consultas SQL configuradas</p>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {queries.map((query) => (
          <div
            key={query.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md border-black ${
              selectedQuery?.id === query.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onSelectQuery(query)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{query.name}</h3>
                  {getStatusIcon(query.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{query.description}</p>
                <p className="text-xs text-gray-500">
                  Conexão: {query.sql_connections?.name}
                </p>
                {query.last_execution && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última execução: {new Date(query.last_execution).toLocaleString('pt-BR')}
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
                className="border-black"
                onClick={(e) => {
                  e.stopPropagation();
                  onExecuteQuery(query.id);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-800 text-white hover:bg-gray-900 border-black"
                onClick={(e) => {
                  e.stopPropagation();
                  onExecuteQuery(query.id);
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Testar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-black"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuery(query.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

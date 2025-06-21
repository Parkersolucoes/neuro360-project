
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { SQLQuery } from "@/types/sqlQuery";
import { useSQLQueries } from "@/hooks/useSQLQueries";

interface QueryDetailsProps {
  queryId: string;
}

export function QueryDetails({ queryId }: QueryDetailsProps) {
  const { queries } = useSQLQueries();
  const [selectedQuery, setSelectedQuery] = useState<SQLQuery | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const query = queries.find(q => q.id === queryId);
    setSelectedQuery(query || null);
  }, [queryId, queries]);

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

  const handleTestQuery = async () => {
    if (!selectedQuery) return;
    
    setIsExecuting(true);
    try {
      // Aqui seria implementada a lógica de teste da consulta
      console.log('Testing query:', selectedQuery.query_text);
      // Simular execução
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error testing query:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedQuery ? (
        <>
          <div>
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <span>{selectedQuery.name}</span>
              {getStatusIcon(selectedQuery.status || 'pending')}
            </h3>
            <p className="text-sm text-gray-600">{selectedQuery.description}</p>
          </div>
          <div className="space-y-2">
            <Label>Consulta SQL</Label>
            <Textarea
              value={selectedQuery.query_text}
              readOnly
              className="min-h-32 bg-gray-50 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Conexão</Label>
            <Input 
              value={selectedQuery.sql_connections?.name || 'Não definida'} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleTestQuery} 
              className="flex-1"
              disabled={isExecuting}
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? "Executando..." : "Testar Consulta"}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Database className="w-16 h-16 mb-4 text-gray-300" />
          <p>Consulta não encontrada</p>
        </div>
      )}
    </div>
  );
}

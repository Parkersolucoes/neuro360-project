
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { SQLQuery } from "@/hooks/useSQLQueries";

interface QueryDetailsProps {
  selectedQuery: SQLQuery | null;
  onTestQuery: () => void;
  isExecuting: boolean;
}

export function QueryDetails({ selectedQuery, onTestQuery, isExecuting }: QueryDetailsProps) {
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
        <CardTitle>Selecione uma Consulta</CardTitle>
        <p className="text-sm text-gray-600">Visualize e teste a consulta selecionada</p>
      </CardHeader>
      <CardContent>
        {selectedQuery ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <span>{selectedQuery.name}</span>
                {getStatusIcon(selectedQuery.status)}
              </h3>
              <p className="text-sm text-gray-600">{selectedQuery.description}</p>
            </div>
            <div className="space-y-2">
              <Label>Consulta SQL</Label>
              <Textarea
                value={selectedQuery.query_text}
                readOnly
                className="min-h-32 bg-gray-50 border-black font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Conexão</Label>
              <Input value={selectedQuery.sql_connections?.name} readOnly className="bg-gray-50 border-black" />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={onTestQuery} 
                className="flex-1 border-black"
                disabled={isExecuting}
              >
                <Play className="w-4 h-4 mr-2" />
                {isExecuting ? "Executando..." : "Testar Consulta"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Database className="w-16 h-16 mb-4 text-gray-300" />
            <p>Selecione uma consulta para visualizar os detalhes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

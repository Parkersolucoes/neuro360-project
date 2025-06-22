
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, CheckCircle, XCircle, Clock, Loader } from "lucide-react";
import { useCRUDTester } from "@/hooks/useCRUDTester";

export function CRUDTestPanel() {
  const { testing, results, runAllTests } = useCRUDTester();

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-blue-600" />
          <span>Painel de Testes CRUD</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Teste todas as operações CRUD (Create, Read, Update, Delete) do sistema
          </p>
          <Button 
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Executar Testes
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Resultados dos Testes</span>
            </h4>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.success)}
                    <span className="text-sm font-medium">{result.operation}</span>
                    <span className="text-xs text-gray-500">em {result.table}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(result.success)}>
                      {result.success ? 'Sucesso' : 'Falhou'}
                    </Badge>
                    {result.error && (
                      <span className="text-xs text-red-600 max-w-32 truncate" title={result.error}>
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Total: {results.length}</span>
                <span className="text-green-600">
                  Sucessos: {results.filter(r => r.success).length}
                </span>
                <span className="text-red-600">
                  Falhas: {results.filter(r => !r.success).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {testing && results.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Executando testes CRUD...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

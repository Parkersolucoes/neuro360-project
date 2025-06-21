
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useSystemLogs, SystemLog } from "@/hooks/useSystemLogs";
import { format } from "date-fns";

export function SystemLogsViewer() {
  const { logs, clearLogs } = useSystemLogs();

  const getLevelIcon = (level: SystemLog['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: SystemLog['level']) => {
    const variants = {
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800"
    };

    return (
      <Badge className={variants[level]}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Logs do Sistema</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Logs
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhum log registrado</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      {getLevelBadge(log.level)}
                      {log.component && (
                        <Badge variant="outline" className="text-xs">
                          {log.component}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{log.message}</p>
                  {log.details && (
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-800">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

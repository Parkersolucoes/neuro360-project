
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, Clock } from "lucide-react";

interface QueryResultTableProps {
  data: any[];
  columns: string[];
  isLoading: boolean;
  status?: 'success' | 'error' | 'pending';
  executionTime?: number;
  errorMessage?: string;
}

export function QueryResultTable({ 
  data, 
  columns, 
  isLoading, 
  status = 'pending',
  executionTime,
  errorMessage 
}: QueryResultTableProps) {
  
  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sucesso
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span>Resultado da Consulta</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              Executando
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Executando consulta...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span>Resultado da Consulta</span>
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <XCircle className="w-16 h-16 mb-4 text-red-400" />
            <p className="text-lg font-medium mb-2">Erro na execução da consulta</p>
            <p className="text-sm text-center max-w-md">
              {errorMessage || 'Ocorreu um erro inesperado ao executar a consulta SQL'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length && status === 'success') {
    return (
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span>Resultado da Consulta</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {executionTime && (
                <Badge variant="outline" className="border-gray-300">
                  {executionTime}ms
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Database className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Consulta executada com sucesso</p>
            <p className="text-sm">Nenhum resultado encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Resultado da Consulta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Database className="w-16 h-16 mb-4 text-gray-300" />
            <p>Execute uma consulta para ver os resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Resultado da Consulta ({data.length} {data.length === 1 ? 'registro' : 'registros'})</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {executionTime && (
              <Badge variant="outline" className="border-gray-300">
                {executionTime}ms
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead key={column} className="font-semibold text-gray-900 border-r border-gray-200 last:border-r-0">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell key={column} className="border-r border-gray-100 last:border-r-0">
                      <div className="max-w-xs truncate" title={String(row[column] || '')}>
                        {row[column] !== null && row[column] !== undefined 
                          ? String(row[column]) 
                          : <span className="text-gray-400 italic">NULL</span>}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{data.length} {data.length === 1 ? 'linha encontrada' : 'linhas encontradas'}</span>
              <span>{columns.length} {columns.length === 1 ? 'coluna' : 'colunas'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Server } from "lucide-react";
import { SQLConnectionForm } from "@/components/configuracao/SQLConnectionForm";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useCompanies } from "@/hooks/useCompanies";

export default function SQLServer() {
  const { connections, loading } = useSQLConnections();
  const { currentCompany } = useCompanies();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SQL Server</h1>
          <p className="text-gray-600 mt-1">Gerencie conexões de banco de dados</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <SQLConnectionForm 
          companyId={currentCompany?.id || ""} 
          connections={connections}
        />
      </div>
    </div>
  );
}

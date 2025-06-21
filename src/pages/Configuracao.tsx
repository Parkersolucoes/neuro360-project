
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, MessageSquare, Settings } from "lucide-react";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useCompanies } from "@/hooks/useCompanies";
import { SQLConnectionForm } from "@/components/configuracao/SQLConnectionForm";
import { EvolutionAPIForm } from "@/components/configuracao/EvolutionAPIForm";
import { CompanyAlert } from "@/components/configuracao/CompanyAlert";

export default function Configuracao() {
  const { connections } = useSQLConnections();
  const { currentCompany } = useCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configurações</span>
        </h1>
        <p className="text-gray-600 mt-2">Configure as integrações do sistema por empresa</p>
      </div>

      <CompanyAlert currentCompany={currentCompany} />

      <Tabs defaultValue="sql" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sql" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>SQL Server</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Evolution API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sql">
          {currentCompany ? (
            <SQLConnectionForm 
              companyId={currentCompany.id} 
              connections={connections}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecione uma empresa para configurar conexões SQL
            </div>
          )}
        </TabsContent>

        <TabsContent value="evolution">
          {currentCompany ? (
            <EvolutionAPIForm companyId={currentCompany.id} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecione uma empresa para configurar Evolution API
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

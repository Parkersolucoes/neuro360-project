
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, MessageSquare } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import { SQLConnectionForm } from "@/components/configuracao/SQLConnectionForm";
import { EvolutionAPIForm } from "@/components/configuracao/EvolutionAPIForm";
import { useSQLConnections } from "@/hooks/useSQLConnections";

interface CompanyConfigTabsProps {
  company: Company;
}

export function CompanyConfigTabs({ company }: CompanyConfigTabsProps) {
  const { connections } = useSQLConnections();

  return (
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
        <SQLConnectionForm 
          companyId={company.id} 
          connections={connections}
        />
      </TabsContent>

      <TabsContent value="evolution">
        <EvolutionAPIForm companyId={company.id} />
      </TabsContent>
    </Tabs>
  );
}

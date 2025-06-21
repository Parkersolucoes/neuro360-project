
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

export default function Configuracao() {
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

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As configurações foram movidas para a página de Empresas. 
          Para configurar integrações específicas de uma empresa, acesse a página "Empresas" 
          e clique no botão de configurações (⚙️) da empresa desejada.
        </AlertDescription>
      </Alert>

      {!currentCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para visualizar configurações, selecione uma empresa no menu lateral.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

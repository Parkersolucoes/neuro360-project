
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Settings, Building2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Configuracao() {
  const { currentCompany } = useCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configurações</span>
        </h1>
        <p className="text-gray-600 mt-2">Configure as integrações do sistema</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As configurações por empresa foram movidas para a página "Empresas". 
          Para configurar integrações específicas de uma empresa (SQL Server, Evolution API), 
          acesse a página "Empresas" e clique no botão de configurações (⚙️) da empresa desejada.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Configurações por Empresa</h3>
          <p className="text-blue-800 text-sm mb-3">
            Configure SQL Server e Evolution API para cada empresa individualmente.
          </p>
          <Link to="/empresas">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Building2 className="w-4 h-4 mr-2" />
              Ir para Empresas
            </Button>
          </Link>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Configurações Gerais do Sistema</h3>
          <p className="text-yellow-800 text-sm mb-3">
            Configure aparência, gateway de pagamento e webhooks globais do sistema.
          </p>
          <Link to="/configuracao-sistema">
            <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
              <Settings className="w-4 h-4 mr-2" />
              Configurações do Sistema
            </Button>
          </Link>
        </div>
      </div>

      {!currentCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para configurar integrações específicas, primeiro selecione uma empresa no menu lateral.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

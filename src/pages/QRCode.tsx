
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useCompanies } from "@/hooks/useCompanies";
import { QRCodeGenerator } from "@/components/qrcode/QRCodeGenerator";

export default function QRCodePage() {
  const { currentCompany } = useCompanies();
  const { config: evolutionConfig } = useEvolutionConfig(currentCompany?.id);

  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
          <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empresa necessária</h3>
            <p className="text-gray-600 mb-4">
              Selecione uma empresa no seletor do menu lateral para continuar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!evolutionConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
          <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuração Evolution API necessária</h3>
            <p className="text-gray-600 mb-4">
              Configure a Evolution API na página de empresas antes de gerar QR Codes
            </p>
            <Button 
              onClick={() => window.location.href = '/empresas'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ir para Empresas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
        <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp para {currentCompany.name}</p>
      </div>

      <QRCodeGenerator
        evolutionConfigId={evolutionConfig.id}
        instanceName={evolutionConfig.instance_name}
        currentCompanyId={currentCompany.id}
        currentCompanyName={currentCompany.name}
      />
    </div>
  );
}

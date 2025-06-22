
import { WebhookIntegrationForm } from "@/components/webhook/WebhookIntegrationForm";
import { QRCodeInterface } from "@/components/qrcode/QRCodeInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";

export default function WhatsAppConnection() {
  const { currentCompany } = useCompanies();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
        <p className="text-gray-600 mt-2">Gerencie conexões e mensagens WhatsApp via QR Code</p>
      </div>
      
      <Tabs defaultValue="qrcode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qrcode">QR Code WhatsApp</TabsTrigger>
          <TabsTrigger value="webhook">Webhook Integração</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcode" className="space-y-6">
          <QRCodeInterface />
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-6">
          {currentCompany && (
            <WebhookIntegrationForm companyId={currentCompany.id} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

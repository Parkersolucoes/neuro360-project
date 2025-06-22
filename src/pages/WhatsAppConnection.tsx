
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeInterface } from "@/components/qrcode/QRCodeInterface";
import { WebhookIntegrationForm } from "@/components/webhook/WebhookIntegrationForm";
import { WhatsAppManager } from "@/components/whatsapp/WhatsAppManager";
import { useCompanies } from "@/hooks/useCompanies";
import { QrCode, Webhook, MessageSquare } from "lucide-react";

export default function WhatsAppConnection() {
  const { currentCompany } = useCompanies();

  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
          <p className="text-gray-600 mt-2">Selecione uma empresa para gerenciar conexões WhatsApp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
        <p className="text-gray-600 mt-2">Gerencie conexões e mensagens WhatsApp via QR Code</p>
      </div>
      
      <Tabs defaultValue="qrcode" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qrcode" className="flex items-center space-x-2">
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center space-x-2">
            <Webhook className="w-4 h-4" />
            <span>Webhook Integração</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Mensagens</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qrcode">
          <QRCodeInterface />
        </TabsContent>

        <TabsContent value="webhook">
          <WebhookIntegrationForm companyId={currentCompany.id} />
        </TabsContent>

        <TabsContent value="messages">
          <WhatsAppManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

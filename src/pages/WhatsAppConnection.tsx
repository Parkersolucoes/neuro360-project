
import { WhatsAppManager } from "@/components/whatsapp/WhatsAppManager";
import { QRCodeInterface } from "@/components/qrcode/QRCodeInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WhatsAppConnection() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
        <p className="text-gray-600 mt-2">Gerencie conexões e mensagens WhatsApp via Evolution API</p>
      </div>
      
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">Conectar WhatsApp</TabsTrigger>
          <TabsTrigger value="manager">Gerenciar Mensagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="space-y-6">
          <QRCodeInterface />
        </TabsContent>
        
        <TabsContent value="manager" className="space-y-6">
          <WhatsAppManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

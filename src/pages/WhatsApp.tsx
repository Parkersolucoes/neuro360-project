
import { WhatsAppManager } from "@/components/whatsapp/WhatsAppManager";

export default function WhatsApp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
        <p className="text-gray-600 mt-2">Gerenciar mensagens e integração com WhatsApp via Evolution API</p>
      </div>
      
      <WhatsAppManager />
    </div>
  );
}

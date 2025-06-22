
import { QRCodeInterface } from "@/components/qrcode/QRCodeInterface";
import { useCompanies } from "@/hooks/useCompanies";

export default function WhatsAppConnection() {
  const { currentCompany } = useCompanies();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
        <p className="text-gray-600 mt-2">Gerencie conexões e mensagens WhatsApp via QR Code</p>
      </div>
      
      <QRCodeInterface />
    </div>
  );
}

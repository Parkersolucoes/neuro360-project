
import { Button } from "@/components/ui/button";
import { RefreshCw, QrCode, CheckCircle } from "lucide-react";

interface QRCodeDisplayProps {
  sessionStatus: string;
  qrCode: string;
  currentCompanyName: string;
  onGenerateQRCode: () => void;
  onRefreshQRCode: () => void;
  onDisconnectSession: () => void;
  isGenerating: boolean;
}

export function QRCodeDisplay({
  sessionStatus,
  qrCode,
  currentCompanyName,
  onGenerateQRCode,
  onRefreshQRCode,
  onDisconnectSession,
  isGenerating
}: QRCodeDisplayProps) {
  if (sessionStatus === "disconnected") {
    return (
      <div className="text-center space-y-4">
        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
          <div className="text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Clique em "Gerar QR Code" para conectar</p>
          </div>
        </div>
        <Button 
          onClick={onGenerateQRCode} 
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? "Gerando..." : "Gerar QR Code"}
        </Button>
      </div>
    );
  }

  if (sessionStatus === "waiting" && qrCode) {
    return (
      <div className="text-center space-y-4">
        <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg mx-auto p-4">
          <img 
            src={qrCode} 
            alt="QR Code WhatsApp" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            1. Abra o WhatsApp no seu celular
          </p>
          <p className="text-sm text-gray-600">
            2. Toque em Menu ou Configurações
          </p>
          <p className="text-sm text-gray-600">
            3. Toque em "Aparelhos conectados"
          </p>
          <p className="text-sm text-gray-600">
            4. Escaneie este código QR
          </p>
        </div>
        <Button 
          onClick={onRefreshQRCode} 
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar QR Code
        </Button>
      </div>
    );
  }

  if (sessionStatus === "connected") {
    return (
      <div className="text-center space-y-4">
        <div className="w-64 h-64 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center mx-auto">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">WhatsApp Conectado!</p>
            <p className="text-green-600 text-sm mt-1">{currentCompanyName}</p>
          </div>
        </div>
        <Button 
          onClick={onDisconnectSession} 
          variant="destructive"
          className="w-full"
        >
          Desconectar Sessão
        </Button>
      </div>
    );
  }

  return null;
}

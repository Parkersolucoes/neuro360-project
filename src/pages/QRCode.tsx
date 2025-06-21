
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QRCodePage() {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState("");
  const [sessionStatus, setSessionStatus] = useState<"disconnected" | "waiting" | "connected">("disconnected");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setSessionStatus("waiting");
    
    // Simulate QR code generation
    setTimeout(() => {
      setQrCode("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
      setIsGenerating(false);
      toast({
        title: "QR Code gerado",
        description: "Use o WhatsApp Web para escanear o código",
      });
    }, 2000);

    // Simulate connection after QR scan
    setTimeout(() => {
      setSessionStatus("connected");
      toast({
        title: "Sessão conectada!",
        description: "WhatsApp conectado com sucesso",
      });
    }, 10000);
  };

  const disconnectSession = () => {
    setSessionStatus("disconnected");
    setQrCode("");
    toast({
      title: "Sessão desconectada",
      description: "WhatsApp foi desconectado",
    });
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
        <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                <span>Conexão WhatsApp</span>
              </div>
              <Badge className={`${
                sessionStatus === "connected" ? "status-connected" :
                sessionStatus === "waiting" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {sessionStatus === "connected" ? "Conectado" :
                 sessionStatus === "waiting" ? "Aguardando" : "Desconectado"}
                {sessionStatus === "connected" && <CheckCircle className="w-3 h-3 ml-1" />}
                {sessionStatus === "disconnected" && <AlertCircle className="w-3 h-3 ml-1" />}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionStatus === "disconnected" && (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Clique em "Gerar QR Code" para conectar</p>
                  </div>
                </div>
                <Button 
                  onClick={generateQRCode} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Gerando..." : "Gerar QR Code"}
                </Button>
              </div>
            )}

            {sessionStatus === "waiting" && qrCode && (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg mx-auto p-4">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
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
                  onClick={refreshQRCode} 
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar QR Code
                </Button>
              </div>
            )}

            {sessionStatus === "connected" && (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">WhatsApp Conectado!</p>
                  </div>
                </div>
                <Button 
                  onClick={disconnectSession} 
                  variant="destructive"
                  className="w-full"
                >
                  Desconectar Sessão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              <span>Informações da Sessão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <Badge className={`${
                  sessionStatus === "connected" ? "status-connected" :
                  sessionStatus === "waiting" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {sessionStatus === "connected" ? "Ativo" :
                   sessionStatus === "waiting" ? "Aguardando" : "Inativo"}
                </Badge>
              </div>
              
              {sessionStatus === "connected" && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Instância</span>
                    <span className="text-sm text-gray-900">whatsapp-automation</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Conectado em</span>
                    <span className="text-sm text-gray-900">{new Date().toLocaleString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Última atividade</span>
                    <span className="text-sm text-gray-900">Agora</span>
                  </div>
                </>
              )}
            </div>

            {sessionStatus === "disconnected" && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma sessão ativa</p>
                <p className="text-sm text-gray-400 mt-1">
                  Gere um QR Code para conectar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

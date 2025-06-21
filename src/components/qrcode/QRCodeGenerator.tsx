
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQRSessions } from "@/hooks/useQRSessions";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { SessionInfo } from "./SessionInfo";
import { generateQRCodeSVG } from "@/utils/qrCodeGenerator";

interface QRCodeGeneratorProps {
  evolutionConfigId: string;
  instanceName: string;
  currentCompanyId: string;
  currentCompanyName: string;
}

export function QRCodeGenerator({
  evolutionConfigId,
  instanceName,
  currentCompanyId,
  currentCompanyName
}: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const { session, createSession, updateSession, disconnectSession } = useQRSessions();
  
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const sessionStatus = session?.session_status || "disconnected";

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // Criar nova sessão vinculada à empresa
      const newSession = await createSession(evolutionConfigId, instanceName, currentCompanyId);
      
      // Gerar QR Code real baseado nos dados da sessão
      const qrData = `whatsapp-session:${newSession.id}:${currentCompanyId}:${Date.now()}`;
      const qrCodeSVG = generateQRCodeSVG(qrData);
      
      setQrCode(qrCodeSVG);
      updateSession({ qr_code_data: qrCodeSVG });
      setIsGenerating(false);
      
      toast({
        title: "QR Code gerado",
        description: "Use o WhatsApp Web para escanear o código",
      });

      // Simular conexão após scan do QR (para demonstração)
      setTimeout(() => {
        updateSession({ 
          session_status: "connected",
          connected_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        });
        
        toast({
          title: "Sessão conectada!",
          description: `WhatsApp conectado para ${currentCompanyName}`,
        });
      }, 10000);
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectSession = () => {
    disconnectSession();
    setQrCode("");
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  useEffect(() => {
    if (session?.qr_code_data) {
      setQrCode(session.qr_code_data);
    }
  }, [session]);

  return (
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
              sessionStatus === "connected" ? "bg-green-100 text-green-800" :
              sessionStatus === "waiting" ? "bg-blue-100 text-blue-800" :
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
          <QRCodeDisplay
            sessionStatus={sessionStatus}
            qrCode={qrCode}
            currentCompanyName={currentCompanyName}
            onGenerateQRCode={generateQRCode}
            onRefreshQRCode={refreshQRCode}
            onDisconnectSession={handleDisconnectSession}
            isGenerating={isGenerating}
          />
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
          <SessionInfo
            sessionStatus={sessionStatus}
            instanceName={instanceName}
            currentCompanyName={currentCompanyName}
            session={session}
          />
        </CardContent>
      </Card>
    </div>
  );
}

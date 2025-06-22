
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQRSessions } from "@/hooks/useQRSessions";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { SessionInfo } from "./SessionInfo";
import { EvolutionApiService } from "@/services/evolutionApiService";

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
  const { session, createSession, updateSession, disconnectSession, refetch } = useQRSessions();
  
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [evolutionService, setEvolutionService] = useState<EvolutionApiService | null>(null);

  const sessionStatus = session?.session_status || "disconnected";

  // Buscar sessão existente ao carregar o componente
  useEffect(() => {
    refetch(currentCompanyId);
  }, [currentCompanyId, refetch]);

  // Inicializar serviço da Evolution API
  useEffect(() => {
    const initEvolutionService = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: config } = await supabase
          .from('evolution_configs')
          .select('*')
          .eq('id', evolutionConfigId)
          .single();

        if (config) {
          const service = new EvolutionApiService({
            ...config,
            status: config.status as 'connected' | 'disconnected' | 'testing'
          });
          setEvolutionService(service);
        }
      } catch (error) {
        console.error('Error initializing Evolution service:', error);
      }
    };

    initEvolutionService();
  }, [evolutionConfigId]);

  // Carregar QR Code existente da sessão
  useEffect(() => {
    if (session?.qr_code_data) {
      console.log('QRCodeGenerator: Loading existing QR Code from session');
      setQrCode(session.qr_code_data);
    } else {
      console.log('QRCodeGenerator: No existing QR Code found in session');
    }
  }, [session]);

  const generateQRCode = async () => {
    if (!evolutionService) {
      toast({
        title: "Erro",
        description: "Serviço Evolution API não está configurado",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let currentSession = session;
      if (!currentSession) {
        currentSession = await createSession(evolutionConfigId, instanceName, currentCompanyId);
      }

      const qrResponse = await evolutionService.generateQRCode();
      
      setQrCode(qrResponse.qrCode);
      
      await updateSession({
        session_status: 'waiting',
        qr_code_data: qrResponse.qrCode,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "QR Code gerado",
        description: "Escaneie o código com seu WhatsApp para conectar",
      });

      startStatusPolling();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code. Verifique se a instância foi criada corretamente nas configurações.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startStatusPolling = () => {
    const pollInterval = setInterval(async () => {
      if (!evolutionService) return;

      try {
        const status = await evolutionService.getInstanceStatus();
        
        if (status.status === 'open') {
          await updateSession({
            session_status: 'connected',
            connected_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          });
          
          clearInterval(pollInterval);
          
          toast({
            title: "WhatsApp Conectado!",
            description: "Sua instância está pronta para uso",
          });
        }
      } catch (error) {
        console.error('Error checking instance status:', error);
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const handleDisconnectSession = async () => {
    if (!evolutionService) return;

    try {
      await evolutionService.disconnectInstance();
      await disconnectSession();
      setQrCode("");
      
      toast({
        title: "Sessão desconectada",
        description: "WhatsApp foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Error disconnecting session:', error);
      toast({
        title: "Erro",
        description: "Erro ao desconectar sessão",
        variant: "destructive"
      });
    }
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  // Verificar se há QR Code disponível automaticamente na sessão
  const hasQRCodeAvailable = session?.qr_code_data && session.qr_code_data.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-blue-500" />
              <span>Conexão WhatsApp Evolution API</span>
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
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instância:</strong> {instanceName}
              <br />
              {hasQRCodeAvailable ? (
                <strong>✓ QR Code disponível:</strong> + " A instância foi criada automaticamente e o QR Code está pronto para uso."
              ) : (
                <strong>Importante:</strong> + " A instância deve estar criada nas configurações da empresa antes de gerar o QR Code."
              )}
            </p>
          </div>
          
          <QRCodeDisplay
            sessionStatus={hasQRCodeAvailable ? "waiting" : sessionStatus}
            qrCode={qrCode}
            currentCompanyName={currentCompanyName}
            onGenerateQRCode={generateQRCode}
            onRefreshQRCode={refreshQRCode}
            onDisconnectSession={handleDisconnectSession}
            isGenerating={isGenerating}
          />
        </CardContent>
      </Card>

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

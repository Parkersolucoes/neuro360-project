
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, AlertCircle, Smartphone, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQRSessions } from "@/hooks/useQRSessions";
import { QRCodeForm } from "./QRCodeForm";
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

  const generateQRCode = async (customInstanceName: string) => {
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
        currentSession = await createSession(evolutionConfigId, customInstanceName, currentCompanyId);
      }

      const qrResponse = await evolutionService.generateQRCode();
      
      setQrCode(qrResponse.qrCode);
      
      await updateSession({
        session_status: 'waiting',
        qr_code_data: qrResponse.qrCode,
        instance_name: customInstanceName,
        updated_at: new Date().toISOString()
      });
      
      startStatusPolling();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interface Principal - QR Code Form */}
      <QRCodeForm
        companyName={currentCompanyName}
        onGenerateQRCode={generateQRCode}
        isGenerating={isGenerating}
        qrCodeData={qrCode}
      />

      {/* Card de Informações da Sessão - Compacto */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>Status da Conexão</span>
            </div>
            <Badge className={`${
              sessionStatus === "connected" ? "bg-green-100 text-green-800 border-green-300" :
              sessionStatus === "waiting" ? "bg-blue-100 text-blue-800 border-blue-300" :
              "bg-red-100 text-red-800 border-red-300"
            }`}>
              {sessionStatus === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
              {sessionStatus === "disconnected" && <AlertCircle className="w-3 h-3 mr-1" />}
              {sessionStatus === "connected" ? "Conectado" :
               sessionStatus === "waiting" ? "Aguardando Conexão" : "Desconectado"}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Instância:</span>
              <span className="text-gray-800">{session?.instance_name || instanceName}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Empresa:</span>
              <span className="text-gray-800">{currentCompanyName}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Última Atividade:</span>
              <span className="text-gray-800">
                {session?.last_activity ? 
                  new Date(session.last_activity).toLocaleString() : 
                  'Nunca conectado'
                }
              </span>
            </div>
          </div>

          {sessionStatus === "connected" && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDisconnectSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Desconectar Sessão
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

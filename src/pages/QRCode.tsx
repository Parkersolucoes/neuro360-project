
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw, CheckCircle, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useQRSessions } from "@/hooks/useQRSessions";
import { useCompanies } from "@/hooks/useCompanies";

export default function QRCodePage() {
  const { toast } = useToast();
  const { config: evolutionConfig } = useEvolutionConfig();
  const { session, createSession, updateSession, disconnectSession } = useQRSessions();
  const { currentCompany } = useCompanies();
  
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const sessionStatus = session?.session_status || "disconnected";

  const generateQRCode = async () => {
    if (!evolutionConfig) {
      toast({
        title: "Configuração necessária",
        description: "Configure a Evolution API primeiro",
        variant: "destructive"
      });
      return;
    }

    if (!currentCompany) {
      toast({
        title: "Empresa necessária",
        description: "Selecione uma empresa para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Criar nova sessão vinculada à empresa
      const newSession = await createSession(evolutionConfig.id, evolutionConfig.instance_name);
      
      // Simular geração de QR code
      setTimeout(() => {
        const mockQRCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        setQrCode(mockQRCode);
        updateSession({ qr_code_data: mockQRCode });
        setIsGenerating(false);
        
        toast({
          title: "QR Code gerado",
          description: "Use o WhatsApp Web para escanear o código",
        });
      }, 2000);

      // Simular conexão após scan do QR
      setTimeout(() => {
        updateSession({ 
          session_status: "connected",
          connected_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        });
        
        toast({
          title: "Sessão conectada!",
          description: `WhatsApp conectado para ${currentCompany.name}`,
        });
      }, 10000);
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating QR code:', error);
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

  if (!evolutionConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
          <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuração Evolution API necessária</h3>
            <p className="text-gray-600 mb-4">
              Configure a Evolution API na página de configurações antes de gerar QR Codes
            </p>
            <Button 
              onClick={() => window.location.href = '/configuracao'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
          <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empresa necessária</h3>
            <p className="text-gray-600 mb-4">
              Selecione uma empresa no seletor do menu lateral para continuar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code WhatsApp</h1>
        <p className="text-gray-600 mt-2">Conecte sua sessão do WhatsApp para {currentCompany.name}</p>
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
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
                    <p className="text-green-600 text-sm mt-1">{currentCompany.name}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleDisconnectSession} 
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
                  sessionStatus === "connected" ? "bg-green-100 text-green-800" :
                  sessionStatus === "waiting" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {sessionStatus === "connected" ? "Ativo" :
                   sessionStatus === "waiting" ? "Aguardando" : "Inativo"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Instância</span>
                <span className="text-sm text-gray-900">{evolutionConfig.instance_name}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Empresa</span>
                <span className="text-sm text-gray-900">{currentCompany.name}</span>
              </div>
              
              {sessionStatus === "connected" && session && (
                <>
                  {session.connected_at && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Conectado em</span>
                      <span className="text-sm text-gray-900">
                        {new Date(session.connected_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  
                  {session.last_activity && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Última atividade</span>
                      <span className="text-sm text-gray-900">
                        {new Date(session.last_activity).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
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

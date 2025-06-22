
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Timer, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";

export default function WhatsApp() {
  const [instanceName, setInstanceName] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  // Função para gerar QR Code via webhook
  const generateQRCode = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome da instância",
        variant: "destructive",
      });
      return;
    }

    if (!currentCompany?.qr_code) {
      toast({
        title: "Erro",
        description: "Webhook não configurado para esta empresa",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Enviando requisição para webhook:', currentCompany.qr_code);
      console.log('Nome da instância:', instanceName);
      
      const response = await fetch(currentCompany.qr_code, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName,
          action: 'generateQR'
        }),
      });

      console.log('Resposta do webhook:', response.status);

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // Verificar se a resposta contém o QR code
      if (data.qrCode || data.base64 || data.image) {
        const qrCodeBase64 = data.qrCode || data.base64 || data.image;
        
        // Verificar se já é um data URL completo ou apenas o base64
        const qrCodeUrl = qrCodeBase64.startsWith('data:') 
          ? qrCodeBase64 
          : `data:image/png;base64,${qrCodeBase64}`;
        
        setQrCodeData(qrCodeUrl);
        
        toast({
          title: "Sucesso",
          description: "QR Code gerado com sucesso!",
        });
      } else {
        throw new Error("Resposta do servidor não contém QR Code válido");
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: `Erro ao gerar QR Code: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Iniciar auto-refresh com countdown
  const startAutoRefresh = () => {
    if (!qrCodeData || !instanceName.trim()) return;
    
    setIsAutoRefreshEnabled(true);
    setCountdown(30);
    
    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);
    
    // Auto refresh timer (30 seconds)
    intervalRef.current = setInterval(() => {
      generateQRCode();
    }, 30000);
  };

  // Parar auto-refresh
  const stopAutoRefresh = () => {
    setIsAutoRefreshEnabled(false);
    setCountdown(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (qrCodeData && !isAutoRefreshEnabled) {
      startAutoRefresh();
    }
  }, [qrCodeData]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Integration</h1>
        <p className="text-gray-600">Gere QR Codes para conexão com instâncias do WhatsApp</p>
        {currentCompany && (
          <p className="text-sm text-gray-500 mt-1">
            Empresa: {currentCompany.name} | Webhook: {currentCompany.qr_code || 'Não configurado'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Gerar QR Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName">Nome da Instância</Label>
              <Input
                id="instanceName"
                type="text"
                placeholder="Digite o nome da instância"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={generateQRCode}
                disabled={isGenerating || !instanceName.trim() || !currentCompany?.qr_code}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code
                  </>
                )}
              </Button>
              
              {qrCodeData && (
                <Button
                  variant={isAutoRefreshEnabled ? "destructive" : "outline"}
                  onClick={isAutoRefreshEnabled ? stopAutoRefresh : startAutoRefresh}
                >
                  {isAutoRefreshEnabled ? (
                    <>
                      <Timer className="w-4 h-4 mr-2" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4 mr-2" />
                      Auto-Refresh
                    </>
                  )}
                </Button>
              )}
            </div>

            {!currentCompany?.qr_code && (
              <Alert>
                <AlertDescription>
                  <strong>Aviso:</strong> Webhook não configurado para esta empresa. Configure o campo QR Code na empresa para usar esta funcionalidade.
                </AlertDescription>
              </Alert>
            )}

            {isAutoRefreshEnabled && countdown > 0 && (
              <Alert>
                <Timer className="w-4 h-4" />
                <AlertDescription>
                  Próxima atualização em {countdown} segundos
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            {qrCodeData ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Escaneie este QR Code com seu WhatsApp para conectar a instância "{instanceName}"
                </p>
                {isAutoRefreshEnabled && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auto-refresh ativo</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <QrCode className="w-16 h-16 mb-4" />
                <p>Nenhum QR Code gerado ainda</p>
                <p className="text-sm">Digite o nome da instância e clique em "Gerar QR Code"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Alert>
          <AlertDescription>
            <strong>Instruções:</strong>
            <br />
            1. Digite o nome da instância no campo acima
            <br />
            2. Clique em "Gerar QR Code" para criar um novo código via webhook
            <br />
            3. O QR Code será atualizado automaticamente a cada 30 segundos
            <br />
            4. Use o botão "Auto-Refresh" para controlar a atualização automática
            <br />
            5. Certifique-se de que o webhook esteja configurado no cadastro da empresa
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

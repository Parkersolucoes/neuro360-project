
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Timer, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WhatsApp() {
  const [instanceName, setInstanceName] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Simular geração de QR Code (substitua pela chamada real ao servidor)
  const generateQRCode = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome da instância",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulação - substitua pela chamada real ao seu servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // QR Code simulado em base64 (substitua pela resposta real do servidor)
      const simulatedQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
      
      setQrCodeData(simulatedQRCode);
      
      toast({
        title: "Sucesso",
        description: "QR Code gerado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code. Tente novamente.",
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

  // Start auto-refresh when QR code is first generated
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
                disabled={isGenerating || !instanceName.trim()}
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
            2. Clique em "Gerar QR Code" para criar um novo código
            <br />
            3. O QR Code será atualizado automaticamente a cada 30 segundos
            <br />
            4. Use o botão "Auto-Refresh" para controlar a atualização automática
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

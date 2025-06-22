import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Timer, RefreshCw, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";

export default function WhatsApp() {
  const [instanceName, setInstanceName] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  // Função para testar a conexão com o webhook
  const testWebhookConnection = async (webhookUrl: string): Promise<boolean> => {
    try {
      console.log('Testando conexão com webhook:', webhookUrl);
      setConnectionStatus(`Testando conexão com: ${webhookUrl}`);
      
      // Fazer uma requisição HEAD ou OPTIONS para testar a conectividade
      const response = await fetch(webhookUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000), // 10 segundos timeout para teste
      });

      console.log('Status do teste de conexão:', response.status);
      
      if (response.ok || response.status === 405) { // 405 Method Not Allowed é aceitável
        setConnectionStatus(`✅ Conexão estabelecida com: ${webhookUrl}`);
        return true;
      } else {
        setConnectionStatus(`❌ Erro de conexão (${response.status}): ${webhookUrl}`);
        return false;
      }
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setConnectionStatus(`❌ Timeout na conexão: ${webhookUrl}`);
        } else if (error.message.includes('fetch')) {
          setConnectionStatus(`❌ Falha na conexão: ${webhookUrl} - ${error.message}`);
        } else {
          setConnectionStatus(`❌ Erro de conexão: ${webhookUrl} - ${error.message}`);
        }
      } else {
        setConnectionStatus(`❌ Erro desconhecido na conexão: ${webhookUrl}`);
      }
      
      return false;
    }
  };

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
    setConnectionStatus(null);
    
    try {
      console.log('Enviando requisição para webhook:', currentCompany.qr_code);
      console.log('Nome da instância:', instanceName);
      
      // Validar se a URL do webhook é válida
      let webhookUrl: URL;
      try {
        webhookUrl = new URL(currentCompany.qr_code);
      } catch (urlError) {
        throw new Error(`URL do webhook inválida: ${currentCompany.qr_code}`);
      }

      // Testar conexão primeiro
      const isConnected = await testWebhookConnection(webhookUrl.toString());
      
      if (!isConnected) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar com o webhook. Verifique a URL e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Aguardar 1 segundo para mostrar o status de conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnectionStatus(`🔄 Enviando solicitação para: ${webhookUrl.toString()}`);

      const response = await fetch(webhookUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          action: 'generateQR'
        }),
        // Adicionar timeout para evitar travamento
        signal: AbortSignal.timeout(30000), // 30 segundos timeout
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Resposta não disponível');
        console.error('Erro da resposta:', errorText);
        throw new Error(`Erro do servidor: ${response.status} - ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Se não for JSON, tentar como texto
        const textData = await response.text();
        console.log('Resposta como texto:', textData);
        
        // Verificar se é um base64 direto
        if (textData.startsWith('data:image') || textData.match(/^[A-Za-z0-9+/]+=*$/)) {
          data = { qrCode: textData };
        } else {
          throw new Error('Formato de resposta não reconhecido');
        }
      }
      
      console.log('Dados recebidos:', data);
      
      // Verificar se a resposta contém o QR code em diferentes formatos possíveis
      const qrCodeBase64 = data.qrCode || data.base64 || data.image || data.qr_code || data.data;
      
      if (qrCodeBase64) {
        // Verificar se já é um data URL completo ou apenas o base64
        let qrCodeUrl: string;
        
        if (qrCodeBase64.startsWith('data:')) {
          qrCodeUrl = qrCodeBase64;
        } else if (qrCodeBase64.startsWith('/9j/') || qrCodeBase64.startsWith('iVBORw0KGgoAAAANSUhEUgAA')) {
          // Base64 de imagem comum
          qrCodeUrl = `data:image/png;base64,${qrCodeBase64}`;
        } else {
          qrCodeUrl = `data:image/png;base64,${qrCodeBase64}`;
        }
        
        setQrCodeData(qrCodeUrl);
        setConnectionStatus(`✅ QR Code gerado com sucesso via: ${webhookUrl.toString()}`);
        
        toast({
          title: "Sucesso",
          description: "QR Code gerado com sucesso!",
        });
      } else {
        console.error('Estrutura da resposta:', data);
        throw new Error("Resposta do servidor não contém QR Code válido");
      }
    } catch (error) {
      console.error('Erro completo ao gerar QR Code:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique se o webhook está acessível e se a URL está correta.';
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: O webhook demorou muito para responder (mais de 30 segundos).';
        } else {
          errorMessage = error.message;
        }
      }
      
      setConnectionStatus(`❌ Erro: ${errorMessage}`);
      
      toast({
        title: "Erro",
        description: `Erro ao gerar QR Code: ${errorMessage}`,
        variant: "destructive",
      });
      
      // Limpar QR code em caso de erro
      setQrCodeData(null);
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

            {/* Status da conexão */}
            {connectionStatus && (
              <Alert>
                <Globe className="w-4 h-4" />
                <AlertDescription>
                  <strong>Status da Conexão:</strong><br />
                  {connectionStatus}
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
                    onError={(e) => {
                      console.error('Erro ao carregar imagem do QR Code:', e);
                      toast({
                        title: "Erro",
                        description: "Erro ao exibir o QR Code. Formato de imagem inválido.",
                        variant: "destructive",
                      });
                    }}
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
            3. O sistema verificará a conexão com o webhook antes de enviar a solicitação
            <br />
            4. O QR Code será atualizado automaticamente a cada 30 segundos
            <br />
            5. Use o botão "Auto-Refresh" para controlar a atualização automática
            <br />
            6. Certifique-se de que o webhook esteja configurado no cadastro da empresa
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

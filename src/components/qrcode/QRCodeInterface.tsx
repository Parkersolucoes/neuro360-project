
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Smartphone } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useWebhookIntegration } from '@/hooks/useWebhookIntegration';
import { useToast } from '@/hooks/use-toast';

export function QRCodeInterface() {
  const { currentCompany } = useCompanies();
  const { integration } = useWebhookIntegration(currentCompany?.id);
  const { toast } = useToast();
  
  const [instanceName, setInstanceName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected');

  // Gerar nome da instância automaticamente
  useEffect(() => {
    if (currentCompany?.name && !instanceName) {
      const companyName = currentCompany.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const timestamp = Date.now().toString().slice(-6);
      setInstanceName(`${companyName}_${timestamp}`);
    }
  }, [currentCompany, instanceName]);

  // Timer para regenerar QR Code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (qrCodeData && connectionStatus === 'waiting') {
              handleGenerateQRCode();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, qrCodeData, connectionStatus]);

  const sendToWebhook = async (instanceName: string) => {
    if (!integration?.qrcode_webhook_url) {
      console.log('Nenhuma URL de webhook configurada');
      return;
    }

    try {
      const payload = {
        event: 'qr_code_generated',
        timestamp: new Date().toISOString(),
        company_id: currentCompany?.id,
        data: {
          instance_name: instanceName,
          company_name: currentCompany?.name,
          status: 'waiting_connection'
        }
      };

      console.log('📤 Enviando para webhook:', integration.qrcode_webhook_url);
      
      const response = await fetch(integration.qrcode_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Webhook enviado com sucesso');
        toast({
          title: "Webhook Enviado",
          description: "Dados enviados para o webhook com sucesso!"
        });
      } else {
        console.warn(`⚠️ Webhook retornou: ${response.status}`);
        toast({
          title: "Aviso",
          description: `Webhook retornou status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar webhook:', error);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao conectar com o webhook",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQRCode = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da instância é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!currentCompany) {
      toast({
        title: "Erro", 
        description: "Nenhuma empresa selecionada",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setConnectionStatus('waiting');
    
    try {
      // Enviar para webhook antes de gerar QR Code
      await sendToWebhook(instanceName.trim());

      // Simular QR Code (substituir pela integração real)
      const mockQRCode = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+`;
      
      setQrCodeData(mockQRCode);
      setTimer(30);
      
      toast({
        title: "QR Code Gerado",
        description: "Escaneie o código QR com seu WhatsApp",
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Conectado</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Aguardando</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>Configuração da Instância</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {getStatusBadge()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <Input 
                value={currentCompany?.name || ''} 
                disabled 
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Instância *
              </label>
              <Input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="Digite o nome da instância"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome único para identificar sua instância WhatsApp
              </p>
            </div>

            {integration?.qrcode_webhook_url ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Webhook configurado
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {integration.qrcode_webhook_url}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Webhook não configurado
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Configure na aba "Webhook Integração"
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerateQRCode}
              disabled={isGenerating || !instanceName.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
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

            {timer > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Renovação em: <span className="font-bold text-blue-600">{timer}s</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timer / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>QR Code WhatsApp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {qrCodeData ? (
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={qrCodeData}
                    alt="QR Code WhatsApp"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Escaneie com WhatsApp
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>1. Abra o WhatsApp no seu celular</p>
                    <p>2. Vá em Menu → Dispositivos conectados</p>
                    <p>3. Toque em "Conectar um dispositivo"</p>
                    <p>4. Aponte a câmera para este QR Code</p>
                  </div>
                </div>

                {timer > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      ⏱️ Expira em <strong>{timer} segundos</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-500">
                    QR Code não gerado
                  </h3>
                  <p className="text-sm text-gray-400">
                    Clique em "Gerar QR Code" para conectar
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

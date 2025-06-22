
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Smartphone, Wifi } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionConfigActions } from '@/hooks/useEvolutionConfigActions';

export function QRCodeInterface() {
  const { currentCompany } = useCompanies();
  const { toast } = useToast();
  const { createInstanceWithQRCode, generateSessionName } = useEvolutionConfigActions();
  
  const [instanceName, setInstanceName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected');

  // Preencher automaticamente o nome da instância com base no nome da empresa
  useEffect(() => {
    if (currentCompany?.name) {
      const sessionName = generateSessionName(currentCompany.name);
      setInstanceName(sessionName);
    }
  }, [currentCompany, generateSessionName]);

  // Timer para regenerar QR Code a cada 30 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (qrCodeData && connectionStatus === 'waiting') {
              // Auto-regenerar QR Code quando o timer chegar a 0
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
      const result = await createInstanceWithQRCode({
        instance_name: instanceName,
        webhook_url: `${window.location.origin}/webhook/whatsapp`
      });

      if (result.success && result.qrCodeData) {
        setQrCodeData(result.qrCodeData);
        setTimer(30); // Iniciar timer de 30 segundos
        
        toast({
          title: "QR Code Gerado!",
          description: "Escaneie o código QR com seu WhatsApp para conectar",
        });
      } else {
        throw new Error('Falha ao gerar QR Code');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Erro ao Gerar QR Code",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500"><Wifi className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'waiting':
        return <Badge variant="outline"><QrCode className="w-3 h-3 mr-1" />Aguardando</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conexão WhatsApp
          </h1>
          <p className="text-lg text-gray-600">
            Conecte sua instância WhatsApp escaneando o QR Code
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuração da Instância */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Configuração da Instância</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {getStatusBadge()}
              </div>

              {/* Nome da Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <Input 
                  value={currentCompany?.name || ''} 
                  disabled 
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              {/* Nome da Instância */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Instância *
                </label>
                <Input
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Digite o nome da instância"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nome único para identificar sua instância WhatsApp
                </p>
              </div>

              {/* Botão Gerar QR Code */}
              <Button
                onClick={handleGenerateQRCode}
                disabled={isGenerating || !instanceName.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code
                  </>
                )}
              </Button>

              {/* Timer */}
              {timer > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Novo QR Code em: <span className="font-bold text-blue-600">{timer}s</span>
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
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>QR Code WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {qrCodeData ? (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img 
                      src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                      alt="QR Code WhatsApp"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Escaneie com WhatsApp
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>1. Abra o WhatsApp no seu celular</p>
                      <p>2. Toque em Menu → Dispositivos conectados</p>
                      <p>3. Toque em "Conectar um dispositivo"</p>
                      <p>4. Aponte a câmera para este QR Code</p>
                    </div>
                  </div>

                  {timer > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        ⏱️ Este QR Code expira em <strong>{timer} segundos</strong>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-500">
                      QR Code não gerado
                    </h3>
                    <p className="text-sm text-gray-400">
                      Clique em "Gerar QR Code" para conectar seu WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ℹ️ Informações Importantes
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Segurança</h4>
                <ul className="space-y-1">
                  <li>• QR Code expira automaticamente em 30 segundos</li>
                  <li>• Conexão criptografada end-to-end</li>
                  <li>• Dados protegidos pela Evolution API</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Funcionalidades</h4>
                <ul className="space-y-1">
                  <li>• Envio e recebimento de mensagens</li>
                  <li>• Webhooks para automação</li>
                  <li>• Histórico de conversas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

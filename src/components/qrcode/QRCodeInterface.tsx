
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Smartphone } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';

export function QRCodeInterface() {
  const { currentCompany } = useCompanies();
  const { toast } = useToast();
  
  const [instanceName, setInstanceName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected');

  // Preencher automaticamente o nome da instância com base no nome da empresa
  useEffect(() => {
    if (currentCompany?.name) {
      const firstName = currentCompany.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const date = new Date();
      const dateStr = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
      
      setInstanceName(`${firstName}_${dateStr}`);
    }
  }, [currentCompany]);

  // Timer para regenerar QR Code a cada 30 segundos
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
      // Simular geração de QR Code (substituir pela integração real)
      const mockQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
      
      setQrCodeData(mockQRCode);
      setTimer(30);
      
      toast({
        title: "QR Code Gerado!",
        description: "Escaneie o código QR com seu WhatsApp para conectar",
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Erro ao Gerar QR Code",
        description: "Erro na geração do QR Code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500">Conectado</Badge>;
      case 'waiting':
        return <Badge variant="outline">Aguardando</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Configuração da Instância */}
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
                className="bg-gray-50 border-gray-200"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome único para identificar sua instância WhatsApp
              </p>
            </div>

            <Button
              onClick={handleGenerateQRCode}
              disabled={isGenerating || !instanceName.trim()}
              className="w-full bg-green-500 hover:bg-green-600"
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
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={qrCodeData}
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
    </div>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Timer, Smartphone, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeFormProps {
  companyName: string;
  onGenerateQRCode: (instanceName: string) => Promise<void>;
  isGenerating: boolean;
  qrCodeData?: string;
}

export function QRCodeForm({ 
  companyName, 
  onGenerateQRCode, 
  isGenerating,
  qrCodeData 
}: QRCodeFormProps) {
  const [instanceName, setInstanceName] = useState(companyName);
  const [timer, setTimer] = useState(0);
  const [canGenerate, setCanGenerate] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setInstanceName(companyName);
  }, [companyName]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0) {
      setCanGenerate(false);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanGenerate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleGenerateQRCode = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da instância é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await onGenerateQRCode(instanceName.trim());
      setTimer(30); // Inicia timer de 30 segundos
      
      toast({
        title: "QR Code gerado com sucesso",
        description: "Escaneie o código com seu WhatsApp para conectar",
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center space-x-2 text-xl">
          <Smartphone className="w-6 h-6" />
          <span>Gerador QR Code WhatsApp</span>
        </CardTitle>
        <p className="text-blue-100 text-sm mt-2">
          Conecte sua instância do WhatsApp Business
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="instanceName" 
            className="text-sm font-semibold text-gray-700 flex items-center space-x-1"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Nome da Instância</span>
          </Label>
          <Input
            id="instanceName"
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="Digite o nome da instância"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Preenchido automaticamente com o nome da empresa
          </p>
        </div>

        <div className="relative">
          <Button
            onClick={handleGenerateQRCode}
            disabled={!canGenerate || isGenerating || !instanceName.trim()}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
              canGenerate && !isGenerating 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Gerando QR Code...</span>
              </div>
            ) : canGenerate ? (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Gerar QR Code</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Timer className="w-5 h-5" />
                <span>Aguarde {formatTime(timer)}</span>
              </div>
            )}
          </Button>

          {timer > 0 && (
            <div className="mt-3 flex items-center justify-center space-x-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Timer className="w-3 h-3 mr-1" />
                Próximo QR Code em {formatTime(timer)}
              </Badge>
            </div>
          )}
        </div>

        {qrCodeData && (
          <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="w-48 h-48 bg-white border-2 border-green-300 rounded-lg mx-auto p-2 shadow-md">
              <img 
                src={qrCodeData} 
                alt="QR Code WhatsApp" 
                className="w-full h-full object-contain rounded"
              />
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <QrCode className="w-3 h-3 mr-1" />
              QR Code Gerado com Sucesso
            </Badge>
            <p className="text-xs text-green-700 font-medium">
              Escaneie este código com seu WhatsApp
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Como conectar:</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Abra o WhatsApp no seu celular</li>
            <li>2. Vá em Menu → Aparelhos conectados</li>
            <li>3. Toque em "Conectar um aparelho"</li>
            <li>4. Escaneie o QR Code acima</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Webhook, Save } from "lucide-react";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";
import { useToast } from "@/hooks/use-toast";

interface WebhookIntegrationFormProps {
  companyId: string;
}

export function WebhookIntegrationForm({ companyId }: WebhookIntegrationFormProps) {
  const { integration, loading } = useWebhookIntegration(companyId);
  const { toast } = useToast();
  
  const [qrcodeWebhookUrl, setQrcodeWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (integration) {
      setQrcodeWebhookUrl(integration.qrcode_webhook_url || "");
    }
  }, [integration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrcodeWebhookUrl.trim()) {
      toast({
        title: "Erro",
        description: "URL Gerar QrCode é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const integrationData = {
        company_id: companyId,
        qrcode_webhook_url: qrcodeWebhookUrl.trim(),
        is_active: true
      };

      console.log('💾 Salvando integração webhook:', integrationData);

      // Salvar diretamente usando o service
      const { WebhookIntegrationService } = await import('@/services/webhookIntegrationService');
      
      if (integration && integration.id) {
        await WebhookIntegrationService.update(integration.id, {
          qrcode_webhook_url: integrationData.qrcode_webhook_url,
          is_active: integrationData.is_active
        });
      } else {
        await WebhookIntegrationService.create(integrationData);
      }
      
      toast({
        title: "Sucesso",
        description: "Configuração webhook salva com sucesso!"
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração webhook",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-blue-600" />
            <span>Webhook QR Code</span>
          </div>
          {integration && integration.qrcode_webhook_url && (
            <Badge className="bg-green-100 text-green-800">
              Configurado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qrcode_webhook_url">URL Gerar QrCode *</Label>
            <Input
              id="qrcode_webhook_url"
              value={qrcodeWebhookUrl}
              onChange={(e) => setQrcodeWebhookUrl(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://seu-servidor.com/webhook/qrcode"
              required
            />
            <p className="text-sm text-gray-500">
              URL onde será enviado o nome da instância ao gerar QR Code
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving || !qrcodeWebhookUrl.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

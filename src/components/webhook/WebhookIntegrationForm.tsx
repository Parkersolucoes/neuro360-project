
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Webhook, Save } from "lucide-react";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";

interface WebhookIntegrationFormProps {
  companyId: string;
}

export function WebhookIntegrationForm({ companyId }: WebhookIntegrationFormProps) {
  const { integration, saveIntegration, loading } = useWebhookIntegration(companyId);
  
  const [qrcodeWebhookUrl, setQrcodeWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('🔄 WebhookIntegrationForm: Integration updated:', integration);
    if (integration) {
      setQrcodeWebhookUrl(integration.qrcode_webhook_url || "");
    }
  }, [integration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 WebhookIntegrationForm: Form submitted with URL:', qrcodeWebhookUrl);
    console.log('📤 WebhookIntegrationForm: Company ID:', companyId);
    
    if (!qrcodeWebhookUrl.trim()) {
      console.warn('⚠️ WebhookIntegrationForm: URL Gerar QrCode is required');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('💾 WebhookIntegrationForm: Saving integration...');
      
      await saveIntegration({
        qrcode_webhook_url: qrcodeWebhookUrl,
        company_id: companyId,
        is_active: true
      });
      
      console.log('✅ WebhookIntegrationForm: Integration saved successfully');
    } catch (error) {
      console.error('❌ WebhookIntegrationForm: Error saving webhook integration:', error);
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

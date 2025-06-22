
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Webhook, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";

interface WebhookIntegrationFormProps {
  companyId: string;
}

export function WebhookIntegrationForm({ companyId }: WebhookIntegrationFormProps) {
  const { toast } = useToast();
  const { integration, loading, saveIntegration } = useWebhookIntegration(companyId);
  
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (integration?.qrcode_webhook_url) {
      setWebhookUrl(integration.qrcode_webhook_url);
    }
  }, [integration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl.trim()) {
      toast({
        title: "Erro",
        description: "URL do webhook é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (!companyId) {
      toast({
        title: "Erro",
        description: "Empresa não selecionada",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      await saveIntegration({
        company_id: companyId,
        qrcode_webhook_url: webhookUrl.trim(),
        is_active: true
      });
      
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Erro",
        description: "Configure uma URL antes de testar",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);

    try {
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        company_id: companyId,
        data: {
          message: 'Teste do webhook QR Code',
          system: 'WhatsApp Automation'
        }
      };

      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Webhook testado com sucesso!",
        });
      } else {
        toast({
          title: "Erro no Teste",
          description: `Erro ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao webhook",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando...</span>
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
            <span>Configuração Webhook QR Code</span>
          </div>
          {integration?.qrcode_webhook_url && (
            <Badge className="bg-green-100 text-green-800">
              Configurado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook *</Label>
            <Input
              id="webhook_url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seu-servidor.com/webhook/qrcode"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              URL onde será enviado o nome da instância ao gerar QR Code
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Como Funciona</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Quando um QR Code é gerado, o nome da instância será enviado para esta URL</li>
              <li>• O payload incluirá informações da empresa e timestamp</li>
              <li>• Use o botão "Testar" para verificar se a URL está funcionando</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving || !webhookUrl.trim() || !companyId}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Configuração"}
            </Button>

            {webhookUrl.trim() && (
              <Button 
                type="button" 
                variant="outline"
                onClick={testWebhook}
                disabled={isTesting}
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isTesting ? "Testando..." : "Testar Webhook"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

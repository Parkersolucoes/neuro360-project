
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
  
  const [form, setForm] = useState({
    webhook_name: "",
    webhook_url: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (integration) {
      setForm({
        webhook_name: integration.webhook_name || "",
        webhook_url: integration.webhook_url || ""
      });
    }
  }, [integration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.webhook_url.trim()) {
      return;
    }
    
    try {
      setIsSaving(true);
      await saveIntegration({
        webhook_name: form.webhook_name || "Webhook Integração QrCode",
        webhook_url: form.webhook_url,
        company_id: companyId,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving webhook integration:', error);
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
            <span>Webhook Integração</span>
          </div>
          {integration && integration.webhook_url && (
            <Badge className="bg-green-100 text-green-800">
              Configurado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_name">Nome da Integração</Label>
            <Input
              id="webhook_name"
              value={form.webhook_name}
              onChange={(e) => setForm({...form, webhook_name: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Webhook Integração QrCode"
            />
            <p className="text-sm text-gray-500">
              Nome identificador para a integração webhook
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook *</Label>
            <Input
              id="webhook_url"
              value={form.webhook_url}
              onChange={(e) => setForm({...form, webhook_url: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://seu-servidor.com/webhook/whatsapp"
              required
            />
            <p className="text-sm text-gray-500">
              URL completa onde os webhooks serão enviados
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving || !form.webhook_url.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Integração"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

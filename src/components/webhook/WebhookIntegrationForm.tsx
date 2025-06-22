
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Webhook, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WebhookIntegrationFormProps {
  companyId: string;
}

export function WebhookIntegrationForm({ companyId }: WebhookIntegrationFormProps) {
  const { toast } = useToast();
  
  const [qrcodeWebhookUrl, setQrcodeWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingIntegration, setExistingIntegration] = useState<any>(null);

  // Carregar configuração existente
  useEffect(() => {
    const loadIntegration = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Carregando integração webhook para empresa:', companyId);
        
        const { data, error } = await supabase
          .from('webhook_integrations')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();

        if (error) {
          console.error('❌ Erro ao carregar integração:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar configuração webhook",
            variant: "destructive"
          });
        } else if (data) {
          console.log('✅ Integração carregada:', data);
          setExistingIntegration(data);
          setQrcodeWebhookUrl(data.webhook_url || "");
        } else {
          console.log('ℹ️ Nenhuma integração encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar integração:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar configuração webhook",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegration();
  }, [companyId, toast]);

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

    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa é necessário",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      console.log('💾 Salvando webhook integration:', {
        company_id: companyId,
        webhook_url: qrcodeWebhookUrl.trim(),
        existing: !!existingIntegration
      });
      
      let result;
      
      if (existingIntegration) {
        // Atualizar registro existente
        result = await supabase
          .from('webhook_integrations')
          .update({
            webhook_url: qrcodeWebhookUrl.trim(),
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingIntegration.id)
          .select();
      } else {
        // Criar novo registro
        result = await supabase
          .from('webhook_integrations')
          .insert({
            company_id: companyId,
            webhook_url: qrcodeWebhookUrl.trim(),
            is_active: true
          })
          .select();
      }
      
      if (result.error) {
        console.error('❌ Erro ao salvar webhook:', result.error);
        throw result.error;
      }
      
      console.log('✅ Webhook salvo com sucesso:', result.data);
      
      // Atualizar estado local
      if (result.data && result.data[0]) {
        setExistingIntegration(result.data[0]);
      }
      
      toast({
        title: "Sucesso",
        description: "Configuração webhook salva com sucesso!"
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar webhook:', error);
      
      let errorMessage = "Erro ao salvar configuração webhook";
      
      if (error?.message) {
        if (error.message.includes('violates row-level security')) {
          errorMessage = "Erro de permissão: Verifique se você tem acesso à empresa selecionada";
        } else if (error.message.includes('not authenticated')) {
          errorMessage = "Erro de autenticação: Faça login novamente";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
          {existingIntegration && existingIntegration.webhook_url && (
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
            disabled={isSaving || !qrcodeWebhookUrl.trim() || !companyId}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

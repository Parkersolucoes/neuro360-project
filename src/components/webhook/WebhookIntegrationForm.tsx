
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Link, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";
import { SimpleWebhookService } from "@/services/simpleWebhookService";

interface WebhookIntegrationFormProps {
  companyId: string;
}

export function WebhookIntegrationForm({ companyId }: WebhookIntegrationFormProps) {
  const { toast } = useToast();
  const { integration, loading, saveIntegration } = useWebhookIntegration(companyId);
  
  const [path, setPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [useSimpleService, setUseSimpleService] = useState(false);

  useEffect(() => {
    if (integration?.qrcode_webhook_url) {
      setPath(integration.qrcode_webhook_url);
    }
  }, [integration]);

  // Abordagem 1: Método original com políticas simples
  const handleSubmitOriginal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!path.trim()) {
      toast({
        title: "Erro",
        description: "Caminho é obrigatório",
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
        qrcode_webhook_url: path.trim(),
        is_active: true
      });
      
    } catch (error) {
      console.error('Erro ao salvar caminho:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Abordagem 2: Método direto sem políticas complexas
  const handleSubmitSimple = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!path.trim()) {
      toast({
        title: "Erro",
        description: "Caminho é obrigatório",
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
      console.log('🚀 Usando SimpleWebhookService...');
      
      await SimpleWebhookService.saveWebhookIntegration({
        company_id: companyId,
        webhook_url: path.trim(),
        is_active: true
      });
      
      toast({
        title: "Sucesso",
        description: "Caminho salvo com sucesso usando método direto!"
      });
      
      // Recarregar dados
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao salvar caminho com SimpleWebhookService:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar caminho com método direto",
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
            <Link className="w-5 h-5 text-blue-600" />
            <span>Configuração de Caminho</span>
          </div>
          {integration?.qrcode_webhook_url && (
            <Badge className="bg-green-100 text-green-800">
              Configurado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={useSimpleService ? handleSubmitSimple : handleSubmitOriginal} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="path">Caminho *</Label>
            <Input
              id="path"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Digite o caminho ou URL"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              Caminho onde será salvo ou URL de destino
            </p>
          </div>

          {/* Seletor de método */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Método de Salvamento</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="method"
                  checked={!useSimpleService}
                  onChange={() => setUseSimpleService(false)}
                  className="text-blue-600"
                />
                <span className="text-sm">Método Padrão (com políticas simplificadas)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="method"
                  checked={useSimpleService}
                  onChange={() => setUseSimpleService(true)}
                  className="text-blue-600"
                />
                <span className="text-sm flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  Método Direto (sem verificações complexas)
                </span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {useSimpleService ? "⚡ Método Direto Ativo" : "📋 Método Padrão Ativo"}
            </h4>
            <p className="text-sm text-blue-800">
              {useSimpleService 
                ? "Usando salvamento direto que ignora políticas RLS complexas."
                : "Usando método padrão com políticas RLS simplificadas."
              }
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving || !path.trim() || !companyId}
          >
            {useSimpleService ? <Zap className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Salvando..." : useSimpleService ? "Salvar Direto" : "Salvar Caminho"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

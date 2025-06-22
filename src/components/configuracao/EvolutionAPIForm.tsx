
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface EvolutionAPIFormProps {
  companyId: string;
}

export function EvolutionAPIForm({ companyId }: EvolutionAPIFormProps) {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { config: evolutionConfig, saveConfig, loading } = useEvolutionConfig(companyId);

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    instance_token: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      console.log('EvolutionAPIForm: Loading existing config:', evolutionConfig);
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        instance_token: evolutionConfig.api_key || ""
      });
    } else {
      console.log('EvolutionAPIForm: No existing config, using defaults');
      setEvolutionForm({
        instance_name: "",
        instance_token: ""
      });
    }
  }, [evolutionConfig]);

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evolutionForm.instance_name.trim()) {
      const errorMsg = "Nome da instância é obrigatório";
      logError(errorMsg, 'EvolutionAPIForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (!evolutionForm.instance_token.trim()) {
      const errorMsg = "Token da instância é obrigatório";
      logError(errorMsg, 'EvolutionAPIForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (!companyId) {
      const errorMsg = "ID da empresa não encontrado";
      logError(errorMsg, 'EvolutionAPIForm', { companyId });
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      console.log('EvolutionAPIForm: Saving config with integrated validation:', {
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token,
        company_id: companyId
      });

      // O saveConfig agora inclui validação automática com QR Code usando configurações globais + empresa
      await saveConfig({
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token,
        api_url: '', // Será preenchido automaticamente com configuração global
        webhook_url: null,
        company_id: companyId,
        is_active: true,
        status: 'connected' as const // Será definido automaticamente se a validação passar
      });

      logInfo('Configuração Evolution API da instância salva e validada com sucesso', 'EvolutionAPIForm', {
        companyId,
        instanceName: evolutionForm.instance_name
      });

    } catch (error) {
      console.error('EvolutionAPIForm: Error saving Evolution config:', error);
      logError(`Erro ao salvar configuração Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionAPIForm', error);
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
            <p className="text-gray-600 mt-2">Carregando configurações...</p>
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
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Evolution API - Configuração da Instância</span>
          </div>
          {evolutionConfig && (
            <Badge className={
              evolutionConfig.status === 'connected' 
                ? "bg-green-100 text-green-800" 
                : evolutionConfig.status === 'testing'
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }>
              {evolutionConfig.status === 'connected' ? 'Conectado e Validado' : 
               evolutionConfig.status === 'testing' ? 'Testando' : 'Desconectado'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Integração Automática:</strong> Esta configuração utiliza automaticamente os dados globais 
            (URL base e chave principal) configurados nas <strong>Configurações do Sistema</strong> junto com 
            os dados específicos desta instância.
            <br /><br />
            <strong>Validação Automática:</strong> Ao salvar, o sistema irá validar automaticamente a configuração 
            tentando gerar um QR Code através da Evolution API.
          </p>
        </div>
        
        <form onSubmit={handleEvolutionSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evolution_instance">Nome da Instância *</Label>
            <Input
              id="evolution_instance"
              value={evolutionForm.instance_name}
              onChange={(e) => setEvolutionForm({...evolutionForm, instance_name: e.target.value})}
              placeholder="Ex: minha-instancia"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              Nome único da instância WhatsApp
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instance_token">Token da Instância *</Label>
            <Input
              id="instance_token"
              type="password"
              value={evolutionForm.instance_token}
              onChange={(e) => setEvolutionForm({...evolutionForm, instance_token: e.target.value})}
              placeholder="Token específico da instância"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              Token de acesso específico desta instância
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando e Validando..." : "Salvar e Validar Configuração"}
            </Button>
          </div>
          
          {evolutionConfig?.status === 'connected' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Configuração validada com sucesso!</strong> A instância foi testada através da geração de QR Code 
                usando as configurações globais do sistema. Agora você pode acessar a página <strong>QR Code</strong> no menu principal para conectar sua instância WhatsApp.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

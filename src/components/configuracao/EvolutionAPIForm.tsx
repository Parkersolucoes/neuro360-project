
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { useCompanies } from "@/hooks/useCompanies";
import { useEvolutionConfigActions } from "@/hooks/useEvolutionConfigActions";

interface EvolutionAPIFormProps {
  companyId: string;
}

export function EvolutionAPIForm({ companyId }: EvolutionAPIFormProps) {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { currentCompany } = useCompanies();
  const { config: evolutionConfig, saveConfig, loading } = useEvolutionConfig(companyId);
  const { generateSessionName } = useEvolutionConfigActions();

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    instance_token: "",
    webhook_url: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      console.log('EvolutionAPIForm: Loading existing config:', evolutionConfig);
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        instance_token: evolutionConfig.api_key || "",
        webhook_url: evolutionConfig.webhook_url || ""
      });
    } else {
      console.log('EvolutionAPIForm: No existing config, generating session name');
      // Gerar nome da sessão automaticamente
      if (currentCompany) {
        const sessionName = generateSessionName(currentCompany.name);
        setEvolutionForm({
          instance_name: sessionName,
          instance_token: "",
          webhook_url: ""
        });
      } else {
        setEvolutionForm({
          instance_name: "",
          instance_token: "",
          webhook_url: ""
        });
      }
    }
  }, [evolutionConfig, currentCompany, generateSessionName]);

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

      console.log('EvolutionAPIForm: Saving config with instance creation:', {
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token,
        webhook_url: evolutionForm.webhook_url,
        company_id: companyId
      });

      // O saveConfig agora inclui criação automática da instância usando configurações globais + empresa
      await saveConfig({
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token,
        api_url: '', // Será preenchido automaticamente com configuração global
        webhook_url: evolutionForm.webhook_url || null,
        company_id: companyId,
        is_active: true,
        status: 'connected' as const // Será definido automaticamente se a criação da instância passar
      });

      logInfo('Configuração Evolution API da instância salva e instância criada com sucesso', 'EvolutionAPIForm', {
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

  const generateNewSessionName = () => {
    if (currentCompany) {
      const newSessionName = generateSessionName(currentCompany.name);
      setEvolutionForm(prev => ({ ...prev, instance_name: newSessionName }));
      toast({
        title: "Nome gerado",
        description: `Novo nome de sessão: ${newSessionName}`
      });
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
              {evolutionConfig.status === 'connected' ? 'Instância Criada' : 
               evolutionConfig.status === 'testing' ? 'Testando' : 'Desconectado'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Criação Automática de Instância:</strong> Esta configuração utilizará automaticamente os dados globais 
            (URL base e chave principal) configurados nas <strong>Configurações do Sistema</strong> junto com 
            os dados específicos desta instância para criar uma nova instância no Evolution API.
            <br /><br />
            <strong>Nome da Sessão:</strong> O nome da instância será gerado automaticamente no formato: 
            <strong>primeiro_nome_da_empresa_YYYYMMDD</strong> ou você pode personalizar.
          </p>
        </div>
        
        <form onSubmit={handleEvolutionSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evolution_instance">Nome da Instância *</Label>
            <div className="flex space-x-2">
              <Input
                id="evolution_instance"
                value={evolutionForm.instance_name}
                onChange={(e) => setEvolutionForm({...evolutionForm, instance_name: e.target.value})}
                placeholder="Ex: minha-empresa_20241222"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateNewSessionName}
                className="whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Gerar
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Nome único da instância WhatsApp (será usado para criar nova instância)
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

          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook (Opcional)</Label>
            <Input
              id="webhook_url"
              type="url"
              value={evolutionForm.webhook_url}
              onChange={(e) => setEvolutionForm({...evolutionForm, webhook_url: e.target.value})}
              placeholder="https://seu-dominio.com/webhook/evolution"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              URL para receber notificações de eventos do WhatsApp
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Criando Instância..." : "Criar Instância WhatsApp"}
            </Button>
          </div>
          
          {evolutionConfig?.status === 'connected' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Instância criada com sucesso!</strong> A instância foi criada no Evolution API 
                usando as configurações globais do sistema. Agora você pode acessar a página <strong>QR Code</strong> 
                no menu principal para conectar sua instância WhatsApp.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { EvolutionApiService } from "@/services/evolutionApiService";
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
    instance_token: "",
    webhook_url: ""
  });

  const [isTesting, setIsTesting] = useState(false);

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      console.log('EvolutionAPIForm: Loading existing config:', evolutionConfig);
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        instance_token: evolutionConfig.api_key || "", // Reutilizando o campo api_key como token da instância
        webhook_url: evolutionConfig.webhook_url || ""
      });
    } else {
      console.log('EvolutionAPIForm: No existing config, using defaults');
      setEvolutionForm({
        instance_name: "",
        instance_token: "",
        webhook_url: ""
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
      // Obter configuração global
      const globalConfig = localStorage.getItem('evolution_global_config');
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      const { base_url } = JSON.parse(globalConfig);

      console.log('EvolutionAPIForm: Saving config with data:', {
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token,
        api_url: base_url,
        webhook_url: evolutionForm.webhook_url,
        company_id: companyId
      });

      await saveConfig({
        instance_name: evolutionForm.instance_name,
        api_key: evolutionForm.instance_token, // Salvando como api_key para compatibilidade
        api_url: base_url, // Usando a URL base global
        webhook_url: evolutionForm.webhook_url,
        company_id: companyId,
        is_active: true,
        status: 'disconnected' as const
      });

      logInfo('Configuração Evolution API da instância salva com sucesso', 'EvolutionAPIForm', {
        companyId,
        instanceName: evolutionForm.instance_name
      });

    } catch (error) {
      console.error('EvolutionAPIForm: Error saving Evolution config:', error);
      logError(`Erro ao salvar configuração Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionAPIForm', error);
    }
  };

  const handleTestConnection = async () => {
    if (!evolutionForm.instance_name || !evolutionForm.instance_token) {
      const errorMsg = "Nome da instância e token são obrigatórios para o teste";
      logError(errorMsg, 'EvolutionAPIForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Obter configuração global
      const globalConfig = localStorage.getItem('evolution_global_config');
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      const { base_url } = JSON.parse(globalConfig);

      logInfo('Testando conexão com instância Evolution API', 'EvolutionAPIForm', {
        api_url: base_url,
        instance_name: evolutionForm.instance_name
      });

      const isConnected = await EvolutionApiService.testConnection({
        api_url: base_url,
        api_key: evolutionForm.instance_token
      });

      if (isConnected) {
        toast({
          title: "Sucesso",
          description: "Conexão com a instância Evolution API estabelecida com sucesso!",
        });
        
        logInfo('Conexão com instância Evolution API estabelecida com sucesso', 'EvolutionAPIForm');
        
        // Atualizar status no banco se a configuração já existe
        if (evolutionConfig) {
          await saveConfig({
            instance_name: evolutionForm.instance_name,
            api_key: evolutionForm.instance_token,
            api_url: base_url,
            webhook_url: evolutionForm.webhook_url,
            company_id: companyId,
            is_active: true,
            status: 'connected' as const
          });
        }
      } else {
        const errorMsg = "Não foi possível conectar com a instância Evolution API. Verifique o token da instância.";
        logError(errorMsg, 'EvolutionAPIForm');
        toast({
          title: "Erro de Conexão",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('EvolutionAPIForm: Connection test failed:', error);
      logError(`Erro ao testar conexão com instância Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionAPIForm', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao testar conexão com a instância Evolution API",
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
              {evolutionConfig.status === 'connected' ? 'Conectado' : 
               evolutionConfig.status === 'testing' ? 'Testando' : 'Desconectado'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Configure primeiro a URL base e chave global da Evolution API nas 
            <strong> Configurações do Sistema</strong> antes de configurar as instâncias por empresa.
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
          <div className="space-y-2">
            <Label htmlFor="evolution_webhook">Webhook URL (Opcional)</Label>
            <Input
              id="evolution_webhook"
              value={evolutionForm.webhook_url}
              onChange={(e) => setEvolutionForm({...evolutionForm, webhook_url: e.target.value})}
              placeholder="https://seusite.com/webhook"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              URL para receber eventos desta instância
            </p>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? "Testando..." : "Testar Conexão"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


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
    api_url: "https://api.evolution.com",
    api_key: "",
    webhook_url: ""
  });

  const [isTesting, setIsTesting] = useState(false);

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      console.log('EvolutionAPIForm: Loading existing config:', evolutionConfig);
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        api_url: evolutionConfig.api_url || "https://api.evolution.com",
        api_key: evolutionConfig.api_key || "",
        webhook_url: evolutionConfig.webhook_url || ""
      });
    } else {
      console.log('EvolutionAPIForm: No existing config, using defaults');
      setEvolutionForm({
        instance_name: "",
        api_url: "https://api.evolution.com",
        api_key: "",
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

    if (!evolutionForm.api_key.trim()) {
      const errorMsg = "Chave da API é obrigatória";
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
      console.log('EvolutionAPIForm: Saving config with data:', {
        ...evolutionForm,
        company_id: companyId
      });

      await saveConfig({
        ...evolutionForm,
        company_id: companyId,
        is_active: true,
        status: 'disconnected' as const
      });

      logInfo('Configuração Evolution API salva com sucesso', 'EvolutionAPIForm', {
        companyId,
        instanceName: evolutionForm.instance_name
      });

    } catch (error) {
      console.error('EvolutionAPIForm: Error saving Evolution config:', error);
      logError(`Erro ao salvar configuração Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionAPIForm', error);
    }
  };

  const handleTestConnection = async () => {
    if (!evolutionForm.api_url || !evolutionForm.api_key) {
      const errorMsg = "URL da API e chave são obrigatórias para o teste";
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
      logInfo('Testando conexão com Evolution API', 'EvolutionAPIForm', {
        api_url: evolutionForm.api_url
      });

      const isConnected = await EvolutionApiService.testConnection({
        api_url: evolutionForm.api_url,
        api_key: evolutionForm.api_key
      });

      if (isConnected) {
        toast({
          title: "Sucesso",
          description: "Conexão com a Evolution API estabelecida com sucesso!",
        });
        
        logInfo('Conexão com Evolution API estabelecida com sucesso', 'EvolutionAPIForm');
        
        // Atualizar status no banco se a configuração já existe
        if (evolutionConfig) {
          await saveConfig({
            ...evolutionForm,
            company_id: companyId,
            is_active: true,
            status: 'connected' as const
          });
        }
      } else {
        const errorMsg = "Não foi possível conectar com a Evolution API. Verifique a URL e a chave da API.";
        logError(errorMsg, 'EvolutionAPIForm');
        toast({
          title: "Erro de Conexão",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('EvolutionAPIForm: Connection test failed:', error);
      logError(`Erro ao testar conexão com Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionAPIForm', error);
      toast({
        title: "Erro",
        description: "Erro ao testar conexão com a Evolution API",
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
            <span>Evolution API</span>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="evolution_url">URL da API *</Label>
            <Input
              id="evolution_url"
              value={evolutionForm.api_url}
              onChange={(e) => setEvolutionForm({...evolutionForm, api_url: e.target.value})}
              placeholder="https://api.evolution.com"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evolution_key">Chave da API *</Label>
            <Input
              id="evolution_key"
              type="password"
              value={evolutionForm.api_key}
              onChange={(e) => setEvolutionForm({...evolutionForm, api_key: e.target.value})}
              placeholder="Sua chave da API Evolution"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
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

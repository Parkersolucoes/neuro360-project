
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";

interface EvolutionAPIFormProps {
  companyId: string;
}

export function EvolutionAPIForm({ companyId }: EvolutionAPIFormProps) {
  const { toast } = useToast();
  const { config: evolutionConfig, saveConfig, loading } = useEvolutionConfig(companyId);

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    api_url: "https://api.evolution.com",
    api_key: "",
    webhook_url: ""
  });

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        api_url: evolutionConfig.api_url || "https://api.evolution.com",
        api_key: evolutionConfig.api_key || "",
        webhook_url: evolutionConfig.webhook_url || ""
      });
    } else {
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
      toast({
        title: "Erro",
        description: "Nome da instância é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!evolutionForm.api_key.trim()) {
      toast({
        title: "Erro",
        description: "Chave da API é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveConfig({
        ...evolutionForm,
        company_id: companyId,
        is_active: true,
        status: 'disconnected' as const
      });
    } catch (error) {
      console.error('Error saving Evolution config:', error);
    }
  };

  const handleTestConnection = async () => {
    toast({
      title: "Teste de Conexão",
      description: "Funcionalidade de teste será implementada em breve",
    });
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
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

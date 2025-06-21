
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, AlertTriangle } from "lucide-react";
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
    api_url: "",
    api_key: ""
  });

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name,
        api_url: evolutionConfig.api_url,
        api_key: evolutionConfig.api_key
      });
    } else {
      setEvolutionForm({
        instance_name: "",
        api_url: "",
        api_key: ""
      });
    }
  }, [evolutionConfig]);

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveConfig({
        ...evolutionForm,
        company_id: companyId,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving Evolution config:', error);
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
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Indisponível
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              A funcionalidade Evolution API está temporariamente indisponível. 
              A tabela de configurações precisa ser recriada no banco de dados.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleEvolutionSubmit} className="space-y-4 opacity-50">
          <div className="space-y-2">
            <Label htmlFor="evolution_instance">Nome da Instância</Label>
            <Input
              id="evolution_instance"
              value={evolutionForm.instance_name}
              onChange={(e) => setEvolutionForm({...evolutionForm, instance_name: e.target.value})}
              placeholder="Ex: minha-instancia"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evolution_url">URL da API</Label>
            <Input
              id="evolution_url"
              value={evolutionForm.api_url}
              onChange={(e) => setEvolutionForm({...evolutionForm, api_url: e.target.value})}
              placeholder="https://api.evolution.com"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evolution_key">Chave da API</Label>
            <Input
              id="evolution_key"
              type="password"
              value={evolutionForm.api_key}
              onChange={(e) => setEvolutionForm({...evolutionForm, api_key: e.target.value})}
              placeholder="Sua chave da API Evolution"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
          </div>
          <Button type="button" className="bg-gray-400 cursor-not-allowed" disabled>
            <Save className="w-4 h-4 mr-2" />
            Funcionalidade Indisponível
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

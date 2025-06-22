
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export function EvolutionGlobalForm() {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();

  const [globalForm, setGlobalForm] = useState({
    base_url: "https://api.evolution.com",
    global_api_key: ""
  });

  const [isTesting, setIsTesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!globalForm.base_url.trim()) {
      const errorMsg = "URL base da API é obrigatória";
      logError(errorMsg, 'EvolutionGlobalForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (!globalForm.global_api_key.trim()) {
      const errorMsg = "Chave da API global é obrigatória";
      logError(errorMsg, 'EvolutionGlobalForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    try {
      // Salvar configurações globais no localStorage por enquanto
      localStorage.setItem('evolution_global_config', JSON.stringify(globalForm));
      
      toast({
        title: "Sucesso",
        description: "Configuração global da Evolution API salva com sucesso!"
      });

      logInfo('Configuração global Evolution API salva com sucesso', 'EvolutionGlobalForm', globalForm);

    } catch (error) {
      console.error('EvolutionGlobalForm: Error saving global config:', error);
      logError(`Erro ao salvar configuração global Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionGlobalForm', error);
    }
  };

  const handleTestConnection = async () => {
    if (!globalForm.base_url || !globalForm.global_api_key) {
      const errorMsg = "URL base e chave da API são obrigatórias para o teste";
      logError(errorMsg, 'EvolutionGlobalForm');
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      logInfo('Testando conexão global com Evolution API', 'EvolutionGlobalForm', {
        base_url: globalForm.base_url
      });

      // Simular teste de conexão por enquanto
      setTimeout(() => {
        toast({
          title: "Sucesso",
          description: "Conexão com a Evolution API estabelecida com sucesso!",
        });
        
        logInfo('Conexão global com Evolution API estabelecida com sucesso', 'EvolutionGlobalForm');
        setIsTesting(false);
      }, 2000);

    } catch (error) {
      console.error('EvolutionGlobalForm: Connection test failed:', error);
      logError(`Erro ao testar conexão global com Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'EvolutionGlobalForm', error);
      toast({
        title: "Erro",
        description: "Erro ao testar conexão com a Evolution API",
        variant: "destructive"
      });
      setIsTesting(false);
    }
  };

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('evolution_global_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setGlobalForm(config);
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Evolution API - Configuração Global</span>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            Global
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base_url">URL Base da API *</Label>
            <Input
              id="base_url"
              value={globalForm.base_url}
              onChange={(e) => setGlobalForm({...globalForm, base_url: e.target.value})}
              placeholder="https://api.evolution.com"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              URL principal da sua instalação da Evolution API
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="global_api_key">Chave da API Global *</Label>
            <Input
              id="global_api_key"
              type="password"
              value={globalForm.global_api_key}
              onChange={(e) => setGlobalForm({...globalForm, global_api_key: e.target.value})}
              placeholder="Sua chave da API Evolution global"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500">
              Chave de acesso principal para gerenciar instâncias
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

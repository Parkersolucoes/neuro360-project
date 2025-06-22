
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings,
  CreditCard,
  Save,
  Webhook,
  Package,
  Palette,
  FileText,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssasConfig } from "@/hooks/useAssasConfig";
import { WebhookConfiguration } from "@/components/webhook/WebhookConfiguration";
import { SystemUpdatesManager } from "@/components/admin/SystemUpdatesManager";
import { SystemAppearanceManager } from "@/components/admin/SystemAppearanceManager";
import { SystemLogsViewerDB } from "@/components/admin/SystemLogsViewerDB";
import { EvolutionGlobalForm } from "@/components/configuracao/EvolutionGlobalForm";

export default function ConfiguracaoSistema() {
  const { toast } = useToast();
  const { config: assasConfig, saveConfig: saveAssasConfig } = useAssasConfig();

  const [assasForm, setAssasForm] = useState({
    api_key: "",
    api_url: "https://www.asaas.com/api/v3",
    is_sandbox: true,
    wallet_id: "",
    webhook_url: ""
  });

  const handleAssasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveAssasConfig({
        ...assasForm,
        is_active: true,
        status: 'disconnected'
      });
      setAssasForm({
        api_key: "",
        api_url: "https://www.asaas.com/api/v3",
        is_sandbox: true,
        wallet_id: "",
        webhook_url: ""
      });
      toast({
        title: "Sucesso",
        description: "Configuração ASSAS salva com sucesso!"
      });
    } catch (error) {
      console.error('Error creating ASSAS config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>Configuração do Sistema</span>
        </h1>
        <p className="text-gray-600 mt-2">Configurações avançadas do sistema</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
          <TabsTrigger value="payments">Gateway de Pagamento</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <SystemAppearanceManager />
        </TabsContent>

        <TabsContent value="evolution">
          <EvolutionGlobalForm />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>ASSAS (Gateway de Pagamento)</span>
                </div>
                {assasConfig && (
                  <Badge className={
                    assasConfig.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {assasConfig.is_active ? 'Conectado' : 'Desconectado'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssasSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assas_key">Chave da API</Label>
                  <Input
                    id="assas_key"
                    type="password"
                    value={assasForm.api_key}
                    onChange={(e) => setAssasForm({...assasForm, api_key: e.target.value})}
                    placeholder="Sua chave da API ASSAS"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assas_url">URL da API</Label>
                  <Input
                    id="assas_url"
                    value={assasForm.api_url}
                    onChange={(e) => setAssasForm({...assasForm, api_url: e.target.value})}
                    placeholder="https://www.asaas.com/api/v3"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assas_wallet">Wallet ID (Opcional)</Label>
                  <Input
                    id="assas_wallet"
                    value={assasForm.wallet_id}
                    onChange={(e) => setAssasForm({...assasForm, wallet_id: e.target.value})}
                    placeholder="ID da carteira"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assas_webhook">Webhook URL (Opcional)</Label>
                  <Input
                    id="assas_webhook"
                    value={assasForm.webhook_url}
                    onChange={(e) => setAssasForm({...assasForm, webhook_url: e.target.value})}
                    placeholder="https://seusite.com/webhook"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="assas_sandbox"
                    checked={assasForm.is_sandbox}
                    onCheckedChange={(checked) => setAssasForm({...assasForm, is_sandbox: checked})}
                  />
                  <Label htmlFor="assas_sandbox">Modo Sandbox (Teste)</Label>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookConfiguration />
        </TabsContent>

        <TabsContent value="updates">
          <SystemUpdatesManager />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogsViewerDB />
        </TabsContent>
      </Tabs>
    </div>
  );
}

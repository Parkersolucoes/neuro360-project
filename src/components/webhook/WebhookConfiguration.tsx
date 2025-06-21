
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Webhook, Save, Trash2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebhookConfig } from '@/hooks/useWebhookConfig';

const availableEvents = [
  { id: 'message.received', label: 'Mensagem Recebida', description: 'Quando uma nova mensagem é recebida' },
  { id: 'message.sent', label: 'Mensagem Enviada', description: 'Quando uma mensagem é enviada' },
  { id: 'user.created', label: 'Usuário Criado', description: 'Quando um novo usuário é criado' },
  { id: 'user.updated', label: 'Usuário Atualizado', description: 'Quando um usuário é atualizado' },
  { id: 'company.created', label: 'Empresa Criada', description: 'Quando uma nova empresa é criada' },
  { id: 'company.updated', label: 'Empresa Atualizada', description: 'Quando uma empresa é atualizada' },
  { id: 'template.used', label: 'Template Usado', description: 'Quando um template é utilizado' },
  { id: 'sql.executed', label: 'SQL Executado', description: 'Quando uma consulta SQL é executada' },
  { id: 'qr.connected', label: 'QR Conectado', description: 'Quando um QR Code é conectado' },
  { id: 'qr.disconnected', label: 'QR Desconectado', description: 'Quando um QR Code é desconectado' }
];

export function WebhookConfiguration() {
  const { config, loading, saveConfig, deleteConfig } = useWebhookConfig();
  const { toast } = useToast();

  const [form, setForm] = useState({
    webhook_url: '',
    webhook_secret: '',
    is_active: true,
    events: [] as string[]
  });

  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        webhook_url: config.webhook_url,
        webhook_secret: config.webhook_secret || '',
        is_active: config.is_active,
        events: config.events
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveConfig(form);
    } catch (error) {
      console.error('Error saving webhook config:', error);
    }
  };

  const handleEventToggle = (eventId: string) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const testWebhook = async () => {
    if (!config?.webhook_url) {
      toast({
        title: "Erro",
        description: "Configure um webhook antes de testar",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);

    try {
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Este é um teste do webhook configurado no sistema',
          system: 'WhatsApp Automation'
        }
      };

      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.webhook_secret && {
            'X-Webhook-Secret': config.webhook_secret
          })
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Webhook testado com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: `Teste falhou: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar webhook: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja remover a configuração do webhook?")) {
      try {
        await deleteConfig();
        setForm({
          webhook_url: '',
          webhook_secret: '',
          is_active: true,
          events: []
        });
      } catch (error) {
        console.error('Error deleting webhook config:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-blue-600" />
            <span>Configuração de Webhook</span>
          </div>
          {config && (
            <Badge className={
              config.is_active 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }>
              {config.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook *</Label>
            <Input
              id="webhook_url"
              type="url"
              value={form.webhook_url}
              onChange={(e) => setForm({...form, webhook_url: e.target.value})}
              placeholder="https://seu-servidor.com/webhook"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              URL onde os eventos serão enviados via POST
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Chave Secreta (Opcional)</Label>
            <Input
              id="webhook_secret"
              type="password"
              value={form.webhook_secret}
              onChange={(e) => setForm({...form, webhook_secret: e.target.value})}
              placeholder="Chave para validação de segurança"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Será enviada no header X-Webhook-Secret para validação
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({...form, is_active: checked})}
            />
            <Label htmlFor="is_active">Webhook Ativo</Label>
          </div>

          <div className="space-y-4">
            <Label>Eventos para Enviar</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={event.id}
                    checked={form.events.includes(event.id)}
                    onCheckedChange={() => handleEventToggle(event.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={event.id} className="text-sm font-medium">
                      {event.label}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
            
            {config && (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={testWebhook}
                  disabled={isTesting}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testando...' : 'Testar Webhook'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

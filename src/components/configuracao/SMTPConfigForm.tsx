
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Save, TestTube, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSMTPConfig } from "@/hooks/useSMTPConfig";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface SMTPConfigFormProps {
  companyId: string;
}

export function SMTPConfigForm({ companyId }: SMTPConfigFormProps) {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { config, loading, testing, saveConfig, testConnection } = useSMTPConfig(companyId);

  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    use_tls: true,
    use_ssl: false,
    from_email: "",
    from_name: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (config) {
      console.log('SMTPConfigForm: Loading existing config:', config);
      setFormData({
        smtp_host: config.smtp_host || "",
        smtp_port: config.smtp_port || 587,
        smtp_username: config.smtp_username || "",
        smtp_password: "", // Never show password
        use_tls: config.use_tls ?? true,
        use_ssl: config.use_ssl ?? false,
        from_email: config.from_email || "",
        from_name: config.from_name || ""
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.smtp_host.trim()) {
      toast({
        title: "Erro",
        description: "Servidor SMTP é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.smtp_username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.from_email.trim()) {
      toast({
        title: "Erro",
        description: "E-mail do remetente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!config?.id && !formData.smtp_password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para nova configuração",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      console.log('SMTPConfigForm: Saving config:', {
        ...formData,
        smtp_password: formData.smtp_password ? '[HIDDEN]' : '[NOT PROVIDED]',
        company_id: companyId
      });

      const configToSave = {
        ...formData,
        company_id: companyId,
        is_active: true
      };

      // Remove password if empty (for updates)
      if (!formData.smtp_password.trim() && config?.id) {
        delete (configToSave as any).smtp_password;
      }

      await saveConfig(configToSave);

      logInfo('Configuração SMTP salva com sucesso', 'SMTPConfigForm', {
        companyId,
        smtp_host: formData.smtp_host,
        smtp_port: formData.smtp_port
      });

    } catch (error) {
      console.error('SMTPConfigForm: Error saving SMTP config:', error);
      logError(`Erro ao salvar configuração SMTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'SMTPConfigForm', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.smtp_host.trim() || !formData.smtp_username.trim() || !formData.from_email.trim()) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos Servidor, Usuário e E-mail do Remetente para testar",
        variant: "destructive"
      });
      return;
    }

    const testData = {
      ...formData,
      company_id: companyId
    };

    // Remove password if empty and we have a saved config
    if (!formData.smtp_password.trim() && config?.id) {
      delete (testData as any).smtp_password;
    }

    await testConnection(testData);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Configuração SMTP - E-mail</span>
            </div>
            {config && (
              <Badge className={
                config.status === 'connected' 
                  ? "bg-green-100 text-green-800" 
                  : config.status === 'testing'
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }>
                {config.status === 'connected' ? 'Conectado' : 
                 config.status === 'testing' ? 'Testando' : 'Desconectado'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Configuração de E-mail SMTP:</strong> Configure os parâmetros do seu servidor 
              de e-mail para envio de mensagens automáticas do sistema. Suporta serviços como 
              Gmail, Outlook, SendGrid, Amazon SES e outros provedores SMTP.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">Servidor SMTP *</Label>
                <Input
                  id="smtp_host"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({...formData, smtp_host: e.target.value})}
                  placeholder="Ex: smtp.gmail.com"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500">
                  Endereço do servidor SMTP do seu provedor
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">Porta SMTP</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({...formData, smtp_port: parseInt(e.target.value) || 587})}
                  placeholder="587"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Porta padrão: 587 (TLS), 465 (SSL), 25 (sem criptografia)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_username">Nome de Usuário *</Label>
                <Input
                  id="smtp_username"
                  value={formData.smtp_username}
                  onChange={(e) => setFormData({...formData, smtp_username: e.target.value})}
                  placeholder="seu-email@dominio.com"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500">
                  Usuário para autenticação SMTP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_password">
                  Senha {config?.id ? "(deixe vazio para manter atual)" : "*"}
                </Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={formData.smtp_password}
                  onChange={(e) => setFormData({...formData, smtp_password: e.target.value})}
                  placeholder={config?.id ? "••••••••" : "Senha do e-mail"}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required={!config?.id}
                />
                <p className="text-sm text-gray-500">
                  Senha ou token de aplicativo para autenticação
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">E-mail do Remetente *</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({...formData, from_email: e.target.value})}
                  placeholder="sistema@empresa.com"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500">
                  E-mail que aparecerá como remetente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_name">Nome do Remetente</Label>
                <Input
                  id="from_name"
                  value={formData.from_name}
                  onChange={(e) => setFormData({...formData, from_name: e.target.value})}
                  placeholder="Sistema da Empresa"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Nome que aparecerá como remetente (opcional)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configurações de Segurança</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use_tls"
                    checked={formData.use_tls}
                    onCheckedChange={(checked) => setFormData({...formData, use_tls: checked})}
                  />
                  <Label htmlFor="use_tls">Usar TLS</Label>
                  <p className="text-sm text-gray-500 ml-2">(Recomendado)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="use_ssl"
                    checked={formData.use_ssl}
                    onCheckedChange={(checked) => setFormData({...formData, use_ssl: checked})}
                  />
                  <Label htmlFor="use_ssl">Usar SSL</Label>
                  <p className="text-sm text-gray-500 ml-2">(Para porta 465)</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Configuração"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || isSaving}
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>
            
            {config?.status === 'connected' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ SMTP Configurado!</strong> O servidor de e-mail está conectado e 
                  pronto para enviar mensagens. A configuração foi testada com sucesso.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

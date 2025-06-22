import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, Smartphone, QrCode, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { useCompanies } from "@/hooks/useCompanies";
import { useEvolutionConfigActions } from "@/hooks/useEvolutionConfigActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface EvolutionAPIFormProps {
  companyId: string;
}

export function EvolutionAPIForm({ companyId }: EvolutionAPIFormProps) {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { currentCompany } = useCompanies();
  const { config: evolutionConfig, saveConfig, loading } = useEvolutionConfig(companyId);
  const { generateSessionName, createInstanceWithQRCode, getGlobalEvolutionConfig, formatPhoneNumber } = useEvolutionConfigActions();

  const [evolutionForm, setEvolutionForm] = useState({
    instance_name: "",
    webhook_url: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Preencher o formulário da Evolution com dados existentes
  useEffect(() => {
    if (evolutionConfig) {
      console.log('EvolutionAPIForm: Loading existing config:', evolutionConfig);
      setEvolutionForm({
        instance_name: evolutionConfig.instance_name || "",
        webhook_url: evolutionConfig.webhook_url || ""
      });
    } else {
      console.log('EvolutionAPIForm: No existing config, generating session name');
      // Gerar nome da sessão automaticamente
      if (currentCompany) {
        const sessionName = generateSessionName(currentCompany.name);
        setEvolutionForm({
          instance_name: sessionName,
          webhook_url: ""
        });
      } else {
        setEvolutionForm({
          instance_name: "",
          webhook_url: ""
        });
      }
    }
  }, [evolutionConfig, currentCompany, generateSessionName]);

  const prepareConfirmationData = () => {
    if (!currentCompany?.phone) {
      toast({
        title: "Erro",
        description: "Número de telefone da empresa é obrigatório. Configure nas informações da empresa.",
        variant: "destructive"
      });
      return null;
    }

    const globalConfig = getGlobalEvolutionConfig();
    
    if (!globalConfig) {
      toast({
        title: "Erro",
        description: "Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.",
        variant: "destructive"
      });
      return null;
    }

    const formattedPhone = formatPhoneNumber(currentCompany.phone);
    
    return {
      globalConfig,
      instanceName: evolutionForm.instance_name,
      webhookUrl: evolutionForm.webhook_url || 'Não informado',
      companyPhone: currentCompany.phone,
      formattedPhone,
      companyName: currentCompany.name,
      integration: 'WHATSAPP-BAILEYS',
      events: [
        'APPLICATION_STARTUP',
        'QRCODE_UPDATED', 
        'MESSAGES_UPSERT',
        'CONNECTION_UPDATE',
        'CONTACTS_UPSERT',
        'CHATS_UPSERT'
      ]
    };
  };

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

    // Preparar dados para confirmação
    const confirmData = prepareConfirmationData();
    if (!confirmData) return;

    setConfirmationData(confirmData);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreation = async () => {
    try {
      setShowConfirmDialog(false);
      setIsSaving(true);
      setShowQRCode(false);
      setQrCodeData("");

      console.log('EvolutionAPIForm: Saving config with instance creation:', {
        instance_name: evolutionForm.instance_name,
        webhook_url: evolutionForm.webhook_url,
        company_id: companyId
      });

      // Usar createInstanceWithQRCode diretamente para ter controle do QR Code
      const createResult = await createInstanceWithQRCode({
        instance_name: evolutionForm.instance_name,
        company_phone: currentCompany!.phone
      });

      if (createResult.success) {
        // Salvar configuração no banco
        await saveConfig({
          instance_name: evolutionForm.instance_name,
          api_key: '', // Será preenchido automaticamente com configuração global
          api_url: '', // Será preenchido automaticamente com configuração global
          webhook_url: evolutionForm.webhook_url || null,
          company_id: companyId,
          is_active: true,
          status: 'connected' as const
        });

        // Mostrar QR Code se disponível
        if (createResult.qrCodeData) {
          setQrCodeData(createResult.qrCodeData);
          setShowQRCode(true);
          
          toast({
            title: "🎉 Sucesso!",
            description: "Instância criada e QR Code gerado! Escaneie o código abaixo para conectar.",
          });
        }

        logInfo('Configuração Evolution API da instância salva e instância criada com sucesso', 'EvolutionAPIForm', {
          companyId,
          instanceName: evolutionForm.instance_name,
          hasQRCode: !!createResult.qrCodeData
        });
      }

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
    <div className="space-y-6">
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
              (URL base e chave principal) configurados nas <strong>Configurações do Sistema</strong> para 
              criar uma nova instância no Evolution API com integração <strong>Baileys</strong>.
              <br /><br />
              <strong>Processo:</strong> Após criar a instância, o QR Code será gerado automaticamente na tela 
              para você conectar o WhatsApp imediatamente.
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
                Nome único da instância WhatsApp (será usado para criar nova instância com integração Baileys)
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
            
            {evolutionConfig?.status === 'connected' && !showQRCode && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ Instância criada com sucesso!</strong> A instância foi criada no Evolution API 
                  usando as configurações globais do sistema com integração <strong>Baileys</strong>. 
                  Acesse a página <strong>QR Code</strong> no menu principal para conectar sua instância WhatsApp.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>Confirmar Criação da Instância WhatsApp</span>
            </DialogTitle>
          </DialogHeader>
          
          {confirmationData && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                
                {/* Configurações Globais */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🌐 Configurações Globais da Evolution API</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>URL Base:</strong> {confirmationData.globalConfig.base_url}</p>
                    <p><strong>API Key:</strong> {confirmationData.globalConfig.global_api_key.substring(0, 12)}***</p>
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🏢 Dados da Empresa</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome:</strong> {confirmationData.companyName}</p>
                    <p><strong>Telefone Original:</strong> {confirmationData.companyPhone}</p>
                    <p><strong>Telefone Formatado:</strong> {confirmationData.formattedPhone}</p>
                  </div>
                </div>

                {/* Parâmetros da Instância */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Parâmetros da Instância</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome da Instância:</strong> {confirmationData.instanceName}</p>
                    <p><strong>Integração:</strong> {confirmationData.integration}</p>
                    <p><strong>Webhook URL:</strong> {confirmationData.webhookUrl}</p>
                    <p><strong>QR Code:</strong> Habilitado</p>
                    <p><strong>Webhook por Eventos:</strong> Desabilitado</p>
                    <p><strong>Webhook Base64:</strong> Desabilitado</p>
                  </div>
                </div>

                {/* Eventos Configurados */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">📡 Eventos Configurados</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {confirmationData.events.map((event: string, index: number) => (
                      <p key={index}>• {event}</p>
                    ))}
                  </div>
                </div>

                {/* Resumo da Requisição */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 Resumo da Requisição</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Endpoint:</strong> {confirmationData.globalConfig.base_url}/instance/create</p>
                    <p><strong>Método:</strong> POST</p>
                    <p><strong>Content-Type:</strong> application/json</p>
                    <p><strong>Autenticação:</strong> API Key no header</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmCreation}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {isSaving ? "Criando..." : "Confirmar e Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Display */}
      {showQRCode && qrCodeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-green-600" />
              <span>QR Code para Conexão WhatsApp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg mx-auto p-4">
                <img 
                  src={qrCodeData} 
                  alt="QR Code WhatsApp" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-green-700">
                  🎉 Instância criada com sucesso!
                </h3>
                <p className="text-sm text-gray-600">
                  1. Abra o WhatsApp no seu celular
                </p>
                <p className="text-sm text-gray-600">
                  2. Toque em Menu ou Configurações
                </p>
                <p className="text-sm text-gray-600">
                  3. Toque em "Aparelhos conectados"
                </p>
                <p className="text-sm text-gray-600">
                  4. Escaneie este código QR
                </p>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ Pronto para usar!</strong> Após escanear o QR Code, sua instância WhatsApp 
                  estará conectada e pronta para enviar mensagens. Você também pode acessar 
                  a página <strong>QR Code</strong> no menu principal para gerenciar a conexão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

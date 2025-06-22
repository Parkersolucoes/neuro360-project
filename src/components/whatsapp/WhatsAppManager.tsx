
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Phone } from "lucide-react";
import { useWhatsAppMessages } from "@/hooks/useWhatsAppMessages";
import { useCompanies } from "@/hooks/useCompanies";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";
import { Badge } from "@/components/ui/badge";

export function WhatsAppManager() {
  const { currentCompany } = useCompanies();
  const { integration } = useWebhookIntegration(currentCompany?.id);
  const { messages, loading, sendMessage } = useWhatsAppMessages();
  
  const [messageForm, setMessageForm] = useState({
    to_number: "",
    content: ""
  });
  
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.to_number.trim() || !messageForm.content.trim()) {
      return;
    }

    try {
      setIsSending(true);
      await sendMessage({
        to_number: messageForm.to_number,
        content: messageForm.content,
        evolution_config_id: integration?.id
      });
      
      setMessageForm({ to_number: "", content: "" });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  if (!currentCompany) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Selecione uma empresa para gerenciar mensagens do WhatsApp</p>
        </CardContent>
      </Card>
    );
  }

  if (!integration) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Configure a integração webhook primeiro na página Conexão WhatsApp</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enviar Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-500" />
            <span>Enviar Mensagem WhatsApp</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to_number">Número do WhatsApp *</Label>
              <Input
                id="to_number"
                value={messageForm.to_number}
                onChange={(e) => setMessageForm({...messageForm, to_number: formatPhoneNumber(e.target.value)})}
                placeholder="5511999999999"
                required
              />
              <p className="text-sm text-gray-500">Digite apenas números (DDI + DDD + número)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Mensagem *</Label>
              <Textarea
                id="content"
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                placeholder="Digite sua mensagem..."
                className="min-h-[100px]"
                required
              />
            </div>
            
            <Button type="submit" disabled={isSending} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Histórico de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span>Histórico de Mensagens</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.direction === 'outbound' 
                      ? 'bg-blue-50 border-blue-200 ml-8' 
                      : 'bg-gray-50 border-gray-200 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {message.direction === 'outbound' 
                          ? `Para: ${message.to_number}` 
                          : `De: ${message.from_number}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        message.status === 'delivered' ? 'default' :
                        message.status === 'read' ? 'secondary' :
                        message.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {message.status === 'sent' ? 'Enviada' :
                         message.status === 'delivered' ? 'Entregue' :
                         message.status === 'read' ? 'Lida' : 'Falhou'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                  {message.media_url && (
                    <div className="mt-2">
                      <a 
                        href={message.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver mídia anexa
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

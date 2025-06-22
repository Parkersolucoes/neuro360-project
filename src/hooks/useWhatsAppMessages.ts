
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppMessage {
  id: string;
  company_id: string;
  evolution_config_id: string | null;
  message_id: string | null;
  from_number: string;
  to_number: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  media_url: string | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  created_at: string;
  updated_at: string;
}

export function useWhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens do WhatsApp",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData: {
    to_number: string;
    content: string;
    message_type?: 'text' | 'image' | 'audio' | 'video' | 'document';
    media_url?: string;
    evolution_config_id?: string;
  }) => {
    try {
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          company_id: currentCompany.id,
          evolution_config_id: messageData.evolution_config_id || null,
          from_number: 'system', // Sistema enviando
          to_number: messageData.to_number,
          message_type: messageData.message_type || 'text',
          content: messageData.content,
          media_url: messageData.media_url || null,
          status: 'sent',
          direction: 'outbound'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso"
      });

      await fetchMessages();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed') => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da mensagem",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentCompany]);

  return {
    messages,
    loading,
    sendMessage,
    updateMessageStatus,
    refetch: fetchMessages
  };
}

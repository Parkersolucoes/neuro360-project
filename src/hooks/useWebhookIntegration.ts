
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookIntegration {
  id: string;
  company_id: string;
  qrcode_webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SaveWebhookData {
  company_id: string;
  qrcode_webhook_url: string;
  is_active: boolean;
}

export function useWebhookIntegration(companyId?: string) {
  const [integration, setIntegration] = useState<WebhookIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegration = async () => {
    if (!companyId) {
      setIntegration(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Carregando configuração para empresa:', companyId);
      
      const { data, error } = await supabase
        .from('webhook_integrations')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        throw error;
      }

      if (data) {
        const mappedData: WebhookIntegration = {
          id: data.id,
          company_id: data.company_id,
          qrcode_webhook_url: data.webhook_url || '',
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setIntegration(mappedData);
        console.log('✅ Configuração carregada:', mappedData);
      } else {
        setIntegration(null);
        console.log('ℹ️ Nenhuma configuração encontrada');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar configuração:', error);
      
      // Mensagem de erro mais específica baseada no tipo de erro
      let errorMessage = "Erro ao carregar configuração";
      if (error?.code === 'PGRST116') {
        errorMessage = "Configuração não encontrada";
      } else if (error?.message?.includes('permission')) {
        errorMessage = "Erro de permissão: Verifique se você tem acesso à empresa";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (data: SaveWebhookData) => {
    try {
      console.log('💾 Salvando configuração:', data);

      // Verificar se usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let result;
      
      if (integration) {
        // Atualizar existente
        result = await supabase
          .from('webhook_integrations')
          .update({
            webhook_url: data.qrcode_webhook_url,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', integration.id)
          .select()
          .single();
      } else {
        // Criar novo
        result = await supabase
          .from('webhook_integrations')
          .insert({
            company_id: data.company_id,
            webhook_url: data.qrcode_webhook_url,
            is_active: data.is_active
          })
          .select()
          .single();
      }
      
      if (result.error) {
        console.error('❌ Erro ao salvar configuração:', result.error);
        throw result.error;
      }
      
      console.log('✅ Configuração salva com sucesso:', result.data);
      
      // Atualizar estado local
      const mappedData: WebhookIntegration = {
        id: result.data.id,
        company_id: result.data.company_id,
        qrcode_webhook_url: result.data.webhook_url || '',
        is_active: result.data.is_active,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at
      };
      setIntegration(mappedData);
      
      toast({
        title: "Sucesso",
        description: "Caminho salvo com sucesso!"
      });
      
      return mappedData;
    } catch (error: any) {
      console.error('❌ Erro ao salvar configuração:', error);
      
      let errorMessage = "Erro ao salvar caminho";
      
      // Tratamento de erros específicos
      if (error?.code === '42501') {
        errorMessage = "Erro de permissão: Acesso negado";
      } else if (error?.message?.includes('violates row-level security')) {
        errorMessage = "Erro de permissão: Política de segurança violada";
      } else if (error?.message?.includes('not authenticated')) {
        errorMessage = "Erro de autenticação: Faça login novamente";
      } else if (error?.message?.includes('duplicate')) {
        errorMessage = "Erro: Configuração já existe para esta empresa";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, [companyId]);

  return {
    integration,
    loading,
    saveIntegration,
    refetch: fetchIntegration
  };
}

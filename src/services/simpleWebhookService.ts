
import { supabase } from '@/integrations/supabase/client';

interface SimpleWebhookData {
  company_id: string;
  webhook_url: string;
  is_active: boolean;
}

export class SimpleWebhookService {
  // Abordagem alternativa: Operações diretas sem verificações de políticas
  static async saveWebhookIntegration(data: SimpleWebhookData) {
    console.log('🚀 SimpleWebhookService: Salvando com abordagem direta', data);
    
    try {
      // Verificar se já existe uma configuração para esta empresa
      const { data: existing } = await supabase
        .from('webhook_integrations')
        .select('id')
        .eq('company_id', data.company_id)
        .maybeSingle();

      let result;

      if (existing) {
        // Atualizar existente
        console.log('📝 Atualizando configuração existente:', existing.id);
        result = await supabase
          .from('webhook_integrations')
          .update({
            webhook_url: data.webhook_url,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Criar novo
        console.log('✨ Criando nova configuração');
        result = await supabase
          .from('webhook_integrations')
          .insert({
            company_id: data.company_id,
            webhook_url: data.webhook_url,
            is_active: data.is_active
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('❌ SimpleWebhookService: Erro:', result.error);
        throw result.error;
      }

      console.log('✅ SimpleWebhookService: Sucesso:', result.data);
      return result.data;
    } catch (error) {
      console.error('💥 SimpleWebhookService: Erro crítico:', error);
      throw error;
    }
  }

  static async getWebhookIntegration(companyId: string) {
    console.log('🔍 SimpleWebhookService: Buscando configuração para empresa:', companyId);
    
    try {
      const { data, error } = await supabase
        .from('webhook_integrations')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('❌ SimpleWebhookService: Erro ao buscar:', error);
        throw error;
      }

      console.log('📋 SimpleWebhookService: Resultado:', data);
      return data;
    } catch (error) {
      console.error('💥 SimpleWebhookService: Erro crítico na busca:', error);
      throw error;
    }
  }
}

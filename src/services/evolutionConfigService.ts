
import { supabase } from '@/integrations/supabase/client';
import type { EvolutionConfig, CreateEvolutionConfigData, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export class EvolutionConfigService {
  static async fetchByCompanyId(companyId: string): Promise<EvolutionConfig | null> {
    const { data, error } = await supabase
      .from('evolution_configs')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
    }

    return null;
  }

  static async create(configData: CreateEvolutionConfigData): Promise<EvolutionConfig> {
    const { data, error } = await supabase
      .from('evolution_configs')
      .insert({
        ...configData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      status: data.status as 'connected' | 'disconnected' | 'testing'
    };
  }

  static async update(id: string, updates: UpdateEvolutionConfigData): Promise<EvolutionConfig> {
    const { data, error } = await supabase
      .from('evolution_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      status: data.status as 'connected' | 'disconnected' | 'testing'
    };
  }
}

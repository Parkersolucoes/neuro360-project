
export interface EvolutionConfig {
  id: string;
  company_id: string;
  api_url: string;
  api_key: string;
  instance_name: string;
  webhook_url: string | null;
  number: string | null;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  created_at: string;
  updated_at: string;
}

export type EvolutionConfigStatus = 'connected' | 'disconnected' | 'testing';

export type CreateEvolutionConfigData = Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>;

export type UpdateEvolutionConfigData = Partial<EvolutionConfig>;

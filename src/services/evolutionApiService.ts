
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  id: string;
  company_id: string;
  api_url: string;
  api_key: string;
  instance_name: string;
  webhook_url: string | null;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'testing';
}

export interface QRCodeResponse {
  qrCode: string;
  status: string;
  message?: string;
}

export interface InstanceStatus {
  instance: string;
  status: 'open' | 'close' | 'connecting';
  qrCode?: string;
}

export class EvolutionApiService {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) {
    const url = `${this.config.api_url}${endpoint}`;
    
    console.log(`Evolution API: Making ${method} request to ${url}`);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.api_key,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Evolution API: Response received:', data);
      return data;
    } catch (error) {
      console.error('Evolution API: Request failed:', error);
      throw error;
    }
  }

  async createInstance(): Promise<any> {
    return this.makeRequest(`/instance/create`, 'POST', {
      instanceName: this.config.instance_name,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    });
  }

  async getInstanceStatus(): Promise<InstanceStatus> {
    return this.makeRequest(`/instance/connectionState/${this.config.instance_name}`);
  }

  async generateQRCode(): Promise<QRCodeResponse> {
    try {
      // Primeiro, verificar se a instância existe
      await this.createInstance();
      
      // Gerar QR Code
      const response = await this.makeRequest(`/instance/connect/${this.config.instance_name}`, 'GET');
      
      if (response.qrcode) {
        return {
          qrCode: response.qrcode,
          status: 'waiting',
          message: 'QR Code gerado com sucesso'
        };
      }
      
      throw new Error('QR Code não foi gerado pela API');
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async disconnectInstance(): Promise<any> {
    return this.makeRequest(`/instance/logout/${this.config.instance_name}`, 'DELETE');
  }

  async deleteInstance(): Promise<any> {
    return this.makeRequest(`/instance/delete/${this.config.instance_name}`, 'DELETE');
  }

  async sendMessage(number: string, message: string): Promise<any> {
    return this.makeRequest(`/message/sendText/${this.config.instance_name}`, 'POST', {
      number: number,
      text: message
    });
  }

  static async testConnection(config: Partial<EvolutionConfig>): Promise<boolean> {
    try {
      const response = await fetch(`${config.api_url}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.api_key || '',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }
}

// Função helper para obter o serviço da Evolution API
export const getEvolutionApiService = async (companyId: string): Promise<EvolutionApiService | null> => {
  try {
    const { data: config, error } = await supabase
      .from('evolution_configs')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (error || !config) {
      console.log('No active Evolution config found for company:', companyId);
      return null;
    }

    return new EvolutionApiService({
      ...config,
      status: config.status as 'connected' | 'disconnected' | 'testing'
    });
  } catch (error) {
    console.error('Error getting Evolution API service:', error);
    return null;
  }
};

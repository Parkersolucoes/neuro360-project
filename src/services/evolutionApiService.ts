import { supabase } from '@/integrations/supabase/client';
import type { EvolutionConfig } from '@/types/evolutionConfig';

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

export interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
  webhook?: string;
  qrcode?: {
    pairingCode?: string;
    code?: string;
    base64?: string;
  };
}

export interface SendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: string;
  status: string;
}

export class EvolutionApiService {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) {
    const url = `${this.config.api_url}${endpoint}`;
    
    console.log(`Evolution API: Making ${method} request to ${url}`);
    
    // Log detalhado dos parâmetros quando é um POST para criar instância
    if (method === 'POST' && (endpoint.includes('/instance/create') || endpoint.includes('/instance/'))) {
      console.log('🚀 EVOLUTION API - PARÂMETROS DETALHADOS DA REQUISIÇÃO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 ENDPOINT:', url);
      console.log('📤 MÉTODO:', method);
      console.log('📋 HEADERS:');
      console.log('   Content-Type: application/json');
      console.log('   apikey:', this.config.api_key);
      console.log('📦 BODY DA REQUISIÇÃO (JSON):');
      console.log(JSON.stringify(body, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Log específico do número formatado
      if (body?.number) {
        console.log('📱 DETALHES DO NÚMERO FORMATADO:');
        console.log('   • Número no body:', body.number);
        console.log('   • Formato esperado: 55 + DDD + Número');
        console.log('   • Exemplo: 5511999999999');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    }
    
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

  async createInstanceWithQRCode(phoneNumber?: string): Promise<CreateInstanceResponse & { qrCodeData?: string }> {
    console.log('Evolution API: Creating instance with QR Code:', this.config.instance_name, 'Phone:', phoneNumber);
    
    // Usar número da configuração se não fornecido como parâmetro
    const numberToUse = phoneNumber || this.config.number;
    
    if (!numberToUse) {
      throw new Error('Número de telefone é obrigatório para criar a instância');
    }
    
    const requestBody = {
      instanceName: this.config.instance_name,
      token: this.config.api_key,
      number: numberToUse, // Número formatado da empresa no body da requisição
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhookUrl: this.config.webhook_url || undefined,
      webhookByEvents: false,
      webhookBase64: false,
      events: [
        'APPLICATION_STARTUP',
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'CONTACTS_SET',
        'CONTACTS_UPSERT',
        'CONTACTS_UPDATE',
        'PRESENCE_UPDATE',
        'CHATS_SET',
        'CHATS_UPSERT',
        'CHATS_UPDATE',
        'CHATS_DELETE',
        'GROUPS_UPSERT',
        'GROUP_UPDATE',
        'GROUP_PARTICIPANTS_UPDATE',
        'CONNECTION_UPDATE',
        'CALL',
        'NEW_JWT_TOKEN'
      ],
      // Parâmetros da instância seguindo o modelo especificado
      instance: {
        instanceName: this.config.instance_name,
        instanceId: undefined, // Será gerado pela API
        webhook_wa_business: this.config.webhook_url || null,
        access_token_wa_business: "",
        status: "created"
      }
    };

    const response = await this.makeRequest(`/instance/create`, 'POST', requestBody);
    
    // Extrair QR Code da resposta se disponível
    let qrCodeData;
    if (response.qrcode) {
      qrCodeData = response.qrcode.base64 || response.qrcode.code;
    }
    
    return {
      ...response,
      qrCodeData
    };
  }

  async createInstance(phoneNumber?: string): Promise<CreateInstanceResponse> {
    console.log('Evolution API: Creating instance:', this.config.instance_name, 'Phone:', phoneNumber);
    
    // Usar número da configuração se não fornecido como parâmetro
    const numberToUse = phoneNumber || this.config.number;
    
    if (!numberToUse) {
      throw new Error('Número de telefone é obrigatório para criar a instância');
    }
    
    const requestBody = {
      instanceName: this.config.instance_name,
      token: this.config.api_key,
      number: numberToUse, // Número formatado da empresa no body da requisição
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhookUrl: this.config.webhook_url || undefined,
      webhookByEvents: false,
      webhookBase64: false,
      events: [
        'APPLICATION_STARTUP',
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'CONTACTS_SET',
        'CONTACTS_UPSERT',
        'CONTACTS_UPDATE',
        'PRESENCE_UPDATE',
        'CHATS_SET',
        'CHATS_UPSERT',
        'CHATS_UPDATE',
        'CHATS_DELETE',
        'GROUPS_UPSERT',
        'GROUP_UPDATE',
        'GROUP_PARTICIPANTS_UPDATE',
        'CONNECTION_UPDATE',
        'CALL',
        'NEW_JWT_TOKEN'
      ],
      // Parâmetros da instância seguindo o modelo especificado
      instance: {
        instanceName: this.config.instance_name,
        instanceId: undefined, // Será gerado pela API
        webhook_wa_business: this.config.webhook_url || null,
        access_token_wa_business: "",
        status: "created"
      }
    };

    return this.makeRequest(`/instance/create`, 'POST', requestBody);
  }

  async getInstanceStatus(): Promise<InstanceStatus> {
    return this.makeRequest(`/instance/connectionState/${this.config.instance_name}`);
  }

  async generateQRCode(): Promise<QRCodeResponse> {
    try {
      const response = await this.makeRequest(`/instance/connect/${this.config.instance_name}`, 'GET');
      
      if (response.base64) {
        return {
          qrCode: response.base64,
          status: 'waiting',
          message: 'QR Code gerado com sucesso'
        };
      }
      
      if (response.code) {
        return {
          qrCode: response.code,
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

  async sendTextMessage(number: string, message: string): Promise<SendMessageResponse> {
    return this.makeRequest(`/message/sendText/${this.config.instance_name}`, 'POST', {
      number: number,
      text: message
    });
  }

  async sendMediaMessage(number: string, mediaUrl: string, caption?: string): Promise<SendMessageResponse> {
    return this.makeRequest(`/message/sendMedia/${this.config.instance_name}`, 'POST', {
      number: number,
      mediaMessage: {
        media: mediaUrl,
        caption: caption || ''
      }
    });
  }

  async getMessages(limit: number = 50): Promise<any[]> {
    return this.makeRequest(`/chat/findMessages/${this.config.instance_name}?limit=${limit}`);
  }

  async configureWebhook(webhookUrl: string): Promise<any> {
    return this.makeRequest(`/webhook/set/${this.config.instance_name}`, 'POST', {
      url: webhookUrl,
      events: [
        'QRCODE_UPDATED',
        'CONNECTION_UPDATE',
        'MESSAGES_UPSERT',
        'MESSAGE_UPDATE',
        'PRESENCE_UPDATE'
      ]
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

// Função para salvar mensagem no banco de dados
export const saveMessageToDatabase = async (
  companyId: string,
  evolutionConfigId: string,
  messageData: {
    message_id?: string;
    from_number: string;
    to_number: string;
    content: string;
    message_type?: string;
    direction: 'inbound' | 'outbound';
    status?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        company_id: companyId,
        evolution_config_id: evolutionConfigId,
        message_id: messageData.message_id || null,
        from_number: messageData.from_number,
        to_number: messageData.to_number,
        content: messageData.content,
        message_type: messageData.message_type || 'text',
        direction: messageData.direction,
        status: messageData.status || 'sent'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message to database:', error);
    throw error;
  }
};

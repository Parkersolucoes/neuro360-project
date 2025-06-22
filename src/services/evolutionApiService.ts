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

  private async logSystemError(message: string, details?: any) {
    try {
      await supabase
        .from('system_logs')
        .insert({
          level: 'error',
          message,
          component: 'EvolutionApiService',
          details
        });
    } catch (error) {
      console.error('Failed to log system error:', error);
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) {
    const url = `${this.config.api_url}${endpoint}`;
    
    console.log(`Evolution API: Making ${method} request to ${url}`);
    
    // Log detalhado dos parâmetros quando é um POST para criar instância
    if (method === 'POST' && (endpoint.includes('/instance/create') || endpoint.includes('/instance/'))) {
      console.log('🚀 EVOLUTION API - REQUISIÇÃO DETALHADA:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 URL COMPLETA:', url);
      console.log('📤 MÉTODO HTTP:', method);
      console.log('📋 HEADERS DA REQUISIÇÃO:');
      console.log('   • Content-Type: application/json');
      console.log('   • apikey:', this.config.api_key.substring(0, 12) + '***');
      console.log('📦 CORPO DA REQUISIÇÃO (JSON):');
      console.log(JSON.stringify(body, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Log específico de cada parâmetro
      if (body) {
        console.log('🔍 DETALHAMENTO DOS PARÂMETROS:');
        console.log('   • instanceName:', body.instanceName || 'NÃO INFORMADO');
        console.log('   • token:', body.token === "" ? '(VAZIO - CONFORME ESPECIFICADO)' : body.token);
        console.log('   • qrcode:', body.qrcode);
        console.log('   • number:', body.number || 'NÃO INFORMADO');
        console.log('   • integration:', body.integration || 'NÃO INFORMADO');
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
        const errorMessage = `HTTP error! status: ${response.status}`;
        const errorDetails = {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          body: body
        };
        
        console.error('Evolution API: Request failed:', errorDetails);
        await this.logSystemError(`Falha na requisição Evolution API: ${errorMessage}`, errorDetails);
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Evolution API: Resposta recebida com sucesso:', data);
      return data;
    } catch (error) {
      const errorMessage = `Erro na comunicação com Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      const errorDetails = {
        url,
        method,
        body,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      console.error('Evolution API: Request failed:', errorDetails);
      await this.logSystemError(errorMessage, errorDetails);
      
      throw error;
    }
  }

  async createInstanceWithQRCode(phoneNumber?: string): Promise<CreateInstanceResponse & { qrCodeData?: string }> {
    console.log('Evolution API: Creating instance with QR Code:', this.config.instance_name, 'Phone:', phoneNumber);
    
    // Usar número da configuração se não fornecido como parâmetro
    const numberToUse = phoneNumber || this.config.number;
    
    if (!numberToUse) {
      const errorMessage = 'Número de telefone é obrigatório para criar a instância';
      await this.logSystemError(errorMessage, { config: this.config });
      throw new Error(errorMessage);
    }
    
    // Estrutura exata conforme especificado
    const requestBody = {
      instanceName: this.config.instance_name,
      token: "", // Enviado em branco conforme especificado
      qrcode: true,
      number: numberToUse, // Número sem formatação (como cadastrado na empresa)
      integration: "Baileys" // Tipo Baileys conforme especificado
    };

    try {
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
    } catch (error) {
      const errorMessage = `Falha ao criar instância Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      await this.logSystemError(errorMessage, { 
        instanceName: this.config.instance_name,
        number: numberToUse,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  async createInstance(phoneNumber?: string): Promise<CreateInstanceResponse> {
    console.log('Evolution API: Creating instance:', this.config.instance_name, 'Phone:', phoneNumber);
    
    // Usar número da configuração se não fornecido como parâmetro
    const numberToUse = phoneNumber || this.config.number;
    
    if (!numberToUse) {
      throw new Error('Número de telefone é obrigatório para criar a instância');
    }
    
    // Estrutura exata conforme especificado
    const requestBody = {
      instanceName: this.config.instance_name,
      token: "", // Enviado em branco conforme especificado
      qrcode: true,
      number: numberToUse, // Número sem formatação (como cadastrado na empresa)
      integration: "Baileys" // Tipo Baileys conforme especificado
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

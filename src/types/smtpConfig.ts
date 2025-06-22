
export interface SMTPConfig {
  id: string;
  company_id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password_encrypted: string;
  use_tls: boolean;
  use_ssl: boolean;
  from_email: string;
  from_name?: string;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  created_at: string;
  updated_at: string;
}

export interface CreateSMTPConfigData {
  company_id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls: boolean;
  use_ssl: boolean;
  from_email: string;
  from_name?: string;
  is_active: boolean;
}

export interface UpdateSMTPConfigData extends Partial<CreateSMTPConfigData> {
  status?: 'connected' | 'disconnected' | 'testing';
}

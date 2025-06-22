
export interface SQLConnection {
  id: string;
  name: string;
  host: string;
  database_name: string;
  username: string;
  password_encrypted: string;
  port: number;
  company_id: string;
  connection_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
}

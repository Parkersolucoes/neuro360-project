
export interface SQLQuery {
  id: string;
  connection_id: string;
  name: string;
  description?: string;
  query_text: string;
  last_execution?: string;
  status: 'success' | 'error' | 'pending' | 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  company_id: string;
  sql_connections?: {
    name: string;
  };
}

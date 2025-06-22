export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string
          document: string
          email: string
          id: string
          name: string
          phone: string | null
          plan_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document: string
          email: string
          id?: string
          name: string
          phone?: string | null
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          plan_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_sql_connections: number
          max_sql_queries: number
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_sql_connections?: number
          max_sql_queries?: number
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_sql_connections?: number
          max_sql_queries?: number
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      query_executions: {
        Row: {
          connection_id: string | null
          error_message: string | null
          executed_at: string
          execution_time: number | null
          id: string
          query_id: string | null
          result_data: Json | null
          rows_affected: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          connection_id?: string | null
          error_message?: string | null
          executed_at?: string
          execution_time?: number | null
          id?: string
          query_id?: string | null
          result_data?: Json | null
          rows_affected?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          connection_id?: string | null
          error_message?: string | null
          executed_at?: string
          execution_time?: number | null
          id?: string
          query_id?: string | null
          result_data?: Json | null
          rows_affected?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_executions_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "sql_queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schedulings: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          message_content: string
          name: string
          recipients: Json
          scheduled_for: string
          sent_at: string | null
          status: string
          template_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          message_content: string
          name: string
          recipients?: Json
          scheduled_for: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          message_content?: string
          name?: string
          recipients?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedulings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedulings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      smtp_configs: {
        Row: {
          company_id: string
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          is_active: boolean
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port: number
          smtp_username: string
          status: string
          updated_at: string
          use_ssl: boolean
          use_tls: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          is_active?: boolean
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port?: number
          smtp_username: string
          status?: string
          updated_at?: string
          use_ssl?: boolean
          use_tls?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          is_active?: boolean
          smtp_host?: string
          smtp_password_encrypted?: string
          smtp_port?: number
          smtp_username?: string
          status?: string
          updated_at?: string
          use_ssl?: boolean
          use_tls?: boolean
        }
        Relationships: []
      }
      sql_connections: {
        Row: {
          company_id: string
          connection_type: string
          created_at: string
          database_name: string
          host: string
          id: string
          name: string
          password_encrypted: string
          port: number
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          company_id: string
          connection_type?: string
          created_at?: string
          database_name: string
          host: string
          id?: string
          name: string
          password_encrypted: string
          port?: number
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          company_id?: string
          connection_type?: string
          created_at?: string
          database_name?: string
          host?: string
          id?: string
          name?: string
          password_encrypted?: string
          port?: number
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "sql_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sql_queries: {
        Row: {
          company_id: string | null
          connection_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          query_text: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          query_text: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          query_text?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_queries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sql_queries_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "sql_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sql_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configs: {
        Row: {
          company_id: string
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          company_id: string
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          company_id: string | null
          component: string | null
          created_at: string
          details: Json | null
          id: string
          level: string
          message: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          component?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          component?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_updates: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          title: string
          update_date: string
          updated_at: string
          version: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          title: string
          update_date: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          update_date?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          payment_method: string | null
          plan_id: string | null
          processed_at: string | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          processed_at?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          processed_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_primary: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          department: string
          email: string
          id: string
          is_admin: string
          name: string
          password_hash: string | null
          phone: string
          role: string
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          id?: string
          is_admin?: string
          name: string
          password_hash?: string | null
          phone: string
          role?: string
          status?: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          id?: string
          is_admin?: string
          name?: string
          password_hash?: string | null
          phone?: string
          role?: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_master_user: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      user_has_company_access: {
        Args: { company_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      validate_user_password: {
        Args: { user_email: string; user_password: string }
        Returns: {
          id: string
          name: string
          email: string
          role: string
          is_admin: string
          is_master: boolean
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
      evolution_configs: {
        Row: {
          api_key: string
          api_url: string
          company_id: string
          created_at: string
          id: string
          instance_name: string
          is_active: boolean
          status: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_url?: string
          company_id: string
          created_at?: string
          id?: string
          instance_name: string
          is_active?: boolean
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_url?: string
          company_id?: string
          created_at?: string
          id?: string
          instance_name?: string
          is_active?: boolean
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          company_id: string | null
          content: string
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      qr_sessions: {
        Row: {
          company_id: string | null
          connected_at: string | null
          created_at: string
          evolution_config_id: string | null
          id: string
          instance_data: Json | null
          instance_name: string | null
          last_activity: string | null
          phone_number: string | null
          qr_code: string | null
          session_name: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_data?: Json | null
          instance_name?: string | null
          last_activity?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_data?: Json | null
          instance_name?: string | null
          last_activity?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_sessions_evolution_config_id_fkey"
            columns: ["evolution_config_id"]
            isOneToOne: false
            referencedRelation: "evolution_configs"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "query_executions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "sql_connections"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "schedulings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string | null
          company_id: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          status: string | null
          type: string | null
          updated_at: string
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      is_master_user_check: {
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

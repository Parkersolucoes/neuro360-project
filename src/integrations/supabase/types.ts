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
      assas_configs: {
        Row: {
          api_key: string
          company_id: string | null
          created_at: string
          environment: string
          id: string
          is_active: boolean
          updated_at: string
          wallet_id: string | null
        }
        Insert: {
          api_key: string
          company_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          wallet_id?: string | null
        }
        Update: {
          api_key?: string
          company_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assas_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
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
          company_id: string | null
          created_at: string
          id: string
          instance_name: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          api_key: string
          api_url: string
          company_id?: string | null
          created_at?: string
          id?: string
          instance_name: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_url?: string
          company_id?: string | null
          created_at?: string
          id?: string
          instance_name?: string
          is_active?: boolean
          updated_at?: string
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
      plan_templates: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_templates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          is_master_user: boolean
          is_test_user: boolean
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean
          is_master_user?: boolean
          is_test_user?: boolean
          name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          is_master_user?: boolean
          is_test_user?: boolean
          name?: string | null
          role?: string
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
          instance_name: string | null
          last_activity: string | null
          phone_number: string | null
          qr_code_data: string | null
          session_name: string
          session_status: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_name?: string | null
          last_activity?: string | null
          phone_number?: string | null
          qr_code_data?: string | null
          session_name: string
          session_status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_name?: string | null
          last_activity?: string | null
          phone_number?: string | null
          qr_code_data?: string | null
          session_name?: string
          session_status?: string | null
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
      sql_connections: {
        Row: {
          company_id: string | null
          connection_type: string
          created_at: string
          database_name: string
          host: string
          id: string
          is_active: boolean
          name: string
          password: string
          port: number
          updated_at: string
          username: string
        }
        Insert: {
          company_id?: string | null
          connection_type?: string
          created_at?: string
          database_name: string
          host: string
          id?: string
          is_active?: boolean
          name: string
          password: string
          port?: number
          updated_at?: string
          username: string
        }
        Update: {
          company_id?: string | null
          connection_type?: string
          created_at?: string
          database_name?: string
          host?: string
          id?: string
          is_active?: boolean
          name?: string
          password?: string
          port?: number
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
          connection_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          query_text: string
          updated_at: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          query_text: string
          updated_at?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          query_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sql_queries_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "sql_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configs: {
        Row: {
          created_at: string
          id: string
          login_background_image: string | null
          primary_color: string | null
          system_description: string | null
          system_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_background_image?: string | null
          primary_color?: string | null
          system_description?: string | null
          system_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          login_background_image?: string | null
          primary_color?: string | null
          system_description?: string | null
          system_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          title: string
          update_date: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean
          title: string
          update_date?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          update_date?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          status: string
          subscription_id: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
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
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
          is_admin: boolean
          is_master: boolean
          name: string
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
          is_admin?: boolean
          is_master?: boolean
          name: string
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
          is_admin?: boolean
          is_master?: boolean
          name?: string
          phone?: string
          role?: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          company_id: string | null
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          secret_token: string | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          secret_token?: string | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          secret_token?: string | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_user_check: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_master_user: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_master_user_check: {
        Args: { user_uuid?: string }
        Returns: boolean
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

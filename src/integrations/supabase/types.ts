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
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          master_password_hash: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_password_hash: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_password_hash?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assas_configs: {
        Row: {
          api_key: string
          api_url: string
          created_at: string
          id: string
          is_sandbox: boolean
          status: string
          updated_at: string
          user_id: string
          wallet_id: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_url?: string
          created_at?: string
          id?: string
          is_sandbox?: boolean
          status?: string
          updated_at?: string
          user_id: string
          wallet_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_url?: string
          created_at?: string
          id?: string
          is_sandbox?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
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
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_key: string
          api_url: string
          company_id?: string | null
          created_at?: string
          id?: string
          instance_name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_key?: string
          api_url?: string
          company_id?: string | null
          created_at?: string
          id?: string
          instance_name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
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
          connected_at: string | null
          created_at: string
          evolution_config_id: string | null
          id: string
          instance_name: string
          last_activity: string | null
          qr_code_data: string | null
          session_status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_name: string
          last_activity?: string | null
          qr_code_data?: string | null
          session_status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          evolution_config_id?: string | null
          id?: string
          instance_name?: string
          last_activity?: string | null
          qr_code_data?: string | null
          session_status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
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
          created_at: string
          database_name: string
          id: string
          name: string
          password: string
          port: string
          server: string
          status: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          database_name: string
          id?: string
          name: string
          password: string
          port?: string
          server: string
          status?: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          database_name?: string
          id?: string
          name?: string
          password?: string
          port?: string
          server?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      sql_queries: {
        Row: {
          connection_id: string | null
          created_at: string
          description: string | null
          id: string
          last_execution: string | null
          name: string
          query_text: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_execution?: string | null
          name: string
          query_text: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_execution?: string | null
          name?: string
          query_text?: string
          status?: string
          updated_at?: string
          user_id?: string | null
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
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          payment_method: string | null
          status: string
          subscription_id: string | null
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          transaction_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          company_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_user: {
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

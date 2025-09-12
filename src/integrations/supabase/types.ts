export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      consent_analyses: {
        Row: {
          analyzed_at: string | null
          consent_decision: string | null
          created_at: string | null
          document_title: string
          id: string
          individual_terms_decisions: Json | null
          original_text: string | null
          risk_items: Json
          risk_score: number
          summary_sections: Json
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          consent_decision?: string | null
          created_at?: string | null
          document_title: string
          id?: string
          individual_terms_decisions?: Json | null
          original_text?: string | null
          risk_items?: Json
          risk_score: number
          summary_sections?: Json
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          consent_decision?: string | null
          created_at?: string | null
          document_title?: string
          id?: string
          individual_terms_decisions?: Json | null
          original_text?: string | null
          risk_items?: Json
          risk_score?: number
          summary_sections?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          api_key: string | null
          ccpa_compliance_check: boolean | null
          company_name: string | null
          contact_email: string | null
          created_at: string
          email_notifications: boolean | null
          enable_analytics: boolean | null
          enhanced_privacy_analysis: boolean | null
          gdpr_compliance_check: boolean | null
          id: string
          risk_threshold: number | null
          updated_at: string
          user_id: string
          webhook_consent_created: boolean | null
          webhook_consent_updated: boolean | null
          webhook_risk_detected: boolean | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          ccpa_compliance_check?: boolean | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          email_notifications?: boolean | null
          enable_analytics?: boolean | null
          enhanced_privacy_analysis?: boolean | null
          gdpr_compliance_check?: boolean | null
          id?: string
          risk_threshold?: number | null
          updated_at?: string
          user_id: string
          webhook_consent_created?: boolean | null
          webhook_consent_updated?: boolean | null
          webhook_risk_detected?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          ccpa_compliance_check?: boolean | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          email_notifications?: boolean | null
          enable_analytics?: boolean | null
          enhanced_privacy_analysis?: boolean | null
          gdpr_compliance_check?: boolean | null
          id?: string
          risk_threshold?: number | null
          updated_at?: string
          user_id?: string
          webhook_consent_created?: boolean | null
          webhook_consent_updated?: boolean | null
          webhook_risk_detected?: boolean | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          average_risk_score: number | null
          consent_decisions_count: number | null
          created_at: string | null
          high_risk_analyses: number | null
          id: string
          last_active: string | null
          total_analyses: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_risk_score?: number | null
          consent_decisions_count?: number | null
          created_at?: string | null
          high_risk_analyses?: number | null
          id?: string
          last_active?: string | null
          total_analyses?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_risk_score?: number | null
          consent_decisions_count?: number | null
          created_at?: string | null
          high_risk_analyses?: number | null
          id?: string
          last_active?: string | null
          total_analyses?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_stats: {
        Args: { is_high_risk: boolean; new_risk_score: number; user_id: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

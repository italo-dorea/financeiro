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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bill_occurrences: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          drive_url: string | null
          due_date: string
          family_id: string
          id: string
          installment: number | null
          name: string
          note: string | null
          paid: boolean
          payment_date: string | null
          received: boolean
          rule_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          drive_url?: string | null
          due_date: string
          family_id: string
          id?: string
          installment?: number | null
          name: string
          note?: string | null
          paid?: boolean
          payment_date?: string | null
          received?: boolean
          rule_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          drive_url?: string | null
          due_date?: string
          family_id?: string
          id?: string
          installment?: number | null
          name?: string
          note?: string | null
          paid?: boolean
          payment_date?: string | null
          received?: boolean
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_occurrences_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_occurrences_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "bill_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_rules: {
        Row: {
          amount: number
          created_at: string | null
          delegate_id: string | null
          description: string | null
          drive_url: string | null
          family_id: string
          first_due_date: string
          id: string
          is_recurring: boolean | null
          name: string
          note: string | null
          periodicity: string | null
          repeat_until: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          delegate_id?: string | null
          description?: string | null
          drive_url?: string | null
          family_id: string
          first_due_date: string
          id?: string
          is_recurring?: boolean | null
          name: string
          note?: string | null
          periodicity?: string | null
          repeat_until?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          delegate_id?: string | null
          description?: string | null
          drive_url?: string | null
          family_id?: string
          first_due_date?: string
          id?: string
          is_recurring?: boolean | null
          name?: string
          note?: string | null
          periodicity?: string | null
          repeat_until?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      families: {
        Row: {
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          bank_pix_key: string | null
          created_at: string
          end_date: string | null
          facilitator: string | null
          facilitator_contact: string | null
          facilitator_name: string | null
          id: string
          name: string
          observations: string | null
          sponsor_id: string | null
          start_date: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          bank_pix_key?: string | null
          created_at?: string
          end_date?: string | null
          facilitator?: string | null
          facilitator_contact?: string | null
          facilitator_name?: string | null
          id?: string
          name: string
          observations?: string | null
          sponsor_id?: string | null
          start_date?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          bank_pix_key?: string | null
          created_at?: string
          end_date?: string | null
          facilitator?: string | null
          facilitator_contact?: string | null
          facilitator_name?: string | null
          id?: string
          name?: string
          observations?: string | null
          sponsor_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_future_installments: {
        Args: { p_installments_count: number; p_rule_id: string }
        Returns: undefined
      }
    }
    Enums: {
      periodicity: "weekly" | "monthly" | "yearly"
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
    Enums: {
      periodicity: ["weekly", "monthly", "yearly"],
    },
  },
} as const

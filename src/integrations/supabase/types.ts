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
      "1": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      allowance_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      auto_saves: {
        Row: {
          created_at: string
          form_data: Json
          form_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data: Json
          form_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          form_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      capital_history: {
        Row: {
          amount: number
          approval_date: string | null
          created_at: string
          effective_date: string | null
          id: string
          new_capital: number
          notes: string | null
          previous_capital: number
          status: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          approval_date?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          new_capital: number
          notes?: string | null
          previous_capital: number
          status?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          approval_date?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          new_capital?: number
          notes?: string | null
          previous_capital?: number
          status?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      capital_management: {
        Row: {
          available_capital: number
          created_at: string
          fiscal_year: number
          id: string
          last_updated: string
          notes: string | null
          reserved_capital: number
          total_capital: number
          turnover_rate: number | null
        }
        Insert: {
          available_capital: number
          created_at?: string
          fiscal_year: number
          id?: string
          last_updated?: string
          notes?: string | null
          reserved_capital: number
          total_capital: number
          turnover_rate?: number | null
        }
        Update: {
          available_capital?: number
          created_at?: string
          fiscal_year?: number
          id?: string
          last_updated?: string
          notes?: string | null
          reserved_capital?: number
          total_capital?: number
          turnover_rate?: number | null
        }
        Relationships: []
      }
      cash_flow: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      client_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: Json | null
          category_id: string | null
          contact_person: string | null
          cr_number: string | null
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string
          phone: string | null
          type: string
          vat_number: string | null
        }
        Insert: {
          address?: Json | null
          category_id?: string | null
          contact_person?: string | null
          cr_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          phone?: string | null
          type: string
          vat_number?: string | null
        }
        Update: {
          address?: Json | null
          category_id?: string | null
          contact_person?: string | null
          cr_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          phone?: string | null
          type?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "client_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          created_at: string
          document_url: string | null
          expiry_date: string
          id: string
          issue_date: string
          metadata: Json | null
          number: string | null
          reminder_days: number[] | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          expiry_date: string
          id?: string
          issue_date: string
          metadata?: Json | null
          number?: string | null
          reminder_days?: number[] | null
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string
          metadata?: Json | null
          number?: string | null
          reminder_days?: number[] | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          commercial_registration: string
          company_name: string
          company_type: string
          created_at: string
          establishment_date: string
          id: string
        }
        Insert: {
          commercial_registration: string
          company_name: string
          company_type: string
          created_at?: string
          establishment_date: string
          id?: string
        }
        Update: {
          commercial_registration?: string
          company_name?: string
          company_type?: string
          created_at?: string
          establishment_date?: string
          id?: string
        }
        Relationships: []
      }
      company_partners: {
        Row: {
          contact_info: Json | null
          created_at: string
          documents: Json | null
          id: string
          name: string
          ownership_percentage: number
          partner_type: string | null
          share_value: number | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          documents?: Json | null
          id?: string
          name: string
          ownership_percentage: number
          partner_type?: string | null
          share_value?: number | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          documents?: Json | null
          id?: string
          name?: string
          ownership_percentage?: number
          partner_type?: string | null
          share_value?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          base_salary: number | null
          birth_date: string
          branch: string | null
          contract_type: string
          created_at: string
          created_by: string
          department: string
          documents: Json | null
          email: string
          employment_number: string | null
          gosi_subscription: number | null
          housing_allowance: number | null
          id: string
          identity_number: string
          joining_date: string
          name: string
          nationality: string
          other_allowances: Json | null
          phone: string
          photo_url: string | null
          position: string
          salary: number
          transportation_allowance: number | null
        }
        Insert: {
          base_salary?: number | null
          birth_date: string
          branch?: string | null
          contract_type: string
          created_at?: string
          created_by: string
          department: string
          documents?: Json | null
          email: string
          employment_number?: string | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          identity_number: string
          joining_date: string
          name: string
          nationality: string
          other_allowances?: Json | null
          phone: string
          photo_url?: string | null
          position: string
          salary: number
          transportation_allowance?: number | null
        }
        Update: {
          base_salary?: number | null
          birth_date?: string
          branch?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string
          department?: string
          documents?: Json | null
          email?: string
          employment_number?: string | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          identity_number?: string
          joining_date?: string
          name?: string
          nationality?: string
          other_allowances?: Json | null
          phone?: string
          photo_url?: string | null
          position?: string
          salary?: number
          transportation_allowance?: number | null
        }
        Relationships: []
      }
      financials: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          paid_date: string | null
          recurring: boolean | null
          reference_id: string | null
          reference_type: string | null
          status: string
          transaction_type: string | null
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          recurring?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          recurring?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_type?: string | null
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string
          reference_id: string
          reference_type: string
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority: string
          reference_id: string
          reference_type: string
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          reference_id?: string
          reference_type?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      project_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string
          date: string
          description: string | null
          id: string
          project_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          id?: string
          project_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          project_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date: string
          project_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          attachments: Json | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          attachments: Json | null
          budget: number | null
          category_id: string | null
          client_id: string | null
          completed_tasks: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          manager_id: string | null
          notes: string | null
          priority: string
          profit: number | null
          progress: number | null
          revenue: number | null
          stakeholders: Json | null
          start_date: string
          status: string
          tags: string[] | null
          team_members: Json | null
          title: string
          total_tasks: number | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          attachments?: Json | null
          budget?: number | null
          category_id?: string | null
          client_id?: string | null
          completed_tasks?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          priority?: string
          profit?: number | null
          progress?: number | null
          revenue?: number | null
          stakeholders?: Json | null
          start_date: string
          status?: string
          tags?: string[] | null
          team_members?: Json | null
          title: string
          total_tasks?: number | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          attachments?: Json | null
          budget?: number | null
          category_id?: string | null
          client_id?: string | null
          completed_tasks?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          priority?: string
          profit?: number | null
          progress?: number | null
          revenue?: number | null
          stakeholders?: Json | null
          start_date?: string
          status?: string
          tags?: string[] | null
          team_members?: Json | null
          title?: string
          total_tasks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_records: {
        Row: {
          base_salary: number
          created_at: string
          deductions: Json | null
          employee_id: string | null
          gosi_subscription: number | null
          housing_allowance: number | null
          id: string
          other_allowances: Json | null
          payment_date: string
          status: string | null
          total_salary: number
          transportation_allowance: number | null
        }
        Insert: {
          base_salary: number
          created_at?: string
          deductions?: Json | null
          employee_id?: string | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          other_allowances?: Json | null
          payment_date: string
          status?: string | null
          total_salary: number
          transportation_allowance?: number | null
        }
        Update: {
          base_salary?: number
          created_at?: string
          deductions?: Json | null
          employee_id?: string | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          other_allowances?: Json | null
          payment_date?: string
          status?: string | null
          total_salary?: number
          transportation_allowance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      T: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      zakat_calculations: {
        Row: {
          annual_profits: number
          capital_amount: number
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          payment_date: string | null
          status: string | null
          tax_amount: number
          user_id: string
          year: number
          zakat_amount: number
        }
        Insert: {
          annual_profits: number
          capital_amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string | null
          status?: string | null
          tax_amount: number
          user_id?: string
          year: number
          zakat_amount: number
        }
        Update: {
          annual_profits?: number
          capital_amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string | null
          status?: string | null
          tax_amount?: number
          user_id?: string
          year?: number
          zakat_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

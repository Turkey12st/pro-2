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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_transactions: {
        Row: {
          account_id: string | null
          auto_generated: boolean | null
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          journal_entry_id: string | null
          reference_id: string
          reference_type: string
          status: string | null
          transaction_date: string
        }
        Insert: {
          account_id?: string | null
          auto_generated?: boolean | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          reference_id: string
          reference_type: string
          status?: string | null
          transaction_date: string
        }
        Update: {
          account_id?: string | null
          auto_generated?: boolean | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          reference_id?: string
          reference_type?: string
          status?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_logs: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          reference_id: string
          reference_type: string
          scheduled_for: string | null
          sent_at: string | null
          sent_via: string[] | null
          status: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          reference_id: string
          reference_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_via?: string[] | null
          status?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          reference_id?: string
          reference_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_via?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
      allowance_types: {
        Row: {
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      api_integrations: {
        Row: {
          api_key_encrypted: string | null
          configuration: Json | null
          created_at: string
          endpoint: string
          events: string[] | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          endpoint: string
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          endpoint?: string
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          approved_by: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          created_by: string | null
          date: string
          employee_id: string | null
          id: string
          late_minutes: number | null
          notes: string | null
          overtime_minutes: number | null
          status: string
        }
        Insert: {
          approved_by?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          employee_id?: string | null
          id?: string
          late_minutes?: number | null
          notes?: string | null
          overtime_minutes?: number | null
          status?: string
        }
        Update: {
          approved_by?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          late_minutes?: number | null
          notes?: string | null
          overtime_minutes?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_saves: {
        Row: {
          created_at: string
          form_data: Json
          form_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data: Json
          form_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          form_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_integration: {
        Row: {
          account_number: string
          api_credentials_encrypted: string | null
          bank_name: string
          created_at: string
          iban: string
          id: string
          last_sync: string | null
          status: string | null
          sync_settings: Json | null
        }
        Insert: {
          account_number: string
          api_credentials_encrypted?: string | null
          bank_name: string
          created_at?: string
          iban: string
          id?: string
          last_sync?: string | null
          status?: string | null
          sync_settings?: Json | null
        }
        Update: {
          account_number?: string
          api_credentials_encrypted?: string | null
          bank_name?: string
          created_at?: string
          iban?: string
          id?: string
          last_sync?: string | null
          status?: string | null
          sync_settings?: Json | null
        }
        Relationships: []
      }
      capital: {
        Row: {
          amount: number
          id: number
        }
        Insert: {
          amount: number
          id?: number
        }
        Update: {
          amount?: number
          id?: number
        }
        Relationships: []
      }
      capital_history: {
        Row: {
          amount: number
          approval_date: string | null
          created_at: string
          effective_date: string | null
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
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          balance_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level: number
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          balance_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: number
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          balance_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: number
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      company_Info: {
        Row: {
          address: Json | null
          bank_iban: string | null
          bank_name: string | null
          commercial_registration: string
          company_name: string
          company_type: string
          created_at: string
          economic_activity: string | null
          establishment_date: string
          hrsd_number: string | null
          id: string
          license_expiry_date: string | null
          metadata: Json | null
          nitaqat_activity: string | null
          social_insurance_number: string | null
          tax_number: string | null
          "Unified National Number": number
        }
        Insert: {
          address?: Json | null
          bank_iban?: string | null
          bank_name?: string | null
          commercial_registration: string
          company_name: string
          company_type: string
          created_at?: string
          economic_activity?: string | null
          establishment_date: string
          hrsd_number?: string | null
          id?: string
          license_expiry_date?: string | null
          metadata?: Json | null
          nitaqat_activity?: string | null
          social_insurance_number?: string | null
          tax_number?: string | null
          "Unified National Number": number
        }
        Update: {
          address?: Json | null
          bank_iban?: string | null
          bank_name?: string | null
          commercial_registration?: string
          company_name?: string
          company_type?: string
          created_at?: string
          economic_activity?: string | null
          establishment_date?: string
          hrsd_number?: string | null
          id?: string
          license_expiry_date?: string | null
          metadata?: Json | null
          nitaqat_activity?: string | null
          social_insurance_number?: string | null
          tax_number?: string | null
          "Unified National Number"?: number
        }
        Relationships: []
      }
      company_partners: {
        Row: {
          contact_info: Json | null
          created_at: string
          documents: Json | null
          name: string
          ownership_percentage: number
          partner_type: string | null
          share_value: number | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          documents?: Json | null
          name: string
          ownership_percentage: number
          partner_type?: string | null
          share_value?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          documents?: Json | null
          name?: string
          ownership_percentage?: number
          partner_type?: string | null
          share_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_type: string
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type: string
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          configuration: Json | null
          created_at: string
          email_address: string
          email_type: string
          id: string
          is_active: boolean | null
          smtp_password_encrypted: string | null
          smtp_port: number | null
          smtp_server: string | null
          smtp_username: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          email_address: string
          email_type: string
          id?: string
          is_active?: boolean | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_server?: string | null
          smtp_username?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          email_address?: string
          email_type?: string
          id?: string
          is_active?: boolean | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_server?: string | null
          smtp_username?: string | null
        }
        Relationships: []
      }
      employee_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          balance: number | null
          created_at: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_benefits: {
        Row: {
          amount: number
          benefit_type: string
          created_at: string
          created_by: string | null
          date: string
          employee_id: string | null
          id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          amount: number
          benefit_type: string
          created_at?: string
          created_by?: string | null
          date: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          benefit_type?: string
          created_at?: string
          created_by?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_incentives: {
        Row: {
          amount: number
          approved_by: string | null
          award_date: string | null
          awarded_for: string | null
          calculation_basis: Json | null
          created_at: string | null
          created_by: string | null
          employee_id: string | null
          id: string
          incentive_type: string
          journal_entry_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          award_date?: string | null
          awarded_for?: string | null
          calculation_basis?: Json | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          id?: string
          incentive_type: string
          journal_entry_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          award_date?: string | null
          awarded_for?: string | null
          calculation_basis?: Json | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          id?: string
          incentive_type?: string
          journal_entry_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_incentives_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_incentives_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance: {
        Row: {
          attendance_rate: number | null
          created_at: string | null
          employee_id: string | null
          evaluated_by: string | null
          evaluation_date: string | null
          evaluation_period: string
          goals_achieved: number | null
          id: string
          kpi_metrics: Json | null
          notes: string | null
          overtime_hours: number | null
          performance_score: number | null
          projects_completed: number | null
          tasks_completed: number | null
          total_goals: number | null
        }
        Insert: {
          attendance_rate?: number | null
          created_at?: string | null
          employee_id?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_period: string
          goals_achieved?: number | null
          id?: string
          kpi_metrics?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          performance_score?: number | null
          projects_completed?: number | null
          tasks_completed?: number | null
          total_goals?: number | null
        }
        Update: {
          attendance_rate?: number | null
          created_at?: string | null
          employee_id?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_period?: string
          goals_achieved?: number | null
          id?: string
          kpi_metrics?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          performance_score?: number | null
          projects_completed?: number | null
          tasks_completed?: number | null
          total_goals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_violations: {
        Row: {
          action_taken: string | null
          auto_generated: boolean | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          employee_id: string | null
          id: string
          severity: string | null
          status: string | null
          type: string
        }
        Insert: {
          action_taken?: string | null
          auto_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          employee_id?: string | null
          id?: string
          severity?: string | null
          status?: string | null
          type: string
        }
        Update: {
          action_taken?: string | null
          auto_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          employee_id?: string | null
          id?: string
          severity?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_violations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number | null
          birth_date: string
          branch: string | null
          company_gosi_contribution: number | null
          contract_type: string
          cost_breakdown: Json | null
          created_at: string
          created_by: string
          department: string
          documents: Json | null
          documents_expiry: Json | null
          email: string
          employee_gosi_contribution: number | null
          employee_type: string | null
          employment_number: string | null
          gosi_details: Json | null
          gosi_subscription: number | null
          housing_allowance: number | null
          id: string
          identity_number: string
          joining_date: string
          labor_fees: number | null
          medical_insurance_cost: number | null
          name: string
          nationality: string
          other_allowances: Json | null
          phone: string
          photo_url: string | null
          position: string
          salary: number
          transfer_fees: number | null
          transportation_allowance: number | null
          visa_fees: number | null
        }
        Insert: {
          base_salary?: number | null
          birth_date: string
          branch?: string | null
          company_gosi_contribution?: number | null
          contract_type: string
          cost_breakdown?: Json | null
          created_at?: string
          created_by: string
          department: string
          documents?: Json | null
          documents_expiry?: Json | null
          email: string
          employee_gosi_contribution?: number | null
          employee_type?: string | null
          employment_number?: string | null
          gosi_details?: Json | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          identity_number: string
          joining_date: string
          labor_fees?: number | null
          medical_insurance_cost?: number | null
          name: string
          nationality: string
          other_allowances?: Json | null
          phone: string
          photo_url?: string | null
          position: string
          salary: number
          transfer_fees?: number | null
          transportation_allowance?: number | null
          visa_fees?: number | null
        }
        Update: {
          base_salary?: number | null
          birth_date?: string
          branch?: string | null
          company_gosi_contribution?: number | null
          contract_type?: string
          cost_breakdown?: Json | null
          created_at?: string
          created_by?: string
          department?: string
          documents?: Json | null
          documents_expiry?: Json | null
          email?: string
          employee_gosi_contribution?: number | null
          employee_type?: string | null
          employment_number?: string | null
          gosi_details?: Json | null
          gosi_subscription?: number | null
          housing_allowance?: number | null
          id?: string
          identity_number?: string
          joining_date?: string
          labor_fees?: number | null
          medical_insurance_cost?: number | null
          name?: string
          nationality?: string
          other_allowances?: Json | null
          phone?: string
          photo_url?: string | null
          position?: string
          salary?: number
          transfer_fees?: number | null
          transportation_allowance?: number | null
          visa_fees?: number | null
        }
        Relationships: []
      }
      example_table: {
        Row: {
          data: string | null
          id: number
        }
        Insert: {
          data?: string | null
          id?: never
        }
        Update: {
          data?: string | null
          id?: never
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
      government_fees: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          effective_date: string
          id: string
          status: string | null
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          effective_date: string
          id?: string
          status?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          effective_date?: string
          id?: string
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      government_integration: {
        Row: {
          api_endpoint: string
          api_key_encrypted: string | null
          configuration: Json | null
          created_at: string
          error_log: Json | null
          id: string
          last_sync: string | null
          status: string
          sync_frequency: string | null
          system_type: string
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          error_log?: Json | null
          id?: string
          last_sync?: string | null
          status?: string
          sync_frequency?: string | null
          system_type: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          error_log?: Json | null
          id?: string
          last_sync?: string | null
          status?: string
          sync_frequency?: string | null
          system_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hr_regulations: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          rules: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          rules?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          rules?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event: string
          execution_time_ms: number | null
          id: string
          integration_id: string
          payload: Json | null
          response: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event: string
          execution_time_ms?: number | null
          id?: string
          integration_id: string
          payload?: Json | null
          response?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event?: string
          execution_time_ms?: number | null
          id?: string
          integration_id?: string
          payload?: Json | null
          response?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string
          entry_date: string
          entry_name: string | null
          entry_type: string | null
          exchange_rate: number | null
          financial_statement_section: string | null
          id: string
          is_approved: boolean | null
          is_recurring: boolean | null
          posted_at: string | null
          posted_by: string | null
          recurrence_pattern: Json | null
          reference_number: string | null
          status: string | null
          tags: string[] | null
          total_credit: number | null
          total_debit: number | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description: string
          entry_date: string
          entry_name?: string | null
          entry_type?: string | null
          exchange_rate?: number | null
          financial_statement_section?: string | null
          id?: string
          is_approved?: boolean | null
          is_recurring?: boolean | null
          posted_at?: string | null
          posted_by?: string | null
          recurrence_pattern?: Json | null
          reference_number?: string | null
          status?: string | null
          tags?: string[] | null
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string
          entry_date?: string
          entry_name?: string | null
          entry_type?: string | null
          exchange_rate?: number | null
          financial_statement_section?: string | null
          id?: string
          is_approved?: boolean | null
          is_recurring?: boolean | null
          posted_at?: string | null
          posted_by?: string | null
          recurrence_pattern?: Json | null
          reference_number?: string | null
          status?: string | null
          tags?: string[] | null
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      journal_entry_items: {
        Row: {
          account_id: string
          account_number: string | null
          created_at: string
          credit: number | null
          currency: string | null
          debit: number | null
          description: string | null
          dimension1: string | null
          dimension2: string | null
          exchange_rate: number | null
          id: string
          is_cleared: boolean | null
          journal_entry_id: string | null
          tax_amount: number | null
          tax_code: string | null
        }
        Insert: {
          account_id: string
          account_number?: string | null
          created_at?: string
          credit?: number | null
          currency?: string | null
          debit?: number | null
          description?: string | null
          dimension1?: string | null
          dimension2?: string | null
          exchange_rate?: number | null
          id?: string
          is_cleared?: boolean | null
          journal_entry_id?: string | null
          tax_amount?: number | null
          tax_code?: string | null
        }
        Update: {
          account_id?: string
          account_number?: string | null
          created_at?: string
          credit?: number | null
          currency?: string | null
          debit?: number | null
          description?: string | null
          dimension1?: string | null
          dimension2?: string | null
          exchange_rate?: number | null
          id?: string
          is_cleared?: boolean | null
          journal_entry_id?: string | null
          tax_amount?: number | null
          tax_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_items_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
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
      payroll_journal_entries: {
        Row: {
          created_at: string | null
          employee_id: string | null
          gosi_company: number | null
          gosi_employee: number | null
          gross_salary: number
          id: string
          journal_entry_id: string | null
          net_salary: number
          salary_record_id: string | null
          total_allowances: number | null
          total_deductions: number | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          gosi_company?: number | null
          gosi_employee?: number | null
          gross_salary: number
          id?: string
          journal_entry_id?: string | null
          net_salary: number
          salary_record_id?: string | null
          total_allowances?: number | null
          total_deductions?: number | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          gosi_company?: number | null
          gosi_employee?: number | null
          gross_salary?: number
          id?: string
          journal_entry_id?: string | null
          net_salary?: number
          salary_record_id?: string | null
          total_allowances?: number | null
          total_deductions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_journal_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_journal_entries_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_journal_entries_salary_record_id_fkey"
            columns: ["salary_record_id"]
            isOneToOne: false
            referencedRelation: "salary_records"
            referencedColumns: ["id"]
          },
        ]
      }
      "Pro-1.1": {
        Row: {
          created_at: string
        }
        Insert: {
          created_at?: string
        }
        Update: {
          created_at?: string
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
      project_employee_assignments: {
        Row: {
          assignment_date: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          project_id: string | null
          role_in_project: string
          total_cost: number | null
          total_hours: number | null
        }
        Insert: {
          assignment_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          role_in_project: string
          total_cost?: number | null
          total_hours?: number | null
        }
        Update: {
          assignment_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          role_in_project?: string
          total_cost?: number | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_employee_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_employee_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      salary_deductions: {
        Row: {
          amount: number
          auto_generated: boolean | null
          created_at: string
          created_by: string | null
          date: string
          employee_id: string | null
          id: string
          reason: string
          status: string | null
        }
        Insert: {
          amount: number
          auto_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          date: string
          employee_id?: string | null
          id?: string
          reason: string
          status?: string | null
        }
        Update: {
          amount?: number
          auto_generated?: boolean | null
          created_at?: string
          created_by?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          reason?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsorship_transfer_fees: {
        Row: {
          created_at: string
          effective_date: string
          fee_amount: number
          id: string
          transfer_count: number
        }
        Insert: {
          created_at?: string
          effective_date: string
          fee_amount: number
          id?: string
          transfer_count: number
        }
        Update: {
          created_at?: string
          effective_date?: string
          fee_amount?: number
          id?: string
          transfer_count?: number
        }
        Relationships: []
      }
      system_activity: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
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
      calculate_cash_flow: {
        Args: { end_date: string; start_date: string }
        Returns: {
          flow_ratio: number
          net_flow: number
          total_inflow: number
          total_outflow: number
        }[]
      }
      calculate_employee_kpi: {
        Args: { emp_id: string }
        Returns: Json
      }
      count_journal_entries: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_api_integration: {
        Args: {
          integration_active?: boolean
          integration_api_key?: string
          integration_config?: string
          integration_endpoint: string
          integration_events?: string[]
          integration_headers?: string
          integration_name: string
          integration_type: string
        }
        Returns: string
      }
      create_employee_accounts: {
        Args: { emp_id: string; emp_name: string }
        Returns: undefined
      }
      create_salary_journal_entry: {
        Args: { emp_id: string; salary_record_id: string }
        Returns: string
      }
      delete_journal_entry: {
        Args: { p_entry_id: string }
        Returns: undefined
      }
      get_account_path: {
        Args: { account_id: string }
        Returns: string[]
      }
      get_all_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          unified_national_number: string
        }[]
      }
      get_all_journal_entries: {
        Args: Record<PropertyKey, never>
        Returns: {
          attachment_url: string
          content: string
          id: string
          title: string
        }[]
      }
      get_api_integrations: {
        Args: Record<PropertyKey, never>
        Returns: {
          api_key_encrypted: string
          configuration: Json
          created_at: string
          endpoint: string
          events: string[]
          headers: Json
          id: string
          is_active: boolean
          last_sync: string
          name: string
          type: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_integration_stats: {
        Args: { integration_id: string }
        Returns: {
          failedrequests: number
          lastsync: string
          successfulrequests: number
          totalrequests: number
        }[]
      }
      get_journal_entry_attachment: {
        Args: { p_entry_id: string }
        Returns: string
      }
      get_unified_national_number: {
        Args: { company_id: string }
        Returns: string
      }
      has_permission: {
        Args: { _permission: string; _resource_id?: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string }
        Returns: boolean
      }
      log_integration_error: {
        Args: {
          error_msg: string
          event_name: string
          integration_id: string
          payload_data: string
        }
        Returns: undefined
      }
      reset_journal_entry_attachment: {
        Args: { p_entry_id: string }
        Returns: undefined
      }
      update_company_information: {
        Args: { p_company_id: string; p_unified_national_number: string }
        Returns: undefined
      }
      update_company_name: {
        Args: { p_company_id: string; p_new_name: string }
        Returns: undefined
      }
      update_integration_sync: {
        Args: { integration_id: string; sync_time: string }
        Returns: undefined
      }
      update_journal_entry_attachment: {
        Args: { p_attachment_url: string; p_entry_id: string }
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

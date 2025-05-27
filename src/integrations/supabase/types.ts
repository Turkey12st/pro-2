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
        Args: { start_date: string; end_date: string }
        Returns: {
          total_inflow: number
          total_outflow: number
          net_flow: number
          flow_ratio: number
        }[]
      }
      count_journal_entries: {
        Args: Record<PropertyKey, never>
        Returns: number
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
          id: string
          title: string
          content: string
          attachment_url: string
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
      update_journal_entry_attachment: {
        Args: { p_entry_id: string; p_attachment_url: string }
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

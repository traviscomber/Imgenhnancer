export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string | null
          role: string
          status: string
          email_verified: boolean
          credits_remaining: number
          subscription_tier: string
          subscription_expires_at: string | null
          profile_image_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
          last_login: string | null
          timezone: string | null
          language: string | null
          notification_preferences: Json | null
          api_access_enabled: boolean | null
          max_concurrent_jobs: number | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          password_hash?: string | null
          role?: string
          status?: string
          email_verified?: boolean
          credits_remaining?: number
          subscription_tier?: string
          subscription_expires_at?: string | null
          profile_image_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login?: string | null
          timezone?: string | null
          language?: string | null
          notification_preferences?: Json | null
          api_access_enabled?: boolean | null
          max_concurrent_jobs?: number | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password_hash?: string | null
          role?: string
          status?: string
          email_verified?: boolean
          credits_remaining?: number
          subscription_tier?: string
          subscription_expires_at?: string | null
          profile_image_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login?: string | null
          timezone?: string | null
          language?: string | null
          notification_preferences?: Json | null
          api_access_enabled?: boolean | null
          max_concurrent_jobs?: number | null
        }
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ai_models: {
        Row: {
          id: string
          model_id: string
          name: string
          description: string | null
          category: string
          provider: string
          provider_model_name: string
          provider_version: string | null
          input_field: string | null
          max_upscale: number | null
          processing_time_estimate: string | null
          best_for: string | null
          is_recommended: boolean | null
          icon_name: string | null
          status: string
          configuration: Json
          created_at: string
          updated_at: string
          min_processing_time: number | null
          max_processing_time: number | null
          supported_formats: string[] | null
          max_file_size: number | null
          pricing_tier: string | null
        }
        Insert: {
          id?: string
          model_id: string
          name: string
          description?: string | null
          category: string
          provider: string
          provider_model_name: string
          provider_version?: string | null
          input_field?: string | null
          max_upscale?: number | null
          processing_time_estimate?: string | null
          best_for?: string | null
          is_recommended?: boolean | null
          icon_name?: string | null
          status?: string
          configuration?: Json
          created_at?: string
          updated_at?: string
          min_processing_time?: number | null
          max_processing_time?: number | null
          supported_formats?: string[] | null
          max_file_size?: number | null
          pricing_tier?: string | null
        }
        Update: {
          id?: string
          model_id?: string
          name?: string
          description?: string | null
          category?: string
          provider?: string
          provider_model_name?: string
          provider_version?: string | null
          input_field?: string | null
          max_upscale?: number | null
          processing_time_estimate?: string | null
          best_for?: string | null
          is_recommended?: boolean | null
          icon_name?: string | null
          status?: string
          configuration?: Json
          created_at?: string
          updated_at?: string
          min_processing_time?: number | null
          max_processing_time?: number | null
          supported_formats?: string[] | null
          max_file_size?: number | null
          pricing_tier?: string | null
        }
      }
      processing_jobs: {
        Row: {
          id: string
          user_id: string
          original_filename: string
          original_file_size: number
          original_file_type: string
          original_file_url: string | null
          model_id: string
          settings: Json
          upscale_factor: number
          status: string
          progress_percentage: number
          progress_message: string | null
          provider_job_id: string | null
          output_file_url: string | null
          enhanced_file_size: number | null
          processing_time_seconds: number | null
          credits_used: number
          priority: number
          retry_count: number
          max_retries: number
          error_message: string | null
          error_details: Json | null
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
          batch_name: string | null
          batch_total_jobs: number | null
          batch_completed_jobs: number | null
          queue_position: number | null
          estimated_completion: string | null
          webhook_url: string | null
          callback_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          original_filename: string
          original_file_size: number
          original_file_type: string
          original_file_url?: string | null
          model_id: string
          settings?: Json
          upscale_factor?: number
          status?: string
          progress_percentage?: number
          progress_message?: string | null
          provider_job_id?: string | null
          output_file_url?: string | null
          enhanced_file_size?: number | null
          processing_time_seconds?: number | null
          credits_used?: number
          priority?: number
          retry_count?: number
          max_retries?: number
          error_message?: string | null
          error_details?: Json | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          batch_name?: string | null
          batch_total_jobs?: number | null
          batch_completed_jobs?: number | null
          queue_position?: number | null
          estimated_completion?: string | null
          webhook_url?: string | null
          callback_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          original_filename?: string
          original_file_size?: number
          original_file_type?: string
          original_file_url?: string | null
          model_id?: string
          settings?: Json
          upscale_factor?: number
          status?: string
          progress_percentage?: number
          progress_message?: string | null
          provider_job_id?: string | null
          output_file_url?: string | null
          enhanced_file_size?: number | null
          processing_time_seconds?: number | null
          credits_used?: number
          priority?: number
          retry_count?: number
          max_retries?: number
          error_message?: string | null
          error_details?: Json | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          batch_name?: string | null
          batch_total_jobs?: number | null
          batch_completed_jobs?: number | null
          queue_position?: number | null
          estimated_completion?: string | null
          webhook_url?: string | null
          callback_data?: Json | null
        }
      }
      system_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          severity: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          severity?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          severity?: string
          created_at?: string
        }
      }
      migrations: {
        Row: {
          id: string
          version: string
          applied_at: string
        }
        Insert: {
          id?: string
          version: string
          applied_at?: string
        }
        Update: {
          id?: string
          version?: string
          applied_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          subscription_tier: string
          credits_remaining: number
          total_jobs: number
          completed_jobs: number
          failed_jobs: number
          active_jobs: number
          avg_processing_time: number
        }
      }
      model_performance: {
        Row: {
          id: string
          model_id: string
          name: string
          category: string
          provider: string
          total_jobs: number
          completed_jobs: number
          failed_jobs: number
          avg_processing_time: number
        }
      }
      daily_usage_stats: {
        Row: {
          date: string
          total_jobs: number
          completed_jobs: number
          failed_jobs: number
          unique_users: number
          total_credits_used: number
          avg_processing_time: number
        }
      }
    }
    Functions: {
      get_orphaned_jobs: {
        Args: Record<string, never>
        Returns: {
          id: string
          original_filename: string
          created_at: string
        }[]
      }
      get_invalid_model_references: {
        Args: Record<string, never>
        Returns: {
          id: string
          original_filename: string
          created_at: string
        }[]
      }
      run_sql: {
        Args: {
          sql: string
        }
        Returns: undefined
      }
    }
  }
}

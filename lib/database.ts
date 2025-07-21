import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for full database access
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database helper functions
export class Database {
  // User operations
  static async createUser(userData: {
    email: string
    name: string
    password_hash: string
    role?: string
    subscription_tier?: string
  }) {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async getAllUsers(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  // AI Model operations
  static async getAllModels() {
    const { data, error } = await supabase
      .from("ai_models")
      .select("*")
      .eq("status", "active")
      .order("is_recommended", { ascending: false })

    if (error) throw error
    return data
  }

  static async getModelById(id: string) {
    const { data, error } = await supabase.from("ai_models").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async getModelByModelId(modelId: string) {
    const { data, error } = await supabase.from("ai_models").select("*").eq("model_id", modelId).single()

    if (error) throw error
    return data
  }

  static async createModel(modelData: any) {
    const { data, error } = await supabase.from("ai_models").insert([modelData]).select().single()

    if (error) throw error
    return data
  }

  static async updateModel(id: string, updates: any) {
    const { data, error } = await supabase.from("ai_models").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  // Processing Job operations
  static async createJob(jobData: {
    user_id: string
    model_id: string
    original_filename: string
    original_file_size: number
    original_file_type: string
    settings: any
    upscale_factor?: number
    priority?: number
  }) {
    const { data, error } = await supabase.from("processing_jobs").insert([jobData]).select().single()

    if (error) throw error
    return data
  }

  static async getJobById(id: string) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(email, name),
        ai_models(name, model_id, provider)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  }

  static async getUserJobs(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        ai_models(name, model_id, icon_name)
      `)
      .eq("user_id", userId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  static async updateJob(id: string, updates: any) {
    const { data, error } = await supabase.from("processing_jobs").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async getJobsByStatus(status: string, limit = 50) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(email, name),
        ai_models(name, model_id, provider)
      `)
      .eq("status", status)
      .limit(limit)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })

    if (error) throw error
    return data
  }

  // Analytics operations
  static async createSystemLog(logData: {
    user_id?: string
    action: string
    resource_type?: string
    resource_id?: string
    details?: any
    severity?: string
    ip_address?: string
    user_agent?: string
  }) {
    const { data, error } = await supabase.from("system_logs").insert([logData]).select().single()

    if (error) throw error
    return data
  }

  static async getSystemLogs(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from("system_logs")
      .select(`
        *,
        users(email, name)
      `)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  static async getUserStats(userId: string) {
    const { data, error } = await supabase.from("user_stats").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  static async getModelPerformance() {
    const { data, error } = await supabase
      .from("model_performance")
      .select("*")
      .order("total_jobs_processed", { ascending: false })

    if (error) throw error
    return data
  }

  static async getDailyUsageStats(days = 30) {
    const { data, error } = await supabase
      .from("daily_usage_stats")
      .select("*")
      .limit(days)
      .order("date", { ascending: false })

    if (error) throw error
    return data
  }

  static async getSystemHealth() {
    const { data, error } = await supabase.from("system_health").select("*")

    if (error) throw error
    return data
  }

  static async getQueueStatus() {
    const { data, error } = await supabase.from("queue_status").select("*")

    if (error) throw error
    return data
  }

  // Session operations
  static async createSession(sessionData: {
    user_id: string
    session_token: string
    expires_at: string
    ip_address?: string
    user_agent?: string
  }) {
    const { data, error } = await supabase.from("user_sessions").insert([sessionData]).select().single()

    if (error) throw error
    return data
  }

  static async getSessionByToken(token: string) {
    const { data, error } = await supabase
      .from("user_sessions")
      .select(`
        *,
        users(*)
      `)
      .eq("session_token", token)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async deleteSession(token: string) {
    const { error } = await supabase.from("user_sessions").update({ is_active: false }).eq("session_token", token)

    if (error) throw error
  }

  // Utility functions
  static async testConnection() {
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) throw error
      return { success: true, message: "Database connection successful" }
    } catch (error) {
      return { success: false, message: `Database connection failed: ${error}` }
    }
  }

  static async checkTableExists(tableName: string) {
    try {
      const { data, error } = await supabase.from(tableName).select("*").limit(1)

      return { exists: true, error: null }
    } catch (error) {
      return { exists: false, error: error }
    }
  }
}

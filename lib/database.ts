import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role key for full database access
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database helper functions
export class Database {
  // User management
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
    const { data, error } = await supabase.from("users").select("*").eq("email", email).eq("status", "active").single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).eq("status", "active").single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async updateUserCredits(userId: string, creditsUsed: number) {
    const { data, error } = await supabase.rpc("update_user_credits", {
      user_id: userId,
      credits_to_deduct: creditsUsed,
    })

    if (error) throw error
    return data
  }

  // AI Models
  static async getActiveModels() {
    const { data, error } = await supabase
      .from("ai_models")
      .select("*")
      .eq("status", "active")
      .order("is_recommended", { ascending: false })
      .order("name")

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

  // Processing Jobs
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

  static async getUserJobs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        ai_models(name, model_id, icon_name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  static async updateJob(id: string, updates: any) {
    const { data, error } = await supabase.from("processing_jobs").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async getPendingJobs(limit = 10) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(email, name),
        ai_models(name, model_id, provider, provider_model_name)
      `)
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  // User Sessions
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
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async deleteSession(token: string) {
    const { error } = await supabase.from("user_sessions").update({ is_active: false }).eq("session_token", token)

    if (error) throw error
  }

  // Analytics
  static async logSystemEvent(eventData: {
    user_id?: string
    action: string
    resource_type?: string
    resource_id?: string
    details?: any
    ip_address?: string
    user_agent?: string
    severity?: string
  }) {
    const { error } = await supabase.from("system_logs").insert([eventData])

    if (error) throw error
  }

  static async updateUsageAnalytics(
    userId: string,
    date: string,
    updates: {
      images_processed?: number
      credits_used?: number
      processing_time_total?: number
      models_used?: any
    },
  ) {
    const { data, error } = await supabase
      .from("usage_analytics")
      .upsert([
        {
          user_id: userId,
          date,
          ...updates,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getSystemHealth() {
    const { data, error } = await supabase.from("system_health").select("*")

    if (error) throw error
    return data
  }

  static async getUserStats(userId?: string) {
    let query = supabase.from("user_stats").select("*")

    if (userId) {
      query = query.eq("id", userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  static async getModelPerformance() {
    const { data, error } = await supabase
      .from("model_performance")
      .select("*")
      .order("total_jobs", { ascending: false })

    if (error) throw error
    return data
  }

  static async getDailyUsageStats(days = 30) {
    const { data, error } = await supabase.from("daily_usage_stats").select("*").limit(days)

    if (error) throw error
    return data
  }

  // File Storage
  static async createFileRecord(fileData: {
    user_id: string
    job_id?: string
    file_type: string
    filename: string
    file_path: string
    file_size: number
    mime_type?: string
    storage_provider?: string
    storage_url?: string
  }) {
    const { data, error } = await supabase.from("file_storage").insert([fileData]).select().single()

    if (error) throw error
    return data
  }

  // Admin functions
  static async getAllUsers(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .order("user_since", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  static async getAllJobs(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(email, name),
        ai_models(name, model_id)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  // Database health check
  static async healthCheck() {
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) throw error

      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      }
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Export default instance
export default Database

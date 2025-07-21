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
export const db = {
  // User operations
  async createUser(userData: {
    email: string
    name: string
    password_hash: string
    role?: string
    subscription_tier?: string
  }) {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  // AI Model operations
  async getAIModels(filters?: { category?: string; provider?: string; is_active?: boolean }) {
    let query = supabase.from("ai_models").select("*")

    if (filters?.category) query = query.eq("category", filters.category)
    if (filters?.provider) query = query.eq("provider", filters.provider)
    if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active)

    const { data, error } = await query.order("is_recommended", { ascending: false })

    if (error) throw error
    return data
  },

  async getAIModelById(id: string) {
    const { data, error } = await supabase.from("ai_models").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async updateAIModel(id: string, updates: any) {
    const { data, error } = await supabase.from("ai_models").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  // Processing job operations
  async createProcessingJob(jobData: {
    user_id: string
    model_id: string
    original_filename: string
    original_file_size?: number
    original_file_type?: string
    upscale_factor?: number
    settings?: any
    priority?: string
  }) {
    const { data, error } = await supabase.from("processing_jobs").insert([jobData]).select().single()

    if (error) throw error
    return data
  },

  async getProcessingJob(id: string) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(name, email),
        ai_models(name, model_id, category)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async getUserJobs(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        ai_models(name, model_id, category)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  },

  async updateProcessingJob(id: string, updates: any) {
    const { data, error } = await supabase.from("processing_jobs").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async getJobsByStatus(status: string, limit = 100) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        users(name, email),
        ai_models(name, model_id)
      `)
      .eq("status", status)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Analytics operations
  async createUsageAnalytics(analyticsData: {
    user_id: string
    date: string
    images_processed?: number
    credits_used?: number
    processing_time_total?: number
    models_used?: any
  }) {
    const { data, error } = await supabase.from("usage_analytics").upsert([analyticsData]).select().single()

    if (error) throw error
    return data
  },

  async getUserAnalytics(userId: string, days = 30) {
    const { data, error } = await supabase
      .from("usage_analytics")
      .select("*")
      .eq("user_id", userId)
      .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (error) throw error
    return data
  },

  // System logs
  async createSystemLog(logData: {
    user_id?: string
    action: string
    resource_type?: string
    resource_id?: string
    details?: any
    ip_address?: string
    user_agent?: string
    severity?: string
  }) {
    const { data, error } = await supabase.from("system_logs").insert([logData]).select().single()

    if (error) throw error
    return data
  },

  // System metrics
  async createSystemMetric(metricData: {
    metric_name: string
    metric_value: number
    metric_unit?: string
    tags?: any
  }) {
    const { data, error } = await supabase.from("system_metrics").insert([metricData]).select().single()

    if (error) throw error
    return data
  },

  // Views
  async getUserStats(userId?: string) {
    let query = supabase.from("user_stats").select("*")

    if (userId) query = query.eq("id", userId)

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getModelPerformance() {
    const { data, error } = await supabase
      .from("model_performance")
      .select("*")
      .order("total_jobs_processed", { ascending: false })

    if (error) throw error
    return data
  },

  async getDailyUsageStats(days = 30) {
    const { data, error } = await supabase.from("daily_usage_stats").select("*").limit(days)

    if (error) throw error
    return data
  },

  async getSystemHealth() {
    const { data, error } = await supabase.from("system_health").select("*")

    if (error) throw error
    return data
  },

  async getQueueStatus() {
    const { data, error } = await supabase.from("queue_status").select("*")

    if (error) throw error
    return data
  },

  // Utility functions
  async checkTableExists(tableName: string) {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)

    return data && data.length > 0
  },

  async getTableCount(tableName: string) {
    const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

    if (error) throw error
    return count || 0
  },
}

export default db

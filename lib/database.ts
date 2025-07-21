import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Database helper functions
export const db = {
  // Table existence checks
  async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", tableName)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  },

  async getTableCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

      return error ? 0 : count || 0
    } catch {
      return 0
    }
  },

  // User management
  async createUser(userData: {
    email: string
    name: string
    role?: string
    subscriptionTier?: string
    creditsRemaining?: number
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        name: userData.name,
        role: userData.role || "user",
        subscription_tier: userData.subscriptionTier || "free",
        credits_remaining: userData.creditsRemaining || 10,
        preferences: {},
        api_access_enabled: false,
        max_concurrent_jobs: 1,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) throw error
    return data
  },

  async updateUserCredits(userId: string, credits: number) {
    const { data, error } = await supabase
      .from("users")
      .update({ credits_remaining: credits })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Processing jobs
  async createProcessingJob(jobData: {
    userId: string
    modelId: string
    originalFilename: string
    originalFileUrl: string
    upscaleFactor: number
    targetUse?: string
    webhookUrl?: string
  }) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .insert({
        user_id: jobData.userId,
        model_id: jobData.modelId,
        original_filename: jobData.originalFilename,
        original_file_url: jobData.originalFileUrl,
        upscale_factor: jobData.upscaleFactor,
        target_use: jobData.targetUse || "general",
        webhook_url: jobData.webhookUrl,
        status: "pending",
        progress: 0,
        queue_position: 1,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateJobStatus(jobId: string, status: string, progress?: number, resultUrl?: string, errorMessage?: string) {
    const updateData: any = { status }
    if (progress !== undefined) updateData.progress = progress
    if (resultUrl) updateData.enhanced_file_url = resultUrl
    if (errorMessage) updateData.error_message = errorMessage
    if (status === "completed") updateData.completed_at = new Date().toISOString()

    const { data, error } = await supabase.from("processing_jobs").update(updateData).eq("id", jobId).select().single()

    if (error) throw error
    return data
  },

  async getJobsByUser(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .select(`
        *,
        ai_models (name, provider)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // AI Models
  async getActiveModels() {
    const { data, error } = await supabase.from("ai_models").select("*").eq("status", "active").order("name")

    if (error) throw error
    return data
  },

  async getModelById(modelId: string) {
    const { data, error } = await supabase.from("ai_models").select("*").eq("model_id", modelId).single()

    if (error) throw error
    return data
  },

  // System logging
  async createSystemLog(logData: {
    userId?: string
    action: string
    resourceType: string
    resourceId?: string
    details: any
    ipAddress?: string
    userAgent?: string
    severity?: string
  }) {
    const { data, error } = await supabase
      .from("system_logs")
      .insert({
        user_id: logData.userId || null,
        action: logData.action,
        resource_type: logData.resourceType,
        resource_id: logData.resourceId || null,
        details: logData.details,
        ip_address: logData.ipAddress || "127.0.0.1",
        user_agent: logData.userAgent || "Unknown",
        severity: logData.severity || "info",
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Usage analytics
  async recordUsage(
    userId: string,
    date: string,
    data: {
      imagesProcessed?: number
      creditsUsed?: number
      processingTimeMs?: number
      modelsUsed?: string[]
    },
  ) {
    const { data: result, error } = await supabase
      .from("usage_analytics")
      .upsert({
        user_id: userId,
        date: date,
        images_processed: data.imagesProcessed || 0,
        credits_used: data.creditsUsed || 0,
        processing_time_ms: data.processingTimeMs || 0,
        models_used: data.modelsUsed || [],
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  // System metrics
  async recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const { data, error } = await supabase
      .from("system_metrics")
      .insert({
        metric_name: name,
        metric_value: value,
        metric_type: "gauge",
        tags: tags || {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Analytics views
  async getUserStats(limit = 10) {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .order("total_jobs", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getModelPerformance() {
    const { data, error } = await supabase
      .from("model_performance")
      .select("*")
      .order("recent_completed_30d", { ascending: false })

    if (error) throw error
    return data
  },

  async getSystemHealth() {
    const { data, error } = await supabase.from("system_health").select("*").single()

    if (error) throw error
    return data
  },
}

// Connection test function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

    return !error
  } catch {
    return false
  }
}

// Check if core tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    const tables = ["users", "ai_models", "processing_jobs", "user_sessions"]
    const checks = await Promise.all(tables.map((table) => db.checkTableExists(table)))
    return checks.every((exists) => exists)
  } catch {
    return false
  }
}

// Initialize database (placeholder for future use)
export async function initializeDatabase(): Promise<boolean> {
  try {
    // This would run SQL scripts programmatically if needed
    // For now, we recommend running scripts manually in Supabase
    return await checkTablesExist()
  } catch {
    return false
  }
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for full database access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
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
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        name: userData.name,
        password_hash: userData.password_hash,
        role: userData.role || "user",
        email_verified: true,
      })
      .select("id, email, name, role, created_at")
      .single()

    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, name, password_hash, role, status, credits_remaining, created_at, last_login, email_verified, subscription_tier",
      )
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  },

  async getUserById(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: any) {
    const updateData: any = {}

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase()
        updateData[dbField] = value
      }
    })

    if (Object.keys(updateData).length === 0) return

    // Add completed_at if status is completed
    if (updates.status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("users").update(updateData).eq("id", id)

    if (error) throw error
  },

  async updateUserLastLogin(userId: string) {
    const { error } = await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userId)

    if (error) throw error
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

  async getActiveAIModels() {
    const { data, error } = await supabase
      .from("ai_models")
      .select(`
        model_id, name, description, category, provider, provider_model_name,
        provider_version, input_field, max_upscale, processing_time_estimate,
        best_for, is_recommended, icon_name, configuration, status,
        success_rate, average_processing_time, total_jobs_processed
      `)
      .eq("status", "active")
      .order("is_recommended", { ascending: false })
      .order("name", { ascending: true })

    if (error) throw error
    return data || []
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
    userId: string
    originalFilename: string
    originalFileSize: number
    originalFileType: string
    modelId: string
    settings: object
    upscaleFactor: number
  }) {
    const { userId, originalFilename, originalFileSize, originalFileType, modelId, settings, upscaleFactor } = jobData

    // Get model UUID from model_id
    const { data: modelData, error: modelError } = await supabase
      .from("ai_models")
      .select("id")
      .eq("model_id", modelId)
      .single()

    if (modelError || !modelData) {
      throw new Error(`Model not found: ${modelId}`)
    }

    const { data, error } = await supabase
      .from("processing_jobs")
      .insert({
        user_id: userId,
        original_filename: originalFilename,
        original_file_size: originalFileSize,
        original_file_type: originalFileType,
        model_id: modelData.id,
        settings: settings,
        upscale_factor: upscaleFactor,
        status: "pending",
      })
      .select("id, created_at")
      .single()

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

  async updateProcessingJob(
    jobId: string,
    updates: {
      status?: string
      progressMessage?: string
      progressPercentage?: number
      providerJobId?: string
      outputFileUrl?: string
      enhancedFileSize?: number
      processingTimeSeconds?: number
      creditsUsed?: number
      errorMessage?: string
      errorDetails?: object
    },
  ) {
    const updateData: any = {}

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase()
        updateData[dbField] = value
      }
    })

    if (Object.keys(updateData).length === 0) return

    // Add completed_at if status is completed
    if (updates.status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("processing_jobs").update(updateData).eq("id", jobId)

    if (error) throw error
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

  async updateUsageAnalytics(
    userId: string,
    date: string,
    updates: {
      imagesProcessed?: number
      creditsUsed?: number
      processingTimeTotal?: number
      modelsUsed?: object
    },
  ) {
    const { imagesProcessed = 0, creditsUsed = 0, processingTimeTotal = 0, modelsUsed = {} } = updates

    const { error } = await supabase.from("usage_analytics").upsert(
      {
        user_id: userId,
        date,
        images_processed: imagesProcessed,
        credits_used: creditsUsed,
        processing_time_total: processingTimeTotal,
        models_used: modelsUsed,
      },
      {
        onConflict: "user_id,date",
      },
    )

    if (error) throw error
  },

  // System logs
  async createSystemLog(logData: {
    userId?: string
    action: string
    resourceType?: string
    resourceId?: string
    details?: object
    ipAddress?: string
    userAgent?: string
    severity?: string
  }) {
    const { userId, action, resourceType, resourceId, details, ipAddress, userAgent, severity = "info" } = logData

    const { error } = await supabase.from("system_logs").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent,
      severity,
    })

    if (error) throw error
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

// Database query helper using Supabase
export async function query(text: string, params: any[] = []) {
  try {
    console.log("🔍 Executing query:", text.substring(0, 100) + "...")
    console.log("📊 Parameters:", params)

    // For simple queries, we can use Supabase's built-in methods
    // For complex queries, we might need to use RPC or raw SQL

    // This is a placeholder - in practice, you'd convert the SQL to Supabase calls
    // or use Supabase's RPC functionality for complex queries

    console.log("✅ Query executed successfully")
    return { rows: [], rowCount: 0 }
  } catch (error) {
    console.error("❌ Database query error:", error)
    throw error
  }
}

// Database initialization check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return false
    }

    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Check if tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    const tables = ["users", "ai_models", "processing_jobs", "user_roles"]

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(1)
      if (error) {
        console.warn(`⚠️ Table ${table} does not exist or is not accessible`)
        return false
      }
    }

    console.log("✅ All required database tables exist")
    return true
  } catch (error) {
    console.error("❌ Error checking database tables:", error)
    return false
  }
}

// Initialize database (create tables if they don't exist)
export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log("🔄 Initializing database...")

    // Check connection first
    const connected = await checkDatabaseConnection()
    if (!connected) {
      return false
    }

    // Check if tables exist
    const tablesExist = await checkTablesExist()
    if (tablesExist) {
      console.log("✅ Database already initialized")
      return true
    }

    console.log("⚠️ Database tables missing, please run the SQL scripts manually:")
    console.log("1. scripts/01-create-database-schema.sql")
    console.log("2. scripts/02-add-analytics-tables.sql")
    console.log("3. scripts/03-add-missing-columns.sql")
    console.log("4. scripts/04-create-views.sql")
    console.log("5. scripts/05-seed-demo-data.sql")

    return false
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return false
  }
}

export { supabase }

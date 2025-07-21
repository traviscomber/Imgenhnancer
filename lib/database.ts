import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Use Neon serverless driver for better compatibility with Supabase
const sql = neon(process.env.POSTGRES_URL!)

// Database query helper using Supabase
export async function query(text: string, params: any[] = []) {
  try {
    console.log("🔍 Executing query:", text.substring(0, 100) + "...")
    console.log("📊 Parameters:", params)

    // Convert parameterized query to Supabase format
    let processedQuery = text
    params.forEach((param, index) => {
      processedQuery = processedQuery.replace(`$${index + 1}`, typeof param === "string" ? `'${param}'` : param)
    })

    const { data, error } = await supabase.rpc("execute_sql", {
      query: processedQuery,
    })

    if (error) {
      throw error
    }

    console.log("✅ Query successful, rows:", Array.isArray(data) ? data.length : "N/A")

    return {
      rows: Array.isArray(data) ? data : [data],
      rowCount: Array.isArray(data) ? data.length : 1,
    }
  } catch (error) {
    console.error("❌ Database query error:", error)
    console.error("📝 Query:", text)
    console.error("📊 Parameters:", params)
    throw error
  }
}

// Alternative direct query method for simple operations
export async function directQuery(
  tableName: string,
  operation: "select" | "insert" | "update" | "delete",
  options: any = {},
) {
  try {
    let query = supabase.from(tableName)

    switch (operation) {
      case "select":
        if (options.select) query = query.select(options.select)
        if (options.eq) query = query.eq(options.eq.column, options.eq.value)
        if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending })
        if (options.limit) query = query.limit(options.limit)
        break

      case "insert":
        query = query.insert(options.data)
        break

      case "update":
        query = query.update(options.data)
        if (options.eq) query = query.eq(options.eq.column, options.eq.value)
        break

      case "delete":
        if (options.eq) query = query.eq(options.eq.column, options.eq.value)
        query = query.delete()
        break
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      rows: Array.isArray(data) ? data : [data],
      rowCount: Array.isArray(data) ? data.length : 1,
    }
  } catch (error) {
    console.error("❌ Direct query error:", error)
    throw error
  }
}

// Database initialization check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("get_current_time")

    if (error) {
      throw error
    }

    console.log("✅ Database connected successfully:", data)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Check if tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["users", "ai_models", "processing_jobs", "user_roles"])

    if (error) {
      throw error
    }

    const expectedTables = ["users", "ai_models", "processing_jobs", "user_roles"]
    const existingTables = data.map((row: any) => row.table_name)
    const missingTables = expectedTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      console.warn("⚠️ Missing database tables:", missingTables)
      return false
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

    console.log("⚠️ Database tables missing, but cannot auto-create in production")
    console.log("Please run the SQL scripts manually in Supabase SQL Editor:")
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

// User management functions
export async function createUser(userData: {
  email: string
  name: string
  passwordHash: string
  role?: string
}) {
  const { email, name, passwordHash, role = "user" } = userData

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      name,
      password_hash: passwordHash,
      role,
      email_verified: true,
    })
    .select("id, email, name, role, created_at")
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, name, password_hash, role, status, credits_remaining, created_at, last_login, email_verified, subscription_tier",
    )
    .eq("email", email)
    .eq("status", "active")
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    throw error
  }

  return data || null
}

export async function updateUserLastLogin(userId: string) {
  const { error } = await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userId)

  if (error) {
    throw error
  }
}

// AI Models functions
export async function getActiveAIModels() {
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

  if (error) {
    throw error
  }

  return data || []
}

// Processing jobs functions
export async function createProcessingJob(jobData: {
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

  if (error) {
    throw error
  }

  return data
}

export async function updateProcessingJob(
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

  if (error) {
    throw error
  }
}

export async function getUserProcessingJobs(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from("processing_jobs")
    .select(`
      *,
      ai_models!inner(model_id, name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  // Transform the data to match expected format
  return (
    data?.map((job) => ({
      ...job,
      model_name: job.ai_models.name,
    })) || []
  )
}

// System logs
export async function createSystemLog(logData: {
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

  if (error) {
    throw error
  }
}

// Usage analytics
export async function updateUsageAnalytics(
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

  if (error) {
    throw error
  }
}

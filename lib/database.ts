import { neon } from "@neondatabase/serverless"

// Use Neon serverless driver for better compatibility with Supabase
const sql = neon(process.env.POSTGRES_URL!)

// Database query helper
export async function query(text: string, params: any[] = []) {
  try {
    console.log("🔍 Executing query:", text.substring(0, 100) + "...")
    console.log("📊 Parameters:", params)

    const result = await sql(text, params)
    console.log("✅ Query successful, rows:", Array.isArray(result) ? result.length : "N/A")

    return {
      rows: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1,
    }
  } catch (error) {
    console.error("❌ Database query error:", error)
    console.error("📝 Query:", text)
    console.error("📊 Parameters:", params)
    throw error
  }
}

// Database initialization check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await query("SELECT NOW() as current_time")
    console.log("✅ Database connected successfully:", result.rows[0]?.current_time)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Check if tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'ai_models', 'processing_jobs', 'user_roles')
    `)

    const expectedTables = ["users", "ai_models", "processing_jobs", "user_roles"]
    const existingTables = result.rows.map((row: any) => row.table_name)
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
    console.log("Please run the SQL scripts manually:")
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

  const result = await query(
    `
    INSERT INTO users (email, name, password_hash, role, email_verified)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, name, role, created_at
  `,
    [email, name, passwordHash, role, true],
  )

  return result.rows[0]
}

export async function getUserByEmail(email: string) {
  const result = await query(
    `
    SELECT id, email, name, password_hash, role, status, credits_remaining, 
           created_at, last_login, email_verified, subscription_tier
    FROM users 
    WHERE email = $1 AND status = 'active'
  `,
    [email],
  )

  return result.rows[0] || null
}

export async function updateUserLastLogin(userId: string) {
  await query(
    `
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = $1
  `,
    [userId],
  )
}

// AI Models functions
export async function getActiveAIModels() {
  const result = await query(`
    SELECT model_id, name, description, category, provider, provider_model_name,
           provider_version, input_field, max_upscale, processing_time_estimate,
           best_for, is_recommended, icon_name, configuration, status,
           success_rate, average_processing_time, total_jobs_processed
    FROM ai_models 
    WHERE status = 'active'
    ORDER BY is_recommended DESC, name ASC
  `)

  return result.rows
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
  const modelResult = await query(
    `
    SELECT id FROM ai_models WHERE model_id = $1
  `,
    [modelId],
  )

  if (modelResult.rows.length === 0) {
    throw new Error(`Model not found: ${modelId}`)
  }

  const modelUuid = modelResult.rows[0].id

  const result = await query(
    `
    INSERT INTO processing_jobs (
      user_id, original_filename, original_file_size, original_file_type,
      model_id, settings, upscale_factor, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING id, created_at
  `,
    [userId, originalFilename, originalFileSize, originalFileType, modelUuid, JSON.stringify(settings), upscaleFactor],
  )

  return result.rows[0]
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
  const fields = []
  const values = []
  let paramIndex = 1

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      fields.push(`${dbField} = $${paramIndex}`)
      values.push(typeof value === "object" ? JSON.stringify(value) : value)
      paramIndex++
    }
  })

  if (fields.length === 0) return

  // Add updated_at
  fields.push(`updated_at = NOW()`)

  // Add completed_at if status is completed
  if (updates.status === "completed") {
    fields.push(`completed_at = NOW()`)
  }

  values.push(jobId)

  await query(
    `
    UPDATE processing_jobs 
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
  `,
    values,
  )
}

export async function getUserProcessingJobs(userId: string, limit = 50) {
  const result = await query(
    `
    SELECT pj.*, am.model_id, am.name as model_name
    FROM processing_jobs pj
    JOIN ai_models am ON pj.model_id = am.id
    WHERE pj.user_id = $1
    ORDER BY pj.created_at DESC
    LIMIT $2
  `,
    [userId, limit],
  )

  return result.rows
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

  await query(
    `
    INSERT INTO system_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, severity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
    [userId, action, resourceType, resourceId, JSON.stringify(details || {}), ipAddress, userAgent, severity],
  )
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

  await query(
    `
    INSERT INTO usage_analytics (user_id, date, images_processed, credits_used, processing_time_total, models_used)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      images_processed = usage_analytics.images_processed + $3,
      credits_used = usage_analytics.credits_used + $4,
      processing_time_total = usage_analytics.processing_time_total + $5,
      models_used = $6,
      updated_at = NOW()
  `,
    [userId, date, imagesProcessed, creditsUsed, processingTimeTotal, JSON.stringify(modelsUsed)],
  )
}

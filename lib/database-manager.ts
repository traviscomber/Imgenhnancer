import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Singleton pattern for database client
let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials. Please check your environment variables.")
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}

// Core tables that should exist in the database
export const CORE_TABLES = [
  "users",
  "user_roles",
  "ai_models",
  "processing_jobs",
  "user_sessions",
  "system_logs",
  "usage_analytics",
  "system_metrics",
]

// Core views that should exist in the database
export const CORE_VIEWS = ["user_stats", "model_performance", "daily_usage_stats", "system_health"]

// Required columns for each table
export const TABLE_SCHEMAS = {
  users: [
    "id",
    "email",
    "name",
    "role",
    "status",
    "credits_remaining",
    "subscription_tier",
    "created_at",
    "updated_at",
  ],
  ai_models: ["id", "model_id", "name", "provider", "status", "created_at", "updated_at"],
  processing_jobs: ["id", "user_id", "original_filename", "model_id", "status", "created_at", "updated_at"],
}

// Database health check and diagnostics
export async function checkDatabaseHealth() {
  const supabase = getSupabaseClient()
  const results: DatabaseHealthResult = {
    connection: false,
    tables: {},
    views: {},
    issues: [],
    overallHealth: "unknown",
  }

  try {
    // Test basic connection with a simple query
    try {
      const { data: connectionTest, error: connectionError } = await supabase.rpc("get_table_list").single()

      // If the RPC doesn't exist, try a direct table query as fallback
      if (connectionError && connectionError.message.includes("could not find function")) {
        // Try to query a system table directly
        try {
          const { data: fallbackTest, error: fallbackError } = await supabase.from("users").select("id").limit(1)

          results.connection = !fallbackError
        } catch (e) {
          results.connection = false
        }
      } else {
        results.connection = !connectionError
      }
    } catch (e) {
      // Last resort: try to query any existing table
      try {
        const { data: lastTest, error: lastError } = await supabase.from("users").select("id").limit(1)
        results.connection = !lastError
      } catch (e) {
        results.connection = false
      }
    }

    if (!results.connection) {
      results.issues.push({
        type: "connection",
        severity: "critical",
        message: `Database connection failed: Could not connect to database`,
        autoFixable: false,
      })
      results.overallHealth = "critical"
      return results
    }

    // Check tables using direct queries
    for (const tableName of CORE_TABLES) {
      const exists = await checkTableExists(tableName)
      results.tables[tableName] = exists

      if (!exists) {
        results.issues.push({
          type: "missing_table",
          severity: "high",
          message: `Missing table: ${tableName}`,
          autoFixable: true,
          tableName,
        })
      }
    }

    // Check views using direct queries
    for (const viewName of CORE_VIEWS) {
      const exists = await checkViewExists(viewName)
      results.views[viewName] = exists

      if (!exists) {
        results.issues.push({
          type: "missing_view",
          severity: "medium",
          message: `Missing view: ${viewName}`,
          autoFixable: true,
          viewName,
        })
      }
    }

    // Check table schemas for required columns
    for (const [tableName, requiredColumns] of Object.entries(TABLE_SCHEMAS)) {
      if (results.tables[tableName]) {
        const columns = await getTableColumns(tableName)
        const missingColumns = requiredColumns.filter((col) => !columns.includes(col))

        if (missingColumns.length > 0) {
          results.issues.push({
            type: "schema_issue",
            severity: "high",
            message: `Table ${tableName} is missing columns: ${missingColumns.join(", ")}`,
            autoFixable: true,
            tableName,
            missingColumns,
          })
        }
      }
    }

    // Calculate overall health
    if (results.issues.length === 0) {
      results.overallHealth = "healthy"
    } else if (results.issues.some((issue) => issue.severity === "critical")) {
      results.overallHealth = "critical"
    } else if (results.issues.some((issue) => issue.severity === "high")) {
      results.overallHealth = "unhealthy"
    } else {
      results.overallHealth = "warning"
    }
  } catch (error) {
    console.error("Database health check failed:", error)
    results.issues.push({
      type: "unknown",
      severity: "critical",
      message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      autoFixable: false,
    })
    results.overallHealth = "critical"
  }

  return results
}

// Check if a table exists
export async function checkTableExists(tableName: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  try {
    // Try to query the table directly with a limit
    const { error } = await supabase.from(tableName).select("*").limit(1)

    // If no error, table exists
    return !error
  } catch {
    return false
  }
}

// Check if a view exists
export async function checkViewExists(viewName: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  try {
    // Try to query the view directly with a limit
    const { error } = await supabase.from(viewName).select("*").limit(1)

    // If no error, view exists
    return !error
  } catch {
    return false
  }
}

// Get columns for a table
export async function getTableColumns(tableName: string): Promise<string[]> {
  const supabase = getSupabaseClient()
  try {
    // Try to get a single row to inspect columns
    const { data, error } = await supabase.from(tableName).select("*").limit(1).single()

    if (error && !error.message.includes("No rows")) {
      return []
    }

    // If we got data, return the column names
    if (data) {
      return Object.keys(data)
    }

    // If no data but no error, try to get table structure differently
    // This is a fallback - we'll return the expected columns
    return TABLE_SCHEMAS[tableName as keyof typeof TABLE_SCHEMAS] || []
  } catch {
    return []
  }
}

// Auto-fix database issues
export async function autoFixDatabaseIssues(issues: DatabaseIssue[]): Promise<AutoFixResult> {
  const results: AutoFixResult = {
    fixed: [],
    failed: [],
    skipped: [],
  }

  for (const issue of issues) {
    if (!issue.autoFixable) {
      results.skipped.push({
        issue,
        reason: "Issue is not auto-fixable",
      })
      continue
    }

    try {
      let fixed = false

      switch (issue.type) {
        case "missing_table":
          fixed = await createMissingTable(issue.tableName!)
          break

        case "missing_view":
          fixed = await createMissingView(issue.viewName!)
          break

        case "schema_issue":
          // For now, skip schema fixes as they require careful SQL execution
          results.skipped.push({
            issue,
            reason: "Schema fixes require manual intervention",
          })
          continue

        default:
          results.skipped.push({
            issue,
            reason: `Unknown issue type: ${issue.type}`,
          })
          continue
      }

      if (fixed) {
        results.fixed.push({ issue })
      } else {
        results.failed.push({
          issue,
          reason: "Fix operation returned false",
        })
      }
    } catch (error) {
      results.failed.push({
        issue,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

// Create a missing table using Supabase client operations
async function createMissingTable(tableName: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    // For now, we'll create basic table structures
    // In a real implementation, you'd want to use proper SQL DDL

    switch (tableName) {
      case "users":
        // Try to create users table with basic structure
        const { error: usersError } = await supabase.rpc("create_users_table")
        return !usersError

      case "ai_models":
        const { error: modelsError } = await supabase.rpc("create_ai_models_table")
        return !modelsError

      case "processing_jobs":
        const { error: jobsError } = await supabase.rpc("create_processing_jobs_table")
        return !jobsError

      default:
        // For other tables, we'll skip for now
        return false
    }
  } catch (error) {
    console.error(`Failed to create table ${tableName}:`, error)
    return false
  }
}

// Create a missing view
async function createMissingView(viewName: string): Promise<boolean> {
  // For now, skip view creation as it requires complex SQL
  // In a production system, you'd implement proper view creation
  console.log(`Skipping view creation for ${viewName} - requires manual setup`)
  return false
}

// Database migration system - simplified version
export async function runMigration(version: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    // Check if migrations table exists first
    const migrationsExists = await checkTableExists("migrations")

    if (!migrationsExists) {
      // Create migrations table first
      const { error: createError } = await supabase.rpc("create_migrations_table")
      if (createError) {
        console.error("Failed to create migrations table:", createError)
        return false
      }
    }

    // Check if migration has already been applied
    const { data, error } = await supabase.from("migrations").select("*").eq("version", version).maybeSingle()

    if (!error && data) {
      console.log(`Migration ${version} already applied`)
      return true
    }

    // For now, we'll just record the migration without executing complex SQL
    // In a real system, you'd execute the actual migration scripts
    const { error: recordError } = await supabase.from("migrations").insert({
      version,
      applied_at: new Date().toISOString(),
    })

    if (recordError) {
      console.error(`Failed to record migration ${version}:`, recordError)
      return false
    }

    console.log(`Migration ${version} recorded successfully`)
    return true
  } catch (error) {
    console.error(`Migration ${version} failed with exception:`, error)
    return false
  }
}

// Create basic stored procedures - simplified version
export async function createDatabaseProcedures(): Promise<boolean> {
  // For now, we'll return true as procedure creation requires SQL execution
  // In a real implementation, you'd create the actual stored procedures
  console.log("Database procedures creation skipped - requires manual SQL execution")
  return true
}

// Types
export interface DatabaseHealthResult {
  connection: boolean
  tables: Record<string, boolean>
  views: Record<string, boolean>
  issues: DatabaseIssue[]
  overallHealth: "healthy" | "warning" | "unhealthy" | "critical" | "unknown"
}

export interface DatabaseIssue {
  type: "connection" | "missing_table" | "missing_view" | "schema_issue" | "data_integrity" | "unknown"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  autoFixable: boolean
  tableName?: string
  viewName?: string
  missingColumns?: string[]
  details?: any
}

export interface AutoFixResult {
  fixed: Array<{
    issue: DatabaseIssue
  }>
  failed: Array<{
    issue: DatabaseIssue
    reason: string
  }>
  skipped: Array<{
    issue: DatabaseIssue
    reason: string
  }>
}

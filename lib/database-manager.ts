import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../types/database"

// Singleton pattern for database client
let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials. Please check your environment variables.")
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
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
  "api_keys",
  "file_storage",
]

// Core views that should exist in the database
export const CORE_VIEWS = [
  "user_stats",
  "model_performance",
  "daily_usage_stats",
  "active_users",
  "system_health",
  "queue_status",
  "revenue_analytics",
  "model_usage_trends",
  "user_engagement",
  "error_analysis",
]

// Required columns for each table
export const TABLE_SCHEMAS = {
  users: [
    "id",
    "email",
    "name",
    "password_hash",
    "role",
    "status",
    "email_verified",
    "credits_remaining",
    "subscription_tier",
    "created_at",
    "updated_at",
    "last_login",
  ],
  ai_models: [
    "id",
    "model_id",
    "name",
    "description",
    "category",
    "provider",
    "provider_model_name",
    "status",
    "created_at",
    "updated_at",
  ],
  processing_jobs: [
    "id",
    "user_id",
    "original_filename",
    "original_file_size",
    "original_file_type",
    "model_id",
    "status",
    "created_at",
    "updated_at",
    "completed_at",
  ],
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
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    results.connection = !connectionError

    if (connectionError) {
      results.issues.push({
        type: "connection",
        severity: "critical",
        message: `Database connection failed: ${connectionError.message}`,
        autoFixable: false,
      })
      results.overallHealth = "critical"
      return results
    }

    // Check tables
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

    // Check views
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

    // Check for data integrity issues
    const integrityIssues = await checkDataIntegrity()
    results.issues.push(...integrityIssues)

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
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)
      .maybeSingle()

    return !error && !!data
  } catch {
    return false
  }
}

// Check if a view exists
export async function checkViewExists(viewName: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase
      .from("information_schema.views")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", viewName)
      .maybeSingle()

    return !error && !!data
  } catch {
    return false
  }
}

// Get columns for a table
export async function getTableColumns(tableName: string): Promise<string[]> {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)

    if (error || !data) return []
    return data.map((col) => col.column_name)
  } catch {
    return []
  }
}

// Check for data integrity issues
async function checkDataIntegrity(): Promise<DatabaseIssue[]> {
  const supabase = getSupabaseClient()
  const issues: DatabaseIssue[] = []

  try {
    // Check for orphaned processing jobs (user_id doesn't exist in users table)
    const { data: orphanedJobs, error: jobsError } = await supabase.rpc("get_orphaned_jobs")

    if (!jobsError && orphanedJobs && orphanedJobs.length > 0) {
      issues.push({
        type: "data_integrity",
        severity: "medium",
        message: `Found ${orphanedJobs.length} orphaned processing jobs`,
        autoFixable: true,
        details: { orphanedJobs },
      })
    }

    // Check for invalid model references
    const { data: invalidModels, error: modelsError } = await supabase.rpc("get_invalid_model_references")

    if (!modelsError && invalidModels && invalidModels.length > 0) {
      issues.push({
        type: "data_integrity",
        severity: "medium",
        message: `Found ${invalidModels.length} jobs with invalid model references`,
        autoFixable: true,
        details: { invalidModels },
      })
    }
  } catch (error) {
    console.error("Data integrity check failed:", error)
  }

  return issues
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
          fixed = await fixTableSchema(issue.tableName!, issue.missingColumns || [])
          break

        case "data_integrity":
          fixed = await fixDataIntegrityIssue(issue)
          break

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

// Create a missing table
async function createMissingTable(tableName: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  // Get SQL script for table creation
  const sqlScript = getTableCreationScript(tableName)
  if (!sqlScript) return false

  try {
    const { error } = await supabase.rpc("run_sql", { sql: sqlScript })
    return !error
  } catch {
    return false
  }
}

// Create a missing view
async function createMissingView(viewName: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  // Get SQL script for view creation
  const sqlScript = getViewCreationScript(viewName)
  if (!sqlScript) return false

  try {
    const { error } = await supabase.rpc("run_sql", { sql: sqlScript })
    return !error
  } catch {
    return false
  }
}

// Fix table schema by adding missing columns
async function fixTableSchema(tableName: string, missingColumns: string[]): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    for (const column of missingColumns) {
      const columnDef = getColumnDefinition(tableName, column)
      if (!columnDef) continue

      const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${column} ${columnDef};`
      const { error } = await supabase.rpc("run_sql", { sql })

      if (error) return false
    }

    return true
  } catch {
    return false
  }
}

// Fix data integrity issues
async function fixDataIntegrityIssue(issue: DatabaseIssue): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    if (issue.details?.orphanedJobs) {
      // Option 1: Delete orphaned jobs
      const { error } = await supabase
        .from("processing_jobs")
        .delete()
        .in(
          "id",
          issue.details.orphanedJobs.map((job) => job.id),
        )

      return !error
    }

    if (issue.details?.invalidModels) {
      // Option 1: Update jobs to use a default model
      const defaultModelQuery = await supabase.from("ai_models").select("id").eq("model_id", "real-esrgan-4x").single()

      if (defaultModelQuery.error || !defaultModelQuery.data) return false

      const defaultModelId = defaultModelQuery.data.id

      const { error } = await supabase
        .from("processing_jobs")
        .update({ model_id: defaultModelId })
        .in(
          "id",
          issue.details.invalidModels.map((job) => job.id),
        )

      return !error
    }

    return false
  } catch {
    return false
  }
}

// Get SQL script for table creation
function getTableCreationScript(tableName: string): string | null {
  // These would normally be loaded from SQL files or a migrations system
  const scripts: Record<string, string> = {
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
        email_verified BOOLEAN DEFAULT false,
        credits_remaining INTEGER DEFAULT 100,
        subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        profile_image_url TEXT,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );
    `,
    user_roles: `
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    ai_models: `
      CREATE TABLE IF NOT EXISTS ai_models (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        model_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL CHECK (provider IN ('replicate', 'fal', 'openai', 'custom')),
        provider_model_name VARCHAR(255) NOT NULL,
        provider_version VARCHAR(255),
        input_field VARCHAR(50) DEFAULT 'image',
        max_upscale INTEGER DEFAULT 4,
        processing_time_estimate VARCHAR(50),
        best_for TEXT,
        is_recommended BOOLEAN DEFAULT false,
        icon_name VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    processing_jobs: `
      CREATE TABLE IF NOT EXISTS processing_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_filename VARCHAR(255) NOT NULL,
        original_file_size BIGINT NOT NULL,
        original_file_type VARCHAR(50) NOT NULL,
        original_file_url TEXT,
        model_id UUID NOT NULL REFERENCES ai_models(id),
        settings JSONB DEFAULT '{}',
        upscale_factor INTEGER DEFAULT 2,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        progress_percentage INTEGER DEFAULT 0,
        progress_message TEXT,
        provider_job_id VARCHAR(255),
        output_file_url TEXT,
        enhanced_file_size BIGINT,
        processing_time_seconds INTEGER,
        credits_used INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        error_message TEXT,
        error_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `,
    system_logs: `
      CREATE TABLE IF NOT EXISTS system_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        details JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  }

  return scripts[tableName] || null
}

// Get SQL script for view creation
function getViewCreationScript(viewName: string): string | null {
  // These would normally be loaded from SQL files or a migrations system
  const scripts: Record<string, string> = {
    user_stats: `
      CREATE OR REPLACE VIEW user_stats AS
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.subscription_tier,
        u.credits_remaining,
        COUNT(pj.id) as total_jobs,
        COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
        COUNT(CASE WHEN pj.status = 'processing' THEN 1 END) as active_jobs,
        COALESCE(AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END), 0) as avg_processing_time
      FROM users u
      LEFT JOIN processing_jobs pj ON u.id = pj.user_id
      GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.credits_remaining;
    `,
    model_performance: `
      CREATE OR REPLACE VIEW model_performance AS
      SELECT 
        m.id,
        m.model_id,
        m.name,
        m.category,
        m.provider,
        COUNT(pj.id) as total_jobs,
        COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
        COALESCE(AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END), 0) as avg_processing_time
      FROM ai_models m
      LEFT JOIN processing_jobs pj ON m.id = pj.model_id
      GROUP BY m.id, m.model_id, m.name, m.category, m.provider;
    `,
    daily_usage_stats: `
      CREATE OR REPLACE VIEW daily_usage_stats AS
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(credits_used) as total_credits_used,
        AVG(CASE WHEN status = 'completed' THEN processing_time_seconds END) as avg_processing_time
      FROM processing_jobs
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
    `,
  }

  return scripts[viewName] || null
}

// Get column definition for a specific column
function getColumnDefinition(tableName: string, columnName: string): string | null {
  const definitions: Record<string, Record<string, string>> = {
    users: {
      email: "VARCHAR(255) UNIQUE NOT NULL",
      name: "VARCHAR(255) NOT NULL",
      password_hash: "VARCHAR(255)",
      role: "VARCHAR(50) DEFAULT 'user'",
      credits_remaining: "INTEGER DEFAULT 100",
      created_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
      updated_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
    },
    ai_models: {
      model_id: "VARCHAR(100) UNIQUE NOT NULL",
      name: "VARCHAR(255) NOT NULL",
      provider: "VARCHAR(50) NOT NULL",
      status: "VARCHAR(20) DEFAULT 'active'",
      created_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
      updated_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
    },
    processing_jobs: {
      user_id: "UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE",
      original_filename: "VARCHAR(255) NOT NULL",
      status: "VARCHAR(20) DEFAULT 'pending'",
      created_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
      updated_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
    },
  }

  return definitions[tableName]?.[columnName] || null
}

// Create stored procedures for database maintenance
export async function createDatabaseProcedures(): Promise<boolean> {
  const supabase = getSupabaseClient()

  const procedures = [
    // Procedure to get orphaned jobs
    `
    CREATE OR REPLACE FUNCTION get_orphaned_jobs()
    RETURNS TABLE (id UUID, original_filename TEXT, created_at TIMESTAMP WITH TIME ZONE) AS $$
    BEGIN
      RETURN QUERY
      SELECT pj.id, pj.original_filename, pj.created_at
      FROM processing_jobs pj
      LEFT JOIN users u ON pj.user_id = u.id
      WHERE u.id IS NULL;
    END;
    $$ LANGUAGE plpgsql;
    `,

    // Procedure to get jobs with invalid model references
    `
    CREATE OR REPLACE FUNCTION get_invalid_model_references()
    RETURNS TABLE (id UUID, original_filename TEXT, created_at TIMESTAMP WITH TIME ZONE) AS $$
    BEGIN
      RETURN QUERY
      SELECT pj.id, pj.original_filename, pj.created_at
      FROM processing_jobs pj
      LEFT JOIN ai_models m ON pj.model_id = m.id
      WHERE m.id IS NULL;
    END;
    $$ LANGUAGE plpgsql;
    `,

    // Procedure to run arbitrary SQL (for admin use only)
    `
    CREATE OR REPLACE FUNCTION run_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
    `,
  ]

  try {
    for (const procedure of procedures) {
      const { error } = await supabase.rpc("run_sql", { sql: procedure })
      if (error) return false
    }

    return true
  } catch {
    return false
  }
}

// Database migration system
export async function runMigration(version: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    // Check if migration has already been applied
    const { data, error } = await supabase.from("migrations").select("*").eq("version", version).maybeSingle()

    if (!error && data) {
      console.log(`Migration ${version} already applied`)
      return true
    }

    // Get migration script
    const migrationScript = getMigrationScript(version)
    if (!migrationScript) {
      console.error(`Migration script for version ${version} not found`)
      return false
    }

    // Run migration
    const { error: migrationError } = await supabase.rpc("run_sql", { sql: migrationScript })

    if (migrationError) {
      console.error(`Migration ${version} failed:`, migrationError)
      return false
    }

    // Record migration
    const { error: recordError } = await supabase.from("migrations").insert({
      version,
      applied_at: new Date().toISOString(),
    })

    if (recordError) {
      console.error(`Failed to record migration ${version}:`, recordError)
      return false
    }

    console.log(`Migration ${version} applied successfully`)
    return true
  } catch (error) {
    console.error(`Migration ${version} failed with exception:`, error)
    return false
  }
}

// Get migration script for a specific version
function getMigrationScript(version: string): string | null {
  // These would normally be loaded from SQL files
  const migrations: Record<string, string> = {
    "1.0.0": `
      -- Create migrations table if it doesn't exist
      CREATE TABLE IF NOT EXISTS migrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        version VARCHAR(50) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create extension for UUID generation if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `,
    "1.0.1": `
      -- Add new columns to users table
      ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false}';
    `,
    "1.0.2": `
      -- Add new columns to ai_models table
      ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS min_processing_time INTEGER DEFAULT 0;
      ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS max_processing_time INTEGER DEFAULT 0;
      ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS supported_formats TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'];
    `,
  }

  return migrations[version] || null
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

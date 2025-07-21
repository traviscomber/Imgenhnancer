import { checkDatabaseHealth, autoFixDatabaseIssues, runMigration } from "../lib/database-manager"

async function setupDatabase() {
  console.log("🔧 Starting database setup...")

  // Check database health
  console.log("🔍 Checking database health...")
  const healthResult = await checkDatabaseHealth()

  console.log(`📊 Database health: ${healthResult.overallHealth}`)
  console.log(`📋 Found ${healthResult.issues.length} issues`)

  // Apply migrations
  console.log("🔄 Applying migrations...")
  await runMigration("1.0.0")
  await runMigration("1.0.1")
  await runMigration("1.0.2")

  // Auto-fix issues
  if (healthResult.issues.length > 0) {
    console.log("🔧 Auto-fixing issues...")
    const fixableIssues = healthResult.issues.filter((issue) => issue.autoFixable)

    if (fixableIssues.length > 0) {
      const fixResult = await autoFixDatabaseIssues(fixableIssues)

      console.log(`✅ Fixed: ${fixResult.fixed.length}`)
      console.log(`❌ Failed: ${fixResult.failed.length}`)
      console.log(`⏭️ Skipped: ${fixResult.skipped.length}`)

      if (fixResult.failed.length > 0) {
        console.log("❌ Failed fixes:")
        fixResult.failed.forEach((item) => {
          console.log(`  - ${item.issue.message}: ${item.reason}`)
        })
      }
    } else {
      console.log("⚠️ No auto-fixable issues found")
    }
  }

  // Check health again
  console.log("🔍 Checking database health after fixes...")
  const updatedHealth = await checkDatabaseHealth()

  console.log(`📊 Updated database health: ${updatedHealth.overallHealth}`)
  console.log(`📋 Remaining issues: ${updatedHealth.issues.length}`)

  if (updatedHealth.issues.length > 0) {
    console.log("⚠️ Remaining issues that need manual intervention:")
    updatedHealth.issues.forEach((issue) => {
      console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message}`)
    })
  }

  console.log("✅ Database setup complete!")
}

// Run the setup
setupDatabase().catch((error) => {
  console.error("❌ Database setup failed:", error)
  process.exit(1)
})

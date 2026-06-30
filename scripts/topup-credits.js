import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function topUpCredits() {
  try {
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", "travis@nuanu.com")
      .single()

    if (userError || !users) {
      console.error("User not found:", userError)
      return
    }

    const userId = users.id
    console.log(`Found user: ${users.email} (${userId})`)

    // Get current credits
    const { data: creditData, error: creditError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single()

    if (creditError) {
      console.error("Error fetching credits:", creditError)
      return
    }

    const currentCredits = creditData?.credits || 0
    const newCredits = currentCredits + 9999

    // Update credits
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating credits:", updateError)
      return
    }

    // Log transaction
    const { error: txError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: 9999,
      type: "credit_topup",
      operation: "add",
      description: "Manual credit topup",
      created_at: new Date().toISOString(),
    })

    if (txError) {
      console.error("Error logging transaction:", txError)
      return
    }

    console.log(`✓ Successfully added 9999 credits to travis@nuanu.com`)
    console.log(`  Previous balance: ${currentCredits}`)
    console.log(`  New balance: ${newCredits}`)
  } catch (error) {
    console.error("Script error:", error)
  }
}

topUpCredits()

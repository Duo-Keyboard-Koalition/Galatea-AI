import { createClient } from "@/utils/supabase/client"

/**
 * Save MetaMask wallet address to user profile
 */
export async function saveMetaMaskWallet(walletAddress: string): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    throw new Error("Invalid Ethereum wallet address format")
  }

  try {
    // Try to update first
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ metamask_wallet_address: walletAddress })
      .eq("id", user.id)

    if (updateError) {
      // If update fails, try to insert (in case profile doesn't exist)
      if (updateError.message?.includes("schema cache") || updateError.message?.includes("relation") || updateError.message?.includes("does not exist")) {
        throw new Error("User profiles table not found. Please run database migrations.")
      }
      
      // Check if profile doesn't exist, try to create it
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          metamask_wallet_address: walletAddress,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || null,
        })

      if (insertError) {
        throw new Error(`Failed to save MetaMask wallet: ${insertError.message}`)
      }
    }
  } catch (err: any) {
    if (err.message?.includes("migrations")) {
      throw err
    }
    throw new Error(`Failed to save MetaMask wallet: ${err.message || "Unknown error"}`)
  }
}

/**
 * Get MetaMask wallet address from user profile
 */
export async function getMetaMaskWallet(): Promise<string | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("metamask_wallet_address")
      .eq("id", user.id)
      .single()

    if (error) {
      // Table doesn't exist - throw specific error
      if (error.message?.includes("schema cache") || error.message?.includes("relation") || error.message?.includes("does not exist") || error.message?.includes("Could not find the table")) {
        throw new Error("Table not found: user_profiles. Please run database migrations.")
      }
      // Profile doesn't exist - return null (this is fine)
      if (error.code === "PGRST116") {
        return null
      }
      // For other errors, log but don't crash
      console.error("Error getting MetaMask wallet:", error.message)
      return null
    }

    return data?.metamask_wallet_address || null
  } catch (err: any) {
    // Re-throw table not found errors
    if (err.message?.includes("Table not found") || err.message?.includes("migrations")) {
      throw err
    }
    // Handle any other unexpected errors gracefully
    console.error("Unexpected error getting MetaMask wallet:", err.message)
    return null
  }
}

/**
 * Remove MetaMask wallet address from user profile
 */
export async function removeMetaMaskWallet(): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ metamask_wallet_address: null })
      .eq("id", user.id)

    if (error) {
      if (error.message?.includes("schema cache") || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        // Table doesn't exist - nothing to remove, so this is fine
        console.warn("User profiles table not found, skipping wallet removal")
        return
      }
      throw new Error(`Failed to remove MetaMask wallet: ${error.message}`)
    }
  } catch (err: any) {
    // If it's a table not found error, it's okay - nothing to remove
    if (err.message?.includes("schema cache") || err.message?.includes("relation") || err.message?.includes("does not exist")) {
      console.warn("User profiles table not found, skipping wallet removal")
      return
    }
    throw new Error(`Failed to remove MetaMask wallet: ${err.message || "Unknown error"}`)
  }
}

/**
 * Check if user has MetaMask wallet connected
 */
export async function hasMetaMaskWallet(): Promise<boolean> {
  const wallet = await getMetaMaskWallet()
  return wallet !== null
}


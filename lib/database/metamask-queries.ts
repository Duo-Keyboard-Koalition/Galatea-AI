import { createClient } from "@/utils/supabase/client"

/**
 * Get all users who have MetaMask wallets connected
 */
export async function getAllUsersWithMetaMask(): Promise<
  Array<{
    user_id: string
    wallet_address: string
    display_name: string | null
    email: string | null
  }>
> {
  const supabase = createClient()

  // Get admin client for this query (or use service role key)
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, metamask_wallet_address, auth.users!inner(email)")
    .not("metamask_wallet_address", "is", null)

  if (error) {
    throw new Error(`Failed to get users with MetaMask: ${error.message}`)
  }

  return (
    data?.map((profile) => ({
      user_id: profile.id,
      wallet_address: profile.metamask_wallet_address!,
      display_name: profile.display_name,
      email: (profile as any).users?.email || null,
    })) || []
  )
}

/**
 * Get user ID by MetaMask wallet address
 */
export async function getUserIdByWalletAddress(walletAddress: string): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("metamask_wallet_address", walletAddress)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to get user by wallet address: ${error.message}`)
  }

  return data?.id || null
}

/**
 * Check if a wallet address is already connected to another account
 */
export async function isWalletAddressTaken(walletAddress: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()

  let query = supabase
    .from("user_profiles")
    .select("id")
    .eq("metamask_wallet_address", walletAddress)

  if (excludeUserId) {
    query = query.neq("id", excludeUserId)
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === "PGRST116") return false
    throw new Error(`Failed to check wallet address: ${error.message}`)
  }

  return data !== null
}

/**
 * Get count of users with MetaMask connected
 */
export async function getMetaMaskUserCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .not("metamask_wallet_address", "is", null)

  if (error) {
    throw new Error(`Failed to get MetaMask user count: ${error.message}`)
  }

  return count || 0
}


/**
 * MetaMask Wallet Utilities
 * Handles MetaMask connection and wallet address management
 */

export interface MetaMaskError {
  code: number
  message: string
}

export interface WalletConnection {
  address: string
  chainId: string
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
}

/**
 * Request MetaMask connection and get wallet address
 */
export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.')
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.')
    }

    return accounts[0] as string
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request.')
    }
    throw new Error(`Failed to connect MetaMask: ${error.message}`)
  }
}

/**
 * Get the current connected wallet address (if already connected)
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })

    if (!accounts || accounts.length === 0) {
      return null
    }

    return accounts[0] as string
  } catch (error) {
    console.error('Error getting current wallet address:', error)
    return null
  }
}

/**
 * Get the current chain ID
 */
export async function getChainId(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    })

    return chainId as string
  } catch (error) {
    console.error('Error getting chain ID:', error)
    return null
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {}
  }

  const handler = (accounts: string[]) => {
    callback(accounts)
  }

  window.ethereum.on('accountsChanged', handler)

  return () => {
    window.ethereum.removeListener('accountsChanged', handler)
  }
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {}
  }

  const handler = (chainId: string) => {
    callback(chainId)
  }

  window.ethereum.on('chainChanged', handler)

  return () => {
    window.ethereum.removeListener('chainChanged', handler)
  }
}

/**
 * Format wallet address for display (e.g., "0x1234...5678")
 */
export function formatWalletAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}


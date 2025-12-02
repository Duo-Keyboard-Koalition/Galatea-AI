"use client"

import { useState, useEffect, useCallback } from "react"
import {
  isMetaMaskInstalled,
  connectMetaMask,
  getCurrentWalletAddress,
  getChainId,
  onAccountsChanged,
  onChainChanged,
  formatWalletAddress,
} from "@/lib/metamask/wallet"
import { saveMetaMaskWallet, getMetaMaskWallet, removeMetaMaskWallet } from "@/lib/database/metamask"
import { useToast } from "@/components/ui/use-toast"

export interface UseMetaMaskReturn {
  isInstalled: boolean
  isConnected: boolean
  walletAddress: string | null
  formattedAddress: string
  chainId: string | null
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook to manage MetaMask wallet connection
 */
export function useMetaMask(): UseMetaMaskReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const isInstalled = isMetaMaskInstalled()

  // Load saved wallet address from database
  const loadSavedWallet = useCallback(async () => {
    try {
      const savedAddress = await getMetaMaskWallet()
      if (savedAddress) {
        setWalletAddress(savedAddress)
        setIsConnected(true)
      }
    } catch (err: any) {
      // Check if it's a table not found error
      if (err.message?.includes("Table not found") || err.message?.includes("migrations")) {
        setError(err.message)
      } else {
        console.error("Error loading saved wallet:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check current MetaMask connection
  const checkConnection = useCallback(async () => {
    if (!isInstalled) {
      setIsLoading(false)
      return
    }

    try {
      const currentAddress = await getCurrentWalletAddress()
      const currentChainId = await getChainId()

      setChainId(currentChainId)

      if (currentAddress) {
        // Check if it matches saved address
        try {
          const savedAddress = await getMetaMaskWallet()
          if (savedAddress === currentAddress) {
            setWalletAddress(currentAddress)
            setIsConnected(true)
          } else if (savedAddress && savedAddress !== currentAddress) {
            // User switched accounts
            setWalletAddress(currentAddress)
            setIsConnected(true)
            // Optionally update saved address
            try {
              await saveMetaMaskWallet(currentAddress)
            } catch (saveErr: any) {
              if (saveErr.message?.includes("Table not found") || saveErr.message?.includes("migrations")) {
                setError(saveErr.message)
              }
            }
          } else {
            // MetaMask connected but not saved
            setWalletAddress(currentAddress)
            setIsConnected(true)
          }
        } catch (err: any) {
          // Check if it's a table not found error
          if (err.message?.includes("Table not found") || err.message?.includes("migrations")) {
            setError(err.message)
          }
        }
      } else {
        setIsConnected(false)
        setWalletAddress(null)
      }
    } catch (err: any) {
      console.error("Error checking connection:", err)
      if (err.message?.includes("Table not found") || err.message?.includes("migrations")) {
        setError(err.message)
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isInstalled])

  // Connect MetaMask and save to database
  const connect = useCallback(async () => {
    if (!isInstalled) {
      setError("MetaMask is not installed")
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension to connect your wallet.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const address = await connectMetaMask()
      await saveMetaMaskWallet(address)
      setWalletAddress(address)
      setIsConnected(true)

      const currentChainId = await getChainId()
      setChainId(currentChainId)

      toast({
        title: "Wallet Connected",
        description: `MetaMask wallet connected: ${formatWalletAddress(address)}`,
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isInstalled, toast])

  // Disconnect MetaMask (remove from database)
  const disconnect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await removeMetaMaskWallet()
      setWalletAddress(null)
      setIsConnected(false)
      setChainId(null)

      toast({
        title: "Wallet Disconnected",
        description: "MetaMask wallet has been disconnected from your account.",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Disconnect Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Refresh connection status
  const refresh = useCallback(async () => {
    await checkConnection()
  }, [checkConnection])

  // Initialize on mount
  useEffect(() => {
    loadSavedWallet()
    checkConnection()
  }, [loadSavedWallet, checkConnection])

  // Listen for account changes
  useEffect(() => {
    if (!isInstalled) return

    const unsubscribeAccounts = onAccountsChanged(async (accounts) => {
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
        // Update saved address
        try {
          await saveMetaMaskWallet(address)
        } catch (err) {
          console.error("Error saving wallet address:", err)
        }
      } else {
        setWalletAddress(null)
        setIsConnected(false)
      }
      await checkConnection()
    })

    const unsubscribeChain = onChainChanged(async (newChainId) => {
      setChainId(newChainId)
    })

    return () => {
      unsubscribeAccounts()
      unsubscribeChain()
    }
  }, [isInstalled, checkConnection])

  return {
    isInstalled,
    isConnected,
    walletAddress,
    formattedAddress: walletAddress ? formatWalletAddress(walletAddress) : "",
    chainId,
    isLoading,
    error,
    connect,
    disconnect,
    refresh,
  }
}


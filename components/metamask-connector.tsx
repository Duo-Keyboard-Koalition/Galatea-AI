"use client"

import { Button } from "@/components/ui/button"
import { useMetaMask } from "@/lib/hooks/use-metamask"
import { Wallet, Loader2, CheckCircle2, XCircle } from "lucide-react"

interface MetaMaskConnectorProps {
  className?: string
  showStatus?: boolean
}

/**
 * Component to connect/disconnect MetaMask wallet
 */
export function MetaMaskConnector({ className, showStatus = true }: MetaMaskConnectorProps) {
  const {
    isInstalled,
    isConnected,
    walletAddress,
    formattedAddress,
    isLoading,
    error,
    connect,
    disconnect,
  } = useMetaMask()

  if (!isInstalled) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          disabled
          className="w-full"
        >
          <Wallet className="w-4 h-4 mr-2" />
          MetaMask Not Installed
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Install MetaMask extension to connect your wallet
        </p>
      </div>
    )
  }

  if (isConnected && walletAddress) {
    return (
      <div className={className}>
        {showStatus && (
          <div className="mb-3 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Wallet Connected</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono">{formattedAddress}</p>
          </div>
        )}
        <Button
          variant="outline"
          onClick={disconnect}
          disabled={isLoading}
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Disconnecting...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </>
          )}
        </Button>
        {error && (
          <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
        )}
      </div>
    )
  }

  // Check if error is about table not found
  const isTableNotFound = error?.includes("Table not found") || error?.includes("migrations")

  return (
    <div className={className}>
      {showStatus && error && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
      <Button
        variant="outline"
        onClick={connect}
        disabled={isLoading || isTableNotFound}
        className="w-full border-teal-500/50 text-teal-400 hover:bg-teal-500/10 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : isTableNotFound ? (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Table Not Found
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect MetaMask
          </>
        )}
      </Button>
      {isTableNotFound && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Please run database migrations to enable MetaMask support
        </p>
      )}
    </div>
  )
}


# MetaMask Integration Guide

This document explains how MetaMask wallet connection works in the Galatea.AI application.

## Overview

Each user account can have one MetaMask wallet address connected. The wallet address is stored in the `user_profiles` table in the `metamask_wallet_address` column.

## Database Schema

The `user_profiles` table includes:
- `metamask_wallet_address` (TEXT, nullable) - Ethereum wallet address from MetaMask

## Usage

### 1. Using the Hook

```tsx
import { useMetaMask } from "@/lib/hooks/use-metamask"

function MyComponent() {
  const {
    isInstalled,      // Is MetaMask extension installed?
    isConnected,      // Is wallet connected?
    walletAddress,    // Full wallet address (0x...)
    formattedAddress, // Formatted address (0x1234...5678)
    chainId,          // Current chain ID
    isLoading,        // Is operation in progress?
    error,            // Error message if any
    connect,          // Function to connect wallet
    disconnect,       // Function to disconnect wallet
    refresh,          // Function to refresh connection status
  } = useMetaMask()

  return (
    <div>
      {isConnected ? (
        <p>Connected: {formattedAddress}</p>
      ) : (
        <button onClick={connect}>Connect MetaMask</button>
      )}
    </div>
  )
}
```

### 2. Using the Component

```tsx
import { MetaMaskConnector } from "@/components/metamask-connector"

function MyPage() {
  return (
    <div>
      <h2>Wallet Connection</h2>
      <MetaMaskConnector showStatus={true} />
    </div>
  )
}
```

### 3. Query Functions

#### Get current user's wallet
```tsx
import { getMetaMaskWallet } from "@/lib/database/metamask"

const wallet = await getMetaMaskWallet()
```

#### Save wallet address
```tsx
import { saveMetaMaskWallet } from "@/lib/database/metamask"

await saveMetaMaskWallet("0x1234...")
```

#### Check if wallet is connected
```tsx
import { hasMetaMaskWallet } from "@/lib/database/metamask"

const hasWallet = await hasMetaMaskWallet()
```

#### Get all users with MetaMask
```tsx
import { getAllUsersWithMetaMask } from "@/lib/database/metamask-queries"

const users = await getAllUsersWithMetaMask()
// Returns: [{ user_id, wallet_address, display_name, email }, ...]
```

#### Find user by wallet address
```tsx
import { getUserIdByWalletAddress } from "@/lib/database/metamask-queries"

const userId = await getUserIdByWalletAddress("0x1234...")
```

#### Check if wallet is already taken
```tsx
import { isWalletAddressTaken } from "@/lib/database/metamask-queries"

const isTaken = await isWalletAddressTaken("0x1234...", excludeUserId)
```

## Features

- ✅ Automatic wallet detection
- ✅ Account change detection
- ✅ Chain change detection
- ✅ Wallet address validation
- ✅ Database persistence
- ✅ Error handling
- ✅ Toast notifications

## Migration

Run the migration to add the `metamask_wallet_address` column:

```bash
# The migration file is already created:
# supabase/migrations/20250102000001_add_metamask_wallet.sql
```

## Security Notes

1. Wallet addresses are stored in plain text (they're public anyway)
2. Only the authenticated user can update their own wallet address
3. Wallet addresses are validated for Ethereum format (0x + 40 hex chars)
4. Users can disconnect their wallet at any time

## Future Enhancements

- Support for multiple wallets per user
- Wallet signature verification
- NFT display from wallet
- Token balance display
- Transaction history


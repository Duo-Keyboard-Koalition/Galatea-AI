"use client"

import { useEffect } from "react"

/**
 * Suppresses MetaMask connection errors in the console.
 * These errors occur when MetaMask extension injects scripts but isn't actively being used.
 * This component can be removed when MetaMask integration is added.
 */
export function MetaMaskErrorSuppressor() {
  useEffect(() => {
    // Suppress MetaMask errors that occur when extension is installed but not actively used
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      // Filter out MetaMask connection errors
      if (
        message.includes("Failed to connect to MetaMask") ||
        message.includes("metamask") ||
        message.includes("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn")
      ) {
        // Silently ignore MetaMask errors
        return
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      // Filter out MetaMask warnings
      if (
        message.includes("MetaMask") ||
        message.includes("ethereum") ||
        message.includes("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn")
      ) {
        // Silently ignore MetaMask warnings
        return
      }
      originalWarn.apply(console, args)
    }

    // Also catch unhandled promise rejections from MetaMask
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ""
      if (
        reason.includes("MetaMask") ||
        reason.includes("Failed to connect") ||
        reason.includes("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn")
      ) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}


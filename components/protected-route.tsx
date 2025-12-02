"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/simple-auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { isDemoMode } from "@/lib/app-config"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser && !isDemoMode()) {
      router.push("/sign-in")
    }
  }, [currentUser, loading, router])

  if (loading) {
    return <LoadingSpinner size="medium" fullScreen />
  }

  return currentUser || isDemoMode() ? <>{children}</> : null
}

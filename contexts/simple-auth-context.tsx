"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
})

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let supabase: any = null;

    try {
      supabase = createClient()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Error getting initial session:", error)
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        setCurrentUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [mounted])

  const logout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setCurrentUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider')
  }
  return context
}

"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { isDemoMode } from '@/lib/app-config'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  logout: () => Promise<void>
  demoUser?: {
    name: string
    gender: 'male' | 'female'
  }
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
})

const DEMO_USER_MALE: User = {
  id: 'demo-user-male',
  email: 'john.smith@demo.com',
  user_metadata: {
    full_name: 'John Smith',
    gender: 'male',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

const DEMO_USER_FEMALE: User = {
  id: 'demo-user-female',
  email: 'jane.smith@demo.com',
  user_metadata: {
    full_name: 'Jane Smith',
    gender: 'female',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [demoGender, setDemoGender] = useState<'male' | 'female'>('male')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (isDemoMode()) {
      const storedGender = localStorage.getItem('demo_gender') as 'male' | 'female' | null
      const gender = storedGender || 'male'
      setDemoGender(gender)
      setCurrentUser(gender === 'male' ? DEMO_USER_MALE : DEMO_USER_FEMALE)
      setLoading(false)
      return
    }

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
    if (isDemoMode()) {
      setCurrentUser(null)
      return
    }

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
        demoUser: isDemoMode() ? {
          name: demoGender === 'male' ? 'John Smith' : 'Jane Smith',
          gender: demoGender
        } : undefined
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

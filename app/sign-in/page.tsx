"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Logo } from "@/components/logo"
import { createClient } from "@/utils/supabase/client"
import { Mail, Lock } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const messageParam = urlParams.get("message")
    if (errorParam) setError(decodeURIComponent(errorParam))
    if (messageParam) setSuccessMessage(decodeURIComponent(messageParam))
  }, [router, mounted])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }
      
      window.location.href = "/dashboard"
    } catch (e: any) {
      setError(e?.message || "Failed to sign in with email")
      setIsLoading(false)
    }
  };

  const handleDiscordSignIn = async () => {
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
      }
      // Don't set loading to false here as we're redirecting
    } catch (e: any) {
      setError(e?.message || "Failed to sign in with Discord")
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative w-full max-w-md px-8 py-12">
        {/* Logo / Loading Spinner - Centered at same point */}
        <div className="flex justify-center items-center mb-8 relative" style={{ height: '48px' }}>
          {isLoading ? (
            <LoadingSpinner size="medium" />
          ) : (
            <Logo size="medium" showText={true} className="pointer-events-none" />
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-gray-900 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-gray-900 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-teal-500 border-gray-600 rounded focus:ring-teal-500 bg-gray-900" />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <Link href="/auth/reset-password" className="text-sm text-teal-400 hover:text-teal-300">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? "Signing you in..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Button */}
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="w-full border-teal-500 text-teal-400 hover:bg-teal-500/10 hover-rgb-border-only transition-all duration-300"
          >
            <Link href="/sign-up" className="text-teal-400 hover:text-teal-400">Create New Account</Link>
          </Button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-teal-400 hover:text-teal-300">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link>
        </p>

        {/* Social Sign In Icons */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400 mb-4">Or sign in with</p>
          <div className="flex justify-center items-center gap-4">
            <button
              type="button"
              onClick={handleDiscordSignIn}
              disabled={isLoading}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/50"
              title="Sign in with Discord"
            >
              {isLoading ? (
                <LoadingSpinner size="small" className="border-white" />
              ) : (
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
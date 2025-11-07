"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Heart, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
import { createClient } from "@/utils/supabase/client"

interface Match {
  id: string
  companion: {
    id: string
    name: string
    age: number
    bio: string
    image_url: string
    personality: string
    interests: string[]
  }
  matched_at: string
  conversation_id?: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          companions:companion_id (
            id,
            name,
            age,
            bio,
            image_url,
            personality,
            interests
          ),
          conversations!inner (
            id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('matched_at', { ascending: false })

      if (matchesError) throw matchesError

      const formattedMatches = matchesData.map(match => ({
        id: match.id,
        companion: match.companions,
        matched_at: match.matched_at,
        conversation_id: match.conversations?.[0]?.id
      }))

      setMatches(formattedMatches)
    } catch (err) {
      setError("Failed to load matches")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner size="medium" text="Loading matches..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-6 w-6 text-white" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Your Matches</h1>
                  <p className="text-gray-400">
                    {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                  </p>
                </div>
              </div>
              <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                <Link href="/swipe/enhanced">Keep Swiping</Link>
              </Button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Matches Grid */}
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No matches yet</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start swiping to find AI companions that match your interests and personality!
                </p>
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                  <Link href="/swipe/enhanced">Start Swiping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <Card key={match.id} className="bg-gray-900 border-gray-700 overflow-hidden group hover:border-teal-500/50 transition-colors">
                    <div className="relative h-64">
                      <img
                        src={match.companion.image_url}
                        alt={match.companion.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Match Badge */}
                      <div className="absolute top-4 right-4 bg-teal-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        MATCH
                      </div>

                      {/* Companion Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {match.companion.name}, {match.companion.age}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {match.companion.personality}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {match.companion.bio}
                      </p>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {match.companion.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {match.companion.interests.length > 3 && (
                          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                            +{match.companion.interests.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Match Date */}
                      <p className="text-xs text-gray-500 mb-4">
                        Matched {new Date(match.matched_at).toLocaleDateString()}
                      </p>

                      {/* Action Button */}
                      <Button 
                        asChild 
                        className="w-full bg-teal-500 text-black hover:bg-teal-400"
                      >
                        <Link href={`/chats${match.conversation_id ? `?conversation=${match.conversation_id}` : ''}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Chatting
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Continue Swiping CTA */}
            {matches.length > 0 && (
              <div className="text-center mt-12 p-8 bg-gray-900/50 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">Want more matches?</h3>
                <p className="text-gray-400 mb-4">
                  Keep swiping to discover more AI companions that match your interests
                </p>
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                  <Link href="/swipe/enhanced">Continue Swiping</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Heart, Sparkles, Search, Filter, Calendar, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

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
    compatibility_score?: number
  }
  matched_at: string
  conversation_id?: string
  last_message?: {
    content: string
    created_at: string
    sender_id?: string
  }
  unread_count: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<'recent' | 'compatibility' | 'activity'>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    filterAndSortMatches()
  }, [matches, searchQuery, sortBy])

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get matches with companion details and conversation info
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
            interests,
            compatibility_score
          ),
          conversations!inner (
            id,
            last_message_at,
            messages!inner (
              content,
              created_at,
              sender_id,
              companion_id
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('matched_at', { ascending: false })

      if (matchesError) throw matchesError

      // Process matches to get last message and unread count
      const processedMatches = await Promise.all(
        (matchesData || []).map(async (match: any) => {
          const conversation = match.conversations[0]
          
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, companion_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count (messages from companion that user hasn't read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('is_read', false)
            .is('sender_id', null) // Messages from companion

          return {
            id: match.id,
            companion: match.companions,
            matched_at: match.matched_at,
            conversation_id: conversation.id,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      setMatches(processedMatches)
    } catch (err) {
      setError("Failed to load matches")
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load your matches",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortMatches = () => {
    let filtered = matches.filter(match =>
      match.companion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.companion.personality.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.last_message?.created_at || b.matched_at).getTime() - 
                 new Date(a.last_message?.created_at || a.matched_at).getTime()
        case 'compatibility':
          return (b.companion.compatibility_score || 0) - (a.companion.compatibility_score || 0)
        case 'activity':
          return b.unread_count - a.unread_count
        default:
          return 0
      }
    })

    setFilteredMatches(filtered)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
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
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-6 w-6 text-white" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Heart className="h-8 w-8 text-teal-400" />
                    Your Matches
                  </h1>
                  <p className="text-gray-400">
                    {filteredMatches.length} {filteredMatches.length === 1 ? 'connection' : 'connections'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-5 w-5 text-gray-400" />
                </Button>
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                  <Link href="/swipe/enhanced">Keep Swiping</Link>
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {showFilters && (
                <div className="flex gap-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <Button
                    size="sm"
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    onClick={() => setSortBy('recent')}
                    className={sortBy === 'recent' ? 'bg-teal-500 text-black' : ''}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Recent
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'compatibility' ? 'default' : 'outline'}
                    onClick={() => setSortBy('compatibility')}
                    className={sortBy === 'compatibility' ? 'bg-teal-500 text-black' : ''}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Compatibility
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'activity' ? 'default' : 'outline'}
                    onClick={() => setSortBy('activity')}
                    className={sortBy === 'activity' ? 'bg-teal-500 text-black' : ''}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Activity
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Matches Grid */}
            {filteredMatches.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  {matches.length === 0 ? 'No matches yet' : 'No matches found'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {matches.length === 0 
                    ? 'Start swiping to find AI companions that match your interests and personality!'
                    : 'Try adjusting your search or filters to find specific matches.'
                  }
                </p>
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                  <Link href="/swipe/enhanced">Start Swiping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => (
                  <Card key={match.id} className="bg-gray-900 border-gray-700 overflow-hidden group hover:border-teal-500/50 transition-all hover:scale-105">
                    <div className="relative h-64">
                      <img
                        src={match.companion.image_url}
                        alt={match.companion.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Match Badge */}
                      <div className="absolute top-4 right-4 bg-teal-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        MATCH
                      </div>

                      {/* Unread Messages Badge */}
                      {match.unread_count > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {match.unread_count} new
                        </div>
                      )}

                      {/* Compatibility Score */}
                      {match.companion.compatibility_score && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-teal-400 px-2 py-1 rounded-full text-xs font-bold">
                          {match.companion.compatibility_score}% match
                        </div>
                      )}

                      {/* Companion Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-16">
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

                      {/* Last Message Preview */}
                      {match.last_message && (
                        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {match.last_message.sender_id ? 'You: ' : `${match.companion.name}: `}
                            {match.last_message.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeAgo(match.last_message.created_at)}
                          </p>
                        </div>
                      )}

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
                      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Matched {getTimeAgo(match.matched_at)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          asChild 
                          className="flex-1 bg-teal-500 text-black hover:bg-teal-400"
                        >
                          <Link href={`/chats?conversation=${match.conversation_id}`}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                            {match.unread_count > 0 && (
                              <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                {match.unread_count}
                              </span>
                            )}
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800"
                        >
                          <Link href={`/memory/${match.companion.id}`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Continue Swiping CTA */}
            {filteredMatches.length > 0 && (
              <div className="text-center mt-12 p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700">
                <Sparkles className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Want more connections?</h3>
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
"use client"

import { useState, useEffect } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Heart, X, Star, MessageCircle, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SwipeCard } from "@/components/swipe-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
// Edge functions temporarily disabled - focusing on auth

interface AICompanion {
  id: string
  name: string
  age: number
  bio: string
  personality: string
  interests: string[]
  personality_traits: string[]
  communication_style: string
  learning_capacity?: string
  backstory?: string
  favorite_topics: string[]
  relationship_goals: string[]
  image_url: string
  compatibility_score?: number
}

export default function EnhancedSwipePage() {
  const [companions, setCompanions] = useState<AICompanion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<string[]>([])
  const [rejections, setRejections] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0])
  const nopeScale = useTransform(x, [-150, -50], [1, 0.8])
  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const likeScale = useTransform(x, [50, 150], [0.8, 1])

  useEffect(() => {
    loadCompanions()
  }, [])

  const loadCompanions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const fetchedCompanions = await getRecommendations(20, [...matches, ...rejections])
      
      if (fetchedCompanions.length === 0) {
        setError("No more companions available. Check back later!")
      } else {
        setCompanions(fetchedCompanions)
      }
    } catch (err) {
      setError("Failed to load companions. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (currentIndex >= companions.length || isProcessing) return

    const currentCompanion = companions[currentIndex]
    setIsProcessing(true)

    try {
      let decision: 'like' | 'pass' | 'super_like'
      if (direction === "right") {
        decision = 'like'
      } else if (direction === "up") {
        decision = 'super_like'
      } else {
        decision = 'pass'
      }

      const result = await processSwipe(currentCompanion.id, decision)

      if (result.success) {
        if (decision === 'like' || decision === 'super_like') {
          setMatches(prev => [...prev, currentCompanion.id])
          
          if (result.isMatch) {
            toast({
              title: "🎉 It's a Match!",
              description: `You matched with ${currentCompanion.name}! Start chatting now.`,
            })
          }
        } else {
          setRejections(prev => [...prev, currentCompanion.id])
        }

        // Move to next companion
        if (currentIndex < companions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          // Load more companions or show completion
          await loadCompanions()
          setCurrentIndex(0)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process swipe",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Swipe error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > threshold) {
        handleSwipe("right")
      } else {
        handleSwipe("left")
      }
    } else if (info.offset.y < -threshold) {
      handleSwipe("up")
    }

    // Reset card position
    x.set(0)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner size="medium" text="Loading companions..." />
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadCompanions} className="bg-teal-500 text-black hover:bg-teal-400">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (companions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-teal-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">All caught up!</h2>
              <p className="text-gray-300 mb-8">You've seen all available companions.</p>
              <div className="space-y-4">
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400 w-full">
                  <Link href="/matches">View Your Matches ({matches.length})</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentCompanion = companions[currentIndex]
  const nextCompanion = companions[currentIndex + 1]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="pt-20 pb-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 max-w-md mx-auto">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Discover</h1>
              <p className="text-sm text-gray-400">
                {currentIndex + 1} of {companions.length}
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/matches">
                <Heart className="h-6 w-6 text-teal-400" />
                {matches.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </Link>
            </Button>
          </div>

          {/* Card Stack */}
          <div className="relative max-w-md mx-auto h-[600px]">
            {/* Next card (underneath) */}
            {nextCompanion && (
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  zIndex: 0,
                  transform: "scale(0.95) translateY(10px)",
                  opacity: 0.7,
                }}
              >
                <SwipeCard
                  companion={nextCompanion}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  onSuperLike={() => {}}
                />
              </div>
            )}

            {/* Current card (on top) */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                zIndex: 1,
                x,
                rotate,
                opacity: cardOpacity,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
            >
              <SwipeCard
                companion={currentCompanion}
                onSwipeLeft={() => handleSwipe("left")}
                onSwipeRight={() => handleSwipe("right")}
                onSuperLike={() => handleSwipe("up")}
              />
            </motion.div>

            {/* Swipe indicators */}
            <motion.div
              className="absolute top-20 left-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[-30deg] border-4 border-red-500"
              style={{
                opacity: nopeOpacity,
                scale: nopeScale,
              }}
            >
              NOPE
            </motion.div>

            <motion.div
              className="absolute top-20 right-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[30deg] border-4 border-green-500"
              style={{
                opacity: likeOpacity,
                scale: likeScale,
              }}
            >
              LIKE
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => handleSwipe("left")}
              disabled={isProcessing}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
              onClick={() => handleSwipe("up")}
              disabled={isProcessing}
            >
              <Star className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
              onClick={() => handleSwipe("right")}
              disabled={isProcessing}
            >
              <Heart className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-400"
              onClick={() => router.push('/chats')}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="max-w-md mx-auto mt-6">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / companions.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Matches: {matches.length}</span>
              <span>Remaining: {companions.length - currentIndex - 1}</span>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
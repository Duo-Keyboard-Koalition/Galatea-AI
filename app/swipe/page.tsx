"use client"

import { useState, useEffect } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Heart, X, Star, MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SwipeCard } from "@/components/swipe-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getAllCompanionsClient as getAllCompanions, type AICompanion } from "@/lib/companions"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SwipePage() {
  // Redirect to enhanced swipe page
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/swipe/enhanced')
  }, [router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="medium" text="Loading..." />
      </div>
    </ProtectedRoute>
  )
}

function SwipePageLegacy() {
  const [companions, setCompanions] = useState<AICompanion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<string[]>([])
  const [rejections, setRejections] = useState<string[]>([])
  const router = useRouter()

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
      const fetchedCompanions = await getAllCompanions()

      if (fetchedCompanions.length === 0) {
        // If no companions in database, create some default ones
        await createDefaultCompanions()
        const newCompanions = await getAllCompanions()
        setCompanions(newCompanions)
      } else {
        setCompanions(fetchedCompanions)
      }
    } catch (err) {
      setError("Failed to load companions")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultCompanions = async () => {
    // This would be called only if no companions exist
    // You can populate with default data or handle this differently
    console.log("No companions found in database")
  }

  const handleSwipe = (direction: "left" | "right" | "up") => {
    if (currentIndex >= companions.length) return

    const currentCompanion = companions[currentIndex]

    if (direction === "right" || direction === "up") {
      setMatches((prev) => [...prev, currentCompanion.id!])
    } else {
      setRejections((prev) => [...prev, currentCompanion.id!])
    }

    // Move to next companion
    if (currentIndex < companions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // All companions swiped, show results
      router.push("/matches")
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      handleSwipe("right")
    } else if (info.offset.x < -threshold) {
      handleSwipe("left")
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
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadCompanions} className="bg-teal-500 text-black hover:bg-teal-400">
              Try Again
            </Button>
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
              <p className="text-white mb-4">No companions available</p>
              <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentIndex >= companions.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">All done!</h2>
              <p className="text-gray-300 mb-8">You've seen all available companions.</p>
              <div className="space-y-4">
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400 w-full">
                  <Link href="/matches">View Your Matches ({matches.length})</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Return Home</Link>
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
              <Link href="/">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Discover</h1>
              <p className="text-sm text-gray-400">
                {currentIndex + 1} of {companions.length}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer */}
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
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
              onClick={() => handleSwipe("up")}
            >
              <Star className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
              onClick={() => handleSwipe("right")}
            >
              <Heart className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-400"
              onClick={() => {
                // Handle message action
                console.log("Message action")
              }}
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

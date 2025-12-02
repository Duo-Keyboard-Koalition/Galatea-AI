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

export default function DiscoverPage() {
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
    router.replace('/swipe/enhanced')
  }, [router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <LoadingSpinner size="medium" text="Loading..." />
      </div>
    </ProtectedRoute>
  )
}

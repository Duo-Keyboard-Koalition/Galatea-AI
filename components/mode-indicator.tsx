"use client"

import { isDemoMode } from '@/lib/app-config'
import { useAuth } from '@/contexts/simple-auth-context'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function ModeIndicator() {
  const { currentUser, demoUser } = useAuth()
  const [showGenderToggle, setShowGenderToggle] = useState(false)

  if (!isDemoMode()) {
    return null
  }

  const toggleGender = () => {
    const newGender = demoUser?.gender === 'male' ? 'female' : 'male'
    localStorage.setItem('demo_gender', newGender)
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-[#0a0a1a] border-2 neon-border rounded-lg p-4 shadow-lg z-50 backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00FFFF] rounded-full animate-pulse-glow" />
          <span className="font-semibold text-sm text-[#00FFFF] neon-glow">DEMO MODE</span>
        </div>

        {currentUser && (
          <div className="text-xs text-white/80">
            Logged in as: <span className="font-medium text-white">{currentUser.user_metadata?.full_name}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGenderToggle(!showGenderToggle)}
          className="text-xs border-[#00FFFF]/30 text-white hover:bg-[#00FFFF]/10"
        >
          {showGenderToggle ? 'Hide Options' : 'Show Options'}
        </Button>

        {showGenderToggle && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#00FFFF]/30">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleGender}
              className="text-xs bg-[#00FFFF]/10 text-white hover:bg-[#00FFFF]/20 border border-[#00FFFF]/30"
            >
              Switch to {demoUser?.gender === 'male' ? 'Jane Smith' : 'John Smith'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4 shadow-lg z-50">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
          <span className="font-semibold text-sm">DEMO MODE</span>
        </div>

        {currentUser && (
          <div className="text-xs text-gray-700 dark:text-gray-300">
            Logged in as: <span className="font-medium">{currentUser.user_metadata?.full_name}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGenderToggle(!showGenderToggle)}
          className="text-xs"
        >
          {showGenderToggle ? 'Hide Options' : 'Show Options'}
        </Button>

        {showGenderToggle && (
          <div className="flex flex-col gap-2 pt-2 border-t border-yellow-400">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleGender}
              className="text-xs"
            >
              Switch to {demoUser?.gender === 'male' ? 'Jane Smith' : 'John Smith'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

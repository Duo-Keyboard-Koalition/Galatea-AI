export type AppMode = 'supabase' | 'demo'

export const getAppMode = (): AppMode => {
  if (typeof window === 'undefined') {
    return 'supabase'
  }
  return (process.env.NEXT_PUBLIC_APP_MODE as AppMode) || 'supabase'
}

export const isSupabaseMode = () => getAppMode() === 'supabase'
export const isDemoMode = () => getAppMode() === 'demo'

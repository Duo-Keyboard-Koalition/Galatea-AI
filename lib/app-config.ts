export type AppMode = 'supabase' | 'demo'

export const getAppMode = (): AppMode => {
  const mode = (process.env.NEXT_PUBLIC_APP_MODE as AppMode) || 'supabase'
  return mode
}

export const isSupabaseMode = () => {
  if (typeof window === 'undefined') return true
  return getAppMode() === 'supabase'
}

export const isDemoMode = () => {
  if (typeof window === 'undefined') return false
  return getAppMode() === 'demo'
}

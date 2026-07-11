// Authentication state for the client. Holds the signed-in account, checks the
// session on load, and exposes login / signup / logout. The token itself lives
// only in an HTTP-only cookie the server sets — never touched here.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiLogin, apiLogout, apiMe, apiSignup } from '../api'

export interface Account {
  email: string
}

interface AuthValue {
  user: Account | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  // Resolve the current session once on load.
  useEffect(() => {
    let cancelled = false
    apiMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await apiLogin(email, password)),
      signup: async (email, password) => setUser(await apiSignup(email, password)),
      logout: async () => {
        await apiLogout().catch(() => {})
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

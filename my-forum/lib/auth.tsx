'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type User = { username: string }

type AuthCtx = {
  user: User | null
  login: (username: string, password: string) => Promise<string | null>
  register: (username: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: async () => null,
  register: async () => null,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('nexus_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  async function register(username: string, password: string): Promise<string | null> {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error
    const u = { username: data.username }
    setUser(u)
    localStorage.setItem('nexus_user', JSON.stringify(u))
    return null
  }

  async function login(username: string, password: string): Promise<string | null> {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error
    const u = { username: data.username }
    setUser(u)
    localStorage.setItem('nexus_user', JSON.stringify(u))
    return null
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nexus_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

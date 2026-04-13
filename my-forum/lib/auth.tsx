'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type User = {
  username: string
  createdAt: string
}

type AuthCtx = {
  user: User | null
  login: (username: string, password: string) => string | null
  register: (username: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => null,
  register: () => null,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('nexus_session')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  function getAccounts(): Record<string, { password: string; createdAt: string }> {
    const stored = localStorage.getItem('nexus_accounts')
    return stored ? JSON.parse(stored) : {}
  }

  function register(username: string, password: string): string | null {
    if (!username.trim() || !password.trim()) return 'Fill in all fields'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (password.length < 4) return 'Password must be at least 4 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers and _'
    const accounts = getAccounts()
    if (accounts[username.toLowerCase()]) return 'Username already taken'
    accounts[username.toLowerCase()] = { password, createdAt: new Date().toISOString() }
    localStorage.setItem('nexus_accounts', JSON.stringify(accounts))
    const newUser = { username, createdAt: new Date().toISOString() }
    setUser(newUser)
    localStorage.setItem('nexus_session', JSON.stringify(newUser))
    return null
  }

  function login(username: string, password: string): string | null {
    if (!username.trim() || !password.trim()) return 'Fill in all fields'
    const accounts = getAccounts()
    const account = accounts[username.toLowerCase()]
    if (!account) return 'Account not found'
    if (account.password !== password) return 'Wrong password'
    const loggedIn = { username, createdAt: account.createdAt }
    setUser(loggedIn)
    localStorage.setItem('nexus_session', JSON.stringify(loggedIn))
    return null
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('nexus_session')
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

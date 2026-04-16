'use client'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    const theme = localStorage.getItem('nexus_theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }, [user])

  return <>{children}</>
}

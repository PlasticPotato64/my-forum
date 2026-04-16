import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/lib/auth'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = { title: 'Nexus', description: 'Dark mode community forum' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Nav />
            <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
              <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '0 0 60px', width: '100%' }}>
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

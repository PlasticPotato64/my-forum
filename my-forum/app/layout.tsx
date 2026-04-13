import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'A dark mode community forum',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px 60px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}

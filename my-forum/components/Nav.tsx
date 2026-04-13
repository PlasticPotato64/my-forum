'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()
  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '0 20px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--accent2)',
          letterSpacing: '-0.5px',
        }}>
          THE FORUM
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/" style={{
            padding: '6px 14px',
            borderRadius: '6px',
            color: path === '/' ? 'var(--text)' : 'var(--text2)',
            background: path === '/' ? 'var(--bg3)' : 'transparent',
            fontSize: '13px',
            transition: 'all 0.15s',
          }}>
            threads
          </Link>
          <Link href="/forum/new" style={{
            padding: '6px 16px',
            borderRadius: '6px',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'opacity 0.15s',
          }}>
            + new post
          </Link>
        </div>
      </div>
    </nav>
  )
}

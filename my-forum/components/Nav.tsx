'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

export default function Nav() {
  const path = usePathname()
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

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
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--accent2)',
          letterSpacing: '-0.5px',
        }}>
          NEXUS
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/forum/new" style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                + new post
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {user.username} ▾
                </button>
                {showMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    minWidth: '140px',
                  }}>
                    <button
                      onClick={() => { logout(); setShowMenu(false) }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        color: 'var(--red)',
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding: '6px 14px',
                borderRadius: '6px',
                color: 'var(--text2)',
                fontSize: '13px',
              }}>
                log in
              </Link>
              <Link href="/auth/register" style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

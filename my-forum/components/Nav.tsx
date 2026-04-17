'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'
import Avatar from './Avatar'
import { formatPoints } from '@/lib/utils'

export default function Nav() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showGames, setShowGames] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [inboxCount, setInboxCount] = useState(0)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    if (!user) return
    fetch(`/api/profile?username=${user.username}`).then(r => r.ok ? r.json() : null).then(d => { if (d) { setAvatar(d.avatar || ''); setPoints(d.points || 0) } })
    fetch(`/api/friends?username=${user.username}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setInboxCount(d.incoming?.length || 0) })
  }, [user])

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent2)', letterSpacing: '-0.5px', marginRight: '8px' }}>NEXUS</Link>
          <Link href="/" style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', color: 'var(--text2)', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
            Forums
          </Link>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowGames(!showGames)} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', color: 'var(--text2)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              Games ▾
            </button>
            {showGames && (
              <div style={{ position: 'absolute', left: 0, top: '44px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                <Link href="/games/rng" onClick={() => setShowGames(false)} style={{ display: 'block', padding: '11px 16px', fontSize: '13px', color: 'var(--text2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  🎲 Title RNG
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/forum/new" style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 500 }}>+ new post</Link>
              <Link href="/inbox" style={{ position: 'relative', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📬
                {inboxCount > 0 && <span style={{ background: 'var(--red)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{inboxCount}</span>}
              </Link>
              {/* Points badge next to avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 10px 3px 3px', direction: 'rtl' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', direction: 'ltr', whiteSpace: 'nowrap' }}>{formatPoints(points)}</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>⭐</div>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                  <Avatar username={user.username} avatar={avatar} size={34} linkToProfile={false} />
                </button>
                {showMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '44px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>{user.username}</p>
                    </div>
                    {[
                      { href: `/profile/${user.username}`, label: 'My Profile' },
                      { href: '/friends', label: 'Friends' },
                      { href: '/inbox', label: `Inbox${inboxCount > 0 ? ` (${inboxCount})` : ''}` },
                      { href: '/rewards', label: 'Daily Rewards' },
                      { href: '/settings', label: 'Settings' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}
                        onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { logout(); setShowMenu(false) }} style={{ width: '100%', padding: '10px 16px', background: 'transparent', color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'left', cursor: 'pointer', border: 'none', borderTop: '1px solid var(--border)' }}>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ padding: '6px 14px', borderRadius: '6px', color: 'var(--text2)', fontSize: '13px' }}>log in</Link>
              <Link href="/auth/register" style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 500 }}>sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

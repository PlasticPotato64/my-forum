'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'
import Avatar from './Avatar'

export default function Nav() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [inboxCount, setInboxCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetch(`/api/profile?username=${user.username}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setAvatar(d.avatar || '') })
    fetch(`/api/friends?username=${user.username}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setInboxCount(d.incoming?.length || 0) })
  }, [user])

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent2)', letterSpacing: '-0.5px' }}>NEXUS</Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/forum/new" style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 500 }}>+ new post</Link>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', position: 'relative' }}>
                  <Avatar username={user.username} avatar={avatar} size={34} linkToProfile={false} />
                  {inboxCount > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--red)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                      {inboxCount}
                    </span>
                  )}
                </button>
                {showMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '44px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', minWidth: '170px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>{user.username}</p>
                    </div>
                    <Link href={`/profile/${user.username}`} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}
                      onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      my profile
                    </Link>
                    <Link href="/inbox" onClick={() => setShowMenu(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}
                      onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <span>inbox</span>
                      {inboxCount > 0 && <span style={{ background: 'var(--red)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{inboxCount}</span>}
                    </Link>
                    <button onClick={() => { logout(); setShowMenu(false) }} style={{ width: '100%', padding: '10px 16px', background: 'transparent', color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'left', cursor: 'pointer', border: 'none' }}>
                      log out
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

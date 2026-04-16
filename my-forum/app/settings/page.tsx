'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import PointsBadge from '@/components/PointsBadge'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState(0)
  const [newUsername, setNewUsername] = useState('')
  const [confirmChange, setConfirmChange] = useState(false)
  const [msg, setMsg] = useState('')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    setNewUsername(user.username)
    const t = localStorage.getItem('nexus_theme') || 'dark'
    setTheme(t)
    fetch(`/api/points?username=${user.username}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setPoints(d.points) })
  }, [user])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('nexus_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function changeUsername() {
    if (!user || !newUsername.trim()) return
    if (newUsername === user.username) { setMsg('That is already your username'); return }
    if (newUsername.length < 3 || newUsername.length > 16) { setMsg('Username must be 3-16 characters'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) { setMsg('Letters, numbers and _ only'); return }
    if (points < 50) { setMsg('You need 50 Points to change your username'); return }
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'changeUsername', username: user.username, newUsername: newUsername.toLowerCase() }) })
    const data = await res.json()
    if (res.ok) {
      setMsg('Username changed! Please log in again.')
      setTimeout(() => { logout(); router.push('/auth/login') }, 2000)
    } else setMsg(data.error)
    setConfirmChange(false)
  }

  if (!user) return null

  return (
    <div style={{ paddingTop: '40px', maxWidth: '520px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>Settings</h1>
        <PointsBadge points={points} />
      </div>

      {msg && <p style={{ color: msg.includes('changed') ? 'var(--green)' : 'var(--red)', fontSize: '13px', marginBottom: '16px', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}>{msg}</p>}

      {/* Theme */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Appearance</h2>
        <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '16px' }}>Currently: {theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}</p>
        <button onClick={toggleTheme} style={{ padding: '9px 20px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
          Switch to {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Change username */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Change Username</h2>
        <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '16px' }}>Costs 50 Points. Max 16 characters.</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input value={newUsername} onChange={e => setNewUsername(e.target.value)} maxLength={16} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 14px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          <button onClick={() => setConfirmChange(true)} disabled={newUsername === user.username} style={{ padding: '9px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer', opacity: newUsername === user.username ? 0.5 : 1 }}>
            Change (50 Points)
          </button>
        </div>
        {confirmChange && (
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--amber)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ color: 'var(--amber)', fontSize: '13px' }}>⚠️ Are you sure you want to change your username to <strong>{newUsername}</strong>? This costs 50 Points and will log you out.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={changeUsername} style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Yes, change it</button>
              <button onClick={() => setConfirmChange(false)} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = login(username, password)
    if (err) { setError(err); return }
    router.push('/')
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '14px',
  }

  return (
    <div style={{ paddingTop: '80px', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 800,
        marginBottom: '8px',
        letterSpacing: '-0.5px',
      }}>
        Welcome back
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '32px' }}>
        Don't have an account? <Link href="/auth/register" style={{ color: 'var(--accent2)' }}>Sign up</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            style={inputStyle}
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            autoComplete="username"
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            autoComplete="current-password"
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>}
          <button type="submit" style={{
            padding: '12px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
            border: 'none',
            cursor: 'pointer',
          }}>
            log in →
          </button>
        </div>
      </form>
    </div>
  )
}

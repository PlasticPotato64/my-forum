'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await register(username, password)
    if (err) { setError(err); setLoading(false); return }
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
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Join Nexus
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '32px' }}>
        Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent2)' }}>Log in</Link>
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input style={inputStyle} placeholder="username" value={username} onChange={e => setUsername(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginTop: '6px' }}>Letters, numbers and _ only. Min 3 characters.</p>
          </div>
          <div>
            <input style={inputStyle} type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginTop: '6px' }}>Min 4 characters. No email needed.</p>
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            padding: '12px', background: loading ? 'var(--bg3)' : 'var(--accent)', color: loading ? 'var(--text2)' : 'white',
            borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-mono)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'creating account...' : 'create account →'}
          </button>
        </div>
      </form>
    </div>
  )
}

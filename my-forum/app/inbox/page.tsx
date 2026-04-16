'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export default function InboxPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [incoming, setIncoming] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    load()
  }, [user])

  async function load() {
    if (!user) return
    const res = await fetch(`/api/friends?username=${user.username}`)
    if (res.ok) { const d = await res.json(); setIncoming(d.incoming || []) }
    setLoading(false)
  }

  async function respond(requestId: string, action: 'accept' | 'decline') {
    await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, requestId }) })
    load()
  }

  if (!user) return null

  return (
    <div style={{ paddingTop: '40px', maxWidth: '520px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Inbox</h1>
      <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '28px' }}>Pending friend requests</p>

      {loading ? (
        <p style={{ color: 'var(--text3)' }}>loading...</p>
      ) : incoming.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '13px' }}>
          No pending friend requests
        </div>
      ) : incoming.map(req => (
        <div key={req.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar username={req.from_user} size={38} />
            <div>
              <Link href={`/profile/${req.from_user}`} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{req.from_user}</Link>
              <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '2px' }}>sent {timeAgo(req.created_at)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => respond(req.id, 'accept')} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 600 }}>Accept</button>
            <button onClick={() => respond(req.id, 'decline')} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  )
}

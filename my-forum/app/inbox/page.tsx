'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

type Request = { id: string; from_user: string; to_user: string; created_at: string }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function InboxPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [incoming, setIncoming] = useState<Request[]>([])
  const [friends, setFriends] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    load()
  }, [user])

  async function load() {
    if (!user) return
    const res = await fetch(`/api/friends?username=${user.username}`)
    const data = await res.json()
    setIncoming(data.incoming || [])
    setFriends(data.friends || [])
    setLoading(false)
  }

  async function respond(requestId: string, action: 'accept' | 'decline') {
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, requestId }),
    })
    load()
  }

  async function removeFriend(friendName: string) {
    if (!user) return
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', from: user.username, to: friendName }),
    })
    load()
  }

  if (!user) return null

  return (
    <div style={{ paddingTop: '40px', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '32px' }}>
        Inbox
      </h1>

      {/* Friend requests */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text2)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Friend Requests
          {incoming.length > 0 && <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '1px 8px', fontSize: '11px' }}>{incoming.length}</span>}
        </h2>
        {incoming.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '13px' }}>
            No pending requests
          </div>
        ) : incoming.map(req => (
          <div key={req.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar username={req.from_user} size={36} />
              <div>
                <Link href={`/profile/${req.from_user}`} style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 500 }}>{req.from_user}</Link>
                <p style={{ color: 'var(--text3)', fontSize: '11px' }}>{timeAgo(req.created_at)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => respond(req.id, 'accept')} style={{ padding: '6px 14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                accept
              </button>
              <button onClick={() => respond(req.id, 'decline')} style={{ padding: '6px 14px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Friends list */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text2)', marginBottom: '16px' }}>
          Friends · {friends.length}
        </h2>
        {friends.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '13px' }}>
            No friends yet — visit someone's profile to add them!
          </div>
        ) : friends.map(name => (
          <div key={name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href={`/profile/${name}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar username={name} size={32} />
              <span style={{ color: 'var(--text)', fontSize: '14px' }}>{name}</span>
            </Link>
            <button onClick={() => removeFriend(name)} style={{ padding: '4px 10px', background: 'transparent', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

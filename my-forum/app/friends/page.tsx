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

export default function FriendsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [friends, setFriends] = useState<string[]>([])
  const [dmUser, setDmUser] = useState<string|null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [dmBody, setDmBody] = useState('')
  const [dmMsg, setDmMsg] = useState('')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    load()
  }, [user])

  async function load() {
    if (!user) return
    const res = await fetch(`/api/friends?username=${user.username}`)
    if (res.ok) { const d = await res.json(); setFriends(d.friends || []) }
  }

  async function openDm(friend: string) {
    setDmUser(friend)
    loadDms(friend)
  }

  async function loadDms(friend: string) {
    if (!user) return
    const res = await fetch(`/api/dms?user=${user.username}&other=${friend}`)
    if (res.ok) setMessages(await res.json())
  }

  async function sendDm(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !dmUser || !dmBody.trim()) return
    const res = await fetch('/api/dms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: user.username, to: dmUser, body: dmBody.trim() }) })
    const data = await res.json()
    if (res.ok) { setDmBody(''); loadDms(dmUser) }
    else setDmMsg(data.error)
    setTimeout(() => setDmMsg(''), 3000)
  }

  async function removeFriend(name: string) {
    if (!user || !confirm(`Remove ${name} as a friend?`)) return
    await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove', from: user.username, to: name }) })
    if (dmUser === name) setDmUser(null)
    load()
  }

  if (!user) return null

  return (
    <div style={{ paddingTop: '40px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '24px' }}>Friends</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Friends list */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          {friends.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '13px' }}>
              No friends yet.<br />Visit someone's profile to add them!
            </div>
          ) : friends.map(name => (
            <div key={name} style={{ background: dmUser === name ? 'var(--bg3)' : 'var(--bg2)', border: `1px solid ${dmUser === name ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => openDm(name)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar username={name} size={30} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); removeFriend(name) }} style={{ padding: '3px 8px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                remove
              </button>
            </div>
          ))}
        </div>

        {/* DM panel */}
        {dmUser ? (
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar username={dmUser} size={28} />
                <Link href={`/profile/${dmUser}`} style={{ fontWeight: 600, fontSize: '14px' }}>{dmUser}</Link>
                <span style={{ color: 'var(--text3)', fontSize: '11px', marginLeft: 'auto' }}>Messages auto-delete after 3 days</span>
              </div>
              <div style={{ height: '360px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '13px', marginTop: '40px' }}>No messages yet. Say hi!</p>
                ) : messages.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from_user === user.username ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', background: m.from_user === user.username ? 'var(--accent)' : 'var(--bg3)', color: m.from_user === user.username ? 'white' : 'var(--text)', padding: '9px 14px', borderRadius: m.from_user === user.username ? '12px 12px 4px 12px' : '12px 12px 12px 4px', fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {m.body}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '3px' }}>{timeAgo(m.created_at)}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={sendDm} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input value={dmBody} onChange={e => setDmBody(e.target.value)} placeholder="Message..." maxLength={5000} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                  onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <button type="submit" style={{ padding: '9px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Send</button>
              </form>
              {dmMsg && <p style={{ padding: '8px 12px', color: 'var(--red)', fontSize: '12px' }}>{dmMsg}</p>}
            </div>
          </div>
        ) : friends.length > 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
            Select a friend to message
          </div>
        )}
      </div>
    </div>
  )
}

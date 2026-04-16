'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'
import PointsBadge from '@/components/PointsBadge'
import { categoryColor, timeAgo, formatPoints } from '@/lib/utils'

type Post = { id: string; title: string; body: string; category: string; createdAt: string; replies: any[] }
type Profile = { username: string; avatar: string; bio: string; createdAt: string; posts: Post[]; equippedTitle: { name: string; color: string } | null }

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [friendStatus, setFriendStatus] = useState<'none'|'pending'|'friends'|'incoming'>('none')
  const [tradeAmount, setTradeAmount] = useState('10')
  const [tradeMsg, setTradeMsg] = useState('')

  const isOwn = user?.username === params.username

  async function loadAll() {
    const res = await fetch(`/api/profile?username=${params.username}`)
    if (res.ok) { const d = await res.json(); setProfile(d); setBio(d.bio || '') }
    setLoading(false)
    if (user && !isOwn) {
      const fr = await fetch(`/api/friends?username=${user.username}`)
      if (fr.ok) {
        const d = await fr.json()
        if (d.friends.includes(params.username)) setFriendStatus('friends')
        else if (d.sent?.some((r: any) => r.to_user === params.username)) setFriendStatus('pending')
        else if (d.incoming?.some((r: any) => r.from_user === params.username)) setFriendStatus('incoming')
        else setFriendStatus('none')
      }
    }
  }

  useEffect(() => { loadAll() }, [params.username, user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 500000) { alert('Image too large — use an image under 500KB'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: profile.username, avatar: reader.result, bio: profile.bio }) })
      loadAll()
    }
    reader.readAsDataURL(file)
  }

  async function saveBio() {
    if (!profile) return
    setSaving(true)
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: profile.username, avatar: profile.avatar, bio }) })
    setSaving(false); setEditing(false); loadAll()
  }

  async function sendFriendRequest() {
    if (!user) return
    const res = await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', from: user.username, to: params.username }) })
    const data = await res.json()
    if (res.ok) setFriendStatus('pending')
    else alert(data.error)
  }

  async function tradePoints() {
    if (!user) return
    const amt = parseInt(tradeAmount)
    if (isNaN(amt) || amt < 10) { setTradeMsg('Minimum 10 Points'); return }
    const res = await fetch('/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'trade', username: user.username, toUser: params.username, amount: amt }) })
    const data = await res.json()
    if (res.ok) { setTradeMsg(`Sent ${formatPoints(amt)} Points!`); setTradeAmount('10'); loadAll() }
    else setTradeMsg(data.error)
    setTimeout(() => setTradeMsg(''), 3000)
  }

  if (loading) return <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text3)' }}>loading...</div>
  if (!profile) return <div style={{ paddingTop: '80px', textAlign: 'center' }}><p style={{ color: 'var(--text2)', marginBottom: '16px' }}>User not found.</p><Link href="/" style={{ color: 'var(--accent2)' }}>← back</Link></div>

  return (
    <div style={{ paddingTop: '40px' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Avatar username={profile.username} avatar={profile.avatar} size={80} linkToProfile={false} />
            {isOwn && <>
              <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg2)', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Username + title + points badge on right */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {profile.equippedTitle && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${profile.equippedTitle.color}20`, color: profile.equippedTitle.color, border: `1px solid ${profile.equippedTitle.color}40`, fontFamily: 'var(--font-mono)' }}>
                    {profile.equippedTitle.name}
                  </span>
                )}
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>{profile.username}</h1>
                {profile.username === 'admin' && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#7c6af720', color: '#7c6af7', border: '1px solid #7c6af740' }}>admin</span>}
              </div>
            </div>
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '10px' }}>joined {timeAgo(profile.createdAt)} · {profile.posts.length} posts</p>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={160} placeholder="Short bio..." style={{ background: 'var(--bg3)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', fontSize: '13px', resize: 'none', height: '72px', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={saveBio} disabled={saving} style={{ padding: '6px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>{saving ? 'saving...' : 'save'}</button>
                  <button onClick={() => setEditing(false)} style={{ padding: '6px 14px', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <p style={{ color: profile.bio ? 'var(--text)' : 'var(--text3)', fontSize: '14px' }}>{profile.bio || (isOwn ? 'No bio — click edit' : 'No bio yet.')}</p>
                {isOwn && <button onClick={() => setEditing(true)} style={{ padding: '3px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', flexShrink: 0 }}>edit</button>}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {isOwn && (
                <>
                  <Link href="/rewards" style={{ padding: '7px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '12px' }}>⭐ Daily Rewards</Link>
                  <Link href="/games/rng" style={{ padding: '7px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '12px' }}>🎲 Title RNG</Link>
                </>
              )}
              {!isOwn && user && (
                <>
                  {friendStatus === 'none' && <button onClick={sendFriendRequest} style={{ padding: '7px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>+ Add Friend</button>}
                  {friendStatus === 'pending' && <span style={{ padding: '7px 14px', background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}>Request sent</span>}
                  {friendStatus === 'friends' && <span style={{ padding: '7px 14px', background: 'var(--bg3)', color: 'var(--green)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}>✓ Friends</span>}
                  {friendStatus === 'incoming' && <Link href="/inbox" style={{ padding: '7px 14px', background: 'var(--green)', color: 'white', borderRadius: '6px', fontSize: '12px' }}>Accept request →</Link>}
                  {/* Send points */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="number" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} min="10" style={{ width: '72px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font-mono)' }} />
                    <button onClick={tradePoints} style={{ padding: '7px 14px', background: '#ffb3b3', color: '#c0392b', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 600 }}>Send Points</button>
                  </div>
                  {tradeMsg && <span style={{ fontSize: '12px', color: tradeMsg.includes('Sent') ? 'var(--green)' : 'var(--red)' }}>{tradeMsg}</span>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text2)' }}>Posts by {profile.username}</h2>
      {profile.posts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '10px' }}>No posts yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {profile.posts.map(post => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <div style={{ padding: '18px 22px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'all 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border2)'; el.style.background='var(--bg3)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border)'; el.style.background='var(--bg2)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${categoryColor(post.category)}20`, color: categoryColor(post.category), border: `1px solid ${categoryColor(post.category)}40` }}>{post.category}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{timeAgo(post.createdAt)}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{post.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</p>
                <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '6px' }}>{post.replies.length} replies</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

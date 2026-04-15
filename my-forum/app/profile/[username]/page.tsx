'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'
import { useRef } from 'react'

type Post = { id: string; title: string; body: string; category: string; createdAt: string; replies: any[] }
type Profile = { username: string; avatar: string; bio: string; createdAt: string; posts: Post[] }

function categoryColor(cat: string) {
  const colors = ['#7c6af7','#4ade80','#fbbf24','#f472b6','#60a5fa','#f87171','#34d399','#a78bfa','#fb923c','#38bdf8']
  let hash = 0
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

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
  const [points, setPoints] = useState(0)
  const [canClaim, setCanClaim] = useState(false)
  const [nextClaim, setNextClaim] = useState<string|null>(null)
  const [claimMsg, setClaimMsg] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeMsg, setTradeMsg] = useState('')
  const [myPoints, setMyPoints] = useState(0)

  const isOwn = user?.username === params.username

  async function loadProfile() {
    const res = await fetch(`/api/profile?username=${params.username}`)
    if (res.ok) { const d = await res.json(); setProfile(d); setBio(d.bio || '') }
    setLoading(false)
  }

  async function loadPoints() {
    const res = await fetch(`/api/points?username=${params.username}`)
    if (res.ok) { const d = await res.json(); setPoints(d.points); setCanClaim(d.canClaim); setNextClaim(d.nextClaim) }
    if (user && !isOwn) {
      const res2 = await fetch(`/api/points?username=${user.username}`)
      if (res2.ok) { const d = await res2.json(); setMyPoints(d.points) }
    }
  }

  async function loadFriendStatus() {
    if (!user || isOwn) return
    const res = await fetch(`/api/friends?username=${user.username}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.friends.includes(params.username)) { setFriendStatus('friends'); return }
    if (data.sent.some((r: any) => r.to_user === params.username)) { setFriendStatus('pending'); return }
    if (data.incoming.some((r: any) => r.from_user === params.username)) { setFriendStatus('incoming'); return }
    setFriendStatus('none')
  }

  useEffect(() => { loadProfile(); loadPoints(); loadFriendStatus() }, [params.username, user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 500000) { alert('Image too large — use an image under 500KB'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: profile.username, avatar: reader.result, bio: profile.bio }) })
      loadProfile()
    }
    reader.readAsDataURL(file)
  }

  async function saveBio() {
    if (!profile) return
    setSaving(true)
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: profile.username, avatar: profile.avatar, bio }) })
    setSaving(false); setEditing(false); loadProfile()
  }

  async function sendFriendRequest() {
    if (!user) return
    const res = await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', from: user.username, to: params.username }) })
    const data = await res.json()
    if (res.ok) setFriendStatus('pending')
    else alert(data.error)
  }

  async function claimPoints() {
    if (!user) return
    const res = await fetch('/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'claim', username: user.username }) })
    const data = await res.json()
    if (res.ok) { setClaimMsg('+10 points claimed!'); loadPoints(); setTimeout(() => setClaimMsg(''), 3000) }
    else setClaimMsg(data.error)
  }

  async function tradePoints() {
    if (!user || !tradeAmount) return
    const amt = parseInt(tradeAmount)
    if (isNaN(amt) || amt < 1) { setTradeMsg('Enter a valid amount'); return }
    const res = await fetch('/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'trade', username: user.username, toUser: params.username, amount: amt }) })
    const data = await res.json()
    if (res.ok) { setTradeMsg(`Sent ${amt} points!`); setTradeAmount(''); loadPoints(); setTimeout(() => setTradeMsg(''), 3000) }
    else setTradeMsg(data.error)
  }

  if (loading) return <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text3)' }}>loading...</div>
  if (!profile) return <div style={{ paddingTop: '80px', textAlign: 'center' }}><p style={{ color: 'var(--text2)', marginBottom: '16px' }}>User not found.</p><Link href="/" style={{ color: 'var(--accent2)' }}>← back</Link></div>

  return (
    <div style={{ paddingTop: '40px' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Avatar username={profile.username} avatar={profile.avatar} size={80} linkToProfile={false} />
            {isOwn && <>
              <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg2)', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>{profile.username}</h1>
              {profile.username === 'admin' && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#7c6af720', color: '#7c6af7', border: '1px solid #7c6af740' }}>admin</span>}
              <span style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: 500 }}>⭐ {points} pts</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ color: profile.bio ? 'var(--text)' : 'var(--text3)', fontSize: '14px' }}>{profile.bio || (isOwn ? 'No bio — click edit' : 'No bio yet.')}</p>
                {isOwn && <button onClick={() => setEditing(true)} style={{ padding: '3px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', flexShrink: 0 }}>edit</button>}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {isOwn && (
                <>
                  <button onClick={claimPoints} disabled={!canClaim} style={{ padding: '7px 16px', background: canClaim ? 'var(--amber)' : 'var(--bg3)', color: canClaim ? 'var(--bg)' : 'var(--text3)', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: canClaim ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                    {canClaim ? '⭐ claim 10 pts' : `⭐ claim in ${nextClaim ? Math.max(0, Math.ceil((new Date(nextClaim).getTime() - Date.now()) / 3600000)) + 'h' : '24h'}`}
                  </button>
                  {claimMsg && <span style={{ color: 'var(--green)', fontSize: '12px' }}>{claimMsg}</span>}
                  <Link href="/inbox" style={{ padding: '7px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '12px' }}>📬 inbox</Link>
                </>
              )}
              {!isOwn && user && (
                <>
                  {friendStatus === 'none' && <button onClick={sendFriendRequest} style={{ padding: '7px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>+ add friend</button>}
                  {friendStatus === 'pending' && <span style={{ padding: '7px 16px', background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}>request sent</span>}
                  {friendStatus === 'friends' && <span style={{ padding: '7px 16px', background: 'var(--bg3)', color: 'var(--green)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}>✓ friends</span>}
                  {friendStatus === 'incoming' && <Link href="/inbox" style={{ padding: '7px 16px', background: 'var(--green)', color: 'white', borderRadius: '6px', fontSize: '12px' }}>accept request →</Link>}
                </>
              )}
            </div>

            {/* Trade points */}
            {!isOwn && user && friendStatus === 'friends' && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>send points (you have {myPoints}):</span>
                <input type="number" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} placeholder="amount" min="1" style={{ width: '80px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font-mono)' }} />
                <button onClick={tradePoints} style={{ padding: '5px 14px', background: 'var(--amber)', color: 'var(--bg)', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 600 }}>send ⭐</button>
                {tradeMsg && <span style={{ fontSize: '12px', color: tradeMsg.includes('Sent') ? 'var(--green)' : 'var(--red)' }}>{tradeMsg}</span>}
              </div>
            )}
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

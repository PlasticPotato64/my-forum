'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'

type Post = { id: string; title: string; body: string; category: string; createdAt: string; replies: any[] }
type Profile = { username: string; avatar: string; bio: string; createdAt: string; posts: Post[] }

function categoryColor(cat: string): string {
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isOwn = user?.username === params.username

  async function loadProfile() {
    const res = await fetch(`/api/profile?username=${params.username}`)
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      setBio(data.bio || '')
    }
    setLoading(false)
  }

  useEffect(() => { loadProfile() }, [params.username])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 500000) { alert('Image too large — please use an image under 500KB'); return }
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.username, avatar: base64, bio: profile.bio }),
      })
      loadProfile()
    }
    reader.readAsDataURL(file)
  }

  async function saveBio() {
    if (!profile) return
    setSaving(true)
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: profile.username, avatar: profile.avatar, bio }),
    })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
    loadProfile()
  }

  if (loading) return <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text3)' }}>loading...</div>
  if (!profile) return (
    <div style={{ paddingTop: '80px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text2)', marginBottom: '16px' }}>User not found.</p>
      <Link href="/" style={{ color: 'var(--accent2)' }}>← back home</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: '40px' }}>
      {/* Profile header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <Avatar username={profile.username} avatar={profile.avatar} size={80} linkToProfile={false} />
            {isOwn && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'var(--accent)', border: '2px solid var(--bg2)',
                    color: 'white', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Change avatar"
                >
                  +
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {profile.username}
              {profile.username === 'admin' && (
                <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#7c6af720', color: '#7c6af7', border: '1px solid #7c6af740', fontFamily: 'var(--font-mono)' }}>
                  admin
                </span>
              )}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '12px' }}>
              joined {timeAgo(profile.createdAt)} · {profile.posts.length} {profile.posts.length === 1 ? 'post' : 'posts'}
            </p>

            {/* Bio */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write a short bio..."
                  maxLength={160}
                  style={{
                    background: 'var(--bg3)', border: '1px solid var(--accent)', borderRadius: '8px',
                    padding: '10px 14px', color: 'var(--text)', fontSize: '13px', resize: 'none',
                    height: '80px', fontFamily: 'var(--font-mono)', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={saveBio} disabled={saving} style={{ padding: '6px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                    {saving ? 'saving...' : 'save'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ padding: '6px 16px', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                    cancel
                  </button>
                  {saved && <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓ saved!</span>}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ color: profile.bio ? 'var(--text)' : 'var(--text3)', fontSize: '14px', lineHeight: 1.6 }}>
                  {profile.bio || (isOwn ? 'No bio yet — click edit to add one' : 'No bio yet.')}
                </p>
                {isOwn && (
                  <button onClick={() => setEditing(true)} style={{ padding: '4px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', flexShrink: 0 }}>
                    edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text2)' }}>
        Posts by {profile.username}
      </h2>

      {profile.posts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
          No posts yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {profile.posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <div style={{ padding: '18px 22px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'all 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border2)'; el.style.background='var(--bg3)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border)'; el.style.background='var(--bg2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${categoryColor(post.category)}20`, color: categoryColor(post.category), border: `1px solid ${categoryColor(post.category)}40` }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{timeAgo(post.createdAt)}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{post.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</p>
                <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '8px' }}>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
 

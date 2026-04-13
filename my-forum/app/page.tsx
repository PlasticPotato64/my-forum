'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'

type Post = {
  id: string; title: string; body: string; author: string; authorAvatar: string
  category: string; createdAt: string; replies: any[]
}

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

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPosts() {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  async function deletePost(id: string) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    loadPosts()
  }

  return (
    <div>
      <div style={{ padding: '48px 0 36px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '12px' }}>
          Community<br /><span style={{ color: 'var(--accent2)' }}>Threads</span>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{posts.length} threads · join the conversation</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text3)', textAlign: 'center', paddingTop: '40px' }}>loading threads...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <p style={{ marginBottom: '16px' }}>No threads yet.</p>
          <Link href="/forum/new" style={{ color: 'var(--accent2)' }}>Be the first to post →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {posts.map((post, i) => (
            <div key={post.id} style={{ position: 'relative' }}>
              <Link href={`/forum/${post.id}`}>
                <div style={{ padding: '20px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'all 0.15s', cursor: 'pointer', animation: 'fadeUp 0.3s ease both', animationDelay: `${i * 0.05}s` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border2)'; el.style.background='var(--bg3)'; el.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border)'; el.style.background='var(--bg2)'; el.style.transform='translateY(0)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${categoryColor(post.category)}20`, color: categoryColor(post.category), border: `1px solid ${categoryColor(post.category)}40`, fontWeight: 500 }}>
                          {post.category}
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.3 }}>{post.title}</h2>
                      <p style={{ color: 'var(--text2)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', color: post.replies.length > 0 ? 'var(--accent2)' : 'var(--text3)', fontWeight: 500, marginBottom: '4px' }}>
                        {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{timeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar username={post.author} avatar={post.authorAvatar} size={20} />
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      <span style={{ color: 'var(--text2)' }}>{post.author}</span>
                    </span>
                  </div>
                </div>
              </Link>
              {user?.username === 'admin' && (
                <button onClick={() => deletePost(post.id)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', zIndex: 10 }}>
                  delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

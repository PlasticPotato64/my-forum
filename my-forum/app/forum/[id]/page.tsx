'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'

type Reply = { id: string; body: string; author: string; authorAvatar: string; createdAt: string }
type Post = { id: string; title: string; body: string; author: string; authorAvatar: string; category: string; createdAt: string; replies: Reply[] }

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

export default function ThreadPage() {
  const params = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function loadPost() {
    const res = await fetch('/api/posts')
    const posts: Post[] = await res.json()
    setPost(posts.find(p => p.id === params.id) || null)
  }

  useEffect(() => { loadPost() }, [params.id])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || !user || !post) return
    setReplyError('')
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody.trim(), author: user.username }),
    })
    const data = await res.json()
    if (!res.ok) { setReplyError(data.error); return }
    setReplyBody('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
    loadPost()
  }

  async function deletePost() {
    if (!post || !confirm('Delete this post?')) return
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    router.push('/')
  }

  async function deleteReply(replyId: string) {
    if (!post) return
    await fetch(`/api/posts/${post.id}/replies/${replyId}`, { method: 'DELETE' })
    loadPost()
  }

  async function clearAllReplies() {
    if (!post || !confirm(`Delete all ${post.replies.length} replies?`)) return
    await fetch(`/api/posts/${post.id}/replies`, { method: 'DELETE' })
    loadPost()
  }

  if (!post) return <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text3)' }}>loading...</div>

  const inputStyle = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', transition: 'border-color 0.15s' }
  const isAdmin = user?.username === 'admin'

  return (
    <div style={{ paddingTop: '32px' }}>
      <Link href="/" style={{ color: 'var(--text3)', fontSize: '13px', display: 'inline-flex', gap: '6px', marginBottom: '28px' }}
        onMouseEnter={e => (e.currentTarget.style.color='var(--text2)')} onMouseLeave={e => (e.currentTarget.style.color='var(--text3)')}>
        ← all threads
      </Link>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', marginBottom: '24px', position: 'relative' }}>
        {isAdmin && (
          <button onClick={deletePost} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            delete post
          </button>
        )}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${categoryColor(post.category)}20`, color: categoryColor(post.category), border: `1px solid ${categoryColor(post.category)}40`, fontWeight: 500 }}>
            {post.category}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: '16px' }}>{post.title}</h1>
        <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{post.body}</p>
        <div style={{ fontSize: '12px', color: 'var(--text3)', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar username={post.author} avatar={post.authorAvatar} size={22} />
          <span style={{ color: 'var(--accent2)' }}>{post.author}</span>
          <span>· {timeAgo(post.createdAt)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text2)' }}>
            {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
          </h2>
          {isAdmin && post.replies.length > 0 && (
            <button onClick={clearAllReplies} style={{ background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              clear all replies
            </button>
          )}
        </div>
        {post.replies.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: '10px' }}>
            no replies yet — be the first
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {post.replies.map(reply => (
            <div key={reply.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '10px', padding: '20px 24px', position: 'relative' }}>
              {isAdmin && (
                <button onClick={() => deleteReply(reply.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                  delete
                </button>
              )}
              <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '14px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{reply.body}</p>
              <div style={{ fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar username={reply.author} avatar={reply.authorAvatar} size={18} />
                <span style={{ color: 'var(--accent2)' }}>{reply.author}</span>
                <span>· {timeAgo(reply.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Avatar username={user.username} size={28} linkToProfile={false} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>
                Reply as <span style={{ color: 'var(--accent2)' }}>{user.username}</span>
              </h3>
            </div>
            <form onSubmit={handleReply}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', lineHeight: 1.7 }}
                    placeholder="write your reply... (max 500 chars)"
                    value={replyBody}
                    onChange={e => { setReplyBody(e.target.value); setReplyError('') }}
                    onFocus={e => e.target.style.borderColor='var(--accent)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                    maxLength={500}
                    required />
                  <span style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '11px', color: replyBody.length > 450 ? 'var(--amber)' : 'var(--text3)' }}>
                    {replyBody.length}/500
                  </span>
                </div>
                {replyError && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{replyError}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button type="submit" style={{ padding: '10px 22px', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', border: 'none', cursor: 'pointer' }}>post reply →</button>
                  {submitted && <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓ reply posted!</span>}
                </div>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '16px' }}>Log in to leave a reply</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link href="/auth/login" style={{ padding: '8px 20px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', fontSize: '13px' }}>log in</Link>
              <Link href="/auth/register" style={{ padding: '8px 20px', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontSize: '13px' }}>sign up</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

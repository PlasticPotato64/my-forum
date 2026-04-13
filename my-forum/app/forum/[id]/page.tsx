'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getPosts, savePosts, categoryColor, timeAgo, type Post } from '@/lib/posts'
import { useAuth } from '@/lib/auth'

export default function ThreadPage() {
  const params = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const posts = getPosts()
    const found = posts.find(p => p.id === params.id)
    setPost(found || null)
  }, [params.id])

  if (!post) {
    return (
      <div style={{ paddingTop: '80px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text2)', marginBottom: '16px' }}>Thread not found.</p>
        <Link href="/" style={{ color: 'var(--accent2)' }}>← back to threads</Link>
      </div>
    )
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || !user || !post) return

    const posts = getPosts()
    const found = posts.find(p => p.id === post.id)
    if (!found) return

    found.replies.push({
      id: String(Date.now()),
      body: replyBody.trim(),
      author: user.username,
      createdAt: new Date().toISOString(),
    })
    savePosts(posts)
    setPost({ ...found })
    setReplyBody('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '14px',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ paddingTop: '32px' }}>
      <Link href="/" style={{
        color: 'var(--text3)',
        fontSize: '13px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '28px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>
        ← all threads
      </Link>

      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '24px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: `${categoryColor(post.category)}20`,
            color: categoryColor(post.category),
            border: `1px solid ${categoryColor(post.category)}40`,
            fontWeight: 500,
          }}>
            {post.category}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '16px',
        }}>
          {post.title}
        </h1>

        <p style={{
          color: 'var(--text)',
          lineHeight: 1.8,
          fontSize: '14px',
          marginBottom: '20px',
          whiteSpace: 'pre-wrap',
        }}>
          {post.body}
        </p>

        <div style={{ fontSize: '12px', color: 'var(--text3)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          posted by <span style={{ color: 'var(--accent2)' }}>{post.author}</span> · {timeAgo(post.createdAt)}
        </div>
      </div>

      {/* Replies */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text2)',
          marginBottom: '16px',
        }}>
          {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
        </h2>

        {post.replies.length === 0 && (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: 'var(--text3)',
            fontSize: '13px',
            border: '1px dashed var(--border)',
            borderRadius: '10px',
          }}>
            no replies yet — be the first
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {post.replies.map((reply) => (
            <div key={reply.id} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: '10px',
              padding: '20px 24px',
            }}>
              <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '14px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                {reply.body}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent2)' }}>{reply.author}</span> · {timeAgo(reply.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply form */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        {user ? (
          <>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '6px',
            }}>
              Reply as <span style={{ color: 'var(--accent2)' }}>{user.username}</span>
            </h3>
            <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '16px' }}>Share your thoughts</p>
            <form onSubmit={handleReply}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', lineHeight: 1.7 }}
                  placeholder="write your reply..."
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button type="submit" style={{
                    padding: '10px 22px',
                    background: 'var(--accent)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    post reply →
                  </button>
                  {submitted && <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓ reply posted!</span>}
                </div>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '16px' }}>
              Log in to leave a reply
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link href="/auth/login" style={{
                padding: '8px 20px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '8px',
                fontSize: '13px',
              }}>log in</Link>
              <Link href="/auth/register" style={{
                padding: '8px 20px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '13px',
              }}>sign up</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

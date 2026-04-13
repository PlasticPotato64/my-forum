'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPost, CATEGORY_COLORS, timeAgo } from '@/lib/posts'

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const post = getPost(params.id as string)

  const [replyBody, setReplyBody] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('')
  const [submitted, setSubmitted] = useState(false)

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
    if (!replyBody.trim() || !replyAuthor.trim() || !post) return

    post.replies.push({
      id: String(Date.now()),
      body: replyBody.trim(),
      author: replyAuthor.trim(),
      createdAt: new Date().toISOString(),
    })

    setReplyBody('')
    setReplyAuthor('')
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
      {/* Back */}
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

      {/* Post */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: `${CATEGORY_COLORS[post.category]}20`,
            color: CATEGORY_COLORS[post.category],
            border: `1px solid ${CATEGORY_COLORS[post.category]}40`,
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
          posted by <span style={{ color: 'var(--text2)' }}>{post.author}</span> · {timeAgo(post.createdAt)}
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
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
          {post.replies.map((reply, i) => (
            <div key={reply.id} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px 24px',
              borderLeft: '3px solid var(--accent)',
              animation: 'fadeUp 0.25s ease both',
              animationDelay: `${i * 0.04}s`,
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
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          Leave a reply
        </h3>

        <form onSubmit={handleReply}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              style={inputStyle}
              placeholder="your name"
              value={replyAuthor}
              onChange={e => setReplyAuthor(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            />
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
              <button
                type="submit"
                style={{
                  padding: '10px 22px',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                post reply →
              </button>
              {submitted && (
                <span style={{ color: 'var(--green)', fontSize: '13px' }}>
                  ✓ reply posted!
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

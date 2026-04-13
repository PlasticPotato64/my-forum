'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPosts, categoryColor, timeAgo, type Post } from '@/lib/posts'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    setPosts(getPosts())
  }, [])

  return (
    <div>
      <div style={{
        padding: '48px 0 36px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '32px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '12px',
        }}>
          Community<br />
          <span style={{ color: 'var(--accent2)' }}>Threads</span>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          {posts.length} threads · join the conversation
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {posts.map((post, i) => (
          <Link key={post.id} href={`/forum/${post.id}`}>
            <div
              style={{
                padding: '20px 24px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                transition: 'all 0.15s',
                cursor: 'pointer',
                animation: `fadeUp 0.3s ease both`,
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border2)'
                el.style.background = 'var(--bg3)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border)'
                el.style.background = 'var(--bg2)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: '8px' }}>
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
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '17px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>
                  <p style={{
                    color: 'var(--text2)',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {post.body}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    color: post.replies.length > 0 ? 'var(--accent2)' : 'var(--text3)',
                    fontWeight: 500,
                    marginBottom: '4px',
                  }}>
                    {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text3)' }}>
                by <span style={{ color: 'var(--text2)' }}>{post.author}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

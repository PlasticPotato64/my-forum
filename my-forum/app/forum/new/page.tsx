'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CATEGORY_COLORS, posts } from '@/lib/posts'

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)

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

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text2)',
    marginBottom: '8px',
    fontWeight: 500,
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim() || !author.trim()) return
    setLoading(true)

    const newPost = {
      id: String(Date.now()),
      title: title.trim(),
      body: body.trim(),
      author: author.trim(),
      category,
      createdAt: new Date().toISOString(),
      replies: [],
    }

    posts.unshift(newPost)
    setTimeout(() => router.push('/'), 300)
  }

  return (
    <div style={{ paddingTop: '40px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          marginBottom: '8px',
        }}>
          New thread
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>
          Share something with the community
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Author */}
          <div>
            <label style={labelStyle}>your name</label>
            <input
              style={inputStyle}
              placeholder="e.g. anonymous"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    border: `1px solid ${category === cat ? CATEGORY_COLORS[cat] : 'var(--border)'}`,
                    background: category === cat ? `${CATEGORY_COLORS[cat]}20` : 'var(--bg2)',
                    color: category === cat ? CATEGORY_COLORS[cat] : 'var(--text2)',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>title</label>
            <input
              style={inputStyle}
              placeholder="What's on your mind?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>body</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '160px', lineHeight: 1.7 }}
              placeholder="Write your post here..."
              value={body}
              onChange={e => setBody(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 28px',
              background: loading ? 'var(--bg3)' : 'var(--accent)',
              color: loading ? 'var(--text2)' : 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              alignSelf: 'flex-start',
            }}
          >
            {loading ? 'posting...' : 'post thread →'}
          </button>
        </div>
      </form>
    </div>
  )
}

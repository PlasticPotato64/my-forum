'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPosts, savePosts, getCategories, categoryColor } from '@/lib/posts'
import { useAuth } from '@/lib/auth'

export default function NewPost() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [useNew, setUseNew] = useState(false)
  const [existingCats, setExistingCats] = useState<string[]>([])

  useEffect(() => {
    setExistingCats(getCategories())
  }, [])

  if (!user) {
    return (
      <div style={{ paddingTop: '80px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text2)', marginBottom: '16px' }}>You need to be logged in to post.</p>
        <Link href="/auth/login" style={{
          padding: '10px 20px',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
        }}>
          Log in
        </Link>
      </div>
    )
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalCategory = useNew ? newCategory.trim().toLowerCase() : category
    if (!title.trim() || !body.trim() || !finalCategory) return

    const posts = getPosts()
    posts.unshift({
      id: String(Date.now()),
      title: title.trim(),
      body: body.trim(),
      author: user!.username,
      category: finalCategory,
      createdAt: new Date().toISOString(),
      replies: [],
    })
    savePosts(posts)
    router.push('/')
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
          Posting as <span style={{ color: 'var(--accent2)' }}>{user.username}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>
              category
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {existingCats.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); setUseNew(false) }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    border: `1px solid ${!useNew && category === cat ? categoryColor(cat) : 'var(--border)'}`,
                    background: !useNew && category === cat ? `${categoryColor(cat)}20` : 'var(--bg2)',
                    color: !useNew && category === cat ? categoryColor(cat) : 'var(--text2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseNew(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  border: `1px solid ${useNew ? 'var(--accent)' : 'var(--border)'}`,
                  background: useNew ? 'var(--accent-glow)' : 'var(--bg2)',
                  color: useNew ? 'var(--accent2)' : 'var(--text3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                + new category
              </button>
            </div>
            {useNew && (
              <input
                style={inputStyle}
                placeholder="e.g. gaming, music, science..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>
              title
            </label>
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
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>
              body
            </label>
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
            style={{
              padding: '13px 28px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            post thread →
          </button>
        </div>
      </form>
    </div>
  )
}

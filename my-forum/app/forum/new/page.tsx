'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

function categoryColor(cat: string): string {
  const colors = ['#7c6af7','#4ade80','#fbbf24','#f472b6','#60a5fa','#f87171','#34d399','#a78bfa','#fb923c','#38bdf8']
  let hash = 0
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function NewPost() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [useNew, setUseNew] = useState(false)
  const [existingCats, setExistingCats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then((posts: any[]) => {
      const cats = Array.from(new Set(posts.map((p: any) => p.category)))
      setExistingCats(cats as string[])
    })
  }, [])

  if (!user) return (
    <div style={{ paddingTop: '80px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text2)', marginBottom: '16px' }}>You need to be logged in to post.</p>
      <Link href="/auth/login" style={{ padding: '10px 20px', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontSize: '14px' }}>Log in</Link>
    </div>
  )

  const inputStyle = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', transition: 'border-color 0.15s' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalCategory = useNew ? newCategory.trim().toLowerCase() : category
    if (!title.trim() || !body.trim() || !finalCategory) return
    setLoading(true)
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), author: user!.username, category: finalCategory }),
    })
    router.push('/')
  }

  return (
    <div style={{ paddingTop: '40px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>New thread</h1>
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Posting as <span style={{ color: 'var(--accent2)' }}>{user.username}</span></p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {existingCats.map(cat => (
                <button key={cat} type="button" onClick={() => { setCategory(cat); setUseNew(false) }} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  border: `1px solid ${!useNew && category === cat ? categoryColor(cat) : 'var(--border)'}`,
                  background: !useNew && category === cat ? `${categoryColor(cat)}20` : 'var(--bg2)',
                  color: !useNew && category === cat ? categoryColor(cat) : 'var(--text2)',
                }}>{cat}</button>
              ))}
              <button type="button" onClick={() => setUseNew(true)} style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${useNew ? 'var(--accent)' : 'var(--border)'}`,
                background: useNew ? 'var(--accent-glow)' : 'var(--bg2)',
                color: useNew ? 'var(--accent2)' : 'var(--text3)',
              }}>+ new category</button>
            </div>
            {useNew && <input style={inputStyle} placeholder="e.g. gaming, music, science..." value={newCategory} onChange={e => setNewCategory(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} autoFocus />}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>title</label>
            <input style={inputStyle} placeholder="What's on your mind?" value={title} onChange={e => setTitle(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 500 }}>body</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '160px', lineHeight: 1.7 }} placeholder="Write your post here..." value={body} onChange={e => setBody(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} required />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '13px 28px', background: loading ? 'var(--bg3)' : 'var(--accent)', color: loading ? 'var(--text2)' : 'white', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-mono)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
            {loading ? 'posting...' : 'post thread →'}
          </button>
        </div>
      </form>
    </div>
  )
}

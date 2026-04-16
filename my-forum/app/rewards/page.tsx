'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import PointsBadge from '@/components/PointsBadge'

const DAY_REWARDS = [10, 10, 10, 20, 10, 10, 50]

export default function RewardsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    load()
  }, [user])

  async function load() {
    if (!user) return
    const res = await fetch(`/api/points?username=${user.username}`)
    if (res.ok) setData(await res.json())
  }

  async function claim() {
    if (!user) return
    setClaiming(true)
    const res = await fetch('/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'claim', username: user.username }) })
    const d = await res.json()
    if (res.ok) { setMsg(`+${d.earned} Points claimed! Day ${d.day % 7 || 7} streak!`); load() }
    else setMsg(d.error)
    setClaiming(false)
    setTimeout(() => setMsg(''), 4000)
  }

  if (!user || !data) return <div style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text3)' }}>loading...</div>

  const currentDay = ((data.streak || 0) % 7)

  return (
    <div style={{ paddingTop: '40px', maxWidth: '560px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>Daily Rewards</h1>
        <PointsBadge points={data.points} />
      </div>
      <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '32px' }}>Claim every 24 hours. Day 7 gives 50 Points!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '32px' }}>
        {DAY_REWARDS.map((pts, i) => {
          const dayNum = i + 1
          const claimed = (data.streak || 0) > 0 && i < currentDay
          const isToday = i === currentDay && data.canClaim
          const isNext = i === currentDay && !data.canClaim
          return (
            <div key={i} style={{
              background: claimed ? 'var(--bg3)' : isToday ? 'var(--accent-glow)' : 'var(--bg2)',
              border: `1px solid ${isToday ? 'var(--accent)' : claimed ? 'var(--border)' : 'var(--border)'}`,
              borderRadius: '10px', padding: '12px 6px', textAlign: 'center',
              opacity: isNext ? 0.5 : 1,
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>Day {dayNum}</div>
              <div style={{ fontSize: dayNum === 7 ? '18px' : '16px' }}>{dayNum === 7 ? '🌟' : '⭐'}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: dayNum === 7 ? 'var(--amber)' : 'var(--text)', marginTop: '4px' }}>{pts}</div>
              {claimed && <div style={{ fontSize: '10px', color: 'var(--green)', marginTop: '2px' }}>✓</div>}
            </div>
          )
        })}
      </div>

      <button onClick={claim} disabled={!data.canClaim || claiming} style={{
        width: '100%', padding: '14px', background: data.canClaim ? 'var(--accent)' : 'var(--bg3)',
        color: data.canClaim ? 'white' : 'var(--text3)', border: 'none', borderRadius: '10px',
        fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 600,
        cursor: data.canClaim ? 'pointer' : 'not-allowed', marginBottom: '12px',
      }}>
        {data.canClaim ? `⭐ Claim Day ${(currentDay) + 1} Reward` : `⏳ Next claim in ${data.nextClaim ? Math.max(0, Math.ceil((new Date(data.nextClaim).getTime() - Date.now()) / 3600000)) + 'h' : '24h'}`}
      </button>
      {msg && <p style={{ textAlign: 'center', color: msg.includes('+') ? 'var(--green)' : 'var(--red)', fontSize: '14px' }}>{msg}</p>}
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '12px', marginTop: '8px' }}>Current streak: {data.streak || 0} days</p>
    </div>
  )
}

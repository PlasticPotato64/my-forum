'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import PointsBadge from '@/components/PointsBadge'
import { formatPoints } from '@/lib/utils'

const TITLES = [
  { id: 't2', name: 'Adventurer', odds: 3, color: '#4ade80', price: 15 },
  { id: 't3', name: 'Veteran', odds: 10, color: '#60a5fa', price: 50 },
  { id: 't4', name: 'Elite', odds: 50, color: '#a78bfa', price: 200 },
  { id: 't5', name: 'Legend', odds: 500, color: '#fbbf24', price: 1000 },
  { id: 't6', name: 'Mythic', odds: 5000, color: '#f472b6', price: 5000 },
  { id: 't7', name: 'Celestial', odds: 50000, color: '#38bdf8', price: 25000 },
  { id: 't8', name: 'Divine', odds: 500000, color: '#fb923c', price: 100000 },
  { id: 't9', name: 'Transcendent', odds: 5000000, color: '#f87171', price: 500000 },
  { id: 't10', name: 'Eternal', odds: 50000000, color: '#7c6af7', price: 2000000 },
  { id: 't11', name: 'Omnipotent', odds: 1000000000, color: '#ffffff', price: 10000000 },
]

function formatOdds(n: number) {
  if (n >= 1000000000) return '1/1B'
  if (n >= 1000000) return `1/${n/1000000}M`
  if (n >= 1000) return `1/${n/1000}K`
  return `1/${n}`
}

export default function RNGPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [inventory, setInventory] = useState<any[]>([])
  const [potions, setPotions] = useState<any[]>([])
  const [tab, setTab] = useState<'roll'|'shop'|'inventory'>('roll')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return
    const p = await fetch(`/api/points?username=${user.username}`)
    if (p.ok) { const d = await p.json(); setPoints(d.points) }
    const inv = await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'inventory', username: user.username }) })
    if (inv.ok) { const d = await inv.json(); setInventory(d.inventory); setPotions(d.potions) }
  }

  async function handleRoll() {
    if (!user) return
    setRolling(true); setResult(null)
    await new Promise(r => setTimeout(r, 500))
    const res = await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'roll', username: user.username }) })
    const data = await res.json()
    if (res.ok) { setResult(data.title); loadData() }
    setRolling(false)
  }

  async function equip(titleId: string) {
    if (!user) return
    await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'equip', username: user.username, titleId }) })
    loadData(); setMsg('Title equipped!'); setTimeout(() => setMsg(''), 2000)
  }

  async function unequip() {
    if (!user) return
    await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unequip', username: user.username }) })
    loadData(); setMsg('Title unequipped'); setTimeout(() => setMsg(''), 2000)
  }

  async function sell(titleId: string, name: string) {
    if (!user || !confirm(`Sell "${name}"?`)) return
    const res = await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sell', username: user.username, titleId }) })
    const data = await res.json()
    if (res.ok) { setMsg(`Sold for ${formatPoints(data.earned)} Points`); loadData() }
    else setMsg(data.error)
    setTimeout(() => setMsg(''), 2000)
  }

  async function buyPotion(potionType: string) {
    if (!user) return
    const res = await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'buyPotion', username: user.username, potionType }) })
    const data = await res.json()
    if (res.ok) { setMsg('Potion activated!'); loadData() }
    else setMsg(data.error)
    setTimeout(() => setMsg(''), 2000)
  }

  const activeLuck = potions.find(p => p.type === 'luck')
  const activeDivine = potions.find(p => p.type === 'divine')
  const activeDivine2 = potions.find(p => p.type === 'divine2')

  const btnStyle = (active: boolean) => ({
    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-glow)' : 'var(--bg2)',
    color: active ? 'var(--accent2)' : 'var(--text2)', cursor: 'pointer',
  })

  if (!user) return null

  return (
    <div style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>🎲 Title RNG</h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>Roll for rare titles. Equip them on your profile.</p>
        </div>
        <PointsBadge points={points} />
      </div>

      {/* Active potions */}
      {(activeLuck || activeDivine || activeDivine2) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {activeLuck && <span style={{ padding: '4px 12px', background: '#4ade8020', border: '1px solid #4ade8040', borderRadius: '20px', fontSize: '12px', color: '#4ade80' }}>🍀 2x Luck — {Math.max(0, Math.ceil((new Date(activeLuck.expires_at).getTime() - Date.now()) / 60000))}m left</span>}
          {activeDivine && <span style={{ padding: '4px 12px', background: '#fb923c20', border: '1px solid #fb923c40', borderRadius: '20px', fontSize: '12px', color: '#fb923c' }}>✨ Divine — {Math.max(0, Math.ceil((new Date(activeDivine.expires_at).getTime() - Date.now()) / 60000))}m left</span>}
          {activeDivine2 && <span style={{ padding: '4px 12px', background: '#f472b620', border: '1px solid #f472b640', borderRadius: '20px', fontSize: '12px', color: '#f472b6' }}>🌟 Divine II — {Math.max(0, Math.ceil((new Date(activeDivine2.expires_at).getTime() - Date.now()) / 60000))}m left</span>}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['roll','shop','inventory'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={btnStyle(tab === t)}>
            {t === 'roll' ? '🎲 Roll' : t === 'shop' ? '🛒 Shop' : `📦 Inventory (${inventory.length})`}
          </button>
        ))}
      </div>

      {msg && <p style={{ color: msg.includes('enough') || msg.includes('error') ? 'var(--red)' : 'var(--green)', fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

      {/* Roll tab */}
      {tab === 'roll' && (
        <div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', marginBottom: '16px', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {rolling ? (
              <div style={{ fontSize: '40px', animation: 'spin 0.3s linear infinite' }}>🎲</div>
            ) : result ? (
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: result.color, marginBottom: '8px', textShadow: `0 0 30px ${result.color}80` }}>{result.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{formatOdds(result.odds)}</div>
              </div>
            ) : (
              <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Press roll to try your luck!</p>
            )}
          </div>
          <button onClick={handleRoll} disabled={rolling} style={{ width: '100%', padding: '16px', background: rolling ? 'var(--bg3)' : 'var(--accent)', color: rolling ? 'var(--text3)' : 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: rolling ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
            {rolling ? 'Rolling...' : '🎲 Roll'}
          </button>

          {/* Titles table - no rarities */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>All Titles</div>
            {TITLES.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <span style={{ color: t.color, fontWeight: 600 }}>{t.name}</span>
                <span style={{ color: 'var(--text2)' }}>{formatOdds(t.odds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop tab */}
      {tab === 'shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { type: 'luck', name: '🍀 Luck Potion', desc: '2x luck for 5 minutes', cost: 5 },
            { type: 'speed', name: '⚡ Speed Potion', desc: '1.5x roll speed for 5 minutes', cost: 5 },
            { type: 'divine', name: '✨ Divine Potion', desc: '+50,000 luck boost for 5 minutes', cost: 500 },
            { type: 'divine2', name: '🌟 Divine Potion II', desc: '+120,000 luck boost for 5 minutes', cost: 2000 },
          ].map(p => (
            <div key={p.type} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{p.name}</p>
                <p style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.desc}</p>
                <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '2px' }}>Stacks time if already active</p>
              </div>
              <button onClick={() => buyPotion(p.type)} style={{ padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {formatPoints(p.cost)} Points
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inventory tab */}
      {tab === 'inventory' && (
        <div>
          {inventory.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '12px' }}>No titles yet — go roll some!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {inventory.map((item: any) => (
                <div key={item.id} style={{ background: 'var(--bg2)', border: `1px solid ${item.equipped ? item.color : 'var(--border)'}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.equipped && <span style={{ fontSize: '10px', background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40`, borderRadius: '4px', padding: '2px 6px' }}>ON</span>}
                    <span style={{ color: item.color, fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.equipped ? (
                      <button onClick={unequip} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Unequip</button>
                    ) : (
                      <button onClick={() => equip(item.id)} style={{ padding: '5px 12px', background: `${item.color}20`, border: `1px solid ${item.color}40`, color: item.color, borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Equip</button>
                    )}
                    <button onClick={() => sell(item.id, item.name)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Sell</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import PointsBadge from '@/components/PointsBadge'
import { formatPoints } from '@/lib/utils'
import { TITLES, getCutsceneTier, formatOdds } from '@/lib/titles'

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill="#e05a5a"/>
      <polygon points="10,3.5 11.7,8.2 16.7,8.2 12.7,11.2 14.2,16 10,13 5.8,16 7.3,11.2 3.3,8.2 8.3,8.2" fill="#FFD700"/>
    </svg>
  )
}

// Cutscene overlay component
function Cutscene({ title, tier, onDone }: { title: any; tier: 1 | 2 | 3; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, tier === 3 ? 3500 : tier === 2 ? 2500 : 2000)
    return () => clearTimeout(t)
  }, [tier, onDone])

  const colors = {
    1: { bg: 'radial-gradient(ellipse at center, #1e3a5f 0%, #0a0a1a 100%)', particle: '#60a5fa' },
    2: { bg: 'radial-gradient(ellipse at center, #3b1f6e 0%, #0a0a1a 100%)', particle: '#a78bfa' },
    3: { bg: 'radial-gradient(ellipse at center, #5a1a1a 0%, #0a0a0a 100%)', particle: '#FFD700' },
  }[tier]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: colors.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'csIn 0.3s ease',
    }} onClick={onDone}>
      {/* Particles */}
      {Array.from({ length: tier === 3 ? 24 : tier === 2 ? 16 : 10 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${3 + Math.random() * 5}px`,
          height: `${3 + Math.random() * 5}px`,
          borderRadius: '50%',
          background: colors.particle,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${1.5 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 1}s`,
          opacity: 0.7 + Math.random() * 0.3,
          boxShadow: `0 0 ${6 + Math.random() * 10}px ${colors.particle}`,
        }} />
      ))}
      {/* Rays for tier 3 */}
      {tier === 3 && Array.from({ length: 8 }).map((_, i) => (
        <div key={`ray-${i}`} style={{
          position: 'absolute',
          width: '2px',
          height: '50vh',
          background: `linear-gradient(to top, transparent, ${colors.particle}40)`,
          transformOrigin: 'bottom center',
          transform: `rotate(${i * 45}deg)`,
          top: '50%', left: '50%',
          animation: 'rayRotate 3s linear infinite',
        }} />
      ))}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {tier === 3 && <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 0.5s ease infinite alternate' }}>✨</div>}
        {tier === 2 && <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔮</div>}
        {tier === 1 && <div style={{ fontSize: '28px', marginBottom: '10px' }}>💫</div>}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: tier === 3 ? '56px' : tier === 2 ? '44px' : '36px',
          fontWeight: 800,
          color: title.color,
          textShadow: `0 0 40px ${title.color}, 0 0 80px ${title.color}80`,
          letterSpacing: '-1px',
          animation: 'titlePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          marginBottom: '12px',
        }}>
          {title.name}
        </div>
        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)' }}>{formatOdds(title.odds)}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '24px' }}>Click to continue</div>
      </div>
      <style>{`
        @keyframes csIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes bounce { from { transform: scale(1); } to { transform: scale(1.2); } }
        @keyframes titlePop { from { opacity:0; transform: scale(0.5); } to { opacity:1; transform: scale(1); } }
        @keyframes rayRotate { from { transform: rotate(var(--r,0deg)); } to { transform: rotate(calc(var(--r,0deg) + 360deg)); } }
      `}</style>
    </div>
  )
}

export default function RNGPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [cutscene, setCutscene] = useState<{ title: any; tier: 1|2|3 } | null>(null)
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
    if (!user || rolling) return
    setRolling(true); setResult(null)
    await new Promise(r => setTimeout(r, 400))
    const res = await fetch('/api/rng', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'roll', username: user.username }) })
    const data = await res.json()
    if (res.ok) {
      const t = data.title
      const tier = getCutsceneTier(t)
      if (tier > 0) {
        setCutscene({ title: t, tier: tier as 1|2|3 })
      }
      setResult(t)
      loadData()
    }
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

  async function sell(titleId: string, name: string, sellPrice: number) {
    if (!user || !confirm(`Sell "${name}" for ${formatPoints(sellPrice)} Points?`)) return
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
    padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-glow)' : 'var(--bg2)',
    color: active ? 'var(--accent2)' : 'var(--text2)', cursor: 'pointer',
  })

  if (!user) return null

  return (
    <>
      {cutscene && <Cutscene title={cutscene.title} tier={cutscene.tier} onDone={() => setCutscene(null)} />}
      <div style={{ paddingTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>🎲 Title RNG</h1>
            <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>Roll for rare titles. Equip them on your profile.</p>
          </div>
          <PointsBadge points={points} />
        </div>

        {(activeLuck || activeDivine || activeDivine2) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {activeLuck && <span style={{ padding: '4px 12px', background: '#4ade8020', border: '1px solid #4ade8040', borderRadius: '20px', fontSize: '12px', color: '#4ade80' }}>🍀 2x Luck — {Math.max(0, Math.ceil((new Date(activeLuck.expires_at).getTime()-Date.now())/60000))}m left</span>}
            {activeDivine && <span style={{ padding: '4px 12px', background: '#fb923c20', border: '1px solid #fb923c40', borderRadius: '20px', fontSize: '12px', color: '#fb923c' }}>✨ Divine — {Math.max(0, Math.ceil((new Date(activeDivine.expires_at).getTime()-Date.now())/60000))}m left</span>}
            {activeDivine2 && <span style={{ padding: '4px 12px', background: '#f472b620', border: '1px solid #f472b640', borderRadius: '20px', fontSize: '12px', color: '#f472b6' }}>🌟 Divine II — {Math.max(0, Math.ceil((new Date(activeDivine2.expires_at).getTime()-Date.now())/60000))}m left</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['roll','shop','inventory'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={btnStyle(tab === t)}>
              {t === 'roll' ? '🎲 Roll' : t === 'shop' ? '🛒 Shop' : `📦 Inventory (${inventory.length})`}
            </button>
          ))}
        </div>

        {msg && <p style={{ color: msg.includes('enough')||msg.includes('error') ? 'var(--red)' : 'var(--green)', fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

        {tab === 'roll' && (
          <div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', marginBottom: '16px', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {rolling ? (
                <div style={{ fontSize: '44px', animation: 'spin 0.25s linear infinite' }}>🎲</div>
              ) : result ? (
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: result.color, marginBottom: '8px', textShadow: `0 0 30px ${result.color}80` }}>{result.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{formatOdds(result.odds)}</div>
                </div>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Press roll to try your luck!</p>
              )}
            </div>
            <button onClick={handleRoll} disabled={rolling} style={{ width: '100%', padding: '16px', background: rolling ? 'var(--bg3)' : 'var(--accent)', color: rolling ? 'var(--text3)' : 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: rolling ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
              {rolling ? 'Rolling...' : '🎲 Roll'}
            </button>
          </div>
        )}

        {tab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { type: 'luck', name: '🍀 Luck Potion', desc: '2x luck for 5 minutes — doubles all weights', cost: 5 },
              { type: 'speed', name: '⚡ Speed Potion', desc: '1.5x roll speed for 5 minutes', cost: 5 },
              { type: 'divine', name: '✨ Divine Potion', desc: '+50,000 luck multiplier for 5 minutes', cost: 500 },
              { type: 'divine2', name: '🌟 Divine Potion II', desc: '+120,000 luck multiplier for 5 minutes', cost: 2000 },
            ].map(p => (
              <div key={p.type} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{p.name}</p>
                  <p style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.desc}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '2px' }}>Time adds if already active</p>
                </div>
                <button onClick={() => buyPotion(p.type)} style={{ padding: '8px 14px', background: '#e05a5a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <StarIcon />{formatPoints(p.cost)}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'inventory' && (
          <div>
            {inventory.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: '12px' }}>No titles yet — go roll some!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inventory.map((item: any) => {
                  const titleDef = TITLES.find(t => t.id === item.title_id)
                  const sellPrice = item.sellPrice || titleDef?.sellPrice || 0
                  return (
                    <div key={item.id} style={{ background: 'var(--bg2)', border: `1px solid ${item.equipped ? item.color : 'var(--border)'}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {item.equipped && <span style={{ fontSize: '10px', background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40`, borderRadius: '4px', padding: '2px 6px', flexShrink: 0 }}>ON</span>}
                        <span style={{ color: item.color, fontWeight: 600, fontSize: '14px' }}>{item.name}</span>
                        <span style={{ color: 'var(--text3)', fontSize: '11px' }}>{formatOdds(item.odds)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                          <StarIcon />{formatPoints(sellPrice)}
                        </span>
                        {item.equipped ? (
                          <button onClick={unequip} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Unequip</button>
                        ) : (
                          <button onClick={() => equip(item.id)} style={{ padding: '5px 10px', background: `${item.color}20`, border: `1px solid ${item.color}40`, color: item.color, borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Equip</button>
                        )}
                        <button onClick={() => sell(item.id, item.name, sellPrice)} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Sell</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  )
}

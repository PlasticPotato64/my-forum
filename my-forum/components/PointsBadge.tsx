import { formatPoints } from '@/lib/utils'

export default function PointsBadge({ points }: { points: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '4px 12px 4px 4px',
      flexShrink: 0, direction: 'rtl',
    }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', direction: 'ltr' }}>
        {formatPoints(points)} Points
      </span>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#e53e3e', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px',
      }}>
        ⭐
      </div>
    </div>
  )
}

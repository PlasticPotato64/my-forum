import { formatPoints } from '@/lib/utils'

export default function PointsBadge({ points }: { points: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: 'var(--points-bg)', borderRadius: '20px',
      padding: '3px 10px 3px 4px', flexShrink: 0,
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'var(--points-inner)', flexShrink: 0,
        border: '2px solid rgba(0,0,0,0.1)',
      }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#c0392b', fontFamily: 'var(--font-mono)' }}>
        {formatPoints(points)} Points
      </span>
    </div>
  )
}

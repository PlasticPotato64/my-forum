import { formatPoints } from '@/lib/utils'

// Red circle with yellow star SVG icon
function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill="#e05a5a"/>
      <polygon points="10,3.5 11.7,8.2 16.7,8.2 12.7,11.2 14.2,16 10,13 5.8,16 7.3,11.2 3.3,8.2 8.3,8.2" fill="#FFD700"/>
    </svg>
  )
}

export default function PointsBadge({ points }: { points: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '3px 10px 3px 4px',
      flexShrink: 0,
    }}>
      <StarIcon size={22} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
        {formatPoints(points)} Points
      </span>
    </div>
  )
}

export function StarIconSmall() {
  return <StarIcon size={20} />
}

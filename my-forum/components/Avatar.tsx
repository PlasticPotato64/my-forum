'use client'
import Link from 'next/link'

type Props = {
  username: string
  avatar?: string
  size?: number
  linkToProfile?: boolean
}

function getInitialColor(username: string): string {
  const colors = ['#7c6af7','#4ade80','#fbbf24','#f472b6','#60a5fa','#f87171','#34d399','#a78bfa','#fb923c','#38bdf8']
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function Avatar({ username, avatar, size = 32, linkToProfile = true }: Props) {
  const img = (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      background: avatar ? 'transparent' : getInitialColor(username),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 600,
      color: 'white',
      fontFamily: 'var(--font-display)',
      cursor: linkToProfile ? 'pointer' : 'default',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      {avatar
        ? <img src={avatar} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : username[0]?.toUpperCase()
      }
    </div>
  )

  if (!linkToProfile) return img

  return (
    <Link href={`/profile/${username}`} onClick={e => e.stopPropagation()}>
      {img}
    </Link>
  )
}

export function formatPoints(n: number): string {
  if (n < 1000) return String(n)
  const units = ['K','M','B','T']
  let val = n, unit = ''
  for (const u of units) {
    if (val >= 1000) { val /= 1000; unit = u } else break
  }
  // 3 s.f., no trailing zeros
  let s = val.toPrecision(3)
  s = String(parseFloat(s))
  return s + unit
}

export function categoryColor(cat: string): string {
  const colors = ['#7c6af7','#4ade80','#fbbf24','#f472b6','#60a5fa','#f87171','#34d399','#a78bfa','#fb923c','#38bdf8']
  let hash = 0
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

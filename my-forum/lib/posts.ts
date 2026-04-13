export type Post = {
  id: string
  title: string
  body: string
  author: string
  category: string
  createdAt: string
  replies: Reply[]
}

export type Reply = {
  id: string
  body: string
  author: string
  createdAt: string
}

export function getPosts(): Post[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('nexus_posts')
  if (stored) return JSON.parse(stored)
  const seed: Post[] = [
    {
      id: '1',
      title: 'Welcome to Nexus!',
      body: 'This is your new community. Create an account and start posting. You can create your own categories when making a post!',
      author: 'admin',
      category: 'general',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      replies: [
        { id: 'r1', body: 'Looks sick!', author: 'alice', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
      ]
    },
    {
      id: '2',
      title: 'What are you building?',
      body: 'Share your current projects with the community.',
      author: 'devguy',
      category: 'showcase',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      replies: []
    },
  ]
  localStorage.setItem('nexus_posts', JSON.stringify(seed))
  return seed
}

export function savePosts(posts: Post[]) {
  localStorage.setItem('nexus_posts', JSON.stringify(posts))
}

export function getPost(id: string): Post | undefined {
  return getPosts().find(p => p.id === id)
}

export function getCategories(): string[] {
  const posts = getPosts()
  const cats = Array.from(new Set(posts.map(p => p.category).filter(Boolean)))
  return cats.length > 0 ? cats : ['general']
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function categoryColor(cat: string): string {
  const colors = [
    '#7c6af7', '#4ade80', '#fbbf24', '#f472b6',
    '#60a5fa', '#f87171', '#34d399', '#a78bfa',
    '#fb923c', '#38bdf8',
  ]
  let hash = 0
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

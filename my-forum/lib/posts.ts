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

export const CATEGORIES = ['general', 'tech', 'help', 'showcase', 'off-topic']

export const CATEGORY_COLORS: Record<string, string> = {
  general: '#7c6af7',
  tech: '#4ade80',
  help: '#fbbf24',
  showcase: '#f472b6',
  'off-topic': '#60a5fa',
}

// Seed data so the forum isn't empty
export const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to The Forum!',
    body: 'This is our new dark mode community. Feel free to post about anything — tech, projects, questions, or just chat. Glad to have you here.',
    author: 'admin',
    category: 'general',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    replies: [
      {
        id: 'r1',
        body: 'Looks great! Love the dark theme.',
        author: 'alice',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ]
  },
  {
    id: '2',
    title: 'What are you building right now?',
    body: "Share what projects you're working on. I'm currently building a CLI tool in Rust for managing dotfiles across machines.",
    author: 'devguy',
    category: 'tech',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    replies: []
  },
  {
    id: '3',
    title: 'Best resources for learning TypeScript?',
    body: "I've been using JavaScript for a few years and want to make the jump to TypeScript. Any recommended books, courses, or docs?",
    author: 'newbie99',
    category: 'help',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replies: [
      {
        id: 'r2',
        body: 'The official TypeScript handbook is actually really good. Also Matt Pocock on YouTube.',
        author: 'tsexpert',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: 'r3',
        body: 'Total TypeScript by Matt Pocock is worth every penny if you want to go deep.',
        author: 'alice',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      }
    ]
  },
]

export function getPost(id: string) {
  return posts.find(p => p.id === id)
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

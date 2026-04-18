export type Title = {
  id: string
  name: string
  odds: number
  color: string
  sellPrice: number
  cutscene?: string // threshold for cutscene trigger
}

// 50 titles, odds from 1/3 to 1/1,000,000
// Using a geometric progression: each ~1.24x harder than previous
export const TITLES: Title[] = [
  { id: 't01', name: 'Wanderer',      odds: 3,       color: '#a0aec0', sellPrice: 1 },
  { id: 't02', name: 'Scout',         odds: 4,       color: '#a0aec0', sellPrice: 1 },
  { id: 't03', name: 'Adventurer',    odds: 5,       color: '#68d391', sellPrice: 2 },
  { id: 't04', name: 'Explorer',      odds: 7,       color: '#68d391', sellPrice: 2 },
  { id: 't05', name: 'Traveller',     odds: 9,       color: '#4ade80', sellPrice: 3 },
  { id: 't06', name: 'Seeker',        odds: 12,      color: '#4ade80', sellPrice: 4 },
  { id: 't07', name: 'Hunter',        odds: 16,      color: '#38bdf8', sellPrice: 5 },
  { id: 't08', name: 'Ranger',        odds: 21,      color: '#38bdf8', sellPrice: 7 },
  { id: 't09', name: 'Veteran',       odds: 28,      color: '#60a5fa', sellPrice: 9 },
  { id: 't10', name: 'Warrior',       odds: 37,      color: '#60a5fa', sellPrice: 12 },
  { id: 't11', name: 'Knight',        odds: 49,      color: '#818cf8', sellPrice: 15 },
  { id: 't12', name: 'Crusader',      odds: 65,      color: '#818cf8', sellPrice: 20 },
  { id: 't13', name: 'Champion',      odds: 86,      color: '#a78bfa', sellPrice: 27 },
  { id: 't14', name: 'Elite',         odds: 114,     color: '#a78bfa', sellPrice: 35 },
  { id: 't15', name: 'Warlord',       odds: 151,     color: '#c084fc', sellPrice: 46 },
  { id: 't16', name: 'Gladiator',     odds: 200,     color: '#c084fc', sellPrice: 61 },
  { id: 't17', name: 'Overlord',      odds: 264,     color: '#e879f9', sellPrice: 80 },
  { id: 't18', name: 'Sovereign',     odds: 350,     color: '#e879f9', sellPrice: 105 },
  { id: 't19', name: 'Emperor',       odds: 463,     color: '#fbbf24', sellPrice: 140 },
  { id: 't20', name: 'Legend',        odds: 613,     color: '#fbbf24', sellPrice: 185 },
  { id: 't21', name: 'Titan',         odds: 811,     color: '#f59e0b', sellPrice: 245 },
  { id: 't22', name: 'Colossus',      odds: 1073,    color: '#f59e0b', sellPrice: 325 },
  { id: 't23', name: 'Ancient',       odds: 1420,    color: '#fb923c', sellPrice: 430 },
  { id: 't24', name: 'Mythic',        odds: 1879,    color: '#fb923c', sellPrice: 570 },
  { id: 't25', name: 'Arcane',        odds: 2487,    color: '#f97316', sellPrice: 755 },
  { id: 't26', name: 'Mystic',        odds: 3291,    color: '#f97316', sellPrice: 999 },
  { id: 't27', name: 'Oracle',        odds: 4356,    color: '#ef4444', sellPrice: 1320 },
  { id: 't28', name: 'Phantom',       odds: 5763,    color: '#ef4444', sellPrice: 1750 },
  { id: 't29', name: 'Wraith',        odds: 7625,    color: '#f87171', sellPrice: 2315 },
  { id: 't30', name: 'Specter',       odds: 10088,   color: '#f87171', sellPrice: 3063 },
  { id: 't31', name: 'Infernal',      odds: 13347,   color: '#ff6b6b', sellPrice: 4052 },
  { id: 't32', name: 'Abyssal',       odds: 17655,   color: '#ff6b6b', sellPrice: 5363 },
  { id: 't33', name: 'Cursed',        odds: 23354,   color: '#e11d48', sellPrice: 7095 },
  { id: 't34', name: 'Forsaken',      odds: 30900,   color: '#e11d48', sellPrice: 9388 },
  { id: 't35', name: 'Void',          odds: 40876,   color: '#be185d', sellPrice: 12422 },
  { id: 't36', name: 'Shadow',        odds: 54093,   color: '#be185d', sellPrice: 16437 },
  { id: 't37', name: 'Eclipse',       odds: 71566,   color: '#9d174d', sellPrice: 21744 },
  { id: 't38', name: 'Nebula',        odds: 94681,   color: '#7c3aed', sellPrice: 28771 },
  { id: 't39', name: 'Celestial',     odds: 125244,  color: '#6d28d9', sellPrice: 38059 },
  { id: 't40', name: 'Astral',        odds: 165721,  color: '#5b21b6', sellPrice: 50361 },
  { id: 't41', name: 'Cosmic',        odds: 219267,  color: '#4c1d95', sellPrice: 66638 },
  { id: 't42', name: 'Galactic',      odds: 290080,  color: '#2563eb', sellPrice: 88148 },
  { id: 't43', name: 'Divine',        odds: 383753,  color: '#1d4ed8', sellPrice: 116613 },
  { id: 't44', name: 'Sacred',        odds: 507749,  color: '#1e40af', sellPrice: 154283 },
  { id: 't45', name: 'Transcendent',  odds: 671682,  color: '#0ea5e9', sellPrice: 204101 },
  { id: 't46', name: 'Eternal',       odds: 888490,  color: '#0284c7', sellPrice: 270029 },
  { id: 't47', name: 'Infinite',      odds: 900000,  color: '#06b6d4', sellPrice: 320000 },
  { id: 't48', name: 'Sovereign God', odds: 950000,  color: '#ffffff', sellPrice: 400000 },
  { id: 't49', name: 'Primordial',    odds: 975000,  color: '#ffd700', sellPrice: 500000 },
  { id: 't50', name: 'Omnipotent',    odds: 1000000, color: '#ff00ff', sellPrice: 750000 },
]

// Cutscene tier thresholds (titles at index 30+ get cutscenes, rarer = more dramatic)
export function getCutsceneTier(title: Title): 0 | 1 | 2 | 3 {
  if (title.odds >= 900000) return 3   // epic gold cutscene
  if (title.odds >= 100000) return 2   // purple flash
  if (title.odds >= 10000) return 1    // blue glow
  return 0                              // no cutscene
}

export function formatOdds(n: number): string {
  if (n >= 1000000) return '1/1M'
  if (n >= 1000) return `1/${(n/1000).toFixed(n%1000===0?0:1)}K`
  return `1/${n}`
}

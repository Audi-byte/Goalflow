export const config = { runtime: 'edge' }

const LD_TITLES = [
  'instructional designer',
  'instructional design',
  'learning experience',
  'elearning',
  'e-learning',
  'learning designer',
  'curriculum developer',
  'curriculum designer',
  'training developer',
  'learning developer',
  'learning consultant',
  'learning and development',
  'performance consultant',
  'learning architect',
  'learning technologist',
  'instructional technologist',
  'training specialist',
  'learning specialist',
  'content developer',
  'course developer',
  'articulate storyline',
  'moodle',
]

function isLDJob(title = '', category = '', tags = []) {
  const text = `${title} ${category} ${tags.join(' ')}`.toLowerCase()
  return LD_TITLES.some(k => text.includes(k))
}

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const results = await Promise.allSettled([
      fetch('https://remotive.com/api/remote-jobs?category=all-others&limit=100'),
      fetch('https://remotive.com/api/remote-jobs?category=design&limit=100'),
      fetch('https://remotive.com/api/remote-jobs?category=teaching&limit=50'),
      fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'GoalFlow/1.0 goalflow.vercel.app' }
      }),
    ])

    let jobs = []

    for (const result of results.slice(0, 3)) {
      if (result.status === 'fulfilled' && result.value.ok) {
        const data = await result.value.json()
        const filtered = (data.jobs || [])
          .filter(j => isLDJob(j.title, j.category, j.candidate_required_location ? [j.candidate_required_location] : []))
          .map(j => ({
            id: `rem_${j.id}`,
            title: j.title,
            company: j.company_name,
            url: j.url,
            tags: j.tags || [],
            salary: j.salary || null,
            date: j.publication_date ? j.publication_date.slice(0, 10) : null,
            source: 'Remotive',
            location: j.candidate_required_location || 'Worldwide',
            description: j.description ? j.description.replace(/<[^>]*>/g, '').slice(0, 200) : null,
          }))
        jobs = [...jobs, ...filtered]
      }
    }

    const remoteokResult = results[3]
    if (remoteokResult.status === 'fulfilled' && remoteokResult.value.ok) {
      const data = await remoteokResult.value.json()
      const filtered = (Array.isArray(data) ? data.slice(1) : [])
        .filter(j => isLDJob(j.position, '', j.tags || []))
        .map(j => ({
          id: `rok_${j.id}`,
          title: j.position,
          company: j.company,
          url: j.url,
          tags: j.tags || [],
          salary: j.salary || null,
          date: j.date ? new Date(j.date * 1000).toISOString().slice(0, 10) : null,
          source: 'RemoteOK',
          location: 'Remote',
          description: null,
        }))
      jobs = [...jobs, ...filtered]
    }

    const seen = new Set()
    jobs = jobs.filter(j => {
      const key = `${j.title}_${j.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    jobs.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    return new Response(JSON.stringify({ jobs, count: jobs.length }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, jobs: [] }), { status: 500, headers })
  }
}
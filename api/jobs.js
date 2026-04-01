export const config = { runtime: 'edge' }

const LD_KEYWORDS = [
  'instructional designer', 'instructional design',
  'learning experience', 'elearning', 'e-learning',
  'learning designer', 'curriculum developer',
  'training developer', 'learning developer',
  'learning consultant', 'l&d', 'learning and development',
  'performance consultant', 'learning architect',
  'articulate', 'storyline', 'moodle', 'lms'
]

function isLDJob(job) {
  const text = `${job.position || job.title || ''} ${job.tags?.join(' ') || ''} ${job.description || ''}`.toLowerCase()
  return LD_KEYWORDS.some(k => text.includes(k))
}

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const [remoteokRes, jobicyRes] = await Promise.allSettled([
      fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'GoalFlow Job Tracker - goalflow.vercel.app' }
      }),
      fetch('https://jobicy.com/api/v2/remote-jobs?count=50&industry=education', {
        headers: { 'User-Agent': 'GoalFlow Job Tracker' }
      })
    ])

    let jobs = []

    if (remoteokRes.status === 'fulfilled' && remoteokRes.value.ok) {
      const data = await remoteokRes.value.json()
      const filtered = (Array.isArray(data) ? data.slice(1) : [])
        .filter(isLDJob)
        .map(j => ({
          id: `rok_${j.id}`,
          title: j.position,
          company: j.company,
          url: j.url,
          tags: j.tags || [],
          salary: j.salary || null,
          date: j.date ? new Date(j.date * 1000).toISOString().slice(0, 10) : null,
          source: 'RemoteOK',
          location: 'Remote'
        }))
      jobs = [...jobs, ...filtered]
    }

    if (jobicyRes.status === 'fulfilled' && jobicyRes.value.ok) {
      const data = await jobicyRes.value.json()
      const filtered = (data.jobs || [])
        .filter(isLDJob)
        .map(j => ({
          id: `jcy_${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          url: j.url,
          tags: j.jobIndustry ? [j.jobIndustry] : [],
          salary: j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : null,
          date: j.pubDate ? j.pubDate.slice(0, 10) : null,
          source: 'Jobicy',
          location: j.jobGeo || 'Remote'
        }))
      jobs = [...jobs, ...filtered]
    }

    jobs.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    return new Response(JSON.stringify({ jobs, count: jobs.length }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, jobs: [] }), { status: 500, headers })
  }
}
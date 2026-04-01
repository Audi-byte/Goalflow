import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink, Clock, Search } from 'lucide-react'

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  searchWrap: { position: 'relative', marginBottom: '0.75rem' },
  searchInput: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.65rem 0.875rem 0.65rem 2.5rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' },
  filterRow: { display: 'flex', gap: '6px', marginBottom: '0.875rem', flexWrap: 'wrap' },
  filterBtn: (active) => ({ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${active ? 'rgba(245,166,35,0.4)' : 'rgba(245,166,35,0.15)'}`, background: active ? 'rgba(245,166,35,0.12)' : 'none', color: active ? '#F5A623' : '#8A7A6E', cursor: 'pointer' }),
  refreshBtn: { background: 'none', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '12px', color: '#F5A623', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.875rem' },
  jobCard: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.12)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '10px' },
  jobTitle: { fontSize: '14px', fontWeight: '600', color: '#F0EBE0', marginBottom: '3px', lineHeight: '1.4' },
  jobCompany: { fontSize: '13px', color: '#F5A623', marginBottom: '6px' },
  jobDesc: { fontSize: '12px', color: '#8A7A6E', lineHeight: '1.6', marginBottom: '8px' },
  jobMeta: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' },
  tag: { fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(245,166,35,0.06)', color: '#8A7A6E', border: '1px solid rgba(245,166,35,0.08)' },
  sourceTag: (src) => {
    const colors = { Remotive: ['rgba(139,92,246,0.1)', '#8B5CF6'], RemoteOK: ['rgba(59,130,246,0.1)', '#3B82F6'] }
    const [bg, color] = colors[src] || ['rgba(245,166,35,0.1)', '#F5A623']
    return { fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: bg, color, fontWeight: '600' }
  },
  salary: { fontSize: '12px', color: '#4CAF7A', fontWeight: '600' },
  location: { fontSize: '11px', color: '#8A7A6E' },
  jobFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(245,166,35,0.06)' },
  date: { fontSize: '11px', color: '#8A7A6E', display: 'flex', alignItems: 'center', gap: '4px' },
  applyBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' },
  pipeBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', color: '#8A7A6E', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' },
  addedText: { fontSize: '11px', color: '#4CAF7A' },
  empty: { textAlign: 'center', padding: '2rem 1rem', color: '#8A7A6E', fontSize: '13px', background: '#1A1612', border: '1px solid rgba(245,166,35,0.1)', borderRadius: '12px', lineHeight: '1.7' },
  loading: { textAlign: 'center', padding: '2rem', color: '#8A7A6E', fontSize: '13px' },
  count: { fontSize: '12px', color: '#8A7A6E', marginBottom: '0.875rem' },
  errorBox: { background: 'rgba(232,69,60,0.08)', border: '1px solid rgba(232,69,60,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '13px', color: '#E8453C', lineHeight: '1.6' },
  footer: { fontSize: '11px', color: '#5A4A3E', textAlign: 'center', marginTop: '1rem', lineHeight: '1.6' },
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

export default function Jobs({ addPipelineItem }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [lastFetched, setLastFetched] = useState(null)
  const [added, setAdded] = useState({})

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setJobs(data.jobs || [])
      setLastFetched(new Date().toLocaleTimeString())
    } catch (e) {
      setError(`Could not load jobs: ${e.message}. Try refreshing.`)
      setJobs([])
    }
    setLoading(false)
  }

  async function addToPipeline(job) {
    await addPipelineItem({
      title: job.title,
      type: 'job',
      company: job.company,
      platform: job.source,
      notes: job.url,
      amount: null,
      status: 'drafted',
      date: new Date().toISOString().slice(0, 10)
    })
    setAdded(prev => ({ ...prev, [job.id]: true }))
  }

  const sources = ['all', 'Remotive', 'RemoteOK']

  const filtered = jobs.filter(j => {
    const matchSource = filter === 'all' || j.source === filter
    const searchLower = search.toLowerCase()
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(searchLower) ||
      j.company?.toLowerCase().includes(searchLower) ||
      j.tags?.some(t => t.toLowerCase().includes(searchLower)) ||
      j.location?.toLowerCase().includes(searchLower) ||
      j.description?.toLowerCase().includes(searchLower)
    return matchSource && matchSearch
  })

  return (
    <div style={s.page}>
      <div style={s.heading}>L&D Jobs</div>
      <div style={s.sub}>Live remote roles matched to your profile. Updated on every refresh.</div>

      <div style={s.searchWrap}>
        <Search size={14} color="#8A7A6E" style={s.searchIcon} />
        <input
          style={s.searchInput}
          placeholder="Search title, company, location, skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={s.filterRow}>
        {sources.map(src => (
          <button key={src} style={s.filterBtn(filter === src)} onClick={() => setFilter(src)}>
            {src === 'all' ? `All (${jobs.length})` : `${src} (${jobs.filter(j => j.source === src).length})`}
          </button>
        ))}
      </div>

      <button style={s.refreshBtn} onClick={fetchJobs} disabled={loading}>
        <RefreshCw size={12} />
        {loading ? 'Loading...' : `Refresh${lastFetched ? ` · Last: ${lastFetched}` : ''}`}
      </button>

      {error && (
        <div style={s.errorBox}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <p style={s.count}>
          {filtered.length} role{filtered.length !== 1 ? 's' : ''} found
          {search ? ` matching "${search}"` : ' matching your L&D profile'}
        </p>
      )}

      {loading && (
        <div style={s.loading}>Searching job boards for L&D roles...</div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div style={s.empty}>
          {search
            ? `No roles found for "${search}". Try a different search term.`
            : 'No L&D roles found right now. Try refreshing — new roles are posted daily.'
          }
        </div>
      )}

      {filtered.map(job => (
        <div key={job.id} style={s.jobCard}>
          <div style={s.jobTitle}>{job.title}</div>
          <div style={s.jobCompany}>{job.company}</div>

          {job.description && (
            <div style={s.jobDesc}>{job.description}...</div>
          )}

          <div style={s.jobMeta}>
            <span style={s.sourceTag(job.source)}>{job.source}</span>
            {job.salary && <span style={s.salary}>{job.salary}</span>}
            {job.location && <span style={s.location}>{job.location}</span>}
            {job.tags?.slice(0, 2).map(t => <span key={t} style={s.tag}>{t}</span>)}
          </div>

          <div style={s.jobFooter}>
            <div style={s.date}>
              <Clock size={10} />
              {daysAgo(job.date) || 'Recently posted'}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {added[job.id] ? (
                <span style={s.addedText}>In pipeline</span>
              ) : (
                <button style={s.pipeBtn} onClick={() => addToPipeline(job)}>
                  + Pipeline
                </button>
              )}
              <a href={job.url} target="_blank" rel="noopener noreferrer" style={s.applyBtn}>
                Apply <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      ))}

      {!loading && filtered.length > 0 && (
        <p style={s.footer}>
          Jobs sourced from Remotive and RemoteOK.<br />
          GoalFlow links directly to original listings.
        </p>
      )}
    </div>
  )
}
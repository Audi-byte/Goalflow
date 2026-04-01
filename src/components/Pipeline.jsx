import { useState } from 'react'
import { PlusCircle, ChevronDown } from 'lucide-react'

const TYPES = ['job', 'gig', 'corporate', 'product']
const STATUSES = ['drafted', 'sent', 'followed_up', 'response', 'won', 'lost']

const STATUS_COLORS = {
  drafted: '#8A7A6E',
  sent: '#3B82F6',
  followed_up: '#8B5CF6',
  response: '#F5A623',
  won: '#4CAF7A',
  lost: '#E8453C'
}

const TYPE_COLORS = {
  job: '#3B82F6',
  gig: '#8B5CF6',
  corporate: '#F5A623',
  product: '#10B981'
}

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.65rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.875rem', fontFamily: 'inherit' },
  select: { width: '100%', background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.65rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.875rem' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  toggleBtn: { width: '100%', background: 'none', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', padding: '0.65rem', fontSize: '13px', color: '#F5A623', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  pipeItem: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.1)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '8px' },
  pipeTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  pipeTitle: { fontSize: '14px', fontWeight: '600', color: '#F0EBE0', flex: 1, marginRight: '8px' },
  tag: (color) => ({ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: color + '22', color: color, fontWeight: '600', flexShrink: 0 }),
  pipeMeta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  statusSelect: { fontSize: '11px', background: 'transparent', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '6px', padding: '2px 6px', color: '#8A7A6E', cursor: 'pointer', outline: 'none' },
  pipeAmount: { fontSize: '12px', color: '#4CAF7A', fontWeight: '600' },
  pipeDate: { fontSize: '11px', color: '#8A7A6E' },
  empty: { textAlign: 'center', padding: '2rem', color: '#8A7A6E', fontSize: '13px' },
  filterRow: { display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: (active) => ({ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(245,166,35,0.2)', background: active ? 'rgba(245,166,35,0.15)' : 'none', color: active ? '#F5A623' : '#8A7A6E', cursor: 'pointer' }),
  success: { fontSize: '13px', color: '#4CAF7A', textAlign: 'center', marginBottom: '0.5rem' },
}

export default function Pipeline({ pipeline, addPipelineItem, updatePipelineItem }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('job')
  const [company, setCompany] = useState('')
  const [platform, setPlatform] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!title.trim()) return
    setLoading(true)
    await addPipelineItem({ title, type, company, platform, amount: amount ? parseFloat(amount) : null, notes, status: 'drafted', date: new Date().toISOString().slice(0, 10) })
    setTitle(''); setCompany(''); setPlatform(''); setAmount(''); setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setShowForm(false)
    setLoading(false)
  }

  const filtered = filter === 'all' ? pipeline : pipeline.filter(p => p.type === filter)
  const wonTotal = pipeline.filter(p => p.status === 'won').reduce((a, b) => a + (Number(b.amount) || 0), 0)

  return (
    <div style={s.page}>
      <div style={s.heading}>Pipeline</div>
      <div style={s.sub}>Every opportunity tracked. Nothing forgotten.</div>

      {wonTotal > 0 && (
        <div style={{ ...s.card, borderColor: 'rgba(76,175,122,0.3)', marginBottom: '1rem' }}>
          <span style={{ ...s.label, color: '#4CAF7A' }}>Won so far</span>
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#4CAF7A', fontFamily: "'Playfair Display', Georgia, serif" }}>${wonTotal.toLocaleString()}</span>
        </div>
      )}

      <div style={s.filterRow}>
        {['all', 'job', 'gig', 'corporate', 'product'].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <button style={s.toggleBtn} onClick={() => setShowForm(!showForm)}>
        <PlusCircle size={14} />
        Add opportunity
        <ChevronDown size={14} style={{ transform: showForm ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {showForm && (
        <div style={s.card}>
          <label style={s.label}>Title</label>
          <input style={s.input} placeholder="Job title, gig name, company…" value={title} onChange={e => setTitle(e.target.value)} />

          <label style={s.label}>Type</label>
          <select style={s.select} value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          <label style={s.label}>Company / Platform</label>
          <input style={s.input} placeholder="Safaricom, Fiverr, Upwork…" value={company} onChange={e => setCompany(e.target.value)} />

          <label style={s.label}>Potential value (USD)</label>
          <input type="number" style={s.input} placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />

          <label style={s.label}>Notes</label>
          <input style={s.input} placeholder="Contact name, link, next step…" value={notes} onChange={e => setNotes(e.target.value)} />

          {saved && <p style={s.success}>Added to pipeline.</p>}
          <button style={s.btn} onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding…' : 'Add to pipeline'}
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={s.empty}>No items yet. Add your first opportunity above.</div>
      )}

      {filtered.map(item => (
        <div key={item.id} style={s.pipeItem}>
          <div style={s.pipeTop}>
            <div style={s.pipeTitle}>{item.title}</div>
            <span style={s.tag(TYPE_COLORS[item.type])}>{item.type}</span>
          </div>
          {item.company && <div style={{ fontSize: '12px', color: '#8A7A6E', marginBottom: '6px' }}>{item.company}</div>}
          {item.notes && <div style={{ fontSize: '12px', color: '#8A7A6E', marginBottom: '8px', fontStyle: 'italic' }}>{item.notes}</div>}
          <div style={s.pipeMeta}>
            <select
              style={{ ...s.statusSelect, color: STATUS_COLORS[item.status] }}
              value={item.status}
              onChange={e => updatePipelineItem(item.id, { status: e.target.value })}
            >
              {STATUSES.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
            </select>
            {item.amount && <span style={s.pipeAmount}>${Number(item.amount).toLocaleString()}</span>}
            <span style={s.pipeDate}>{item.date}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
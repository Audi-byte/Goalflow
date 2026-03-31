import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

const sources = ['Freelance project', 'Retainer', 'Digital product', 'Consulting', 'Other']

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.5rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' },
  select: { width: '100%', background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.8rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  logRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(245,166,35,0.08)' },
  logAmount: { fontSize: '16px', fontWeight: '600', color: '#4CAF7A' },
  logMeta: { fontSize: '12px', color: '#8A7A6E', marginTop: '2px' },
  success: { fontSize: '13px', color: '#4CAF7A', textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' },
}

export default function IncomeLogger({ incomeLogs, addIncome }) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState(sources[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!amount || isNaN(amount)) return
    setLoading(true)
    await addIncome({ amount: parseFloat(amount), source, note, date })
    setAmount('')
    setNote('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>Log income</div>
      <div style={s.sub}>Every dollar counts toward $10,000.</div>

      <div style={s.card}>
        <label style={s.label}>Amount (USD)</label>
        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={s.input} />

        <label style={s.label}>Source</label>
        <select value={source} onChange={e => setSource(e.target.value)} style={s.select}>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={s.label}>Note (optional)</label>
        <input type="text" placeholder="Client name, project…" value={note} onChange={e => setNote(e.target.value)} style={s.input} />

        <label style={s.label}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.input} />

        {saved && <p style={s.success}>Income logged.</p>}
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          <PlusCircle size={16} />
          {loading ? 'Saving…' : 'Log income'}
        </button>
      </div>

      {incomeLogs.length > 0 && (
        <div style={s.card}>
          <span style={{ ...s.label, marginBottom: '0.5rem' }}>Recent income</span>
          {incomeLogs.slice(0, 10).map(log => (
            <div key={log.id} style={s.logRow}>
              <div>
                <div style={{ fontSize: '13px', color: '#F0EBE0' }}>{log.source}</div>
                <div style={s.logMeta}>{log.date}{log.note ? ` · ${log.note}` : ''}</div>
              </div>
              <div style={s.logAmount}>+${Number(log.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
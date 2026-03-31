import { useState } from 'react'

const moodLabels = ['', 'Awful', 'Bad', 'Low', 'Meh', 'Okay', 'Good', 'Great', 'Energised', 'On fire', 'Unstoppable']

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.5rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' },
  sliderNum: { fontSize: '20px', fontWeight: '700', color: '#F5A623', minWidth: '28px' },
  slider: { flex: 1, accentColor: '#F5A623' },
  sliderLabel: { fontSize: '12px', color: '#8A7A6E', minWidth: '80px', textAlign: 'right' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '1rem' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' },
  checkbox: { width: '18px', height: '18px', accentColor: '#F5A623', cursor: 'pointer' },
  checkLabel: { fontSize: '14px', color: '#F0EBE0' },
  input: { width: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.8rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  success: { fontSize: '13px', color: '#4CAF7A', textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' },
}

export default function DailyLog({ addDailyLog, dailyLogs }) {
  const today = new Date().toISOString().slice(0, 10)
  const existing = dailyLogs.find(l => l.date === today)

  const [mood, setMood] = useState(existing?.mood || 5)
  const [energy, setEnergy] = useState(existing?.energy || 5)
  const [didOutreach, setDidOutreach] = useState(existing?.did_outreach || false)
  const [outreachCount, setOutreachCount] = useState(existing?.outreach_count || 0)
  const [didFollowup, setDidFollowup] = useState(existing?.did_followup || false)
  const [wins, setWins] = useState(existing?.wins || '')
  const [blockers, setBlockers] = useState(existing?.blockers || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    await addDailyLog({ mood, energy, did_outreach: didOutreach, outreach_count: outreachCount, did_followup: didFollowup, wins, blockers, date: today })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>Daily check-in</div>
      <div style={s.sub}>Be honest. This is your record, not a performance.</div>

      <div style={s.card}>
        <label style={s.label}>Mood</label>
        <div style={s.sliderRow}>
          <span style={s.sliderNum}>{mood}</span>
          <input type="range" min="1" max="10" value={mood} style={s.slider} onChange={e => setMood(+e.target.value)} />
          <span style={s.sliderLabel}>{moodLabels[mood]}</span>
        </div>

        <label style={s.label}>Energy</label>
        <div style={s.sliderRow}>
          <span style={s.sliderNum}>{energy}</span>
          <input type="range" min="1" max="10" value={energy} style={s.slider} onChange={e => setEnergy(+e.target.value)} />
          <span style={s.sliderLabel}>{moodLabels[energy]}</span>
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>Outreach habits</label>
        <div style={s.checkRow}>
          <input type="checkbox" style={s.checkbox} checked={didOutreach} onChange={e => setDidOutreach(e.target.checked)} />
          <span style={s.checkLabel}>I contacted potential clients today</span>
        </div>
        {didOutreach && (
          <div style={{ ...s.checkRow, marginBottom: '1rem' }}>
            <span style={{ fontSize: '13px', color: '#8A7A6E' }}>How many?</span>
            <input type="number" min="0" max="20" value={outreachCount} style={s.input} onChange={e => setOutreachCount(+e.target.value)} />
          </div>
        )}
        <div style={s.checkRow}>
          <input type="checkbox" style={s.checkbox} checked={didFollowup} onChange={e => setDidFollowup(e.target.checked)} />
          <span style={s.checkLabel}>I followed up on previous contacts</span>
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>Real wins today</label>
        <textarea style={s.textarea} placeholder="Concrete actions. Not intentions." value={wins} onChange={e => setWins(e.target.value)} />

        <label style={s.label}>Blockers — be brutal</label>
        <textarea style={s.textarea} placeholder="What stopped you? Don't sanitise it." value={blockers} onChange={e => setBlockers(e.target.value)} />

        {saved && <p style={s.success}>Check-in saved.</p>}
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : existing ? 'Update check-in' : 'Save check-in'}
        </button>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

const SKILLS = [
  { id: 'storyline', label: 'Articulate Storyline 360', color: '#F5A623' },
  { id: 'adobe', label: 'Adobe Creative Suite', color: '#E8453C' },
  { id: 'id', label: 'Instructional Design', color: '#3B82F6' },
  { id: 'lms', label: 'LMS Admin (Moodle/WP)', color: '#10B981' },
  { id: 'video', label: 'Video & Animation', color: '#8B5CF6' },
  { id: 'frontend', label: 'Front-end Development', color: '#EC4899' },
]

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  skillRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 0', borderBottom: '1px solid rgba(245,166,35,0.06)' },
  skillDot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }),
  skillName: { fontSize: '13px', color: '#F0EBE0', flex: 1 },
  skillMins: { fontSize: '12px', color: '#8A7A6E' },
  barWrap: { height: '4px', background: '#2C2420', borderRadius: '2px', flex: 1, maxWidth: '80px' },
  barFill: (pct, color) => ({ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: '2px', transition: 'width 0.5s' }),
  select: { width: '100%', background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.65rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.875rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.65rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.875rem', fontFamily: 'inherit' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  success: { fontSize: '13px', color: '#4CAF7A', textAlign: 'center', marginBottom: '0.5rem' },
  streakBadge: (active) => ({ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)', color: active ? '#F5A623' : '#8A7A6E', fontWeight: '600' }),
}

export default function SkillTracker({ skillLogs, addSkillLog }) {
  const [selectedSkill, setSelectedSkill] = useState(SKILLS[0].id)
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  function getSkillMinutes(skillId) {
    return skillLogs
      .filter(l => l.skill === skillId)
      .reduce((a, b) => a + (b.minutes_practiced || 0), 0)
  }

  function getTodayMinutes(skillId) {
    return skillLogs
      .filter(l => l.skill === skillId && l.date === today)
      .reduce((a, b) => a + (b.minutes_practiced || 0), 0)
  }

  function getStreak(skillId) {
    let streak = 0
    const now = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      if (skillLogs.find(l => l.skill === skillId && l.date === dateStr)) streak++
      else break
    }
    return streak
  }

  const maxMins = Math.max(...SKILLS.map(s => getSkillMinutes(s.id)), 1)

  async function handleLog() {
    if (!minutes || isNaN(minutes)) return
    setLoading(true)
    await addSkillLog({
      skill: selectedSkill,
      minutes_practiced: parseInt(minutes),
      note,
      date: today
    })
    setMinutes('')
    setNote('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>1% Growth</div>
      <div style={s.sub}>Track the skills that make you top 1% in eLearning.</div>

      <div style={s.card}>
        <span style={s.label}>Log practice session</span>

        <label style={s.label}>Skill</label>
        <select style={s.select} value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
          {SKILLS.map(sk => <option key={sk.id} value={sk.id}>{sk.label}</option>)}
        </select>

        <label style={s.label}>Minutes practiced</label>
        <input
          type="number"
          placeholder="30"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          style={s.input}
        />

        <label style={s.label}>What did you work on?</label>
        <input
          type="text"
          placeholder="Built a branching scenario, edited a promo video…"
          value={note}
          onChange={e => setNote(e.target.value)}
          style={s.input}
        />

        {saved && <p style={s.success}>Practice logged.</p>}
        <button style={s.btn} onClick={handleLog} disabled={loading}>
          <PlusCircle size={16} />
          {loading ? 'Logging…' : 'Log session'}
        </button>
      </div>

      <div style={s.card}>
        <span style={s.label}>Skill progress</span>
        {SKILLS.map(sk => {
          const total = getSkillMinutes(sk.id)
          const todayMins = getTodayMinutes(sk.id)
          const streak = getStreak(sk.id)
          const pct = (total / maxMins) * 100
          return (
            <div key={sk.id} style={s.skillRow}>
              <div style={s.skillDot(sk.color)} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                  <span style={s.skillName}>{sk.label}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {streak > 0 && <span style={s.streakBadge(true)}>{streak}d streak</span>}
                    {todayMins > 0 && <span style={s.streakBadge(true)}>+{todayMins}m today</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={s.barWrap}>
                    <div style={s.barFill(pct, sk.color)} />
                  </div>
                  <span style={s.skillMins}>{total}m total</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
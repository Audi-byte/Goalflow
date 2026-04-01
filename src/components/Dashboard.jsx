import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, Flame, TrendingUp, DollarSign, CheckCircle, Circle } from 'lucide-react'

const GOAL = 10000

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  greeting: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  date: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' },
  stat: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '0.875rem' },
  statNum: { fontSize: '20px', fontWeight: '700', color: '#F5A623', fontFamily: "'Playfair Display', Georgia, serif" },
  statLabel: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  cardLabel: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', display: 'block' },
  progressWrap: { height: '8px', background: '#2C2420', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' },
  progressFill: (pct) => ({ height: '100%', width: `${Math.min(100, pct)}%`, background: '#F5A623', borderRadius: '4px', transition: 'width 0.6s' }),
  pctRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  missionTitle: { fontSize: '14px', fontWeight: '600', color: '#F0EBE0', marginBottom: '0.75rem' },
  missionItem: (done) => ({ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.6rem 0', borderBottom: '1px solid rgba(245,166,35,0.08)', opacity: done ? 0.5 : 1, cursor: 'pointer' }),
  missionText: (done) => ({ fontSize: '13px', color: done ? '#8A7A6E' : '#F0EBE0', textDecoration: done ? 'line-through' : 'none', lineHeight: '1.5', flex: 1 }),
  missionTag: (type) => {
    const colors = { job: '#3B82F6', gig: '#8B5CF6', corporate: '#F5A623', product: '#10B981', growth: '#EC4899' }
    return { fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: colors[type] + '22', color: colors[type], fontWeight: '600', flexShrink: 0, marginTop: '2px' }
  },
  loadingBox: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#8A7A6E', fontSize: '13px', marginBottom: '1rem' },
  genBtn: { width: '100%', background: 'none', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px', padding: '0.75rem', fontSize: '13px', color: '#F5A623', cursor: 'pointer', marginBottom: '1rem' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function calcStreak(logs) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (logs.find(l => l.date === d.toISOString().slice(0, 10))) streak++
    else break
  }
  return streak
}

function getLast14Days(logs) {
  const map = {}
  logs.forEach(l => { map[l.date] = (map[l.date] || 0) + Number(l.amount) })
  const result = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key.slice(5), amount: map[key] || 0 })
  }
  return result
}

const MISSION_SYSTEM = `You are GoalFlow — a firm, motivating daily mission generator for Audi, an instructional designer in Nairobi.

His goals:
1. Land a full-time remote L&D job
2. Get gigs on Fiverr and Upwork
3. Win direct corporate clients in Nairobi
4. Sell Storyline templates as digital products
5. Reach $10,000 USD by December 31 2026
6. Become top 1% eLearning professional

His skills: Articulate Storyline 360, Adobe Creative Suite, Figma, Moodle, WordPress, front-end dev, instructional design strategy, video/animation.
His blockers: avoidance, people-pleasing, second-guessing, busy without earning.
His tone preference: firm but motivating.

Generate exactly 6 daily missions — one per income stream plus one growth action.
Each mission must be SPECIFIC and ACTIONABLE — not "do outreach" but "message the L&D manager at Equity Bank with this subject line."

Respond in JSON only — no markdown, no explanation:
{
  "missions": [
    { "type": "job", "task": "specific action", "why": "one sentence reason" },
    { "type": "gig", "task": "specific action", "why": "one sentence reason" },
    { "type": "corporate", "task": "specific action", "why": "one sentence reason" },
    { "type": "product", "task": "specific action", "why": "one sentence reason" },
    { "type": "growth", "task": "specific action", "why": "one sentence reason" },
    { "type": "growth", "task": "specific action", "why": "one sentence reason" }
  ],
  "focus_message": "One sharp sentence about what today is really about."
}`

export default function Dashboard({ profile, incomeLogs, dailyLogs, pipeline }) {
  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('gf_missions')
    const savedDate = localStorage.getItem('gf_missions_date')
    const today = new Date().toISOString().slice(0, 10)
    if (saved && savedDate === today) return JSON.parse(saved)
    return null
  })
  const [doneMissions, setDoneMissions] = useState(() => {
    const saved = localStorage.getItem('gf_done_missions')
    const savedDate = localStorage.getItem('gf_missions_date')
    const today = new Date().toISOString().slice(0, 10)
    if (saved && savedDate === today) return JSON.parse(saved)
    return []
  })
  const [generating, setGenerating] = useState(false)

  const total = incomeLogs.reduce((a, b) => a + Number(b.amount), 0)
  const pct = Math.round((total / GOAL) * 100)
  const remaining = Math.max(0, GOAL - total)
  const streak = calcStreak(dailyLogs)
  const chartData = getLast14Days(incomeLogs)
  const activePipeline = pipeline.filter(p => !['won', 'lost'].includes(p.status)).length
  const today = new Date().toISOString().slice(0, 10)

  function toggleMission(i) {
    const updated = doneMissions.includes(i)
      ? doneMissions.filter(d => d !== i)
      : [...doneMissions, i]
    setDoneMissions(updated)
    localStorage.setItem('gf_done_missions', JSON.stringify(updated))
  }

  async function generateMissions() {
    setGenerating(true)
    const context = `
Financial progress: $${total} of $10,000 (${pct}%).
Active pipeline items: ${activePipeline}.
Streak: ${streak} days.
Today: ${today}.
Recent blockers: ${dailyLogs.slice(0, 3).map(l => l.blockers).filter(Boolean).join(', ') || 'none logged'}.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1000,
    messages: [
      { role: 'system', content: MISSION_SYSTEM },
      { role: 'user', content: context }
    ]
  })
})
const json = await res.json()
const raw = json.choices?.[0]?.message?.content || '{}'
const clean = raw.replace(/```json|```/g, '').trim()
const data = JSON.parse(clean)
      setMissions(data)
      setDoneMissions([])
      localStorage.setItem('gf_missions', JSON.stringify(data))
      localStorage.setItem('gf_missions_date', today)
      localStorage.setItem('gf_done_missions', '[]')
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  useEffect(() => {
    if (!missions) generateMissions()
  }, [])

  const typeLabel = { job: 'Job hunt', gig: 'Gig', corporate: 'Corporate', product: 'Product', growth: '1% Growth' }

  return (
    <div style={s.page}>
      <div style={s.greeting}>Good {getGreeting()}, Audi.</div>
      <div style={s.date}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {pct}% to $10K</div>

      <div style={s.grid}>
        <div style={s.stat}>
          <DollarSign size={14} color="#F5A623" />
          <div style={s.statNum}>${total.toLocaleString()}</div>
          <div style={s.statLabel}>Earned</div>
        </div>
        <div style={s.stat}>
          <Target size={14} color="#F5A623" />
          <div style={s.statNum}>${remaining.toLocaleString()}</div>
          <div style={s.statLabel}>To go</div>
        </div>
        <div style={s.stat}>
          <Flame size={14} color="#F5A623" />
          <div style={s.statNum}>{streak}</div>
          <div style={s.statLabel}>Day streak</div>
        </div>
        <div style={s.stat}>
          <TrendingUp size={14} color="#F5A623" />
          <div style={s.statNum}>{activePipeline}</div>
          <div style={s.statLabel}>In pipeline</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.pctRow}>
          <span style={{ fontSize: '13px', color: '#F0EBE0' }}>${total.toLocaleString()} of $10,000</span>
          <span style={{ fontSize: '13px', color: '#F5A623', fontWeight: '600' }}>{pct}%</span>
        </div>
        <div style={s.progressWrap}><div style={s.progressFill(pct)}></div></div>
      </div>

      <div style={s.card}>
        <span style={s.cardLabel}>Today's missions</span>
        {missions?.focus_message && (
          <p style={{ fontSize: '13px', color: '#F5A623', marginBottom: '0.75rem', fontStyle: 'italic' }}>
            {missions.focus_message}
          </p>
        )}
        {generating && <div style={{ color: '#8A7A6E', fontSize: '13px', padding: '0.5rem 0' }}>Generating your missions for today…</div>}
        {missions?.missions?.map((m, i) => (
          <div key={i} style={s.missionItem(doneMissions.includes(i))} onClick={() => toggleMission(i)}>
            {doneMissions.includes(i)
              ? <CheckCircle size={16} color="#4CAF7A" style={{ flexShrink: 0, marginTop: '2px' }} />
              : <Circle size={16} color="#8A7A6E" style={{ flexShrink: 0, marginTop: '2px' }} />
            }
            <div style={{ flex: 1 }}>
              <div style={s.missionText(doneMissions.includes(i))}>{m.task}</div>
              <div style={{ fontSize: '11px', color: '#8A7A6E', marginTop: '2px' }}>{m.why}</div>
            </div>
            <span style={s.missionTag(m.type)}>{typeLabel[m.type]}</span>
          </div>
        ))}
        {missions && (
          <div style={{ marginTop: '0.75rem', fontSize: '12px', color: '#8A7A6E', textAlign: 'right' }}>
            {doneMissions.length}/{missions.missions?.length || 0} done today
          </div>
        )}
      </div>

      <button style={s.genBtn} onClick={generateMissions} disabled={generating}>
        {generating ? 'Generating…' : 'Regenerate today\'s missions'}
      </button>

      {chartData.some(d => d.amount > 0) && (
        <div style={s.card}>
          <span style={s.cardLabel}>Income — last 14 days</span>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#8A7A6E', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1A1612', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', color: '#F0EBE0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="amount" stroke="#F5A623" strokeWidth={2} fill="url(#amber)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
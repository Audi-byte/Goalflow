import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target, Flame, DollarSign } from 'lucide-react'

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' },
  stat: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem' },
  statIcon: { marginBottom: '8px' },
  statNum: { fontSize: '22px', fontWeight: '700', color: '#F5A623', fontFamily: "'Playfair Display', Georgia, serif" },
  statLabel: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  cardLabel: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', display: 'block' },
  progressWrap: { height: '8px', background: '#2C2420', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: '#F5A623', borderRadius: '4px', transition: 'width 0.6s' }),
  pctRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
}

export default function Dashboard({ profile, incomeLogs, dailyLogs }) {
  const total = incomeLogs.reduce((a, b) => a + Number(b.amount), 0)
  const target = profile?.goal_target || 10000
  const pct = Math.min(100, Math.round((total / target) * 100))
  const remaining = Math.max(0, target - total)
  const today = new Date().toISOString().slice(0, 10)
  const todayLog = dailyLogs.find(l => l.date === today)
  const streak = calcStreak(dailyLogs)

  const chartData = getLast30Days(incomeLogs)
  const avgMood = dailyLogs.length
    ? Math.round(dailyLogs.slice(0, 7).reduce((a, b) => a + (b.mood || 0), 0) / Math.min(7, dailyLogs.length))
    : 0

  return (
    <div style={s.page}>
      <div style={s.heading}>Good {getGreeting()}, Audi.</div>
      <div style={s.sub}>{today} · {pct}% to your goal</div>

      <div style={s.grid}>
        <div style={s.stat}>
          <DollarSign size={16} color="#F5A623" style={s.statIcon} />
          <div style={s.statNum}>${total.toLocaleString()}</div>
          <div style={s.statLabel}>Earned</div>
        </div>
        <div style={s.stat}>
          <Target size={16} color="#F5A623" style={s.statIcon} />
          <div style={s.statNum}>${remaining.toLocaleString()}</div>
          <div style={s.statLabel}>Remaining</div>
        </div>
        <div style={s.stat}>
          <Flame size={16} color="#F5A623" style={s.statIcon} />
          <div style={s.statNum}>{streak}</div>
          <div style={s.statLabel}>Day streak</div>
        </div>
        <div style={s.stat}>
          <TrendingUp size={16} color="#F5A623" style={s.statIcon} />
          <div style={s.statNum}>{avgMood || '—'}</div>
          <div style={s.statLabel}>Avg mood</div>
        </div>
      </div>

      <div style={s.card}>
        <span style={s.cardLabel}>$10,000 goal — Dec 31 2026</span>
        <div style={s.pctRow}>
          <span style={{ fontSize: '13px', color: '#F0EBE0' }}>${total.toLocaleString()} of $10,000</span>
          <span style={{ fontSize: '13px', color: '#F5A623', fontWeight: '600' }}>{pct}%</span>
        </div>
        <div style={s.progressWrap}><div style={s.progressFill(pct)}></div></div>
      </div>

      {chartData.length > 0 && (
        <div style={s.card}>
          <span style={s.cardLabel}>Income — last 30 days</span>
          <ResponsiveContainer width="100%" height={140}>
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

      {todayLog && (
        <div style={{ ...s.card, borderColor: 'rgba(76,175,122,0.3)' }}>
          <span style={{ ...s.cardLabel, color: '#4CAF7A' }}>Today logged</span>
          <p style={{ fontSize: '13px', color: '#8A7A6E' }}>Mood {todayLog.mood} · Energy {todayLog.energy} · Outreach: {todayLog.did_outreach ? `Yes (${todayLog.outreach_count})` : 'No'}</p>
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function calcStreak(logs) {
  if (!logs.length) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (logs.find(l => l.date === dateStr)) streak++
    else break
  }
  return streak
}

function getLast30Days(logs) {
  const map = {}
  logs.forEach(l => { map[l.date] = (map[l.date] || 0) + Number(l.amount) })
  const result = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10).slice(5)
    result.push({ date, amount: map[d.toISOString().slice(0, 10)] || 0 })
  }
  return result.filter(d => d.amount > 0)
}
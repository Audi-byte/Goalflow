import { useState } from 'react'
import { supabase } from '../supabase'
import { Send } from 'lucide-react'

const SYSTEM_PROMPT = `You are GoalFlow AI — a ruthless financial accountability coach for Audi, an instructional designer in Nairobi building toward $10,000 USD by December 31, 2026.

YOUR RULES:
1. Never validate excuses. If he says "I was busy" ask what he did instead.
2. Challenge weak logic directly. Name the gap. Don't soften it.
3. If the same blocker appears repeatedly, call it out explicitly.
4. Every response must end with 1-3 SMART actions tied to the $10K goal.
5. Filter every recommendation through: does this move toward $10K by December?
6. Be warm but unflinching. Elite coach, not therapist.
7. Short sentences. No filler. No "Great question!" ever.

His income streams: freelance eLearning projects ($2,500+), retainer clients ($1,200/month), Storyline templates on marketplaces.
His tools: Articulate Storyline 360, Adobe Creative Suite, Figma, Moodle, WordPress.
His market: Kenyan corporates, remote L&D clients.
His blockers: avoidance, people-pleasing, second-guessing, staying busy without earning.

Respond in JSON only:
{
  "message": "your coaching response",
  "pattern_flag": "repeated pattern you notice or null",
  "callout": "assumption or logic gap to challenge or null",
  "smart_actions": [{"action": "...", "deadline": "...", "why": "..."}]
}`

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1rem' },
  chatWrap: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem', paddingRight: '4px' },
  userBubble: { alignSelf: 'flex-end', maxWidth: '85%', background: '#F5A623', color: '#1A1612', borderRadius: '14px 14px 2px 14px', padding: '0.65rem 0.875rem', fontSize: '13px', lineHeight: '1.6' },
  aiBubble: { alignSelf: 'flex-start', maxWidth: '90%', background: '#1A1612', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '14px 14px 14px 2px', padding: '0.875rem 1rem', fontSize: '13px', lineHeight: '1.6', color: '#F0EBE0' },
  pattern: { fontSize: '12px', color: '#F5A623', marginTop: '6px', fontStyle: 'italic' },
  callout: { fontSize: '12px', color: '#E8453C', marginTop: '4px', fontStyle: 'italic' },
  action: { fontSize: '12px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(245,166,35,0.1)', color: '#8A7A6E' },
  actionTitle: { color: '#F0EBE0', fontWeight: '600' },
  inputRow: { display: 'flex', gap: '8px' },
  input: { flex: 1, background: '#1A1612', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '10px', padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none' },
  sendBtn: { background: '#F5A623', border: 'none', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  chip: { background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#8A7A6E', cursor: 'pointer', whiteSpace: 'nowrap' },
  chips: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#8A7A6E', fontSize: '13px', background: '#1A1612', border: '1px solid rgba(245,166,35,0.1)', borderRadius: '12px' },
}

const PROMPTS = [
  "Why am I not hitting $10K?",
  "Call out my patterns",
  "What excuses am I making?",
  "Give me SMART tasks for today",
]

export default function AICoach({ incomeLogs, dailyLogs, insights, addInsight, session }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const total = incomeLogs.reduce((a, b) => a + Number(b.amount), 0)
  const recentDaily = dailyLogs.slice(0, 7)
  const recentIncome = incomeLogs.slice(0, 10)

  function buildContext(userMsg) {
    return `
FINANCIAL PROGRESS: $${total} of $10,000 earned (${Math.round((total/10000)*100)}%).
RECENT DAILY LOGS (last 7):
${recentDaily.map(l => `[${l.date}] Mood:${l.mood} Energy:${l.energy} Outreach:${l.did_outreach ? `Yes(${l.outreach_count})` : 'No'} Followup:${l.did_followup ? 'Yes' : 'No'} Wins:${l.wins || 'none'} Blockers:${l.blockers || 'none'}`).join('\n')}
RECENT INCOME:
${recentIncome.map(l => `[${l.date}] $${l.amount} — ${l.source}${l.note ? ` (${l.note})` : ''}`).join('\n') || 'No income logged yet.'}
USER MESSAGE: ${userMsg}`
  }

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildContext(userMsg) }]
        })
      })
      const json = await res.json()
      const raw = json.content?.[0]?.text || '{}'
      const clean = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      setMessages(m => [...m, { role: 'ai', data }])
      await addInsight({
        date: new Date().toISOString().slice(0, 10),
        insight: data.message,
        pattern_flag: data.pattern_flag,
        callout: data.callout,
        smart_actions: data.smart_actions
      })
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', data: { message: 'Connection error. Try again.', smart_actions: [] } }])
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>AI Coach</div>
      <div style={s.sub}>No sugarcoating. No validation. Just clarity.</div>

      <div style={s.chips}>
        {PROMPTS.map(p => (
          <button key={p} style={s.chip} onClick={() => sendMessage(p)}>{p}</button>
        ))}
      </div>

      <div style={s.chatWrap}>
        {messages.length === 0 && (
          <div style={s.empty}>Ask me anything. I will challenge you if your logic is weak.</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? s.userBubble : s.aiBubble}>
            {msg.role === 'user' ? msg.text : (
              <>
                <div>{msg.data.message}</div>
                {msg.data.pattern_flag && <div style={s.pattern}>Pattern: {msg.data.pattern_flag}</div>}
                {msg.data.callout && <div style={s.callout}>Challenge: {msg.data.callout}</div>}
                {msg.data.smart_actions?.map((a, j) => (
                  <div key={j} style={s.action}>
                    <span style={s.actionTitle}>{j + 1}. {a.action}</span> · by {a.deadline} · {a.why}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        {loading && <div style={s.aiBubble}>Thinking…</div>}
      </div>

      <div style={s.inputRow}>
        <input
          style={s.input}
          placeholder="Ask, confess, or get challenged…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
        />
        <button style={s.sendBtn} onClick={() => sendMessage()} disabled={loading}>
          <Send size={16} color="#1A1612" />
        </button>
      </div>
    </div>
  )
}
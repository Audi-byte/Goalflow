import { useState } from 'react'
import { Send, Zap } from 'lucide-react'

const SYSTEM_PROMPT = `You are GoalFlow Coach — firm, motivating, and specific. You work with Audi, an instructional designer in Nairobi.

His goals: land a remote L&D job, win Fiverr/Upwork gigs, get Nairobi corporate clients, sell Storyline templates, reach $10,000 USD by December 31 2026, become top 1% eLearning professional.

His skills: Articulate Storyline 360, Adobe Creative Suite, Figma, Moodle, WordPress, front-end dev, instructional design strategy, video/animation production.
His blockers: avoidance, people-pleasing, second-guessing, staying busy without earning.
His tone preference: firm but motivating — push hard, keep him moving forward.

RULES:
1. Never validate excuses. Name them directly.
2. Challenge weak logic. Name the gap.
3. Every response ends with 1-3 SMART actions tied to $10K goal or job hunt.
4. Write actual scripts, cover letters, proposals when asked — complete and ready to use.
5. If he asks what to do — tell him exactly. No "you could consider." Tell him what to do.
6. Short punchy sentences. No filler. No "Great question!"
7. Be specific to his market — Nairobi corporates, remote L&D roles, Fiverr eLearning niche.

Respond in JSON only:
{
  "message": "your response — detailed, specific, actionable",
  "pattern_flag": "repeated pattern or null",
  "callout": "assumption or logic gap or null",
  "smart_actions": [{"action": "...", "deadline": "...", "why": "..."}],
  "script": "ready-to-use email/message/proposal text if applicable, or null"
}`

const QUICK_PROMPTS = [
  { label: 'Write my Fiverr gig', prompt: 'Write me a complete Fiverr gig for eLearning development with Articulate Storyline. Title, description, packages, tags — everything.' },
  { label: 'Cover letter now', prompt: 'Write me a cover letter for a remote Instructional Designer role. Make it specific to my skills and Nairobi background.' },
  { label: 'LinkedIn post', prompt: 'Write me a LinkedIn post that positions me as a top eLearning developer. Make it compelling enough to attract L&D managers.' },
  { label: 'Corporate outreach', prompt: 'Write me a cold outreach message to an HR or L&D manager at a Nairobi corporate company. Ready to copy and send.' },
  { label: 'Am I on track?', prompt: 'Based on my progress, am I on track to hit $10,000 by December? Be brutally honest.' },
  { label: 'My excuses', prompt: 'Based on my logs, what excuses am I making? Call them out directly.' },
]

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1rem' },
  chips: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' },
  chip: { background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#8A7A6E', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' },
  chatWrap: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' },
  userBubble: { alignSelf: 'flex-end', maxWidth: '85%', background: '#F5A623', color: '#1A1612', borderRadius: '14px 14px 2px 14px', padding: '0.65rem 0.875rem', fontSize: '13px', lineHeight: '1.6' },
  aiBubble: { alignSelf: 'flex-start', maxWidth: '92%', background: '#1A1612', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '14px 14px 14px 2px', padding: '0.875rem 1rem', fontSize: '13px', lineHeight: '1.7', color: '#F0EBE0' },
  pattern: { fontSize: '12px', color: '#F5A623', marginTop: '8px', fontStyle: 'italic', paddingTop: '6px', borderTop: '1px solid rgba(245,166,35,0.1)' },
  callout: { fontSize: '12px', color: '#E8453C', marginTop: '4px', fontStyle: 'italic' },
  script: { fontSize: '12px', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.75rem', marginTop: '8px', color: '#F0EBE0', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  scriptLabel: { fontSize: '10px', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  action: { fontSize: '12px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(245,166,35,0.08)', color: '#8A7A6E', lineHeight: '1.5' },
  actionTitle: { color: '#F0EBE0', fontWeight: '600' },
  inputRow: { display: 'flex', gap: '8px' },
  input: { flex: 1, background: '#1A1612', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '10px', padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
  sendBtn: { background: '#F5A623', border: 'none', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  empty: { textAlign: 'center', padding: '2rem 1rem', color: '#8A7A6E', fontSize: '13px', background: '#1A1612', border: '1px solid rgba(245,166,35,0.1)', borderRadius: '12px', lineHeight: '1.7' },
  copyBtn: { fontSize: '11px', color: '#F5A623', background: 'none', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', marginTop: '6px' },
}

export default function AICoach({ incomeLogs, dailyLogs, pipeline, addInsight }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const total = incomeLogs.reduce((a, b) => a + Number(b.amount), 0)
  const recentDaily = dailyLogs.slice(0, 7)
  const recentIncome = incomeLogs.slice(0, 7)
  const activePipeline = pipeline.filter(p => !['won', 'lost'].includes(p.status))

  function buildContext(userMsg) {
    return `
FINANCIAL: $${total} of $10,000 earned (${Math.round((total / 10000) * 100)}%).
PIPELINE: ${activePipeline.map(p => `${p.type}: ${p.title} — ${p.status}`).join(', ') || 'empty'}
RECENT DAILY LOGS:
${recentDaily.map(l => `[${l.date}] Mood:${l.mood} Energy:${l.energy} Outreach:${l.did_outreach ? `Yes(${l.outreach_count})` : 'No'} Wins:${l.wins || 'none'} Blockers:${l.blockers || 'none'}`).join('\n') || 'none'}
RECENT INCOME:
${recentIncome.map(l => `[${l.date}] $${l.amount} — ${l.source}`).join('\n') || 'no income logged yet'}
USER: ${userMsg}`
  }

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildContext(msg) }]
        })
      })
      const json = await res.json()
      const raw = json.content?.[0]?.text || '{}'
      const data = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setMessages(m => [...m, { role: 'ai', data }])
      if (data.message) {
        await addInsight({
          date: new Date().toISOString().slice(0, 10),
          insight: data.message,
          pattern_flag: data.pattern_flag,
          callout: data.callout,
          smart_actions: data.smart_actions
        })
      }
    } catch {
      setMessages(m => [...m, { role: 'ai', data: { message: 'Connection error. Check your internet and try again.', smart_actions: [] } }])
    }
    setLoading(false)
  }

  function copyScript(text, i) {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>AI Coach</div>
      <div style={s.sub}>Firm. Specific. No sugarcoating.</div>

      <div style={s.chips}>
        {QUICK_PROMPTS.map((p, i) => (
          <button key={i} style={s.chip} onClick={() => sendMessage(p.prompt)}>
            <Zap size={10} color="#F5A623" />
            {p.label}
          </button>
        ))}
      </div>

      <div style={s.chatWrap}>
        {messages.length === 0 && (
          <div style={s.empty}>
            Your coach is ready.<br />
            Tap a quick action above or type anything.<br />
            <span style={{ color: '#F5A623' }}>It will tell you exactly what to do.</span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? s.userBubble : s.aiBubble}>
            {msg.role === 'user' ? msg.text : (
              <>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.data.message}</div>
                {msg.data.script && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={s.scriptLabel}>Ready to use — copy and send</div>
                    <div style={s.script}>{msg.data.script}</div>
                    <button style={s.copyBtn} onClick={() => copyScript(msg.data.script, i)}>
                      {copied === i ? 'Copied!' : 'Copy to clipboard'}
                    </button>
                  </div>
                )}
                {msg.data.pattern_flag && <div style={s.pattern}>Pattern detected: {msg.data.pattern_flag}</div>}
                {msg.data.callout && <div style={s.callout}>Callout: {msg.data.callout}</div>}
                {msg.data.smart_actions?.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(245,166,35,0.1)' }}>
                    {msg.data.smart_actions.map((a, j) => (
                      <div key={j} style={s.action}>
                        <span style={s.actionTitle}>{j + 1}. {a.action}</span><br />
                        By {a.deadline} · {a.why}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {loading && (
          <div style={s.aiBubble}>
            <span style={{ color: '#8A7A6E' }}>Thinking…</span>
          </div>
        )}
      </div>

      <div style={s.inputRow}>
        <input
          style={s.input}
          placeholder="Ask anything or describe a situation…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button style={s.sendBtn} onClick={() => sendMessage()} disabled={loading}>
          <Send size={16} color="#1A1612" />
        </button>
      </div>
    </div>
  )
}
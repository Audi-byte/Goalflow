import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Upload, Trash2, FileText, Zap, Copy, Check } from 'lucide-react'

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  uploadBox: (drag) => ({ border: `2px dashed ${drag ? '#F5A623' : 'rgba(245,166,35,0.3)'}`, borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem', transition: 'border-color 0.2s' }),
  uploadText: { fontSize: '13px', color: '#8A7A6E', marginTop: '0.4rem' },
  uploadHint: { fontSize: '11px', color: '#5A4A3E', marginTop: '0.2rem' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' },
  ghostBtn: { width: '100%', background: 'none', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' },
  dangerBtn: { width: '100%', background: 'none', color: '#E8453C', border: '1px solid rgba(232,69,60,0.3)', borderRadius: '8px', padding: '0.65rem', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.75rem' },
  fileRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem', background: 'rgba(245,166,35,0.06)', borderRadius: '8px', marginBottom: '0.75rem' },
  fileName: { fontSize: '13px', color: '#F0EBE0', flex: 1 },
  fileDate: { fontSize: '11px', color: '#8A7A6E' },
  status: (ok) => ({ fontSize: '13px', color: ok ? '#4CAF7A' : '#E8453C', textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' }),
  textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px', padding: '0.75rem', color: '#F0EBE0', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '120px', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' },
  resultBlock: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,166,35,0.12)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem' },
  resultLabel: { fontSize: '10px', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'block' },
  resultText: { fontSize: '13px', color: '#F0EBE0', lineHeight: '1.75', whiteSpace: 'pre-wrap' },
  scoreWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' },
  scoreNum: { fontSize: '36px', fontWeight: '700', color: '#F5A623', fontFamily: "'Playfair Display', Georgia, serif" },
  scoreSub: { fontSize: '12px', color: '#8A7A6E', lineHeight: '1.5' },
  copyBtn: { fontSize: '11px', color: '#F5A623', background: 'none', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' },
  tabRow: { display: 'flex', gap: '6px', marginBottom: '1rem' },
  tab: (active) => ({ flex: 1, padding: '0.5rem', fontSize: '12px', background: active ? 'rgba(245,166,35,0.15)' : 'none', border: `1px solid ${active ? 'rgba(245,166,35,0.4)' : 'rgba(245,166,35,0.1)'}`, borderRadius: '8px', color: active ? '#F5A623' : '#8A7A6E', cursor: 'pointer', fontWeight: active ? '600' : '400' }),
  progress: { fontSize: '13px', color: '#F5A623', textAlign: 'center', padding: '1rem' },
  gapItem: { display: 'flex', gap: '8px', padding: '0.5rem 0', borderBottom: '1px solid rgba(245,166,35,0.06)', fontSize: '13px', color: '#F0EBE0', lineHeight: '1.5' },
  gapDot: (type) => ({ width: '8px', height: '8px', borderRadius: '50%', background: type === 'gap' ? '#E8453C' : type === 'match' ? '#4CAF7A' : '#F5A623', flexShrink: 0, marginTop: '5px' }),
}

const ANALYZE_PROMPT = `You are an expert CV analyst, career coach, and L&D hiring consultant. You deeply understand what corporate L&D teams, eLearning agencies, and remote hiring managers look for.

Analyze the provided CV against the job description. Be specific, deep, and honest. Do not sugarcoat gaps.

Respond in JSON only — no markdown outside JSON:
{
  "match_score": 0-100,
  "score_reasoning": "2-3 sentences explaining the score honestly",
  "what_company_wants": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "your_strengths": ["strength 1 with specific evidence from CV", "strength 2", "strength 3"],
  "critical_gaps": ["gap 1 — what's missing and why it matters", "gap 2", "gap 3"],
  "quick_wins": ["thing to add/fix immediately", "thing 2", "thing 3"],
  "rewritten_summary": "A rewritten professional summary for this specific job — 4-5 sentences, punchy, tailored",
  "rewritten_experience": "Key experience bullet points rewritten to match job language and requirements — ready to paste into CV",
  "cover_letter": "Complete cover letter ready to send — professional, specific, compelling. Address hiring manager as 'Dear Hiring Manager' if name unknown.",
  "insider_insight": "What this company or role type really cares about beyond the job description — the unwritten requirements"
}`

export default function ResumeUpload({ session }) {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [status, setStatus] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState('cv')
  const [jobDesc, setJobDesc] = useState('')
  const [pastedCV, setPastedCV] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => { fetchResume() }, [session])

  async function fetchResume() {
    setFetching(true)
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
    setResume(data?.[0] || null)
    setFetching(false)
  }

  async function handleFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ ok: false, msg: 'File too large. Max 5MB.' })
      return
    }
    setLoading(true)
    setStatus({ ok: true, msg: 'Uploading...' })
    try {
      const filePath = `${session.user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('resumes').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      let extractedText = ''
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extractedText = await file.text()
      } else {
        extractedText = `Filename: ${file.name}\nNote: PDF/DOCX uploaded. Paste CV text below for AI analysis.`
      }

      if (resume?.file_path) {
        await supabase.storage.from('resumes').remove([resume.file_path])
        await supabase.from('resumes').delete().eq('id', resume.id)
      }

      const { data, error: dbError } = await supabase.from('resumes').insert({
        user_id: session.user.id,
        file_name: file.name,
        file_path: filePath,
        extracted_text: extractedText,
      }).select().single()

      if (dbError) throw dbError
      setResume(data)
      setStatus({ ok: true, msg: 'Resume uploaded. Now paste the job description to analyze.' })
    } catch (e) {
      setStatus({ ok: false, msg: 'Upload failed: ' + e.message })
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!resume) return
    setLoading(true)
    await supabase.storage.from('resumes').remove([resume.file_path])
    await supabase.from('resumes').delete().eq('id', resume.id)
    setResume(null)
    setAnalysis(null)
    setStatus({ ok: true, msg: 'Resume removed.' })
    setLoading(false)
  }

  async function savePastedCV() {
    if (!pastedCV.trim()) return
    setLoading(true)
    if (resume) {
      await supabase.from('resumes').update({ extracted_text: pastedCV, file_name: 'Pasted CV' }).eq('id', resume.id)
      setResume(prev => ({ ...prev, extracted_text: pastedCV, file_name: 'Pasted CV' }))
    } else {
      const { data } = await supabase.from('resumes').insert({
        user_id: session.user.id,
        file_name: 'Pasted CV',
        file_path: '',
        extracted_text: pastedCV,
      }).select().single()
      setResume(data)
    }
    setStatus({ ok: true, msg: 'CV saved. Now paste a job description to analyze.' })
    setPastedCV('')
    setLoading(false)
  }

  async function analyzeJob() {
    const cvText = resume?.extracted_text || pastedCV
    if (!cvText.trim()) {
      setStatus({ ok: false, msg: 'Add your CV first — upload a file or paste your CV text.' })
      return
    }
    if (!jobDesc.trim()) {
      setStatus({ ok: false, msg: 'Paste a job description to analyze against.' })
      return
    }
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 2000,
          messages: [
            { role: 'system', content: ANALYZE_PROMPT },
            { role: 'user', content: `MY CV:\n${cvText}\n\nJOB DESCRIPTION:\n${jobDesc}` }
          ]
        })
      })
      const json = await res.json()
      const raw = json.choices?.[0]?.message?.content || '{}'
      const data = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setAnalysis(data)
      setActiveTab('result')
    } catch (e) {
      setStatus({ ok: false, msg: 'Analysis failed. Try again.' })
    }
    setAnalyzing(false)
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const scoreColor = analysis ? (analysis.match_score >= 70 ? '#4CAF7A' : analysis.match_score >= 50 ? '#F5A623' : '#E8453C') : '#F5A623'

  if (fetching) return (
    <div style={s.page}>
      <div style={s.heading}>Resume & Jobs</div>
      <p style={{ color: '#8A7A6E', fontSize: '13px' }}>Loading...</p>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.heading}>Resume & Jobs</div>
      <div style={s.sub}>Upload your CV. Paste any job. AI rewrites and analyzes everything.</div>

      <div style={s.tabRow}>
        {[['cv', 'My CV'], ['job', 'Analyze Job'], ['result', 'Results']].map(([id, label]) => (
          <button key={id} style={s.tab(activeTab === id)} onClick={() => setActiveTab(id)}>
            {label}{id === 'result' && analysis ? ` · ${analysis.match_score}%` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'cv' && (
        <>
          {resume ? (
            <div style={s.card}>
              <span style={s.label}>Current CV</span>
              <div style={s.fileRow}>
                <FileText size={18} color="#F5A623" />
                <div style={{ flex: 1 }}>
                  <div style={s.fileName}>{resume.file_name}</div>
                  <div style={s.fileDate}>Saved {new Date(resume.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              {resume.extracted_text && (
                <div style={{ ...s.resultBlock, maxHeight: '180px', overflowY: 'auto' }}>
                  <span style={s.resultLabel}>CV text the AI sees</span>
                  <p style={{ ...s.resultText, fontSize: '12px', color: '#8A7A6E' }}>{resume.extracted_text.slice(0, 600)}{resume.extracted_text.length > 600 ? '...' : ''}</p>
                </div>
              )}
              <button style={s.dangerBtn} onClick={handleDelete} disabled={loading}>
                <Trash2 size={14} />
                {loading ? 'Removing...' : 'Remove CV'}
              </button>
            </div>
          ) : (
            <div style={s.card}>
              <span style={s.label}>Upload CV file</span>
              <div
                style={s.uploadBox(dragOver)}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('cv-file').click()}
              >
                <Upload size={22} color="#F5A623" />
                <p style={s.uploadText}>Drop file or click to browse</p>
                <p style={s.uploadHint}>PDF, DOCX, or TXT · Max 5MB</p>
              </div>
              <input id="cv-file" type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          <div style={s.card}>
            <span style={s.label}>Or paste your CV text directly</span>
            <textarea
              style={s.textarea}
              placeholder="Paste your full CV here — the AI reads every word and uses it when analyzing jobs and writing cover letters..."
              value={pastedCV}
              onChange={e => setPastedCV(e.target.value)}
            />
            <button style={s.btn} onClick={savePastedCV} disabled={loading || !pastedCV.trim()}>
              {loading ? 'Saving...' : 'Save CV text'}
            </button>
          </div>

          {status && <p style={s.status(status.ok)}>{status.msg}</p>}
        </>
      )}

      {activeTab === 'job' && (
        <>
          <div style={s.card}>
            <span style={s.label}>Paste job description</span>
            <p style={{ fontSize: '12px', color: '#8A7A6E', marginBottom: '0.75rem', lineHeight: '1.6' }}>
              Paste the full job posting — title, requirements, responsibilities, everything. The more you give, the sharper the analysis.
            </p>
            <textarea
              style={{ ...s.textarea, minHeight: '200px' }}
              placeholder="Paste the full job description here..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
            {status && <p style={s.status(status.ok)}>{status.msg}</p>}
            {analyzing && <p style={s.progress}>Analyzing your CV against this role... this takes 10-15 seconds</p>}
            <button style={s.btn} onClick={analyzeJob} disabled={analyzing || !jobDesc.trim()}>
              <Zap size={16} />
              {analyzing ? 'Analyzing...' : 'Analyze & rewrite for this job'}
            </button>
          </div>
        </>
      )}

      {activeTab === 'result' && !analysis && (
        <div style={s.card}>
          <p style={{ fontSize: '13px', color: '#8A7A6E', textAlign: 'center', padding: '1rem' }}>
            No analysis yet. Go to Analyze Job tab, paste a job description and tap Analyze.
          </p>
        </div>
      )}

      {activeTab === 'result' && analysis && (
        <>
          <div style={s.card}>
            <span style={s.label}>Match score</span>
            <div style={s.scoreWrap}>
              <div style={{ ...s.scoreNum, color: scoreColor }}>{analysis.match_score}%</div>
              <div style={s.scoreSub}>{analysis.score_reasoning}</div>
            </div>
          </div>

          <div style={s.card}>
            <span style={s.label}>What this company really wants</span>
            {analysis.what_company_wants?.map((w, i) => (
              <div key={i} style={s.gapItem}>
                <div style={s.gapDot('match')} />
                {w}
              </div>
            ))}
          </div>

          {analysis.insider_insight && (
            <div style={s.card}>
              <span style={s.label}>Insider insight — the unwritten requirements</span>
              <p style={{ ...s.resultText, color: '#F5A623', fontStyle: 'italic' }}>{analysis.insider_insight}</p>
            </div>
          )}

          <div style={s.card}>
            <span style={s.label}>Your strengths for this role</span>
            {analysis.your_strengths?.map((s2, i) => (
              <div key={i} style={s.gapItem}>
                <div style={s.gapDot('match')} />
                {s2}
              </div>
            ))}
          </div>

          <div style={s.card}>
            <span style={s.label}>Critical gaps — be honest with yourself</span>
            {analysis.critical_gaps?.map((g, i) => (
              <div key={i} style={s.gapItem}>
                <div style={s.gapDot('gap')} />
                {g}
              </div>
            ))}
          </div>

          <div style={s.card}>
            <span style={s.label}>Fix these immediately</span>
            {analysis.quick_wins?.map((q, i) => (
              <div key={i} style={s.gapItem}>
                <div style={s.gapDot('win')} />
                {q}
              </div>
            ))}
          </div>

          <div style={s.card}>
            <span style={s.label}>Rewritten professional summary — paste into your CV</span>
            <p style={s.resultText}>{analysis.rewritten_summary}</p>
            <button style={s.copyBtn} onClick={() => copy(analysis.rewritten_summary, 'summary')}>
              {copied === 'summary' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <div style={s.card}>
            <span style={s.label}>Rewritten experience bullets — paste into your CV</span>
            <p style={s.resultText}>{analysis.rewritten_experience}</p>
            <button style={s.copyBtn} onClick={() => copy(analysis.rewritten_experience, 'exp')}>
              {copied === 'exp' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <div style={s.card}>
            <span style={s.label}>Cover letter — ready to send</span>
            <p style={s.resultText}>{analysis.cover_letter}</p>
            <button style={s.copyBtn} onClick={() => copy(analysis.cover_letter, 'cover')}>
              {copied === 'cover' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <button style={s.ghostBtn} onClick={() => { setActiveTab('job'); setAnalysis(null) }}>
            Analyze a different job
          </button>
        </>
      )}
    </div>
  )
}
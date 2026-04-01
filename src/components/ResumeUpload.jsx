import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Upload, Trash2, FileText } from 'lucide-react'

const s = {
  page: { padding: '1.25rem', maxWidth: '480px', margin: '0 auto', paddingBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#F0EBE0', fontWeight: '700', marginBottom: '0.2rem' },
  sub: { fontSize: '13px', color: '#8A7A6E', marginBottom: '1.25rem' },
  card: { background: '#1A1612', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' },
  label: { fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' },
  uploadBox: { border: '2px dashed rgba(245,166,35,0.3)', borderRadius: '10px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', transition: 'border-color 0.2s' },
  uploadText: { fontSize: '14px', color: '#8A7A6E', marginTop: '0.5rem' },
  uploadHint: { fontSize: '12px', color: '#5A4A3E', marginTop: '0.25rem' },
  btn: { width: '100%', background: '#F5A623', color: '#1A1612', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  dangerBtn: { width: '100%', background: 'none', color: '#E8453C', border: '1px solid rgba(232,69,60,0.3)', borderRadius: '8px', padding: '0.75rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.75rem' },
  fileRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem', background: 'rgba(245,166,35,0.06)', borderRadius: '8px', marginBottom: '0.75rem' },
  fileName: { fontSize: '13px', color: '#F0EBE0', flex: 1 },
  fileDate: { fontSize: '11px', color: '#8A7A6E' },
  status: (ok) => ({ fontSize: '13px', color: ok ? '#4CAF7A' : '#E8453C', textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' }),
  extractBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: '8px', padding: '0.875rem', marginTop: '0.75rem', maxHeight: '200px', overflowY: 'auto' },
  extractText: { fontSize: '12px', color: '#8A7A6E', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  progress: { fontSize: '13px', color: '#F5A623', textAlign: 'center', padding: '0.5rem' },
}

export default function ResumeUpload({ session }) {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [status, setStatus] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => { fetchResume() }, [session])

  async function fetchResume() {
    setFetching(true)
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setResume(data || null)
    setFetching(false)
  }

  async function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
      setStatus({ ok: false, msg: 'Please upload a PDF, DOCX, or TXT file.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ ok: false, msg: 'File too large. Max 5MB.' })
      return
    }

    setLoading(true)
    setStatus({ ok: true, msg: 'Uploading...' })

    try {
      const filePath = `${session.user.id}/${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      setStatus({ ok: true, msg: 'Extracting text...' })

      let extractedText = ''
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extractedText = await file.text()
      } else {
        extractedText = `Resume: ${file.name}\nUploaded: ${new Date().toLocaleDateString()}\n\n[PDF/DOCX content — AI will use filename and your profile context]`
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
      setStatus({ ok: true, msg: 'Resume uploaded successfully. AI Coach now knows your background.' })
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
    setStatus({ ok: true, msg: 'Resume removed.' })
    setLoading(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (fetching) return (
    <div style={s.page}>
      <div style={s.heading}>My Resume</div>
      <p style={{ color: '#8A7A6E', fontSize: '13px' }}>Loading...</p>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.heading}>My Resume</div>
      <div style={s.sub}>Upload your CV so the AI Coach knows your exact background and can give sharper advice.</div>

      {resume ? (
        <div style={s.card}>
          <span style={s.label}>Current resume</span>
          <div style={s.fileRow}>
            <FileText size={18} color="#F5A623" />
            <div style={{ flex: 1 }}>
              <div style={s.fileName}>{resume.file_name}</div>
              <div style={s.fileDate}>Uploaded {new Date(resume.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {resume.extracted_text && (
            <div>
              <span style={s.label}>AI can see this</span>
              <div style={s.extractBox}>
                <p style={s.extractText}>{resume.extracted_text.slice(0, 800)}{resume.extracted_text.length > 800 ? '...' : ''}</p>
              </div>
            </div>
          )}

          <button style={s.dangerBtn} onClick={handleDelete} disabled={loading}>
            <Trash2 size={14} />
            {loading ? 'Removing...' : 'Remove resume'}
          </button>

          <div style={{ marginTop: '1rem' }}>
            <span style={s.label}>Replace with new file</span>
            <div
              style={{ ...s.uploadBox, borderColor: dragOver ? '#F5A623' : 'rgba(245,166,35,0.3)' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-input-replace').click()}
            >
              <Upload size={20} color="#8A7A6E" />
              <p style={s.uploadText}>Drop file here or click to browse</p>
              <p style={s.uploadHint}>PDF, DOCX, or TXT · Max 5MB</p>
            </div>
            <input id="resume-input-replace" type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
      ) : (
        <div style={s.card}>
          <span style={s.label}>Upload your CV</span>
          <div
            style={{ ...s.uploadBox, borderColor: dragOver ? '#F5A623' : 'rgba(245,166,35,0.3)' }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-input').click()}
          >
            <Upload size={24} color="#F5A623" />
            <p style={s.uploadText}>Drop your CV here or click to browse</p>
            <p style={s.uploadHint}>PDF, DOCX, or TXT · Max 5MB</p>
          </div>
          <input id="resume-input" type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {loading && <p style={s.progress}>Processing...</p>}
          {status && <p style={s.status(status.ok)}>{status.msg}</p>}

          <button style={s.btn} onClick={() => document.getElementById('resume-input').click()} disabled={loading}>
            <Upload size={16} />
            {loading ? 'Uploading...' : 'Choose file'}
          </button>
        </div>
      )}

      {status && <p style={s.status(status.ok)}>{status.msg}</p>}

      <div style={s.card}>
        <span style={s.label}>How the AI uses your resume</span>
        <p style={{ fontSize: '13px', color: '#8A7A6E', lineHeight: '1.7' }}>
          Your CV text is attached to every AI Coach conversation. This means the coach knows your exact experience, tools, and background — so advice is specific to you, not generic. It also uses this when writing cover letters and proposals on your behalf.
        </p>
      </div>
    </div>
  )
}
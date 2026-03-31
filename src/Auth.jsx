import { useState } from 'react'
import { supabase } from './supabase'

const ALLOWED_EMAIL = 'balkomwenyewe@gmail.com'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (email.toLowerCase() !== ALLOWED_EMAIL) {
      setError('Access denied.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0F0F0F', padding: '1.5rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', background: '#1A1612',
        border: '1px solid rgba(245,166,35,0.2)', borderRadius: '16px', padding: '2rem'
      }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '28px', color: '#F5A623', marginBottom: '0.25rem', fontWeight: '700'
        }}>
          GoalFlow
        </div>
        <p style={{ fontSize: '13px', color: '#8A7A6E', marginBottom: '2rem' }}>
          Your financial goal. Your accountability.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px',
              padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '11px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(245,166,35,0.15)', borderRadius: '8px',
              padding: '0.7rem 0.875rem', color: '#F0EBE0', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#E8453C', marginBottom: '1rem' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: '#F5A623', color: '#1A1612',
            border: 'none', borderRadius: '8px', padding: '0.8rem',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F', color: '#F5A623' }}>
      Loading...
    </div>
  )

  if (!session) return <Auth />

  return (
    <div style={{ padding: '2rem', color: '#F5A623', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px' }}>
      Welcome back. Let's get to $10,000.
    </div>
  )
}
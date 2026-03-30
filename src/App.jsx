import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    supabase.from('profiles').select('id').limit(1)
      .then(({ error }) => {
        setStatus(error ? 'Connection failed: ' + error.message : 'Supabase connected.')
      })
  }, [])

  return (
    <div style={{ padding: '2rem', color: '#F5A623' }}>
      {status}
    </div>
  )
}
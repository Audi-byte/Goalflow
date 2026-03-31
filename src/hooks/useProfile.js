import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useProfile(session) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data) { setProfile(data) }
        else {
          supabase.from('profiles').insert({
            id: session.user.id,
            email: session.user.email,
            full_name: 'Audi',
            goal_target: 10000,
            goal_deadline: '2026-12-31'
          }).select().single().then(({ data }) => setProfile(data))
        }
      })
  }, [session])

  return { profile, setProfile }
}
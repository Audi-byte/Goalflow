import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useData(session) {
  const [incomeLogs, setIncomeLogs] = useState([])
  const [dailyLogs, setDailyLogs] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    if (!session) return
    const uid = session.user.id
    const [inc, daily, ins] = await Promise.all([
      supabase.from('income_logs').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('daily_logs').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('ai_insights').select('*').eq('user_id', uid).order('date', { ascending: false })
    ])
    setIncomeLogs(inc.data || [])
    setDailyLogs(daily.data || [])
    setInsights(ins.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [session])

  async function addIncome(entry) {
    const { data } = await supabase.from('income_logs').insert({ ...entry, user_id: session.user.id }).select().single()
    setIncomeLogs(prev => [data, ...prev])
  }

  async function addDailyLog(entry) {
    const today = new Date().toISOString().slice(0, 10)
    const existing = dailyLogs.find(l => l.date === today)
    if (existing) {
      const { data } = await supabase.from('daily_logs').update(entry).eq('id', existing.id).select().single()
      setDailyLogs(prev => prev.map(l => l.id === existing.id ? data : l))
    } else {
      const { data } = await supabase.from('daily_logs').insert({ ...entry, user_id: session.user.id }).select().single()
      setDailyLogs(prev => [data, ...prev])
    }
  }

  async function addInsight(entry) {
    const { data } = await supabase.from('ai_insights').insert({ ...entry, user_id: session.user.id }).select().single()
    setInsights(prev => [data, ...prev])
  }

  return { incomeLogs, dailyLogs, insights, loading, addIncome, addDailyLog, addInsight, refetch: fetchAll }
}
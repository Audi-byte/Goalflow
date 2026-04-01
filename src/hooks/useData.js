import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useData(session) {
  const [incomeLogs, setIncomeLogs] = useState([])
  const [dailyLogs, setDailyLogs] = useState([])
  const [skillLogs, setSkillLogs] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [resume, setResume] = useState(null)

  async function fetchAll() {
    if (!session) return
    const uid = session.user.id
    const resData = await supabase
  .from('resumes')
  .select('*')
  .eq('user_id', uid)
  .order('created_at', { ascending: false })
  .limit(1)
setResume(resData.data?.[0] || null)
    const [inc, daily, skills, pipe, ins] = await Promise.all([
      supabase.from('income_logs').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('daily_logs').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('skill_logs').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('pipeline').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('ai_insights').select('*').eq('user_id', uid).order('date', { ascending: false })
    ])
    setIncomeLogs(inc.data || [])
    setDailyLogs(daily.data || [])
    setSkillLogs(skills.data || [])
    setPipeline(pipe.data || [])
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

  async function addSkillLog(entry) {
    const { data } = await supabase.from('skill_logs').insert({ ...entry, user_id: session.user.id }).select().single()
    setSkillLogs(prev => [data, ...prev])
  }

  async function addPipelineItem(entry) {
    const { data } = await supabase.from('pipeline').insert({ ...entry, user_id: session.user.id }).select().single()
    setPipeline(prev => [data, ...prev])
  }

  async function updatePipelineItem(id, updates) {
    const { data } = await supabase.from('pipeline').update(updates).eq('id', id).select().single()
    setPipeline(prev => prev.map(p => p.id === id ? data : p))
  }

  async function addInsight(entry) {
    const { data } = await supabase.from('ai_insights').insert({ ...entry, user_id: session.user.id }).select().single()
    setInsights(prev => [data, ...prev])
  }

 return {
  incomeLogs, dailyLogs, skillLogs, pipeline, insights, resume, loading,
  addIncome, addDailyLog, addSkillLog, addPipelineItem, updatePipelineItem, addInsight,
  refetch: fetchAll
}
}
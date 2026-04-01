import ResumeUpload from './components/ResumeUpload'
import Jobs from './components/Jobs'
import SkillTracker from './components/SkillTracker'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useProfile } from './hooks/useProfile'
import { useData } from './hooks/useData'
import Auth from './Auth'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import IncomeLogger from './components/IncomeLogger'
import DailyLog from './components/DailyLog'
import AICoach from './components/AICoach'
import Pipeline from './components/Pipeline'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const { profile } = useProfile(session)
const { incomeLogs, dailyLogs, skillLogs, pipeline, insights, resume, addIncome, addDailyLog, addSkillLog, addPipelineItem, updatePipelineItem, addInsight } = useData(session)
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F', color: '#F5A623', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', letterSpacing: '-0.5px' }}>
      GoalFlow
    </div>
  )

  if (!session) return <Auth />

  return (
    <div style={{ background: '#0F0F0F', minHeight: '100vh', paddingBottom: '80px' }}>

<div style={{ position: 'fixed', top: '0.75rem', right: '1rem', zIndex: 200 }}>
  <button
    onClick={() => supabase.auth.signOut()}
    style={{ background: 'none', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#8A7A6E', cursor: 'pointer' }}
  >
    Sign out
  </button>
</div>

      {screen === 'dashboard' && <Dashboard profile={profile} incomeLogs={incomeLogs} dailyLogs={dailyLogs} pipeline={pipeline} />}
      {screen === 'income' && <IncomeLogger incomeLogs={incomeLogs} addIncome={addIncome} />}
      {screen === 'daily' && <DailyLog addDailyLog={addDailyLog} dailyLogs={dailyLogs} />}
      {screen === 'pipeline' && <Pipeline pipeline={pipeline} addPipelineItem={addPipelineItem} updatePipelineItem={updatePipelineItem} />}
{screen === 'coach' && <AICoach incomeLogs={incomeLogs} dailyLogs={dailyLogs} pipeline={pipeline} addInsight={addInsight} resume={resume} />}      {screen === 'growth' && <SkillTracker skillLogs={skillLogs} addSkillLog={addSkillLog} />}
      {screen === 'jobs' && <Jobs addPipelineItem={addPipelineItem} />}
      {screen === 'resume' && <ResumeUpload session={session} />}
      <NavBar active={screen} setActive={setScreen} />
    </div>
  )
}
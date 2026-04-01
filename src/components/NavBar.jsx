import { LayoutDashboard, DollarSign, CheckSquare, Bot, GitBranch, TrendingUp, FileText, Briefcase } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Today', Icon: LayoutDashboard },
  { id: 'income', label: 'Income', Icon: DollarSign },
  { id: 'daily', label: 'Daily', Icon: CheckSquare },
  { id: 'pipeline', label: 'Pipeline', Icon: GitBranch },
  { id: 'growth', label: 'Growth', Icon: TrendingUp },
  { id: 'jobs', label: 'Jobs', Icon: Briefcase },
  { id: 'resume', label: 'CV', Icon: FileText },
  { id: 'coach', label: 'Coach', Icon: Bot },
]

export default function NavBar({ active, setActive }) {
  return (
    <nav style={{ display: 'flex', borderTop: '1px solid rgba(245,166,35,0.15)', background: '#0F0F0F', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, overflowX: 'auto' }}>
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => setActive(id)} style={{ flex: '0 0 auto', minWidth: '56px', background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 0.5rem 0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <Icon size={17} color={active === id ? '#F5A623' : '#8A7A6E'} />
          <span style={{ fontSize: '8px', color: active === id ? '#F5A623' : '#8A7A6E', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
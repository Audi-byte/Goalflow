import { LayoutDashboard, DollarSign, CheckSquare, Bot } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'income', label: 'Income', Icon: DollarSign },
  { id: 'daily', label: 'Daily', Icon: CheckSquare },
  { id: 'coach', label: 'Coach', Icon: Bot },
]

export default function NavBar({ active, setActive }) {
  return (
    <nav style={{ display: 'flex', borderTop: '1px solid rgba(245,166,35,0.15)', background: '#0F0F0F', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => setActive(id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 0 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <Icon size={20} color={active === id ? '#F5A623' : '#8A7A6E'} />
          <span style={{ fontSize: '10px', color: active === id ? '#F5A623' : '#8A7A6E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
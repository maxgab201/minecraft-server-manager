import { motion } from 'framer-motion'
import {
  Terminal,
  ScrollText,
  Activity,
  Zap,
} from 'lucide-react'

export type TabId = 'terminal' | 'logs' | 'status' | 'actions'

interface SidebarItem {
  id: TabId
  label: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-5 h-5" /> },
  { id: 'logs', label: 'Logs', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'status', label: 'Status', icon: <Activity className="w-5 h-5" /> },
  { id: 'actions', label: 'Actions', icon: <Zap className="w-5 h-5" /> },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      <nav className="hidden md:flex flex-col w-16 lg:w-56 h-full glass border-r border-white/5 py-4 shrink-0">
        <div className="px-3 lg:px-5 mb-6">
          <h1 className="hidden lg:block text-sm font-semibold gradient-text">
            Server Manager
          </h1>
          <h1 className="lg:hidden text-xs font-bold gradient-text text-center">
            SM
          </h1>
        </div>

        <div className="flex flex-col gap-1 px-2 lg:px-3">
          {sidebarItems.map((item) => {
            const isActive = item.id === activeTab
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(item.id)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 w-full
                  ${isActive
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 shrink-0">{item.icon}</span>
                <span className="relative z-10 hidden lg:block">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 px-2 py-1 flex justify-around">
        {sidebarItems.map((item) => {
          const isActive = item.id === activeTab
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs
                transition-colors duration-200
                ${isActive ? 'text-accent' : 'text-text-muted'}
              `}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>
    </>
  )
}

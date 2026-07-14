import { motion } from 'framer-motion'
import {
  Play,
  Square,
  RefreshCw,
  Save,
  Users,
  Gauge,
  MemoryStick,
  Clock,
  Eraser,
  FileText,
} from 'lucide-react'
import type { ShortcutAction } from '../../../../shared/types/shortcuts'

const iconMap: Record<string, React.ReactNode> = {
  play: <Play className="w-4 h-4" />,
  stop: <Square className="w-4 h-4" />,
  refresh: <RefreshCw className="w-4 h-4" />,
  save: <Save className="w-4 h-4" />,
  people: <Users className="w-4 h-4" />,
  speed: <Gauge className="w-4 h-4" />,
  memory: <MemoryStick className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  erase: <Eraser className="w-4 h-4" />,
  logs: <FileText className="w-4 h-4" />,
}

const colorMap: Record<string, string> = {
  'start-server': 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-500/40',
  'stop-server': 'from-red-500/20 to-red-600/10 border-red-500/20 hover:border-red-500/40',
  'restart-server': 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-500/40',
  'save-world': 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-500/40',
  'list-players': 'from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40',
  tps: 'from-teal-500/20 to-teal-600/10 border-teal-500/20 hover:border-teal-500/40',
  memory: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40',
  uptime: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-500/40',
  'clear-console': 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/20 hover:border-zinc-500/40',
  'get-logs': 'from-rose-500/20 to-rose-600/10 border-rose-500/20 hover:border-rose-500/40',
}

interface ShortcutButtonProps {
  id: ShortcutAction
  label: string
  icon?: string
  onClick: () => void
  loading?: boolean
}

export function ShortcutButton({ id, label, icon, onClick, loading }: ShortcutButtonProps) {
  const iconEl = icon ? iconMap[icon] : null
  const bgColor = colorMap[id] || 'from-white/5 to-white/10 border-white/10'

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className={`
        relative flex flex-col items-center justify-center gap-2
        p-4 rounded-xl border bg-gradient-to-br
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${bgColor}
      `}
    >
      <div className={`p-2 rounded-lg bg-white/5 ${loading ? 'animate-pulse' : ''}`}>
        {iconEl}
      </div>
      <span className="text-xs font-medium text-text-secondary text-center leading-tight">
        {label}
      </span>
    </motion.button>
  )
}

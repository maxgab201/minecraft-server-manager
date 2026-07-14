import { Search, RefreshCw } from 'lucide-react'
import { useLogsStore } from '../../stores/logsStore'

interface LogFilterBarProps {
  onRefresh: () => void
}

const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'FATAL']

export function LogFilterBar({ onRefresh }: LogFilterBarProps) {
  const { filter, searchQuery, setFilter, setSearch } = useLogsStore()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 glass border-b border-white/5">
      <div className="flex items-center gap-1 flex-wrap">
        {levels.map((level) => {
          const isActive = filter === level
          const colorMap: Record<string, string> = {
            ALL: isActive ? 'text-text-primary bg-white/10' : 'text-text-muted hover:text-text-secondary',
            INFO: isActive ? 'text-blue-400 bg-blue-500/10' : 'text-text-muted hover:text-blue-400/80',
            WARN: isActive ? 'text-amber-400 bg-amber-500/10' : 'text-text-muted hover:text-amber-400/80',
            ERROR: isActive ? 'text-red-400 bg-red-500/10' : 'text-text-muted hover:text-red-400/80',
            FATAL: isActive ? 'text-red-400 bg-red-500/20 font-bold' : 'text-text-muted hover:text-red-400/80',
          }
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                isActive
                  ? `${colorMap[level]} border border-white/10`
                  : `${colorMap[level]} hover:bg-white/5`
              }`}
            >
              {level}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

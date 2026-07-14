import {
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'

interface TerminalToolbarProps {
  onClear: () => void
  onCopy: () => void
  onToggleFullscreen: () => void
  onSearch: (query: string) => void
  isFullscreen: boolean
  hasSelection: boolean
  searchQuery: string
  onClearSearch: () => void
}

export function TerminalToolbar({
  onClear,
  onCopy,
  onToggleFullscreen,
  onSearch,
  isFullscreen,
  hasSelection,
  searchQuery,
  onClearSearch,
}: TerminalToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 glass border-b border-white/5 rounded-t-xl">
      <div className="flex items-center gap-1">
        <div className="flex gap-1.5 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-text-muted font-mono">terminal</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="w-32 lg:w-48 px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Tooltip content="Copy selection" position="bottom">
          <button
            onClick={onCopy}
            disabled={!hasSelection}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors disabled:opacity-30"
          >
            <Copy className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Clear terminal" position="bottom">
          <button
            onClick={onClear}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} position="bottom">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

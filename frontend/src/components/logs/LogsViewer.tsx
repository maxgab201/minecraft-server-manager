import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Copy,
  ArrowDown,
  Pause,
  Play,
  FileText,
} from 'lucide-react'
import { useLogsStore } from '../../stores/logsStore'
import { useLogs } from '../../hooks/useLogs'
import { LogFilterBar } from './LogFilterBar'
import { Tooltip } from '../ui/Tooltip'

function getLevelColor(level?: string): string {
  switch (level?.toUpperCase()) {
    case 'INFO': return 'text-blue-400'
    case 'WARN': case 'WARNING': return 'text-amber-400'
    case 'ERROR': return 'text-red-400'
    case 'FATAL': return 'text-red-400 font-bold'
    case 'DEBUG': return 'text-text-muted'
    default: return 'text-text-primary'
  }
}

function getLevelBadge(level?: string): string {
  switch (level?.toUpperCase()) {
    case 'INFO': return 'bg-blue-500/10 text-blue-400'
    case 'WARN': case 'WARNING': return 'bg-amber-500/10 text-amber-400'
    case 'ERROR': return 'bg-red-500/10 text-red-400'
    case 'FATAL': return 'bg-red-500/20 text-red-400'
    case 'DEBUG': return 'bg-white/5 text-text-muted'
    default: return 'bg-white/5 text-text-muted'
  }
}

export function LogsViewer() {
  const { logs, filter, searchQuery, autoScroll, handleDownload } = useLogs()
  const { toggleAutoScroll } = useLogsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(0)
  const hasNewRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
    if (logs.length > prevLengthRef.current) {
      hasNewRef.current = true
      prevLengthRef.current = logs.length
    }
  }, [logs, autoScroll, scrollToBottom])

  const handleCopyLine = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  const handleCopyAll = useCallback(() => {
    const text = logs.map((l) => l.raw).join('\n')
    navigator.clipboard.writeText(text)
  }, [logs])

  const filteredLogs = logs.filter((entry) => {
    if (filter !== 'ALL' && entry.level?.toUpperCase() !== filter && !(filter === 'ERROR' && (entry.level?.toUpperCase() === 'ERROR' || entry.level?.toUpperCase() === 'FATAL'))) {
      if (filter === 'ERROR' && entry.level?.toUpperCase() === 'FATAL') return true
      return false
    }
    return true
  }).filter((entry) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      entry.message.toLowerCase().includes(q) ||
      entry.raw.toLowerCase().includes(q) ||
      entry.level?.toLowerCase().includes(q)
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full glass rounded-xl border border-white/5 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Logs</span>
          <span className="text-xs text-text-muted">
            {filteredLogs.length} entries
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content={autoScroll ? 'Pause auto-scroll' : 'Enable auto-scroll'} position="bottom">
            <button
              onClick={toggleAutoScroll}
              className={`p-1.5 rounded-md transition-colors ${
                autoScroll
                  ? 'text-accent hover:bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              {autoScroll ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </Tooltip>

          <Tooltip content="Copy all" position="bottom">
            <button
              onClick={handleCopyAll}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="Download latest.log" position="bottom">
            <button
              onClick={handleDownload}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      <LogFilterBar onRefresh={() => {}} />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-xs leading-relaxed bg-black/30"
        onScroll={() => {
          if (!containerRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current
          const atBottom = scrollHeight - scrollTop - clientHeight < 50
          if (atBottom !== autoScroll && autoScroll === false && atBottom) {
            toggleAutoScroll()
          }
        }}
      >
        <div className="p-3 space-y-0.5">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <FileText className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No log entries found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            filteredLogs.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="group flex items-start gap-2 px-2 py-0.5 rounded hover:bg-white/[0.02] transition-colors"
              >
                {entry.timestamp && (
                  <span className="shrink-0 text-text-muted opacity-60 text-[10px] leading-relaxed pt-[1px]">
                    {entry.timestamp}
                  </span>
                )}
                {entry.level && (
                  <span
                    className={`shrink-0 px-1.5 py-[1px] text-[10px] font-medium rounded ${getLevelBadge(entry.level)}`}
                  >
                    {entry.level}
                  </span>
                )}
                <span
                  className={`flex-1 ${getLevelColor(entry.level)} break-all`}
                  dangerouslySetInnerHTML={{
                    __html: searchQuery
                      ? entry.message.replace(
                          new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                          '<mark class="bg-accent/30 text-text-primary rounded-sm px-0.5">$1</mark>'
                        )
                      : entry.message,
                  }}
                />
                <button
                  onClick={() => handleCopyLine(entry.raw)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-all duration-200 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {!autoScroll && hasNewRef.current && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => {
              scrollToBottom()
              toggleAutoScroll()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium glass rounded-full border border-white/10 text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all shadow-lg"
          >
            <ArrowDown className="w-3 h-3" />
            New logs
          </button>
        </div>
      )}
    </motion.div>
  )
}

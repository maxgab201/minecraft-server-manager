import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTerminal } from '../../hooks/useTerminal'
import { useTerminalStore } from '../../stores/terminalStore'
import { TerminalToolbar } from './TerminalToolbar'
import { Chat } from '../chat/Chat'

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showChat, setShowChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isFullscreen, toggleFullscreen } = useTerminalStore()
  const {
    terminal,
    fitTerminal,
    clearTerminal,
    copySelection,
    findNext,
  } = useTerminal(containerRef)

  useEffect(() => {
    const handleResize = () => {
      fitTerminal()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [fitTerminal])

  useEffect(() => {
    const timer = setTimeout(() => fitTerminal(), 100)
    return () => clearTimeout(timer)
  }, [isFullscreen, fitTerminal])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query) {
      findNext(query)
    }
  }, [findNext])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const hasSelection = terminal?.getSelection() ? true : false

  return (
    <AnimatePresence>
      <motion.div
        initial={false}
        animate={{
          position: isFullscreen ? 'fixed' : 'relative',
          inset: isFullscreen ? 0 : undefined,
          zIndex: isFullscreen ? 50 : undefined,
          height: isFullscreen ? '100vh' : '100%',
          width: isFullscreen ? '100vw' : '100%',
        }}
        transition={{ duration: 0.2 }}
        className="flex flex-col"
      >
        <TerminalToolbar
          onClear={clearTerminal}
          onCopy={copySelection}
          onToggleFullscreen={toggleFullscreen}
          onSearch={handleSearch}
          isFullscreen={isFullscreen}
          hasSelection={hasSelection}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />

        <div className="flex-1 relative glass rounded-b-xl overflow-hidden border border-white/5 border-t-0">
          {showChat && (
            <div className="absolute inset-0 z-10">
              <Chat onClose={() => setShowChat(false)} />
            </div>
          )}
          <div
            ref={containerRef}
            className="absolute inset-0 p-2"
            style={{
              background: 'rgba(0,0,0,0.3)',
              minHeight: '400px',
            }}
          />

          <button
            onClick={() => setShowChat(!showChat)}
            className="absolute bottom-3 right-3 z-20 px-3 py-1.5 text-xs font-medium glass rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors border border-white/5"
          >
            {showChat ? 'Terminal' : 'Chat'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

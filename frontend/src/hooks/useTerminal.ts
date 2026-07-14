import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import { useTerminalStore } from '../stores/terminalStore'
import { useAuthStore } from '../stores/authStore'
import { wsService } from '../services/websocket'

export function useTerminal(containerRef: React.RefObject<HTMLDivElement | null>) {
  const fitAddonRef = useRef<FitAddon | null>(null)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const initializedRef = useRef(false)
  const { sessionId } = useAuthStore()
  const { setTerminal, addToHistory, fontSize, terminal } = useTerminalStore()

  const initializeTerminal = useCallback(() => {
    if (!containerRef.current || initializedRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: 'transparent',
        foreground: '#fafafa',
        cursor: '#00d4aa',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(0, 212, 170, 0.3)',
        selectionInactiveBackground: 'rgba(0, 212, 170, 0.15)',
        black: '#1a1a2e',
        red: '#ef4444',
        green: '#00d4aa',
        yellow: '#f59e0b',
        blue: '#6366f1',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#fafafa',
        brightBlack: '#71717a',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#818cf8',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#fafafa',
      },
      allowTransparency: true,
      cols: Math.floor((containerRef.current?.clientWidth || 800) / 9),
      rows: Math.floor((containerRef.current?.clientHeight || 400) / 20),
      convertEol: true,
      scrollback: 50000,
      disableStdin: false,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    const searchAddon = new SearchAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.loadAddon(searchAddon)

    term.open(containerRef.current)

    fitAddon.fit()
    fitAddonRef.current = fitAddon
    searchAddonRef.current = searchAddon

    term.onData((data) => {
      wsService.send(data)
    })

    term.onResize(({ cols, rows }) => {
      wsService.send(JSON.stringify({ type: 'resize', cols, rows }))
    })

    term.onTitleChange((title) => {
      if (title) addToHistory(title)
    })

    setTerminal(term)
    initializedRef.current = true
  }, [containerRef, fontSize, setTerminal, addToHistory])

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return
    initializeTerminal()

    return () => {
      if (terminal) {
        terminal.dispose()
        setTerminal(null)
        initializedRef.current = false
      }
      wsService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!terminal || !sessionId) return
    if (!wsService.isConnected) {
      wsService.connect(sessionId)
    }

    const unsub = wsService.onMessage((data) => {
      terminal.write(data)
    })

    return () => {
      unsub()
      wsService.disconnect()
    }
  }, [terminal, sessionId])

  const fitTerminal = useCallback(() => {
    try {
      fitAddonRef.current?.fit()
    } catch {
      // Ignore fit errors during resize
    }
  }, [])

  const clearTerminal = useCallback(() => {
    terminal?.clear()
  }, [terminal])

  const copySelection = useCallback(() => {
    const selection = terminal?.getSelection()
    if (selection) {
      navigator.clipboard.writeText(selection)
    }
  }, [terminal])

  const findNext = useCallback((query: string) => {
    searchAddonRef.current?.findNext(query)
  }, [])

  const findPrevious = useCallback((query: string) => {
    searchAddonRef.current?.findPrevious(query)
  }, [])

  return {
    terminal,
    fitAddon: fitAddonRef.current,
    fitTerminal,
    clearTerminal,
    copySelection,
    findNext,
    findPrevious,
  }
}

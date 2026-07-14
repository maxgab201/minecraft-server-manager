import { create } from 'zustand'
import type { Terminal } from '@xterm/xterm'

interface TerminalState {
  terminal: Terminal | null
  history: string[]
  isFullscreen: boolean
  searchQuery: string
  fontSize: number

  setTerminal: (terminal: Terminal | null) => void
  addToHistory: (entry: string) => void
  clearHistory: () => void
  toggleFullscreen: () => void
  setSearchQuery: (query: string) => void
  setFontSize: (size: number) => void
}

export const useTerminalStore = create<TerminalState>((set) => ({
  terminal: null,
  history: [],
  isFullscreen: false,
  searchQuery: '',
  fontSize: 14,

  setTerminal: (terminal: Terminal | null) => set({ terminal }),

  addToHistory: (entry: string) =>
    set((state) => ({
      history: [...state.history.slice(-999), entry],
    })),

  clearHistory: () => set({ history: [] }),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setFontSize: (fontSize: number) => set({ fontSize }),
}))

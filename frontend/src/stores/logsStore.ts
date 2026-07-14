import { create } from 'zustand'
import type { LogEntry } from '../../../shared/types/logs'

interface LogsState {
  logs: LogEntry[]
  autoScroll: boolean
  filter: string
  searchQuery: string

  addLogs: (entries: LogEntry[]) => void
  setLogs: (entries: LogEntry[]) => void
  setFilter: (filter: string) => void
  setSearch: (query: string) => void
  toggleAutoScroll: () => void
  clearLogs: () => void
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],
  autoScroll: true,
  filter: 'ALL',
  searchQuery: '',

  addLogs: (entries: LogEntry[]) =>
    set((state) => ({
      logs: [...state.logs, ...entries].slice(-10000),
    })),

  setLogs: (entries: LogEntry[]) => set({ logs: entries }),

  setFilter: (filter: string) => set({ filter }),

  setSearch: (searchQuery: string) => set({ searchQuery }),

  toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),

  clearLogs: () => set({ logs: [] }),
}))

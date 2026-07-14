import { create } from 'zustand'
import type { ServerStatus } from '../../../shared/types/status'
import { getServerStatus } from '../services/api'

interface StatusState {
  serverStatus: ServerStatus | null
  polling: boolean
  pollingInterval: ReturnType<typeof setInterval> | null
  error: string | null

  startPolling: () => void
  stopPolling: () => void
  updateStatus: (status: ServerStatus) => void
}

export const useStatusStore = create<StatusState>((set, get) => ({
  serverStatus: null,
  polling: false,
  pollingInterval: null,
  error: null,

  startPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) clearInterval(pollingInterval)

    const fetchStatus = async () => {
      try {
        const status = await getServerStatus()
        set({ serverStatus: status, error: null })
      } catch {
        // Silently fail to avoid flooding logs
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    set({ polling: true, pollingInterval: interval })
  },

  stopPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    set({ polling: false, pollingInterval: null, serverStatus: null })
  },

  updateStatus: (status: ServerStatus) => set({ serverStatus: status }),
}))

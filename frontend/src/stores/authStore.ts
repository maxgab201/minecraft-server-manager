import { create } from 'zustand'
import { connectSSH, disconnectSSH } from '../services/api'
import type { SSHCredentials } from '../../../shared/types/ssh'

interface AuthState {
  sessionId: string | null
  isConnected: boolean
  username: string
  host: string
  port: number
  connecting: boolean
  error: string | null

  connect: (credentials: SSHCredentials) => Promise<void>
  disconnect: () => Promise<void>
  setError: (error: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  sessionId: null,
  isConnected: false,
  username: '',
  host: '',
  port: 22,
  connecting: false,
  error: null,

  connect: async (credentials: SSHCredentials) => {
    set({ connecting: true, error: null })
    try {
      const result = await connectSSH(credentials)
      set({
        sessionId: result.sessionId,
        isConnected: true,
        username: result.username,
        host: result.host,
        port: result.port,
        connecting: false,
        error: null,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to connect. Check your credentials and ensure the server is running.'
      set({
        connecting: false,
        error: message,
        isConnected: false,
      })
      throw new Error(message)
    }
  },

  disconnect: async () => {
    try {
      await disconnectSSH()
    } catch {
      // Ignore disconnect errors
    }
    set({
      sessionId: null,
      isConnected: false,
      username: '',
      host: '',
      port: 22,
      error: null,
    })
  },

  setError: (error: string | null) => set({ error }),

  reset: () =>
    set({
      sessionId: null,
      isConnected: false,
      username: '',
      host: '',
      port: 22,
      connecting: false,
      error: null,
    }),
}))

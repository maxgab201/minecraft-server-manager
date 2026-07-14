import { useEffect } from 'react'
import { useStatusStore } from '../stores/statusStore'
import { useAuthStore } from '../stores/authStore'

export function useServerStatus() {
  const { sessionId, isConnected } = useAuthStore()
  const { serverStatus, polling, startPolling, stopPolling } = useStatusStore()

  useEffect(() => {
    if (isConnected && sessionId) {
      startPolling(sessionId)
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isConnected, sessionId, startPolling, stopPolling])

  return {
    serverStatus,
    polling,
  }
}

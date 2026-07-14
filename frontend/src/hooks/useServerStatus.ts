import { useEffect } from 'react'
import { useStatusStore } from '../stores/statusStore'
import { useAuthStore } from '../stores/authStore'

export function useServerStatus() {
  const { isConnected } = useAuthStore()
  const { serverStatus, polling, startPolling, stopPolling } = useStatusStore()

  useEffect(() => {
    if (isConnected) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isConnected, startPolling, stopPolling])

  return {
    serverStatus,
    polling,
  }
}

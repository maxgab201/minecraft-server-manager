import { useEffect, useCallback, useRef } from 'react'
import { useLogsStore } from '../stores/logsStore'
import { useAuthStore } from '../stores/authStore'
import { getLogs, downloadLogs } from '../services/api'

export function useLogs() {
  const { sessionId, isConnected } = useAuthStore()
  const { logs, filter, searchQuery, autoScroll, setLogs, addLogs } = useLogsStore()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastOffsetRef = useRef(0)

  const fetchLogs = useCallback(async (reset = false) => {
    if (!sessionId) return
    try {
      const params: Record<string, string | number> = {}
      if (filter !== 'ALL') params.level = filter.toLowerCase()
      if (searchQuery) params.search = searchQuery
      params.limit = 200
      if (!reset) params.offset = lastOffsetRef.current

      const response = await getLogs(sessionId, params)
      if (response.entries?.length > 0) {
        if (reset) {
          setLogs(response.entries)
          lastOffsetRef.current = response.entries.length
        } else {
          addLogs(response.entries)
          lastOffsetRef.current += response.entries.length
        }
      }
    } catch {
      // Silently fail polling
    }
  }, [sessionId, filter, searchQuery, setLogs, addLogs])

  useEffect(() => {
    if (isConnected && sessionId) {
      fetchLogs(true)
      pollRef.current = setInterval(() => fetchLogs(false), 3000)
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      lastOffsetRef.current = 0
    }
  }, [isConnected, sessionId, fetchLogs])

  useEffect(() => {
    if (isConnected) {
      fetchLogs(true)
    }
  }, [filter, searchQuery, isConnected, fetchLogs])

  const handleDownload = useCallback(async () => {
    if (!sessionId) return
    try {
      const blob = await downloadLogs(sessionId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'latest.log'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Handle download error silently
    }
  }, [sessionId])

  return {
    logs,
    filter,
    searchQuery,
    autoScroll,
    fetchLogs,
    handleDownload,
  }
}

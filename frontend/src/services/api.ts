import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
  if (match) {
    config.headers.Authorization = `Bearer ${match[1]}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = 'token=; path=/; max-age=0'
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export async function connectSSH(credentials: {
  username: string
  host: string
  port: number
  privateKey: string
  passphrase?: string
}): Promise<{ sessionId: string; username: string; host: string; port: number; serverDir: string }> {
  const { data } = await api.post('/ssh/connect', credentials)
  return data
}

export async function disconnectSSH(sessionId: string): Promise<void> {
  await api.post('/ssh/disconnect', { sessionId })
}

export async function getServerStatus(sessionId: string) {
  const { data } = await api.get(`/server/status?sessionId=${sessionId}`)
  return data
}

export async function getShortcuts() {
  const { data } = await api.get('/server/shortcuts')
  return data
}

export async function executeShortcut(sessionId: string, action: string) {
  const { data } = await api.post('/server/execute', { sessionId, action })
  return data
}

export async function getLogs(
  sessionId: string,
  params?: { level?: string; search?: string; limit?: number; offset?: number }
) {
  const { data } = await api.get('/server/logs', {
    params: { sessionId, ...params },
  })
  return data
}

export async function downloadLogs(sessionId: string): Promise<Blob> {
  const { data } = await api.get('/server/logs/download', {
    params: { sessionId },
    responseType: 'blob',
  })
  return data
}

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
  const { data } = await api.post('/auth/connect', credentials)
  document.cookie = `token=${data.token}; path=/; max-age=900; SameSite=Strict; Secure`
  return data.connection
}

export async function disconnectSSH(): Promise<void> {
  await api.post('/auth/disconnect')
  document.cookie = 'token=; path=/; max-age=0'
}

export async function getServerStatus() {
  const { data } = await api.get('/status')
  return data
}

export async function getShortcuts() {
  const { data } = await api.get('/shortcuts')
  return data
}

export async function executeShortcut(action: string) {
  const { data } = await api.post('/shortcuts/execute', { action })
  return data
}

export async function getLogs(
  params?: { level?: string; search?: string; limit?: number; offset?: number }
) {
  const { data } = await api.get('/logs', { params })
  return data
}

export async function searchLogs(query: string) {
  const { data } = await api.get('/logs/search', { params: { q: query } })
  return data
}

export async function downloadLogs(): Promise<Blob> {
  const { data } = await api.get('/logs/download', {
    responseType: 'blob',
  })
  return data
}

export async function getSessionStatus() {
  const { data } = await api.get('/auth/status')
  return data
}

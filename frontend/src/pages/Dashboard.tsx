import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { DashboardLayout } from '../components/layout/DashboardLayout'

export function Dashboard() {
  const { isConnected } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isConnected) {
      navigate('/', { replace: true })
    }
  }, [isConnected, navigate])

  if (!isConnected) {
    return null
  }

  return <DashboardLayout />
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ToastContainer } from './components/ui/Toast'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAuthStore()
  if (!isConnected) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}

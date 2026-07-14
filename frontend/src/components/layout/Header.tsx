import { motion } from 'framer-motion'
import { Power, Wifi, WifiOff } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { isConnected, host, username, disconnect } = useAuthStore()
  const navigate = useNavigate()

  const handleDisconnect = async () => {
    await disconnect()
    navigate('/')
  }

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 glass border-b border-white/5 shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            {host || 'Minecraft Server'}
          </h2>
          {username && (
            <p className="text-xs text-text-muted">
              {username}@{host}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isConnected ? 'online' : 'offline'} pulse={isConnected}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            icon={isConnected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
            className="hidden sm:flex"
          >
            {isConnected ? 'Connected' : 'Offline'}
          </Button>
        </motion.div>

        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              icon={<Power className="w-4 h-4" />}
              onClick={handleDisconnect}
              className="text-text-muted hover:text-red-400"
            >
              Disconnect
            </Button>
          </motion.div>
        )}
      </div>
    </header>
  )
}

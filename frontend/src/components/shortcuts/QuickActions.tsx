import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { SHORTCUT_DEFINITIONS } from '../../../../shared/constants/commands'
import type { ShortcutAction } from '../../../../shared/types/shortcuts'
import { useAuthStore } from '../../stores/authStore'
import { executeShortcut } from '../../services/api'
import { ShortcutButton } from './ShortcutButton'
import { useToast } from '../ui/Toast'

export function QuickActions() {
  const { sessionId } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState<ShortcutAction | null>(null)

  const handleAction = useCallback(async (id: ShortcutAction, label: string) => {
    if (!sessionId) return
    setLoading(id)
    try {
      await executeShortcut(sessionId, id)
      toast({ type: 'success', message: `${label} executed successfully` })
    } catch {
      toast({ type: 'error', message: `Failed to execute ${label}` })
    } finally {
      setLoading(null)
    }
  }, [sessionId, toast])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {SHORTCUT_DEFINITIONS.map((shortcut) => (
          <ShortcutButton
            key={shortcut.id}
            id={shortcut.id}
            label={shortcut.label}
            icon={shortcut.icon}
            onClick={() => handleAction(shortcut.id, shortcut.label)}
            loading={loading === shortcut.id}
          />
        ))}
      </div>

      <div className="mt-8 glass-card p-5">
        <h3 className="text-sm font-medium text-text-primary mb-2">About Shortcuts</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Quick actions send predefined commands to your Minecraft server console.
          Use these shortcuts for common operations like starting, stopping, or
          saving your server. Actions are executed instantly through the SSH
          connection.
        </p>
      </div>
    </motion.div>
  )
}

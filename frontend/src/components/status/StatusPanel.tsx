import { motion } from 'framer-motion'
import {
  Activity,
  Cpu,
  MemoryStick,
  Gauge,
  Users,
  Clock,
  Globe,
  Server,
  Wifi,
  Gamepad2,
} from 'lucide-react'
import { useServerStatus } from '../../hooks/useServerStatus'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

function formatUptime(seconds?: number): string {
  if (!seconds) return 'N/A'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ') || '<1m'
}

function getTpsColor(tps?: number[]): string {
  if (!tps || tps.length === 0) return 'text-text-muted'
  const avg = tps.reduce((a, b) => a + b, 0) / tps.length
  if (avg > 18) return 'text-emerald-400'
  if (avg > 15) return 'text-amber-400'
  return 'text-red-400'
}

function getTpsValue(tps?: number[]): string {
  if (!tps || tps.length === 0) return '--'
  return tps.map((t) => t.toFixed(1)).join(', ')
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  color?: string
  className?: string
}

function StatCard({ icon, label, value, color = 'text-text-primary', className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <span className={`w-4 h-4 ${color}`}>{icon}</span>
          </div>
          <div>
            <p className="text-xs text-text-muted">{label}</p>
            <div className={`text-sm font-semibold mt-0.5 ${color}`}>
              {value}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function StatusPanel() {
  const { serverStatus } = useServerStatus()

  if (!serverStatus) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-10 h-10 text-text-muted mx-auto mb-3 animate-pulse" />
          <p className="text-text-secondary text-sm">Fetching server status...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Server className="w-4 h-4" />}
          label="Status"
          value={
            <Badge variant={serverStatus.running ? 'online' : 'offline'} pulse>
              {serverStatus.running ? 'Online' : 'Offline'}
            </Badge>
          }
          color={serverStatus.running ? 'text-emerald-400' : 'text-red-400'}
        />

        <StatCard
          icon={<Cpu className="w-4 h-4" />}
          label="CPU Usage"
          value={`${serverStatus.cpuUsage?.toFixed(1) ?? '--'}%`}
          color={serverStatus.cpuUsage && serverStatus.cpuUsage > 80 ? 'text-amber-400' : 'text-accent'}
        />

        <StatCard
          icon={<MemoryStick className="w-4 h-4" />}
          label="RAM Usage"
          value={
            serverStatus.ramUsage
              ? `${(serverStatus.ramUsage.used / 1024 / 1024).toFixed(1)}GB / ${(serverStatus.ramUsage.total / 1024 / 1024).toFixed(1)}GB`
              : '--'
          }
          color={serverStatus.ramUsage?.percent && serverStatus.ramUsage.percent > 80 ? 'text-amber-400' : 'text-accent'}
        />

        <StatCard
          icon={<Gauge className="w-4 h-4" />}
          label="TPS"
          value={getTpsValue(serverStatus.tps)}
          color={getTpsColor(serverStatus.tps)}
        />

        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Players"
          value={
            serverStatus.players
              ? `${serverStatus.players.online} / ${serverStatus.players.max}`
              : '--'
          }
          color={serverStatus.players?.online ? 'text-emerald-400' : 'text-text-muted'}
        />

        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Uptime"
          value={formatUptime(serverStatus.uptime)}
          color="text-text-primary"
        />

        <StatCard
          icon={<Globe className="w-4 h-4" />}
          label="Version"
          value={serverStatus.version || '--'}
          color="text-text-primary"
        />

        <StatCard
          icon={<Gamepad2 className="w-4 h-4" />}
          label="Server Type"
          value={serverStatus.type || '--'}
          color="text-text-primary"
        />

        <StatCard
          icon={<Wifi className="w-4 h-4" />}
          label="Port"
          value={serverStatus.port?.toString() || '--'}
          color="text-text-primary"
        />
      </div>

      {serverStatus.running && (
        <div className="mt-6 space-y-4">
          {serverStatus.cpuUsage !== undefined && (
            <div className="glass-card p-4">
              <ProgressBar
                value={serverStatus.cpuUsage}
                max={100}
                label="CPU"
                size="md"
              />
            </div>
          )}

          {serverStatus.ramUsage && (
            <div className="glass-card p-4">
              <ProgressBar
                value={serverStatus.ramUsage.used}
                max={serverStatus.ramUsage.total}
                label="RAM"
                size="md"
                color={
                  serverStatus.ramUsage.percent > 80
                    ? 'red'
                    : serverStatus.ramUsage.percent > 60
                    ? 'amber'
                    : 'accent'
                }
              />
            </div>
          )}

          {serverStatus.players && serverStatus.players.list.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Online Players ({serverStatus.players.online})
              </h3>
              <div className="flex flex-wrap gap-2">
                {serverStatus.players.list.map((player) => (
                  <span
                    key={player}
                    className="px-2.5 py-1 text-xs font-medium glass rounded-full border border-white/5 text-text-secondary"
                  >
                    {player}
                  </span>
                ))}
              </div>
            </div>
          )}

          {serverStatus.motd && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-text-primary mb-2">MOTD</h3>
              <p className="text-sm text-text-secondary font-mono">{serverStatus.motd}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

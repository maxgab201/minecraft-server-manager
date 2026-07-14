import { motion } from 'framer-motion'

type BadgeVariant = 'online' | 'offline' | 'warning' | 'info' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  pulse?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  online:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  offline:
    'bg-red-500/10 text-red-400 border-red-500/20',
  warning:
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info:
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  default:
    'bg-white/5 text-text-secondary border-white/10',
}

const pulseColors: Record<BadgeVariant, string> = {
  online: 'bg-emerald-400',
  offline: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-indigo-400',
  default: 'bg-text-muted',
}

export function Badge({
  variant = 'default',
  children,
  className = '',
  pulse = false,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        rounded-full text-xs font-medium border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColors[variant]} opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[variant]}`}
          />
        </span>
      )}
      {children}
    </motion.span>
  )
}

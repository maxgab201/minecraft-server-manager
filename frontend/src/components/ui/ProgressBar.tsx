import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'indigo' | 'amber' | 'red'
  className?: string
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const colorStyles = {
  accent: 'bg-accent',
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

const warningColor = (percent: number): string => {
  if (percent > 90) return colorStyles.red
  if (percent > 70) return colorStyles.amber
  return colorStyles.accent
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  color,
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100)
  const barColor = color || warningColor(percent)

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-text-primary">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor} shadow-lg`}
          style={{
            boxShadow: percent > 0 ? `0 0 8px ${color === 'indigo' ? 'rgba(99,102,241,0.4)' : 'rgba(0,212,170,0.3)'}` : undefined,
          }}
        />
      </div>
    </div>
  )
}

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  htmlType?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-surface hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-accent/30',
  secondary:
    'glass glass-hover text-text-primary',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass-hover border-transparent',
  danger:
    'bg-accent-red/10 text-accent-red hover:bg-accent-red/20 border-accent-red/20 hover:border-accent-red/40',
  icon:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass-hover border-transparent rounded-lg',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({
    variant = 'secondary',
    size = 'md',
    loading = false,
    icon,
    disabled,
    className = '',
    children,
    htmlType = 'button',
    onClick,
    onMouseEnter,
    onMouseLeave,
  }, ref) {
    const isIconOnly = variant === 'icon' && !children
    const sizeClass = isIconOnly ? iconOnlySizes[size] : sizeStyles[size]

    return (
      <motion.button
        ref={ref}
        type={htmlType}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          border transition-all duration-200 ease
          disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
          ${variantStyles[variant]}
          ${sizeClass}
          ${children ? 'min-w-[80px]' : ''}
          ${className}
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </motion.button>
    )
  }
)

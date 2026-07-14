import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  hover?: boolean
  onClick?: () => void
}

export function Card({
  children,
  className = '',
  header,
  footer,
  hover = true,
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        glass-card overflow-hidden
        ${hover && !onClick ? 'glass-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {header && (
        <div className="px-5 py-4 border-b border-white/5">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
          {footer}
        </div>
      )}
    </motion.div>
  )
}

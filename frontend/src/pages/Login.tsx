import { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  User,
  Globe,
  Lock,
  KeyRound,
  Upload,
  X,
  ArrowRight,
  Terminal,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function Login() {
  const {
    form,
    formErrors,
    keyFileName,
    connecting,
    error,
    updateField,
    handleFileUpload,
    handleSubmit,
    clearFile,
  } = useAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      handleFileUpload(file)
    },
    [handleFileUpload]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0] || null
      if (file && (file.name.endsWith('.pem') || file.name.endsWith('.key') || file.name.includes('id_'))) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField />

      <div className="fixed inset-0 bg-grid opacity-50" />
      <div className="fixed inset-0 bg-glow" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4 border border-accent/20 shadow-lg shadow-accent/10">
            <Server className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Minecraft Server Manager</h1>
          <p className="text-text-muted text-sm mt-2">
            Connect to your server via SSH
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <Input
                label="Username"
                type="text"
                placeholder="root"
                icon={<User className="w-4 h-4" />}
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                error={formErrors.username}
                autoComplete="username"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Host"
                  type="text"
                  placeholder="your-server.com"
                  icon={<Globe className="w-4 h-4" />}
                  value={form.host}
                  onChange={(e) => updateField('host', e.target.value)}
                  error={formErrors.host}
                  autoComplete="host"
                />
              </div>
              <div className="w-24 shrink-0">
                <Input
                  label="Port"
                  type="number"
                  placeholder="22"
                  value={form.port}
                  onChange={(e) => updateField('port', e.target.value)}
                  error={formErrors.port}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                SSH Private Key
              </label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`
                  relative glass-input rounded-lg transition-all duration-200
                  ${dragOver ? 'border-accent/50 bg-accent/5' : ''}
                  ${formErrors.privateKey ? 'glass-input-error' : ''}
                `}
              >
                {keyFileName ? (
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <KeyRound className="w-4 h-4 text-accent shrink-0" />
                    <span className="flex-1 text-sm text-text-primary truncate">
                      {keyFileName}
                    </span>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <Upload className="w-6 h-6 text-text-muted mb-2" />
                    <p className="text-xs text-text-muted text-center">
                      <span className="text-accent">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-[10px] text-text-muted/60 mt-1">
                      id_rsa, id_ed25519, *.pem, *.key
                    </p>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pem,.key,.txt,id_rsa,id_ed25519,id_ecdsa"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>
              {formErrors.privateKey && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-accent-red"
                >
                  {formErrors.privateKey}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Passphrase (optional)"
                type="password"
                placeholder="Enter passphrase"
                icon={<Lock className="w-4 h-4" />}
                value={form.passphrase}
                onChange={(e) => updateField('passphrase', e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                htmlType="submit"
                variant="primary"
                size="lg"
                loading={connecting}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-text-muted mt-6"
        >
          Your connection is secured via SSH
        </motion.p>
      </motion.div>
    </div>
  )
}

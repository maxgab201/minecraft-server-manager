import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { validateSSHForm } from '../utils/validators'
import { parseSSHKey, formatKeyName } from '../utils/ssh-key-parser'
import type { SSHCredentials } from '../../../shared/types/ssh'

export interface LoginFormState {
  username: string
  host: string
  port: string
  privateKey: string
  passphrase: string
}

export interface LoginFormErrors {
  username?: string
  host?: string
  port?: string
  privateKey?: string
  passphrase?: string
}

export function useAuth() {
  const navigate = useNavigate()
  const { connect, connecting, error, setError, isConnected } = useAuthStore()

  const [form, setForm] = useState<LoginFormState>({
    username: '',
    host: '',
    port: '22',
    privateKey: '',
    passphrase: '',
  })

  const [formErrors, setFormErrors] = useState<LoginFormErrors>({})
  const [keyFileName, setKeyFileName] = useState<string | null>(null)

  const updateField = useCallback(<K extends keyof LoginFormState>(
    field: K,
    value: LoginFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    if (error) setError(null)
  }, [error, setError])

  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, privateKey: '' }))
      setKeyFileName(null)
      return
    }

    setKeyFileName(formatKeyName(file.name))

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setForm((prev) => ({ ...prev, privateKey: content }))

      const parsed = parseSSHKey(content)
      if (!parsed.valid) {
        setFormErrors((prev) => ({ ...prev, privateKey: parsed.error || 'Invalid key format' }))
      } else {
        setFormErrors((prev) => ({ ...prev, privateKey: undefined }))
      }
    }
    reader.onerror = () => {
      setFormErrors((prev) => ({ ...prev, privateKey: 'Failed to read file' }))
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleSubmit = useCallback(async () => {
    const validation = validateSSHForm(
      form.username,
      form.host,
      parseInt(form.port, 10) || 22,
      form.privateKey
    )

    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    const credentials: SSHCredentials = {
      username: form.username.trim(),
      host: form.host.trim(),
      port: parseInt(form.port, 10) || 22,
      privateKey: form.privateKey.trim(),
      passphrase: form.passphrase.trim() || undefined,
    }

    try {
      await connect(credentials)
      if (!error) {
        navigate('/dashboard')
      }
    } catch {
      // Error already set in store
    }
  }, [form, connect, navigate, error])

  const clearFile = useCallback(() => {
    setForm((prev) => ({ ...prev, privateKey: '' }))
    setKeyFileName(null)
  }, [])

  return {
    form,
    formErrors,
    keyFileName,
    connecting,
    error,
    isConnected,
    updateField,
    handleFileUpload,
    handleDrop,
    handleSubmit,
    clearFile,
    setError,
  }
}

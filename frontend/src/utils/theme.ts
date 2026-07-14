export const colors = {
  surface: '#0a0a0f',
  surfaceLight: '#11111a',
  glass: 'rgba(255,255,255,0.04)',
  glassHover: 'rgba(255,255,255,0.08)',
  glassActive: 'rgba(255,255,255,0.12)',
  accent: '#00d4aa',
  indigo: '#6366f1',
  amber: '#f59e0b',
  red: '#ef4444',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.12)',
} as const

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const animations = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ErrorBoundary } from '@/components/error-boundary'

import { GlassApp } from './glass-app'
import './glass.css'

/**
 * Boot the glass mini-overlay (`?win=glass`). Same bundle as the main app,
 * minimal transparent surface: no shell, no gateway — the main renderer
 * pushes transcript snapshots over IPC and this window only renders them.
 */
export function mountGlass(): void {
  const style = document.createElement('style')
  style.textContent = 'html,body,#root{background:transparent !important;}'
  document.head.appendChild(style)

  const root = document.getElementById('root')

  if (!root) {
    return
  }

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary label="glass">
        <GlassApp />
      </ErrorBoundary>
    </StrictMode>
  )
}

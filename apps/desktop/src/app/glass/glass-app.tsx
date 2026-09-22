import { useEffect, useState } from 'react'

interface GlassViewState {
  hearing: string
  saying: string
  status: 'idle' | 'listening' | 'thinking' | 'speaking'
}

const EMPTY: GlassViewState = { hearing: '', saying: '', status: 'idle' }
const PIN_KEY = 'orin.glass.pinned.v1'

const STATUS_DOT: Record<GlassViewState['status'], string> = {
  idle: '#a8a29e',
  listening: '#22d3ee',
  thinking: '#f59e0b',
  speaking: '#a78bfa'
}

const STATUS_LABEL: Record<GlassViewState['status'], string> = {
  idle: 'Orin',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…'
}

/**
 * Glassmorphism mini overlay: the live voice transcript (what was heard /
 * what is being said). The whole card drags the window; pin toggles
 * always-on-top; × closes back to the main app.
 */
export function GlassApp() {
  const [view, setView] = useState<GlassViewState>(EMPTY)
  const [pinned, setPinned] = useState(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY)
      return raw === null ? true : raw === '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    const off = window.hermesDesktop?.onGlassState?.(payload => {
      setView({
        hearing: typeof payload?.hearing === 'string' ? payload.hearing : '',
        saying: typeof payload?.saying === 'string' ? payload.saying : '',
        status:
          payload?.status === 'listening' ||
          payload?.status === 'thinking' ||
          payload?.status === 'speaking'
            ? payload.status
            : 'idle'
      })
    })
    return () => {
      try {
        off?.()
      } catch {
        // ignore
      }
    }
  }, [])

  // Apply the persisted pin on mount (main defaults to pinned anyway).
  useEffect(() => {
    void window.hermesDesktop?.glassSetPinned?.(pinned).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const togglePin = () => {
    const next = !pinned
    setPinned(next)
    try {
      localStorage.setItem(PIN_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
    void window.hermesDesktop?.glassSetPinned?.(next).catch(() => undefined)
  }

  const close = () => {
    try {
      window.hermesDesktop?.glassClose?.()
    } catch {
      // main closes + notifies; nothing more to do here
    }
  }

  return (
    <div className="glass-shell">
      <div className="glass-card">
        <div className="glass-top">
          <span
            className={`glass-orb glass-orb--${view.status}`}
            style={{ background: STATUS_DOT[view.status] }}
          />
          <span className="glass-status">{STATUS_LABEL[view.status]}</span>
          <span className="glass-spacer" />
          <button
            aria-label={pinned ? 'Unpin (allow other windows above)' : 'Pin on top'}
            aria-pressed={pinned}
            className={`glass-btn${pinned ? ' glass-btn--on' : ''}`}
            onClick={togglePin}
            type="button"
          >
            {pinned ? 'Pinned' : 'Pin'}
          </button>
          <button aria-label="Close glass mode" className="glass-btn" onClick={close} type="button">
            ×
          </button>
        </div>
        <div className="glass-body">
          {view.hearing ? <p className="glass-hearing">{view.hearing}</p> : null}
          {view.saying ? (
            <p className="glass-saying">{view.saying}</p>
          ) : !view.hearing ? (
            <p className="glass-empty">Say “hey orin”…</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

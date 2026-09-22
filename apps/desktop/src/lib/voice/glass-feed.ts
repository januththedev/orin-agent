import { useEffect, useRef } from 'react'

import { atom } from 'nanostores'
import { useStore } from '@nanostores/react'

import { chatMessageText } from '@/lib/chat-messages'
import { $messages } from '@/store/session'
import { $voicePlayback } from '@/store/voice-playback'
import { $wakeWord } from '@/store/wake-word'

export type GlassStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface GlassFeedState {
  hearing: string
  saying: string
  status: GlassStatus
}

/** Whether the glass overlay window is open (main renderer side). */
export const $glassOpen = atom(false)

const HEARING_CHARS = 160
const SAYING_CHARS = 220

function sliceTail(text: string, max: number): string {
  const t = text.trim()
  return t.length > max ? `…${t.slice(-max)}` : t
}

/** Latest user + assistant turn, trimmed for the mini overlay. */
export function buildGlassState(): GlassFeedState {
  const messages = $messages.get()
  let hearing = ''
  let saying = ''
  let thinking = false

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.hidden) continue
    if (!saying && m.role === 'assistant') {
      saying = sliceTail(chatMessageText(m), SAYING_CHARS)
      thinking = m.pending === true
      if (hearing) break
    } else if (!hearing && m.role === 'user') {
      hearing = sliceTail(chatMessageText(m), HEARING_CHARS)
      if (saying) break
    }
  }

  const playback = $voicePlayback.get()
  const wake = $wakeWord.get()
  const status: GlassStatus =
    playback.status === 'speaking'
      ? 'speaking'
      : thinking
        ? 'thinking'
        : wake.listening
          ? 'listening'
          : 'idle'

  return { hearing, saying, status }
}

/** Push the snapshot to the glass window (no-op when closed/absent). */
export function pushGlassState(state: GlassFeedState): void {
  try {
    window.hermesDesktop?.glassPushState?.(state)
  } catch {
    // Glass IPC is best-effort; the main window must never break for it.
  }
}

export async function openGlass(): Promise<void> {
  try {
    await window.hermesDesktop?.glassOpen?.()
  } finally {
    $glassOpen.set(true)
    pushGlassState(buildGlassState())
  }
}

export async function closeGlass(): Promise<void> {
  $glassOpen.set(false)
  try {
    await window.hermesDesktop?.glassClose?.()
  } catch {
    // already gone
  }
}

/**
 * Mount once (app shell): mirror the voice-visible transcript into the
 * glass overlay whenever it changes. Subscribes to the message + playback +
 * wake stores; pushes only while the overlay is open, and only on change.
 */
export function useGlassFeedPush(): void {
  const messages = useStore($messages)
  const playback = useStore($voicePlayback)
  const wake = useStore($wakeWord)
  const open = useStore($glassOpen)
  const lastSent = useRef('')

  useEffect(() => {
    if (!open) {
      lastSent.current = ''
      return
    }

    const state = buildGlassState()
    const key = JSON.stringify(state)

    if (key !== lastSent.current) {
      lastSent.current = key
      pushGlassState(state)
    }
  }, [messages, playback, wake, open])

  // The overlay's × button closes from its side — mirror it into the atom
  // so the menu checkbox stays truthful.
  useEffect(() => {
    const off = window.hermesDesktop?.onGlassClosed?.(() => $glassOpen.set(false))
    return () => {
      try {
        off?.()
      } catch {
        // ignore
      }
    }
  }, [])
}

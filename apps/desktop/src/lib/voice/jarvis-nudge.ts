import { persistBoolean, storedBoolean } from '@/lib/storage'
import { notify } from '@/store/notifications'

import { openGlass } from './glass-feed'

const NUDGED_KEY = 'orin.jarvis-nudged.v1'
const NUDGE_DELAY_MS = 10_000

/**
 * One-time Jarvis hello: shortly after first launch, point at the
 * hands-free loop (wake word → voice answer → glass transcript) with a
 * toast whose action opens glass mode immediately. Never nags twice, never
 * fires where there is no mic to listen with.
 */
export function maybeShowJarvisNudge(): void {
  try {
    if (storedBoolean(NUDGED_KEY, false)) return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return

    window.setTimeout(() => {
      try {
        if (storedBoolean(NUDGED_KEY, false)) return
        persistBoolean(NUDGED_KEY, true)
        notify({
          kind: 'info',
          title: 'Hands-free Orin is ready',
          message:
            'Say “hey orin” any time — I’ll listen, answer out loud, and keep a glass transcript. Works best with the mini overlay open.',
          durationMs: 14_000,
          action: {
            label: 'Open glass mode',
            onClick: () => {
              void openGlass()
            }
          }
        })
      } catch {
        // A missed hello is not worth an error surface.
      }
    }, NUDGE_DELAY_MS)
  } catch {
    // storage unavailable — stay silent
  }
}

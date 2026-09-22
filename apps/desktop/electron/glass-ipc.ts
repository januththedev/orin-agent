// IPC surface for the glass mini-overlay (translucent transcript window).
// Extracted like pet-overlay-ipc.ts; window handles stay injected because
// main.ts owns their lifecycle.
import { type BrowserWindow, ipcMain } from 'electron'

/**
 * What the glass mini-overlay shows. Pushed main-renderer → glass window
 * whenever the voice-visible transcript changes (and only while open).
 */
export interface GlassState {
  /** Latest user message (what was heard), trimmed for the mini view. */
  hearing: string
  /** Latest assistant message (what is being said), trimmed. */
  saying: string
  status: 'idle' | 'listening' | 'thinking' | 'speaking'
}

export interface GlassIpcDeps {
  getMainWindow: () => BrowserWindow | null
  getGlassWindow: () => BrowserWindow | null
  openGlass: () => void
  closeGlass: () => void
  setGlassPinned: (pinned: boolean) => boolean
}

export function registerGlassIpc({
  getMainWindow,
  getGlassWindow,
  openGlass,
  closeGlass,
  setGlassPinned
}: GlassIpcDeps): void {
  ipcMain.handle('hermes:glass:open', async () => {
    openGlass()
    return { ok: true }
  })
  ipcMain.handle('hermes:glass:close', async () => {
    closeGlass()
    return { ok: true }
  })
  ipcMain.handle('hermes:glass:set-pinned', async (_event, raw) => {
    const pinned = setGlassPinned(raw?.pinned !== false)
    return { ok: true, pinned }
  })
  // Main renderer → glass: forward the latest transcript snapshot.
  ipcMain.on('hermes:glass:state', (_event, payload) => {
    const win = getGlassWindow()

    if (win && !win.isDestroyed()) {
      win.webContents.send('hermes:glass:state', payload)
    }
  })
  // Glass → main renderer: user hit the × button (window already closing).
  ipcMain.on('hermes:glass:closed', () => {
    const main = getMainWindow()

    if (main && !main.isDestroyed()) {
      main.webContents.send('hermes:glass:closed')
    }
  })
}

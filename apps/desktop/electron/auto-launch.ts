/**
 * OS auto-launch ("start Orin Agent with your computer").
 *
 * Windows/macOS use Electron's `app.setLoginItemSettings` /
 * `app.getLoginItemSettings`. Linux writes a freedesktop autostart entry
 * (`~/.config/autostart/orin-agent.desktop`). All filesystem/process access
 * flows through the injected deps so the pure parts stay unit-testable and
 * main.ts stays a thin wiring layer.
 */

export interface AutoLaunchDeps {
  platform: NodeJS.Platform
  execPath: string
  getLoginItemSettings: (options?: { path?: string; args?: string[] }) => { openAtLogin: boolean }
  setLoginItemSettings: (options: { openAtLogin: boolean; path?: string; args?: string[] }) => void
  homedir: () => string
  mkdirSync: (dir: string, opts?: { recursive?: boolean }) => void
  writeFileSync: (file: string, data: string, opts?: { mode?: number }) => void
  unlinkSync: (file: string) => void
  existsSync: (file: string) => boolean
}

export const AUTOSTART_FILE = 'orin-agent.desktop'

export function autostartDir(homedir: string): string {
  return `${homedir}/.config/autostart`
}

export function autostartFile(homedir: string): string {
  return `${autostartDir(homedir)}/${AUTOSTART_FILE}`
}

/** Freedesktop entry. `terminal=false` keeps it a GUI launch. */
export function desktopFileContent(execPath: string): string {
  const safe = execPath.replace(/"/g, '');
  return [
    '[Desktop Entry]',
    'Type=Application',
    'Name=Orin Agent',
    'Comment=Orin Agent desktop assistant',
    `Exec="${safe}"`,
    'Terminal=false',
    'Categories=Utility;',
    'X-GNOME-Autostart-enabled=true',
    ''
  ].join('\n')
}

export function getAutoLaunch(deps: AutoLaunchDeps): boolean {
  if (deps.platform === 'linux') {
    return deps.existsSync(autostartFile(deps.homedir()))
  }
  try {
    return deps.getLoginItemSettings().openAtLogin === true
  } catch {
    return false
  }
}

export function setAutoLaunch(deps: AutoLaunchDeps, enabled: boolean): boolean {
  if (deps.platform === 'linux') {
    const file = autostartFile(deps.homedir())
    if (enabled) {
      deps.mkdirSync(autostartDir(deps.homedir()), { recursive: true })
      deps.writeFileSync(file, desktopFileContent(deps.execPath), { mode: 0o644 })
    } else {
      try {
        if (deps.existsSync(file)) deps.unlinkSync(file)
      } catch {
        // already gone
      }
    }
    return getAutoLaunch(deps)
  }
  deps.setLoginItemSettings({ openAtLogin: enabled })
  return getAutoLaunch(deps)
}

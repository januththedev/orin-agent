import { describe, expect, it } from 'vitest'

import { autostartDir, autostartFile, desktopFileContent } from './auto-launch'

describe('auto-launch linux autostart entry', () => {
  it('points at the app executable with GUI flags', () => {
    const content = desktopFileContent('/opt/Orin Agent/orin-agent')
    expect(content).toContain('[Desktop Entry]')
    expect(content).toContain('Name=Orin Agent')
    expect(content).toContain('Terminal=false')
    expect(content).toContain('X-GNOME-Autostart-enabled=true')
  })

  it('strips quotes from the exec path', () => {
    expect(desktopFileContent('"/opt/app"')).toContain('Exec="/opt/app"')
  })

  it('lives under ~/.config/autostart', () => {
    expect(autostartDir('/home/you')).toBe('/home/you/.config/autostart')
    expect(autostartFile('/home/you')).toBe('/home/you/.config/autostart/orin-agent.desktop')
  })
})

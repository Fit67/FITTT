import { defaultTheme }    from './default'
import { pharmacyTheme }   from './pharmacy'
import { restaurantTheme } from './restaurant'
import { gymTheme }        from './gym'

export const themes = {
  default:    defaultTheme,
  pharmacy:   pharmacyTheme,
  restaurant: restaurantTheme,
  gym:        gymTheme,
} as const

export type ThemeId = keyof typeof themes

type AnyTheme = (typeof themes)[ThemeId]

export function getTheme(id: string): AnyTheme {
  return (themes as Record<string, AnyTheme>)[id] ?? themes.default
}

// ─── CSS variable injector ─────────────────────────────────────
export function applyTheme(themeId: string, dark = false): void {
  const theme = getTheme(themeId)
  const root  = document.documentElement

  // ── Primary palette — swap to dark overrides when in dark mode ──
  const darkData = dark && 'dark' in theme
    ? (theme as any).dark
    : null

  const primary = (darkData?.primary) ?? theme.colors.primary
  for (const [shade, value] of Object.entries(primary)) {
    root.style.setProperty(`--color-primary-${shade}`, value as string)
  }

  // ── Accent ──
  const accent      = darkData?.accent      ?? theme.colors.accent
  const accentLight = darkData?.accentLight ?? theme.colors.accentLight
  root.style.setProperty('--color-accent',       accent)
  root.style.setProperty('--color-accent-light',  accentLight)

  // ── Surfaces ──
  root.style.setProperty('--color-surface',
    darkData?.surface         ?? theme.colors.surface)
  root.style.setProperty('--color-surface-raised',
    darkData?.surfaceRaised   ?? theme.colors.surfaceRaised)
  root.style.setProperty('--color-surface-overlay',
    darkData?.surfaceOverlay  ?? theme.colors.surfaceOverlay)

  // ── Typography ──
  root.style.setProperty('--font-display', theme.fonts.display)
  root.style.setProperty('--font-body',    theme.fonts.body)
  root.style.setProperty('--font-mono',    theme.fonts.mono)

  // ── Radii ──
  root.style.setProperty('--radius-card',   theme.radius.card)
  root.style.setProperty('--radius-button', theme.radius.button)
  root.style.setProperty('--radius-badge',  theme.radius.badge)

  // ── Shadows ──
  root.style.setProperty('--shadow-card',       theme.shadows.card)
  root.style.setProperty('--shadow-card-hover',  theme.shadows.cardHover)
  root.style.setProperty('--shadow-modal',       theme.shadows.modal)
  root.style.setProperty('--shadow-input',       theme.shadows.input)

  // ── Gradient mesh ──
  const mesh = darkData?.gradientMesh ?? theme.gradientMesh
  root.style.setProperty('--gradient-mesh', mesh)
}

export function getGoogleFontsUrl(themeId: string): string {
  const theme = getTheme(themeId)
  return `https://fonts.googleapis.com/css2?family=${theme.fonts.googleFonts}&display=swap`
}

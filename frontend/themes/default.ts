// themes/default.ts
// Supermarket / general-purpose theme
export const defaultTheme = {
  id: 'default',
  name: 'Default',
  description: 'Clean, modern theme with green primary palette.',

  // ─── Color Palettes (RGB values for Tailwind opacity modifiers) ─
  colors: {
    primary: {
      50:  '255 251 235',
      100: '254 243 199',
      200: '253 230 138',
      300: '252 211 77',
      400: '251 191 36',
      500: '245 158 11',
      600: '217 119 6',
      700: '180 83 9',
      800: '146 64 14',
      900: '120 53 15',
    },
    accent:      '250 204 21',  // yellow-400
    accentLight: '253 224 71', // yellow-300
    surface:        '5 5 5',
    surfaceRaised:  '15 15 15',
    surfaceOverlay: '25 25 25',
  },

  // ─── Typography ─────────────────────────────────────────────
  fonts: {
    display: '"Cairo", system-ui, sans-serif',
    body:    '"Cairo", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    // Google Fonts import string
    googleFonts: 'Cairo:wght@400;600;700;800',
  },

  // ─── Radii ──────────────────────────────────────────────────
  radius: {
    card:   '16px',
    button: '10px',
    badge:  '100px',
    input:  '10px',
  },

  // ─── Shadows ────────────────────────────────────────────────
  shadows: {
    card:      '0 1px 4px 0 rgba(0,0,0,.5), 0 4px 16px 0 rgba(0,0,0,.5)',
    cardHover: '0 8px 32px 0 rgba(217,119,6,.15)',
    modal:     '0 20px 80px -10px rgba(0,0,0,.8)',
    input:     '0 0 0 3px rgba(217,119,6,.2)',
  },

  // ─── Gradient Mesh ──────────────────────────────────────────
  gradientMesh:
    'radial-gradient(at 50% 0%, hsla(45, 90%, 15%, 1) 0px, transparent 60%), ' +
    'radial-gradient(at 0% 0%, hsla(35, 90%, 10%, 1) 0px, transparent 50%), ' +
    'radial-gradient(at 100% 0%, hsla(35, 90%, 10%, 1) 0px, transparent 50%)',

  // ─── Dark Mode overrides ────────────────────────────────────
  dark: {
    surface:        '5 5 5',
    surfaceRaised:  '15 15 15',
    surfaceOverlay: '25 25 25',
    gradientMesh:
      'radial-gradient(at 50% 0%, hsla(45, 90%, 15%, 1) 0px, transparent 60%), ' +
      'radial-gradient(at 0% 0%, hsla(35, 90%, 10%, 1) 0px, transparent 50%), ' +
      'radial-gradient(at 100% 0%, hsla(35, 90%, 10%, 1) 0px, transparent 50%)',
  },
}

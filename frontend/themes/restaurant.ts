export const restaurantTheme = {
  id: 'restaurant',
  name: 'Saveur',
  description: 'Warm, appetizing theme for restaurants and food delivery.',

  colors: {
    primary: {
      50:  '255 247 237',
      100: '255 237 213',
      200: '254 215 170',
      300: '253 186 116',
      400: '251 146 60',
      500: '249 115 22',
      600: '234 88  12',   // ← primary
      700: '194 65  12',
      800: '154 52  18',
      900: '124 45  18',
    },
    accent:      '239 68  68',    // red-500
    accentLight: '254 202 202',   // red-200
    surface:        '255 255 255',
    surfaceRaised:  '255 251 245',
    surfaceOverlay: '255 247 237',
  },

  fonts: {
    display: '"Fraunces", Georgia, serif',
    body:    '"Plus Jakarta Sans", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    googleFonts: 'Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600',
  },

  radius: {
    card:   '20px',
    button: '100px',  // pill buttons
    badge:  '100px',
    input:  '12px',
  },

  shadows: {
    card:      '0 2px 8px 0 rgba(0,0,0,.06), 0 6px 24px 0 rgba(0,0,0,.06)',
    cardHover: '0 12px 40px 0 rgba(234,88,12,.15)',
    modal:     '0 20px 60px -10px rgba(0,0,0,.25)',
    input:     '0 0 0 3px rgba(234,88,12,.15)',
  },

  gradientMesh:
    'radial-gradient(at 40% 20%, hsla(28,90%,93%,1) 0px, transparent 50%), ' +
    'radial-gradient(at 80% 0%,  hsla(0, 80%,95%,1) 0px, transparent 50%), ' +
    'radial-gradient(at 0%  60%, hsla(40,80%,94%,1) 0px, transparent 50%)',

  dark: {
    surface:        '20  12  2',
    surfaceRaised:  '35  22  8',
    surfaceOverlay: '50  33  14',
    gradientMesh:
      'radial-gradient(at 40% 20%, hsla(25,50%,12%,1) 0px, transparent 50%), ' +
      'radial-gradient(at 80% 0%,  hsla(0, 40%,12%,1) 0px, transparent 50%)',
  },
}

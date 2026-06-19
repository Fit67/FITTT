export const gymTheme = {
  id: 'gym',
  name: 'VITRAPRO',
  description: 'VITRAPRO crimson red fitness theme.',

  colors: {
    primary: {
      50:  '254 242 242',
      100: '254 226 226',
      200: '254 202 202',
      300: '252 165 165',
      400: '248 113 113',
      500: '220 38  38',    // crimson red — primary
      600: '185 28  28',    // ← darker primary
      700: '153 27  27',
      800: '127 29  29',
      900: '105 25  25',
    },
    accent:      '185 28  28',    // deep crimson
    accentLight: '248 113 113',
    surface:        '255 255 255',  // white
    surfaceRaised:  '249 250 251',  // gray-50
    surfaceOverlay: '243 244 246',  // gray-100
  },

  fonts: {
    display: '"Outfit", "Inter", system-ui, sans-serif',
    body:    '"Inter", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    googleFonts: 'Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900',
  },

  radius: {
    card:   '12px',
    button: '50px',
    badge:  '6px',
    input:  '8px',
  },

  shadows: {
    card:      '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px 0 rgba(0,0,0,.04)',
    cardHover: '0 10px 30px -6px rgba(0,0,0,.1), 0 4px 12px -2px rgba(0,0,0,.06)',
    modal:     '0 20px 40px -8px rgba(0,0,0,.15)',
    input:     '0 0 0 3px rgba(185,28,28,.15)',
  },

  gradientMesh:
    'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',

  dark: {
    primary: {
      50:  '30  15  15',
      100: '50  20  20',
      200: '80  30  30',
      300: '220 50  50',
      400: '239 68  68',
      500: '239 68  68',
      600: '248 113 113',
      700: '252 165 165',
      800: '254 202 202',
      900: '254 226 226',
    },
    accent:      '239 68  68',
    accentLight: '248 113 113',
    surface:        '10  10  10',
    surfaceRaised:  '17  17  17',
    surfaceOverlay: '24  24  24',
    gradientMesh:
      'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
  },
}

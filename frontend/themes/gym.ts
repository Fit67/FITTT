export const gymTheme = {
  id: 'gym',
  name: 'IronFuel',
  description: 'High-energy, dark-first theme for gyms and supplement stores.',

  colors: {
    primary: {
      50:  '255 247 237',
      100: '255 237 213',
      200: '254 215 170',
      300: '253 186 116',
      400: '251 146 60',
      500: '234 179 8',    // yellow-500 — makes sense for gym energy
      600: '202 138 4',    // ← primary
      700: '161 98  7',
      800: '133 77  14',
      900: '113 63  18',
    },
    accent:      '239 68  68',    // red-500 — power
    accentLight: '254 202 202',
    surface:        '255 255 255',  // white
    surfaceRaised:  '249 250 251',  // gray-50
    surfaceOverlay: '243 244 246',  // gray-100
  },

  fonts: {
    display: '"Barlow Condensed", "Helvetica Neue", sans-serif',
    body:    '"Barlow", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    googleFonts: 'Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600',
  },

  radius: {
    card:   '8px',
    button: '6px',
    badge:  '4px',
    input:  '6px',
  },

  shadows: {
    card:      '0 2px 8px 0 rgba(0,0,0,.4)',
    cardHover: '0 8px 32px 0 rgba(202,138,4,.2)',
    modal:     '0 24px 80px -12px rgba(0,0,0,.8)',
    input:     '0 0 0 2px rgba(202,138,4,.4)',
  },

  gradientMesh:
    'radial-gradient(at 30% 30%, hsla(43,80%,95%,1)  0px, transparent 50%), ' +
    'radial-gradient(at 80% 10%, hsla(0, 60%,98%,1)  0px, transparent 50%)',

  // Gym theme is dark by default — same values for both modes
  dark: {
    surface:        '9   9   11',
    surfaceRaised:  '24  24  27',
    surfaceOverlay: '39  39  42',
    gradientMesh:
      'radial-gradient(at 30% 30%, hsla(43,80%,12%,1) 0px, transparent 50%), ' +
      'radial-gradient(at 80% 10%, hsla(0, 60%,10%,1) 0px, transparent 50%)',
  },
}

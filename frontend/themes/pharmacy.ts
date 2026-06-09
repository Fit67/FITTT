export const pharmacyTheme = {
  id: 'pharmacy',
  name: 'MedCare',
  description: 'Clinical, trustworthy theme for pharmacies and health stores.',

  colors: {
    primary: {
      50:  '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96  165 250',
      500: '59  130 246',
      600: '37  99  235',  // ← primary
      700: '29  78  216',
      800: '30  64  175',
      900: '30  58  138',
    },
    accent:      '20  184 166',   // teal-500
    accentLight: '153 246 228',   // teal-200
    surface:        '255 255 255',
    surfaceRaised:  '248 250 252',
    surfaceOverlay: '241 245 249',
  },

  fonts: {
    display: '"Inter Tight", Inter, sans-serif',
    body:    '"Inter", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    googleFonts: 'Inter+Tight:wght@600;700;800&family=Inter:wght@300;400;500;600',
  },

  radius: {
    card:   '12px',
    button: '8px',
    badge:  '6px',
    input:  '8px',
  },

  shadows: {
    card:      '0 1px 2px 0 rgba(0,0,0,.05), 0 4px 12px 0 rgba(0,0,0,.04)',
    cardHover: '0 8px 24px 0 rgba(37,99,235,.12)',
    modal:     '0 20px 60px -10px rgba(0,0,0,.22)',
    input:     '0 0 0 3px rgba(37,99,235,.15)',
  },

  gradientMesh:
    'radial-gradient(at 40% 20%, hsla(214,80%,95%,1) 0px, transparent 50%), ' +
    'radial-gradient(at 80% 0%,  hsla(174,60%,94%,1) 0px, transparent 50%)',

  dark: {
    surface:        '15  23  42',
    surfaceRaised:  '30  41  59',
    surfaceOverlay: '51  65  85',
    gradientMesh:
      'radial-gradient(at 40% 20%, hsla(220,50%,15%,1) 0px, transparent 50%), ' +
      'radial-gradient(at 80% 0%,  hsla(180,30%,12%,1) 0px, transparent 50%)',
  },
}

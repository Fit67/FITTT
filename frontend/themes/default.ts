// themes/default.ts — DoctorFit editorial redesign
// Light: white / sky-blue / blue  |  Dark: exact editorial (#0a0a0a + gold)
export const defaultTheme = {
  id: 'default',
  name: 'DoctorFit Editorial',
  description: 'Editorial typography, blue-light / dark-gold duotone.',

  colors: {
    primary: {
      50:  '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96  165 250',
      500: '59  130 246',
      600: '37  99  235',
      700: '29  78  216',
      800: '30  64  175',
      900: '30  58  138',
    },
    accent:      '14  165 233',
    accentLight: '125 211 252',
    surface:        '255 255 255',
    surfaceRaised:  '248 250 252',
    surfaceOverlay: '241 245 249',
  },

  fonts: {
    display: '"Instrument Serif", Georgia, serif',
    body:    '"DM Sans", system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
    googleFonts: 'Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700',
  },

  radius: {
    card:   '4px',
    button: '0px',
    badge:  '2px',
    input:  '0px',
  },

  shadows: {
    card:      '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px 0 rgba(0,0,0,.04)',
    cardHover: '0 10px 30px -6px rgba(37,99,235,.14)',
    modal:     '0 20px 40px -8px rgba(0,0,0,.15)',
    input:     '0 0 0 3px rgba(37,99,235,.18)',
  },

  gradientMesh:
    'radial-gradient(at 0% 0%, hsla(210, 100%, 96%, 1) 0px, transparent 55%), ' +
    'radial-gradient(at 100% 0%, hsla(199, 100%, 94%, 1) 0px, transparent 50%), ' +
    'radial-gradient(at 50% 100%, hsla(220, 60%, 97%, 1) 0px, transparent 60%)',

  dark: {
    surface:        '10  10  10',
    surfaceRaised:  '14  14  14',
    surfaceOverlay: '20  20  20',
    // Override primary in dark to gold
    primary: {
      50:  '20  20  20',
      100: '30  30  30',
      200: '42  42  42',
      300: '100 75  35',
      400: '150 105 52',
      500: '200 130 42',
      600: '200 130 42',
      700: '168 102 30',
      800: '133 77  18',
      900: '100 55  10',
    },
    accent:      '200 130 42',
    accentLight: '220 160 80',
    gradientMesh:
      'radial-gradient(at 40% 20%, hsla(38, 60%, 10%, 1) 0px, transparent 55%), ' +
      'radial-gradient(at 80% 0%, hsla(30, 80%, 6%, 1) 0px, transparent 50%), ' +
      'linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 100%)',
  },
}

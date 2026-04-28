/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'monospace'],
      },
      colors: {
        bg:       '#080e1a',
        surface:  '#0d1525',
        surface2: '#111d30',
        gold:     '#c9a84c',
        gold2:    '#e8c97a',
        offwhite: '#e8eef8',
        muted:    '#3d5070',
        muted2:   '#567090',
        border:   '#162035',
        border2:  '#1e2e48',
      },
      fontSize: {
        'display': ['clamp(56px,9vw,120px)', { lineHeight: '0.9', letterSpacing: '-3px' }],
        'heading':  ['clamp(36px,5vw,64px)',  { lineHeight: '1',   letterSpacing: '-1.5px' }],
        'subhead':  ['clamp(22px,3vw,36px)',  { lineHeight: '1.1', letterSpacing: '-0.5px' }],
        'mono-xs':  ['10px', { letterSpacing: '4px' }],
        'mono-sm':  ['11px', { letterSpacing: '3px' }],
      },
      borderRadius: { none: '0' },
      boxShadow: { none: 'none' },
      animation: {
        fadeUp: 'fadeUp 0.4s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

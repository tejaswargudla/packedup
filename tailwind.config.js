/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'monospace'],
        sans:  ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        bg:       '#fffbf4',
        surface:  '#fff3e4',
        surface2: '#ffe8cc',
        gold:     '#ff8c42',
        gold2:    '#e8732e',
        offwhite: '#1a1a2e',
        muted:    '#8a6e5a',
        muted2:   '#b89a82',
        border:   '#e8d5c0',
        border2:  '#d4b896',
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

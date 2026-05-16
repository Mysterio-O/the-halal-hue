import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'gold-muted': 'var(--gold-muted)',
        'gold-dim': 'var(--gold-dim)',
        'gold-pale': 'var(--gold-pale)',
        crimson: 'var(--crimson)',
        'crimson-deep': 'var(--crimson-deep)',
        'crimson-mid': 'var(--crimson-mid)',
        obsidian: 'var(--obsidian)',
        'obsidian-2': 'var(--obsidian-2)',
        garnet: 'var(--garnet)',
        ivory: 'var(--ivory)',
        'ivory-dim': 'var(--ivory-dim)',
      },
      spacing: {
        nav: 'var(--nav-height)',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        card: 'var(--card-radius)',
      },
      transitionDuration: {
        base: 'var(--transition-base)',
        spring: 'var(--transition-spring)',
      },
    },
  },
  plugins: [],
}

export default config

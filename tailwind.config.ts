import type { Config } from 'tailwindcss';

/**
 * Every value resolves to a token in styles/tokens.css. Colors go through their RGB channels so
 * opacity modifiers work (`bg-mocha-700/10`); Tailwind cannot compute those from an opaque var().
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;
const semantic = (token: string) => withAlpha(`--cef-${token}-rgb`);
const scale = (name: string, steps: readonly number[]) =>
  Object.fromEntries(steps.map((step) => [step, withAlpha(`--cef-color-${name}-${step}-rgb`)]));

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        background: semantic('background'),
        surface: semantic('surface'),
        'surface-raised': semantic('surface-raised'),
        foreground: semantic('foreground'),
        muted: semantic('muted'),
        border: semantic('border'),
        primary: semantic('primary'),
        'primary-foreground': semantic('primary-foreground'),
        accent: semantic('accent'),
        'accent-foreground': semantic('accent-foreground'),
        success: semantic('success'),
        warning: semantic('warning'),
        danger: semantic('danger'),
        focus: semantic('focus'),
        cream: scale('cream', [50, 100, 200, 300]),
        latte: scale('latte', [300, 400, 500]),
        mocha: scale('mocha', [600, 700]),
        espresso: scale('espresso', [800, 900]),
        sage: scale('sage', [100, 200, 300]),
        forest: scale('forest', [600, 700, 800]),
      },
      fontFamily: {
        sans: ['var(--cef-font-sans)'],
        serif: ['var(--cef-font-serif)'],
        script: ['var(--cef-font-script)'],
      },
      fontSize: {
        display: [
          'var(--cef-text-display)',
          {
            lineHeight: 'var(--cef-leading-display)',
            letterSpacing: 'var(--cef-tracking-display)',
          },
        ],
        h1: [
          'var(--cef-text-h1)',
          {
            lineHeight: 'var(--cef-leading-display)',
            letterSpacing: 'var(--cef-tracking-display)',
          },
        ],
        h2: [
          'var(--cef-text-h2)',
          {
            lineHeight: 'var(--cef-leading-heading)',
            letterSpacing: 'var(--cef-tracking-heading)',
          },
        ],
        h3: [
          'var(--cef-text-h3)',
          {
            lineHeight: 'var(--cef-leading-heading)',
            letterSpacing: 'var(--cef-tracking-heading)',
          },
        ],
        h4: ['var(--cef-text-h4)', { lineHeight: '1.3' }],
        lead: ['var(--cef-text-lead)', { lineHeight: '1.55' }],
        body: ['var(--cef-text-body)', { lineHeight: 'var(--cef-leading-body)' }],
        small: ['var(--cef-text-small)', { lineHeight: '1.55' }],
        meta: ['var(--cef-text-meta)', { lineHeight: '1.45' }],
        script: ['var(--cef-text-script)', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        label: 'var(--cef-tracking-label)',
      },
      maxWidth: {
        container: 'var(--cef-container)',
        measure: 'var(--cef-measure)',
      },
      spacing: {
        gutter: 'var(--cef-space-gutter)',
        section: 'var(--cef-space-section)',
        'section-tight': 'var(--cef-space-section-tight)',
        nav: 'var(--cef-space-nav)',
      },
      borderRadius: {
        sm: 'var(--cef-radius-sm)',
        DEFAULT: 'var(--cef-radius-md)',
        md: 'var(--cef-radius-md)',
        lg: 'var(--cef-radius-lg)',
        xl: 'var(--cef-radius-xl)',
        '2xl': 'var(--cef-radius-2xl)',
        nav: 'var(--cef-radius-nav)',
      },
      boxShadow: {
        sm: 'var(--cef-shadow-sm)',
        DEFAULT: 'var(--cef-shadow-md)',
        md: 'var(--cef-shadow-md)',
        lg: 'var(--cef-shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--cef-duration-fast)',
        DEFAULT: 'var(--cef-duration-normal)',
        normal: 'var(--cef-duration-normal)',
        slow: 'var(--cef-duration-slow)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--cef-ease-standard)',
        standard: 'var(--cef-ease-standard)',
        out: 'var(--cef-ease-decelerate)',
        'in-out': 'var(--cef-ease-emphasized)',
      },
    },
  },
  plugins: [],
};

export default config;

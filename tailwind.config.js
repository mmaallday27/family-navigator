/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, calm, trustworthy palette — intentionally NOT a dark dashboard.
        canvas: '#FAF8F4', // warm ivory app background
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#2B2A28', // warm near-black text
          soft: '#5A564F',
          faint: '#6B665C', // darkened for WCAG AA on canvas/surface (was #8C877D)
        },
        line: '#EBE6DD', // soft warm border
        // Primary: calm teal — guidance, trust
        teal: {
          50: '#EFF7F5',
          100: '#D6EBE7',
          200: '#AED7D0',
          300: '#7FBEB4',
          400: '#52A398',
          500: '#2F8F83',
          600: '#247268',
          700: '#1E5C54',
          800: '#194A44',
          900: '#143C37',
        },
        // Warm accent: amber — energy, encouragement
        amber: {
          50: '#FDF4E7',
          100: '#FAE6C9',
          200: '#F4CD96',
          300: '#EDB063',
          400: '#E8A04B',
          500: '#D9852A',
          600: '#B86A1F',
        },
        // Sage — calm secondary
        sage: {
          50: '#F1F4EE',
          100: '#DEE7D6',
          200: '#BFD0B0',
          500: '#6F8C5C',
          600: '#566E47',
        },
        // Lavender — marks the ACTIVE Transition stage gently
        lav: {
          50: '#F4F1FA',
          100: '#E6DEF5',
          200: '#CBBCE9',
          500: '#7C5FC0',
          600: '#634AA0',
        },
        // Soft status colors
        rose: {
          50: '#FCEFEF',
          100: '#F8D9D9',
          500: '#C2564F',
          600: '#A84139', // deep enough for AA with white text
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,42,40,0.04), 0 4px 16px rgba(43,42,40,0.05)',
        lift: '0 2px 6px rgba(43,42,40,0.06), 0 12px 28px rgba(43,42,40,0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          accent: 'var(--bg-accent)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          tertiary: 'var(--brand-tertiary)',
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      fontSize: {
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
}

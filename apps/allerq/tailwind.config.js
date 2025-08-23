/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['12px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        sm: ['14px', { lineHeight: '1.45' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.5' }],
        xl: ['25px', { lineHeight: '1.4' }],
        '2xl': ['31px', { lineHeight: '1.3' }],
        '3xl': ['39px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '4xl': ['49px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      spacing: {
        1: '4px', 1.5: '6px', 2: '8px', 3: '12px', 4: '16px',
        6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
        20: '80px', 24: '96px',
      },
      borderRadius: {
        sm: '2px', DEFAULT: '12px', md: '8px', lg: '16px',
      },
      colors: {
        brand: {
          50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',
          400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',
          800:'#1e40af',900:'#1e3a8a'
        },
        info:    { DEFAULT:'#0ea5e9' },
        success: { DEFAULT:'#16a34a' },
        warning: { DEFAULT:'#f59e0b' },
        danger:  { DEFAULT:'#dc2626' },
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)',
        'elev-2': '0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
        'elev-3': '0 16px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
      },
      transitionDuration: { 200: '200ms' },
      transitionTimingFunction: { soft: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    },
  },
  plugins: [],
};

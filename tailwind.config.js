/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          green: '#00ff41',
          dark: '#0d0d0d',
          panel: '#1a1a1a',
          border: '#003b00',
          dim: '#008f11'
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.cyber.green"), 0 0 20px theme("colors.cyber.green")',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}

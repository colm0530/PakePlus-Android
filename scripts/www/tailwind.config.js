/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0F1113',
          surface: '#181A1D',
          sidebar: '#141619',
          accent: '#00E5FF',
          border: '#2D3139',
          ink: '#E4E6EB',
          muted: '#8A8D91',
          alert: '#FF5252',
          success: '#00E676',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}

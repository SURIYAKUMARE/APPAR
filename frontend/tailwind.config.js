/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#030712',      // Deep space black
          navy: '#0a1128',      // Cyber navy
          deep: '#060d1f',      // Ultra deep navy
          blue: '#1e3a8a',      // AICTE Royal Blue
          cyan: '#00f2fe',      // Electric Cyan
          ice: '#38bdf8',       // Holographic Ice Blue
          neon: '#06b6d4',      // Neon Cyan
          violet: '#8b5cf6',    // Cyber Violet
          emerald: '#10b981',   // Matrix Emerald
          gold: '#f59e0b',      // Amber Telemetry
          slate: '#1e293b',     // Deep Slate
          light: '#f8fafc',
          card: '#0f172a'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin 18s linear infinite reverse',
        'scan': 'scan 2.5s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 242, 254, 0.7), 0 0 40px rgba(139, 92, 246, 0.4)' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}

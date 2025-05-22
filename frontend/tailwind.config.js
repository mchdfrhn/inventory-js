/** @type {import("tailwindcss").Config} */
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'dashboardFadeIn': 'fadeIn 0.8s ease-out forwards',
        'fadeSlideIn': 'fadeSlideIn 0.5s ease-out forwards',
        'growWidth': 'growWidth 1s ease-out forwards',
        'growHeight': 'growHeight 1s ease-out forwards',
        'ripple': 'ripple 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        growWidth: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        growHeight: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '50%': { transform: 'scale(1)', opacity: '0.3' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    forms,
  ],
}

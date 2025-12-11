/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0b0b",
        primary: {
          DEFAULT: "#a020ff", // Roxo Açaí Claro
          dark: "#5b0b8a",    // Roxo Açaí Escuro
        },
        accent: {
          DEFAULT: "#ffd166", // Dourado CTA
          hover: "#ffc107",
        },
        surface: "#1a1a1a",
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}

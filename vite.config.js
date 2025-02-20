import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  /** @type {import('tailwindcss').Config} */

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canva-purple': '#8B3DFF',
      }
    },
  },
  

  plugins: [react(), tailwindcss()],
})


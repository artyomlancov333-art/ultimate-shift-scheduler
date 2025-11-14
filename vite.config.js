import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages раскомментируйте следующую строку:
  // base: '/ultimate-shift-scheduler/',
  // Для Vercel оставьте закомментированным (используется корневой путь)
})


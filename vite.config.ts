import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from the apex of the custom domain (talktap.org), so the app lives at root.
  base: '/',
})

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js',
      'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js',
      'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js'
    ]
  }
})

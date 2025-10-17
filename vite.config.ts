import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: "/", // <-- ensures correct routing and asset paths
  build: {
    outDir: "dist", // default, but explicit helps consistency
  },
  server: {
    // Removed historyApiFallback as it is not a valid property
  },
})

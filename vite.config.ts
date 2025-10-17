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
    // split large node_modules into vendor chunks and raise warning threshold
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
            if (id.includes('lucide-react') || id.includes('heroicons') || id.includes('feather-icons')) return 'vendor_icons';
            if (id.includes('axios')) return 'vendor_network';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
   },
   server: {
     // Removed historyApiFallback as it is not a valid property
   },
 })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer' // add dev dep

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // generate a bundle report at dist/bundle-report.html after build
    visualizer({ filename: 'dist/bundle-report.html', open: false })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // split node_modules into per-package vendor chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // get package name, keeping scoped packages intact
            const parts = id.split('node_modules/')[1].split('/');
            const pkgName = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
            // sanitize name for chunk filename
            return `vendor_${pkgName.replace('@', '').replace('/', '_')}`;
          }
        }
      }
    },
    // keep warning threshold reasonable
    chunkSizeWarningLimit: 800,
  },
  server: {}
})

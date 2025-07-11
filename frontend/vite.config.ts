import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['wasm-calculator']
  },
  build: {
    commonjsOptions: {
      include: [/wasm-calculator/, /node_modules/]
    }
  },
  plugins: [wasm(), topLevelAwait(), react(), tailwindcss()],
  assetsInclude: ['**/*.wasm']
})

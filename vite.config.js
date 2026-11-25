import { defineConfig } from 'vite';
// Relative base so the build works from any GitHub Pages sub-path.
export default defineConfig({
  base: './',
  server: { port: 5210, watch: { ignored: ['**/assets/**', '**/tools/**'] } },
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 1800,
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } },
});

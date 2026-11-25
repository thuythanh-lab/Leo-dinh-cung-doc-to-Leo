import fs from 'node:fs';
import { defineConfig } from 'vite';

// Local-only main theme (no redistribution rights): streamed from the git-ignored asset library, never copied to dist.
const LOCAL_THEME = 'assets/audio/Harry Potter Hedwig s Song HQ.mp3';
const serveTheme = (s) => { s.middlewares.use((req, res, next) => {
  if (!req.url.startsWith('/local-music/main-theme')) return next();
  if (!fs.existsSync(LOCAL_THEME)) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', 'audio/mpeg'); fs.createReadStream(LOCAL_THEME).pipe(res);
}); };
// Relative base so the build works from any GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [{ name: 'local-theme', configureServer: serveTheme, configurePreviewServer: serveTheme }],
  server: { port: 5210, watch: { ignored: ['**/assets/**', '**/tools/**'] } },
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 1800,
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sqliteApiMiddleware } from './server/apiMiddleware.js';

function sqlitePlugin() {
  return {
    name: 'vite-plugin-sqlite-api',
    configureServer(server) {
      server.middlewares.use(sqliteApiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(sqliteApiMiddleware);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sqlitePlugin()],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api requests to Express backend
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
      // Forward Socket.IO signaling to Express backend
      '/socket.io': {
        target: 'http://localhost:5050',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

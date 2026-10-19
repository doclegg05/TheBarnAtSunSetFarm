import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { responsiveImages } from './scripts/responsiveImages';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), responsiveImages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    minify: 'esbuild',
  },
});

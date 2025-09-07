import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/summarize': 'http://localhost:3000',
      '/followup': 'http://localhost:3000',
    }
  }
});

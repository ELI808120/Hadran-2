import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // אופציונלי: מאפשר קיצורי דרך לייבוא
    },
  },
  build: {
    // מוחק הגדרות rollupOptions ישנות שחיפשו קבצים חסרים
    emptyOutDir: true,
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:'/Fundly-dev/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
});

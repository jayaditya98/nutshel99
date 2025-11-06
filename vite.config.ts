import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'productphotoshoots': path.resolve(__dirname, './productphotoshoots'),
          'modelshoots': path.resolve(__dirname, './modelshoots'),
          'cloneshoots': path.resolve(__dirname, './cloneshoots'),
          'imagecomposer': path.resolve(__dirname, './imagecomposer'),
          'aicanvas': path.resolve(__dirname, './aicanvas'),
        },
        dedupe: ['react', 'react-dom'],
      },
      optimizeDeps: {
        include: [
          'zustand',
          'immer',
          'react-color',
          'react-dom',
        ]
      }
    };
});

import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseFunctions = supabaseUrl ? `${supabaseUrl}/functions` : '';

  return {
    plugins: [react()],
    server: {
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
        // Proxy para Supabase Edge Functions a fim de evitar CORS em dev
        ...(supabaseFunctions && {
          '/functions': {
            target: supabaseFunctions,
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/functions/, ''),
          },
        }),
    },
    },
    resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    },
    build: {
    rollupOptions: {
      // Configurações de build otimizadas
    }
    }
  };
});

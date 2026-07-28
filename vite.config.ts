import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import vitePluginHonoDev from './vite-plugin-hono-dev'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH ?? '/'
  const isProd = mode === 'production'

  return {
    plugins: [react(), vitePluginHonoDev()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['crypto', 'node:crypto'],
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      open: false,
      proxy: {
        // 保留外部代理目标作为 fallback，但本项目通过 vite-plugin-hono-dev 直接处理 /api
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      cssCodeSplit: true,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react';
              if (id.includes('zustand')) return 'zustand';
              if (id.includes('lucide-react')) return 'lucide';
              if (id.includes('@tanstack')) return 'query-vendor';
            }
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  }
})

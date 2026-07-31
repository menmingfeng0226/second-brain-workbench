import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import vitePluginHonoDev from './vite-plugin-hono-dev'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // GitHub Pages 默认子路径托管：https://menmingfeng0226.github.io/second-brain-workbench/
  // 本地开发 / Vercel 部署可通过 VITE_BASE_PATH=/ 覆盖
  const base = env.VITE_BASE_PATH ?? '/second-brain-workbench/'
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

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // 로컬 개발에서 /api 를 Vercel 프리뷰 등으로 넘길 때 사용. 비우면 프론트가 목업을 쓴다.
    server: env.VITE_API_PROXY ? { proxy: { '/api': { target: env.VITE_API_PROXY, changeOrigin: true } } } : undefined,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: false,
    },
  }
})

import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 相对路径：GitHub Pages 子路径（/dougong-foguang/）下资源也能解析
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
  },
})

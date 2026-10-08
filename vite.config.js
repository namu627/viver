import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 주소가 https://namu627.github.io/viver/ 이므로 base를 저장소 이름으로 맞춘다
export default defineConfig({
  base: '/viver/',
  plugins: [react()],
})

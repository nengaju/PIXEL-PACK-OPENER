import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // O NOME DO REPOSITÓRIO TEM QUE ESTAR AQUI ENTRE BARRAS
  base: "/PIXEL-PACK-OPENER/", 
})

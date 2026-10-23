import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Tailwind v4 se integra como plugin de Vite: no hace falta tailwind.config.js
// ni PostCSS. El `base` para GitHub Pages se configura en la fase de despliegue.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

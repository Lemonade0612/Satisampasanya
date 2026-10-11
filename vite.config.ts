import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  root: path.resolve(__dirname, 'frontend'),
  envDir: process.cwd(),
  build: { outDir: path.resolve(__dirname, 'dist'), emptyOutDir: true },
  plugins: [react(), tailwindcss(), {name:'admin-redirect', configureServer(server) {server.middlewares.use((req,res,next)=>{if(req.url === '/admin' || req.url === '/admin/'){res.writeHead(302,{Location:'http://127.0.0.1:5174'});res.end();}else next();});}}],
  resolve: { alias: { '@': path.resolve(__dirname, './frontend/src') } },
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': `http://127.0.0.1:${env.API_PORT || 3001}` } },
  assetsInclude: ['**/*.svg', '**/*.csv'],
};
})

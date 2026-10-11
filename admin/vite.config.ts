import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig(({mode}) => {
 const env=loadEnv(mode,process.cwd(),'');
 return {root:path.resolve(__dirname),envDir:process.cwd(),publicDir:path.resolve(__dirname,'../frontend/public'),plugins:[react()],server:{host:'127.0.0.1',port:5174,strictPort:true,proxy:{'/api':`http://127.0.0.1:${env.API_PORT||3001}`}},build:{outDir:'dist',emptyOutDir:true}};
});

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo atual
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Substitui process.env.API_KEY pelo valor da string durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Define process.env como um objeto vazio para evitar crash em chamadas genéricas,
      // mas mantendo a API_KEY acessível pela substituição acima.
      'process.env': {} 
    }
  }
})
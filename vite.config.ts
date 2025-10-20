import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Get __dirname equivalent in ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableHttps = env.VITE_ENABLE_HTTPS === 'true'
  const port = Number(env.VITE_PORT ?? 3000)
  const host = env.VITE_HOST ?? '0.0.0.0'

  const plugins = [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ]

  if (enableHttps) {
    plugins.push(basicSsl())
  }

  return {
    define: {
      'process.env.CLERK_ISSUER_URL': JSON.stringify(env.CLERK_ISSUER_URL),
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'CLERK_'],
    plugins,
    server: {
      host,
      port,
    },
    preview: {
      host,
      port,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'zod/core': 'zod',
      },
    },
  }
})

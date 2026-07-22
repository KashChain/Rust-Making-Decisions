import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

function resolveLocalFile(candidate) {
  const attempts = [
    candidate,
    `${candidate}.js`,
    `${candidate}.mjs`,
    `${candidate}.cjs`,
    resolve(candidate, 'index.js'),
  ]
  return attempts.find((file) => existsSync(file))
}

function workspaceSafeDepResolver() {
  return {
    name: 'workspace-safe-dep-resolver',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (!args.importer || args.path.startsWith('node:')) return undefined

        if (args.path.startsWith('.')) {
          const resolved = resolveLocalFile(resolve(dirname(args.importer), args.path))
          if (resolved) return { path: resolved }
        }

        try {
          return { path: createRequire(args.importer).resolve(args.path) }
        } catch {
          return undefined
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    noDiscovery: true,
    include: [],
    esbuildOptions: {
      plugins: [workspaceSafeDepResolver()],
    },
  },
})

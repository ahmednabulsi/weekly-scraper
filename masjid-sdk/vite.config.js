import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry:    'src/index.js',
      name:     'MasjidTimes',
      fileName: () => 'masjid-times.js',
      formats:  ['iife'],
    },
    outDir:      '.',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})

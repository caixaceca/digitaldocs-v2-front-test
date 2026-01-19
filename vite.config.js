/* eslint-disable import/no-unresolved */
/* eslint-disable consistent-return */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        fastRefresh: isDev,
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    esbuild: {
      drop: isProd ? ['debugger'] : [],
      legalComments: 'none',
    },

    server: {
      port: 3000,
      strictPort: true,
      open: isDev,
    },

    preview: {
      port: 4173,
      strictPort: true,
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2020',

      sourcemap: isProd ? 'hidden' : true,

      minify: 'esbuild',

      chunkSizeWarningLimit: 300,

      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',

          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? '';
            const ext = name.split('.').pop();

            if (/\.(png|jpe?g|svg|gif|tiff|bmp|webp|ico)$/i.test(name)) {
              return 'assets/img/[name]-[hash][extname]';
            }

            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]';
            }

            return 'assets/[name]-[hash][extname]';
          },

          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-core';
            }

            if (id.includes('lodash') || id.includes('date-fns') || id.includes('dayjs')) {
              return 'utils';
            }

            if (id.includes('apexcharts') || id.includes('recharts') || id.includes('chart.js')) {
              return 'charts';
            }

            return 'vendor';
          },
        },
      },
    },
  };
});

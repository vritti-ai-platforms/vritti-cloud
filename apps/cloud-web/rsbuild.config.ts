import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const require = createRequire(import.meta.url);

// Environment configuration
const useHttps = process.env.USE_HTTPS === 'true';
const protocol = useHttps ? 'https' : 'http';
const devHost = process.env.DEV_HOST ?? 'cloud.local.vrittiai.com';
const defaultApiHost = `${protocol}://local.vrittiai.com:3000`;

export default defineConfig({
  output: {
    assetPrefix: '/cloud-web/',
  },
  resolve: {
    alias: {
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react-router-dom': require.resolve('react-router-dom'),
      '@tanstack/react-query': require.resolve('@tanstack/react-query'),
    },
  },
  dev: {
    writeToDisk: true, // Write build outputs to disk in dev mode
  },
  server: {
    port: 3012,
    host: devHost,
    ...(useHttps && {
      https: {
        key: readFileSync('../../certs/_wildcard.local.vrittiai.com+4-key.pem'),
        cert: readFileSync('../../certs/_wildcard.local.vrittiai.com+4.pem'),
      },
    }),
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || defaultApiHost,
        changeOrigin: true,
        secure: false,
        on: {
          proxyReq: (proxyReq, req) => {
            const host = (req.headers['host'] ?? '').split(':')[0];
            if (host) proxyReq.setHeader('x-forwarded-host', host);
          },
          proxyRes: (proxyRes, req, res) => {
            if (req.headers.accept === 'text/event-stream') {
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['x-accel-buffering'] = 'no';
              proxyRes.on('data', (chunk) => {
                res.write(chunk);
              });
            }
          },
        },
        pathRewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [pluginReact()],
  tools: {
    rspack: {
      ignoreWarnings: [
        /Critical dependency: the request of a dependency is an expression/,
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      ],
      watchOptions: {
        ignored: ['**/node_modules/**', '**/dist/**', '**/cloud-server/**'],
      },
    },
  },
  // PostCSS configuration is in postcss.config.mjs
});

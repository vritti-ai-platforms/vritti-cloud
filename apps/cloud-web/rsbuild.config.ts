import { readFileSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

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
        key: readFileSync('./certs/_wildcard.local.vrittiai.com+4-key.pem'),
        cert: readFileSync('./certs/_wildcard.local.vrittiai.com+4.pem'),
      },
    }),
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || defaultApiHost,
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req) => {
          const host = (req.headers['host'] ?? '').split(':')[0];
          if (host) proxyReq.setHeader('x-forwarded-host', host);
        },
        pathRewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [pluginReact()],
  // PostCSS configuration is in postcss.config.mjs
});

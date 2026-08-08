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

// Cloudflare Access service token — only needed when the dev proxy targets the Access-gated
// admin. host. Injected from Infisical (shared/cloud-web). When both are present the proxy adds
// the CF-Access headers so requests pass Access instead of getting the 302 login redirect;
// when absent (local-backend dev) no headers are added.
const cfAccessClientId = process.env.ADMIN_CF_ACCESS_CLIENT_ID;
const cfAccessClientSecret = process.env.ADMIN_CF_ACCESS_CLIENT_SECRET;

export default defineConfig({
  output: {
    assetPrefix: '/',
  },
  html: {
    favicon: './src/assets/vritti.svg',
    title: 'Vritti Cloud',
    // admin.vrittiai.com → "Vritti Admin"; cloud.* (and dev) → "Vritti Cloud".
    // Appended after <title> so it overrides the default, before first paint.
    tags: [
      {
        tag: 'script',
        head: true,
        append: true,
        children: "document.title=location.hostname.split('.')[0]==='admin'?'Vritti Admin':'Vritti Cloud';",
      },
    ],
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
            // HTTP/2 uses :authority instead of Host
            const rawHost = (req.headers.host ?? req.headers[':authority'] ?? '') as string;
            const host = rawHost.split(':')[0];
            if (host) proxyReq.setHeader('x-forwarded-host', host);
            // Pass Cloudflare Access when targeting the Access-gated admin. host.
            if (cfAccessClientId && cfAccessClientSecret) {
              proxyReq.setHeader('CF-Access-Client-Id', cfAccessClientId);
              proxyReq.setHeader('CF-Access-Client-Secret', cfAccessClientSecret);
            }
          },
          proxyRes: (proxyRes, req) => {
            // SSE hints only. Do NOT pump chunks manually — http-proxy-middleware already pipes
            // proxyRes -> res, so a manual res.write() double-writes every chunk. For large,
            // multi-chunk frames (the authenticated auth-state payload arriving fragmented via
            // Cloudflare) the two writers interleave and inject bytes mid-JSON, producing
            // "Bad control character in string literal". The default pipe streams SSE fine.
            if (req.headers.accept === 'text/event-stream') {
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['x-accel-buffering'] = 'no';
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

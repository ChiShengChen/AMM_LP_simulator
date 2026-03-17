import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LP Strategy Simulator',
        short_name: 'LP Sim',
        description: 'AMM LP dual-asset strategy simulator',
        theme_color: '#FAF9F7',
        background_color: '#FAF9F7',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  base: './',
});

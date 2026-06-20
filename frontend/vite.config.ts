import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icons/*.png"],
      manifest: {
        name: "IronMind",
        short_name: "IronMind",
        description: "Tu sistema personal de entrenamiento",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/routines\/today/,
            handler: "NetworkFirst",
            options: {
              cacheName: "today-cache",
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/routines\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "routines-cache",
              expiration: { maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/exercises\//,
            handler: "CacheFirst",
            options: {
              cacheName: "exercises-cache",
              expiration: { maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});

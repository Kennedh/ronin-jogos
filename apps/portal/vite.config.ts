import { defineConfig } from "vite";
import { PORTAL_CSP } from "./security.ts";
const proxy = {
  "/api": { target: "http://127.0.0.1:3001", changeOrigin: false },
};
export default defineConfig(({ command }) => ({
  plugins: [
    {
      name: "ronin-csp",
      transformIndexHtml() {
        if (command === "build")
          return [
            {
              tag: "meta",
              attrs: {
                "http-equiv": "Content-Security-Policy",
                content: PORTAL_CSP,
              },
              injectTo: "head",
            },
          ];
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy,
    headers: {
      "Content-Security-Policy": PORTAL_CSP.replace(
        "connect-src 'self'",
        "connect-src 'self' ws://127.0.0.1:*",
      ),
      "X-Content-Type-Options": "nosniff",
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy,
    headers: {
      "Content-Security-Policy": PORTAL_CSP,
      "X-Content-Type-Options": "nosniff",
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      // `netlify dev` serves the functions on 9999; plain `vite dev` proxies to it.
      "/api": {
        target: "http://localhost:9999",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        // Keep the PDF stack out of the critical path; it is only pulled in
        // on the confirmation and admin screens.
        manualChunks(id) {
          if (id.includes("node_modules/jspdf") || id.includes("node_modules/html2canvas-pro")) {
            return "pdf";
          }
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router") ||
            /node_modules\/react\//.test(id)
          ) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
});

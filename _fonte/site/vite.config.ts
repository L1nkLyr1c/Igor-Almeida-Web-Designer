import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O site é publicado como arquivos estáticos na raiz do repositório.
// Os arquivos gerados vão para assets/app/ para não misturar com assets/ (fotos e logos).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets/app",
    emptyOutDir: true,
    target: "es2020",
  },
});

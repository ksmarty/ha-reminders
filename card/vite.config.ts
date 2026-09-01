import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/ha-reminders-card.ts", import.meta.url)),
      formats: ["es"],
      fileName: () => "ha-reminders.js",
    },
    outDir: fileURLToPath(
      new URL("../custom_components/ha_reminders/www", import.meta.url),
    ),
    emptyOutDir: false,
    target: "es2020",
    minify: true,
    sourcemap: false,
  },
});
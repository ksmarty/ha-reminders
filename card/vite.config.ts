import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/**
 * Two entry points, both served by the integration:
 *   ha-reminders.js       - Lovelace card (injected with add_extra_js_url)
 *   ha-reminders-panel.js - sidebar panel (registered via panel_custom)
 */
export default defineConfig({
  build: {
    lib: {
      entry: {
        "ha-reminders": fileURLToPath(
          new URL("./src/ha-reminders-card.ts", import.meta.url),
        ),
        "ha-reminders-panel": fileURLToPath(
          new URL("./src/ha-reminders-panel.ts", import.meta.url),
        ),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    outDir: fileURLToPath(
      new URL("../custom_components/ha_reminders/www", import.meta.url),
    ),
    emptyOutDir: true,
    target: "es2020",
    minify: true,
    sourcemap: false,
  },
});

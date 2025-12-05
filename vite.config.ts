/*
 * @Description:
 * @Author: 安知鱼
 * @Date: 2025-11-28 15:58:52
 * @LastEditTime: 2025-12-05 19:44:21
 * @LastEditors: 安知鱼
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import webExtension from "vite-plugin-web-extension";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ mode }) => {
  const browser = mode === "firefox" ? "firefox" : "chrome";

  return {
    plugins: [
      vue(),
      webExtension({
        browser,
        manifest: "manifest.json",
      }),
      viteStaticCopy({
        targets: [
          {
            src: "public/wallpaper/*",
            dest: "wallpaper",
          },
          {
            src: "public/icons/*",
            dest: "icons",
          },
          {
            src: "icons/*.png",
            dest: "icons",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: `dist/${browser}`,
    },
  };
});

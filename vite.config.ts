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
import { compression } from "vite-plugin-compression2";

export default defineConfig(({ mode }) => {
  const browser = mode === "firefox" ? "firefox" : "chrome";

  return {
    plugins: [
      vue(),
      webExtension({
        browser,
        manifest: "manifest.json",
      }),
      // 扩展需要将内置壁纸一并打包，避免运行时依赖外部 CDN。
      viteStaticCopy({
        targets: [
          {
            src: "public/icons/*",
            dest: "icons",
          },
          {
            src: "icons/*.png",
            dest: "icons",
          },
          // 复制 PWA 所需文件
          {
            src: "public/site.webmanifest",
            dest: ".",
          },
          // 复制全部内置静态和动态壁纸。
          {
            src: "public/wallpaper/static/*",
            dest: "wallpaper/static",
          },
          {
            src: "public/wallpaper/dynamic/*",
            dest: "wallpaper/dynamic",
          },
          // 复制多语言文件
          {
            src: "_locales",
            dest: ".",
          },
        ],
      }),
      // Gzip + Brotli 压缩（对 H5 部署有效，扩展打包时 zip 会自动压缩）
      compression({
        exclude: [/\.(br)$/, /\.(gz)$/, /\.(png)$/, /\.(jpg)$/, /\.(webp)$/],
        threshold: 1024, // 只压缩大于 1KB 的文件
      }),
    ],
    // 资源通过 vite-plugin-static-copy 显式复制，避免重复包含 public 目录。
    publicDir: false,
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: `dist/${browser}`,
      // 禁用 sourcemap 减小体积（开发时可开启）
      sourcemap: false,
      // 压缩配置
      minify: "esbuild", // 使用 esbuild 压缩，速度更快
      // chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,
    },
  };
});

/*
 * @Description: H5 构建配置
 * @Author: 安知鱼
 * @Date: 2025-12-04
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [
    vue(),
    // H5 与扩展保持一致，使用构建产物中的内置壁纸。
    viteStaticCopy({
      targets: [
        {
          src: "public/icons/*",
          dest: "icons",
        },
        {
          src: "icons/*",
          dest: "icons",
        },
        {
          src: "public/site.webmanifest",
          dest: ".",
        },
        {
          src: "public/wallpaper/static/*",
          dest: "wallpaper/static",
        },
        {
          src: "public/wallpaper/dynamic/*",
          dest: "wallpaper/dynamic",
        },
      ],
    }),
    // Gzip + Brotli 压缩（服务器可直接返回预压缩文件）
    compression({
      exclude: [/\.(br)$/, /\.(gz)$/, /\.(png)$/, /\.(jpg)$/, /\.(webp)$/],
      threshold: 1024,
    }),
  ],
  // 资源通过 vite-plugin-static-copy 显式复制，避免重复包含 public 目录。
  publicDir: false,
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // 定义环境变量，用于检测是否是 H5 模式
  define: {
    __IS_H5__: JSON.stringify(true),
  },
  build: {
    outDir: "dist/h5",
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap 便于调试
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // 优化分包策略
        manualChunks: {
          vue: ["vue", "pinia"],
        },
      },
    },
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true,
  },
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { WallpaperSettings, BingWallpaperInfo } from "@/types";
import {
  getWallpaper,
  saveWallpaper,
  getBingWallpaperCache,
  saveBingWallpaperCache,
  getTodayDateString,
} from "@/utils/storage";

// 检测是否在浏览器扩展环境中
declare const chrome:
  | {
      runtime?: {
        sendMessage: (message: unknown) => Promise<unknown>;
      };
    }
  | undefined;

const isExtension = typeof chrome !== "undefined" && chrome?.runtime;

interface BingWallpaperResponse {
  success: boolean;
  data?: BingWallpaperInfo;
  error?: string;
}

// 默认静态壁纸列表 (本地图片)
export const DEFAULT_WALLPAPERS = [
  "/wallpaper/static/1.jpg",
  "/wallpaper/static/2.jpg",
  "/wallpaper/static/3.jpg",
  "/wallpaper/static/4.jpg",
  "/wallpaper/static/5.jpg",
  "/wallpaper/static/6.jpg",
  "/wallpaper/static/7.jpg",
  "/wallpaper/static/8.jpg",
  "/wallpaper/static/9.jpg",
  "/wallpaper/static/10.jpg",
  "/wallpaper/static/11.jpg",
  "/wallpaper/static/12.jpg",
  "/wallpaper/static/13.jpg",
  "/wallpaper/static/14.jpg",
  "/wallpaper/static/15.jpg",
];

// 动态壁纸列表 (本地视频)
export const DYNAMIC_WALLPAPERS = [
  "/wallpaper/dynamic/kasumizawa-miyu-blue-archive.mp4",
  "/wallpaper/dynamic/LiveWallpaperPC.com-Warma.mp4",
  "/wallpaper/dynamic/xue-hu-sang-virtual-youtuber-desktop-wallpaperwaifu.com.mp4",
];

// 动态壁纸缩略图 (同时作为后备静态图)
export const DYNAMIC_WALLPAPER_THUMBNAILS = [
  "/wallpaper/dynamic/kasumizawa-miyu-blue-archive_thumb.jpg",
  "/wallpaper/dynamic/LiveWallpaperPC.com-Warma_thumb.jpg",
  "/wallpaper/dynamic/xue-hu-sang-virtual-youtuber-desktop-wallpaperwaifu.com_thumb.jpg",
];

// 获取动态壁纸的后备静态图
export function getDynamicFallback(index: number): string {
  return DYNAMIC_WALLPAPER_THUMBNAILS[index] || DYNAMIC_WALLPAPER_THUMBNAILS[0];
}

// 检测 URL 是否是视频格式
export function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  // 检测 dataUrl 的 MIME 类型
  if (url.startsWith("data:video/")) {
    return true;
  }
  // 检测文件扩展名
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

const DEFAULT_WALLPAPER_URL = DEFAULT_WALLPAPERS[0];

export const useWallpaperStore = defineStore("wallpaper", () => {
  const settings = ref<WallpaperSettings>({
    type: "dynamic",
    url: null,
    localData: null,
    localImages: [],
    defaultIndex: 0,
    dynamicIndex: 0,
    blur: true,
    blurAmount: 30,
    brightness: 100,
  });

  const loading = ref(false);
  // Bing 今日壁纸信息
  const bingWallpaper = ref<BingWallpaperInfo | null>(null);
  // 用于存储当前随机选择的本地图片索引
  const currentLocalIndex = ref(0);

  // 当前壁纸是否是视频类型
  const isVideoWallpaper = computed(() => {
    // 预设动态壁纸
    if (settings.value.type === "dynamic") {
      return true;
    }
    // 本地上传的视频
    if (settings.value.type === "local") {
      const localImages = settings.value.localImages;
      const currentMedia =
        Array.isArray(localImages) && localImages.length > 0
          ? localImages[currentLocalIndex.value]
          : settings.value.localData;
      return isVideoUrl(currentMedia);
    }
    // URL 视频
    if (settings.value.type === "url") {
      return isVideoUrl(settings.value.url);
    }
    return false;
  });

  const currentUrl = computed(() => {
    const localImages = settings.value.localImages;
    switch (settings.value.type) {
      case "local":
        // 如果有多张本地图片，使用随机索引
        if (Array.isArray(localImages) && localImages.length > 0) {
          return localImages[currentLocalIndex.value];
        }
        // 兼容旧数据
        return settings.value.localData;
      case "url":
        return settings.value.url;
      case "bing":
        return bingWallpaper.value?.url || DEFAULT_WALLPAPER_URL;
      case "dynamic":
        return DYNAMIC_WALLPAPERS[settings.value.dynamicIndex] || DYNAMIC_WALLPAPERS[0];
      default:
        // 使用选中的默认壁纸索引
        return DEFAULT_WALLPAPERS[settings.value.defaultIndex] || DEFAULT_WALLPAPER_URL;
    }
  });

  const wallpaperStyle = computed(() => {
    const url = currentUrl.value;
    if (!url) return {};

    return {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: settings.value.blur ? `blur(${settings.value.blurAmount}px)` : "none",
      opacity: settings.value.brightness / 100,
    };
  });

  async function init() {
    const stored = await getWallpaper();
    // 确保 localImages 是数组
    if (!stored.localImages) {
      stored.localImages = [];
    }
    // 确保 defaultIndex 是有效值
    if (stored.defaultIndex === undefined || stored.defaultIndex < 0) {
      stored.defaultIndex = 0;
    }
    // 确保 dynamicIndex 是有效值
    if (stored.dynamicIndex === undefined || stored.dynamicIndex < 0) {
      stored.dynamicIndex = 0;
    }

    // 如果存储中没有明确的类型设置（首次使用），默认使用动态壁纸的第一张
    // 检查是否是从 DEFAULT_WALLPAPER 继承的（即没有保存过自定义设置）
    if (stored.type === "default") {
      // 检查是否有其他自定义设置（如果有，说明用户之前选择过默认壁纸，保留）
      const hasCustomSettings =
        stored.url || stored.localData || (Array.isArray(stored.localImages) && stored.localImages.length > 0);
      if (!hasCustomSettings) {
        // 首次使用或没有自定义设置，设置为动态壁纸的第一张
        stored.type = "dynamic";
        stored.dynamicIndex = 0;
        // 保存新的默认设置
        await saveWallpaper({ type: "dynamic", dynamicIndex: 0 });
      }
    }

    settings.value = stored;

    // 如果存储的类型是 bing，先尝试从缓存加载，然后后台更新
    if (stored.type === "bing") {
      // 立即加载缓存（如果有）
      const cache = await getBingWallpaperCache();
      if (cache?.data?.url) {
        bingWallpaper.value = cache.data;
      }
      // 后台检查是否需要更新（不阻塞）
      fetchBingWallpaper();
    }

    // 如果是本地多图模式，随机选择一张
    if (stored.type === "local" && Array.isArray(stored.localImages) && stored.localImages.length > 0) {
      currentLocalIndex.value = Math.floor(Math.random() * stored.localImages.length);
    }
  }

  async function fetchBingWallpaper(forceRefresh = false) {
    loading.value = true;
    try {
      const today = getTodayDateString();

      // 检查缓存是否有效（同一天的数据）
      if (!forceRefresh) {
        const cache = await getBingWallpaperCache();
        if (cache && cache.date === today && cache.data?.url) {
          console.log("Using cached Bing wallpaper");
          bingWallpaper.value = cache.data;
          loading.value = false;
          return;
        }
      }

      // 非扩展环境下无法获取 Bing 壁纸，静默回退
      if (!isExtension) {
        console.warn("Bing wallpaper requires browser extension environment");
        bingWallpaper.value = {
          url: DEFAULT_WALLPAPER_URL,
          title: "默认壁纸",
          copyright: "本地图片",
        };
        return;
      }

      // Use background service worker to bypass CORS restrictions
      const browserModule = await import("webextension-polyfill");
      const browser = browserModule.default || browserModule;
      const response = (await browser.runtime.sendMessage({
        type: "FETCH_BING_WALLPAPER",
      })) as BingWallpaperResponse;

      if (response?.success && response.data?.url) {
        bingWallpaper.value = response.data;
        // 缓存今日壁纸数据
        await saveBingWallpaperCache({
          date: today,
          data: response.data,
        });
        console.log("Bing wallpaper fetched and cached");
      } else {
        throw new Error(response?.error || "Failed to fetch Bing wallpaper");
      }
    } catch (error) {
      console.error("Failed to fetch Bing wallpaper:", error);
      // 尝试使用过期的缓存作为后备
      const cache = await getBingWallpaperCache();
      if (cache?.data?.url) {
        console.log("Using expired cache as fallback");
        bingWallpaper.value = cache.data;
      } else {
        // 静默失败，回退到默认壁纸
        bingWallpaper.value = {
          url: DEFAULT_WALLPAPER_URL,
          title: "默认壁纸",
          copyright: "加载失败，显示默认壁纸",
        };
      }
    } finally {
      loading.value = false;
    }
  }

  async function setType(type: WallpaperSettings["type"]) {
    settings.value.type = type;
    if (type === "bing") {
      await fetchBingWallpaper();
    }
    await saveWallpaper(settings.value);
  }

  async function setUrl(url: string) {
    settings.value.url = url;
    settings.value.type = "url";
    await saveWallpaper(settings.value);
  }

  async function setLocalImage(dataUrl: string) {
    settings.value.localData = dataUrl;
    settings.value.type = "local";
    await saveWallpaper(settings.value);
  }

  // 添加多张本地图片/视频
  async function addLocalImages(dataUrls: string[]) {
    // 确保 localImages 是数组
    if (!Array.isArray(settings.value.localImages)) {
      settings.value.localImages = [];
    }
    settings.value.localImages = [...settings.value.localImages, ...dataUrls];
    settings.value.type = "local";
    // 随机选择一张显示
    currentLocalIndex.value = Math.floor(Math.random() * settings.value.localImages.length);
    await saveWallpaper(settings.value);
  }

  // 设置本地图片列表（替换）
  async function setLocalImages(dataUrls: string[]) {
    settings.value.localImages = dataUrls;
    settings.value.type = "local";
    currentLocalIndex.value = Math.floor(Math.random() * dataUrls.length);
    await saveWallpaper(settings.value);
  }

  // 移除本地图片
  async function removeLocalImage(index: number) {
    // 确保 localImages 是数组
    if (!Array.isArray(settings.value.localImages)) {
      settings.value.localImages = [];
      return;
    }
    settings.value.localImages.splice(index, 1);
    if (settings.value.localImages.length === 0) {
      settings.value.type = "default";
    } else if (currentLocalIndex.value >= settings.value.localImages.length) {
      currentLocalIndex.value = 0;
    }
    await saveWallpaper(settings.value);
  }

  // 设置默认静态壁纸索引
  async function setDefaultIndex(index: number) {
    settings.value.defaultIndex = index;
    settings.value.type = "default";
    await saveWallpaper(settings.value);
  }

  // 设置动态壁纸索引
  async function setDynamicIndex(index: number) {
    settings.value.dynamicIndex = index;
    settings.value.type = "dynamic";
    await saveWallpaper(settings.value);
  }

  // 选择 Bing 今日壁纸
  async function selectBingWallpaper() {
    settings.value.type = "bing";
    await fetchBingWallpaper();
    await saveWallpaper(settings.value);
  }

  // 下载 Bing 壁纸原图
  function downloadBingWallpaper() {
    if (bingWallpaper.value?.url) {
      const link = document.createElement("a");
      link.href = bingWallpaper.value.url;
      link.download = `bing-wallpaper-${new Date().toISOString().split("T")[0]}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // 刷新随机本地图片
  function refreshRandomLocal() {
    if (settings.value.localImages.length > 1) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * settings.value.localImages.length);
      } while (newIndex === currentLocalIndex.value);
      currentLocalIndex.value = newIndex;
    }
  }

  async function setBlur(blur: boolean) {
    settings.value.blur = blur;
    await saveWallpaper(settings.value);
  }

  async function setBlurAmount(amount: number) {
    settings.value.blurAmount = amount;
    await saveWallpaper(settings.value);
  }

  async function setBrightness(brightness: number) {
    settings.value.brightness = brightness;
    await saveWallpaper(settings.value);
  }

  async function reset() {
    settings.value = {
      type: "default",
      url: null,
      localData: null,
      localImages: [],
      defaultIndex: 0,
      dynamicIndex: 0,
      blur: true,
      blurAmount: 30,
      brightness: 100,
    };
    currentLocalIndex.value = 0;
    bingWallpaper.value = null;
    await saveWallpaper(settings.value);
  }

  return {
    settings,
    loading,
    currentUrl,
    wallpaperStyle,
    currentLocalIndex,
    bingWallpaper,
    isVideoWallpaper,
    init,
    setType,
    setUrl,
    setLocalImage,
    addLocalImages,
    setLocalImages,
    removeLocalImage,
    setDefaultIndex,
    setDynamicIndex,
    selectBingWallpaper,
    downloadBingWallpaper,
    fetchBingWallpaper,
    refreshRandomLocal,
    setBlur,
    setBlurAmount,
    setBrightness,
    reset,
  };
});

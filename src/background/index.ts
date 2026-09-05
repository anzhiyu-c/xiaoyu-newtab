// Background service worker for Chrome extension
// Handles API requests that need to bypass CORS restrictions

import browser from "webextension-polyfill";

interface BingResponse {
  images?: Array<{
    url: string;
    copyright: string;
    title: string;
  }>;
}

interface MessageRequest {
  type: string;
}

interface BingWallpaperData {
  url: string;
  copyright?: string;
  title?: string;
}

// Listen for messages from the extension pages
browser.runtime.onMessage.addListener((message: unknown) => {
  const request = message as MessageRequest;
  if (request.type === "FETCH_BING_WALLPAPER") {
    return fetchBingWallpaper()
      .then(data => ({ success: true, data }))
      .catch((error: Error) => ({ success: false, error: error.message }));
  }
  return undefined;
});

async function fetchBingWallpaper(): Promise<BingWallpaperData> {
  const response = await fetch("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: BingResponse = await response.json();

  if (!data.images || !data.images[0]) {
    throw new Error("No images found in Bing response");
  }

  const image = data.images[0];
  return {
    url: `https://www.bing.com${image.url}`,
    copyright: image.copyright,
    title: image.title,
  };
}

// Log when the service worker starts
console.log("s1rius标签页 background service worker started");

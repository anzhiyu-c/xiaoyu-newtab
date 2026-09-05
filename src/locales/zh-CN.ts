// 简体中文语言包
export default {
  // 通用
  common: {
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    reset: "重置",
    confirm: "确定",
    close: "关闭",
    search: "搜索",
    loading: "加载中...",
    noData: "暂无数据",
  },

  // 搜索框
  search: {
    placeholder: "搜索",
    clearHistory: "清除历史记录",
  },

  // 问候语
  greeting: {
    morning: "早上好",
    noon: "中午好",
    afternoon: "下午好",
    evening: "晚上好",
    night: "夜深了",
  },

  // 应用网格
  appGrid: {
    add: "添加",
    confirmDelete: '确定要删除 "{name}" 吗？',
  },

  // 编辑应用对话框
  editApp: {
    addApp: "添加应用",
    editApp: "编辑应用",
    name: "名称",
    namePlaceholder: "应用名称",
    url: "链接",
    urlPlaceholder: "https://example.com",
    icon: "图标",
    iconColor: "图标颜色",
    addToDock: "添加到 Dock 栏",
  },

  // 设置菜单
  settingsMenu: {
    general: "常规设置",
    search: "搜索引擎偏好",
    wallpaper: "壁纸偏好",
    sync: "账号同步",
    helpFeedback: "帮助和反馈",
    about: "关于",
  },

  // 常规设置
  generalSettings: {
    title: "常规设置",
    searchPlaceholder: "搜索设置",

    // 颜色分类
    color: "颜色",
    accentColor: "主题色",
    darkMode: "深色主题",
    darkModeSystem: "跟随系统",
    darkModeOn: "开启",
    darkModeOff: "关闭",
    wallpaperVignette: "为壁纸应用暗角滤镜",

    // 通用分类
    general: "通用",
    language: "语言",
    poetry: "「一言」",
    poetryDesc: "聚焦到搜索栏时，在其下方空白处随机显示一句格言或诗词。",
    showFullNote: "完整显示固定到主屏幕的便笺内容",

    // 时间分类
    time: "时间",
    use24Hour: "24 小时制",
    showSeconds: "显示秒钟",
    blinkSeparator: "闪烁时间分隔符",
    timeFont: "时间字体",
    timeFontSize: "时间字体大小",
    fontNormal: "常规",
    fontMedium: "中等",
    fontSemibold: "半粗",
    fontBold: "粗体",

    // 初始化分类
    initialization: "初始化",
    autoFocusSearch: "s1rius标签页加载时自动聚焦到搜索栏",
    autoShowAppGrid: "s1rius标签页加载时自动显示二级界面",
    showGreeting: "登录后显示问候",
    username: "用户名",
    usernamePlaceholder: "设置你的用户名",

    // 控制提示
    extensionControlled: "由扩展控制",
    extensionHint: "请前往s1rius标签页扩展的设置中更改此选项。",
    hint: "提示",
    ok: "好的",

    // 视效和性能分类
    performance: "视效和性能",
    smoothMode: "流畅模式",
    smoothModeDesc: "调整或关闭大部分视觉特效以提升性能。",
    reduceMotion: "减弱动态效果",
    reduceMotionDesc: "动效显示不流畅或影响您的鼠标操作时，可以开启此项。",
    searchBoxAnimation: "为搜索栏应用伸缩动效",
    overlayBlur: "为遮罩层应用毛玻璃效果",
    overlayBlurDesc: "关闭此项可提升性能。",
    shortcutBlur: "为捷径应用毛玻璃效果",
    shortcutBlurDesc: "关闭此项可提升性能。",
    wallpaperResolution: "每日壁纸分辨率",
    resolution1080p: "1080P",
    resolutionOriginal: "原图",

    // 搜索分类
    searchSection: "搜索",
    autoClearSearchBar: "自动清空搜索栏",
    searchHistory: "搜索历史记录",
    tabSwitchBehavior: "在搜索栏按 Tab / Shift + Tab 键时，切换到",
    tabSwitchEngine: "列表中的下一个 / 上一个搜索引擎",
    tabSwitchSuggestion: "搜索建议",
    tabSwitchRecent: "最近使用的上一个搜索引擎",
    tabSwitchControl: "界面中的下一个 / 上一个控件",

    // 导航分类
    navigation: "导航",
    showShortcutDock: "捷径坞",
    openInNewTab: "在新页面打开搜索结果和网站捷径",
    showMoreShortcuts: "在每行显示更多捷径",
    showMoreShortcutsDesc: "仅在您设备屏幕的逻辑分辨率宽度 ≥ 1280 像素时生效。",

    // 重置
    resetShortcuts: "重置预设捷径",
    resetShortcutsDesc: "将预设捷径还原为初始状态。",
    resetShortcutsTitle: "重置预设捷径",
    resetShortcutsConfirm: "确定要将捷径重置为初始状态吗？此操作将清除所有自定义捷径。",

    // 搜索结果
    noResults: "没有找到匹配的设置",
  },

  // 搜索设置
  searchSettings: {
    title: "搜索引擎偏好",
    selectDefault: "选择默认搜索引擎",
    browserDefault: "浏览器默认",
    browserDefaultDesc: "使用浏览器设置的默认搜索引擎",
    addCustom: "自定义搜索引擎",
    addCustomTitle: "添加自定义搜索引擎",
    editCustomTitle: "编辑自定义搜索引擎",
    name: "名称",
    namePlaceholder: "例如：Google",
    url: "URL",
    urlPlaceholder: "https://www.google.com/search?q=%s",
    urlHint: "以 https:// 开头，用 %s 代替搜索词",
    icon: "图标",
    iconHint: "Iconify 图标名称，例如：ri:google-fill",
    fillRequired: "请填写名称和 URL",
    urlInvalid: "URL 必须以 https:// 或 http:// 开头",
    urlMissingPlaceholder: "URL 中必须包含 %s 作为搜索词占位符",
    confirmDelete: '确定要删除"{name}"吗？',
  },

  // 壁纸设置
  wallpaperSettings: {
    title: "壁纸偏好",
    custom: "自定义",
    customTitle: "将您喜爱的图片或视频设为壁纸。",
    customDesc: "支持选择多张本地图片，起始页每次加载时随机显示一张。",
    localImage: "本地图片 / 视频",
    onlineImage: "在线图片链接",
    aiGenerate: "AI 作图",
    aiGenerateHint: "使用 Nano Banana AI 生成壁纸",
    today: "今日",
    downloadOriginal: "下载原图",
    imageSource: "图片来源：必应",
    dynamic: "动态",
    default: "默认",
    onlineImageTitle: "在线图片链接",
  },

  // 账号同步设置
  syncSettings: {
    title: "账号同步",
    enable: "启用账号同步",
    enableDesc: "启用后，你的设置、应用和壁纸将自动同步到你的浏览器账号",
    syncing: "正在同步数据...",
    checkingData: "正在检查云端数据...",
    migratingData: "正在迁移本地数据到云端...",
    enablingSync: "正在启用同步...",
    chromeEdge: "Chrome/Edge：",
    chromeEdgeDesc: "自动同步到你的 Google 或 Microsoft 账号",
    firefox: "Firefox：",
    firefoxDesc: "自动同步到你的 Firefox 账号",
    note: "注意：",
    noteDesc: "需要登录浏览器账号并启用同步功能",
    limits: "同步限制",
    limitStorage: "同步存储限制：约 100KB",
    limitItem: "单个项目限制：约 8KB",
    limitExceed: "超出限制将自动切换回本地存储",
  },

  // 关于
  about: {
    title: "关于",
    appName: "s1rius标签页",
    version: "版本",
    description: "一个简洁、美观、可定制的浏览器起始页。",
    github: "GitHub",
    website: "官网",
    feedback: "反馈",
    builtWith: "使用 Vue 3 + TypeScript + TailwindCSS 构建",
  },

  // 便笺
  notes: {
    title: "便笺",
    newNote: "新便笺",
    noNotes: "暂无便笺",
    selectOrCreate: "选择或创建一个便笺",
    placeholder: "在此键入以创建新的便笺",
    wordCount: "{count} 个字",
    saved: "已保存",
    saving: "保存中...",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
    pin: "固定到主屏幕",
    unpin: "取消固定",
    preview: "Markdown 预览",
    splitView: "分屏预览",
    maxPinned: "最多只能固定 {count} 个便笺",
  },

  // Dock 栏
  dock: {
    apps: "应用",
  },
};

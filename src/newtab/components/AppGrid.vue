<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { VueDraggable } from "vue-draggable-plus";
import { useI18n } from "vue-i18n";
import { useAppsStore } from "@/stores/apps";
import { useSettingsStore } from "@/stores/settings";
import type { AppItem } from "@/types";
import EditAppDialog from "./EditAppDialog.vue";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "open-notes"): void;
}>();

const appsStore = useAppsStore();
const settingsStore = useSettingsStore();

// 屏幕宽度检测
const windowWidth = ref(window.innerWidth);

function updateWindowWidth() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener("resize", updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});

// 计算每行显示的列数
const gridColumns = computed(() => {
  const width = windowWidth.value;
  const showMore = settingsStore.settings.showMoreShortcutsPerRow;

  // 当宽度 >= 1280px 且开启"显示更多捷径"时
  if (width >= 1280 && showMore) {
    return 7;
  }

  // 640px+ 默认 5 列
  if (width >= 640) {
    return 5;
  }

  // 480px+ 默认 5 列
  if (width >= 480) {
    return 5;
  }

  // 默认 4 列
  return 4;
});

// 判断是否是默认的白色背景色
function isDefaultWhiteBg(color: string | null | undefined): boolean {
  if (!color) return true;
  const normalized = color.toLowerCase().trim();
  return (
    normalized === "#ffffff" ||
    normalized === "#fff" ||
    normalized === "rgb(255, 255, 255)" ||
    normalized === "rgba(255, 255, 255, 1)" ||
    normalized === "white"
  );
}

// 判断是否使用默认背景色
function useDefaultBg(app: AppItem) {
  return !app.backgroundColor || isDefaultWhiteBg(app.backgroundColor);
}

// 判断是否使用默认图标颜色
function useDefaultIconColor(app: AppItem) {
  return !app.iconColor;
}

// 判断是否为默认应用（id 为 "1" 到 "10"）
function isDefaultApp(app: AppItem): boolean {
  const id = parseInt(app.id, 10);
  return !isNaN(id) && id >= 1 && id <= 10;
}

// 判断是否为内置内部应用（特殊 URL，如 #notes、#theme-toggle）
function isInternalApp(app: AppItem): boolean {
  return app.url.startsWith("#");
}

// 获取应用的 CSS 变量样式（用于自定义颜色）
function getAppCssVars(app: AppItem) {
  const vars: Record<string, string> = {};

  // 只在有自定义颜色时设置 CSS 变量
  if (app.backgroundColor && !isDefaultWhiteBg(app.backgroundColor)) {
    vars["--app-bg-color"] = app.backgroundColor;
  }

  if (app.iconColor) {
    vars["--app-icon-color"] = app.iconColor;
  }

  return Object.keys(vars).length > 0 ? vars : undefined;
}

const editingApp = ref<AppItem | null>(null);
const showEditDialog = ref(false);
const isNewApp = ref(false);

// 使用 ref 替代 computed，以便 VueDraggable 能正确工作
const sortedApps = ref<AppItem[]>([]);
const isDragging = ref(false);

// 监听 store 变化并更新 sortedApps
watch(
  () => appsStore.allApps,
  newApps => {
    sortedApps.value = [...newApps];
  },
  { immediate: true, deep: true }
);

// 拖拽开始
function onDragStart() {
  isDragging.value = true;
}

// 拖拽结束后更新顺序并持久化
async function onDragEnd() {
  isDragging.value = false;
  try {
    await appsStore.reorderApps(sortedApps.value);
  } catch (error) {
    console.error("保存应用顺序失败:", error);
  }
}

function handleAppClick(app: AppItem) {
  // 如果正在拖拽，不触发点击事件
  if (isDragging.value) {
    return;
  }
  if (app.url === "#theme-toggle") {
    settingsStore.toggleTheme();
  } else if (app.url === "#notes") {
    emit("open-notes");
  } else {
    window.open(app.url, "_blank");
  }
}

function handleEdit(app: AppItem) {
  // 禁止编辑内置内部应用（#notes、#theme-toggle 等）
  if (isInternalApp(app)) {
    return;
  }
  editingApp.value = { ...app };
  isNewApp.value = false;
  showEditDialog.value = true;
}

function handleDelete(app: AppItem) {
  // 禁止删除默认应用
  if (isDefaultApp(app)) {
    return;
  }
  if (confirm(t("appGrid.confirmDelete", { name: app.name }))) {
    appsStore.deleteApp(app.id);
  }
}

function handleAddNew() {
  editingApp.value = {
    id: "",
    name: "",
    url: "",
    icon: "ri:link",
    iconType: "iconify",
    iconColor: "",
    backgroundColor: "",
    isInDock: false,
    order: 0,
  };
  isNewApp.value = true;
  showEditDialog.value = true;
}

function handleSaveApp(app: AppItem) {
  if (isNewApp.value) {
    appsStore.addApp(app);
  } else {
    appsStore.updateApp(app.id, app);
  }
  showEditDialog.value = false;
  editingApp.value = null;
}

function handleCloseDialog() {
  showEditDialog.value = false;
  editingApp.value = null;
}

// 处理容器点击：只在点击应用卡片或按钮时阻止冒泡，点击空白区域允许冒泡
function handleContainerClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 如果点击的是应用卡片、按钮或其子元素，阻止冒泡
  const isInteractive = target.closest(".app-icon-card, .app-icon-card *, button, button *");
  if (isInteractive) {
    e.stopPropagation();
  }
  // 否则允许事件冒泡，让父组件处理关闭逻辑
}
</script>

<template>
  <!-- App grid container -->
  <div
    class="app-grid-container"
    :class="{ 'app-grid-container-expanded': windowWidth >= 1280 && settingsStore.settings.showMoreShortcutsPerRow }"
    @click="handleContainerClick"
  >
    <div class="app-grid" :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
      <VueDraggable
        v-model="sortedApps"
        :animation="150"
        class="draggable-contents"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <div
          v-for="app in sortedApps"
          :key="app.id"
          :data-app-id="app.id"
          class="app-grid-item group"
          :style="getAppCssVars(app)"
          @click="handleAppClick(app)"
        >
          <!-- App icon card -->
          <div
            class="app-icon-card app-icon"
            :class="{
              'app-icon-default-bg': useDefaultBg(app),
              'app-icon-custom-bg': !useDefaultBg(app),
              'app-icon-blur': settingsStore.settings.shortcutBlur,
            }"
          >
            <Icon
              v-if="app.iconType === 'iconify'"
              :icon="app.icon"
              class="icon-size"
              :class="{
                'app-icon-default-color': useDefaultIconColor(app),
                'app-icon-custom-color': !useDefaultIconColor(app),
              }"
            />
            <img v-else-if="app.iconType === 'url'" :src="app.icon" :alt="app.name" class="object-contain icon-size" />
            <span
              v-else
              class="text-xl font-bold sm:text-2xl"
              :class="{
                'app-icon-default-color': useDefaultIconColor(app),
                'app-icon-custom-color': !useDefaultIconColor(app),
              }"
            >
              {{ app.name.charAt(0) }}
            </span>
          </div>

          <!-- App name -->
          <span class="app-name">
            {{ app.name }}
          </span>

          <!-- Edit/Delete buttons on hover - 内部应用不显示编辑，默认应用不显示删除 -->
          <div v-if="!isInternalApp(app)" class="edit-buttons" @click.stop>
            <button class="edit-btn hover:text-accent" @click="handleEdit(app)">
              <Icon icon="ri:edit-line" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button v-if="!isDefaultApp(app)" class="edit-btn edit-btn-delete" @click="handleDelete(app)">
              <Icon icon="ri:delete-bin-line" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </VueDraggable>

      <!-- Add new app button - as a grid item -->
      <div class="app-grid-item">
        <button
          class="transition-all app-icon-card app-icon add-btn-bg add-btn-icon hover:add-btn-bg-hover hover:add-btn-icon-hover"
          @click.stop="handleAddNew"
        >
          <Icon icon="ri:add-line" class="icon-size" />
        </button>
        <span class="app-name">{{ t("appGrid.add") }}</span>
      </div>
    </div>
  </div>

  <!-- Edit dialog -->
  <EditAppDialog
    v-if="showEditDialog && editingApp"
    :app="editingApp"
    :is-new="isNewApp"
    @save="handleSaveApp"
    @close="handleCloseDialog"
  />
</template>

<style scoped>
/* 网格容器 - 响应式 */
.app-grid-container {
  position: relative;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
}

@media (min-width: 640px) {
  .app-grid-container {
    padding: 24px 32px;
  }
}

/* 网格布局 - 响应式列数（通过 inline style 动态控制） */
.app-grid {
  display: grid;
  /* grid-template-columns 由 Vue 动态绑定 */
  gap: 16px;
  justify-items: center;
}

@media (min-width: 480px) {
  .app-grid {
    gap: 20px;
  }
}

@media (min-width: 640px) {
  .app-grid {
    gap: 24px;
  }
}

/* 当显示更多捷径时，调整容器最大宽度 */
.app-grid-container-expanded {
  max-width: 880px !important;
}

.draggable-contents {
  display: contents;
}

/* 网格项 */
.app-grid-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

@media (min-width: 640px) {
  .app-grid-item {
    gap: 8px;
  }
}

/* 应用图标卡片 - 基础样式 */
.app-icon-card {
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.app-icon-card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.app-icon-card:active {
  transform: scale(0.98);
}

/* 应用图标 - 响应式尺寸 */
.app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
}

/* 默认背景色 - 使用 CSS 变量适配主题 */
.app-icon-default-bg {
  background-color: rgb(var(--dropdown-bg));
}

/* 自定义背景色 - 使用组件级 CSS 变量 */
.app-icon-custom-bg {
  background-color: var(--app-bg-color);
}

/* 毛玻璃效果 */
.app-icon-blur {
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  background-color: rgba(255, 255, 255, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

:global(.dark) .app-icon-blur {
  background-color: rgba(30, 30, 30, 0.7) !important;
}

/* 默认图标颜色 - 使用 CSS 变量适配主题 */
.app-icon-default-color {
  color: rgb(var(--color-text-muted));
}

/* 自定义图标颜色 - 使用组件级 CSS 变量 */
.app-icon-custom-color {
  color: var(--app-icon-color);
}

@media (min-width: 480px) {
  .app-icon {
    width: 64px;
    height: 64px;
  }
}

@media (min-width: 640px) {
  .app-icon {
    width: 72px;
    height: 72px;
  }
}

/* 图标尺寸 */
.icon-size {
  width: 24px;
  height: 24px;
}

@media (min-width: 480px) {
  .icon-size {
    width: 28px;
    height: 28px;
  }
}

@media (min-width: 640px) {
  .icon-size {
    width: 32px;
    height: 32px;
  }
}

/* 应用名称 - 使用 CSS 变量适配主题 */
.app-name {
  font-size: 11px;
  color: var(--app-name-color);
  text-shadow: var(--app-name-shadow);
  text-align: center;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

@media (min-width: 480px) {
  .app-name {
    font-size: 12px;
    max-width: 72px;
  }
}

@media (min-width: 640px) {
  .app-name {
    font-size: 13px;
    max-width: 80px;
  }
}

/* 编辑按钮 */
.edit-buttons {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.app-grid-item:hover .edit-buttons,
.app-grid-item:active .edit-buttons {
  opacity: 1;
}

@media (min-width: 640px) {
  .edit-buttons {
    top: -8px;
    right: -8px;
    gap: 4px;
  }
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: rgb(var(--dropdown-bg));
  color: rgb(var(--color-text-muted));
  box-shadow: var(--shadow-sm);
  transition: color 0.15s ease;
}

.edit-btn:hover {
  color: rgb(var(--color-accent));
}

.edit-btn-delete:hover {
  color: rgb(var(--color-danger));
}

@media (min-width: 640px) {
  .edit-btn {
    width: 24px;
    height: 24px;
  }
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.text-muted {
  color: rgb(var(--color-text-muted));
}

.text-accent {
  color: rgb(var(--color-accent));
}

.add-btn-bg {
  background: rgb(var(--color-border) / 0.3);
}

.hover\:add-btn-bg-hover:hover {
  background: rgb(var(--color-border) / 0.5);
}

.add-btn-icon {
  color: rgba(255, 255, 255, 0.85);
}

.hover\:add-btn-icon-hover:hover {
  color: rgba(255, 255, 255, 1);
}

/* 拖拽时的样式 */
.app-grid-item.sortable-chosen {
  cursor: grab;
}

.app-grid-item.sortable-ghost {
  opacity: 0.5;
}

.app-grid-item.sortable-drag {
  opacity: 0.8;
  cursor: grabbing;
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 移动设备上移除悬停效果，改用触摸反馈 */
  .app-icon-card:hover {
    transform: none;
  }

  .app-icon-card:active {
    transform: scale(0.95);
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useNotesStore } from "@/stores/notes";
import { useSettingsStore } from "@/stores/settings";
import type { NoteItem } from "@/types";

const emit = defineEmits<{
  (e: "open-notes", noteId?: string): void;
}>();

const notesStore = useNotesStore();
const settingsStore = useSettingsStore();

// 是否显示完整内容
const showFullContent = computed(() => settingsStore.settings.showFullNote);

// marked 模块（延迟加载）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markedModule: any = null;

async function parseMarkdown(content: string): Promise<string> {
  if (!markedModule) {
    markedModule = await import("marked");
  }
  return markedModule.marked(content) as string;
}

// 每条便笺渲染后的 markdown HTML
const markdownHtmlMap = ref<Record<string, string>>({});

watch(
  [() => notesStore.pinnedNotes, showFullContent],
  async ([notes, full]) => {
    if (!full) {
      markdownHtmlMap.value = {};
      return;
    }
    const map: Record<string, string> = {};
    for (const note of notes) {
      try {
        const content = note.content.length > 200 ? note.content.substring(0, 200) + "..." : note.content || "空便笺";
        map[note.id] = await parseMarkdown(content);
      } catch {
        map[note.id] = note.content;
      }
    }
    markdownHtmlMap.value = map;
  },
  { immediate: true, deep: true }
);

// 获取便笺显示内容（预览模式用）
function getNotePreviewContent(note: NoteItem): string {
  return notesStore.getNotePreview(note);
}

// 取消固定
async function handleUnpin(e: MouseEvent, noteId: string) {
  e.stopPropagation();
  await notesStore.unpin(noteId);
}

// 点击便笺打开弹窗
function handleNoteClick(noteId: string) {
  emit("open-notes", noteId);
}
</script>

<template>
  <div v-if="notesStore.pinnedNotes.length > 0" class="pinned-notes-container">
    <TransitionGroup name="pinned-note">
      <div
        v-for="note in notesStore.pinnedNotes"
        :key="note.id"
        class="pinned-note"
        @click="handleNoteClick(note.id)"
      >
        <!-- Close button -->
        <button class="pinned-note-close" @click="handleUnpin($event, note.id)" title="取消固定">
          <Icon icon="ri:close-line" class="w-3.5 h-3.5" />
        </button>

        <!-- Content -->
        <div class="pinned-note-content">
          <!-- 完整模式：渲染 markdown -->
          <div
            v-if="showFullContent"
            class="pinned-note-markdown markdown-preview"
            v-html="markdownHtmlMap[note.id] || ''"
          />
          <!-- 预览模式：纯文本单行 -->
          <p v-else class="pinned-note-text">
            {{ getNotePreviewContent(note) }}
          </p>
          <span class="pinned-note-date">{{ notesStore.formatDate(note.updatedAt) }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.pinned-notes-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
}

@media (max-width: 640px) {
  .pinned-notes-container {
    top: 12px;
    left: 12px;
    max-width: 200px;
  }
}

.pinned-note {
  position: relative;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:global(.dark) .pinned-note {
  background: rgba(30, 30, 30, 0.9);
}

.pinned-note:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.pinned-note-full {
  max-width: 280px;
}

/* Close button - hidden by default, show on hover */
.pinned-note-close {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 1;
}

.pinned-note:hover .pinned-note-close {
  opacity: 1;
}

.pinned-note-close:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

/* Content */
.pinned-note-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pinned-note-text {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

:global(.dark) .pinned-note-text {
  color: rgba(255, 255, 255, 0.9);
}

.pinned-note-text-full {
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
}

/* Markdown 渲染样式 */
.pinned-note-markdown {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  max-height: 13.5em;
  word-break: break-word;
}

:global(.dark) .pinned-note-markdown {
  color: rgba(255, 255, 255, 0.9);
}

.pinned-note-markdown :deep(h1),
.pinned-note-markdown :deep(h2),
.pinned-note-markdown :deep(h3),
.pinned-note-markdown :deep(h4),
.pinned-note-markdown :deep(h5),
.pinned-note-markdown :deep(h6) {
  font-weight: 600;
  margin-top: 0.5em;
  margin-bottom: 0.25em;
}

.pinned-note-markdown :deep(h1) { font-size: 1rem; }
.pinned-note-markdown :deep(h2) { font-size: 0.9375rem; }
.pinned-note-markdown :deep(h3) { font-size: 0.875rem; }

.pinned-note-markdown :deep(p) {
  margin-bottom: 0.5em;
}

.pinned-note-markdown :deep(ul),
.pinned-note-markdown :deep(ol) {
  padding-left: 1.25em;
  margin-bottom: 0.5em;
}

.pinned-note-markdown :deep(li) {
  margin-bottom: 0.1em;
}

.pinned-note-markdown :deep(code) {
  padding: 0.1em 0.3em;
  font-size: 0.8em;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

:global(.dark) .pinned-note-markdown :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.pinned-note-markdown :deep(pre) {
  padding: 0.5em;
  margin-bottom: 0.5em;
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  overflow-x: auto;
}

:global(.dark) .pinned-note-markdown :deep(pre) {
  background-color: rgba(255, 255, 255, 0.08);
}

.pinned-note-markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}

.pinned-note-markdown :deep(blockquote) {
  padding-left: 0.75em;
  margin-bottom: 0.5em;
  border-left: 2px solid rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.6);
}

:global(.dark) .pinned-note-markdown :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
}

.pinned-note-markdown :deep(a) {
  color: rgb(var(--color-accent));
  text-decoration: underline;
}

.pinned-note-markdown :deep(hr) {
  margin: 0.5em 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
}

:global(.dark) .pinned-note-markdown :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.15);
}

.pinned-note-date {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.45);
}

:global(.dark) .pinned-note-date {
  color: rgba(255, 255, 255, 0.5);
}

/* Transition animations */
.pinned-note-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pinned-note-leave-active {
  transition: all 0.2s ease-in;
}

.pinned-note-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.pinned-note-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.pinned-note-move {
  transition: transform 0.3s ease;
}
</style>

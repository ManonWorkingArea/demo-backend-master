<template>
  <div v-if="visible" class="fixed z-[9999] inset-0 bg-black bg-opacity-30 flex items-center justify-center">
    <!-- Clean Light Window -->
    <div class="bg-white text-gray-800 shadow-lg w-screen h-screen flex flex-col border border-gray-200">

      <!-- 1. Simple Title Bar -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <h2 class="text-lg font-medium text-gray-700">CSS Editor</h2>
        </div>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close CSS Editor"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
        </button>
      </div>

      <!-- 2. Simple Navigation -->
      <div class="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <span>โปรเจกต์</span>
          <span class="text-gray-400">/</span>
          <span>หน้าออกแบบ</span>
          <span class="text-gray-400">/</span>
          <span class="text-gray-700 font-medium">CSS</span>
        </div>
      </div>

      <!-- 3. Editor Area -->
      <div class="flex-1 p-2 bg-white overflow-hidden">
        <div class="h-full bg-gray-50 border border-gray-200 overflow-hidden">
          <codemirror
            v-model="editableCssCode"
            placeholder="/* เขียน CSS ของคุณที่นี่ */"
            :style="{ height: '100%', width: '100%' }"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="extensions"
            class="w-full h-full"
          />
        </div>
      </div>

      <!-- 4. Simple Status Bar -->
      <div class="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span>CSS</span>
          <span>{{ lineCount }} บรรทัด</span>
          <span>{{ characterCount }} ตัวอักษร</span>
        </div>
        <div class="text-green-600">
          <span>●</span>
          <span class="ml-1">พร้อม</span>
        </div>
      </div>

      <!-- 5. Action Buttons -->
      <div class="flex justify-end items-center px-4 py-3 bg-white border-t border-gray-200 space-x-2">
        <button
          @click="formatCode"
          class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors"
        >
          จัดรูปแบบ
        </button>
        <button
          @click="handleSave"
          class="px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          บันทึก
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { Codemirror } from "vue-codemirror";
import { css } from "@codemirror/lang-css";
import { EditorView } from "@codemirror/view";

export default {
  name: "CssEditorModal",
  components: {
    Codemirror,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    initialCssCode: {
      type: String,
      default: "",
    },
  },
  emits: ["save", "close"],
  data() {
    return {
      editableCssCode: this.initialCssCode,
      extensions: [
        css(),
        EditorView.lineWrapping,
        EditorView.theme({
          "&": {
            fontSize: "14px",
            backgroundColor: "#f8f9fa",
          },
          ".cm-content": {
            fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            padding: "12px",
            color: "#374151",
            backgroundColor: "#f8f9fa",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-gutters": {
            backgroundColor: "#f1f3f4",
            color: "#6b7280",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "#e5e7eb",
          },
          ".cm-scroller": {
            fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
          },
          ".cm-selectionBackground": {
            backgroundColor: "#dbeafe !important",
          },
          // CSS Syntax Colors (Light Theme)
          ".cm-property": {
            color: "#0369a1", // Blue
          },
          ".cm-atom": {
            color: "#059669", // Green
          },
          ".cm-string": {
            color: "#dc2626", // Red
          },
          ".cm-keyword": {
            color: "#7c3aed", // Purple
          },
          ".cm-bracket": {
            color: "#374151", // Gray
          },
          ".cm-comment": {
            color: "#9ca3af", // Light gray
            fontStyle: "italic"
          }
        })
      ],
    };
  },
  computed: {
    lineCount() {
      return this.editableCssCode.split('\n').length;
    },
    characterCount() {
      return this.editableCssCode.length;
    }
  },
  watch: {
    initialCssCode(newVal) {
      this.editableCssCode = newVal;
    },
    visible(newVal) {
      if (newVal) {
        this.editableCssCode = this.initialCssCode;
        document.addEventListener('keydown', this.handleKeyDown);
      } else {
        document.removeEventListener('keydown', this.handleKeyDown);
      }
    }
  },
  methods: {
    handleSave() {
      this.$emit("save", this.editableCssCode);
    },
    handleClose() {
      this.$emit("close");
    },
    formatCode() {
      let formatted = this.editableCssCode
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      this.editableCssCode = formatted;
    },
    handleKeyDown(event) {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.handleSave();
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
};
</script>

<style scoped>
/* Simple, clean styles */
:deep(.cm-editor.cm-focused) {
  outline: none;
}

/* Clean scrollbar */
:deep(.cm-scroller::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.cm-scroller::-webkit-scrollbar-track) {
  background: #f3f4f6;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background: #d1d5db;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background: #9ca3af;
}

/* Simple transitions */
.transition-colors {
  transition: color 0.15s ease;
}

button:hover {
  transition: all 0.15s ease;
}
</style> 
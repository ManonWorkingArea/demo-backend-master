<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">
            <img v-if="localItem && localItem.url" :src="localItem.url" alt="Preview Image" class="w-12 h-12 object-cover rounded-md bg-gray-200"/>
            <div v-else class="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate" :title="localItem && localItem.filename ? localItem.filename : 'No filename'">
              {{ localItem && localItem.filename ? localItem.filename : 'No filename' }}
            </p>
            <p class="text-xs text-gray-500">
              File: <span class="font-semibold truncate" :title="localItem.fileurl">{{ localItem.fileurl || 'No file selected'}}</span>
            </p>
            <p class="text-xs text-gray-500">
              Display: <span class="font-semibold">{{ localItem && localItem.display ? (localItem.display === 'download' ? 'Download' : 'Preview') : 'N/A' }}</span>
            </p>
            <p v-if="localItem && localItem.display === 'preview'" class="text-xs text-gray-500">
              Download Allowed: <span class="font-semibold">{{ localItem.canDownload ? 'Yes' : 'No' }}</span>
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <FileBrowser
        class="z-[9999]"
        v-if="isPreviewImageBrowserOpen"
        :isWindowsOpen="true"
        :callbackFunction="'image_preview'"
        :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
        @file-browser-trigger="changePreviewFileImageTrigger"
        @file-browser-callback="selectPreviewFileImageTrigger"
      />

      <FileBrowser
        class="z-[9999]"
        v-if="isFileUrlBrowserOpen" 
        :isWindowsOpen="true"
        :callbackFunction="'preview_fileurl'" 
        :allowFileType="['pdf']" 
        @file-browser-trigger="changeFileUrlBrowserTrigger"
        @file-browser-callback="selectFileUrlBrowserTrigger"
      />

      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-file-alt text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Preview File Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของไฟล์ตัวอย่าง</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <!-- File Name & File URL -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
            <div>
              <label class="popup-label font-semibold mb-1">ชื่อไฟล์:</label>
              <input
                v-model="localItem.filename"
                type="text"
                class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="popup-label font-semibold mb-1">ไฟล์ (URL):</label>
              <div class="flex">
                <input
                  v-model="localItem.fileurl"
                  type="text"
                  class="popup-input flex-grow rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  @click="triggerOpenFileUrlBrowser" 
                  class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
                >
                  Select File
                </button>
              </div>
            </div>
          </div>

          <!-- Preview Image -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label class="popup-label font-semibold mb-1">รูปตัวอย่าง (URL):</label>
            <div class="relative w-full h-48 flex items-center justify-center cursor-pointer border border-gray-200 rounded-md overflow-hidden mt-1" @click="triggerOpenPreviewImageBrowser">
              <img
                v-if="localItem.url"
                :src="localItem.url"
                alt="Selected Image"
                class="object-cover w-full h-full"
              />
              <span v-else class="text-gray-400 text-sm">ยังไม่ได้เลือกรูป</span>
              <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-75 bg-black bg-opacity-25 transition-opacity pointer-events-none">
                <span class="text-white text-center p-2 text-sm">
                  <i class="fas fa-upload text-white text-lg mr-1"></i>
                  คลิ๊กเพื่อเลือกรูปภาพ
                </span>
              </div>
            </div>
          </div>

          <!-- Display Mode & Download Option -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="popup-label block mb-1 font-semibold">การแสดงผลหลัก:</label>
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="download"
                      v-model="localItem.display"
                      class="form-radio"
                    />
                    <span class="ml-2 text-sm">Direct Download</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="preview"
                      v-model="localItem.display"
                      class="form-radio"
                    />
                    <span class="ml-2 text-sm">Preview</span>
                  </label>
                </div>
              </div>
              <div v-if="localItem.display === 'preview'">
                <label class="popup-label block mb-1 font-semibold">ตัวเลือกสำหรับ Preview Mode:</label>
                <label class="inline-flex items-center">
                  <input
                    v-model="localItem.canDownload"
                    type="checkbox"
                    class="form-checkbox rounded"
                  />
                  <span class="ml-2 text-sm">Allow Download from Preview</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import FileBrowser from "@/interface/modal/FileBrowser.vue";

export default {
  name: 'PreviewElement',
  components: {
    FileBrowser,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
  },
  emits: ['update-item'], // Removed 'open-file-preview-browser'
  data() {
    return {
      localItem: JSON.parse(JSON.stringify(this.item)),
      isPreviewImageBrowserOpen: false,
      isFileUrlBrowserOpen: false, // Added for fileurl browser
    };
  },
  watch: {
    item: {
      handler(newItem) {
        if (JSON.stringify(newItem) !== JSON.stringify(this.localItem)) {
          this.localItem = JSON.parse(JSON.stringify(newItem));
        }
      },
      deep: true,
    },
    localItem: {
      handler(updatedLocalItem) {
        if (JSON.stringify(updatedLocalItem) !== JSON.stringify(this.item)) {
          this.$emit('update-item', JSON.parse(JSON.stringify(updatedLocalItem)));
        }
      },
      deep: true,
    },
  },
  methods: {
    triggerOpenPreviewImageBrowser() {
      this.isPreviewImageBrowserOpen = true;
    },
    changePreviewFileImageTrigger(payload) {
      this.isPreviewImageBrowserOpen = payload;
    },
    selectPreviewFileImageTrigger(payload) {
      if (payload && payload.file) {
        this.localItem = {
          ...this.localItem,
          url: payload.file
        };
      }
      this.isPreviewImageBrowserOpen = false;
    },

    triggerOpenFileUrlBrowser() {
      this.isFileUrlBrowserOpen = true;
    },
    changeFileUrlBrowserTrigger(payload) {
      this.isFileUrlBrowserOpen = payload;
    },
    selectFileUrlBrowserTrigger(payload) {
      if (payload && payload.file) {
        this.localItem = {
          ...this.localItem,
          fileurl: payload.file
        };
      }
      this.isFileUrlBrowserOpen = false;
    },
  }
};
</script>

<style scoped>
/* Scoped styles for PreviewElement */
.content-editor {
  /* Styles from the original template were kept, they are specific to edit mode */
}
.popup-label {
  /* Common label styling if needed */
  font-size: 0.875rem; /* text-sm */
  color: #4a5568; /* gray-700 */
  margin-bottom: 0.25rem;
}
.popup-input {
  /* Common input styling */
  border-width: 1px;
  border-color: #e2e8f0; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.form-checkbox, .form-radio {
    color: #4f46e5; /* indigo-600 */
}
.form-checkbox:focus, .form-radio:focus {
    ring-color: #818cf8; /* indigo-300 */
}
.section-group {
  margin-bottom: 1rem;
}
/* Additional styling for preview mode if necessary */
</style> 
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.75.75 0 010 1.656l-5.603 3.113A.75.75 0 019 15.935V8.065a.75.75 0 011.307-.513l5.603 3.113z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 6.375A2.625 2.625 0 119.375 6.375 2.625 2.625 0 014.5 6.375zm0 11.25A2.625 2.625 0 119.375 17.625 2.625 2.625 0 014.5 17.625zm0-11.25h1.034a2.625 2.625 0 000-2.25H4.5zm0 11.25h1.034a2.625 2.625 0 000-2.25H4.5zm10.034-8.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V11.25zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15.75zM6.75 9.75A.75.75 0 016 9V7.5a.75.75 0 01.75-.75H18a.75.75 0 01.75.75v10.5A.75.75 0 0118 18.75H6.75a.75.75 0 01-.75-.75V15a.75.75 0 01.75-.75h11.25a.75.75 0 000-1.5H6.75A.75.75 0 016 12v-1.5a.75.75 0 01.75-.75H18a.75.75 0 000-1.5H6.75z" />
            </svg>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">Video</p>
            <p class="text-xs text-gray-500 truncate" :title="localItem.url || 'No URL'">
              {{ localItem.url || 'No URL provided' }}
            </p>
            <p class="text-xs text-gray-500">
              Autoplay: {{ localItem.autoplay ? 'Yes' : 'No' }} | Controls: {{ localItem.controls ? 'Yes' : 'No' }}
            </p>
          </div>
        </div>
        <div v-if="localItem.url" class="video-container mt-4">
          <video
            :src="localItem.url"
            :autoplay="localItem.autoplay"
            :controls="localItem.controls"
            style="max-width:100%;height:auto;border-radius:0.5rem;"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-video text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Video Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของวิดีโอ</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
            <label class="popup-label block font-semibold mb-1">Video URL or Path:</label>
            <div class="flex items-center space-x-2">
              <input
                type="text"
                id="videoUrl"
                v-model="localItem.url"
                @input="updateLocalItem"
                class="popup-input flex-grow rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video URL or select a file"
              />
              <button
                @click="openVideoFileBrowser"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Select File
              </button>
            </div>
            <div v-if="localItem.url" class="video-container mt-4">
              <video
                :src="localItem.url"
                :autoplay="localItem.autoplay"
                :controls="localItem.controls"
                style="max-width:100%;height:auto;border-radius:0.5rem;"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="inline-flex items-center">
              <input v-model="localItem.autoplay" type="checkbox" @change="updateLocalItem" class="form-checkbox rounded" />
              <span class="ml-2 popup-label">Autoplay</span>
            </label>
            <label class="inline-flex items-center">
              <input v-model="localItem.controls" type="checkbox" @change="updateLocalItem" class="form-checkbox rounded" />
              <span class="ml-2 popup-label">Show Controls</span>
            </label>
          </div>
        </div>
      </div>
    </template>

     <!-- File Browser Modal -->
    <FileBrowser
      v-if="fileBrowserOpen"
      :isWindowsOpen="fileBrowserOpen"
      :allowFileType="['mp4', 'webm', 'mov', 'avi', 'wmv', 'flv', 'ogg']"
      :callbackFunction="'videoFileSelected'"
      @file-browser-trigger="fileBrowserOpen = false"
      @file-browser-callback="handleVideoFileSelected"
      class="z-[9999]"
    />
  </div>
</template>

<script>
import FileBrowser from "@/interface/modal/FileBrowser.vue";

export default {
  name: 'VideoElement',
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
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      fileBrowserOpen: false,
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaultValues = {
          url: '',
          autoplay: false,
          controls: true,
        };
        const initialData = { ...defaultValues, ...newItem };
        if (JSON.stringify(initialData) !== JSON.stringify(this.localItem)) {
            this.localItem = JSON.parse(JSON.stringify(initialData));
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateLocalItem() {
      this.$emit('update-item', JSON.parse(JSON.stringify(this.localItem)));
    },
    openVideoFileBrowser() {
      this.fileBrowserOpen = true;
    },
    handleVideoFileSelected(payload) {
      if (payload && payload.file) {
        this.localItem.url = payload.file;
        this.updateLocalItem();
      }
      this.fileBrowserOpen = false;
    },
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
  color: #4a5568; /* gray-700 */
}
.popup-input {
  border-width: 1px;
  border-color: #e2e8f0; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem; /* rounded-sm in some places, rounded here for consistency */
}
.form-checkbox {
  color: #4f46e5; /* indigo-600 */
}
.form-checkbox:focus {
  ring-color: #818cf8; /* indigo-300 */
}
.section-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
}
.video-container {
  width: 100%;
  max-width: 640px; /* Or your preferred max width */
  margin: auto;
}
.video-container video {
  width: 100%;
  height: auto;
  display: block;
}
</style> 
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">Internal Iframe</p>
            <p class="text-xs text-gray-500 truncate" :title="localItem.pageName || 'No page selected'">
              {{ localItem.pageName || 'ยังไม่ได้เลือกหน้าเว็บ' }}
            </p>
             <p class="text-xs text-gray-500">
              Mode: {{ localItem.mode || 'N/A' }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div
        class="content-editor overflow-auto"
        style="
          min-height: 600px;
          max-height: 600px;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          right: -20px;
        "
      >
        <div class="section-group">
          <div class="border-b border-gray-200 pb-3 mb-3">
            <span class="popup-label block font-bold text-lg">Internal Iframe Config</span>
            <span class="popup-label text-gray-500">Configure the internal iframe content.</span>
          </div>
        </div>

        <div class="section-group space-y-4">
          <div>
            <label class="popup-label block mb-1 font-semibold">Display Mode:</label>
            <select v-model="localItem.mode" @change="updateLocalItem" class="popup-input w-full">
              <option value="form">แบบฟอร์ม (Form)</option>
              <option value="standalone">หน้าเว็บ (Standalone Page)</option>
            </select>
          </div>

          <div>
            <label class="popup-label block mb-2 font-semibold">Select Page:</label>
            <div v-if="postItems && postItems.length > 0" class="max-h-96 overflow-y-auto border rounded-md p-2 bg-gray-50 space-y-1">
              <div
                v-for="post in postItems"
                :key="post._id"
                class="p-2 rounded-md hover:bg-gray-100 cursor-pointer border"
                :class="{'bg-blue-100 border-blue-300': localItem.page === post._id}"
                @click="selectPage(post)"
              >
                <p class="text-sm font-medium text-gray-800">{{ post.title }}</p>
                <p class="text-xs text-gray-500">ID: {{ post._id }}</p>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 p-2 border rounded-md">
              No pages available to select. Ensure 'postItems' prop is provided.
            </div>
             <div v-if="localItem.pageName" class="mt-2 text-sm text-gray-600">
              Selected Page: <span class="font-semibold">{{ localItem.pageName }} (ID: {{localItem.page}})</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'IframeInternalElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
    postItems: { // Used in edit mode to select a page
      type: Array,
      default: () => [],
    },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaultValues = {
          page: null,
          pageName: '',
          mode: 'standalone', // Default mode
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
    selectPage(post) {
      if (post && post._id) {
        this.localItem.page = post._id;
        this.localItem.pageName = post.title || 'Untitled Page';
        this.updateLocalItem();
      }
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
  border-radius: 0.25rem;
}
.section-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
}
</style> 
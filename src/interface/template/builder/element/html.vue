<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div v-html="localItem.content || 'No content available'"></div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-code text-yellow-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">HTML Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ HTML</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label class="popup-label block font-semibold mb-1">Raw HTML:</label>
            <textarea
              v-model="localItem.content"
              @input="updateItem('content', localItem.content)"
              class="w-full h-32 html-textarea rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      default: "preview", // or 'edit'
    },
  },
  data() {
    return {
      localItem: { ...this.item }, // Create a local copy of the item prop
    };
  },
  methods: {
    updateItem(key, value) {
      this.localItem[key] = value;
      this.$emit("update-item", { ...this.localItem });
    },
  },
  watch: {
    item: {
      handler(newVal) {
        this.localItem = { ...newVal };
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
/* Add any necessary styles here */
.html-textarea {
  font-family: monospace;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
}
</style>

<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Select File' }}<span v-if="localItem.required" class="text-xs text-red-500 ml-1">* จำเป็น</span></label>
          <input
            :multiple="localItem.multipleFiles"
            :required="localItem.required"
            :accept="localItem.fileTypeLimit ? localItem.fileTypeLimit.split(',').map(t => '.' + t.trim()).join(',') : null"
            type="file"
            class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <div class="mt-3 text-sm text-gray-600 space-y-1">
            <div v-if="localItem.fileSizeLimit">
              📦 Max File Size: <strong>{{ localItem.fileSizeLimit }}MB</strong>
            </div>
            <div v-if="localItem.itemLimit">
              📁 Max Files: <strong>{{ localItem.itemLimit }}</strong>
            </div>
            <div v-if="localItem.fileTypeLimit">
              📜 Allowed Types: <strong>{{ localItem.fileTypeLimit }}</strong>
            </div>
          </div>
        </div>
      </form>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-upload text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">File Upload Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของฟิลด์อัปโหลดไฟล์</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
            <div>
              <label class="popup-label block font-semibold mb-1">ชื่อ:</label>
              <input
                v-model="localItem.name"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">ข้อความเมื่อผิดพลาด:</label>
              <input
                v-model="localItem.reqError"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">File Size Limit (MB):</label>
              <input
                v-model="localItem.fileSizeLimit"
                type="number"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper">Enter the maximum file size allowed for each uploaded file (in megabytes).</span>
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">Item Limit:</label>
              <input
                v-model="localItem.itemLimit"
                type="number"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper">Enter the maximum number of files that can be uploaded.</span>
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">File Type Limit:</label>
              <input
                v-model="localItem.fileTypeLimit"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper">Enter the allowed file types/extensions (e.g., jpg, png, pdf). Separate multiple types with commas.</span>
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">Upload Folder:</label>
              <input
                v-model="localItem.uploadFolder"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper">Enter the folder path where the uploaded files will be stored.</span>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 mt-4">
            <div class="flex items-center">
              <input
                v-model="localItem.showPreview"
                type="checkbox"
                class="popup-checkbox mr-2"
                id="showPreview"
              />
              <label for="showPreview" class="popup-label text-sm">Show Preview</label>
            </div>
            <div class="flex items-center">
              <input
                v-model="localItem.multipleFiles"
                type="checkbox"
                class="popup-checkbox mr-2"
                id="multipleFiles"
              />
              <label for="multipleFiles" class="popup-label text-sm">Multiple Files</label>
            </div>
            <div class="flex items-center">
              <input
                v-model="localItem.required"
                type="checkbox"
                class="popup-checkbox mr-2"
                id="required"
              />
              <label for="required" class="popup-label text-sm">Required</label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "Upload",
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
      previewFiles: [], // Simulated preview of uploaded files
    };
  },
  computed: {
    previewUploadLabel() {
      if (this.localItem.fileTypeLimit) {
        return `Allowed Types: ${this.localItem.fileTypeLimit}`;
      } else {
        return "Select File";
      }
    },
  },
  methods: {
    updateItem(key, value) {
      this.$emit("update-item", { ...this.localItem, [key]: value });
    },
    simulateUpload() {
      // This method can simulate uploading files and add them to previewFiles
      this.previewFiles = [{ name: "example1.jpg" }, { name: "example2.pdf" }];
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
  mounted() {
    if (this.mode === "preview" && this.localItem.showPreview) {
      this.simulateUpload(); // Simulate uploaded files for preview
    }
  },
};
</script>

<style scoped>
.simulation {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
  display: inline-block;
}
.popup-input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}
.popup-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.popup-checkbox {
  margin-right: 5px;
}
.popup-helper {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>

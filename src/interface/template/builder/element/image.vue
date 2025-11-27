<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2">
        <img
          v-if="localItem.url"
          :src="localItem.url"
          :alt="localItem.alt || ''"
          :style="{ width: localItem.width + 'px' }"
        />
        <div v-else class="no-content">No Image</div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <FileBrowser
        class="z-[9999]"
        v-if="FileImageBrowserOpen"
        :isWindowsOpen="true"
        :callbackFunction="'document'"
        :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
        @file-browser-trigger="changeFileImageTrigger"
        @file-browser-callback="selectFileImageTrigger"
      />

      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-image text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Image Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของรูปภาพ</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <!-- Image Preview & Select -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label class="popup-label block font-semibold mb-1">เลือกรูปภาพ</label>
            <div class="relative w-full h-48 flex items-center justify-center cursor-pointer border border-gray-200 rounded-md overflow-hidden" @click="triggerOpenFileBrowser">
              <img
                v-if="localItem.url"
                :src="localItem.url"
                alt="Selected Image"
                class="object-cover w-full h-full"
              />
              <span v-else class="text-gray-400">ยังไม่ได้เลือกรูป</span>
              <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                <span class="text-white bg-black p-2 rounded-md">
                  <i class="fas fa-upload text-white text-lg mr-2"></i>
                  คลิ๊กเพื่อเลือกรูปภาพ
                </span>
              </div>
            </div>
          </div>

          <!-- Image Options -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="inline-flex items-center">
                  <input
                    v-model="localItem.showShadow"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span class="ml-2">แสดงเงาของรูป</span>
                </label>
              </div>
              <div>
                <label class="inline-flex items-center">
                  <input
                    v-model="localItem.showHome"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span class="ml-2">Home Link</span>
                </label>
              </div>
            </div>

            <div class="mt-4">
              <label class="inline-flex items-center">
                <input
                  v-model="localItem.canLink"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="ml-2">สร้างลิงค์</span>
              </label>
            </div>

            <div v-if="localItem.canLink" class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label class="popup-label">ระบุลิงค์ปลายทางที่ต้องการ:</label>
                <input
                  v-model="localItem.link"
                  type="text"
                  class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="popup-label">เปิดลิงค์ใน:</label>
                <select
                  v-model="localItem.target"
                  class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">เลือกปลายทาง</option>
                  <option value="_self">หน้าเดิม</option>
                  <option value="_blank">หน้าใหม่</option>
                </select>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="popup-label">คำอธิบายรูปภาพ:</label>
                <input
                  v-model="localItem.alt"
                  type="text"
                  class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="popup-label">ขนาด (px):</label>
                <input
                  v-model="localItem.width"
                  type="text"
                  class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="mt-6">
              <label class="popup-label block font-semibold">Image Alignment</label>
              <div class="grid grid-cols-3 gap-4 mt-3">
                <label
                  v-for="alignment in ['left', 'center', 'right']"
                  :key="alignment"
                  class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-md transition-colors"
                  :class="{
                    'bg-blue-500 text-white border-blue-600': localItem.alignment === alignment,
                    'bg-gray-100 hover:bg-gray-200': localItem.alignment !== alignment
                  }"
                >
                  <input
                    type="radio"
                    v-model="localItem.alignment"
                    :value="alignment"
                    class="radio-input hidden"
                  />
                  <span class="text-center text-sm capitalize">{{ alignment }}</span>
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
  components: {
    FileBrowser,
  },
  name: 'ImageElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localItem: JSON.parse(JSON.stringify(this.item)),
      FileImageBrowserOpen: false,
    };
  },
  methods: {
    triggerOpenFileBrowser() {
      this.FileImageBrowserOpen = true;
    },
    changeFileImageTrigger(payload) {
      this.FileImageBrowserOpen = payload;
    },
    selectFileImageTrigger(payload) {
      if (payload && payload.file) {
        this.localItem = {
          ...this.localItem,
          url: payload.file
        };
      }
      this.FileImageBrowserOpen = false;
    },
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
};
</script>

<style scoped>
/* Styles are mostly inline in the template, but could be centralized here */
.content-editor {
  /* min-height: 600px; */ /* style is in template */
}
.form-checkbox {
  /* Add custom checkbox styles if needed, or rely on global/Tailwind styles */
}
.popup-input {
  /* Add custom input styles if needed */
}
.radio-label {
  /* Add custom radio label styles if needed */
}
.radio-input.hidden {
  display: none;
}
</style>

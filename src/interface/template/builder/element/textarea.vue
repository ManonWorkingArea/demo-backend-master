<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label :for="localItem.name" class="block popup-label font-semibold mb-1">{{ localItem.name || 'Textarea' }}</label>
          <textarea
            :id="localItem.name"
            :name="localItem.name"
            :placeholder="localItem.placeholder"
            :required="localItem.required"
            :rows="localItem.rows || 3"
            :cols="localItem.cols || 20"
            class="popup-input w-full"
          ></textarea>
          <span v-if="localItem.required" class="text-xs text-red-500">* Required</span>
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
              <i class="fas fa-align-left text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Textarea Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ textarea</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label class="popup-label block mb-1 font-semibold">Name (Label):</label>
              <input
                v-model="localItem.name"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Comments, Description"
              />
              <span class="popup-helper text-gray-500 text-sm">เพิ่มชื่อเพื่อระบุข้อมูล</span>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Placeholder:</label>
              <input
                v-model="localItem.placeholder"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Enter your comments here"
              />
              <span class="popup-helper text-gray-500 text-sm">เพิ่มข้อความแสดงตัวอย่างในช่องป้อนข้อมูล</span>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Required Error Message:</label>
              <input
                v-model="localItem.reqError"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Please enter your comments"
              />
              <span class="popup-helper text-gray-500 text-sm">เพิ่มข้อความที่จะแสดงเมื่อข้อมูลไม่ถูกต้อง</span>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Rows:</label>
              <input
                v-model.number="localItem.rows"
                type="number"
                min="1"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper text-gray-500 text-sm">กำหนดจำนวนแถวสำหรับช่องข้อมูล</span>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Cols (legacy):</label>
              <input
                v-model.number="localItem.cols"
                type="number"
                min="1"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span class="popup-helper text-gray-500 text-sm">กำหนดจำนวนคอลัมน์ (มักไม่จำเป็นสำหรับ modern CSS)</span>
            </div>
            <div class="flex items-center mt-2 md:col-span-2">
              <input v-model="localItem.required" type="checkbox" id="textarea_required" class="popup-checkbox mr-2" />
              <label for="textarea_required" class="popup-label font-semibold">Required</label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TextareaElement',
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
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          name: '',
          placeholder: '',
          reqError: '',
          rows: 3,
          cols: 20, // Standard HTML default
          required: false,
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
      },
      deep: true,
      immediate: true,
    },
    localItem: {
      handler(newItem) {
        this.$emit('update-item', JSON.parse(JSON.stringify(newItem)));
      },
      deep: true,
    },
  },
  created() {
    if (Object.keys(this.localItem).length === 0) {
        const defaults = {
          name: '',
          placeholder: '',
          reqError: '',
          rows: 3,
          cols: 20,
          required: false,
        };
        const currentItem = this.item && typeof this.item === 'object' ? this.item : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
    }
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
}
.popup-helper {
    font-size: 0.75rem; /* text-xs */
}
.popup-input {
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem; /* rounded-sm */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  background-color: white;
}
.popup-input:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6; 
}

.popup-checkbox {
  height: 1rem; 
  width: 1rem;
  border-radius: 0.25rem; 
  border-color: #d1d5db; 
  color: #4f46e5; 
}
</style> 
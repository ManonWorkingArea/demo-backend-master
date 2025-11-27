<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Hidden Input' }}</label>
          <input type="text" :name="localItem.name" :value="localItem.value" readonly class="w-full popup-input rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
        </div>
      </form>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-eye-slash text-gray-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Hidden Input Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าชื่อและค่าของ hidden field</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="popup-label block mb-1 font-semibold">Name:</label>
              <input
                v-model="localItem.name"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., user_id, source_tracking"
                @input="updateLocalItem"
              />
              <p class="text-xs text-gray-500 mt-1">This will be the `name` attribute of the hidden input field.</p>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Value:</label>
              <input
                v-model="localItem.value"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the value for the hidden field"
                @input="updateLocalItem"
              />
              <p class="text-xs text-gray-500 mt-1">This will be the `value` attribute of the hidden input field.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'HiddenElement',
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
          value: '',
        };
        // Ensure newItem is not null and is an object before spreading
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
  methods: {
    updateLocalItem() {
      // The watcher for localItem will emit the update.
    },
  },
  created() {
    // Fallback initialization, though immediate watcher on 'item' should cover this.
    if (Object.keys(this.localItem).length === 0 && this.item && typeof this.item === 'object') {
        const defaults = {
          name: '',
          value: '',
        };
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(this.item)) };
    } else if (Object.keys(this.localItem).length === 0) {
        // If item is also initially undefined or not an object, set to defaults
        this.localItem = { name: '', value: '' };
    }
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
}
.popup-input {
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem; /* rounded-sm */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
}
.section-group {
  /* Using p-1 on parent and gap for spacing */
}
</style> 
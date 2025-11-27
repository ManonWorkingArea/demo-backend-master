<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-4 bg-white flex items-center space-x-4">
          <i :class="localItem.iconClass" class="text-4xl"></i>
          <div>
            <h2 class="text-xl font-bold">{{ localItem.count }}</h2>
            <p class="text-sm text-gray-500">{{ localItem.label }}</p>
          </div>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Stats Card Config</span>
              <span class="popup-label text-gray-500">Configure the stats card content and icon</span>
            </div>
          </div>
      
          <!-- Full-width input for counter number -->
          <div class="section-group">
            <label class="popup-label">Counter Number:</label>
            <input v-model="localItem.count" type="text" class="w-full p-2 border rounded" @input="updateItem('count', localItem.count)" />
          </div>
      
          <!-- Full-width input for label text -->
          <div class="section-group">
            <label class="popup-label">Label Text:</label>
            <input v-model="localItem.label" type="text" class="w-full p-2 border rounded" @input="updateItem('label', localItem.label)" />
          </div>
      
          <!-- Full-width input for icon class -->
          <div class="section-group">
            <label class="popup-label">Icon Class:</label>
            <input v-model="localItem.iconClass" type="text" class="w-full p-2 border rounded" @input="updateItem('iconClass', localItem.iconClass)" />
            <span class="text-sm text-gray-500">Example: 'fas fa-shopping-cart'</span>
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
        default: 'preview', // or 'edit'
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
        this.$emit('update-item', { ...this.localItem });
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
  .popup-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  </style>
  
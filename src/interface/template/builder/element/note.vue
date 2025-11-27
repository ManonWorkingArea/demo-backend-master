<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2 text-sm">
          <p><strong>Header Text:</strong> {{ localItem.headerTitle || 'No header text provided' }}</p>
          <p><strong>Subtitle Text:</strong> {{ localItem.subtitle || 'No subtitle text provided' }}</p>
          <p><strong>Content Text:</strong> {{ localItem.content || 'No content text provided' }}</p>
          <p><strong>Show Date:</strong> {{ localItem.showDate ? 'Yes' : 'No' }}</p>
          <p><strong>Header Background Color:</strong> {{ localItem.headerBgColor || 'No color selected' }}</p>
          <p><strong>Text Color:</strong> {{ localItem.contentTextColor || 'No color selected' }}</p>
          <p><strong>Background Color:</strong> {{ localItem.contentBgColor || 'No color selected' }}</p>
          <p><strong>Line Color:</strong> {{ localItem.contentLineColor || 'No color selected' }}</p>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Note Widget Config</span>
              <span class="popup-label text-gray-500">Configure the note widget content, colors, and visibility options</span>
            </div>
          </div>
      
          <!-- Full-width inputs for header and subtitle -->
          <div class="section-group">
            <label class="popup-label">Header Text:</label>
            <input v-model="localItem.headerTitle" type="text" class="w-full p-2 border rounded" @input="updateItem('headerTitle', localItem.headerTitle)" />
          </div>
      
          <div class="section-group">
            <label class="popup-label">Subtitle Text:</label>
            <textarea v-model="localItem.subtitle" class="w-full p-2 border rounded" @input="updateItem('subtitle', localItem.subtitle)"></textarea>
          </div>
      
          <!-- Three-column grid layout -->
          <div class="grid grid-cols-3 gap-4">
            <div class="relative">
              <label class="block popup-label">Header Background Color:</label>
              <input v-model="localItem.headerBgColor" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPicker('headerBgColor')" />
              <div v-if="showColorPickerField === 'headerBgColor'">
                <input class="absolute right-2 top-[32px] w-35 h-35" type="color" v-model="localItem.headerBgColor" @input="updateColor('headerBgColor')" @click.stop />
              </div>
            </div>
      
            <div class="relative">
              <label class="block popup-label">Content Text Color:</label>
              <input v-model="localItem.contentTextColor" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPicker('contentTextColor')" />
              <div v-if="showColorPickerField === 'contentTextColor'">
                <input class="absolute right-2 top-[32px] w-35 h-35" type="color" v-model="localItem.contentTextColor" @input="updateColor('contentTextColor')" @click.stop />
              </div>
            </div>
      
            <div class="relative">
              <label class="block popup-label">Content Background Color:</label>
              <input v-model="localItem.contentBgColor" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPicker('contentBgColor')" />
              <div v-if="showColorPickerField === 'contentBgColor'">
                <input class="absolute right-2 top-[32px] w-35 h-35" type="color" v-model="localItem.contentBgColor" @input="updateColor('contentBgColor')" @click.stop />
              </div>
            </div>
      
            <div class="relative">
              <label class="block popup-label">Content Line Color:</label>
              <input v-model="localItem.contentLineColor" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPicker('contentLineColor')" />
              <div v-if="showColorPickerField === 'contentLineColor'">
                <input class="absolute right-2 top-[32px] w-35 h-35" type="color" v-model="localItem.contentLineColor" @input="updateColor('contentLineColor')" @click.stop />
              </div>
            </div>
      
            <div class="section-group">
              <label class="popup-label">Show Date:</label>
              <div>
                <label>
                  <input type="checkbox" v-model="localItem.showDate" @change="updateItem('showDate', localItem.showDate)" />
                  Show Note Date
                </label>
              </div>
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
        default: 'preview', // or 'edit'
      },
    },
    data() {
      return {
        localItem: { ...this.item }, // Create a local copy of the item prop
        showColorPickerField: null,
      };
    },
    methods: {
      updateItem(key, value) {
        this.localItem[key] = value;
        this.$emit('update-item', { ...this.localItem });
      },
      showColorPicker(field) {
        this.showColorPickerField = field;
      },
      updateColor(field) {
        this.updateItem(field, this.localItem[field]);
        this.showColorPickerField = null;
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
  .html-textarea {
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
  }
  </style>
  
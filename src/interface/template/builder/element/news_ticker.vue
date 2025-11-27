<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 text-sm">
        <h1>News Ticker Configuration</h1>
        <p><strong>Ticker Text:</strong> {{ localItem.text || 'No content available' }}</p>
        <p><strong>Ticker Speed:</strong> {{ localItem.speed || 'Default speed' }}</p>
        <p><strong>Direction:</strong> {{ localItem.direction || 'Not specified' }}</p>
        <p><strong>Text Color:</strong> {{ localItem.textColor || 'Default color' }}</p>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
        <div class="section-group">
          <div class="border-b border-gray-200 pb-3 mb-3">
            <span class="popup-label block font-bold text-lg">News Ticker Config</span>
            <span class="popup-label text-gray-500">Configure the news ticker content, speed, direction, and text color</span>
          </div>
        </div>
    
        <div class="section-group">
          <label class="popup-label">Ticker Text:</label>
          <textarea v-model="localItem.text" class="w-full h-32 html-textarea" @input="updateItem('text', localItem.text)"></textarea>
        </div>
    
        <!-- Three-column grid layout -->
        <div class="grid grid-cols-3 gap-4">
          <div class="section-group">
            <label class="popup-label">Ticker Speed:</label>
            <input type="number" v-model="localItem.speed" class="w-full p-2 border rounded" @input="updateItem('speed', localItem.speed)" />
          </div>
    
          <div class="relative">
            <label class="block popup-label">Text Color: </label>
            <input v-model="localItem.textColor" type="text" class="w-full popup-input rounded-sm border border-gray-200" @click="showColorPicker('textColor')" />
            <div v-if="showColorPickerField === 'textColor'">
              <input class="absolute right-2 top-[32px] w-35 h-35" type="color" v-model="localItem.textColor" @input="updateItem('textColor', localItem.textColor)" @click.stop />
            </div>
          </div>
    
          <div class="section-group">
            <label class="popup-label">Direction:</label>
            <div>
              <label>
                <input type="radio" v-model="localItem.direction" value="left" @change="updateItem('direction', 'left')" />
                Left
              </label>
              <label class="ml-4">
                <input type="radio" v-model="localItem.direction" value="right" @change="updateItem('direction', 'right')" />
                Right
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

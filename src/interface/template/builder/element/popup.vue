<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <label class="popup-label">Popup Alert Text:</label>
        <input v-model="localItem.popupText" type="text" class="popup-input w-full p-2 border rounded" placeholder="Enter text for the popup alert" disabled/>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Popup Config</span>
              <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
            </div>
          </div>
  
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="popup-label">Popup Title:</label>
              <input v-model="localItem.title" type="text" class="w-full popup-input" @input="updateItem('title', $event.target.value)" />
            </div>
  
            <div>
              <label class="popup-label">Popup Delay (ms):</label>
              <input v-model="localItem.delay" type="number" class="w-full popup-input" @input="updateItem('delay', $event.target.value)" />
            </div>
  
            <div class="col-span-2">
              <label class="popup-label">Popup Content Type:</label>
              <div class="flex items-center mt-2">
                <label class="radio-label flex items-center mr-4">
                  <input type="radio" v-model="localItem.contentType" value="image" class="radio-input" @change="updateItem('contentType', 'image')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Image</span>
                </label>
                <label class="radio-label flex items-center mr-4">
                  <input type="radio" v-model="localItem.contentType" value="video" class="radio-input" @change="updateItem('contentType', 'video')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Video</span>
                </label>
                <label class="radio-label flex items-center">
                  <input type="radio" v-model="localItem.contentType" value="text" class="radio-input" @change="updateItem('contentType', 'text')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Text</span>
                </label>
              </div>
            </div>
  
            <div class="col-span-2" v-if="localItem.contentType === 'image'">
              <label class="popup-label">Image URL:</label>
              <input v-model="localItem.imageUrl" type="text" class="w-full popup-input" @input="updateItem('imageUrl', $event.target.value)" />
            </div>
  
            <div class="col-span-2" v-if="localItem.contentType === 'video'">
              <label class="popup-label">Video URL:</label>
              <input v-model="localItem.videoUrl" type="text" class="w-full popup-input" @input="updateItem('videoUrl', $event.target.value)" />
            </div>
  
            <div class="col-span-2" v-if="localItem.contentType === 'text'">
              <label class="popup-label">Text Content:</label>
              <textarea v-model="localItem.textContent" class="w-full h-32 popup-textarea" @input="updateItem('textContent', $event.target.value)"></textarea>
            </div>
  
            <div class="col-span-2">
              <label class="popup-label">Popup Display:</label>
              <div class="flex items-center mt-2">
                <label class="radio-label flex items-center mr-4">
                  <input type="radio" v-model="localItem.displayType" value="firstVisit" class="radio-input" @change="updateItem('displayType', 'firstVisit')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">First Visit Only</span>
                </label>
                <label class="radio-label flex items-center">
                  <input type="radio" v-model="localItem.displayType" value="everyReload" class="radio-input" @change="updateItem('displayType', 'everyReload')" />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">Every Page Reload</span>
                </label>
              </div>
            </div>
  
            <div class="col-span-2">
              <label class="popup-label">Autoclose:</label>
              <div class="flex items-center mt-2">
                <label class="checkbox-label flex items-center">
                  <input type="checkbox" v-model="localItem.autoclose" class="checkbox-input" @change="updateItem('autoclose', $event.target.checked)">
                  <span class="checkbox-icon"></span>
                  <span class="text-sm text-gray-500">Enable Autoclose</span>
                </label>
              </div>
            </div>
  
            <div class="col-span-2" v-if="localItem.autoclose">
              <label class="popup-label">Autoclose Delay (ms):</label>
              <input v-model="localItem.autocloseDelay" type="number" class="w-full popup-input" @input="updateItem('autocloseDelay', $event.target.value)">
            </div>
  
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Popup',
    props: {
      item: {
        type: Object,
        required: true
      },
      mode: {
        type: String,
        required: true,
        default: 'preview' // or 'edit'
      }
    },
    data() {
      return {
        localItem: { ...this.item } // Create a local copy of the item prop
      };
    },
    methods: {
      updateItem(key, value) {
        this.$emit('update-item', { ...this.localItem, [key]: value });
      }
    },
    watch: {
      item: {
        handler(newVal) {
          this.localItem = { ...newVal };
        },
        deep: true
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any necessary styles here */
  </style>
  
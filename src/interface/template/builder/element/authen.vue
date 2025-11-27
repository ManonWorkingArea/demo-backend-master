<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2 text-sm">
          <h1>Authentication Configuration</h1>
          <p><strong>Check:</strong> {{ localItem.check }}</p>
          <p><strong>Condition:</strong> {{ localItem.condition }}</p>
          <div v-if="localItem.condition === 'redirect'">
            <p><strong>Redirect URL:</strong> <a :href="localItem.redirectUrl">{{ localItem.redirectUrl }}</a></p>
          </div>
          <div v-else-if="localItem.condition === 'popup'">
            <p><strong>Popup Message:</strong> {{ localItem.popupText }}</p>
          </div>
          <div v-else-if="localItem.condition === 'block'">
            <p><strong>Block Message:</strong> {{ localItem.blockText }}</p>
          </div>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Authen Config</span>
              <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
            </div>
          </div>
      
          <!-- Check Option Radiobox -->
          <div class="section-group">
            <label class="popup-label">Check:</label>
            <div class="flex space-x-4">
              <label>
                <input type="radio" v-model="localItem.check" value="user" @change="updateItem('check', 'user')" />
                User
              </label>
              <label>
                <input type="radio" v-model="localItem.check" value="guest" @change="updateItem('check', 'guest')" />
                Guest
              </label>
            </div>
          </div>
      
          <!-- Condition Option Radiobox -->
          <div class="section-group">
            <label class="popup-label">Condition:</label>
            <div class="flex space-x-4">
              <label>
                <input type="radio" v-model="localItem.condition" value="redirect" @change="updateItem('condition', 'redirect')" />
                Redirect
              </label>
              <label>
                <input type="radio" v-model="localItem.condition" value="popup" @change="updateItem('condition', 'popup')" />
                Popup
              </label>
              <label>
                <input type="radio" v-model="localItem.condition" value="block" @change="updateItem('condition', 'block')" />
                Block
              </label>
            </div>
          </div>
      
          <!-- Dynamic Input Fields Based on Condition -->
          <div class="section-group" v-if="localItem.condition === 'redirect'">
            <label class="popup-label">Redirect URL:</label>
            <input 
              v-model="localItem.redirectUrl" 
              type="text" 
              class="popup-input w-full p-2 border rounded" 
              placeholder="Enter URL to redirect" 
              @input="updateItem('redirectUrl', localItem.redirectUrl)" 
            />
          </div>
      
          <div class="section-group" v-else-if="localItem.condition === 'popup'">
            <label class="popup-label">Popup Message:</label>
            <input 
              v-model="localItem.popupText" 
              type="text" 
              class="popup-input w-full p-2 border rounded" 
              placeholder="Enter message to display in popup" 
              @input="updateItem('popupText', localItem.popupText)" 
            />
          </div>
      
          <div class="section-group" v-else-if="localItem.condition === 'block'">
            <label class="popup-label">Block Message:</label>
            <input 
              v-model="localItem.blockText" 
              type="text" 
              class="popup-input w-full p-2 border rounded" 
              placeholder="Enter message to display when blocked" 
              @input="updateItem('blockText', localItem.blockText)" 
            />
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
  
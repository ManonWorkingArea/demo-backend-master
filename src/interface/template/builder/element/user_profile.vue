<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2 text-sm">
          <p><strong>Show Profile Image:</strong> {{ localItem.showProfileImage ? 'Yes' : 'No' }}</p>
          <p><strong>Show User Information:</strong> {{ localItem.showUserInfo ? 'Yes' : 'No' }}</p>
          <p><strong>Show User Email:</strong> {{ localItem.showUserEmail ? 'Yes' : 'No' }}</p>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 300px; max-height: 300px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">User Profile Config</span>
              <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
            </div>
          </div>
  
          <!-- Show Profile Image Checkbox -->
          <div class="section-group">
            <label class="popup-label">Show Profile Image:</label>
            <input 
              type="checkbox" 
              v-model="localItem.showProfileImage" 
              @change="updateItem('showProfileImage', localItem.showProfileImage)" 
            />
          </div>
  
          <!-- Show User Information Checkbox -->
          <div class="section-group">
            <label class="popup-label">Show User Information:</label>
            <input 
              type="checkbox" 
              v-model="localItem.showUserInfo" 
              @change="updateItem('showUserInfo', localItem.showUserInfo)" 
            />
          </div>
  
          <!-- Show User Email Checkbox -->
          <div class="section-group">
            <label class="popup-label">Show User Email:</label>
            <input 
              type="checkbox" 
              v-model="localItem.showUserEmail" 
              @change="updateItem('showUserEmail', localItem.showUserEmail)" 
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
  
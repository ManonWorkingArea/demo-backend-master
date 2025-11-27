<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2 text-sm">
          <p><strong>Show Edit Profile Button:</strong> {{ localItem.showEditProfile ? 'Yes' : 'No' }}</p>
          <p v-if="localItem.showEditProfile"><strong>Edit Profile Button Name:</strong> {{ localItem.editProfileName }}</p>
          <p><strong>Show Logout Button:</strong> {{ localItem.showLogout ? 'Yes' : 'No' }}</p>
          <p v-if="localItem.showLogout"><strong>Logout Button Design:</strong> {{ localItem.logoutDesign }}</p>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 400px; max-height: 400px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">User Navigation Config</span>
              <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
            </div>
          </div>
  
          <!-- Show Edit Profile Button Checkbox -->
          <div class="section-group">
            <label class="popup-label">Show Edit Profile Button:</label>
            <input 
              type="checkbox" 
              v-model="localItem.showEditProfile" 
              @change="updateItem('showEditProfile', localItem.showEditProfile)" 
            />
          </div>
  
          <!-- Edit Profile Button Name Input -->
          <div class="section-group" v-if="localItem.showEditProfile">
            <label class="popup-label">Edit Profile Button Name:</label>
            <input 
              v-model="localItem.editProfileName" 
              type="text" 
              class="popup-input w-full p-2 border rounded" 
              placeholder="Enter button name" 
              @input="updateItem('editProfileName', localItem.editProfileName)" 
            />
          </div>
  
          <!-- Show Logout Button Checkbox -->
          <div class="section-group">
            <label class="popup-label">Show Logout Button:</label>
            <input 
              type="checkbox" 
              v-model="localItem.showLogout" 
              @change="updateItem('showLogout', localItem.showLogout)" 
            />
          </div>
  
          <!-- Logout Button Design Option -->
          <div class="section-group" v-if="localItem.showLogout">
            <label class="popup-label">Logout Button Design:</label>
            <div class="flex space-x-4">
              <label>
                <input 
                  type="radio" 
                  v-model="localItem.logoutDesign" 
                  value="icon" 
                  @change="updateItem('logoutDesign', 'icon')" 
                />
                Icon
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="localItem.logoutDesign" 
                  value="text" 
                  @change="updateItem('logoutDesign', 'text')" 
                />
                Text
              </label>
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
  
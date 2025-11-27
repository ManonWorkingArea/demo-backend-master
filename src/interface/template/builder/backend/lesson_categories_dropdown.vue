<template>
    <div>
      <label class="popup-label">ตัวเลือกที่จะใช้แสดงผล:</label>
      <div class="flex items-center mt-2">
        <label class="checkbox-label flex items-center mr-4">
          <input 
            type="checkbox" 
            :checked="selectedItem.categoriesDropdown" 
            @change="update('categoriesDropdown', $event.target.checked)" 
            class="checkbox-input" 
          />
          <span class="checkbox-icon mr-2"></span>
          <span class="text-sm text-gray-500">Dropdown</span>
        </label>
        <label class="checkbox-label flex items-center mr-4">
          <input 
            type="checkbox" 
            :checked="selectedItem.categoriesSearch" 
            @change="update('categoriesSearch', $event.target.checked)" 
            class="checkbox-input" 
          />
          <span class="checkbox-icon mr-2"></span>
          <span class="text-sm text-gray-500">Search</span>
        </label>
        <label class="checkbox-label flex items-center mr-4">
          <input 
            type="checkbox" 
            :checked="selectedItem.categoriesMenu" 
            @change="update('categoriesMenu', $event.target.checked)" 
            class="checkbox-input" 
          />
          <span class="checkbox-icon mr-2"></span>
          <span class="text-sm text-gray-500">Menu</span>
        </label>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      dataItem: {
        type: Object,
        required: true,
      },
    },
    computed: {
      // Create a computed alias for easier usage
      selectedItem() {
        return this.dataItem;
      },
    },
    methods: {
      update(field, value) {
        // Emit update event to the parent
        this.$emit('update', { field, value });
      },
    },
  };
  </script>
  
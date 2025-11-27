<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2">
        <h1>User Navigation</h1>

        <!-- Show Login -->
        <p v-if="localItem.showLogin"><strong>Login URL:</strong> <a :href="localItem.logicUrl">{{ localItem.logicUrl }}</a></p>

        <!-- Show Register -->
        <p v-if="localItem.showRegister"><strong>Register URL:</strong> <a :href="localItem.registerUrl">{{ localItem.registerUrl }}</a></p>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
        <div class="section-group">
          <div class="border-b border-gray-200 pb-3 mb-3">
            <span class="popup-label block font-bold text-lg">Usernav Config</span>
            <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
          </div>
        </div>

        <!-- Show Login Toggle -->
        <div class="section-group flex items-center mt-3">
          <input 
            type="checkbox" 
            id="showLogin" 
            v-model="localItem.showLogin" 
            @change="updateItem('showLogin', localItem.showLogin)" 
            class="mr-2"
          />
          <label for="showLogin" class="popup-label">Show Login Item</label>
        </div>

        <!-- Login URL (Visible only if "Show Login" is enabled) -->
        <div v-if="localItem.showLogin" class="section-group mt-3">
          <label class="popup-label">Login URL:</label>
          <input 
            v-model="localItem.logicUrl" 
            type="text" 
            class="popup-input" 
            @input="updateItem('logicUrl', localItem.logicUrl)" 
          />
        </div>

        <!-- Show Register Toggle -->
        <div class="section-group flex items-center mt-3">
          <input 
            type="checkbox" 
            id="showRegister" 
            v-model="localItem.showRegister" 
            @change="updateItem('showRegister', localItem.showRegister)" 
            class="mr-2"
          />
          <label for="showRegister" class="popup-label">Show Register Item</label>
        </div>

        <!-- Register URL (Visible only if "Show Register" is enabled) -->
        <div v-if="localItem.showRegister" class="section-group mt-3">
          <label class="popup-label">Register URL:</label>
          <input 
            v-model="localItem.registerUrl" 
            type="text" 
            class="popup-input" 
            @input="updateItem('registerUrl', localItem.registerUrl)" 
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

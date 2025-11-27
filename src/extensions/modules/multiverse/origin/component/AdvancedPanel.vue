<template>
  <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
    <h5 class="text-sm font-medium text-purple-800 mb-3 flex items-center">
      <font-awesome-icon :icon="['fas','code']" class="mr-2"/>
      ขั้นสูง
    </h5>

    <!-- Route Features -->
    <div class="mb-3 space-y-2">
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.hasSubmenu || false"
          @change="updateHasSubmenu($event.target.checked)"
          class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-purple-700">Has Submenu</span>
      </label>
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.hasDashboard || false"
          @change="updateHasDashboard($event.target.checked)"
          class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-purple-700">Has Dashboard</span>
      </label>
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.meta?.fullscreen || false"
          @change="updateFullscreen($event.target.checked)"
          class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-purple-700">Fullscreen</span>
      </label>
    </div>

    <!-- Collection Mapping -->
    <div class="mb-3">
      <label class="block text-xs font-medium text-purple-700 mb-1">Collection:</label>
      <select 
        :value="route.meta?.collection || ''"
        @change="updateCollection($event.target.value)"
        class="w-full text-xs border-purple-300 rounded focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
        <option v-for="option in collectionOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Custom Properties -->
    <div>
      <label class="block text-xs font-medium text-purple-700 mb-1">Custom Key:</label>
      <input 
        type="text" 
        :value="route.meta?.key || ''"
        @input="updateKey($event.target.value)"
        placeholder="custom-key"
        class="w-full text-xs border-purple-300 rounded focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdvancedPanel',
  props: {
    route: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      collectionOptions: [
        { value: '', label: 'No Collection' },
        { value: 'users', label: 'Users' },
        { value: 'content', label: 'Content' },
        { value: 'settings', label: 'Settings' },
        { value: 'logs', label: 'Logs' }
      ]
    };
  },
  methods: {
    updateHasSubmenu(value) {
      this.$emit('update-property', { property: 'hasSubmenu', value });
    },
    updateHasDashboard(value) {
      this.$emit('update-property', { property: 'hasDashboard', value });
    },
    updateFullscreen(value) {
      this.$emit('update-meta', { property: 'fullscreen', value });
    },
    updateCollection(value) {
      this.$emit('update-meta', { property: 'collection', value });
    },
    updateKey(value) {
      this.$emit('update-meta', { property: 'key', value });
    }
  }
};
</script>

<style scoped>
/* Advanced panel specific styles */
.advanced-panel {
  transition: all 0.2s ease;
}

.advanced-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 
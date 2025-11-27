<template>
  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
    <h5 class="text-sm font-medium text-green-800 mb-3 flex items-center">
      <font-awesome-icon :icon="['fas','bars']" class="mr-2"/>
      การแสดงผลเมนู
    </h5>

    <!-- Menu Visibility -->
    <div class="mb-3">
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.meta?.inMenu || false"
          @change="updateInMenu($event.target.checked)"
          class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-green-700">แสดงในเมนู</span>
      </label>
    </div>

    <!-- Navigation Position -->
    <div class="mb-3 space-y-2">
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.inApp === 'yes'"
          @change="updateInApp($event.target.checked)"
          class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-green-700">App Navigation</span>
      </label>
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.inTop === 'yes'"
          @change="updateInTop($event.target.checked)"
          class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-green-700">Top Navigation</span>
      </label>
    </div>

    <!-- Menu Icon -->
    <div class="mb-3">
      <label class="block text-xs font-medium text-green-700 mb-1">Icon:</label>
      <input 
        type="text" 
        :value="route.meta?.icon || ''"
        @input="updateIcon($event.target.value)"
        placeholder="file-alt"
        class="w-full text-xs border-green-300 rounded focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50">
    </div>

    <!-- Menu Order -->
    <div>
      <label class="block text-xs font-medium text-green-700 mb-1">Menu Order:</label>
      <select 
        :value="route.meta?.order || 0"
        @change="updateOrder(parseInt($event.target.value))"
        class="w-full text-xs border-green-300 rounded focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50">
        <option v-for="option in orderOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuPanel',
  props: {
    route: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      orderOptions: [
        { value: 0, label: 'Auto' },
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' }
      ]
    };
  },
  methods: {
    updateInMenu(value) {
      this.$emit('update-meta', { property: 'inMenu', value });
    },
    updateInApp(value) {
      this.$emit('update-property', { property: 'inApp', value: value ? 'yes' : 'no' });
    },
    updateInTop(value) {
      this.$emit('update-property', { property: 'inTop', value: value ? 'yes' : 'no' });
    },
    updateIcon(value) {
      this.$emit('update-meta', { property: 'icon', value });
    },
    updateOrder(value) {
      this.$emit('update-meta', { property: 'order', value });
    }
  }
};
</script>

<style scoped>
/* Menu panel specific styles */
.menu-panel {
  transition: all 0.2s ease;
}

.menu-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 
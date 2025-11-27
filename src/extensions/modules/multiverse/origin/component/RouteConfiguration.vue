<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Permissions & Access -->
    <PermissionsPanel 
      :route="route"
      @update-meta="$emit('update-meta', $event)"
      @update-role="$emit('update-role', $event)"
    />
    
    <!-- Menu & Display -->
    <MenuPanel 
      :route="route"
      @update-meta="$emit('update-meta', $event)"
      @update-property="$emit('update-property', $event)"
    />
    
    <!-- Advanced Settings -->
    <AdvancedPanel 
      :route="route"
      @update-meta="$emit('update-meta', $event)"
      @update-property="$emit('update-property', $event)"
    />
  </div>
</template>

<script>
import PermissionsPanel from './PermissionsPanel.vue';
import MenuPanel from './MenuPanel.vue';
import AdvancedPanel from './AdvancedPanel.vue';

export default {
  name: 'RouteConfiguration',
  components: {
    PermissionsPanel,
    MenuPanel,
    AdvancedPanel
  },
  props: {
    route: {
      type: Object,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    subModule: {
      type: String,
      required: true
    },
    parentPath: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 2
    }
  }
};
</script>

<style scoped>
/* Configuration specific styles */
.config-grid {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 
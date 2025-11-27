<template>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <h5 class="text-sm font-medium text-yellow-800 mb-3 flex items-center">
      <font-awesome-icon :icon="['fas','shield-alt']" class="mr-2"/>
      สิทธิ์และการเข้าถึง
    </h5>
    
    <!-- Authentication -->
    <div class="mb-3">
      <label class="inline-flex items-center">
        <input 
          type="checkbox" 
          :checked="route.meta?.auth || false"
          @change="updateAuth($event.target.checked)"
          class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
        <span class="ml-2 text-sm text-yellow-700">ต้องการ Authentication</span>
      </label>
    </div>

    <!-- Roles -->
    <div class="mb-3">
      <label class="block text-xs font-medium text-yellow-700 mb-2">User Roles:</label>
      <div class="grid grid-cols-2 gap-1">
        <template v-for="role in roles" :key="role">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              :checked="route.meta?.role?.includes(role) || false"
              @change="updateRole(role, $event.target.checked)"
              class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
            <span class="ml-1 text-xs text-yellow-700">{{ role }}</span>
          </label>
        </template>
      </div>
    </div>

    <!-- Route Type -->
    <div>
      <label class="block text-xs font-medium text-yellow-700 mb-1">Page Type:</label>
      <select 
        :value="route.meta?.type || 'page'"
        @change="updateType($event.target.value)"
        class="w-full text-xs border-yellow-300 rounded focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
        <option v-for="option in pageTypes" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PermissionsPanel',
  props: {
    route: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      roles: ['root', 'superadmin', 'admin', 'manager', 'member', 'guest', 'public'],
      pageTypes: [
        { value: 'page', label: 'Page' },
        { value: 'modal', label: 'Modal' },
        { value: 'popup', label: 'Popup' },
        { value: 'iframe', label: 'IFrame' }
      ]
    };
  },
  methods: {
    updateAuth(value) {
      this.$emit('update-meta', { property: 'auth', value });
    },
    updateRole(role, checked) {
      this.$emit('update-role', { role, checked });
    },
    updateType(value) {
      this.$emit('update-meta', { property: 'type', value });
    }
  }
};
</script>

<style scoped>
/* Permissions panel specific styles */
.permissions-panel {
  transition: all 0.2s ease;
}

.permissions-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 
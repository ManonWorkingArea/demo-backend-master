<template>
  <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <font-awesome-icon :icon="['fas','users-cog']" class="text-blue-500 mr-3"/>
        <div>
                      <h3 class="text-sm font-medium text-blue-800">User Role Permission Management</h3>
            <p class="mt-1 text-sm text-blue-700">จัดการสิทธิ์การเข้าถึงสำหรับ User Roles: Root, Superadmin, Admin, Manager, Public</p>
          <div v-if="isLoadingPermissions" class="flex items-center mt-1">
            <font-awesome-icon :icon="['fas','spinner']" class="animate-spin text-blue-500 mr-2"/>
            <span class="text-xs text-blue-600">กำลังโหลดการตั้งค่าสิทธิ์...</span>
          </div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="$emit('apply-bulk-permissions', 'all', true)"
          type="button"
          class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
          <font-awesome-icon :icon="['fas','check-circle']" class="mr-1"/>
          เปิดทั้งหมด
        </button>
        <button 
          @click="$emit('apply-bulk-permissions', 'all', false)"
          type="button"
          class="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
          <font-awesome-icon :icon="['fas','times-circle']" class="mr-1"/>
          ปิดทั้งหมด
        </button>
        <button 
          @click="$emit('preview-changes')"
          type="button"
          class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">
          <font-awesome-icon :icon="['fas','eye']" class="mr-1"/>
          ดูการเปลี่ยนแปลง
        </button>
        <button 
          @click="$emit('save-router-permissions')"
          type="button"
          :disabled="isSavingPermissions"
          class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <font-awesome-icon :icon="isSavingPermissions ? ['fas','spinner'] : ['fas','save']" :class="{'animate-spin': isSavingPermissions}" class="mr-1"/>
          {{ isSavingPermissions ? 'กำลังบันทึก...' : 'บันทึกสิทธิ์' }}
        </button>
        <button 
          @click="$emit('reset-to-default')"
          type="button"
          class="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
          <font-awesome-icon :icon="['fas','undo']" class="mr-1"/>
          รีเซ็ตเป็นค่าเริ่มต้น
        </button>
        <button 
          @click="$emit('export-permission-matrix')"
          type="button"
          class="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
          <font-awesome-icon :icon="['fas','download']" class="mr-1"/>
          Export Matrix
        </button>
      </div>
    </div>

    <!-- Role Permission Matrix -->
    <div class="bg-white rounded-lg border border-blue-200 overflow-hidden">
      <div class="bg-blue-100 px-4 py-3 border-b border-blue-200">
        <div class="grid grid-cols-12 gap-1 items-center">
          <div class="col-span-4 text-sm font-medium text-blue-900">Router / Route</div>
          <div class="col-span-1 text-center text-sm font-medium text-blue-900">
            <div class="flex items-center justify-center">
              <font-awesome-icon :icon="['fas','user-cog']" class="text-gray-800 mr-1"/>
              <span class="hidden lg:inline">Root</span>
            </div>
          </div>
          <div class="col-span-2 text-center text-sm font-medium text-blue-900">
            <div class="flex items-center justify-center">
              <font-awesome-icon :icon="['fas','crown']" class="text-yellow-500 mr-1"/>
              <span class="hidden md:inline">Superadmin</span>
              <span class="md:hidden">Super</span>
            </div>
          </div>
          <div class="col-span-2 text-center text-sm font-medium text-blue-900">
            <div class="flex items-center justify-center">
              <font-awesome-icon :icon="['fas','user-shield']" class="text-red-500 mr-1"/>
              Admin
            </div>
          </div>
          <div class="col-span-2 text-center text-sm font-medium text-blue-900">
            <div class="flex items-center justify-center">
              <font-awesome-icon :icon="['fas','user-tie']" class="text-purple-500 mr-1"/>
              Manager
            </div>
          </div>
          <div class="col-span-1 text-center text-sm font-medium text-blue-900">
            <div class="flex items-center justify-center">
              <font-awesome-icon :icon="['fas','globe']" class="text-green-500 mr-1"/>
              <span class="hidden lg:inline">Public</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <template v-for="(subModules, group) in routesByModule" :key="group">
          <!-- Group Header -->
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div class="grid grid-cols-12 gap-1 items-center">
              <div class="col-span-4 flex items-center">
                <font-awesome-icon :icon="['fas','folder']" class="text-blue-500 mr-2"/>
                <span class="font-medium text-gray-900 capitalize">{{ getGroupDisplayName(group) }}</span>
                <span class="ml-2 text-xs text-gray-500">({{ Object.keys(subModules).length }} sub-groups)</span>
              </div>
              <div class="col-span-1 text-center">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    :checked="isGroupRoleEnabled(group, 'root')"
                    @change="$emit('toggle-group-role', group, 'root', $event.target.checked)"
                    class="rounded border-gray-300 text-gray-800 shadow-sm focus:border-gray-400 focus:ring focus:ring-gray-200 focus:ring-opacity-50">
                </label>
              </div>
              <div class="col-span-2 text-center">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    :checked="isGroupRoleEnabled(group, 'superadmin')"
                    @change="$emit('toggle-group-role', group, 'superadmin', $event.target.checked)"
                    class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
                </label>
              </div>
              <div class="col-span-2 text-center">
                <label class="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    :checked="isGroupRoleEnabled(group, 'admin')"
                    @change="$emit('toggle-group-role', group, 'admin', $event.target.checked)"
                    class="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50">
                </label>
              </div>
              <div class="col-span-2 text-center">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    :checked="isGroupRoleEnabled(group, 'manager')"
                    @change="$emit('toggle-group-role', group, 'manager', $event.target.checked)"
                    class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
                </label>
              </div>
              <div class="col-span-1 text-center">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    :checked="isGroupRoleEnabled(group, 'public')"
                    @change="$emit('toggle-group-role', group, 'public', $event.target.checked)"
                    class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                </label>
              </div>
            </div>
          </div>

          <!-- Routes in Group -->
          <template v-for="(routes, subModule) in subModules" :key="subModule">
            <template v-for="route in routes" :key="route.path">
              <div class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                <div class="grid grid-cols-12 gap-1 items-center">
                  <div class="col-span-4">
                    <div class="flex items-center">
                      <div class="ml-4 flex items-center">
                        <font-awesome-icon :icon="route.meta?.icon ? ['fas', route.meta.icon] : ['fas','file']" class="text-gray-400 mr-2 text-sm"/>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ getRouteDisplayName(route) }}</div>
                          <div class="text-xs text-gray-500">{{ route.path }}</div>
                          <div class="text-xs text-gray-400">{{ subModule }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-1 text-center">
                    <label class="inline-flex items-center">
                      <input
                        type="checkbox"
                        :checked="route.meta?.role?.includes('root') || false"
                        @change="$emit('update-route-role', group, subModule, route.path, 'root', $event.target.checked)"
                        class="rounded border-gray-300 text-gray-800 shadow-sm focus:border-gray-400 focus:ring focus:ring-gray-200 focus:ring-opacity-50">
                    </label>
                  </div>
                  <div class="col-span-2 text-center">
                    <label class="inline-flex items-center">
                      <input
                        type="checkbox"
                        :checked="route.meta?.role?.includes('superadmin') || false"
                        @change="$emit('update-route-role', group, subModule, route.path, 'superadmin', $event.target.checked)"
                        class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
                    </label>
                  </div>
                  <div class="col-span-2 text-center">
                    <label class="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        :checked="route.meta?.role?.includes('admin') || false"
                        @change="$emit('update-route-role', group, subModule, route.path, 'admin', $event.target.checked)"
                        class="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50">
                    </label>
                  </div>
                  <div class="col-span-2 text-center">
                    <label class="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        :checked="route.meta?.role?.includes('manager') || false"
                        @change="$emit('update-route-role', group, subModule, route.path, 'manager', $event.target.checked)"
                        class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
                    </label>
                  </div>
                  <div class="col-span-1 text-center">
                    <label class="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        :checked="route.meta?.role?.includes('public') || false"
                        @change="$emit('update-route-role', group, subModule, route.path, 'public', $event.target.checked)"
                        class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                    </label>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>

    <!-- Permission Summary -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div class="flex items-center">
          <font-awesome-icon :icon="['fas','user-cog']" class="text-gray-800 mr-2"/>
          <div>
            <div class="text-sm font-medium text-gray-800">Root</div>
            <div class="text-xs text-gray-600">{{ getPermissionCount('root') }} routes</div>
          </div>
        </div>
      </div>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div class="flex items-center">
          <font-awesome-icon :icon="['fas','crown']" class="text-yellow-500 mr-2"/>
          <div>
            <div class="text-sm font-medium text-yellow-800">Superadmin</div>
            <div class="text-xs text-yellow-600">{{ getPermissionCount('superadmin') }} routes</div>
          </div>
        </div>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex items-center">
          <font-awesome-icon :icon="['fas','user-shield']" class="text-red-500 mr-2"/>
          <div>
            <div class="text-sm font-medium text-red-800">Admin</div>
            <div class="text-xs text-red-600">{{ getPermissionCount('admin') }} routes</div>
          </div>
        </div>
      </div>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div class="flex items-center">
          <font-awesome-icon :icon="['fas','user-tie']" class="text-purple-500 mr-2"/>
          <div>
            <div class="text-sm font-medium text-purple-800">Manager</div>
            <div class="text-xs text-purple-600">{{ getPermissionCount('manager') }} routes</div>
          </div>
        </div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-center">
          <font-awesome-icon :icon="['fas','globe']" class="text-green-500 mr-2"/>
          <div>
            <div class="text-sm font-medium text-green-800">Public</div>
            <div class="text-xs text-green-600">{{ getPermissionCount('public') }} routes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRolePermissionManagement',
  
  props: {
    routesByModule: {
      type: Object,
      required: true
    },
    isSavingPermissions: {
      type: Boolean,
      default: false
    },
    isLoadingPermissions: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    // ==========================================
    // Display Helper Methods
    // ==========================================
    getGroupDisplayName(groupName) {
      if (!groupName) return 'Unknown Group';
      return this.formatRouteName(groupName);
    },
    getRouteDisplayName(route) {
      if (!route || !route.name) return 'Unknown Route';
      return this.formatRouteName(route.name);
    },
    formatRouteName(name) {
      if (!name) return '';
      
      return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    // ==========================================
    // Permission Checking Methods
    // ==========================================
    isGroupRoleEnabled(group, role) {
      const subModules = this.routesByModule[group];
      if (!subModules) return false;
      
      let hasRole = false;
      Object.keys(subModules).forEach(subModule => {
        subModules[subModule].forEach(route => {
          if (route.meta?.role?.includes(role)) {
            hasRole = true;
          }
        });
      });
      return hasRole;
    },
    getPermissionCount(role) {
      let count = 0;
      Object.keys(this.routesByModule).forEach(group => {
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          this.routesByModule[group][subModule].forEach(route => {
            if (route.meta?.role?.includes(role)) {
              count++;
            }
            // นับ child routes ด้วย
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                if (child.meta?.role?.includes(role)) {
                  count++;
                }
                // นับ grand child routes ด้วย
                if (child.children && child.children.length > 0) {
                  child.children.forEach(grandChild => {
                    if (grandChild.meta?.role?.includes(role)) {
                      count++;
                    }
                  });
                }
              });
            }
          });
        });
      });
      return count;
    }
  }
};
</script>

<style scoped>
/* Permission Management specific styles */
.permission-matrix {
  transition: all 0.2s ease;
}

.permission-row:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.role-checkbox {
  transition: all 0.15s ease;
}

.role-checkbox:hover {
  transform: scale(1.1);
}

/* Summary cards animation */
.summary-card {
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive design */
@media (max-width: 768px) {
  .grid-cols-12 {
    grid-template-columns: 1fr auto auto auto auto auto;
  }
  
  .col-span-4 {
    grid-column: span 1;
  }
  
  .col-span-2 {
    grid-column: span 1;
  }
  
  .col-span-1 {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .grid-cols-12 {
    grid-template-columns: 1fr repeat(5, auto);
  }
}
</style> 
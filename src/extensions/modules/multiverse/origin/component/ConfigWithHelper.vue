<template>
  <div class="router-config">
    <!-- Search and Filter Section -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-gray-900">กลุ่มและ Router ที่มีในระบบ</h2>
        <div class="mt-2 flex flex-wrap gap-4 text-sm">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ routerData.stats ? Object.keys(routerData.groupedRoutes).length : 0 }} Groups
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {{ totalParentRoutes }} Parent Routes
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {{ totalChildRoutes }} Child Routes
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {{ totalAllRoutes }} Total Routes
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <!-- Search Box -->
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="ค้นหา router..."
          class="w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        
        <!-- Group Filter -->
        <select 
          v-model="selectedGroup"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกกลุ่ม</option>
          <option v-for="group in routerData.availableGroups" :key="group" :value="group">
            {{ group }}
          </option>
        </select>
        
        <!-- Export Button -->
        <button 
          @click="exportRouterData"
          type="button"
          class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
          Export
        </button>
      </div>
    </div>

    <!-- Router List -->
    <div class="bg-white shadow overflow-hidden rounded-md">
      <div v-if="Object.keys(filteredRoutes).length === 0" class="px-4 py-8 text-center">
        <p class="text-gray-500">ไม่พบ router ที่ตรงกับการค้นหา</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <template v-for="(subModules, group) in filteredRoutes" :key="group">
          <div class="px-4 py-4">
            <div class="flex items-center mb-3 cursor-pointer" @click="toggleGroup(group)">
              <font-awesome-icon :icon="isGroupExpanded(group) ? ['fas','folder-open'] : ['fas','folder']" class="text-yellow-500 mr-2"/>
              <h4 class="text-md font-semibold text-gray-800 capitalize flex-1">{{ group }}</h4>
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ Object.keys(subModules).length }} sub-groups, {{ routerData.stats[group]?.totalAll || 0 }} routes
              </span>
              <font-awesome-icon :icon="isGroupExpanded(group) ? ['fas','chevron-up'] : ['fas','chevron-down']" class="text-gray-400 ml-2"/>
            </div>
            
            <div v-show="isGroupExpanded(group)" class="ml-6 space-y-2">
              <template v-for="(routes, subModule) in subModules" :key="subModule">
                <div class="border-l-2 border-gray-200 pl-4">
                  <div class="flex items-center mb-2">
                    <font-awesome-icon :icon="['fas','folder-open']" class="text-green-500 mr-2 text-sm"/>
                    <h5 class="text-sm font-medium text-gray-700 capitalize">{{ subModule }}</h5>
                    <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ routes.length }} routes
                    </span>
                  </div>
                  
                  <div class="ml-6 space-y-2">
                    <template v-for="route in routes" :key="route.path">
                      <!-- Route Card -->
                      <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <!-- Route Header -->
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-center flex-1">
                            <font-awesome-icon :icon="getRouteIcon(route)" class="text-blue-500 mr-2"/>
                            <div class="flex-1">
                              <div class="flex items-center flex-wrap gap-2 mb-1">
                                <span class="text-sm font-medium text-gray-800">{{ route.name }}</span>
                                <template v-for="badge in getRouteBadges(route)" :key="badge.text">
                                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="badge.color">
                                    {{ badge.text }}
                                  </span>
                                </template>
                              </div>
                              <code class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{{ route.path }}</code>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Route Details -->
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                            <div><strong>Component:</strong> {{ route.component }}</div>
                            <div><strong>Level:</strong> {{ route.level }}</div>
                            <div v-if="route.groups"><strong>Groups:</strong> {{ route.groups }}</div>
                            <div v-if="route.meta?.type"><strong>Type:</strong> {{ route.meta.type }}</div>
                          </div>
                        </div>
                        
                        <!-- Children Routes -->
                        <div v-if="route.children && route.children.length > 0" class="mt-3 pl-4 border-l-2 border-blue-200">
                          <div class="text-xs font-medium text-blue-600 mb-2">
                            Children Routes ({{ route.children.length }})
                          </div>
                          <template v-for="child in route.children" :key="child.path">
                            <div class="border border-blue-100 rounded-lg p-2 mb-2 bg-blue-50">
                              <div class="flex items-center mb-1">
                                <span class="text-sm font-medium text-blue-800">{{ child.name }}</span>
                              </div>
                              <code class="text-xs bg-white px-2 py-1 rounded text-blue-700 block">{{ child.path }}</code>
                            </div>
                          </template>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouterData } from '@/plugins/router-helper-example';

export default {
  name: 'ConfigWithHelper',
  data() {
    return {
      routerData: null,
      searchTerm: '',
      selectedGroup: 'all',
      expandedGroups: {}
    };
  },
  
  mounted() {
    this.initRouterData();
  },
  
  methods: {
    initRouterData() {
      this.routerData = useRouterData();
    },
    
    toggleGroup(group) {
      if (this.expandedGroups[group] === undefined) {
        this.expandedGroups[group] = false;
      }
      this.expandedGroups[group] = !this.expandedGroups[group];
    },
    
    isGroupExpanded(group) {
      return this.expandedGroups[group] === true;
    },
    
    getRouteIcon(route) {
      if (route.isParent) return ['fas', 'folder'];
      if (route.redirect) return ['fas', 'arrow-right'];
      return ['fas', 'file'];
    },
    
    getRouteBadges(route) {
      return this.routerData.getRouteBadges(route);
    },
    
    exportRouterData() {
      if (!this.routerData) return;
      
      const data = this.routerData.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `router-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },
  
  computed: {
    filteredRoutes() {
      if (!this.routerData) return {};
      
      let filtered = this.routerData.groupedRoutes;
      
      // กรองตามคำค้นหา
      if (this.searchTerm) {
        filtered = this.routerData.filterBySearch(this.searchTerm);
      }
      
      // กรองตามกลุ่ม
      if (this.selectedGroup !== 'all') {
        filtered = this.routerData.filterByGroup(this.selectedGroup);
      }
      
      return filtered;
    },
    
    totalParentRoutes() {
      if (!this.routerData?.stats) return 0;
      return Object.values(this.routerData.stats).reduce((sum, stat) => sum + stat.totalRoutes, 0);
    },
    
    totalChildRoutes() {
      if (!this.routerData?.stats) return 0;
      return Object.values(this.routerData.stats).reduce((sum, stat) => sum + stat.totalChildren, 0);
    },
    
    totalAllRoutes() {
      if (!this.routerData?.stats) return 0;
      return Object.values(this.routerData.stats).reduce((sum, stat) => sum + stat.totalAll, 0);
    }
  }
};
</script> 
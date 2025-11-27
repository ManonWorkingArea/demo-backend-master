<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🧩 โมดูลระบบ</h2>
      <p class="text-base text-gray-700 font-medium">เลือกโมดูลและฟังก์ชันที่ต้องการใช้งานในเว็บไซต์</p>
      <p class="text-sm text-gray-500 mt-1">โมดูลเหล่านี้จะเพิ่มความสามารถและฟีเจอร์ต่าง ๆ ให้กับเว็บไซต์ของคุณ</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="processedPlugins.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีโมดูลที่พร้อมใช้งาน</h3>
      <p class="mt-1 text-sm text-gray-500">กรุณาติดต่อผู้ดูแลระบบเพื่อติดตั้งโมดูล</p>
    </div>

    <div v-else>
      <!-- Default Plugins -->
      <div class="space-y-4">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-800 mb-1">📦 ปลั๊กอินมาตรฐาน</h3>
          <p class="text-sm text-gray-600">โมดูลพื้นฐานที่จำเป็นสำหรับการทำงานของระบบ</p>
        </div>
        <div v-for="group in groupedDefaultPlugins" :key="group.groupName" class="space-y-4">
          <div class="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <h4 class="text-lg font-bold text-gray-800 flex items-center">
              <span class="text-gray-500 mr-2">📂</span>
              {{ group.groupName }}
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div v-for="plugin in group.plugins" :key="plugin.value" 
                 class="bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                 :class="{'border-blue-500 bg-blue-50 shadow-md': plugin.checked, 'border-gray-200': !plugin.checked}"
                 @click="togglePlugin(plugin.value)">
              
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <i :class="`fa fa-${plugin.icon || 'folder-o'}`" class="w-5 h-5 text-gray-400 mr-2"></i>
                  <h4 class="font-medium text-gray-900">{{ plugin.finalDisplayName }}</h4>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-green-400"></span>
                  <svg v-if="plugin.checked" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Module Path</span>
                  <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{{ plugin.path || '/' + plugin.value }}</span>
                </div>
                <div v-if="plugin.description" class="text-xs text-gray-500">
                  {{ plugin.description }}
                </div>
                <div class="flex items-center space-x-1 text-xs">
                  <span v-if="plugin.hasDashboard" class="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    Dashboard Ready
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {{ plugin.groups || 'default' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Optional Plugins -->
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-800 mb-1">⚡ ปลั๊กอินเสริม</h3>
          <p class="text-sm text-gray-600">โมดูลเพิ่มเติมที่สามารถเลือกใช้ตามความต้องการ</p>
        </div>
        <div v-for="group in groupedOptionalPlugins" :key="group.groupName" class="space-y-4">
          <div class="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
            <h4 class="text-lg font-bold text-gray-800 flex items-center">
              <span class="text-blue-500 mr-2">📂</span>
              {{ group.groupName }}
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div v-for="plugin in group.plugins" :key="plugin.value" 
                 class="bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                 :class="{'border-blue-500 bg-blue-50 shadow-md': plugin.checked, 'border-gray-200': !plugin.checked}"
                 @click="togglePlugin(plugin.value)">
              
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <i :class="`fa fa-${plugin.icon || 'folder-o'}`" class="w-5 h-5 text-gray-400 mr-2"></i>
                  <h4 class="font-medium text-gray-900">{{ plugin.finalDisplayName }}</h4>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-green-400"></span>
                  <svg v-if="plugin.checked" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Module Path</span>
                  <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{{ plugin.path || '/' + plugin.value }}</span>
                </div>
                <div v-if="plugin.description" class="text-xs text-gray-500">
                  {{ plugin.description }}
                </div>
                <div class="flex items-center space-x-1 text-xs">
                  <span v-if="plugin.hasDashboard" class="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    Dashboard Ready
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {{ plugin.groups || 'default' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plugin Summary -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900">สรุปโมดูลที่เลือก</h4>
            <p class="text-sm text-gray-600">{{ selectedPluginsCount }} โมดูลจากทั้งหมด {{ processedPlugins.length }} โมดูล</p>
          </div>
          <div class="flex space-x-2">
            <button @click="selectAllPlugins" class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
              เลือกทั้งหมด
            </button>
            <button @click="clearAllPlugins" class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
              ยกเลิกทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Configuration -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div class="border-b border-gray-200 pb-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">🏠 ตั้งค่า Dashboard</h2>
        <p class="text-base text-gray-700 font-medium">เลือกโมดูลหลักที่จะแสดงเป็นหน้าแรกใน Dashboard</p>
        <p class="text-sm text-gray-500 mt-1">โมดูลที่เลือกจะเป็นหน้าหลักที่ผู้ใช้เห็นเมื่อเข้าสู่ระบบ</p>
        <div class="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-xs text-blue-700">
            <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            แสดงเฉพาะโมดูลที่เลือกไว้และรองรับการแสดงผลแบบ Dashboard เท่านั้น
          </p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">กำลังโหลดข้อมูลโมดูล...</p>
      </div>
      
      <div v-else-if="processedPlugins.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีข้อมูลโมดูล</h3>
        <p class="mt-1 text-sm text-gray-500">ระบบยังไม่สามารถโหลดข้อมูลโมดูลได้</p>
      </div>
      
      <div v-else-if="filteredPlugins.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีโมดูลที่รองรับ Dashboard</h3>
        <p class="mt-1 text-sm text-gray-500">จำนวนโมดูลทั้งหมด: {{ processedPlugins.length }}</p>
        <p class="mt-1 text-sm text-gray-500">โมดูลที่รองรับ Dashboard: {{ filteredPlugins.length }}</p>
      </div>
      
      <div v-else>
        <div class="mb-4 text-sm text-gray-600">
          <span class="font-medium">{{ filteredPlugins.length }}</span> โมดูลรองรับการแสดงผลแบบ Dashboard
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div v-for="plugin in filteredPlugins" :key="'dashboard_' + plugin.value" 
               class="bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
               :class="{'border-blue-500 bg-blue-50 shadow-md': defaultPlugin === plugin.value, 'border-gray-200': defaultPlugin !== plugin.value}"
               @click="selectDefaultPlugin(plugin.value)">
            
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center">
                <i :class="`fa fa-${plugin.icon || 'folder-o'}`" class="w-5 h-5 text-gray-400 mr-2"></i>
                <h4 class="font-medium text-gray-900">{{ plugin.finalDisplayName }}</h4>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-green-400"></span>
                <svg v-if="defaultPlugin === plugin.value" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Module Path</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{{ plugin.path || '/' + plugin.value }}</span>
              </div>
              <div v-if="plugin.description" class="text-xs text-gray-500">
                {{ plugin.description }}
              </div>
              <div class="flex items-center space-x-1 text-xs">
                <span class="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                  Dashboard Ready
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {{ plugin.groups || 'default' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import { createRouterHelper } from '@/plugins/router-helper';
import pluginRoutes from '@/extensions/loader';

export default {
  name: 'PluginManager',
  props: {
    selectedPlugins: {
      type: [Array, String],
      default: () => []
    },
    defaultPlugin: {
      type: String,
      default: ''
    },
    hostkey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      pluginNamesArray: [],
      groupedPluginsData: {},
      routerHelper: null,
      loading: false,
      groupsName: [
        {
          code: 'default',
          name: 'ปลั๊กอินมาตรฐาน'
        },
        {
          code: 'system',
          name: 'จัดการระบบ'
        },
        {
          code: 'origin',
          name: 'ศูนย์กลางระบบ'
        },
        {
          code: 'academy',
          name: 'การเรียนออนไลน์'
        },
        {
          code: 'ecommerce',
          name: 'ขายของออนไลน์'
        },
        {
          code: 'payment',
          name: 'ระบบชำระเงิน'
        },
        {
          code: 'blog',
          name: 'เนื้อหา'
        }
      ]
    };
  },
  computed: {
    processedPlugins() {
      return this.pluginNamesArray.map(plugin => ({
        ...plugin,
        hasSecondaryName: Boolean(plugin.nameEn && plugin.nameEn !== plugin.name && plugin.nameEn.trim()),
        finalDisplayName: plugin.displayName || plugin.name || plugin.value || 'Unknown Plugin',
        icon: plugin.icon || 'folder-o'
      }));
    },
    
    defaultPlugins() {
      return this.processedPlugins.filter((plugin) => plugin.default);
    },
    
    groupedDefaultPlugins() {
      if (this.routerHelper && Object.keys(this.groupedPluginsData).length > 0) {
        const groups = [];
        
        Object.keys(this.groupedPluginsData).forEach(groupName => {
          const group = this.groupsName.find(g => g.code === groupName);
          const groupNameDisplay = group ? group.name : groupName;
          
          const groupPlugins = [];
          Object.keys(this.groupedPluginsData[groupName]).forEach(subModule => {
            const subModulePlugins = this.groupedPluginsData[groupName][subModule]
              .filter(routeInfo => {
                const pathSegments = routeInfo.path.split('/').filter(segment => segment !== '');
                const isParentRoute = pathSegments.length === 1;
                const plugin = this.processedPlugins.find(p => p.value === routeInfo.name);
                return isParentRoute && plugin && plugin.default;
              })
              .map(routeInfo => {
                return this.processedPlugins.find(p => p.value === routeInfo.name);
              })
              .filter(Boolean);
            
            groupPlugins.push(...subModulePlugins);
          });
          
          if (groupPlugins.length > 0) {
            groups.push({
              groupName: groupNameDisplay,
              plugins: groupPlugins
            });
          }
        });
        
        return groups;
      }
      
      const groups = [];
      this.defaultPlugins.forEach(plugin => {
        const groupName = plugin.groups;
        const group = this.groupsName.find(group => group.code === groupName);
        const groupNameDisplay = group ? group.name : groupName;
        const index = groups.findIndex(group => group.groupName === groupNameDisplay);
        if (index >= 0) {
          groups[index].plugins.push(plugin);
        } else {
          groups.push({
            groupName: groupNameDisplay,
            plugins: [plugin]
          });
        }
      });
      return groups;
    },
    
    optionalPlugins() {
      return this.processedPlugins.filter((plugin) => !plugin.default);
    },
    
    groupedOptionalPlugins() {
      if (this.routerHelper && Object.keys(this.groupedPluginsData).length > 0) {
        const groups = [];
        
        Object.keys(this.groupedPluginsData).forEach(groupName => {
          const group = this.groupsName.find(g => g.code === groupName);
          const groupNameDisplay = group ? group.name : groupName;
          
          const groupPlugins = [];
          Object.keys(this.groupedPluginsData[groupName]).forEach(subModule => {
            const subModulePlugins = this.groupedPluginsData[groupName][subModule]
              .filter(routeInfo => {
                const pathSegments = routeInfo.path.split('/').filter(segment => segment !== '');
                const isParentRoute = pathSegments.length === 1;
                const plugin = this.processedPlugins.find(p => p.value === routeInfo.name);
                return isParentRoute && plugin && !plugin.default;
              })
              .map(routeInfo => {
                return this.processedPlugins.find(p => p.value === routeInfo.name);
              })
              .filter(Boolean);
            
            groupPlugins.push(...subModulePlugins);
          });
          
          if (groupPlugins.length > 0) {
            groups.push({
              groupName: groupNameDisplay,
              plugins: groupPlugins
            });
          }
        });
        
        return groups;
      }
      
      const groups = [];
      this.optionalPlugins.forEach(plugin => {
        const groupName = plugin.groups;
        const group = this.groupsName.find(group => group.code === groupName);
        const groupNameDisplay = group ? group.name : groupName;
        const index = groups.findIndex(group => group.groupName === groupNameDisplay);
        if (index >= 0) {
          groups[index].plugins.push(plugin);
        } else {
          groups.push({
            groupName: groupNameDisplay,
            plugins: [plugin]
          });
        }
      });
      return groups;
    },

    selectedPluginsCount() {
      return this.processedPlugins.filter(plugin => plugin.checked).length;
    },

    filteredPlugins() {
      // กรองเฉพาะ plugins ที่รองรับ Dashboard
      return this.processedPlugins.filter((plugin) => {
        return plugin.hasDashboard === true;
      });
    }
  },
  methods: {
    parsePluginName(plugin) {
      let primaryName = '';
      let secondaryName = '';
      let displayName = '';
      
      if (typeof plugin.name === 'object' && plugin.name !== null) {
        primaryName = plugin.name.th || plugin.name.thai || plugin.name.primary || '';
        secondaryName = plugin.name.en || plugin.name.english || plugin.name.secondary || '';
        displayName = primaryName || secondaryName || 'Unknown Plugin';
      }
      else if (typeof plugin.name === 'string' && plugin.name.trim()) {
        const nameStr = plugin.name.trim();
        
        const bilingualPatterns = [
          /^(.+?)\s*\((.+?)\)$/,
          /^(.+?)\s*\[(.+?)\]$/,
          /^(.+?)\s*-\s*(.+?)$/
        ];
        
        let matched = false;
        for (const pattern of bilingualPatterns) {
          const match = nameStr.match(pattern);
          if (match) {
            primaryName = match[1].trim();
            secondaryName = match[2].trim();
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          primaryName = nameStr;
        }
        
        displayName = primaryName;
      }
      
      if (plugin.nameEn && typeof plugin.nameEn === 'string' && plugin.nameEn.trim()) {
        secondaryName = plugin.nameEn.trim();
      }
      
      if (plugin.englishName && typeof plugin.englishName === 'string' && plugin.englishName.trim()) {
        secondaryName = plugin.englishName.trim();
      }
      
      if (!primaryName && !secondaryName) {
        primaryName = plugin.slug || 'Unknown Plugin';
        displayName = primaryName;
      }
      
      return {
        primary: primaryName,
        secondary: secondaryName,
        display: displayName
      };
    },

    togglePlugin(pluginValue) {
      const plugin = this.pluginNamesArray.find(p => p.value === pluginValue);
      if (plugin) {
        plugin.checked = !plugin.checked;
        this.emitPluginChange();
      }
    },

    selectAllPlugins() {
      this.pluginNamesArray.forEach(plugin => {
        plugin.checked = true;
      });
      this.emitPluginChange();
    },

    clearAllPlugins() {
      this.pluginNamesArray.forEach(plugin => {
        plugin.checked = false;
      });
      this.emitPluginChange();
    },

    emitPluginChange() {
      const selectedPlugins = this.pluginNamesArray
        .filter(plugin => plugin.checked)
        .map(plugin => plugin.value);
      this.$emit('plugins-changed', selectedPlugins);
    },

    selectDefaultPlugin(pluginValue) {
      this.$emit('default-plugin-changed', pluginValue);
    },

    initializePlugins() {
      this.loading = true;
      
      const storedPluginNames = storageManager.get('plugins');
      let pluginNamesArray = [];
      
      if (storedPluginNames) {
        let pluginData = [];
        
        if (storedPluginNames.data && Array.isArray(storedPluginNames.data)) {
          pluginData = storedPluginNames.data;
        } else if (Array.isArray(storedPluginNames)) {
          pluginData = storedPluginNames;
        }
        
        if (pluginData.length > 0) {
          pluginNamesArray = pluginData.map((plugin) => {
            const checked = Array.isArray(this.selectedPlugins) 
              ? this.selectedPlugins.includes(plugin.slug) 
              : (typeof this.selectedPlugins === 'string' ? this.selectedPlugins.split(',').includes(plugin.slug) : false);
            
            const parsedNames = this.parsePluginName(plugin);
            
            return {
              name: parsedNames.primary,
              nameEn: parsedNames.secondary,
              displayName: parsedNames.display,
              value: plugin.slug,
              dashboard: plugin.dashboard,
              hasDashboard: plugin.hasDashboard === true,
              description: plugin.description || '',
              default: plugin.default || false,
              role: plugin.role || [],
              groups: plugin.groups || 'default',
              icon: plugin.icon || 'folder-o',
              checked: checked,
            };
          });
        }
      }
      
      if (pluginNamesArray.length === 0) {
        try {
          this.routerHelper = createRouterHelper(pluginRoutes);
          const groupedRoutes = this.routerHelper.processRoutes();
          this.groupedPluginsData = groupedRoutes;
          
          const flattenedRoutes = [];
          Object.keys(groupedRoutes).forEach(groupName => {
            Object.keys(groupedRoutes[groupName]).forEach(subModule => {
              groupedRoutes[groupName][subModule].forEach(routeInfo => {
                const pathSegments = routeInfo.path.split('/').filter(segment => segment !== '');
                const isParentRoute = pathSegments.length === 1;
                
                if (isParentRoute) {
                  const route = {
                    name: routeInfo.name,
                    slug: routeInfo.name,
                    path: routeInfo.path,
                    groups: routeInfo.groups,
                    meta: routeInfo.meta,
                    translatedTitle: routeInfo.meta?.title || routeInfo.name,
                    role: routeInfo.role || [],
                    icon: routeInfo.icon || 'folder-o'
                  };
                  flattenedRoutes.push(route);
                }
              });
            });
          });
          
          if (flattenedRoutes && flattenedRoutes.length > 0) {
            pluginNamesArray = flattenedRoutes.map((route) => {
              const checked = Array.isArray(this.selectedPlugins) 
                ? this.selectedPlugins.includes(route.slug) 
                : (typeof this.selectedPlugins === 'string' ? this.selectedPlugins.split(',').includes(route.slug) : false);
              
              const fakePlugin = {
                name: route.translatedTitle || route.name || route.slug,
                slug: route.slug
              };
              
              const parsedNames = this.parsePluginName(fakePlugin);
              
              return {
                name: parsedNames.primary,
                nameEn: parsedNames.secondary,
                displayName: parsedNames.display,
                value: route.slug,
                dashboard: route.meta?.dashboard !== false,
                hasDashboard: route.meta?.hasDashboard === true || route.hasDashboard === true,
                description: route.meta?.description || route.description || '',
                default: route.meta?.default === true || route.default === true,
                role: route.role || [],
                groups: route.groups || 'default',
                icon: route.icon || route.meta?.icon || 'folder-o',
                checked: checked,
              };
            });
          }
        } catch (error) {
          console.error('Error loading plugins from RouterHelper:', error);
        }
      }
      
      this.pluginNamesArray = pluginNamesArray;
      this.loading = false;
    }
  },
  
  async mounted() {
    this.initializePlugins();
    
    if (this.pluginNamesArray.length === 0) {
      setTimeout(() => {
        this.initializePlugins();
      }, 500);
    }
  },

  watch: {
    selectedPlugins: {
      handler(newPlugins) {
        if (this.pluginNamesArray.length > 0) {
          this.pluginNamesArray.forEach(plugin => {
            plugin.checked = Array.isArray(newPlugins) 
              ? newPlugins.includes(plugin.value) 
              : (typeof newPlugins === 'string' ? newPlugins.split(',').includes(plugin.value) : false);
          });
        }
      },
      deep: true
    }
  }
};
</script> 
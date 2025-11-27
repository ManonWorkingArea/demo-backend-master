<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <i class="fas fa-shield-alt text-green-500"></i>
        {{ title }}
      </h2>
      <div v-if="showActions" class="flex gap-2">
        <button
          type="button"
          @click="selectAll"
          class="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg"
        >
          เลือกทั้งหมด
        </button>
        <button
          type="button"
          @click="deselectAll"
          class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg"
        >
          ยกเลิกทั้งหมด
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
      <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Module Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="module in availableModules"
        :key="module.key"
        class="border-2 rounded-lg overflow-hidden transition-all flex flex-col"
        :class="{
          'border-green-500 bg-green-50': isModuleFullySelected(module.key),
          'border-blue-500 bg-blue-50': isModulePartiallySelected(module.key),
          'border-gray-200': !isModuleSelected(module.key)
        }"
      >
        <!-- Module Header with Checkbox -->
        <div class="p-4 bg-white">
          <div class="flex items-center gap-3">
            <!-- Module Checkbox -->
            <label v-if="!readonly" class="flex items-center cursor-pointer">
              <input 
                type="checkbox"
                :checked="isModuleFullySelected(module.key)"
                :indeterminate.prop="isModulePartiallySelected(module.key)"
                @change="toggleModule(module.key)"
                class="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
            </label>
            
            <!-- Module Icon -->
            <div :class="isModuleSelected(module.key) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'"
                 class="w-12 h-12 rounded-lg flex items-center justify-center">
              <i :class="`fas fa-${module.icon}`"></i>
            </div>
            
            <!-- Module Info -->
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ module.nameTH }}</h3>
              <p class="text-sm text-gray-500">{{ module.name }}</p>
            </div>
            
            <!-- Menu Count Badge -->
            <div v-if="module.menuCount > 0" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {{ getSelectedMenuCount(module.key) }}/{{ module.menuCount }}
            </div>
          </div>
        </div>
        
        <!-- Submenu List with Checkboxes -->
        <div v-if="module.menuItems && module.menuItems.length > 0" 
             class="border-t border-gray-200 bg-white p-3 flex-1">
          <div class="text-xs font-semibold text-gray-500 mb-2">Available Menus:</div>
          <div class="grid grid-cols-2 gap-1">
            <label 
              v-for="menu in module.menuItems.filter(m => m.key !== 'back')" 
              :key="menu.key"
              class="flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{ 'pointer-events-none opacity-60': readonly }"
            >
              <!-- Menu Checkbox -->
              <input 
                v-if="!readonly"
                type="checkbox"
                :checked="isMenuSelected(module.key, menu.key)"
                @change="toggleMenu(module.key, menu.key)"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <i v-else-if="isMenuSelected(module.key, menu.key)" class="fas fa-check text-green-600 w-4 flex-shrink-0"></i>
              <i v-else class="fas fa-times text-gray-300 w-4 flex-shrink-0"></i>
              
              <!-- Menu Icon & Label -->
              <i :class="`fas fa-${menu.icon || 'circle'} text-xs text-gray-400 flex-shrink-0`"></i>
              <span class="flex-1 text-sm text-gray-700 truncate">{{ menu.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { menuRegistry } from '../config/menuRegistry.js'

export default {
  name: 'ModuleAccessSelector',
  
  props: {
    // ค่าเริ่มต้นของสิทธิ์ที่เลือก { moduleName: ['menu1', 'menu2'] }
    modelValue: {
      type: Object,
      default: () => ({})
    },
    // Title ของ component
    title: {
      type: String,
      default: 'สิทธิ์การเข้าถึงโมดูล'
    },
    // แสดงปุ่ม select all / deselect all
    showActions: {
      type: Boolean,
      default: true
    },
    // โหมดแสดงผลอย่างเดียว (ไม่สามารถแก้ไขได้)
    readonly: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue'],
  
  data() {
    return {
      loading: true,
      availableModules: [],
      selectedMenus: {},
      isUpdatingFromParent: false
    }
  },
  
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.isUpdatingFromParent = true
        this.selectedMenus = { ...newVal }
        this.$nextTick(() => {
          this.isUpdatingFromParent = false
        })
      }
    },
    selectedMenus: {
      deep: true,
      handler(newVal) {
        if (!this.isUpdatingFromParent) {
          this.$emit('update:modelValue', newVal)
        }
      }
    }
  },
  
  async mounted() {
    // ✅ เพิ่ม retry mechanism
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        await this.loadAvailableModules()
        
        // ตรวจสอบว่าโหลดได้ข้อมูลหรือไม่
        if (this.availableModules.length > 0) {
          console.log('✅ [ModuleAccessSelector] Successfully loaded modules')
          break
        }
        
        // ถ้ายังไม่มีข้อมูล ลอง retry
        retryCount++
        if (retryCount < maxRetries) {
          console.warn(`⚠️ [ModuleAccessSelector] No modules loaded, retrying (${retryCount}/${maxRetries})...`)
          await new Promise(resolve => setTimeout(resolve, 500)) // รอ 500ms แล้ว retry
        }
      } catch (error) {
        console.error('❌ [ModuleAccessSelector] Mount error:', error)
        retryCount++
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
    
    if (this.availableModules.length === 0) {
      console.error('❌ [ModuleAccessSelector] Failed to load modules after', maxRetries, 'retries')
    }
  },
  
  methods: {
    async loadAvailableModules() {
      try {
        this.loading = true
        
        console.log('📦 [ModuleAccessSelector] Loading modules...')
        
        // ✅ วิธีที่ 1: ลองดึงจาก ERP_CORE.menuRegistry ก่อน (ถ้ามี)
        let moduleSource = null
        
        if (window.ERP_CORE?.menuRegistry && typeof window.ERP_CORE.menuRegistry === 'object') {
          const keys = Object.keys(window.ERP_CORE.menuRegistry)
          if (keys.length > 0) {
            console.log('✅ Using ERP_CORE.menuRegistry')
            moduleSource = window.ERP_CORE.menuRegistry
          }
        }
        
        // วิธีที่ 2: ลองดึงจาก menuRegistry ที่ import มา
        if (!moduleSource) {
          const keys = Object.keys(menuRegistry)
          if (keys.length > 0) {
            console.log('✅ Using imported menuRegistry')
            moduleSource = menuRegistry
          }
        }
        
        // วิธีที่ 3: ลองดึงจาก ERP_CORE.modules (fallback)
        if (!moduleSource && window.ERP_CORE?.modules) {
          console.log('✅ Using ERP_CORE.modules as fallback')
          const moduleNames = await window.ERP_CORE.modules.getModuleNames()
          
          if (moduleNames && moduleNames.length > 0) {
            // สร้าง temporary registry จาก module names
            moduleSource = {}
            for (const name of moduleNames) {
              if (menuRegistry[name]) {
                moduleSource[name] = menuRegistry[name]
              }
            }
          }
        }
        
        if (!moduleSource || Object.keys(moduleSource).length === 0) {
          console.error('❌ [ModuleAccessSelector] No module source available')
          this.availableModules = []
          return
        }
        
        const allModuleKeys = Object.keys(moduleSource)
        console.log('📦 [ModuleAccessSelector] Found modules:', allModuleKeys)
        
        // ✅ เปลี่ยนจาก Promise.all เป็น sequential loading
        const loadedModules = []
        
        for (const moduleName of allModuleKeys) {
          try {
            const menuConfig = moduleSource[moduleName]
            
            if (!menuConfig) {
              console.warn(`⚠️ No config for module: ${moduleName}`)
              continue
            }
            
            // ✅ โหลด menu config แบบ sequential
            console.log(`⏳ Loading ${moduleName}...`)
            
            if (typeof menuConfig.load === 'function') {
              await menuConfig.load()
            }
            
            if (typeof menuConfig.loadModuleNameTH === 'function') {
              await menuConfig.loadModuleNameTH()
            }
            
            // ✅ รอสักครู่ให้ระบบ initialize
            await new Promise(resolve => setTimeout(resolve, 50))
            
            const moduleData = {
              key: moduleName,
              name: menuConfig.moduleName || moduleName,
              nameTH: menuConfig.moduleNameTH || moduleName,
              icon: menuConfig.icon || 'cube',
              description: menuConfig.description || '',
              menuItems: menuConfig.menuItems || [],
              menuCount: (menuConfig.menuItems || []).filter(m => m.key !== 'back').length
            }
            
            console.log(`✅ Loaded module: ${moduleName} (${moduleData.menuCount} menus)`, menuConfig.moduleNameTH || moduleName)
            
            // ✅ เช็คว่ามี menuItems ก่อนเพิ่ม
            if (moduleData.menuCount > 0) {
              loadedModules.push(moduleData)
            } else {
              console.warn(`⚠️ ${moduleName} has 0 menu items - skipped`)
            }
            
          } catch (error) {
            console.warn(`⚠️ Failed to load module ${moduleName}:`, error)
          }
        }
        
        this.availableModules = loadedModules
        console.log('✅ [ModuleAccessSelector] Total loaded:', this.availableModules.length, 'modules')

        
      } catch (error) {
        console.error('❌ [ModuleAccessSelector] Error:', error)
        this.availableModules = []
      } finally {
        this.loading = false
      }
    },
    
    toggleModule(moduleKey) {
      const module = this.availableModules.find(m => m.key === moduleKey)
      if (!module) return
      
      const allMenuKeys = module.menuItems
        .filter(m => m.key !== 'back')
        .map(m => m.key)
      
      if (this.isModuleFullySelected(moduleKey)) {
        const newMenus = { ...this.selectedMenus }
        delete newMenus[moduleKey]
        this.selectedMenus = newMenus
      } else {
        this.selectedMenus = {
          ...this.selectedMenus,
          [moduleKey]: allMenuKeys
        }
      }
    },
    
    toggleMenu(moduleKey, menuKey) {
      const currentMenus = this.selectedMenus[moduleKey] || []
      const menuIdx = currentMenus.indexOf(menuKey)
      
      if (menuIdx > -1) {
        const newMenus = currentMenus.filter((_, idx) => idx !== menuIdx)
        
        if (newMenus.length === 0) {
          const updated = { ...this.selectedMenus }
          delete updated[moduleKey]
          this.selectedMenus = updated
        } else {
          this.selectedMenus = {
            ...this.selectedMenus,
            [moduleKey]: newMenus
          }
        }
      } else {
        this.selectedMenus = {
          ...this.selectedMenus,
          [moduleKey]: [...currentMenus, menuKey]
        }
      }
    },
    
    isMenuSelected(moduleKey, menuKey) {
      return this.selectedMenus[moduleKey]?.includes(menuKey) || false
    },
    
    isModuleSelected(key) {
      return !!this.selectedMenus[key]
    },
    
    isModuleFullySelected(moduleKey) {
      const module = this.availableModules.find(m => m.key === moduleKey)
      if (!module || !this.selectedMenus[moduleKey]) return false
      
      const allMenuKeys = module.menuItems
        .filter(m => m.key !== 'back')
        .map(m => m.key)
      
      return allMenuKeys.length > 0 && 
             allMenuKeys.every(key => this.selectedMenus[moduleKey].includes(key))
    },
    
    isModulePartiallySelected(moduleKey) {
      const selected = !!this.selectedMenus[moduleKey] && this.selectedMenus[moduleKey].length > 0
      const notFully = !this.isModuleFullySelected(moduleKey)
      return selected && notFully
    },
    
    getSelectedMenuCount(moduleKey) {
      return this.selectedMenus[moduleKey]?.length || 0
    },
    
    selectAll() {
      const allSelected = {}
      this.availableModules.forEach(module => {
        const allMenuKeys = module.menuItems
          .filter(m => m.key !== 'back')
          .map(m => m.key)
        allSelected[module.key] = allMenuKeys
      })
      this.selectedMenus = allSelected
    },
    
    deselectAll() {
      this.selectedMenus = {}
    }
  }
}
</script>

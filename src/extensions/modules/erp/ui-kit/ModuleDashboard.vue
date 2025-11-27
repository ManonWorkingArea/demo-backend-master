<template>
  <main class="flex flex-col justify-between min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 bg-dashboard-background" :style="mainStyle">
    <div class="wrapper flex-1">
      <div class="p-8 lg:p-12">
        <div class="mx-auto px-4">
          <!-- Header Section -->
          <div class="text-center mb-12">
            <h1 class="text-white text-4xl font-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)">
              {{ title }}
            </h1>
            <p 
              v-if="subtitle" 
              class="text-white text-lg opacity-90 hidden md:block" 
              style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)"
            >
              {{ subtitle }}
            </p>
          </div>

          <!-- Menu Grid -->
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            <div 
              v-for="menu in filteredMenuItems" 
              :key="menu.key" 
              class="app-container group"
              :class="{ 'opacity-60': menu.opacity }"
            >
              <div class="relative">
                <!-- Menu with action (e.g., scanner) -->
                <div
                  v-if="menu.action"
                  @click="handleMenuAction(menu)"
                  class="app-icon relative flex items-center justify-center w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div
                    class="app-icon__inner flex items-center justify-center w-full h-full rounded-xl md:rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-inner border border-gray-200"
                  >
                    <font-awesome-icon 
                      :icon="['fas', menu.icon]" 
                      class="text-gray-700 text-3xl md:text-3xl lg:text-4xl transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" 
                    />
                  </div>
                  
                  <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                </div>

                <!-- Menu with route -->
                <router-link
                  v-else
                  :to="menu.to"
                  class="app-icon relative flex items-center justify-center w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div
                    class="app-icon__inner flex items-center justify-center w-full h-full rounded-xl md:rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-inner border border-gray-200"
                  >
                    <font-awesome-icon 
                      :icon="['fas', menu.icon]" 
                      class="text-gray-700 text-3xl md:text-3xl lg:text-4xl transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" 
                    />
                  </div>
                  
                  <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                </router-link>
              </div>

              <div class="mt-4 px-1">
                <span 
                  class="app-icon__label text-white text-sm font-medium text-center block leading-tight transition-all duration-300 group-hover:text-blue-200 line-clamp-2"
                  style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
                >
                  {{ menu.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="py-6 text-white text-center text-opacity-60 text-sm">
      <div class="border-t border-white border-opacity-20 pt-6 mx-8">
        <div class="flex items-center justify-center space-x-2">
          <font-awesome-icon :icon="['fas', footerIcon]" class="text-lg" />
          <span>{{ footerText }}</span>
        </div>
      </div>
    </footer>
  </main>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'ModuleDashboard',
  
  data() {
    return {
      configs: storageManager.get('configs') || {}
    };
  },
  
  props: {
    /**
     * หัวข้อหลักของโมดูล
     */
    title: {
      type: String,
      required: true
    },
    
    /**
     * คำอธิบายย่อยของโมดูล (แสดงบน desktop เท่านั้น)
     */
    subtitle: {
      type: String,
      default: ''
    },
    
    /**
     * รายการ menu items สำหรับแสดง
     * Format: [{ key, label, icon, to?, action?, opacity? }]
     */
    menuItems: {
      type: Array,
      required: true,
      validator: (items) => {
        return items.every(item => 
          item.key && item.label && item.icon && (item.to || item.action)
        )
      }
    },
    
    /**
     * ชื่อโมดูลสำหรับเช็ค permission (เช่น 'hr', 'inventory', 'sales')
     */
    moduleName: {
      type: String,
      required: true
    },
    
    /**
     * ไอคอนที่แสดงใน footer
     */
    footerIcon: {
      type: String,
      default: 'cube'
    },
    
    /**
     * ข้อความที่แสดงใน footer
     */
    footerText: {
      type: String,
      default: 'Module v.1.0'
    }
  },

  computed: {
    mainStyle() {
      return {
        minHeight: 'calc(100vh - 165px)',
        ...this.dashboardBackgroundStyle,
        ...this.dashboardGradientStyle
      }
    },
    
    dashboardBackgroundStyle() {
      const bgImage = this.configs.dashboardBg || require('@/assets/images/wallpaper/desk-593327_1920.jpg');
      return {
        backgroundImage: `url(${bgImage})`
      };
    },
    
    dashboardGradientStyle() {
      const color1 = this.configs.dashboardGradientColor1 || '#1e3a8a';
      const color2 = this.configs.dashboardGradientColor2 || '#4338ca';
      
      // แปลง hex เป็น rgba พร้อม opacity
      const rgba1 = this.hexToRgba(color1, 0.85);
      const rgba2 = this.hexToRgba(color2, 0.7);
      
      return {
        '--gradient-color-1': rgba1,
        '--gradient-color-2': rgba2
      };
    },
    
    /**
     * กรองเมนูตาม ERP permissions
     * แสดงเฉพาะเมนูที่มี visible: true
     */
    filteredMenuItems() {
      const erpData = storageManager.get('erp');
      const useERPPermissions = erpData && erpData !== false && erpData.job_assignments && erpData.job_assignments.length > 0;
      
      console.log(`[ModuleDashboard] Module: ${this.moduleName}`);
      console.log('[ModuleDashboard] ERP Data:', erpData);
      console.log('[ModuleDashboard] Use ERP Permissions:', useERPPermissions);
      
      // ถ้าไม่มี ERP permissions ให้แสดงทั้งหมด
      if (!useERPPermissions) {
        console.log('[ModuleDashboard] No ERP permissions - showing all menus');
        return this.menuItems;
      }
      
      // รวม permissions จากทุก job_assignments
      const allPermissions = [];
      erpData.job_assignments.forEach(job => {
        if (job.permissions && Array.isArray(job.permissions)) {
          allPermissions.push(...job.permissions);
        }
      });
      
      console.log('[ModuleDashboard] All Permissions:', allPermissions);
      
      // หา permissions ของโมดูลนี้
      const modulePerms = allPermissions.filter(p => p.module === this.moduleName);
      
      console.log(`[ModuleDashboard] Module Permissions for "${this.moduleName}":`, modulePerms);
      
      // ถ้าไม่มี permissions ของโมดูลนี้ = ไม่แสดงอะไรเลย
      if (modulePerms.length === 0) {
        console.log(`[ModuleDashboard] ⚠️ No permissions found for module "${this.moduleName}" - hiding all menus`);
        return [];
      }
      
      // รวม menus จากทุก job_assignments ของโมดูลนี้
      const visibleMenuKeys = new Set();
      modulePerms.forEach(modulePerm => {
        if (modulePerm.menus && Array.isArray(modulePerm.menus)) {
          modulePerm.menus.forEach(menu => {
            // รองรับ 2 รูปแบบ:
            // 1. Object: { menu_key: "xxx", visible: true }
            // 2. String: "xxx" (จาก department.module_access)
            if (typeof menu === 'string') {
              // ถ้าเป็น string = มาจาก department.module_access (ให้แสดงทุกอัน)
              visibleMenuKeys.add(menu);
              console.log(`[ModuleDashboard] ✅ Added menu (string): ${menu}`);
            } else if (typeof menu === 'object' && menu.menu_key) {
              // ถ้าเป็น object = มาจาก permissions (เช็ค visible)
              if (menu.visible === true) {
                visibleMenuKeys.add(menu.menu_key);
                console.log(`[ModuleDashboard] ✅ Added menu (object): ${menu.menu_key}`);
              } else {
                console.log(`[ModuleDashboard] ❌ Skipped menu (not visible): ${menu.menu_key}`);
              }
            }
          });
        }
      });
      
      console.log('[ModuleDashboard] Visible Menu Keys:', Array.from(visibleMenuKeys));
      console.log('[ModuleDashboard] Menu Items Keys:', this.menuItems.map(i => i.key));
      
      // กรองเมนูให้เหลือเฉพาะที่อยู่ใน visibleMenuKeys
      // ยกเว้น menu ที่มี key: 'back' ให้แสดงเสมอ (ไม่ต้องเช็ค permission)
      const filtered = this.menuItems.filter(item => {
        return item.key === 'back' || visibleMenuKeys.has(item.key);
      });
      console.log(`[ModuleDashboard] ✅ Filtered Menus (${filtered.length}/${this.menuItems.length}):`, filtered.map(m => m.key));
      
      return filtered;
    }
  },
  
  methods: {
    handleMenuAction(menu) {
      if (menu.action) {
        this.$emit('menu-action', menu.action, menu);
      }
    },
    
    hexToRgba(hex, opacity) {
      // ถ้าเป็น rgba อยู่แล้ว ให้ return เลย
      if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
        return hex;
      }
      
      // แปลง hex เป็น rgba
      let r = 0, g = 0, b = 0;
      
      // ลบ # ออก
      hex = hex.replace('#', '');
      
      // กรณี shorthand (#fff)
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      }
      // กรณี full hex (#ffffff)
      else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
}
</script>

<style scoped>
@media only screen and (max-width: 767px) {
  main {
    min-height: calc(100vh - 115px);
  }
}

body,html {
  overflow-x: hidden;
}

/* App Icon Styles */
.app-icon__inner {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 8px 25px rgba(0, 0, 0, 0.15);
}

.app-icon:hover .app-icon__inner {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 15px 35px rgba(0, 0, 0, 0.3);
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;
  overflow: visible;
}

/* App Label */
.app-icon__label {
  word-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  max-height: 2.6em;
}

.bg-dashboard-background {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.bg-dashboard-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--gradient-color-1, rgba(30, 58, 138, 0.85)), var(--gradient-color-2, rgba(67, 56, 202, 0.7)));
  backdrop-filter: blur(1px);
}

.wrapper {
  width: 100vw;
  position: relative;
  z-index: 1;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Grid Container */
.grid {
  overflow: visible;
}

/* Hover Effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}

.group:hover .group-hover\:text-blue-200 {
  color: #bfdbfe;
}

/* Grid Responsive Adjustments */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1025px) and (max-width: 1280px) {
  .grid {
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1281px) {
  .grid {
    grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
  }
}

/* Focus States for Accessibility */
.app-icon:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

<script>
import { getCurrentLanguage } from '@/plugins/language.js';
import storageManager from '@/plugins/storage';
import AccessBar from '@/interface/template/outline/AccessBar.vue';

export default {
  name: 'DashboardMobile',
  components: {
    AccessBar,
  },
  data() {
    return {
      apps: storageManager.get('navigation') || [],
      configs: storageManager.get('configs') || {},
      session: storageManager.get('session') || {},
      current: '',
      isLoading: false
    };
  },
  computed: {
    mainStyle() {
      const isAssetAdmin = this.configs.siteType === 'asset' && this.session.role === 'admin';
      const minHeight = isAssetAdmin ? 'calc(100vh - 285px)' : 'calc(100vh - 165px)';
      return { minHeight };
    },
    filteredApps() {
      const erpData = storageManager.get('erp');
      const useERPPermissions = erpData && erpData !== false && erpData.job_assignments && erpData.job_assignments.length > 0;
      
      let apps = this.apps.filter(app => app.inApp === 'yes');
      
      // ถ้ามี ERP permissions ให้กรองเฉพาะโมดูลที่อยู่ใน permissions
      if (useERPPermissions) {
        // รวม permissions จากทุก job_assignments
        const allPermissions = [];
        erpData.job_assignments.forEach(job => {
          if (job.permissions && Array.isArray(job.permissions)) {
            allPermissions.push(...job.permissions);
          }
        });
        
        const allowedModules = [...new Set(allPermissions.map(p => p.module))];
        
        apps = apps.filter(app => {
          // เช็คว่าโมดูลนี้อยู่ใน allowed modules หรือไม่
          return allowedModules.includes(app.slug);
        });
      }
      
      return apps;
    },
    isAccessBarVisible() {
      return ['superadmin', 'root'].includes(this.session.role);
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
    }
  },
  created() {
    this.current = getCurrentLanguage();
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    
    // เพิ่ม listener สำหรับ storage changes
    window.addEventListener('storage', this.handleStorageChange);
    
    // ตรวจสอบ navigation ทุกๆ 100ms จนกว่าจะได้ข้อมูล (สูงสุด 3 วินาที)
    this.checkNavigationInterval = setInterval(() => {
      const navigation = storageManager.get('navigation');
      if (navigation && navigation.length > 0 && this.apps.length === 0) {
        this.apps = navigation;
        clearInterval(this.checkNavigationInterval);
      }
    }, 100);
    
    // Clear interval หลัง 3 วินาที
    setTimeout(() => {
      if (this.checkNavigationInterval) {
        clearInterval(this.checkNavigationInterval);
      }
    }, 3000);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('storage', this.handleStorageChange);
    if (this.checkNavigationInterval) {
      clearInterval(this.checkNavigationInterval);
    }
  },
  methods: {
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
    },
    handleStorageChange(event) {
      // เมื่อ navigation ใน localStorage เปลี่ยน ให้อัพเดท apps
      if (event.key === 'navigation' || !event.key) {
        const navigation = storageManager.get('navigation');
        if (navigation) {
          this.apps = navigation;
        }
      }
    },
    menuNameTranslate(name) {
      if (typeof name === 'object' && name?.[this.current]) {
        return name[this.current];
      }
      return typeof name === 'string' ? name : 'Undefined';
    },
    isSessionDataExists(app) {
      return !!(app.session?.name && storageManager.get(app.session.name));
    },
    async removeSession(sessionName) {
      this.isLoading = true;
      try {
        storageManager.delete(sessionName);
        await this.$nextTick();
        window.location.href = "/";
      } catch (error) {
        console.error('Error removing session:', error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleSubMenu(app) {
      // Close other submenus first
      this.apps.forEach(a => {
        if (a !== app && a.showSubMenu) {
          a.showSubMenu = false;
        }
      });
      // Toggle current submenu
      app.showSubMenu = !app.showSubMenu;
    },
    handleClickOutside(event) {
      const isClickInsideSubmenu = this.apps.some(app => {
        const subAppsContent = this.$refs[`${app.id}-sub-apps-content`];
        return subAppsContent?.[0]?.contains(event.target);
      });

      if (!isClickInsideSubmenu) {
        this.apps.forEach(app => {
          app.showSubMenu = false;
        });
      }
    },
    handleAppClick(app) {
      if (app.hasSubmenu) {
        this.toggleSubMenu(app);
      } else if (this.isSessionDataExists(app)) {
        this.removeSession(app.session.name);
      } else {
        this.$router.push(app.href);
      }
    }
  }
};
</script>

<template>
  <AccessBar v-if="isAccessBarVisible" />

  <main 
    class="flex flex-col justify-between min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 bg-dashboard-background" 
    :style="{...mainStyle, ...dashboardBackgroundStyle, ...dashboardGradientStyle}"
  >
    <!-- Loading Overlay -->
    <div 
      v-if="isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">กำลังโหลด...</span>
      </div>
    </div>

    <div class="wrapper flex-1">
      <div class="p-5">
        <div class="mx-auto max-w-7xl px-2">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-white text-2xl font-bold mb-2" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)">
              แดชบอร์ด
            </h1>
            <p class="text-white text-opacity-80 text-sm" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">
              เลือกแอปพลิเคชันที่ต้องการใช้งาน
            </p>
          </div>

          <!-- Apps Grid -->
          <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
            <div 
              v-for="app in filteredApps" 
              :key="app.href || app.id" 
              class="app-container"
            >
              <!-- App Icon Container -->
              <div class="relative group">
                <div
                  class="app-icon relative flex items-center justify-center w-20 h-20 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  @click.stop="handleAppClick(app)"
                >
                  <div
                    class="app-icon__inner flex items-center justify-center w-full h-full rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-inner border border-gray-200"
                    :class="configs.siteStyle"
                  >
                    <font-awesome-icon 
                      :icon="['fas', isSessionDataExists(app) ? app.session.yes.icon : app.icon]" 
                      class="text-gray-700 text-3xl transition-colors duration-300 group-hover:text-blue-600" 
                    />
                  </div>
                  
                  <!-- Notification Badge -->
                  <span
                    v-if="app.counter"
                    class="notification-count absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs rounded-full flex items-center justify-center w-6 h-6 shadow-lg animate-pulse"
                  >
                    {{ app.counter }}
                  </span>

                  <!-- Submenu Indicator -->
                  <div 
                    v-if="app.hasSubmenu"
                    class="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                  >
                    <font-awesome-icon :icon="['fas', 'angle-down']" class="text-xs" />
                  </div>
                </div>
              </div>

              <!-- Submenu Modal -->
              <transition name="fade">
                <div
                  v-show="app.showSubMenu && app.submenu?.length"
                  class="sub-apps fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-40"
                  @click.self="app.showSubMenu = false"
                >
                  <div 
                    class="sub-apps__content bg-white rounded-2xl shadow-2xl p-4 m-4 max-w-xs w-full"
                    :ref="`${app.id}-sub-apps-content`"
                  >
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-base font-semibold text-gray-800">
                        {{ isSessionDataExists(app) ? app.session.yes.language : app.language }}
                      </h3>
                      <button 
                        @click="app.showSubMenu = false"
                        class="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        <font-awesome-icon :icon="['fas', 'times']" class="text-lg" />
                      </button>
                    </div>

                    <!-- Submenu Items - Fixed 3x3 Grid -->
                    <div class="grid grid-cols-3 gap-2">
                      <router-link
                        v-for="subApp in app.submenu"
                        :key="subApp.href"
                        :to="subApp.href"
                        class="sub-app group flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-200"
                        @click="app.showSubMenu = false"
                      >
                        <div class="flex flex-col items-center text-center">
                          <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                            <font-awesome-icon 
                              :icon="['fas', subApp.icon]" 
                              class="text-blue-600 text-2xl"
                            />
                          </div>
                          <span class="text-gray-700 text-xs font-medium text-center leading-tight">
                            {{ subApp.language }}
                          </span>
                        </div>
                      </router-link>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- App Label -->
              <div class="mt-3 px-1">
                <span 
                  class="app-icon__label text-white text-sm font-medium text-center block leading-tight"
                  style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
                >
                  {{ isSessionDataExists(app) ? app.session.yes.language : app.language }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="py-4 text-white text-center text-opacity-60 text-xs">
      <div class="border-t border-white border-opacity-20 pt-4">
        Multiverse LMS System v.1.02 (25/02/2024)
      </div>
    </footer>
  </main>
</template>

<style scoped>
/* Responsive Design */
@media only screen and (max-width: 767px) {
  main {
    min-height: calc(100vh - 115px);
  }
}

/* Base Styles */
body, html {
  overflow-x: hidden;
}

/* Background */
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

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;
}

/* App Icon Styles */
.app-icon__inner {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.app-icon:hover .app-icon__inner {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 8px 25px rgba(0, 0, 0, 0.25);
}

/* Notification Badge */
.notification-count {
  font-size: 0.75rem;
  line-height: 1;
  min-width: 1.5rem;
  height: 1.5rem;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Submenu Styles */
.sub-apps__content {
  animation: modalSlideIn 0.3s ease-out;
  max-height: 85vh;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Submenu Items - Fixed 3x3 Grid */
.sub-app {
  min-height: 90px;
  aspect-ratio: 1;
}

.sub-app .text-xs {
  font-size: 0.7rem;
  line-height: 0.9rem;
}

/* Responsive Adjustments */
@media (max-width: 320px) {
  .sub-apps__content {
    max-width: 300px;
    padding: 16px;
  }
  
  .sub-app {
    min-height: 75px;
    padding: 8px;
  }
  
  .sub-app .w-16 {
    width: 48px;
    height: 48px;
  }
  
  .sub-app .text-2xl {
    font-size: 1.25rem;
  }
  
  .sub-app .text-xs {
    font-size: 0.65rem;
    line-height: 0.8rem;
  }
}

@media (min-width: 321px) and (max-width: 375px) {
  .sub-apps__content {
    max-width: 340px;
    padding: 20px;
  }
  
  .sub-app {
    min-height: 85px;
  }
}

@media (min-width: 376px) {
  .sub-apps__content {
    max-width: 380px;
    padding: 24px;
  }
  
  .sub-app {
    min-height: 100px;
  }
}

/* App Label */
.app-icon__label {
  word-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
}

/* Loading Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover Effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}
</style>

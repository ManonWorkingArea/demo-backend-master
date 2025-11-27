<script>
import { getCurrentLanguage } from '@/plugins/language.js';
import storageManager from '@/plugins/storage';
import AccessBar from '@/interface/template/outline/AccessBar.vue';
import debug from '@/plugins/Logger.js';
//import io from 'socket.io-client';

export default {
    name: 'DashboardDesktop',
    data() {
        return {
          apps: storageManager.get('navigation') || [],
          configs: storageManager.get('configs') || {},
          session: storageManager.get('session') || {},
          dataItem: '',
          socket: null,
          receivedMessages: [],
          current: '',
          languages: [],
          messageInput: '',
          isLoading: false
        };
    },
    created() {
      debug.option(this.$route);
      this.current = getCurrentLanguage();
    },
    components: {
      AccessBar,
    },
    computed: {
      mainStyle() {
        const isAssetManager = this.configs.siteType === 'asset' && ['admin', 'manager'].includes(this.session.role);
        const minHeight = isAssetManager ? 'calc(100vh - 205px)' : 'calc(100vh - 165px)';
        return {
          minHeight,
        };
      },
      dashboardBackgroundStyle() {
        const bgImage = this.configs.dashboardBg || require('@/assets/images/wallpaper/desk-593327_1920.jpg');
        console.log('Dashboard background image:', bgImage);
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
      gridCols() {
        // Responsive grid columns based on screen size
        return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10';
      }
    },
    mounted() {
      debug.log(this.configs);
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
      
      // this.socket = io('https://gateway.cloudrestfulapi.com');
      // this.socket.on('receive-message', (message) => {
      //   this.receivedMessages.push(message);
      // });
      // this.socket.on('push-notification', (data) => {
      //   console.log('Received push notification from server:', data.message);
      //   this.showNotification(data.message);
      // });
    },
    beforeUnmount() {
      document.removeEventListener('click', this.handleClickOutside);
      window.removeEventListener('storage', this.handleStorageChange);
      if (this.checkNavigationInterval) {
        clearInterval(this.checkNavigationInterval);
      }
      if (this.socket) {
        this.socket.disconnect();
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
      // Define a function to fetch the last commit
      async fetchLastCommit(username, repository) {
        try {
          const response = await fetch(`https://api.github.com/repos/${username}/${repository}/commits`);
          const commits = await response.json();
          return commits.length > 0 ? commits[0] : null;
        } catch (error) {
          console.error('Error fetching commits:', error);
          return null;
        }
      },
      menuNameTranslate(name) {
        if (typeof name === 'object' && name?.[this.current]) {
          return name[this.current];
        }
        return typeof name === 'string' ? name : 'Undefined';
      },
      showNotification(message) {
        console.log('Notification:', message.text);
      },
      sendMessage() {
        if (this.messageInput.trim() !== '') {
          this.socket.emit('event-from-client', { text: this.messageInput });
          this.messageInput = '';
        }
      },
      isSessionDataExists(app) {
        return !!(
          app.session &&
          app.session.name &&
          storageManager.get(app.session.name)
        );
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
    },
  };
</script>

<template>
    <AccessBar v-if="isAccessBarVisible" />

    <!-- <div>
      <ul>
        <li v-for="message in receivedMessages" :key="message.id">{{ message.text }}</li>
      </ul>
      <input type="text" v-model="messageInput" @keyup.enter="sendMessage">
    </div> -->

    <main class="flex flex-col justify-between min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 bg-dashboard-background" :style="{...mainStyle, ...dashboardBackgroundStyle, ...dashboardGradientStyle}">
        <div class="wrapper flex-1">
            <div class="p-8 lg:p-12">
                <div class="mx-auto px-4">
                    <div class="text-center mb-12">
                        <h1 class="text-white text-4xl font-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)">
                            แดชบอร์ด
                        </h1>
                        <p class="text-white text-lg opacity-90" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">
                            ยินดีต้อนรับ
                        </p>
                    </div>

                    <div class="grid" :class="gridCols + ' gap-6'">
                        <div 
                            v-for="app in filteredApps" 
                            :key="app.href || app.id" 
                            class="app-container group"
                        >
                            <div class="relative">
                                <div
                                    class="app-icon relative flex items-center justify-center w-24 h-24 rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-2"
                                    @click.stop="handleAppClick(app)"
                                >
                                    <div
                                        class="app-icon__inner flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-inner border border-gray-200"
                                        :class="configs.siteStyle"
                                    >
                                        <font-awesome-icon 
                                            :icon="['fas', isSessionDataExists(app) ? app.session.yes.icon : app.icon]" 
                                            class="text-gray-700 text-4xl transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" 
                                        />
                                    </div>
                                    
                                    <span
                                        v-if="app.counter"
                                        class="notification-count absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm rounded-full flex items-center justify-center w-8 h-8 shadow-lg animate-pulse border-2 border-white"
                                    >
                                        {{ app.counter }}
                                    </span>

                                    <div 
                                        v-if="app.hasSubmenu"
                                        class="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white"
                                    >
                                        <font-awesome-icon :icon="['fas', 'angle-down']" class="text-xs" />
                                    </div>

                                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                </div>

                                <!-- Submenu Dropdown -->
                                <transition name="slide-down">
                                    <div
                                        v-show="app.showSubMenu && app.submenu?.length"
                                        class="submenu-wrapper absolute top-full mt-3 left-1/2 transform -translate-x-1/2 z-50"
                                        :ref="`${app.id}-sub-apps-content`"
                                    >
                                        <!-- Dropdown Arrow (outside overflow container) -->
                                        <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-t border-gray-200 rotate-45 z-10"></div>
                                        
                                        <!-- Submenu Content (with overflow-hidden) -->
                                        <div class="sub-apps bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-64">
                                            <!-- Submenu Header -->
                                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                                                <h3 class="text-sm font-semibold text-gray-800 text-center">
                                                    {{ isSessionDataExists(app) ? app.session.yes.language : app.language }}
                                                </h3>
                                            </div>

                                            <!-- Submenu Items -->
                                            <div class="py-2">
                                                <router-link
                                                    v-for="subApp in app.submenu"
                                                    :key="subApp.href"
                                                    :to="subApp.href"
                                                    class="sub-app flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 group/item"
                                                    @click="app.showSubMenu = false"
                                                >
                                                    <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-200">
                                                        <font-awesome-icon 
                                                            :icon="['fas', subApp.icon]" 
                                                            class="text-blue-600 text-sm" 
                                                        />
                                                    </div>
                                                    <span class="text-gray-700 text-sm font-medium group-hover/item:text-blue-600 transition-colors duration-200">
                                                        {{ subApp.language }}
                                                    </span>
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="mt-4 px-1">
                                <span 
                                    class="app-icon__label text-white text-sm font-medium text-center block leading-tight transition-all duration-300 group-hover:text-blue-200"
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
        <footer class="py-6 text-white text-center text-opacity-60 text-sm">
            <div class="border-t border-white border-opacity-20 pt-6 mx-8">
                <div class="flex items-center justify-center space-x-2">
                    <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-lg" />
                    <span>Multiverse LMS System v.1.02 (25/02/2024)</span>
                </div>
            </div>
        </footer>
    </main>

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
</template>

<style scoped>
@media only screen and (max-width: 767px) {
  main {
    min-height: calc(100vh - 115px);
  }
}
body,html {
  overflow-x: hidden;
}

/* For modern browsers */
.element-to-disable-selection {
  user-select: none;
}

/* For older browsers */
.element-to-disable-selection {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE 10+ */
  user-select: none;
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

/* Notification Badge */
.notification-count {
  font-size: 0.875rem;
  line-height: 1;
  min-width: 2rem;
  height: 2rem;
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.95);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.95);
}

/* Submenu Styles */
.submenu-wrapper {
  animation: dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000 !important;
}

.sub-apps {
  position: relative;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-15px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* App Label */
.app-icon__label {
  word-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
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

.dashboard-icon {
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
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

/* Grid Container */
.grid {
  overflow: visible;
}

/* Ensure parent containers don't clip submenu */
.wrapper,
.mx-auto {
  overflow: visible;
}

.sub-app-container {
  position: absolute;
  top: 0;
  left: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: rgba(0,0,0,0.6);
  padding: 20px;
  transition: all 0.3s ease;
}

.sub-app-container.hide {
  transform: translateX(100%);
  opacity: 0;
}

.sub-app-container.show {
  transform: translateX(0);
  opacity: 1;
}

.sub-app-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  margin-bottom: 20px;
}

.sub-app-label {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.sub-apps::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  width: 15px;
  height: 15px;
  background-color: white;
  transform: translateX(-50%) rotate(45deg);
  z-index: -1;
}

.sub-apps--empty {
  display: none;
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

.sub-app:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
</style>

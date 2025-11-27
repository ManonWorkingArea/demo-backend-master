<template>
  <main class="flex flex-col justify-between min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 bg-dashboard-background" :style="mainStyle">
    <div class="wrapper flex-1">
      <div class="p-8 lg:p-12">
        <div class="mx-auto px-4">
          <div class="text-center mb-12">
            <h1 class="text-white text-4xl font-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)">
              Dummy Module
            </h1>
            <p class="text-white text-lg opacity-90 hidden md:block" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5)">
              Template module สำหรับการพัฒนาโมดูลใหม่
            </p>
          </div>

          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            <div 
              v-for="menu in menuItems" 
              :key="menu.key" 
              class="app-container group"
              :class="{ 'opacity-60': menu.key === 'back' }"
            >
              <div class="relative">
                <router-link
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

    <footer class="py-6 text-white text-center text-opacity-60 text-sm">
      <div class="border-t border-white border-opacity-20 pt-6 mx-8">
        <div class="flex items-center justify-center space-x-2">
          <font-awesome-icon :icon="['fas', 'cube']" class="text-lg" />
          <span>Dummy Module v.1.0</span>
        </div>
      </div>
    </footer>
  </main>
</template>

<script>
export default {
  name: 'DummyModuleDashboard',
  
  data() {
    return {
      menuItems: [
        {
          key: 'back',
          label: 'Back',
          icon: 'arrow-left',
          to: '/'
        },
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'chart-line',
          to: '/dummy/overview'
        },
        {
          key: 'items',
          label: 'Items Management',
          icon: 'list',
          to: '/dummy/items'
        },
        {
          key: 'datatable',
          label: 'Data Table',
          icon: 'table',
          to: '/dummy/datatable'
        },
        {
          key: 'templates',
          label: 'Layout Templates',
          icon: 'th-large',
          to: '/dummy/templates'
        },
        {
          key: 'elements',
          label: 'UI Elements',
          icon: 'palette',
          to: '/dummy/elements'
        },
        {
          key: 'reports',
          label: 'Reports & Analytics',
          icon: 'chart-bar',
          to: '/dummy/reports'
        },
        {
          key: 'settings',
          label: 'Settings',
          icon: 'cog',
          to: '/dummy/settings'
        }
      ]
    }
  },

  computed: {
    mainStyle() {
      return {
        minHeight: 'calc(100vh - 165px)'
      }
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

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;
  overflow: visible;
}

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
  background-image: url(~@/assets/images/wallpaper/desk-593327_1920.jpg);
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
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.85), rgba(67, 56, 202, 0.7));
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

.grid {
  overflow: visible;
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}

.group:hover .group-hover\:text-blue-200 {
  color: #bfdbfe;
}

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

.app-icon:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

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

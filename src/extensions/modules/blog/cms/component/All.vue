<script>
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

import Content from '@/extensions/modules/blog/cms/component/_plugin/Content.vue';

export default {
  
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');
    return {
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      accessToken,
      session,
      loading_sources: true,
      activeTab: 'home',
      tabs: [
        { codeName: 'page', name: 'Page', icon: 'list', subText: 'หน้าเว็บ' },
        { codeName: 'form', name: 'Form', icon: 'file-alt', subText: 'แบบฟอร์ม' },
        { codeName: 'layout', name: 'Layout', icon: 'pencil-ruler', subText: 'เว็บเลย์เอาต์' },
        { codeName: 'menu', name: 'Menu', icon: 'list', subText: 'เมนูหน้าเว็บ' }
      ],
      selectedTab: 'page',
      sidebarStats: {
        total: 0,
        published: 0,
        draft: 0,
        favorites: 0
      },
      systemStatus: {
        storage: {
          used: 2.4,
          total: 10,
          percentage: 24
        },
        connection: 'normal',
        lastSync: 'เมื่อไม่นานนี้'
      }
    };
  },
  components: {
    Loader,
    Subhead,
    Content
  },
  methods: {
    selectTab(code) {
      this.selectedTab = code;
      window.location.hash = `#${code}`;
    },
    // Tools Methods
    async importData() {
      try {
        // เปิด file picker หรือ modal สำหรับ import
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv,.xlsx';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('Importing file:', file.name);
            // ดำเนินการ import
            this.processImportFile(file);
          }
        };
        input.click();
      } catch (error) {
        console.error('Import error:', error);
      }
    },
    
    async exportData() {
      try {
        // ส่งออกข้อมูลปัจจุบัน
        console.log('Exporting data...');
        
        // สร้างข้อมูลสำหรับส่งออก
        const exportData = {
          timestamp: new Date().toISOString(),
          type: this.selectedTab,
          data: 'content_data_here' // ข้อมูลจริงจาก Content component
        };
        
        // สร้างไฟล์และดาวน์โหลด
        this.downloadJSON(exportData, `cms_export_${this.selectedTab}_${Date.now()}.json`);
        
        this.$toast.success('ส่งออกข้อมูลสำเร็จ');
      } catch (error) {
        console.error('Export error:', error);
        this.$toast.error('เกิดข้อผิดพลาดในการส่งออก');
      }
    },
    
    processImportFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log('Imported data:', data);
          // ประมวลผลข้อมูลที่นำเข้า
          this.$toast.success('นำเข้าข้อมูลสำเร็จ');
        } catch (error) {
          console.error('Parse error:', error);
          this.$toast.error('รูปแบบไฟล์ไม่ถูกต้อง');
        }
      };
      reader.readAsText(file);
    },
    
    downloadJSON(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    manageTemplates() {
      // นำทางไปหน้าจัดการเทมเพลต
      this.$router.push('/cms/templates');
    },
    
    openMediaLibrary() {
      // เปิดคลังสื่อ
      this.$router.push('/cms/media');
    },
    
    // System Status Methods
    refreshSystemStatus() {
      // อัพเดทสถานะระบบ
      console.log('Refreshing system status...');
      
      // จำลองการอัพเดท
      this.systemStatus.lastSync = 'ล่าสุด';
      this.systemStatus.connection = 'normal';
      
      setTimeout(() => {
        this.systemStatus.lastSync = 'เมื่อไม่นานนี้';
      }, 3000);
    },
    
    // Statistics Methods
    updateSidebarStats() {
      // อัพเดทสถิติใน sidebar จากข้อมูลจริง
      // จะได้รับข้อมูลจาก Content component
      console.log('Updating sidebar statistics...');
    }
  },
  async mounted() {
    try {
      const hash = window.location.hash;
      if (hash) {
        const tabCode = hash.replace('#', '');
        if (this.tabs.some(tab => tab.codeName === tabCode)) {
          this.selectedTab = tabCode;
        }
      }
    } catch (error) {
      console.log(Error);
    }
  },
}
</script>

<template>
  <div class="bg-gray-50 flex cms-container">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 min-h-screen">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">จัดการเนื้อหา</h1>
          <router-link 
            to="/cms/add" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เพิ่มหน้าใหม่"
          >
            <i class="fas fa-plus text-sm"></i>
          </router-link>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">เนื้อหาทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ tabs.length }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">เผยแพร่แล้ว</span>
              </div>
              <span class="text-sm font-semibold text-green-600">24</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ร่าง</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">8</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ประเภทเนื้อหา</h3>
          <nav class="space-y-1">
            <button 
              v-for="tab in tabs" 
              :key="tab.codeName"
              @click="selectTab(tab.codeName)" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': selectedTab === tab.codeName,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedTab !== tab.codeName
              }"
            >
              <font-awesome-icon :icon="['fas', tab.icon]" class="text-sm w-4"/>
              <span class="flex-1 text-left">{{ tab.name }}</span>
              <span class="text-xs text-gray-500">{{ tab.subText }}</span>
            </button>
          </nav>
        </div>

        <!-- Tools & Utilities -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
          <div class="space-y-1">
            <button 
              @click="importData"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-download text-blue-500 w-4"></i>
              <span>นำเข้าข้อมูล</span>
            </button>
            <button 
              @click="exportData"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-upload text-green-500 w-4"></i>
              <span>ส่งออกข้อมูล</span>
            </button>
            <button 
              @click="manageTemplates"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-copy text-purple-500 w-4"></i>
              <span>จัดการเทมเพลต</span>
            </button>
            <button
              @click="openMediaLibrary"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-images text-pink-500 w-4"></i>
              <span>คลังสื่อ</span>
            </button>
          </div>
        </div>

        <!-- System Status -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถานะระบบ</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">พื้นที่จัดเก็บ</span>
              <span class="text-xs text-gray-900 font-medium">{{ systemStatus.storage.used }}GB / {{ systemStatus.storage.total }}GB</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full" :style="{ width: systemStatus.storage.percentage + '%' }"></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">การเชื่อมต่อ</span>
              <div class="flex items-center gap-1">
                <div :class="systemStatus.connection === 'normal' ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></div>
                <span :class="systemStatus.connection === 'normal' ? 'text-green-600' : 'text-red-600'" class="text-xs font-medium">
                  {{ systemStatus.connection === 'normal' ? 'ปกติ' : 'ขัดข้อง' }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">ล่าสุด</span>
              <button 
                @click="refreshSystemStatus"
                class="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                {{ systemStatus.lastSync }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <router-link 
              to="/cms/add"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-plus text-sm w-4"></i>
              <span>เพิ่มหน้าใหม่</span>
            </router-link>
            <router-link 
              to="/cms/customize"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-palette text-sm w-4"></i>
              <span>ตั้งค่าการแสดงผล</span>
            </router-link>
            <router-link 
              to="/cms/settings"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-cog text-sm w-4"></i>
              <span>ตั้งค่าระบบ</span>
            </router-link>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-4 flex-shrink-0">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
              <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">จัดการเนื้อหา</h1>
          <router-link 
            to="/cms/add" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-plus text-xs"></i>
            เพิ่มหน้า
          </router-link>
        </div>
      </div>

      <!-- Navigation Section -->
      <div v-if="loading_sources" class="bg-white border-b border-gray-200">
        <Subhead 
          :navigation="
          [
            {
              name: 'เพิ่ม Page',
              link: '/cms/add',
              style: 'plus',
              class: 'primary-btn',
              visible: true,
              type: 'button',
            },
            {
              name: 'ตั้งค่าการแสดงผล',
              link: '/cms/customize',
              style: 'palette',
              class: 'primary-btn',
              visible: true,
              type: 'button',
            },
          ]"
          @openPopup="openPopup"
        />
      </div>

      <!-- Tabs Section -->
      <div class="bg-white">
        <div class="tab-folder flex border-gray-400 bg-gray-500 pt-5 pl-2 md:pl-6">
          <div 
            class="tab-folder-item py-2 px-3 text-gray-700 transition-colors duration-200 bg-opacity-100 relative rounded-t-lg bg-gray-100 mr-2" 
            v-for="tab in tabs" 
            :key="tab.codeName" 
            :class="{ 
              'bg-gray-100 text-blue-600': selectedTab === tab.codeName && !$route.params.id,
              'bg-gray-100 bg-opacity-30': selectedTab !== tab.codeName || $route.params.id,
              'opacity-50 cursor-not-allowed': $route.params.id,
              'cursor-pointer hover:text-blue-600': !$route.params.id
            }"
            @click="$route.params.id ? null : selectTab(tab.codeName)"
          >
            <div class="flex items-center ">
              <font-awesome-icon :icon="['fas', tab.icon]" class="mr-1 hidden md:block"/>
              <div>{{ tab.name }}</div>
            </div>
            <div class="text-sm text-gray-600 hidden md:block">{{ tab.subText }}</div>
            <div v-if="selectedTab === tab.codeName && !$route.params.id" class="absolute bottom-0 left-0 w-full"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 pb-8 overflow-visible bg-gray-100">
        <div v-if="!loading_sources" class="text-center">
          <Loader/>
        </div>

        <div v-if="loading_sources" class="w-full">
          <div class="mx-auto px-6 sm:px-6 lg:px-6">
            <template v-if="selectedTab === 'page'">
              <Content 
                :itemType="selectedTab" 
                :dataItem="$route.params.id ? { id: $route.params.id, type: 'post' } : null"
              />
            </template>

            <template v-if="selectedTab === 'form'">
              <Content 
                :itemType="selectedTab"
                :dataItem="$route.params.id ? { id: $route.params.id, type: 'post' } : null"
              />
            </template>

            <template v-if="selectedTab === 'layout'">
              <Content 
                :itemType="selectedTab"
                :dataItem="$route.params.id ? { id: $route.params.id, type: 'post' } : null"
              />
            </template>

            <template v-if="selectedTab === 'menu'">
              <Content 
                :itemType="selectedTab"
                :dataItem="$route.params.id ? { id: $route.params.id, type: 'post' } : null"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CMS container with natural height */
.cms-container {
  min-height: calc(100vh - var(--header-height, 64px));
  overflow: visible;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .cms-container {
    min-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .cms-container {
    min-height: calc(100vh - var(--header-height, 56px));
  }
}

.tab-folder {
  display: flex;
}

.tab-folder-item {
  padding: 10px 20px 5px 20px;
  cursor: pointer;
}

.tab-folder-item:hover {
}

.tab-folder-item.active {
  font-weight: bold;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Sidebar styles */
.sidebar-menu-item {
  position: relative;
  overflow: hidden;
}

.sidebar-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: background-color 0.2s ease-in-out;
}

.sidebar-menu-item.active::before {
  background: #3b82f6;
}

/* Stats cards hover effect */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
<template>
  <div v-if="!$route.meta.fullscreen">
    <div v-if="isTopbarVisible && isLocalhost" class="bg-gray-900 px-4 py-2 flex justify-between items-center fixed top-0 w-full z-50 border-b border-gray-700">
      <div class="flex items-center">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-100">{{ activeHostname }}</span>
              <span v-if="activeHostnameInfo" class="text-xs text-gray-400">{{ activeHostnameInfo.siteView }}</span>
            </div>
          </div>
          <div v-if="activeHostnameInfo" class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
            <font-awesome-icon :icon="['fas', 'server']" class="mr-1" />
            {{ activeHostnameInfo.siteView || 'N/A' }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Custom Panel Dropdown -->
        <div class="relative">
          <button 
            @click="toggleDropdown" 
            class="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-200 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-150"
          >
            <span>เปลี่ยน</span>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs transition-transform duration-150" :class="{ 'rotate-180': isDropdownOpen }" />
          </button>
          
          <!-- Custom Panel -->
          <div v-if="isDropdownOpen" class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 w-[720px] overflow-hidden">
            <div class="p-3 border-b border-gray-100">
              <h3 class="text-sm font-medium text-gray-700">เลือก Hostname</h3>
            </div>
            <div class="p-3 max-h-[60vh] overflow-y-auto">
              <div class="grid grid-cols-3 gap-2">
                <div 
                  v-for="item in filteredItems" 
                  :key="item.hostname" 
                  @click="selectHostname(item.hostname)"
                  class="group p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors duration-150 border border-gray-200 hover:border-gray-300 h-16 flex flex-col justify-between"
                  :class="{ 'bg-blue-50 border-blue-300': selectedHostname === item.hostname }"
                >
                  <div class="text-xs font-medium text-gray-800 truncate leading-tight">{{ item.hostname }}</div>
                  <div class="flex justify-end">
                    <span v-if="item.siteView" class="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ item.siteView }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredItems.length === 0" class="text-center py-6 text-sm text-gray-400">
                ไม่พบข้อมูลที่ตรงตามเงื่อนไข
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-150" @click="setHostname">ตั้งค่า</button>
          <button class="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors duration-150" @click="resetStorage">รีเซ็ต</button>
          <button class="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors duration-150" @click="hideTopbar">
            <font-awesome-icon :icon="['fas','times']" />
          </button>
        </div>
      </div>
    </div>
    
    <button v-if="!isTopbarVisible && isLocalhost" class="fixed bottom-4 left-4 z-50 flex items-center space-x-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs rounded-lg shadow-lg transition-colors duration-150" @click="showTopbar">
      <font-awesome-icon :icon="['fas','globe']" class="text-xs" />
      <span>เปลี่ยน Hostname</span>
    </button>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'AdminTopbar',
  data() {
    return {
      hostkey:this.$Key,
      listItems: [],
      selectedHostname: '',
      isTopbarVisible: false,
      isDropdownOpen: false,
      activeHostname: storageManager.get('hostname'),
      activeHostnameInfo: null,
    };
  },
  async mounted() {
    // Fetch the list of hostnames and set the default selected option
    fetch("https://gateway.cloudrestfulapi.com/api/hostname", {
      method: 'GET',
      headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
    })
    .then(res => res.json())
    .then(data => {
      this.listItems = data;
      this.selectedHostname = this.activeHostname || (this.filteredItems.length > 0 ? this.filteredItems[0].hostname : '');
      this.activeHostnameInfo = this.filteredItems.find(item => item.hostname === this.activeHostname) || null;
    })
    .catch(err => console.error(err));

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  computed: {
    isLocalhost() {
      return location.hostname === 'localhost' || location.hostname === '192.168.2.138';
    },
    filteredItems() {
      return this.listItems.filter(item => item.siteView !== 'frontend');
    },
  },
  methods: {
    setHostname() {
      storageManager.set('hostname', this.selectedHostname);
      this.activeHostname = this.selectedHostname;
      this.activeHostnameInfo = this.filteredItems.find(item => item.hostname === this.selectedHostname) || null;
      this.resetStorage()
    },
    resetStorage() {
      storageManager.delete('plugins');
      storageManager.delete('configs');
      storageManager.delete('session');
      storageManager.delete('erp'); // ลบ ERP mode
      window.location.href = '/';
    },
    hideTopbar() {
      this.isTopbarVisible = !this.isTopbarVisible;
    },
    showTopbar() {
      this.isTopbarVisible = true;
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectHostname(hostname) {
      this.selectedHostname = hostname;
      this.activeHostnameInfo = this.filteredItems.find(item => item.hostname === hostname) || null;
      this.isDropdownOpen = false;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
  },
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>

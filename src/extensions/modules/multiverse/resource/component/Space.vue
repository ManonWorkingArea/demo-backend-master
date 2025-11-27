<script>

// Component
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import ResourceService from './ResourceService.js';

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey:this.$Key,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        resourceService: null,
        loading_sources: true,
        isEditMode: false, // Track whether in edit mode
        showModal: false, // To control the modal visibility
        spaceData: {
          name: '',
          status: '',
          spaceSize: '',
          s3Key: '',
          s3Endpoint: '',
          s3Hosting: '',
          s3Secret: '',
          s3Region: '',
          s3EndpointDefault: '',
          s3Bucket: '',
        },
        // Add a variable to store the item to edit
        listItemToEdit: null,
        listItem:[],
        showDeleteConfirmation: false,
        spaceToDelete: null,
        // New properties for enhanced UI
        error: null,
        isRefreshing: false,
        viewMode: 'grid', // grid or list
        searchTerm: '',
        sortBy: 'name_asc',
        selectedItems: [],
        bulkActions: false,
        openCardMenu: null,
        stats: {
          total: 0,
          active: 0,
          inactive: 0
        },
        showMobileSidebar: false,
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-hdd', count: 0 },
          { value: 'active', label: 'เปิดใช้งาน', icon: 'fas fa-check-circle', count: 0 },
          { value: 'inactive', label: 'ปิดใช้งาน', icon: 'fas fa-times-circle', count: 0 }
        ],
        activeFilter: 'all'
      }
    },
    components: {
    },
    computed: {
      filteredSpaces() {
        let filtered = this.listItem;

        // Filter by status
        if (this.activeFilter !== 'all') {
          if (this.activeFilter === 'active') {
            filtered = filtered.filter(space => space.status === true);
          } else if (this.activeFilter === 'inactive') {
            filtered = filtered.filter(space => space.status === false);
          }
        }

        // Filter by search term
        if (this.searchTerm) {
          filtered = filtered.filter(space => 
            space.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (space.s3Endpoint && space.s3Endpoint.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
            (space.s3Bucket && space.s3Bucket.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }

        // Sort spaces
        return this.sortSpaces(filtered);
      },

      // Computed properties for select all checkbox states
      allSelected() {
        return this.selectedItems.length === this.filteredSpaces.length && this.filteredSpaces.length > 0;
      },

      someSelected() {
        return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredSpaces.length;
      },

      // Stats for selected spaces
      selectedSpaceStats() {
        const selectedSpaces = this.listItem.filter(item => 
          this.selectedItems.includes(item._id)
        );
        
        return {
          activeCount: selectedSpaces.filter(item => item.status === true).length,
          inactiveCount: selectedSpaces.filter(item => item.status === false).length,
          totalCount: selectedSpaces.length,
          totalSize: selectedSpaces.reduce((acc, item) => acc + (parseInt(item.size) || 0), 0)
        };
      },

      // Helper computed property for checkbox states
      checkboxStates() {
        const states = {};
        this.filteredSpaces.forEach(space => {
          states[space._id] = this.selectedItems.includes(space._id);
        });
        return states;
      }
    },
    watch: {
      // Watch for changes in selectedItems to update checkbox states
      selectedItems: {
        handler(newSelection) {
          // Update bulk actions state
          this.bulkActions = newSelection.length > 0;
          
          // Update header checkbox states
          this.$nextTick(() => {
            this.updateHeaderCheckboxStates();
          });
        },
        deep: true
      },
      
      // Watch for changes in filteredSpaces to update selection
      filteredSpaces: {
        handler(newSpaces) {
          // If filtered spaces change, remove selected items that are no longer visible
          if (this.selectedItems.length > 0) {
            const visibleIds = newSpaces.map(item => item._id);
            this.selectedItems = this.selectedItems.filter(id => visibleIds.includes(id));
            this.bulkActions = this.selectedItems.length > 0;
          }
        },
        deep: true
      }
    },
    methods: {
      formatBytes(bytes) {
        var marker = 1024; // Change to 1000 if required
        var decimal = 3; // Change as required
        var kiloBytes = marker; // One Kilobyte is 1024 bytes
        var megaBytes = marker * marker; // One MB is 1024 KB
        var gigaBytes = marker * marker * marker; // One GB is 1024 MB
        if(bytes < kiloBytes) return bytes + " Bytes";
        else if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
        else if(bytes < gigaBytes) return(bytes / megaBytes).toFixed(decimal) + " MB";
        else return(bytes / gigaBytes).toFixed(decimal) + " GB";
      },
      calculateDiskUsagePercentage(bytes,full) {
        const limitInBytes = full * 1024 * 1024; // 5000MB in bytes
        const percentage = (bytes / limitInBytes) * 100;
        return percentage.toFixed(2); // Display percentage with two decimal places
      },
      editItem(mode, item) {
        this.listItemToEdit = item; // Store the item to edit
        this.closeCardMenu(); // Close any open dropdown menu
        this.openModal(mode, item); // Open the modal with the mode and item's data
      },
      // Modify the openModal method to accept a mode parameter
      openModal(mode, initialFormData = {}) {
        this.isEditMode = mode === 'edit'; // Set edit mode based on the mode parameter
        if (mode === 'add') {
          // Initialize empty form data for adding a new space
          this.spaceData = {
            name: '',
            status: true,
            spaceSize: '',
            s3Key: '',
            s3Endpoint: '',
            s3Hosting: '',
            s3Secret: '',
            s3Region: '',
            s3EndpointDefault: '',
            s3Bucket: '',
          };
        } else {
          // Initialize form data for editing with the provided data
          this.spaceData = { ...initialFormData }; 
        }
        this.showModal = true;
      },

      closeModal() {
        this.showModal = false;
      },
      
      submitForm() {
        if (this.isEditMode) {
          this.editData(this.listItemToEdit._id);
        } else {
          this.addData();
        }
      },
      
      async editData(id) {
        try {
          await this.resourceService.updateSpace(id, this.spaceData);
          console.log('Item updated successfully');
          await this.getData();
          this.closeModal();
        } catch (error) {
          console.error('Failed to update item:', error);
          this.error = 'ไม่สามารถอัปเดต Space ได้';
        }
      },
      
      async addData() {
        try {
          await this.resourceService.createSpace(this.spaceData);
          console.log('Item added successfully');
          await this.getData();
          this.closeModal();
        } catch (error) {
          console.error('Failed to add item:', error);
          this.error = 'ไม่สามารถเพิ่ม Space ได้';
        }
      },
      
      async getData() {
        if (storageManager.get('session', 'login')) {
          try {
            this.loading_sources = false;
            const updatedListItems = await this.resourceService.getSpacesWithStorageData();
            this.listItem = updatedListItems;
            this.loading_sources = true;
            this.calculateStats();
          } catch (error) {
            console.log(error);
            this.error = 'ไม่สามารถโหลดข้อมูล Space ได้';
            this.loading_sources = true;
          }
        }
      },
      

      
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            await this.resourceService.deleteSpace(id);
            this.loading_sources = true;
            await this.getData();
          } catch (error) {
            console.log(error)
            this.error = 'ไม่สามารถลบ Space ได้';
            this.loading_sources = true;
          }
        }
      },
      
      showDeleteDialog(space) {
        this.closeCardMenu(); // Close dropdown menu
        this.spaceToDelete = space;
        this.showDeleteConfirmation = true;
      },
      
      async confirmDelete() {
        try {
          await this.deleteData(this.spaceToDelete._id);
          this.showDeleteConfirmation = false;
        } catch (error) {
          console.error(error);
        }
      },
      
      cancelDelete() {
        this.showDeleteConfirmation = false;
      },
      
      // New methods for enhanced UI
      async refreshData() {
        if (this.isRefreshing) return;
        
        try {
          this.isRefreshing = true;
          await this.getData();
        } catch (error) {
          console.error('Error refreshing spaces:', error);
          this.error = 'ไม่สามารถรีเฟรชข้อมูลได้';
        } finally {
          this.isRefreshing = false;
        }
      },
      
      dismissError() {
        this.error = null;
      },

      // Card menu methods
      toggleCardMenu(spaceId) {
        this.openCardMenu = this.openCardMenu === spaceId ? null : spaceId;
      },

      closeCardMenu() {
        this.openCardMenu = null;
      },

      // Handle click outside
      handleClickOutside(event) {
        // Check if the clicked element is inside a dropdown menu or a dropdown button
        if (this.openCardMenu && 
            !event.target.closest('.dropdown-menu') && 
            !event.target.closest('button[data-dropdown-toggle]') &&
            !event.target.closest('.fa-ellipsis-v')) {
          this.closeCardMenu();
        }
      },
      
      // Selection methods
      toggleSelectAll(event) {
        if (event.target.checked) {
          this.selectedItems = this.filteredSpaces.map(item => item._id);
          this.bulkActions = true;
        } else {
          this.selectedItems = [];
          this.bulkActions = false;
        }
        
        // Force update indeterminate state
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      // Update header checkbox states
      updateHeaderCheckboxStates() {
        const headerCheckboxes = document.querySelectorAll('.header-select-all');
        headerCheckboxes.forEach(checkbox => {
          if (checkbox) {
            checkbox.checked = this.allSelected;
            checkbox.indeterminate = this.someSelected;
          }
        });
      },

      // Toggle select all visible items
      toggleSelectAllVisible() {
        if (this.allSelected) {
          this.selectedItems = [];
          this.bulkActions = false;
        } else {
          this.selectedItems = this.filteredSpaces.map(item => item._id);
          this.bulkActions = true;
        }
        
        // Force update indeterminate state
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      // Clear selection
      clearSelection() {
        this.selectedItems = [];
        this.bulkActions = false;
        
        // Force update indeterminate state
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      // Toggle individual selection
      toggleSelection(spaceId) {
        const index = this.selectedItems.indexOf(spaceId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        } else {
          this.selectedItems.push(spaceId);
        }
        this.bulkActions = this.selectedItems.length > 0;
        
        // Force update indeterminate state
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },
      
      // Calculate stats
      calculateStats() {
        const active = this.listItem.filter(item => item.status === true).length;
        const inactive = this.listItem.filter(item => item.status === false).length;
        
        this.stats = {
          total: this.listItem.length,
          active: active,
          inactive: inactive
        };

        // Update sidebar menu counts
        this.sidebarMenuItems.forEach(item => {
          switch(item.value) {
            case 'all':
              item.count = this.stats.total;
              break;
            case 'active':
              item.count = this.stats.active;
              break;
            case 'inactive':
              item.count = this.stats.inactive;
              break;
          }
        });
      },

      // Toggle mobile sidebar
      toggleMobileSidebar() {
        this.showMobileSidebar = !this.showMobileSidebar;
      },

      // Select filter
      selectFilter(filterValue) {
        this.activeFilter = filterValue;
        this.selectedItems = [];
        this.bulkActions = false;
        if (this.showMobileSidebar) {
          this.toggleMobileSidebar(); // Close mobile sidebar after selection
        }
      },

      // Sort spaces
      sortSpaces(spaces) {
        return spaces.sort((a, b) => {
          switch(this.sortBy) {
            case 'name_asc':
              return a.name.localeCompare(b.name);
            case 'name_desc':
              return b.name.localeCompare(a.name);
            case 'size_asc':
              return (parseInt(a.size) || 0) - (parseInt(b.size) || 0);
            case 'size_desc':
              return (parseInt(b.size) || 0) - (parseInt(a.size) || 0);
            case 'status_active':
              return b.status - a.status;
            case 'status_inactive':
              return a.status - b.status;
            default:
              return a.name.localeCompare(b.name);
          }
        });
      },

      // Get status class for badge styling
      getStatusClass(status) {
        return status 
          ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
          : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      },

      // Get usage status text
      getUsageStatusText(percentage) {
        if (percentage < 50) return 'ปกติ';
        if (percentage < 70) return 'ปานกลาง';
        if (percentage < 90) return 'สูง';
        return 'เต็มเกือบหมด';
      },

      // Toggle space status
      async toggleSpaceStatus(spaceId, currentStatus) {
        try {
          if (!confirm(`คุณต้องการ${currentStatus ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} Space นี้หรือไม่?`)) {
            return;
          }

          this.closeCardMenu(); // Close dropdown menu
          this.loading_sources = false;

          await this.resourceService.toggleResourceStatus('space', spaceId, currentStatus);
          await this.getData(); // Refresh the data

        } catch (error) {
          console.error('Error toggling space status:', error);
          this.error = 'ไม่สามารถเปลี่ยนสถานะ Space ได้';
          this.loading_sources = true;
        }
      },

      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        // Initialize ResourceService with hostkey
        this.resourceService = new ResourceService(this.hostkey);
        
        // Add event listener for click outside
        document.addEventListener('click', this.handleClickOutside);
        
        await this.getData();
      } catch (error) {
        console.error('Error initializing component:', error);
        this.error = 'ไม่สามารถเริ่มต้นระบบได้';
      }
    },
    beforeUnmount() {
      // Remove event listener
      document.removeEventListener('click', this.handleClickOutside);
    },
    updated() {
      // Replace feather icons
      this.$nextTick(() => {
        feather.replace();
      });
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>
  <div class="bg-gray-50 flex space-container h-full">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Spaces</h2>
          <button
            @click="openModal('add')"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="เพิ่ม Space"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div class="text-blue-600 text-xs font-medium">ทั้งหมด</div>
              <div class="text-blue-900 text-lg font-bold">{{ stats.total }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 border border-green-100">
              <div class="text-green-600 text-xs font-medium">เปิดใช้งาน</div>
              <div class="text-green-900 text-lg font-bold">{{ stats.active }}</div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหา Space..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <button 
              v-if="searchTerm" 
              @click="searchTerm = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="space-y-1">
            <button
              v-for="item in sidebarMenuItems"
              :key="item.value"
              @click="selectFilter(item.value)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                activeFilter === item.value 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="px-4 py-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">เรียงลำดับ</label>
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name_asc">ชื่อ A-Z</option>
            <option value="name_desc">ชื่อ Z-A</option>
            <option value="size_asc">ขนาดจากน้อยไปมาก</option>
            <option value="size_desc">ขนาดจากมากไปน้อย</option>
            <option value="status_active">เปิดใช้งานก่อน</option>
            <option value="status_inactive">ปิดใช้งานก่อน</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full">
          <button
            @click="toggleMobileSidebar"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i class="fas fa-bars"></i>
          </button>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold text-gray-900">Spaces</h1>
            <span v-if="selectedItems.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ selectedItems.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mobile Select All -->
            <button
              v-if="filteredSpaces.length > 0"
              @click="toggleSelectAllVisible"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'"
            >
              <i :class="['fas', allSelected ? 'fa-check-double' : someSelected ? 'fa-minus' : 'fa-check']"></i>
            </button>
            <button
              @click="openModal('add')"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full gap-4">
          <div class="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            <h1 class="hidden lg:block text-xl font-bold text-gray-900 flex-shrink-0">Space Management</h1>
            
            <!-- Select All Checkbox -->
            <div class="flex items-center gap-2 lg:gap-3 min-w-0">
              <div class="flex items-center gap-2 flex-shrink-0 relative">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 header-select-all flex-shrink-0 relative z-10"
                  data-select-all="true"
                  :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : someSelected ? 'เลือกทั้งหมด' : 'เลือกทั้งหมด'"
                />
                <label class="text-sm text-gray-600 cursor-pointer select-none truncate ml-2" @click="toggleSelectAllVisible">
                  <span class="hidden sm:inline">เลือกทั้งหมด </span>({{ selectedItems.length }}/{{ filteredSpaces.length }})
                </label>
              </div>
            </div>
            
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="refreshData"
                :disabled="isRefreshing"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <i :class="['fas', isRefreshing ? 'fa-spinner fa-spin' : 'fa-refresh']"></i>
                <span class="hidden sm:inline">{{ isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช' }}</span>
              </button>
            </div>
          </div>
          
          <!-- View Mode Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <i class="fas fa-th"></i>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
                viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 overflow-auto">
        <!-- Loading State -->
        <div v-if="!loading_sources" class="flex items-center justify-center py-20">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
              <p class="text-xs text-gray-500">กรุณารอสักครู่...</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="mb-4">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">เกิดข้อผิดพลาด!</strong>
            <span class="block sm:inline"> {{ error }}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="dismissError">
              <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>ปิด</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="loading_sources && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <!-- Space Cards -->
          <div v-for="space in filteredSpaces" :key="space._id" class="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-102 transition-all duration-200 hover:border-blue-300">
            <!-- Card Header with Selection -->
            <div class="flex items-center justify-between p-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(space._id)"
                  @change="toggleSelection(space._id)"
                  class="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                />
                <span :class="getStatusClass(space.status) + ' px-1.5 py-0.5 text-xs font-medium rounded-full'">
                  {{ space.status ? 'เปิด' : 'ปิด' }}
                </span>
              </div>
              <div class="relative">
                <button
                  @click.stop="toggleCardMenu(space._id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-all duration-200"
                  data-dropdown-toggle
                >
                  <i class="fas fa-ellipsis-v text-xs"></i>
                </button>
                <!-- Enhanced Dropdown Menu -->
                <div
                  v-if="openCardMenu === space._id"
                  class="dropdown-menu absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                  @click.stop
                >
                  <button
                    @click="editItem('edit', space)"
                    class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-all duration-200"
                  >
                    <i class="fas fa-edit w-4"></i>
                    แก้ไข
                  </button>
                  <button
                    @click="toggleSpaceStatus(space._id, space.status)"
                    class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-3 transition-all duration-200"
                  >
                    <i :class="(space.status ? 'fas fa-toggle-off' : 'fas fa-toggle-on') + ' w-4'"></i>
                    {{ space.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
                  </button>
                  <hr class="border-gray-100">
                  <button
                    @click="showDeleteDialog(space)"
                    class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-all duration-200"
                  >
                    <i class="fas fa-trash w-4"></i>
                    ลบ
                  </button>
                </div>
              </div>
            </div>

            <!-- Space Icon and Usage - Compact Single Row Layout -->
            <div class="flex items-center py-3 px-3 gap-3 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
              <!-- Left Side: Icon and Percentage -->
              <div class="flex-shrink-0 flex items-center gap-3">
                <!-- Compact Storage Icon with Animation -->
                <div class="relative">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <i class="fas fa-hdd text-white text-base group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  <!-- Usage indicator dot -->
                  <div 
                    class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    :class="{
                      'bg-emerald-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                      'bg-blue-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                      'bg-amber-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                      'bg-red-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                    }"
                  ></div>
                </div>
                
                <!-- Compact Usage Percentage -->
                <div class="text-left">
                  <div 
                    class="text-xl font-bold leading-none group-hover:scale-105 transition-transform duration-300"
                    :class="{
                      'text-emerald-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                      'text-blue-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                      'text-amber-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                      'text-red-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                    }"
                  >
                    {{ Math.round(calculateDiskUsagePercentage((space.size / 1024), space.spaceSize)) }}%
                  </div>
                  <div class="text-xs text-gray-500 font-medium">ใช้งาน</div>
                </div>
              </div>

              <!-- Right Side: Compact Progress Bar and Storage Info -->
              <div class="flex-1 min-w-0">
                <!-- Compact Progress Bar with Gradient -->
                <div class="mb-2">
                  <div class="bg-gray-200 h-1 rounded-full overflow-hidden shadow-inner">
                    <div 
                      class="h-full transition-all duration-500 ease-out relative" 
                      :class="{
                        'bg-gradient-to-r from-emerald-400 to-emerald-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                        'bg-gradient-to-r from-blue-400 to-blue-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                        'bg-gradient-to-r from-amber-400 to-amber-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                        'bg-gradient-to-r from-red-400 to-red-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                      }"
                      :style="'width:' + Math.min(calculateDiskUsagePercentage((space.size / 1024), space.spaceSize), 100) + '%'">
                      <!-- Subtle glow effect -->
                      <div class="absolute inset-0 bg-white opacity-30 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <!-- Compact Storage Info with Better Typography -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold text-gray-800">{{formatBytes(space.size)}}</span>
                    <span class="text-xs text-gray-500">/ {{ space.spaceSize }} GB</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-600">
                      <i class="fas fa-file-alt mr-1 text-gray-400 text-xs"></i>
                      {{ (space.count || 0).toLocaleString() }} ไฟล์
                    </span>
                    <span class="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      :class="{
                        'bg-emerald-100 text-emerald-700': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                        'bg-blue-100 text-blue-700': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                        'bg-amber-100 text-amber-700': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                        'bg-red-100 text-red-700': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                      }"
                    >
                      {{ getUsageStatusText(calculateDiskUsagePercentage((space.size / 1024), space.spaceSize)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Space Info - Compact -->
            <div class="px-3 pb-3">
              <h3 class="font-semibold text-gray-900 text-sm truncate mb-2 text-center">{{ space.name }}</h3>
              
              <!-- Connection Details - Compact -->
              <div class="space-y-1.5" v-if="space.s3Bucket || space.s3Endpoint">
                <div class="text-xs text-gray-500 text-center bg-gray-50 rounded-md py-1.5 px-2" v-if="space.s3Bucket">
                  <i class="fas fa-database mr-1 text-blue-500"></i>{{ space.s3Bucket }}
                </div>
                <div class="text-xs text-gray-500 text-center bg-gray-50 rounded-md py-1.5 px-2 truncate" v-if="space.s3Endpoint">
                  <i class="fas fa-link mr-1 text-green-500"></i>{{ space.s3Endpoint }}
                </div>
              </div>
            </div>

            <!-- Enhanced Card Actions - Compact -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-3 py-2">
              <div class="flex justify-center space-x-4">
                <button 
                  @click="editItem('edit', space)"
                  class="group flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  <i class="fas fa-edit text-xs group-hover:scale-110 transition-transform duration-200"></i> 
                  แก้ไข
                </button>
                <button 
                  @click="showDeleteDialog(space)"
                  class="group flex items-center gap-1.5 text-gray-600 hover:text-red-600 text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  <i class="fas fa-trash text-xs group-hover:scale-110 transition-transform duration-200"></i> 
                  ลบ
                </button>
              </div>
            </div>
          </div>

          <!-- Enhanced Add Space Card - Compact -->
          <div 
            @click="openModal('add')"
            class="group bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:scale-102 min-h-[280px]"
          >
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-plus text-lg group-hover:scale-110 transition-transform duration-300"></i>
            </div>
            <span class="text-gray-600 font-medium text-sm group-hover:text-blue-600 transition-colors duration-300 text-center px-2">เพิ่ม Space ใหม่</span>
            <span class="text-gray-500 text-xs mt-1 group-hover:text-blue-500 transition-colors duration-300 text-center px-2">คลิกเพื่อสร้าง</span>
          </div>
        </div>

        <!-- List View -->
        <div v-if="loading_sources && viewMode === 'list'" class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" class="px-4 py-4 text-left">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 header-select-all transition-all duration-200"
                    />
                  </div>
                </th>
                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  ชื่อ Space
                </th>
                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  ขนาดการใช้งาน
                </th>
                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  จำนวนไฟล์
                </th>
                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  การใช้งาน
                </th>
                <th scope="col" class="px-4 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-50">
              <tr v-for="space in filteredSpaces" :key="space._id" class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                <td class="px-4 py-5 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(space._id)"
                    @change="toggleSelection(space._id)"
                    class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                </td>
                <td class="px-4 py-5 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 text-center mr-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-md">
                        <i class="fas fa-hdd text-white text-lg"></i>
                      </div>
                    </div>
                    <div>
                      <div class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{{ space.name }}</div>
                      <div class="text-xs text-gray-500" v-if="space.s3Bucket">
                        <i class="fas fa-database mr-1"></i>{{ space.s3Bucket }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-5 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{formatBytes(space.size)}}</div>
                  <div class="text-xs text-gray-500">จาก <span class="font-semibold">{{ space.spaceSize }} GB</span></div>
                </td>
                <td class="px-4 py-5 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ (space.count || 0).toLocaleString() }}</div>
                  <div class="text-xs text-gray-500">ไฟล์</div>
                </td>
                <td class="px-4 py-5 whitespace-nowrap">
                  <span :class="getStatusClass(space.status) + ' px-3 py-1.5 text-xs font-semibold rounded-full'">
                    {{ space.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <!-- Enhanced Progress Bar Container -->
                    <div class="flex-1 min-w-0">
                      <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                        <div 
                          class="h-full transition-all duration-500 ease-out relative" 
                          :class="{
                            'bg-gradient-to-r from-emerald-400 to-emerald-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                            'bg-gradient-to-r from-blue-400 to-blue-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                            'bg-gradient-to-r from-amber-400 to-amber-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                            'bg-gradient-to-r from-red-400 to-red-500': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                          }"
                          :style="'width:' + Math.min(calculateDiskUsagePercentage((space.size / 1024), space.spaceSize), 100) + '%'">
                          <!-- Subtle glow effect -->
                          <div class="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Enhanced Percentage Display -->
                    <div class="flex-shrink-0 w-16 text-right">
                      <div class="flex flex-col items-end">
                        <div 
                          class="text-sm font-bold leading-none"
                          :class="{
                            'text-emerald-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 50,
                            'text-blue-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 50 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 70,
                            'text-amber-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 70 && calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) < 90,
                            'text-red-600': calculateDiskUsagePercentage((space.size / 1024), space.spaceSize) >= 90
                          }"
                        >
                          {{ Math.round(calculateDiskUsagePercentage((space.size / 1024), space.spaceSize)) }}%
                        </div>
                        <div class="text-xs text-gray-400 mt-1">ใช้งาน</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click="editItem('edit', space)" 
                      class="group p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit group-hover:scale-110 transition-transform duration-200"></i>
                    </button>
                    <button 
                      @click="toggleSpaceStatus(space._id, space.status)" 
                      class="group p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                      :title="space.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                    >
                      <i :class="(space.status ? 'fas fa-toggle-on text-green-600' : 'fas fa-toggle-off') + ' group-hover:scale-110 transition-transform duration-200'"></i>
                    </button>
                    <button 
                      @click="showDeleteDialog(space)" 
                      class="group p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="ลบ"
                    >
                      <i class="fas fa-trash group-hover:scale-110 transition-transform duration-200"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSpaces.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-folder-open text-4xl text-gray-300 mb-3"></i>
                    <p>ไม่พบข้อมูล Space</p>
                    <button 
                      @click="openModal('add')" 
                      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <i class="fas fa-plus mr-2"></i> เพิ่ม Space ใหม่
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar"
      class="fixed inset-0 z-40 lg:hidden"
    >
      <div class="absolute inset-0 bg-gray-600 opacity-75" @click="toggleMobileSidebar"></div>
      <div class="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm bg-white">
        <!-- Copy content from desktop sidebar here -->
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Spaces</h2>
          <button
            @click="toggleMobileSidebar"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Copy over the stats, filters, and sorting from the desktop sidebar -->
        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div class="text-blue-600 text-xs font-medium">ทั้งหมด</div>
              <div class="text-blue-900 text-lg font-bold">{{ stats.total }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 border border-green-100">
              <div class="text-green-600 text-xs font-medium">เปิดใช้งาน</div>
              <div class="text-green-900 text-lg font-bold">{{ stats.active }}</div>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหา Space..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <button 
              v-if="searchTerm" 
              @click="searchTerm = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="space-y-1">
            <button
              v-for="item in sidebarMenuItems"
              :key="item.value"
              @click="selectFilter(item.value)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                activeFilter === item.value 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for Add/Edit space -->
  <div
    class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
    v-if="showModal"
  >
    <div class="fixed inset-0 bg-black opacity-50"></div>
    <div class="relative bg-white w-full md:w-1/2 lg:w-1/2 rounded shadow-lg max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="bg-blue-500 text-white p-3 rounded-t">
        <h3 class="text-md font-semibold"><i class="fas fa-server mr-2"></i> {{ isEditMode ? 'แก้ไข Space' : 'เพิ่ม Space ใหม่' }}</h3>
        <button class="absolute top-2 right-3 text-2xl font-semibold hover:text-gray-200"
        @click="closeModal">&times;</button>
      </div>

      <!-- Modal Content -->
      <div class="p-5">
        <form>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="mb-4">
              <label for="name" class="block text-gray-700 font-medium mb-2">Storage Name</label>
              <input
                v-model="spaceData.name"
                type="text"
                id="name"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter storage name"
              />
            </div>

            <div class="mb-4">
              <label for="space" class="block text-gray-700 font-medium mb-2">Disk Space (GB)</label>
              <input
                v-model="spaceData.spaceSize"
                type="text"
                id="space"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter disk space in GB"
              />
            </div>

            <div class="mb-4">
              <label for="s3Key" class="block text-gray-700 font-medium mb-2">S3 Key</label>
              <input
                v-model="spaceData.s3Key"
                type="text"
                id="s3Key"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 key"
              />
            </div>

            <div class="mb-4">
              <label for="s3Secret" class="block text-gray-700 font-medium mb-2">S3 Secret</label>
              <input
                v-model="spaceData.s3Secret"
                type="password"
                id="s3Secret"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 secret"
              />
            </div>

            <div class="mb-4">
              <label for="s3Endpoint" class="block text-gray-700 font-medium mb-2">S3 Endpoint</label>
              <input
                v-model="spaceData.s3Endpoint"
                type="text"
                id="s3Endpoint"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 endpoint"
              />
            </div>

            <div class="mb-4">
              <label for="s3EndpointDefault" class="block text-gray-700 font-medium mb-2">S3 Default Endpoint</label>
              <input
                v-model="spaceData.s3EndpointDefault"
                type="text"
                id="s3EndpointDefault"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 default endpoint"
              />
            </div>

            <div class="mb-4">
              <label for="s3Region" class="block text-gray-700 font-medium mb-2">S3 Region</label>
              <input
                v-model="spaceData.s3Region"
                type="text"
                id="s3Region"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 region"
              />
            </div>

            <div class="mb-4">
              <label for="s3Hosting" class="block text-gray-700 font-medium mb-2">S3 Hosting</label>
              <input
                v-model="spaceData.s3Hosting"
                type="text"
                id="s3Hosting"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 hosting"
              />
            </div>

            <div class="mb-4">
              <label for="s3Bucket" class="block text-gray-700 font-medium mb-2">S3 Bucket</label>
              <input
                v-model="spaceData.s3Bucket"
                type="text"
                id="s3Bucket"
                class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter S3 bucket"
              />
            </div>

            <!-- Status Checkbox -->
            <div class="mb-4 col-span-1 md:col-span-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="spaceData.status"
                  class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                /> 
                <span class="text-gray-700">Space is active and available for use</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-100 px-5 py-4 flex justify-end rounded-b">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mr-3"
          @click="closeModal"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          @click="submitForm"
          class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <i class="fas fa-save mr-2"></i>
          {{ isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่ม Space' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Delete confirmation dialog -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden w-96">
      <!-- Modal Header -->
      <div class="bg-red-500 text-white p-4">
        <h3 class="text-lg font-medium flex items-center">
          <i class="fas fa-exclamation-circle mr-2"></i> ยืนยันการลบข้อมูล
        </h3>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6">
        <div class="flex flex-col items-center justify-center text-center">
          <i class="fas fa-trash-alt text-red-500 text-5xl mb-4"></i>
          <p class="text-gray-700 mb-1">
            คุณกำลังจะลบ Space
          </p>
          <p class="text-lg font-bold text-red-600 mb-1">
            "{{ spaceToDelete ? spaceToDelete.name : '' }}"
          </p>
          <p class="text-gray-500 text-sm mt-2">
            การดำเนินการนี้ไม่สามารถเรียกคืนได้ และข้อมูลทั้งหมดใน Space นี้จะถูกลบ
          </p>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="bg-gray-100 px-6 py-4 flex justify-between">
        <button
          @click="cancelDelete"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 flex items-center"
        >
          <i class="fas fa-trash mr-2"></i>
          ยืนยันการลบ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Space container with full height */
.space-container {
  height: 100vh;
  max-height: 100vh;
}

/* Responsive adjustments */
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

/* Card and relative positioning */
.content-card {
  position: relative;
  overflow: visible;
  transition: all 0.2s ease-in-out;
}

.content-card .relative {
  position: relative;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Ensure dropdown is positioned correctly */
.content-card .dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  z-index: 50;
  min-width: 160px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Dropdown menu styles */
.dropdown-menu {
  animation: fadeIn 0.2s ease-out;
  z-index: 9999 !important;
  position: absolute !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.dropdown-menu button {
  transition: background-color 0.15s ease-in-out;
}

.dropdown-menu button:hover {
  background-color: #f3f4f6;
}

.dropdown-menu button:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-menu button:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add Content Card specific styles */
.add-content-card {
  transition: all 0.2s ease-in-out;
}

.add-content-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Sidebar menu item active state */
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

/* Button hover effects */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Status badges */
.status-badge {
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.3s ease-in-out;
}

.status-badge:hover::before {
  left: 100%;
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar styling */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
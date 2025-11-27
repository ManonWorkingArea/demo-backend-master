<script>

// Component
import feather from 'feather-icons';
// import Loader from '@/interface/template/Loader.vue';
// import Subhead from '@/interface/template/outline/Subhead.vue';
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
        clientData: {
          clientId: '',
          status: true,
          source: 'mongodb',
          clientToken: '',
          connection: {
            URI: '',
            database: '',
            host: '',
            port: '',
            user: '',
            password: '',
          },
        },
        // Add a variable to store the item to edit
        listItemToEdit: null,
        listItem:[],
        showDeleteConfirmation: false,
        spaceToDelete: null,
        error: null,
        isRefreshing: false,
        viewMode: 'grid', // grid หรือ list
        searchTerm: '',
        sortBy: 'name_asc',
        selectedItems: [],
        bulkActions: false,
        openCardMenu: null,
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          mongodb: 0,
          mysql: 0,
          postgresql: 0,
          firestore: 0,
          api: 0
        },
        showMobileSidebar: false,
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-server', count: 0 },
          { value: 'active', label: 'เปิดใช้งาน', icon: 'fas fa-check-circle', count: 0 },
          { value: 'inactive', label: 'ปิดใช้งาน', icon: 'fas fa-times-circle', count: 0 },
          { value: 'mongodb', label: 'MongoDB', icon: 'fas fa-database', count: 0 },
          { value: 'mysql', label: 'MySQL', icon: 'fas fa-database', count: 0 },
          { value: 'postgresql', label: 'PostgreSQL', icon: 'fas fa-database', count: 0 }
        ],
        activeFilter: 'all',
        activeQuickFilter: null,
        quickFilters: [
          { value: 'mongodb', label: 'MongoDB', icon: 'fas fa-database' },
          { value: 'mysql', label: 'MySQL', icon: 'fas fa-database' },
          { value: 'postgresql', label: 'PostgreSQL', icon: 'fas fa-database' },
          { value: 'firestore', label: 'Firestore', icon: 'fas fa-fire' },
          { value: 'api', label: 'REST API', icon: 'fas fa-globe' }
        ]
      }
    },
    components: {
      // Loader,
      // Subhead
    },
    computed: {
      filteredClients() {
        let filtered = this.listItem;

        // Apply quick filters first
        if (this.activeQuickFilter) {
          filtered = filtered.filter(client => client.source === this.activeQuickFilter);
        }

        // Filter by status
        if (this.activeFilter !== 'all') {
          if (this.activeFilter === 'active') {
            filtered = filtered.filter(client => client.status === true);
          } else if (this.activeFilter === 'inactive') {
            filtered = filtered.filter(client => client.status === false);
          } else {
            filtered = filtered.filter(client => client.source === this.activeFilter);
          }
        }

        // Filter by search term
        if (this.searchTerm) {
          filtered = filtered.filter(client => 
            client.clientId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            client.source.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (client.clientToken && client.clientToken.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }

        // Sort clients
        return this.sortClients(filtered);
      },

      // Computed properties for select all checkbox states
      allSelected() {
        return this.selectedItems.length === this.filteredClients.length && this.filteredClients.length > 0;
      },

      someSelected() {
        return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredClients.length;
      },

      // Stats for selected clients
      selectedClientStats() {
        const selectedClients = this.listItem.filter(item => 
          this.selectedItems.includes(item._id)
        );
        
        return {
          activeCount: selectedClients.filter(item => item.status === true).length,
          inactiveCount: selectedClients.filter(item => item.status === false).length,
          totalCount: selectedClients.length
        };
      },

      // Helper computed property for checkbox states
      checkboxStates() {
        const states = {};
        this.filteredClients.forEach(client => {
          states[client._id] = this.selectedItems.includes(client._id);
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
          
          // Debug logging
          console.log('selectedItems changed:', {
            newSelection,
            bulkActions: this.bulkActions,
            allSelected: this.allSelected,
            someSelected: this.someSelected
          });
        },
        deep: true
      },
      
      // Watch for changes in filteredClients to update selection
      filteredClients: {
        handler(newClients) {
          // If filtered clients change, remove selected items that are no longer visible
          if (this.selectedItems.length > 0) {
            const visibleIds = newClients.map(item => item._id);
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
        this.isEditMode = mode === 'edit';
        if (mode === 'add') {
          // Initialize form data for adding a new client
          this.clientData = {
            clientId: '',
            status: true,
            source: 'mongodb',
            clientToken: '',
            connection: {
              URI: '',
              database: '',
              host: '',
              port: '',
              user: '',
              password: '',
            },
          };
        } else {
          // Initialize form data for editing an existing client
          this.clientData = { ...initialFormData }; // Replace with actual data for editing
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
          await this.resourceService.updateClient(id, this.clientData);
          console.log('Item updated successfully');
          await this.getData();
          this.closeModal();
        } catch (error) {
          console.error('Failed to update item:', error);
          this.error = 'ไม่สามารถอัปเดต Client ได้';
        }
      },
      async addData() {
        try {
          await this.resourceService.createClient(this.clientData);
          console.log('Item added successfully');
          await this.getData();
          this.closeModal();
        } catch (error) {
          console.error('Failed to add item:', error);
          this.error = 'ไม่สามารถเพิ่ม Client ได้';
        }
      },
      async getData() {
        if (storageManager.get('session', 'login')) {
          try {
            this.loading_sources = false;
            const restReturn = await this.resourceService.getClients();
            this.listItem = restReturn || [];
            this.loading_sources = true;
            this.calculateStats();
          } catch (error) {
            console.error('Error loading clients:', error);
            this.error = 'ไม่สามารถโหลดข้อมูล Client ได้';
            this.loading_sources = true;
            this.listItem = [];
            this.calculateStats();
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            await this.resourceService.deleteClient(id);
            await this.getData();
          } catch (error) {
            console.error('Error deleting client:', error);
            this.error = 'ไม่สามารถลบ Client ได้';
            this.loading_sources = true;
          }
        }
      },

      async refreshData() {
        if (this.isRefreshing) return;
        
        try {
          this.isRefreshing = true;
          await this.getData();
        } catch (error) {
          console.error('Error refreshing clients:', error);
          this.error = 'ไม่สามารถรีเฟรชข้อมูลได้';
        } finally {
          this.isRefreshing = false;
        }
      },

      // เพิ่ม method สำหรับการจัดการ error
      dismissError() {
        this.error = null;
      },

      // Toggle card menu
      toggleCardMenu(clientId) {
        console.log('toggleCardMenu called with clientId:', clientId);
        console.log('Current openCardMenu:', this.openCardMenu);
        console.log('Element that triggered:', event.target);
        
        this.openCardMenu = this.openCardMenu === clientId ? null : clientId;
        console.log('New openCardMenu:', this.openCardMenu);
        
        // Force Vue to update the DOM
        this.$nextTick(() => {
          console.log('DOM updated, openCardMenu is now:', this.openCardMenu);
        });
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

      // Toggle select all
      toggleSelectAll(event) {
        if (event.target.checked) {
          this.selectedItems = this.filteredClients.map(item => item._id);
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
          this.selectedItems = this.filteredClients.map(item => item._id);
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
      toggleSelection(clientId) {
        const index = this.selectedItems.indexOf(clientId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        } else {
          this.selectedItems.push(clientId);
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
        const mongodb = this.listItem.filter(item => item.source === 'mongodb').length;
        const mysql = this.listItem.filter(item => item.source === 'mysql').length;
        const postgresql = this.listItem.filter(item => item.source === 'postgresql').length;
        const firestore = this.listItem.filter(item => item.source === 'firestore').length;
        const api = this.listItem.filter(item => item.source === 'api').length;
        
        this.stats = {
          total: this.listItem.length,
          active: active,
          inactive: inactive,
          mongodb: mongodb,
          mysql: mysql,
          postgresql: postgresql,
          firestore: firestore,
          api: api
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
            case 'mongodb':
              item.count = this.stats.mongodb;
              break;
            case 'mysql':
              item.count = this.stats.mysql;
              break;
            case 'postgresql':
              item.count = this.stats.postgresql;
              break;
          }
        });
      },

      // Sidebar methods
      toggleMobileSidebar() {
        this.showMobileSidebar = !this.showMobileSidebar;
      },

      selectFilter(filterValue) {
        this.activeFilter = filterValue;
        this.selectedItems = [];
        this.bulkActions = false;
        if (this.showMobileSidebar) {
          this.toggleMobileSidebar(); // Close mobile sidebar after selection
        }
      },

      sortClients(clients) {
        return clients.sort((a, b) => {
          switch(this.sortBy) {
            case 'name_asc':
              return a.clientId.localeCompare(b.clientId);
            case 'name_desc':
              return b.clientId.localeCompare(a.clientId);
            case 'source_asc':
              return a.source.localeCompare(b.source);
            case 'source_desc':
              return b.source.localeCompare(a.source);
            case 'status_active':
              return b.status - a.status;
            case 'status_inactive':
              return a.status - b.status;
            default:
              return a.clientId.localeCompare(b.clientId);
          }
        });
      },

      // Quick filter methods
      applyQuickFilter(filter) {
        if (this.activeQuickFilter === filter.value) {
          this.activeQuickFilter = null;
        } else {
          this.activeQuickFilter = filter.value;
        }
      },

      getStatusClass(status) {
        return status 
          ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
          : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      },

      async toggleClientStatus(clientId, currentStatus) {
        try {
          if (!confirm(`คุณต้องการ${currentStatus ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} Client นี้หรือไม่?`)) {
            return;
          }

          this.closeCardMenu(); // Close dropdown menu
          this.loading_sources = false;

          await this.resourceService.toggleResourceStatus('client', clientId, currentStatus);
          await this.getData(); // Refresh the data

        } catch (error) {
          console.error('Error toggling client status:', error);
          this.error = 'ไม่สามารถเปลี่ยนสถานะ Client ได้';
          this.loading_sources = true;
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
      updated() {
        feather.replace();
      },
      revokeToken() {
        // Generate a new random key (you can use any method to generate a random key)
        const newToken = this.generateRandomToken();
        // Assign the new token to clientData.clientToken
        this.clientData.clientToken = newToken;
        // Optionally, you can also save the new token to your server or perform any other actions
        console.log('Token revoked and replaced with a new random key');
      },
      generateRandomToken() {
        // Generate a random alphanumeric token (you can customize this)
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const tokenLength = 32; // Adjust the length of the token as needed
        let randomToken = '';
        for (let i = 0; i < tokenLength; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomToken += characters.charAt(randomIndex);
        }
        return randomToken;
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
  <div class="bg-gray-50 flex client-container h-full">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Clients</h2>
          <button
            @click="openModal('add')"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="เพิ่ม Client"
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
            <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div class="text-purple-600 text-xs font-medium">MongoDB</div>
              <div class="text-purple-900 text-lg font-bold">{{ stats.mongodb }}</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div class="text-orange-600 text-xs font-medium">MySQL</div>
              <div class="text-orange-900 text-lg font-bold">{{ stats.mysql }}</div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหา Client, ประเภท, หรือ Token..."
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
          
          <!-- Quick Filter Tags -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="quickFilter in quickFilters"
              :key="quickFilter.value"
              @click="applyQuickFilter(quickFilter)"
              class="px-3 py-1 text-xs rounded-full transition-colors duration-200"
              :class="activeQuickFilter === quickFilter.value 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'"
            >
              <i :class="quickFilter.icon" class="mr-1"></i>
              {{ quickFilter.label }}
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
            <option value="source_asc">ประเภท A-Z</option>
            <option value="source_desc">ประเภท Z-A</option>
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
            <h1 class="text-lg font-semibold text-gray-900">Clients</h1>
            <span v-if="selectedItems.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ selectedItems.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mobile Select All -->
            <button
              v-if="filteredClients.length > 0"
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
            <h1 class="hidden lg:block text-xl font-bold text-gray-900 flex-shrink-0">Client Management</h1>
            
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
                  <span class="hidden sm:inline">เลือกทั้งหมด </span>({{ selectedItems.length }}/{{ filteredClients.length }})
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

        <!-- Main Content -->
        <div v-else>
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            <!-- Client Cards -->
            <div v-for="client in filteredClients" :key="client._id" class="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-102 transition-all duration-200 hover:border-blue-300">
              <!-- Card Header with Selection -->
              <div class="flex items-center justify-between p-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(client._id)"
                    @change="toggleSelection(client._id)"
                    class="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                  />
                  <span :class="getStatusClass(client.status) + ' px-1.5 py-0.5 text-xs font-medium rounded-full'">
                    {{ client.status ? 'เปิด' : 'ปิด' }}
                  </span>
                </div>
                <div class="relative">
                  <button
                    @click.stop="toggleCardMenu(client._id)"
                    class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-all duration-200"
                    data-dropdown-toggle
                  >
                    <i class="fas fa-ellipsis-v text-xs"></i>
                  </button>
                  <!-- Enhanced Dropdown Menu -->
                  <div
                    v-if="openCardMenu === client._id"
                    class="dropdown-menu absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    @click.stop
                  >
                    <button
                      @click="editItem('edit', client)"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-all duration-200"
                    >
                      <i class="fas fa-edit w-4"></i>
                      แก้ไข
                    </button>
                    <button
                      @click="toggleClientStatus(client._id, client.status)"
                      class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-3 transition-all duration-200"
                    >
                      <i :class="(client.status ? 'fas fa-toggle-off' : 'fas fa-toggle-on') + ' w-4'"></i>
                      {{ client.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
                    </button>
                    <hr class="border-gray-100">
                    <button
                      @click="showDeleteDialog(client)"
                      class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-all duration-200"
                    >
                      <i class="fas fa-trash w-4"></i>
                      ลบ
                    </button>
                  </div>
                </div>
              </div>

              <!-- Main Card Content -->
              <div class="p-3">
                <!-- Top Section: Icon and Basic Info -->
                <div class="flex items-start gap-3 mb-3">
                  <!-- Database Icon -->
                  <div class="relative flex-shrink-0">
                    <div 
                      class="w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200"
                      :class="{
                        'from-green-500 to-green-600': client.source === 'mongodb',
                        'from-orange-500 to-orange-600': client.source === 'mysql',
                        'from-blue-500 to-blue-600': client.source === 'postgresql',
                        'from-yellow-500 to-yellow-600': client.source === 'firestore',
                        'from-purple-500 to-purple-600': client.source === 'api'
                      }"
                    >
                      <i 
                        class="text-white text-sm group-hover:scale-110 transition-transform duration-200"
                        :class="{
                          'fas fa-leaf': client.source === 'mongodb',
                          'fas fa-database': client.source === 'mysql' || client.source === 'postgresql',
                          'fas fa-fire': client.source === 'firestore',
                          'fas fa-globe': client.source === 'api'
                        }"
                      ></i>
                    </div>
                    <!-- Status indicator dot -->
                    <div 
                      class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                      :class="{
                        'bg-emerald-500': client.status === true,
                        'bg-red-500': client.status === false
                      }"
                    ></div>
                  </div>
                  
                  <!-- Client Name and Source -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold text-gray-900 text-sm capitalize truncate">{{ client.source }}</h3>
                      <!-- Connection Status -->
                      <span 
                        class="px-1.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                        :class="{
                          'bg-emerald-100 text-emerald-700': client.status === true,
                          'bg-red-100 text-red-700': client.status === false
                        }"
                      >
                        {{ client.status ? 'เชื่อมต่อ' : 'ไม่เชื่อมต่อ' }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">แหล่งข้อมูล</p>
                  </div>
                </div>

                <!-- Client ID Section -->
                <div class="text-center mb-3">
                  <h4 class="font-medium text-gray-900 text-sm truncate">{{ client.clientId }}</h4>
                </div>

                <!-- Compact Info Grid -->
                <div class="space-y-1.5">
                  <!-- Token Info -->
                  <div class="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-xs">
                    <span class="text-gray-600 flex items-center gap-1">
                      <i class="fas fa-key text-gray-400"></i>
                      Token
                    </span>
                    <span class="text-gray-700 font-mono text-xs">
                      {{ client.clientToken ? '●●●●●●●●' : 'ไม่มี' }}
                    </span>
                  </div>

                  <!-- Database Info -->
                  <div 
                    v-if="client.connection && client.connection.database" 
                    class="flex items-center justify-between py-1.5 px-2 bg-blue-50 rounded text-xs"
                  >
                    <span class="text-blue-600 flex items-center gap-1">
                      <i class="fas fa-database"></i>
                      Database
                    </span>
                    <span class="text-blue-700 font-medium truncate max-w-24">{{ client.connection.database }}</span>
                  </div>

                  <!-- Host Info -->
                  <div 
                    v-if="client.connection && client.connection.host" 
                    class="flex items-center justify-between py-1.5 px-2 bg-green-50 rounded text-xs"
                  >
                    <span class="text-green-600 flex items-center gap-1">
                      <i class="fas fa-server"></i>
                      Host
                    </span>
                    <span class="text-green-700 font-medium truncate max-w-24">{{ client.connection.host }}</span>
                  </div>

                  <!-- URI Info -->
                  <div 
                    v-if="client.connection && client.connection.URI" 
                    class="flex items-center justify-between py-1.5 px-2 bg-purple-50 rounded text-xs"
                  >
                    <span class="text-purple-600 flex items-center gap-1">
                      <i class="fas fa-link"></i>
                      URI
                    </span>
                    <span class="text-purple-700 font-medium truncate max-w-24">{{ client.connection.URI }}</span>
                  </div>

                  <!-- Bandwidth Info -->
                  <div class="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-xs">
                    <span class="text-gray-600 flex items-center gap-1">
                      <i class="fas fa-chart-line"></i>
                      Bandwidth
                    </span>
                    <span class="text-gray-700 font-mono">
                      <span v-if="client.analytics && client.analytics.read !== null && client.analytics.read !== undefined && client.analytics.write !== null && client.analytics.write !== undefined">
                        R:{{ client.analytics.read }} / W:{{ client.analytics.write }}
                      </span>
                      <span v-else>
                        R:0 / W:0
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Enhanced Card Actions - Compact -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-2 py-1.5">
                <div class="flex justify-center space-x-3">
                  <button 
                    @click="editItem('edit', client)"
                    class="group flex items-center gap-1 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all duration-200 hover:scale-105 px-2 py-1 rounded"
                  >
                    <i class="fas fa-edit text-xs group-hover:scale-110 transition-transform duration-200"></i> 
                    แก้ไข
                  </button>
                  <button 
                    @click="showDeleteDialog(client)"
                    class="group flex items-center gap-1 text-gray-600 hover:text-red-600 text-xs font-medium transition-all duration-200 hover:scale-105 px-2 py-1 rounded"
                  >
                    <i class="fas fa-trash text-xs group-hover:scale-110 transition-transform duration-200"></i> 
                    ลบ
                  </button>
                </div>
              </div>
            </div>

            <!-- Enhanced Add Client Card - Compact -->
            <div 
              @click="openModal('add')"
              class="group bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:scale-102 min-h-[220px]"
            >
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                <i class="fas fa-plus text-sm group-hover:scale-110 transition-transform duration-300"></i>
              </div>
              <span class="text-gray-600 font-medium text-sm group-hover:text-blue-600 transition-colors duration-300 text-center px-2">เพิ่ม Client ใหม่</span>
              <span class="text-gray-500 text-xs mt-1 group-hover:text-blue-500 transition-colors duration-300 text-center px-2">คลิกเพื่อสร้าง</span>
            </div>
          </div>

          <!-- List View -->
          <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        :checked="allSelected"
                        :indeterminate="someSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bandwidth</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="client in filteredClients" :key="client._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        :checked="selectedItems.includes(client._id)"
                        @change="toggleSelection(client._id)"
                        class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 mr-3">
                          <img 
                            v-if="client.source === 'mysql'"
                            src="https://vue-project.sgp1.digitaloceanspaces.com/2023/12/1702563466307.jpg" 
                            class="w-full h-full object-contain"
                            alt="MySQL"
                          />
                          <img 
                            v-else-if="client.source === 'mongodb'"
                            src="https://vue-project.sgp1.digitaloceanspaces.com/2023/12/1702563470917.jpg" 
                            class="w-full h-full object-contain"
                            alt="MongoDB"
                          />
                          <img 
                            v-else-if="client.source === 'postgresql'"
                            src="https://vue-project.sgp1.digitaloceanspaces.com/2023/12/1702563469914.jpg" 
                            class="w-full h-full object-contain"
                            alt="PostgreSQL"
                          />
                          <img 
                            v-else-if="client.source === 'firestore'"
                            src="https://vue-project.sgp1.digitaloceanspaces.com/2023/12/1702563468668.jpg" 
                            class="w-full h-full object-contain"
                            alt="Firestore"
                          />
                          <img 
                            v-else-if="client.source === 'api'"
                            src="https://vue-project.sgp1.digitaloceanspaces.com/2023/12/1702563467701.jpg" 
                            class="w-full h-full object-contain"
                            alt="REST API"
                          />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ client.clientId }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {{ client.source }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {{ client.clientToken ? client.clientToken.substring(0, 16) + '...' : 'ไม่มี Token' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(client.status)">
                        {{ client.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span v-if="client.analytics && client.analytics.read !== null && client.analytics.read !== undefined && client.analytics.write !== null && client.analytics.write !== undefined">
                        R:{{ client.analytics.read }} / W:{{ client.analytics.write }}
                      </span>
                      <span v-else>
                        R:0 / W:0
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="editItem('edit', client)"
                          class="text-blue-600 hover:text-blue-900"
                          title="แก้ไข"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="toggleClientStatus(client._id, client.status)"
                          class="text-yellow-600 hover:text-yellow-900"
                          :title="client.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                        >
                          <i :class="client.status ? 'fas fa-toggle-off' : 'fas fa-toggle-on'"></i>
                        </button>
                        <button
                          @click="showDeleteDialog(client)"
                          class="text-red-600 hover:text-red-900"
                          title="ลบ"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredClients.length === 0" class="text-center py-20">
            <div class="mx-auto max-w-md">
              <i class="fas fa-server text-6xl text-gray-300 mb-4"></i>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มี Client</h3>
              <p class="text-gray-500 mb-6">
                <span v-if="searchTerm || activeQuickFilter || activeFilter !== 'all'">
                  ไม่พบ Client ที่ตรงกับเงื่อนไขการค้นหา
                </span>
                <span v-else>
                  เริ่มต้นด้วยการเพิ่ม Client แรกของคุณ
                </span>
              </p>
              <button
                @click="openModal('add')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i class="fas fa-plus mr-2"></i>
                เพิ่ม Client ใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        :class="showMobileSidebar ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Clients</h2>
            <button
              @click="toggleMobileSidebar"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Mobile Sidebar Content (replicate desktop sidebar content here) -->
          <div class="flex-1 overflow-y-auto">
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
                  placeholder="ค้นหา Client..."
                  class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <!-- Navigation Menu -->
            <div class="px-4 py-4">
              <div class="space-y-1">
                <button
                  v-for="item in sidebarMenuItems"
                  :key="item.value"
                  @click="selectFilter(item.value)"
                  :class="[
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                    activeFilter === item.value 
                      ? 'bg-blue-100 text-blue-700' 
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
    </div>
  </div>

  <!-- Modal for Add/Edit Client -->
  <div
    class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
    v-if="showModal"
  >
    <div class="fixed inset-0 bg-black opacity-50"></div>
    <div class="relative bg-white w-full md:w-1/2 lg:w-1/2 rounded shadow-lg max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="bg-blue-500 text-white p-3 rounded-t">
        <h3 class="text-md font-semibold">
          <i class="fas fa-server mr-2"></i>
          {{ isEditMode ? 'แก้ไข Client' : 'เพิ่ม Client ใหม่' }}
        </h3>
        <button class="absolute top-2 right-3 text-2xl font-semibold hover:text-gray-200"
        @click="closeModal">&times;</button>
      </div>

      <!-- Modal Content -->
      <div class="p-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="mb-4">
            <label for="clientId" class="block text-gray-700 font-bold mb-2">Client Name</label>
            <input
              v-model="clientData.clientId"
              type="text"
              id="clientId"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div class="mb-4">
            <label for="source" class="block text-gray-700 font-bold mb-2">Client Source</label>
            <select v-model="clientData.source" id="source" class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500">
              <option value="mongodb">MongoDB</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="firestore">Firestore</option>
              <option value="api">REST API</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          <div class="col-span-2 mb-4">
            <label for="clientToken" class="block text-gray-700 font-bold mb-2">Client Token</label>
            <div class="flex gap-2">
              <input
                v-model="clientData.clientToken"
                type="text"
                class="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                readonly
              />
              <button
                @click="revokeToken"
                :class="clientData.clientToken ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
                class="px-4 py-2 text-white rounded transition-colors duration-200"
              >
                {{ clientData.clientToken ? 'Revoke' : 'Generate' }}
              </button>
            </div>
          </div>
        </div>

        <!-- MongoDB Configuration -->
        <div class="grid grid-cols-2 gap-4" v-if="clientData.source === 'mongodb'">
          <div class="col-span-2 mb-4">
            <label for="URI" class="block text-gray-700 font-bold mb-2">MongoDB URI</label>
            <input
              v-model="clientData.connection.URI"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="mongodb://localhost:27017"
            />
          </div>
          <div class="mb-4">
            <label for="database" class="block text-gray-700 font-bold mb-2">MongoDB Database</label>
            <input
              v-model="clientData.connection.database"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="database_name"
            />
          </div>
        </div>

        <!-- MySQL Configuration -->
        <div class="grid grid-cols-2 gap-4" v-if="clientData.source === 'mysql'">
          <div class="mb-4">
            <label for="host" class="block text-gray-700 font-bold mb-2">MySQL Host</label>
            <input
              v-model="clientData.connection.host"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="localhost"
            />
          </div>
          <div class="mb-4">
            <label for="port" class="block text-gray-700 font-bold mb-2">MySQL Port</label>
            <input
              v-model="clientData.connection.port"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="3306"
            />
          </div>
          <div class="mb-4">
            <label for="user" class="block text-gray-700 font-bold mb-2">MySQL User</label>
            <input
              v-model="clientData.connection.user"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="username"
            />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-gray-700 font-bold mb-2">MySQL Password</label>
            <input
              v-model="clientData.connection.password"
              type="password"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="password"
            />
          </div>
          <div class="col-span-2 mb-4">
            <label for="database_mysql" class="block text-gray-700 font-bold mb-2">MySQL Database</label>
            <input
              v-model="clientData.connection.database"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              placeholder="database_name"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="clientData.status"
              class="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span class="ml-2 text-gray-700 font-bold">ใช้งาน</span>
          </label>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-100 px-4 py-3 flex justify-end rounded-b gap-2">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
          @click="closeModal"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          @click="submitForm"
          class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <i class="fas fa-save"></i>
          {{ isEditMode ? 'อัพเดตข้อมูล' : 'เพิ่มข้อมูล' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Delete confirmation dialog -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded shadow-lg w-96">
      <!-- Modal Header -->
      <div class="bg-red-500 text-white p-3 rounded-t">
        <h3 class="text-base flex items-center gap-2">
          <i class="fas fa-trash"></i>
          ยืนยันการลบข้อมูล
        </h3>
      </div>
      <!-- Modal Content -->
      <div class="p-4">
        <p class="text-red-600 text-center">
          คุณต้องการลบข้อมูล <strong>"{{ spaceToDelete?.clientId || spaceToDelete?.name }}"</strong> หรือไม่?<br>
          <span class="text-sm text-gray-500">หลังจากลบแล้ว ไม่สามารถกู้คืนได้</span>
        </p>
      </div>
      <!-- Modal Footer -->
      <div class="bg-gray-100 py-3 px-4 flex justify-end rounded-b gap-2">
        <button
          @click="cancelDelete"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
        >
          ยกเลิก
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors duration-200"
        >
          ลบเลย
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Client container with full height */
.client-container {
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
}

.content-card .relative {
  position: relative;
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

/* Fix any overflow issues */
.client-container {
  overflow: visible;
}

/* Client card animations */
.content-card {
  transition: all 0.2s ease-in-out;
  position: relative;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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

/* Mobile sidebar animation */
.mobile-sidebar-enter {
  transform: translateX(-100%);
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-to {
  transform: translateX(0);
}

.mobile-sidebar-leave {
  transform: translateX(0);
}

.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in;
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
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

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Add Content Card specific styles */
.add-content-card {
  transition: all 0.2s ease-in-out;
}

.add-content-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
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

/* Header layout improvements */
.header-select-all {
  min-width: 16px;
  min-height: 16px;
  position: relative;
  z-index: 10;
}

/* Ensure checkbox and label don't overlap */
.header-select-all + label {
  margin-left: 8px;
  position: relative;
  z-index: 1;
}

/* Fix any z-index conflicts */
.header-select-all:focus {
  z-index: 20;
}

/* Prevent text selection on labels */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Responsive text truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Flex utilities */
.flex-shrink-0 {
  flex-shrink: 0;
}

.min-w-0 {
  min-width: 0;
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .dark-mode .bg-white {
    background-color: #374151;
  }
  
  .dark-mode .border-gray-200 {
    border-color: #4b5563;
  }
  
  .dark-mode .text-gray-900 {
    color: #f9fafb;
  }
  
  .dark-mode .text-gray-700 {
    color: #d1d5db;
  }
  
  .dark-mode .text-gray-600 {
    color: #9ca3af;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
  }
  
  .bg-gray-50 {
    background-color: #fff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
</style>
<script>
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';

export default {
  inject: ['apiServerName','saltSecret'],
  data() {
    return {
      accessToken: storageManager.get('session','token'),
      listItems: [],
      loading_sources: true,
      hostkey: this.$Key,
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
        totalRevenue: 0,
        popularPackages: 0,
        recentlyCreated: 0
      },
      showMobileSidebar: false,
      selectedPackage: null,
      sidebarMenuItems: [
        { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-gift', count: 0 },
        { value: 'active', label: 'เปิดใช้งาน', icon: 'fas fa-check-circle', count: 0 },
        { value: 'inactive', label: 'ปิดใช้งาน', icon: 'fas fa-times-circle', count: 0 },
        { value: 'popular', label: 'ยอดนิยม', icon: 'fas fa-star', count: 0 },
        { value: 'recent', label: 'สร้างล่าสุด', icon: 'fas fa-clock', count: 0 }
      ],
      activeFilter: 'all',
      activeQuickFilter: null,
      quickFilters: [
        { value: 'premium', label: 'Premium', icon: 'fas fa-crown' },
        { value: 'basic', label: 'Basic', icon: 'fas fa-cube' },
        { value: 'enterprise', label: 'Enterprise', icon: 'fas fa-building' },
        { value: 'monthly', label: 'รายเดือน', icon: 'fas fa-calendar' },
        { value: 'yearly', label: 'รายปี', icon: 'fas fa-calendar-alt' }
      ]
    }
  },
  computed: {
    filteredPackages() {
      let filtered = this.listItems;

      // Apply quick filters first
      if (this.activeQuickFilter) {
        switch (this.activeQuickFilter) {
          case 'premium':
            filtered = filtered.filter(item => item.type === 'premium');
            break;
          case 'basic':
            filtered = filtered.filter(item => item.type === 'basic');
            break;
          case 'enterprise':
            filtered = filtered.filter(item => item.type === 'enterprise');
            break;
          case 'monthly':
            filtered = filtered.filter(item => item.pricing && 
              item.pricing.billingCycles && 
              item.pricing.billingCycles.some(cycle => cycle.type === 'monthly'));
            break;
          case 'yearly':
            filtered = filtered.filter(item => item.pricing && 
              item.pricing.billingCycles && 
              item.pricing.billingCycles.some(cycle => cycle.type === 'yearly'));
            break;
        }
      }

      // Filter by status
      if (this.activeFilter !== 'all') {
        if (this.activeFilter === 'recent') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(item => {
            if (!item.createdAt) return false;
            return new Date(item.createdAt) >= weekAgo;
          });
        } else {
          filtered = filtered.filter(item => {
            switch (this.activeFilter) {
              case 'active':
                return item.status === true;
              case 'inactive':
                return item.status === false;
              case 'popular':
                return item.popular === true;
              default:
                return true;
            }
          });
        }
      }

      // Filter by search term
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          (item.name && item.name.toLowerCase().includes(search)) ||
          (item.description && item.description.toLowerCase().includes(search)) ||
          (item.type && item.type.toLowerCase().includes(search))
        );
      }

      // Sort packages
      return this.sortPackages(filtered);
    },

    // Computed properties for select all checkbox states
    allSelected() {
      return this.selectedItems.length === this.filteredPackages.length && this.filteredPackages.length > 0;
    },

    someSelected() {
      return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredPackages.length;
    },

    // Stats for selected packages
    selectedPackageStats() {
      const selectedPackages = this.listItems.filter(item => 
        this.selectedItems.includes(item._id)
      );
      
      return {
        activeCount: selectedPackages.filter(item => item.status === true).length,
        popularCount: selectedPackages.filter(item => item.popular === true).length,
        totalRevenue: selectedPackages.reduce((sum, item) => 
          sum + this.getDefaultPrice(item), 0
        )
      };
    },

    // Helper computed property for checkbox states
    checkboxStates() {
      const states = {};
      this.filteredPackages.forEach(pkg => {
        states[pkg._id] = this.selectedItems.includes(pkg._id);
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
    
    // Watch for changes in filteredPackages to update selection
    filteredPackages: {
      handler(newPackages) {
        // If filtered packages change, remove selected items that are no longer visible
        if (this.selectedItems.length > 0) {
          const visibleIds = newPackages.map(item => item._id);
          this.selectedItems = this.selectedItems.filter(id => visibleIds.includes(id));
          this.bulkActions = this.selectedItems.length > 0;
        }
      },
      deep: true
    }
  },
  methods: {
    async getData() {
      if (!storageManager.get('session', 'login')) {
        return;
      }

      try {
        this.loading_sources = false;
        this.error = null;

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/package/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.hostkey },
          body: JSON.stringify({
            method: 'find',
            args: [{}]
          })
        });

        const RestReturn = await resAPI.json();
        console.log(RestReturn);

        // If no data from API, use mock data for testing
        if (!RestReturn || RestReturn.length === 0) {
          this.listItems = [
            {
              _id: '1',
              name: 'Basic Package',
              description: 'แพ็กเกจพื้นฐานสำหรับผู้ใช้งานทั่วไป',
              price: 299,
              status: true,
              popular: false,
              type: 'basic',
              createdAt: new Date().toISOString(),
              limits: { maxUsers: 5, storageGB: 10 }
            },
            {
              _id: '2',
              name: 'Premium Package',
              description: 'แพ็กเกจพรีเมียมสำหรับธุรกิจขนาดกลาง',
              price: 799,
              status: true,
              popular: true,
              type: 'premium',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              limits: { maxUsers: 20, storageGB: 50 }
            },
            {
              _id: '3',
              name: 'Enterprise Package',
              description: 'แพ็กเกจองค์กรสำหรับบริษัทขนาดใหญ่',
              price: 1999,
              status: false,
              popular: true,
              type: 'enterprise',
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              limits: { maxUsers: 100, storageGB: 200 }
            }
          ];
        } else {
          this.listItems = RestReturn;
        }
        
        this.loading_sources = true;
        this.calculateStats();

      } catch (error) {
        console.error('Error loading packages:', error);
        this.error = 'ไม่สามารถโหลดข้อมูล Package ได้';
        this.loading_sources = true;
        
        // Use mock data on error
        this.listItems = [
          {
            _id: '1',
            name: 'Basic Package',
            description: 'แพ็กเกจพื้นฐานสำหรับผู้ใช้งานทั่วไป',
            price: 299,
            status: true,
            popular: false,
            type: 'basic',
            createdAt: new Date().toISOString(),
            limits: { maxUsers: 5, storageGB: 10 }
          },
          {
            _id: '2',
            name: 'Premium Package',
            description: 'แพ็กเกจพรีเมียมสำหรับธุรกิจขนาดกลาง',
            price: 799,
            status: true,
            popular: true,
            type: 'premium',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            limits: { maxUsers: 20, storageGB: 50 }
          }
        ];
        this.calculateStats();
      }
    },

    async refreshData() {
      if (this.isRefreshing) return;
      
      try {
        this.isRefreshing = true;
        await this.getData();
      } catch (error) {
        console.error('Error refreshing packages:', error);
        this.error = 'ไม่สามารถรีเฟรชข้อมูลได้';
      } finally {
        this.isRefreshing = false;
      }
    },

    async deleteData(id) {
      if (!storageManager.get('session', 'login')) {
        return;
      }

      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Package นี้?')) {
        return;
      }

      try {
        this.loading_sources = false;
        
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/package/" + id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.hostkey },
        });
        
        if (resAPI.ok) {
          await this.getData();
        } else {
          throw new Error('Failed to delete package');
        }

      } catch (error) {
        console.error('Error deleting package:', error);
        this.error = 'ไม่สามารถลบ Package ได้';
        this.loading_sources = true;
      }
    },

    // เพิ่ม method สำหรับการจัดการ error
    dismissError() {
      this.error = null;
    },

    // Toggle card menu
    toggleCardMenu(packageId) {
      this.openCardMenu = this.openCardMenu === packageId ? null : packageId;
    },

    closeCardMenu() {
      this.openCardMenu = null;
    },

    // Handle click outside
    handleClickOutside(event) {
      if (this.openCardMenu && !event.target.closest('.dropdown-menu')) {
        this.closeCardMenu();
      }
    },

    // Toggle select all
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedItems = this.filteredPackages.map(item => item._id);
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
          const shouldBeIndeterminate = this.someSelected && !this.allSelected;
          checkbox.indeterminate = shouldBeIndeterminate;
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log('Checkbox state update:', {
              selectedCount: this.selectedItems.length,
              totalVisible: this.filteredPackages.length,
              allSelected: this.allSelected,
              someSelected: this.someSelected,
              indeterminate: shouldBeIndeterminate
            });
          }
        }
      });
    },

    // Toggle select all visible items
    toggleSelectAllVisible() {
      if (this.allSelected) {
        this.selectedItems = [];
        this.bulkActions = false;
      } else {
        this.selectedItems = this.filteredPackages.map(item => item._id);
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
    toggleSelection(packageId) {
      const index = this.selectedItems.indexOf(packageId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(packageId);
      }
      this.bulkActions = this.selectedItems.length > 0;
      
      // Force update indeterminate state
      this.$nextTick(() => {
        this.updateHeaderCheckboxStates();
      });
    },

    // Bulk delete
    async bulkDelete() {
      if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ Package ${this.selectedItems.length} รายการ?`)) {
        return;
      }

      try {
        this.loading_sources = false;
        
        for (const id of this.selectedItems) {
          await this.deleteData(id);
        }
        
        this.selectedItems = [];
        this.bulkActions = false;
        await this.getData();

      } catch (error) {
        console.error('Error bulk deleting packages:', error);
        this.error = 'ไม่สามารถลบ Packages ได้';
        this.loading_sources = true;
      }
    },

    // Calculate stats
    calculateStats() {
      const active = this.listItems.filter(item => item.status === true).length;
      const inactive = this.listItems.filter(item => item.status === false).length;
      
      // Calculate recently created (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyCreated = this.listItems.filter(item => {
        if (!item.createdAt) return false;
        return new Date(item.createdAt) >= weekAgo;
      }).length;

      // Calculate popular packages
      const popularPackages = this.listItems.filter(item => item.popular === true).length;
      
      this.stats = {
        total: this.listItems.length,
        active: active,
        inactive: inactive,
        totalRevenue: 0, // This would need to be calculated from orders
        popularPackages: popularPackages,
        recentlyCreated: recentlyCreated
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
          case 'popular':
            item.count = this.stats.popularPackages;
            break;
          case 'recent':
            item.count = this.stats.recentlyCreated;
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
      this.filterPackages();
      this.selectedPackage = null;
      if (this.showMobileSidebar) {
        this.toggleMobileSidebar(); // Close mobile sidebar after selection
      }
    },

    filterPackages() {
      // This method can be used to filter packages based on activeFilter
      // For now, we'll handle filtering in computed property
    },

    sortPackages(packages) {
      return packages.sort((a, b) => {
        switch(this.sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'price_asc':
            return this.getDefaultPrice(a) - this.getDefaultPrice(b);
          case 'price_desc':
            return this.getDefaultPrice(b) - this.getDefaultPrice(a);
          case 'created_desc':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'created_asc':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          default:
            return 0;
        }
      });
    },

    selectPackage(packageItem) {
      // Navigate to package detail page
      this.$router.push(`/origin/package/detail/${packageItem._id}`);
    },

    closePackageDetail() {
      this.selectedPackage = null;
    },

    // Quick filter methods
    applyQuickFilter(filter) {
      if (this.activeQuickFilter === filter.value) {
        this.activeQuickFilter = null;
      } else {
        this.activeQuickFilter = filter.value;
      }
    },
    // Format date helper
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    // Get relative time
    getRelativeTime(dateString) {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'วันนี้';
      if (diffDays === 1) return 'เมื่อวาน';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
      return this.formatDate(dateString);
    },

    async togglePackageStatus(packageId, currentStatus) {
      try {
        if (!confirm(`คุณต้องการ${currentStatus ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} Package นี้หรือไม่?`)) {
          return;
        }

        this.loading_sources = false;

        const response = await fetch(`https://gateway.cloudrestfulapi.com/api/package/${packageId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.hostkey
          },
          body: JSON.stringify({
            data: {
              status: !currentStatus
            }
          })
        });

        if (response.ok) {
          await this.getData(); // Refresh the data
        } else {
          throw new Error('Failed to update package status');
        }

      } catch (error) {
        console.error('Error toggling package status:', error);
        this.loading_sources = true;
      }
    },
    getStatusClass(status) {
      return status 
        ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
        : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH').format(price);
    },
    getDefaultPrice(packageItem) {
      // Get default pricing cycle or first available cycle
      if (packageItem.pricing && packageItem.pricing.billingCycles) {
        const defaultCycle = packageItem.pricing.defaultCycle || 'monthly';
        const cycle = packageItem.pricing.billingCycles.find(c => c.type === defaultCycle) || 
                     packageItem.pricing.billingCycles[0];
        return cycle ? cycle.price : packageItem.pricing.basePrice || 0;
      }
      // Fallback for old structure
      return packageItem.price || 0;
    },
    getDefaultDuration(packageItem) {
      // Get default duration or first available cycle duration
      if (packageItem.pricing && packageItem.pricing.billingCycles) {
        const defaultCycle = packageItem.pricing.defaultCycle || 'monthly';
        const cycle = packageItem.pricing.billingCycles.find(c => c.type === defaultCycle) || 
                     packageItem.pricing.billingCycles[0];
        return cycle ? cycle.duration : 30;
      }
      // Fallback for old structure
      return packageItem.duration || 30;
    },
    getPricingLabel(packageItem) {
      // Get pricing label for display
      if (packageItem.pricing && packageItem.pricing.billingCycles) {
        const defaultCycle = packageItem.pricing.defaultCycle || 'monthly';
        const cycle = packageItem.pricing.billingCycles.find(c => c.type === defaultCycle) || 
                     packageItem.pricing.billingCycles[0];
        return cycle ? cycle.label : 'รายเดือน';
      }
      return 'รายเดือน';
    },
    openPackageManagement() {
      this.$router.push('/origin/package/management');
    },
    
    async clonePackage(packageId) {
      try {
        // Find the package to clone
        const packageToClone = this.listItems.find(pkg => pkg._id === packageId);
        if (!packageToClone) {
          this.error = 'ไม่พบ Package ที่ต้องการโคลน';
          return;
        }

        this.loading_sources = false;
        
        // Create a new package object based on the original
        const clonedPackageData = {
          ...packageToClone,
          name: `${packageToClone.name} (Copy)`,
          _id: undefined, // Remove ID to create new record
          createdAt: undefined,
          updatedAt: undefined
        };

        // Send request to create new package
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/package", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'client-token-key': this.hostkey 
          },
          body: JSON.stringify({
            data: clonedPackageData
          })
        });

        if (response.ok) {
          const newPackage = await response.json();
          // Refresh the data to show the new cloned package
          await this.getData();
          
          // Close the card menu
          this.closeCardMenu();
          
          // Navigate to the new cloned package detail page
          setTimeout(() => {
            this.$router.push(`/origin/package/detail/${newPackage._id}`);
          }, 500);
        } else {
          throw new Error('Failed to clone package');
        }
      } catch (error) {
        console.error('Clone error:', error);
        this.error = 'เกิดข้อผิดพลาดในการโคลน Package';
        this.loading_sources = true;
      }
    },
  },
  async mounted() {
    try {
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
    // Handle indeterminate state for checkboxes and replace feather icons
    this.$nextTick(() => {
      // ค้นหา header checkbox โดยเจาะจงมากขึ้น
      const headerCheckboxes = this.$el.querySelectorAll('.header-select-all, input[type="checkbox"][data-select-all]');
      headerCheckboxes.forEach(checkbox => {
        if (checkbox) {
          checkbox.indeterminate = this.someSelected && !this.allSelected;
        }
      });
      
      // Replace feather icons
      feather.replace();
    });
  },
  setup() {
    //console.log("Setup");
  },
};
</script>

<template>
  <div class="bg-gray-50 flex package-container h-full">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Packages</h2>
          <router-link
            to="/origin/package/add"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="เพิ่ม Package"
          >
            <i class="fas fa-plus"></i>
          </router-link>
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
              <div class="text-purple-600 text-xs font-medium">ยอดนิยม</div>
              <div class="text-purple-900 text-lg font-bold">{{ stats.popularPackages }}</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div class="text-orange-600 text-xs font-medium">ล่าสุด</div>
              <div class="text-orange-900 text-lg font-bold">{{ stats.recentlyCreated }}</div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหา Package, ประเภท, หรือคำอธิบาย..."
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
            <option value="price_asc">ราคา น้อย-มาก</option>
            <option value="price_desc">ราคา มาก-น้อย</option>
            <option value="created_desc">วันที่ ใหม่-เก่า</option>
            <option value="created_asc">วันที่ เก่า-ใหม่</option>
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
            <h1 class="text-lg font-semibold text-gray-900">Packages</h1>
            <span v-if="selectedItems.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ selectedItems.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mobile Select All -->
            <button
              v-if="filteredPackages.length > 0"
              @click="toggleSelectAllVisible"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'"
            >
              <i :class="['fas', allSelected ? 'fa-check-double' : someSelected ? 'fa-minus' : 'fa-check']"></i>
            </button>
            <router-link
              to="/origin/package/add"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i class="fas fa-plus"></i>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full gap-4">
          <div class="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            <h1 class="hidden lg:block text-xl font-bold text-gray-900 flex-shrink-0">Package Management</h1>
            
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
                  <span class="hidden sm:inline">เลือกทั้งหมด </span>({{ selectedItems.length }}/{{ filteredPackages.length }})
                </label>
              </div>
              <span v-if="selectedItems.length > 0" class="text-xs text-blue-600 font-medium whitespace-nowrap hidden md:inline">
                • ฿{{ selectedPackageStats.totalRevenue.toLocaleString() }}
              </span>
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

        <!-- Bulk Actions Bar -->
        <div v-if="bulkActions && selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <!-- Selection Info -->
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <div class="flex items-center gap-3">
                <span class="text-blue-800 font-medium">เลือกแล้ว {{ selectedItems.length }} รายการ</span>
                <span class="text-blue-600 text-sm">จาก {{ filteredPackages.length }} รายการ</span>
              </div>
              <!-- Quick Stats for Selected Items -->
              <div class="flex items-center gap-4 text-sm text-blue-700">
                <span>• {{ selectedPackageStats.activeCount }} เปิดใช้งาน</span>
                <span>• {{ selectedPackageStats.popularCount }} ยอดนิยม</span>
                <span>• ฿{{ selectedPackageStats.totalRevenue.toLocaleString() }} รวม</span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Select All/None Toggle -->
              <button
                @click="toggleSelectAllVisible"
                class="px-3 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-check-double mr-1"></i>
                {{ allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด' }}
              </button>
              
              <!-- Bulk Delete Button -->
              <button
                @click="bulkDelete"
                class="px-3 py-2 text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-trash mr-1"></i>
                ลบ
              </button>
              
              <!-- Cancel Button -->
              <button
                @click="clearSelection"
                class="px-3 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-times mr-1"></i>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        <!-- Packages Content -->
        <div v-if="loading_sources">
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <!-- Package Cards -->
            <div
              v-for="packageItem in filteredPackages"
              :key="packageItem._id"
              @click="selectPackage(packageItem)"
              class="relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 cursor-pointer content-card group border border-gray-200"
              :class="selectedItems.includes(packageItem._id) ? 'ring-2 ring-blue-500' : ''"
            >
              <!-- Selection Checkbox -->
              <div class="absolute top-2 left-2 z-10" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(packageItem._id)"
                  @change="toggleSelection(packageItem._id)"
                  @click.stop
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <!-- Card Menu -->
              <div class="absolute top-2 right-2 z-20" @click.stop>
                <button
                  @click.stop.prevent="toggleCardMenu(packageItem._id)"
                  class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200 relative z-20"
                >
                  <i class="fas fa-ellipsis-v text-gray-600"></i>
                </button>
                <!-- Dropdown Menu -->
                <div
                  v-if="openCardMenu === packageItem._id"
                  class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 dropdown-menu z-50"
                >
                  <router-link
                    :to="`/origin/package/detail/${packageItem._id}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <i class="fas fa-eye mr-2"></i>
                    ดูรายละเอียด
                  </router-link>
                  <router-link
                    :to="`/origin/package/edit/${packageItem._id}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    แก้ไข
                  </router-link>
                  <button
                    @click="clonePackage(packageItem._id)"
                    class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <i class="fas fa-copy mr-2"></i>
                    โคลนข้อมูล
                  </button>
                  <div class="border-t border-gray-200 my-1"></div>
                  <button
                    @click="deleteData(packageItem._id)"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <i class="fas fa-trash mr-2"></i>
                    ลบ
                  </button>
                </div>
              </div>

              <!-- Package Header -->
              <div class="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                <!-- Background pattern -->
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div class="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                
                <div class="text-center text-white relative z-10">
                  <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <i class="fas fa-gift text-lg"></i>
                  </div>
                  <h3 class="text-sm font-bold">{{ packageItem.name }}</h3>
                </div>

                <!-- Status Badge -->
                <div class="absolute top-2 left-2">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    packageItem.status 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  ]">
                    {{ packageItem.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </div>

                <!-- Price Badge -->
                <div class="absolute top-2 right-2">
                  <div class="bg-white/90 text-gray-800 px-2 py-1 rounded-lg text-xs font-bold">
                    {{ formatPrice(getDefaultPrice(packageItem)) }}฿
                  </div>
                </div>
              </div>

              <!-- Package Content -->
              <div class="p-4">
                <!-- Description -->
                <p class="text-gray-600 text-xs mb-3 line-clamp-2">{{ packageItem.description || 'ไม่มีคำอธิบาย' }}</p>

                <!-- Quick Info -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-gray-50 rounded p-2">
                    <div class="text-gray-500 text-xs">Users</div>
                    <div class="text-gray-900 text-sm font-semibold">{{ packageItem.limits?.maxUsers || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded p-2">
                    <div class="text-gray-500 text-xs">Storage</div>
                    <div class="text-gray-900 text-sm font-semibold">{{ packageItem.limits?.storageGB || 'N/A' }}GB</div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-100" @click.stop>
                  <button
                    @click.stop="togglePackageStatus(packageItem._id, packageItem.status)"
                    :class="[
                      'text-xs px-3 py-1 rounded-full font-medium transition-colors',
                      packageItem.status 
                        ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    ]"
                  >
                    {{ packageItem.status ? 'ปิด' : 'เปิด' }}
                  </button>
                  
                  <div class="flex gap-1">
                    <router-link
                      :to="`/origin/package/detail/${packageItem._id}`"
                      @click.stop
                      class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye text-xs"></i>
                    </router-link>
                    <router-link
                      :to="`/origin/package/edit/${packageItem._id}`"
                      @click.stop
                      class="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Package Card -->
            <router-link
              to="/origin/package/add"
              class="relative bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer add-content-card group flex items-center justify-center min-h-[280px]"
            >
              <div class="text-center">
                <i class="fas fa-plus text-gray-400 text-4xl mb-3 group-hover:text-gray-500 transition-colors duration-200"></i>
                <h3 class="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-200">เพิ่ม Package ใหม่</h3>
              </div>
            </router-link>
          </div>

          <!-- List View -->
          <div v-else class="space-y-3">
            <!-- Package List Items -->
            <div
              v-for="packageItem in filteredPackages"
              :key="packageItem._id"
              @click="selectPackage(packageItem)"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="selectedItems.includes(packageItem._id) ? 'ring-2 ring-blue-500' : ''"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Selection Checkbox -->
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(packageItem._id)"
                    @change="toggleSelection(packageItem._id)"
                    @click.stop
                    class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  <!-- Package Info -->
                  <div class="flex-1" @click.stop="selectPackage(packageItem)">
                    <div class="flex items-center gap-3">
                      <h3 class="font-medium text-gray-900 cursor-pointer">{{ packageItem.name }}</h3>
                      <span :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        packageItem.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]">
                        {{ packageItem.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1 cursor-pointer">{{ packageItem.description || 'ไม่มีคำอธิบาย' }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>ราคา: {{ formatPrice(getDefaultPrice(packageItem)) }}฿</span>
                      <span>Users: {{ packageItem.limits?.maxUsers || 'N/A' }}</span>
                      <span>Storage: {{ packageItem.limits?.storageGB || 'N/A' }}GB</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2" @click.stop>
                  <button
                    @click.stop="togglePackageStatus(packageItem._id, packageItem.status)"
                    :class="[
                      'text-xs px-3 py-1 rounded-full font-medium transition-colors',
                      packageItem.status 
                        ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    ]"
                  >
                    {{ packageItem.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
                  </button>
                  
                  <router-link
                    :to="`/origin/package/detail/${packageItem._id}`"
                    @click.stop
                    class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="ดูรายละเอียด"
                  >
                    <i class="fas fa-eye"></i>
                  </router-link>
                  
                  <router-link
                    :to="`/origin/package/edit/${packageItem._id}`"
                    @click.stop
                    class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="แก้ไข"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  
                  <button
                    @click.stop="clonePackage(packageItem._id)"
                    class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="โคลนข้อมูล"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  
                  <button
                    @click.stop="deleteData(packageItem._id)"
                    class="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="ลบ"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
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
        @click.stop
        class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300"
        :class="showMobileSidebar ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- Mobile Sidebar Content (Same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 h-[65px]">
            <h2 class="text-lg font-semibold text-gray-900">Packages</h2>
            <button @click="toggleMobileSidebar" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Mobile Sidebar Content (same structure as desktop) -->
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
                <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div class="text-purple-600 text-xs font-medium">ยอดนิยม</div>
                  <div class="text-purple-900 text-lg font-bold">{{ stats.popularPackages }}</div>
                </div>
                <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <div class="text-orange-600 text-xs font-medium">ล่าสุด</div>
                  <div class="text-orange-900 text-lg font-bold">{{ stats.recentlyCreated }}</div>
                </div>
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
</template>

<style scoped>
/* Package container with full height */
.package-container {
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

/* Package card animations */
.content-card {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
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

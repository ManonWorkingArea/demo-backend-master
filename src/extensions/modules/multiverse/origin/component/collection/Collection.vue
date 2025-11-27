<script>

// Component
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import CollectionService from './module/function/CollectionService.js';

export default {
    inject: ['apiServerName','saltSecret'],
    data() {
      return {
        accessToken: storageManager.get('session','token'),
        listItems: [],
        loading_sources: true,
        hostkey: this.$Key,
        collectionService: null,
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
          empty: 0,
          incomplete: 0,
          totalAssets: 0,
          totalPackages: 0,
          recentlyCreated: 0
        },
        showMobileSidebar: false,
        selectedCollection: null,
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-folder', count: 0 },
          { value: 'active', label: 'ใช้งานได้', icon: 'fas fa-check-circle', count: 0 },
          { value: 'empty', label: 'ว่างเปล่า', icon: 'fas fa-exclamation-triangle', count: 0 },
          { value: 'incomplete', label: 'ไม่สมบูรณ์', icon: 'fas fa-times-circle', count: 0 },
          { value: 'recent', label: 'สร้างล่าสุด', icon: 'fas fa-clock', count: 0 }
        ],
        activeFilter: 'all',
        activeQuickFilter: null,
        quickFilters: [
          { value: 'hasPackage', label: 'มี Package', icon: 'fas fa-gift' },
          { value: 'noPackage', label: 'ไม่มี Package', icon: 'fas fa-ban' },
          { value: 'hasAssets', label: 'มี Assets', icon: 'fas fa-file' },
          { value: 'noAssets', label: 'ไม่มี Assets', icon: 'fas fa-folder-open' },
          { value: 'multiPlugin', label: 'หลาย Plugins', icon: 'fas fa-cubes' }
        ],
        showBulkStatusMenu: false
      }
    },
    components: {
    },
    computed: {
      filteredCollections() {
        let filtered = this.listItems;

        // Apply quick filters first
        if (this.activeQuickFilter) {
          switch (this.activeQuickFilter) {
            case 'hasPackage':
              filtered = filtered.filter(item => item.package && item.packageId);
              break;
            case 'noPackage':
              filtered = filtered.filter(item => !item.package || !item.packageId);
              break;
            case 'hasAssets':
              filtered = filtered.filter(item => (item.assetsCount || 0) > 0);
              break;
            case 'noAssets':
              filtered = filtered.filter(item => (item.assetsCount || 0) === 0);
              break;
            case 'multiPlugin':
              filtered = filtered.filter(item => item.plugins && item.plugins.length > 3);
              break;
          }
        }

        // Filter by status
        if (this.activeFilter !== 'all') {
          if (this.activeFilter === 'recent') {
            // Show collections created in the last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(item => {
              if (!item.createdAt) return false;
              return new Date(item.createdAt) >= weekAgo;
            });
          } else {
            filtered = filtered.filter(item => this.getCollectionStatus(item) === this.activeFilter);
          }
        }

        // Filter by search term
        if (this.searchTerm) {
          const search = this.searchTerm.toLowerCase();
          filtered = filtered.filter(item => 
            (item.siteName && item.siteName.toLowerCase().includes(search)) ||
            (item.hostname && item.hostname.toLowerCase().includes(search)) ||
            (item.siteType && item.siteType.toLowerCase().includes(search)) ||
            (item.package && item.package.name && item.package.name.toLowerCase().includes(search)) ||
            (item.key && item.key.toLowerCase().includes(search)) ||
            (item.plugins && item.plugins.some(plugin => plugin.toLowerCase().includes(search)))
          );
        }

        // Sort collections
        return this.sortCollections(filtered);
      },

      // Computed properties for select all checkbox states
      allSelected() {
        return this.selectedItems.length === this.filteredCollections.length && this.filteredCollections.length > 0;
      },

      someSelected() {
        return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredCollections.length;
      },

      // Stats for selected collections
      selectedCollectionStats() {
        const selectedCollections = this.listItems.filter(item => 
          this.selectedItems.includes(item._id)
        );
        
        return {
          activeCount: selectedCollections.filter(item => 
            this.getCollectionStatus(item) === 'active'
          ).length,
          totalAssets: selectedCollections.reduce((sum, item) => 
            sum + (item.assetsCount || 0), 0
          ),
          withPackage: selectedCollections.filter(item => 
            item.package && item.packageId
          ).length
        };
      },

      // Helper computed property for checkbox states
      checkboxStates() {
        const states = {};
        this.filteredCollections.forEach(collection => {
          states[collection._id] = this.selectedItems.includes(collection._id);
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
      
      // Watch for changes in filteredCollections to update selection
      filteredCollections: {
        handler(newCollections) {
          // If filtered collections change, remove selected items that are no longer visible
          if (this.selectedItems.length > 0) {
            const visibleIds = newCollections.map(item => item._id);
            this.selectedItems = this.selectedItems.filter(id => visibleIds.includes(id));
            this.bulkActions = this.selectedItems.length > 0;
          }
        },
        deep: true
      }
    },
    methods: {
      async getData() {
        if (!storageManager.get('session','login')) {
          return;
        }

        try {
          this.loading_sources = false;
          this.error = null;

          // ใช้ CollectionService แทนการเรียก API โดยตรง
          const collections = await this.collectionService.getCollectionsWithAssets();
          
          this.listItems = collections;
          this.loading_sources = true;
          this.calculateStats();

        } catch (error) {
          console.error('Error loading collections:', error);
          this.error = 'ไม่สามารถโหลดข้อมูล Collection ได้';
          this.loading_sources = true;
        }
      },

      async refreshData() {
        if (this.isRefreshing) return;
        
        try {
          this.isRefreshing = true;
          const collections = await this.collectionService.refreshData();
          this.listItems = collections;
        } catch (error) {
          console.error('Error refreshing collections:', error);
          this.error = 'ไม่สามารถรีเฟรชข้อมูลได้';
        } finally {
          this.isRefreshing = false;
        }
      },

      async deleteData(id) {
        if (!storageManager.get('session','login')) {
          return;
        }

        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Collection นี้?')) {
          return;
        }

        try {
          this.loading_sources = false;
          
          await this.collectionService.deleteCollection(id);
          
          // โหลดข้อมูลใหม่หลังจากลบ
          await this.getData();

        } catch (error) {
          console.error('Error deleting collection:', error);
          this.error = 'ไม่สามารถลบ Collection ได้';
          this.loading_sources = true;
        }
      },

      // เพิ่ม method สำหรับการจัดการ error
      dismissError() {
        this.error = null;
      },

      // Toggle card menu
      toggleCardMenu(collectionId) {
        this.openCardMenu = this.openCardMenu === collectionId ? null : collectionId;
      },

      closeCardMenu() {
        this.openCardMenu = null;
      },

      // Handle click outside
      handleClickOutside(event) {
        if (this.openCardMenu && !event.target.closest('.dropdown-menu')) {
          this.closeCardMenu();
        }
        
        // Close bulk status menu if clicked outside
        if (this.showBulkStatusMenu && !event.target.closest('.relative')) {
          this.showBulkStatusMenu = false;
        }
      },    // Toggle select all
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedItems = this.filteredCollections.map(item => item._id);
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

      // Toggle individual selection
      toggleSelection(collectionId) {
        const index = this.selectedItems.indexOf(collectionId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        } else {
          this.selectedItems.push(collectionId);
        }
        this.bulkActions = this.selectedItems.length > 0;
        
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
                totalVisible: this.filteredCollections.length,
                allSelected: this.allSelected,
                someSelected: this.someSelected,
                indeterminate: shouldBeIndeterminate
              });
            }
          }
        });
      },

      // Bulk delete
      async bulkDelete() {
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ Collection ${this.selectedItems.length} รายการ?`)) {
          return;
        }

        try {
          this.loading_sources = false;
          
          for (const id of this.selectedItems) {
            await this.collectionService.deleteCollection(id);
          }
          
          this.selectedItems = [];
          this.bulkActions = false;
          await this.getData();

        } catch (error) {
          console.error('Error bulk deleting collections:', error);
          this.error = 'ไม่สามารถลบ Collections ได้';
          this.loading_sources = true;
        }
      },

      // Bulk export
      async bulkExport() {
        try {
          const selectedCollections = this.listItems.filter(item => 
            this.selectedItems.includes(item._id)
          );
          
          const exportData = {
            exportDate: new Date().toISOString(),
            totalItems: selectedCollections.length,
            collections: selectedCollections.map(collection => ({
              _id: collection._id,
              siteName: collection.siteName,
              hostname: collection.hostname,
              assetsCount: collection.assetsCount || 0,
              packageId: collection.packageId,
              status: this.getCollectionStatus(collection),
              createdAt: collection.createdAt
            }))
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `selected-collections-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Show success message
          this.showNotification('success', `ส่งออกข้อมูล ${this.selectedItems.length} รายการสำเร็จ`);
          
        } catch (error) {
          console.error('Error exporting collections:', error);
          this.error = 'ไม่สามารถส่งออกข้อมูลได้';
        }
      },

      // Show notification helper
      showNotification(type, message) {
        // This could be enhanced with a proper notification system
        if (type === 'success') {
          console.log('✅ Success:', message);
        } else {
          console.error('❌ Error:', message);
        }
      },

      // Toggle select all visible items
      toggleSelectAllVisible() {
        if (this.allSelected) {
          this.selectedItems = [];
          this.bulkActions = false;
        } else {
          this.selectedItems = this.filteredCollections.map(item => item._id);
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
        this.showBulkStatusMenu = false;
        
        // Force update indeterminate state
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      // Bulk archive collections
      async bulkArchive() {
        if (!confirm(`คุณต้องการเก็บถาวร Collection ${this.selectedItems.length} รายการหรือไม่?`)) {
          return;
        }

        try {
          this.loading_sources = false;
          
          // This would need to be implemented in CollectionService
          for (const id of this.selectedItems) {
            // await this.collectionService.archiveCollection(id);
            console.log('Archiving collection:', id);
          }
          
          this.showNotification('success', `เก็บถาวร ${this.selectedItems.length} รายการสำเร็จ`);
          this.clearSelection();
          await this.getData();

        } catch (error) {
          console.error('Error bulk archiving collections:', error);
          this.error = 'ไม่สามารถเก็บถาวร Collections ได้';
          this.loading_sources = true;
        }
      },

      // Bulk activate collections
      async bulkActivate() {
        if (!confirm(`คุณต้องการเปิดใช้งาน Collection ${this.selectedItems.length} รายการหรือไม่?`)) {
          return;
        }

        try {
          this.loading_sources = false;
          
          // This would need to be implemented in CollectionService
          for (const id of this.selectedItems) {
            // await this.collectionService.activateCollection(id);
            console.log('Activating collection:', id);
          }
          
          this.showNotification('success', `เปิดใช้งาน ${this.selectedItems.length} รายการสำเร็จ`);
          this.clearSelection();
          await this.getData();

        } catch (error) {
          console.error('Error bulk activating collections:', error);
          this.error = 'ไม่สามารถเปิดใช้งาน Collections ได้';
          this.loading_sources = true;
        }
      },

      // Handle keyboard shortcuts
      handleKeydown(event) {
        // Ctrl+A or Cmd+A to select all
        if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !event.target.matches('input, textarea')) {
          event.preventDefault();
          this.toggleSelectAllVisible();
        }
        
        // Escape to clear selection
        if (event.key === 'Escape') {
          if (this.selectedItems.length > 0) {
            this.clearSelection();
          }
          if (this.showBulkStatusMenu) {
            this.showBulkStatusMenu = false;
          }
          if (this.openCardMenu) {
            this.closeCardMenu();
          }
        }
        
        // Delete key to delete selected items
        if (event.key === 'Delete' && this.selectedItems.length > 0 && !event.target.matches('input, textarea')) {
          event.preventDefault();
          this.bulkDelete();
        }
      },

      // Debug selection state
      debugSelection() {
        console.clear(); // Clear console for better readability
        console.log('=== SELECTION DEBUG ===');
        console.log('📊 Data Status:');
        console.log('  - listItems:', this.listItems.length);
        console.log('  - filteredCollections:', this.filteredCollections.length);
        console.log('  - selectedItems:', this.selectedItems.length, this.selectedItems);
        console.log('  - bulkActions:', this.bulkActions);
        
        console.log('\n🔍 Computed Properties:');
        console.log('  - allSelected:', this.allSelected);
        console.log('  - someSelected:', this.someSelected);
        
        console.log('\n⚙️ Filter States:');
        console.log('  - activeFilter:', this.activeFilter);
        console.log('  - searchTerm:', this.searchTerm);
        console.log('  - activeQuickFilter:', this.activeQuickFilter);
        
        // Test checkbox states
        const headerCheckboxes = document.querySelectorAll('.header-select-all');
        console.log('\n✅ Checkbox Elements:');
        console.log('  - Header checkboxes found:', headerCheckboxes.length);
        headerCheckboxes.forEach((checkbox, index) => {
          console.log(`  - Checkbox ${index}:`, {
            checked: checkbox.checked,
            indeterminate: checkbox.indeterminate,
            value: checkbox.value || 'no-value'
          });
        });
        
        // Test individual checkboxes
        const itemCheckboxes = document.querySelectorAll('input[type="checkbox"]:not(.header-select-all)');
        console.log('  - Item checkboxes found:', itemCheckboxes.length);
        
        console.log('\n📝 Collections Data:');
        this.filteredCollections.forEach((collection, index) => {
          const isSelected = this.selectedItems.includes(collection._id);
          console.log(`  ${index + 1}. ${collection.siteName || 'No Name'} (${collection._id}) - Selected: ${isSelected}`);
        });
        
        console.log('=====================\n');
        
        // Force a reactivity update
        this.$forceUpdate();
      },

      // Clear all filters
      clearAllFilters() {
        this.searchTerm = '';
        this.activeFilter = 'all';
        this.activeQuickFilter = null;
        this.selectedItems = [];
        this.bulkActions = false;
      },

      // Get collection status
      getCollectionStatus(collection) {
        if (!collection.hostname || !collection.siteName) return 'incomplete';
        if ((collection.assetsCount || 0) === 0) return 'empty';
        return 'active';
      },

      // Get status class
      getStatusClass(status) {
        const statusClasses = {
          'active': 'border-green-200 bg-green-50',
          'empty': 'border-yellow-200 bg-yellow-50',
          'incomplete': 'border-red-200 bg-red-50'
        };
        return statusClasses[status] || 'border-gray-200 bg-white';
      },

      // Calculate stats
      calculateStats() {
        const active = this.listItems.filter(item => this.getCollectionStatus(item) === 'active').length;
        const empty = this.listItems.filter(item => this.getCollectionStatus(item) === 'empty').length;
        const incomplete = this.listItems.filter(item => this.getCollectionStatus(item) === 'incomplete').length;
        
        // Calculate recently created (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentlyCreated = this.listItems.filter(item => {
          if (!item.createdAt) return false;
          return new Date(item.createdAt) >= weekAgo;
        }).length;

        // Calculate total packages
        const totalPackages = this.listItems.filter(item => item.package && item.packageId).length;
        
        this.stats = {
          total: this.listItems.length,
          active: active,
          empty: empty,
          incomplete: incomplete,
          totalAssets: this.listItems.reduce((sum, item) => sum + (item.assetsCount || 0), 0),
          totalPackages: totalPackages,
          recentlyCreated: recentlyCreated
        };

        // Update sidebar menu counts
        this.sidebarMenuItems.forEach(item => {
          switch(item.value) {
            case 'all':
              item.count = this.stats.total;
              break;
            case 'active':
              item.count = active;
              break;
            case 'empty':
              item.count = empty;
              break;
            case 'incomplete':
              item.count = incomplete;
              break;
            case 'recent':
              item.count = recentlyCreated;
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
        this.filterCollections();
        this.selectedCollection = null;
        if (this.showMobileSidebar) {
          this.toggleMobileSidebar(); // Close mobile sidebar after selection
        }
      },

      filterCollections() {
        // This method can be used to filter collections based on activeFilter
        // For now, we'll handle filtering in computed property
      },

      sortCollections(collections) {
        return collections.sort((a, b) => {
          switch(this.sortBy) {
            case 'name_asc':
              return (a.siteName || '').localeCompare(b.siteName || '');
            case 'name_desc':
              return (b.siteName || '').localeCompare(a.siteName || '');
            case 'assets_desc':
              return (b.assetsCount || 0) - (a.assetsCount || 0);
            case 'assets_asc':
              return (a.assetsCount || 0) - (b.assetsCount || 0);
            case 'date_desc':
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            case 'date_asc':
              return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            default:
              return 0;
          }
        });
      },

      selectCollection(collection) {
        this.selectedCollection = collection;
      },

      closeCollectionDetail() {
        this.selectedCollection = null;
      },

      // Quick filter methods
      applyQuickFilter(filter) {
        if (this.activeQuickFilter === filter.value) {
          this.activeQuickFilter = null;
        } else {
          this.activeQuickFilter = filter.value;
        }
      },

      // Enhanced collection status with more detailed information
      getCollectionStatusInfo(collection) {
        const status = this.getCollectionStatus(collection);
        const statusInfo = {
          active: {
            label: 'ใช้งานได้',
            class: 'bg-green-100 text-green-800',
            icon: 'fas fa-check-circle'
          },
          empty: {
            label: 'ว่างเปล่า',
            class: 'bg-yellow-100 text-yellow-800',
            icon: 'fas fa-exclamation-triangle'
          },
          incomplete: {
            label: 'ไม่สมบูรณ์',
            class: 'bg-red-100 text-red-800',
            icon: 'fas fa-times-circle'
          }
        };
        return statusInfo[status] || statusInfo.incomplete;
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

      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        // สร้าง CollectionService instance
        this.collectionService = new CollectionService(this.hostkey);
        
        // Add event listener for click outside
        document.addEventListener('click', this.handleClickOutside);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown);
        
        await this.getData();
      } catch (error) {
        console.error('Error initializing component:', error);
        this.error = 'ไม่สามารถเริ่มต้นระบบได้';
      }
    },
    beforeUnmount() {
      // Remove event listeners
      document.removeEventListener('click', this.handleClickOutside);
      document.removeEventListener('keydown', this.handleKeydown);
    },
    updated() {
      // Handle indeterminate state for checkboxes
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
  <div class="bg-gray-50 flex collection-container h-full">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Collections</h2>
          <router-link
            to="/origin/collection/add"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="เพิ่ม Collection"
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
              <div class="text-green-600 text-xs font-medium">Assets</div>
              <div class="text-green-900 text-lg font-bold">{{ stats.totalAssets }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div class="text-purple-600 text-xs font-medium">Packages</div>
              <div class="text-purple-900 text-lg font-bold">{{ stats.totalPackages }}</div>
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
              placeholder="ค้นหา Collections, Hostname, หรือ Package..."
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
            <option value="assets_desc">Assets มาก-น้อย</option>
            <option value="assets_asc">Assets น้อย-มาก</option>
            <option value="date_desc">วันที่ใหม่-เก่า</option>
            <option value="date_asc">วันที่ เก่า-ใหม่</option>
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
            <h1 class="text-lg font-semibold text-gray-900">Collections</h1>
            <span v-if="selectedItems.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ selectedItems.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mobile Select All -->
            <button
              v-if="filteredCollections.length > 0"
              @click="toggleSelectAllVisible"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'"
            >
              <i :class="['fas', allSelected ? 'fa-check-double' : someSelected ? 'fa-minus' : 'fa-check']"></i>
            </button>
            <router-link
              to="/origin/collection/add"
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
            <h1 class="hidden lg:block text-xl font-bold text-gray-900 flex-shrink-0">Collections Management</h1>
            
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
                  <span class="hidden sm:inline">เลือกทั้งหมด </span>({{ selectedItems.length }}/{{ filteredCollections.length }})
                </label>
              </div>
              <span v-if="selectedItems.length > 0" class="text-xs text-blue-600 font-medium whitespace-nowrap hidden md:inline">
                • {{ selectedCollectionStats.totalAssets }} Assets
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
              
              <!-- Debug Button (Development Only) -->
              <button
                v-if="$isDev || true"
                @click="debugSelection"
                class="flex items-center gap-2 px-3 py-2 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors duration-200"
              >
                <i class="fas fa-bug"></i>
                <span class="hidden sm:inline">Debug</span>
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

        <!-- Content when loaded -->
        <div v-else>
          <!-- Error Message -->
          <div v-if="error" class="mb-4">
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
                <span class="text-blue-600 text-sm">จาก {{ filteredCollections.length }} รายการ</span>
              </div>
              <!-- Quick Stats for Selected Items -->
              <div class="flex items-center gap-4 text-sm text-blue-700">
                <span>• {{ selectedCollectionStats.activeCount }} ใช้งานได้</span>
                <span>• {{ selectedCollectionStats.totalAssets }} Assets</span>
                <span>• {{ selectedCollectionStats.withPackage }} มี Package</span>
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
              
              <!-- Bulk Export Button -->
              <button
                @click="bulkExport"
                class="px-3 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-download mr-1"></i>
                ส่งออก
              </button>
              
              <!-- Bulk Status Toggle -->
              <div class="relative">
                <button
                  @click="showBulkStatusMenu = !showBulkStatusMenu"
                  class="px-3 py-2 text-purple-700 bg-purple-100 border border-purple-300 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm"
                >
                  <i class="fas fa-toggle-on mr-1"></i>
                  สถานะ
                  <i class="fas fa-chevron-down ml-1"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div v-if="showBulkStatusMenu" class="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
                  <button
                    @click="bulkArchive; showBulkStatusMenu = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="fas fa-archive mr-2"></i>
                    เก็บถาวร
                  </button>
                  <button
                    @click="bulkActivate; showBulkStatusMenu = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="fas fa-play mr-2"></i>
                    เปิดใช้งาน
                  </button>
                </div>
              </div>
              
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

          <!-- Collections Grid/List Content -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
            <router-link
              v-for="collection in filteredCollections"
              :key="collection._id"
              :to="`/origin/collection/detail/${collection._id}`"
              class="relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 cursor-pointer content-card group flex flex-col"
              :class="[
                getStatusClass(getCollectionStatus(collection)),
                selectedItems.includes(collection._id) ? 'ring-2 ring-blue-500' : ''
              ]"
            >
              <!-- Selection Checkbox -->
              <div class="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  :value="collection._id"
                  v-model="selectedItems"
                  @click.stop
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <!-- Card Menu -->
              <div class="absolute top-2 right-2 z-10">
                <button
                  @click.stop.prevent="toggleCardMenu(collection._id)"
                  class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
                >
                  <i class="fas fa-ellipsis-v text-gray-600"></i>
                </button>
                <!-- Dropdown Menu -->
                <div
                  v-if="openCardMenu === collection._id"
                  class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 dropdown-menu z-20"
                >
                  <router-link
                    :to="`/origin/collection/detail/${collection._id}`"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-eye text-blue-500"></i>
                    <span>ดูรายละเอียด</span>
                  </router-link>
                  <router-link
                    :to="`/origin/package/management/${collection._id}`"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-cog text-purple-500"></i>
                    <span>จัดการ Package</span>
                  </router-link>
                  <router-link
                    :to="`/origin/collection/edit/${collection._id}`"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-edit text-yellow-500"></i>
                    <span>แก้ไข</span>
                  </router-link>
                  <button
                    @click.stop="$router.push(`/origin/collection/detail/${collection._id}?tab=ownership`); closeCardMenu()"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 w-full text-left"
                  >
                    <i class="fas fa-user-crown text-indigo-500"></i>
                    <span>จัดการเจ้าของ</span>
                  </button>
                  <div class="border-t border-gray-200 my-1"></div>
                  <button
                    @click.stop="deleteData(collection._id); closeCardMenu()"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <i class="fas fa-trash text-red-500"></i>
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
              <!-- Collection Image -->
              <div class="relative h-32 bg-gray-100">
                <img
                  v-if="collection.loginBg"
                  :src="collection.loginBg"
                  :alt="collection.siteName"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="fas fa-folder text-gray-400 text-3xl"></i>
                </div>
                <!-- Status Badge -->
                <div class="absolute bottom-2 left-2">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getCollectionStatus(collection) === 'active' ? 'bg-green-100 text-green-800' :
                    getCollectionStatus(collection) === 'empty' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ getCollectionStatus(collection) === 'active' ? 'ใช้งานได้' :
                      getCollectionStatus(collection) === 'empty' ? 'ว่างเปล่า' : 'ไม่สมบูรณ์' }}
                  </span>
                </div>
                <!-- Site Type Badge -->
                <div v-if="collection.siteType" class="absolute top-2 left-2">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                    {{ collection.siteType }}
                  </span>
                </div>
              </div>
              <!-- Collection Info -->
              <div class="p-4 flex-1 flex flex-col">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 truncate">{{ collection.siteName || 'ไม่มีชื่อ' }}</h3>
                  <p class="text-sm text-gray-600 truncate mt-1">{{ collection.hostname || 'ไม่มี hostname' }}</p>
                  
                  <!-- Key Information Row -->
                  <div v-if="collection.key" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <i class="fas fa-key mr-1"></i>
                      {{ collection.key.substring(0, 8) }}...
                    </span>
                  </div>

                  <!-- Owner Information -->
                  <div v-if="collection.ownershipInfo?.primaryOwner?.name" class="mt-2">
                    <div class="flex flex-wrap gap-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <i class="fas fa-user-crown mr-1"></i>
                        {{ collection.ownershipInfo.primaryOwner.name }}
                      </span>
                      <span :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        collection.ownershipInfo.primaryOwner.ownerType === 'individual' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      ]">
                        <i :class="['mr-1', collection.ownershipInfo.primaryOwner.ownerType === 'individual' ? 'fas fa-user' : 'fas fa-building']"></i>
                        {{ collection.ownershipInfo.primaryOwner.ownerType === 'individual' ? 'บุคคล' : 'นิติบุคคล' }}
                      </span>
                    </div>
                    <div v-if="collection.ownershipInfo.primaryOwner?.address" class="text-xs text-gray-500 mt-1 truncate">
                      <i class="fas fa-map-marker-alt mr-1"></i>
                      {{ collection.ownershipInfo.primaryOwner.address.substring(0, 40) }}{{ collection.ownershipInfo.primaryOwner.address.length > 40 ? '...' : '' }}
                    </div>
                  </div>

                  <!-- Package Information -->
                  <div v-if="collection.package" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <i class="fas fa-gift mr-1"></i>
                      {{ collection.package.name }}
                    </span>
                    <div class="text-xs text-gray-500 mt-1">
                      ฿{{ collection.package.price }}/{{ collection.package.duration }}
                    </div>
                  </div>

                  <!-- Plugin Information -->
                  <div v-if="collection.plugins && collection.plugins.length > 0" class="mt-2">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="plugin in collection.plugins.slice(0, 3)" 
                        :key="plugin"
                        class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {{ plugin }}
                      </span>
                      <span 
                        v-if="collection.plugins.length > 3"
                        class="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded"
                      >
                        +{{ collection.plugins.length - 3 }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center space-x-3">
                      <span class="text-xs text-gray-500">{{ collection.assetsCount || 0 }} Assets</span>
                      <span v-if="collection.defaultPlugin" class="text-xs text-blue-600">{{ collection.defaultPlugin }}</span>
                    </div>
                    <span class="text-xs text-gray-500">{{ collection.createdAt ? new Date(collection.createdAt).toLocaleDateString('th-TH') : '' }}</span>
                  </div>
                </div>
                
                <!-- Card Footer with Action Buttons - Always at bottom -->
                <div class="mt-auto pt-3 border-t border-gray-100">
                  <div class="flex items-center justify-between gap-2">
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-1">
                      <button
                        @click.stop.prevent="$router.push(`/origin/collection/detail/${collection._id}`)"
                        class="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="ดูรายละเอียด"
                      >
                        <i class="fas fa-eye"></i>
                        <span class="hidden sm:inline">ดู</span>
                      </button>
                      
                      <button
                        @click.stop.prevent="$router.push(`/origin/collection/edit/${collection._id}`)"
                        class="flex items-center gap-1 px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 rounded transition-colors duration-200"
                        title="แก้ไข"
                      >
                        <i class="fas fa-edit"></i>
                        <span class="hidden sm:inline">แก้ไข</span>
                      </button>
                      
                      <button
                        @click.stop.prevent="$router.push(`/origin/package/management/${collection._id}`)"
                        class="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
                        title="จัดการแพ็คเกจ"
                      >
                        <i class="fas fa-gift"></i>
                        <span class="hidden sm:inline">แพ็คเกจ</span>
                      </button>
                    </div>
                    
                    <!-- Delete Button -->
                    <button
                      @click.stop.prevent="deleteData(collection._id)"
                      class="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      title="ลบ"
                    >
                      <i class="fas fa-trash"></i>
                      <span class="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            </router-link>
            <!-- Add New Collection Card -->
            <router-link
              to="/origin/collection/add"
              class="relative bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 content-card flex items-center justify-center min-h-[200px]"
            >
              <div class="text-center">
                <i class="fas fa-plus text-gray-400 text-3xl mb-2"></i>
                <p class="text-gray-600 font-medium">เพิ่ม Collection ใหม่</p>
              </div>
            </router-link>
          </div>
          <!-- List View -->
          <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 header-select-all"
                        data-select-all="true"
                      />
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เจ้าของ</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plugins</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="collection in filteredCollections" :key="collection._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        :value="collection._id"
                        v-model="selectedItems"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <img v-if="collection.siteLogo" :src="collection.siteLogo" :alt="collection.siteName" class="h-full w-full object-cover" />
                            <i v-else class="fas fa-folder text-gray-400"></i>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ collection.siteName || 'ไม่มีชื่อ' }}</div>
                          <div class="text-sm text-gray-500">{{ collection.hostname || 'ไม่มี hostname' }}</div>
                          <div v-if="collection.key" class="text-xs text-gray-400 mt-1">Key: {{ collection.key.substring(0, 12) }}...</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getCollectionStatus(collection) === 'active' ? 'bg-green-100 text-green-800' :
                        getCollectionStatus(collection) === 'empty' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      ]">
                        {{ getCollectionStatus(collection) === 'active' ? 'ใช้งานได้' :
                           getCollectionStatus(collection) === 'empty' ? 'ว่างเปล่า' : 'ไม่สมบูรณ์' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="collection.ownershipInfo?.primaryOwner?.name">
                        <div class="flex items-center gap-2 mb-1">
                          <div class="text-sm font-medium text-gray-900">{{ collection.ownershipInfo.primaryOwner.name }}</div>
                          <span :class="[
                            'text-xs px-2 py-1 rounded-full',
                            collection.ownershipInfo.primaryOwner.ownerType === 'individual' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          ]">
                            {{ collection.ownershipInfo.primaryOwner.ownerType === 'individual' ? 'บุคคล' : 'นิติบุคคล' }}
                          </span>
                        </div>
                        <div class="text-sm text-gray-500">{{ collection.ownershipInfo.primaryOwner.email }}</div>
                        <div v-if="collection.ownershipInfo.primaryOwner.ownerType === 'corporate' && collection.ownershipInfo.organization?.name" class="text-xs text-gray-400">
                          {{ collection.ownershipInfo.organization.name }}
                        </div>
                        <div v-if="collection.ownershipInfo.primaryOwner?.address" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          <i class="fas fa-map-marker-alt mr-1"></i>
                          {{ collection.ownershipInfo.primaryOwner.address.substring(0, 50) }}{{ collection.ownershipInfo.primaryOwner.address.length > 50 ? '...' : '' }}
                        </div>
                      </div>
                      <span v-else class="text-sm text-gray-400">ไม่ระบุเจ้าของ</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="collection.package" class="flex items-center">
                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {{ collection.package.name }}
                        </span>
                        <div class="ml-2 text-xs text-gray-500">
                          ฿{{ collection.package.price }}/{{ collection.package.duration }}
                        </div>
                      </div>
                      <span v-else class="text-sm text-gray-400">ไม่มี Package</span>
                    </td>
                    <td class="px-6 py-4">
                      <div v-if="collection.plugins && collection.plugins.length > 0" class="flex flex-wrap gap-1">
                        <span 
                          v-for="plugin in collection.plugins.slice(0, 3)" 
                          :key="plugin"
                          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {{ plugin }}
                        </span>
                        <span 
                          v-if="collection.plugins.length > 3"
                          class="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded"
                          :title="collection.plugins.slice(3).join(', ')"
                        >
                          +{{ collection.plugins.length - 3 }}
                        </span>
                      </div>
                      <span v-else class="text-sm text-gray-400">ไม่มี Plugins</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ collection.assetsCount || 0 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ collection.createdAt ? new Date(collection.createdAt).toLocaleDateString('th-TH') : '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <router-link
                        :to="`/origin/collection/detail/${collection._id}`"
                        class="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ดู
                      </router-link>
                      <router-link
                        :to="`/origin/collection/edit/${collection._id}`"
                        class="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        แก้ไข
                      </router-link>
                      <button
                        @click="deleteData(collection._id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Empty State -->
          <div v-if="filteredCollections.length === 0" class="text-center py-12">
            <i class="fas fa-folder-open text-gray-400 text-5xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ searchTerm || activeFilter !== 'all' || activeQuickFilter ? 'ไม่พบ Collections ที่ตรงกับการค้นหา' : 'ไม่พบ Collections' }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ searchTerm ? `ไม่พบผลลัพธ์สำหรับ "${searchTerm}"` : 
                 activeFilter !== 'all' ? 'ลองเปลี่ยนตัวกรองหรือเพิ่ม Collection ใหม่' : 
                 'เริ่มต้นด้วยการสร้าง Collection แรกของคุณ' }}
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <router-link
                to="/origin/collection/add"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <i class="fas fa-plus"></i>
                <span>เพิ่ม Collection</span>
              </router-link>
              <button
                v-if="searchTerm || activeFilter !== 'all' || activeQuickFilter"
                @click="clearAllFilters"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <i class="fas fa-times"></i>
                <span>ล้างตัวกรอง</span>
              </button>
            </div>
          </div>
        </div>
        <!-- End Content when loaded -->
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 h-[65px]">
            <h2 class="text-lg font-semibold text-gray-900">Collections</h2>
            <button @click="toggleMobileSidebar" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="px-4 py-4 border-b border-gray-200">
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-blue-600 text-xs font-medium">ทั้งหมด</div>
                <div class="text-blue-900 text-lg font-bold">{{ stats.total }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-green-600 text-xs font-medium">Assets</div>
                <div class="text-green-900 text-lg font-bold">{{ stats.totalAssets }}</div>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="px-4 py-3 border-b border-gray-200">
            <div class="relative">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="ค้นหา Collections..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
              <option value="assets_desc">Assets มาก-น้อย</option>
              <option value="assets_asc">Assets น้อย-มาก</option>
              <option value="date_desc">วันที่ใหม่-เก่า</option>
              <option value="date_asc">วันที่ เก่า-ใหม่</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Collection container with full height */
.collection-container {
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

/* Collection card animations */
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

/* Responsive gap utilities */
@media (max-width: 1024px) {
  .lg\:gap-4 {
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .md\:gap-3 {
    gap: 0.5rem;
  }
  
  .sm\:gap-2 {
    gap: 0.25rem;
  }
}
</style>
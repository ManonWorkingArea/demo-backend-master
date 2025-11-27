<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Items Management</h1>
            <p class="mt-2 text-gray-600">จัดการรายการ Items ทั้งหมด</p>
          </div>
          <div class="flex space-x-3">
            <router-link 
              to="/dummy/items/add"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่ม Item ใหม่
            </router-link>
            <button 
              @click="exportData"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Filters & Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="ค้นหาด้วยชื่อ หรือรหัส..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedSearch"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              v-model="filters.status"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select 
              v-model="filters.type"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="type_a">Type A</option>
              <option value="type_b">Type B</option>
              <option value="type_c">Type C</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredItems.length }} items found</span>
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">View:</label>
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg',
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg',
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-blue-800 font-medium">
            {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex space-x-2">
            <button 
              @click="bulkAction('activate')"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Activate
            </button>
            <button 
              @click="bulkAction('deactivate')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Deactivate
            </button>
            <button 
              @click="bulkAction('delete')"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Items Grid/List View -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="item in paginatedItems" 
          :key="item.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
          @click="viewItem(item.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">{{ item.code }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                :checked="selectedItems.includes(item.id)"
                @change="toggleItemSelection(item.id)"
                @click.stop
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div class="relative">
                <button 
                  @click.stop="toggleDropdown(item.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div 
                  v-if="dropdownOpen === item.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button 
                      @click="editItem(item.id)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-edit mr-2"></i>Edit
                    </button>
                    <button 
                      @click="duplicateItem(item.id)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-copy mr-2"></i>Duplicate
                    </button>
                    <button 
                      @click="deleteItem(item.id)"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <i class="fas fa-trash mr-2"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600">
              <i class="fas fa-tag mr-2"></i>
              {{ item.type }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDate(item.created_at) }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span 
              :class="getStatusClass(item.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ item.status }}
            </span>
            <span class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(item.price || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allItemsSelected"
                  @change="toggleAllItems"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="item in paginatedItems" 
              :key="item.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="viewItem(item.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(item.id)"
                  @change="toggleItemSelection(item.id)"
                  @click.stop
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                  <div class="text-sm text-gray-500">{{ item.code }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(item.status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(item.price || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click.stop="editItem(item.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click.stop="deleteItem(item.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm mt-6">
        <div class="text-sm text-gray-500">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} 
          of {{ filteredItems.length }} results
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyItemsManager',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Items Management', path: '/dummy/items' }
      ],
      
      loading: true,
      viewMode: 'grid', // 'grid' or 'list'
      
      // Data
      items: [],
      selectedItems: [],
      
      // Filters
      filters: {
        search: '',
        status: '',
        type: ''
      },
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 12,
      
      // UI State
      dropdownOpen: null,
      searchTimeout: null
    }
  },

  computed: {
    filteredItems() {
      let filtered = [...this.items]

      // Search filter
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.code.toLowerCase().includes(searchTerm)
        )
      }

      // Status filter
      if (this.filters.status) {
        filtered = filtered.filter(item => item.status === this.filters.status)
      }

      // Type filter
      if (this.filters.type) {
        filtered = filtered.filter(item => item.type === this.filters.type)
      }

      return filtered
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredItems.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage)
    },

    visiblePages() {
      const current = this.currentPage
      const total = this.totalPages
      const delta = 2
      
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      } else {
        rangeWithDots.push(total)
      }

      return rangeWithDots.filter((v, i, arr) => v !== arr[i - 1])
    },

    hasActiveFilters() {
      return this.filters.search || this.filters.status || this.filters.type
    },

    allItemsSelected() {
      return this.paginatedItems.length > 0 && 
             this.paginatedItems.every(item => this.selectedItems.includes(item.id))
    }
  },

  async mounted() {
    await this.loadItems()
  },

  methods: {
    async loadItems() {
      try {
        this.loading = true
        
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock data - replace with real API response
        this.items = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Sample Item ${i + 1}`,
          code: `SI-${String(i + 1).padStart(3, '0')}`,
          type: ['type_a', 'type_b', 'type_c'][i % 3],
          status: ['active', 'pending', 'inactive', 'draft'][i % 4],
          price: Math.floor(Math.random() * 10000) + 100,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }))
        
      } catch (error) {
        console.error('Error loading items:', error)
      } finally {
        this.loading = false
      }
    },

    // Search & Filter Methods
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.applyFilters()
      }, 300)
    },

    applyFilters() {
      this.currentPage = 1
      // Additional filter logic can be added here
    },

    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        type: ''
      }
      this.currentPage = 1
    },

    // Selection Methods
    toggleItemSelection(itemId) {
      const index = this.selectedItems.indexOf(itemId)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(itemId)
      }
    },

    toggleAllItems() {
      if (this.allItemsSelected) {
        // Unselect all items on current page
        this.paginatedItems.forEach(item => {
          const index = this.selectedItems.indexOf(item.id)
          if (index > -1) {
            this.selectedItems.splice(index, 1)
          }
        })
      } else {
        // Select all items on current page
        this.paginatedItems.forEach(item => {
          if (!this.selectedItems.includes(item.id)) {
            this.selectedItems.push(item.id)
          }
        })
      }
    },

    // Pagination Methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    // Action Methods
    viewItem(id) {
      this.$router.push(`/dummy/items/${id}`)
    },

    editItem(id) {
      this.$router.push(`/dummy/items/${id}/edit`)
    },

    duplicateItem(id) {
      console.log('Duplicate item:', id)
      // Implement duplication logic
    },

    deleteItem(id) {
      if (confirm('คุณแน่ใจหรือไม่ที่จะลบ item นี้?')) {
        const index = this.items.findIndex(item => item.id === id)
        if (index > -1) {
          this.items.splice(index, 1)
        }
      }
    },

    bulkAction(action) {
      if (this.selectedItems.length === 0) return

      switch (action) {
        case 'activate':
          console.log('Bulk activate:', this.selectedItems)
          break
        case 'deactivate':
          console.log('Bulk deactivate:', this.selectedItems)
          break
        case 'delete':
          if (confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${this.selectedItems.length} items?`)) {
            console.log('Bulk delete:', this.selectedItems)
          }
          break
      }
    },

    exportData() {
      console.log('Export data')
      // Implement export functionality
    },

    // UI Methods
    toggleDropdown(itemId) {
      this.dropdownOpen = this.dropdownOpen === itemId ? null : itemId
    },

    // Utility Methods
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },

    formatDate(date) {
      return MODULE_UTILS.formatDate(date)
    },

    getStatusClass(status) {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-blue-100 text-blue-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
  }
}
</script>

<style scoped>
/* Loading animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Data Table Template</h1>
            <p class="mt-2 text-gray-600">Advanced data table with full functionality</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="exportData"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-download mr-2"></i>
              Export
            </button>
            <button 
              @click="importData"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-upload mr-2"></i>
              Import
            </button>
            <router-link 
              to="/dummy/items/new"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              Add New
            </router-link>
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
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search items..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="debounceSearch"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Categories</option>
              <option value="type-a">Type A</option>
              <option value="type-b">Type B</option>
              <option value="type-c">Type C</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="filters.dateRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <button
              @click="resetFilters"
              class="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              <i class="fas fa-undo mr-1"></i>
              Reset Filters
            </button>
            <div class="text-sm text-gray-500">
              {{ filteredData.length }} of {{ totalItems }} items
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">View:</span>
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'"
              class="p-2 rounded-lg transition-colors"
            >
              <i class="fas fa-table"></i>
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'"
              class="p-2 rounded-lg transition-colors"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-blue-700 font-medium">{{ selectedItems.length }} items selected</span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="bulkAction('activate')"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              <i class="fas fa-check mr-1"></i>
              Activate
            </button>
            <button
              @click="bulkAction('deactivate')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              <i class="fas fa-pause mr-1"></i>
              Deactivate
            </button>
            <button
              @click="bulkAction('delete')"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              <i class="fas fa-trash mr-1"></i>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    v-for="column in tableColumns"
                    :key="column.key"
                    @click="sortBy(column.key)"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center space-x-1">
                      <span>{{ column.label }}</span>
                      <i
                        v-if="sortColumn === column.key"
                        :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                        class="text-gray-400"
                      ></i>
                      <i v-else class="fas fa-sort text-gray-300"></i>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-if="loading">
                  <tr v-for="i in 10" :key="'loading-' + i" class="animate-pulse">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td v-for="j in tableColumns.length" :key="'col-' + j" class="px-6 py-4 whitespace-nowrap">
                      <div class="h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                </template>
                <tr
                  v-else
                  v-for="item in paginatedData"
                  :key="item.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :checked="selectedItems.includes(item.id)"
                      @change="toggleSelectItem(item.id)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <i class="fas fa-cube text-blue-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                        <div class="text-sm text-gray-500">{{ item.code }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ item.category }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getStatusClass(item.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatCurrency(item.price) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(item.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="viewItem(item)"
                        class="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        @click="editItem(item)"
                        class="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="deleteItem(item)"
                        class="text-red-600 hover:text-red-900 transition-colors"
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

        <!-- Grid View -->
        <div v-else class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <template v-if="loading">
              <div v-for="i in 12" :key="'grid-loading-' + i" class="animate-pulse">
                <div class="bg-white rounded-lg border p-4">
                  <div class="h-4 bg-gray-200 rounded mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div class="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </template>
            <div
              v-else
              v-for="item in paginatedData"
              :key="'grid-' + item.id"
              class="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              @click="viewItem(item)"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="selectedItems.includes(item.id)"
                      @change="toggleSelectItem(item.id)"
                      @click.stop
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <i class="fas fa-cube text-blue-600 text-sm"></i>
                    </div>
                  </div>
                  <span
                    :class="getStatusClass(item.status)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ item.status }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 mb-1">{{ item.name }}</h3>
                <p class="text-sm text-gray-500 mb-3">{{ item.code }} • {{ item.category }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-gray-900">{{ formatCurrency(item.price) }}</span>
                  <div class="flex space-x-1">
                    <button
                      @click.stop="editItem(item)"
                      class="p-1 text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button
                      @click.stop="deleteItem(item)"
                      class="p-1 text-red-600 hover:text-red-900 transition-colors"
                    >
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-sm text-gray-700">
                Showing {{ startIndex }} to {{ endIndex }} of {{ filteredData.length }} results
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <select
                v-model="perPage"
                @change="currentPage = 1; updatePagination()"
                class="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
                <option :value="100">100 per page</option>
              </select>
              <div class="flex items-center space-x-1">
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span class="px-3 py-1 text-sm">
                  {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyDataTable',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Data Table' }
      ],
      
      loading: true,
      viewMode: 'table', // 'table' or 'grid'
      
      // Data
      items: [],
      filteredData: [],
      
      // Pagination
      currentPage: 1,
      perPage: 25,
      totalItems: 0,
      
      // Selection
      selectedItems: [],
      
      // Sorting
      sortColumn: 'created_at',
      sortDirection: 'desc',
      
      // Filters
      filters: {
        search: '',
        status: '',
        category: '',
        dateRange: ''
      },
      
      // Table Configuration
      tableColumns: [
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'price', label: 'Price' },
        { key: 'created_at', label: 'Created' }
      ],
      
      // Search debounce
      searchTimeout: null
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredData.length / this.perPage)
    },

    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredData.slice(start, end)
    },

    startIndex() {
      return (this.currentPage - 1) * this.perPage + 1
    },

    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.filteredData.length)
    },

    isAllSelected() {
      return this.paginatedData.length > 0 && 
             this.paginatedData.every(item => this.selectedItems.includes(item.id))
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      try {
        this.loading = true
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate mock data
        this.items = Array.from({ length: 247 }, (_, index) => ({
          id: index + 1,
          name: `Sample Item ${index + 1}`,
          code: `SI-${String(index + 1).padStart(3, '0')}`,
          category: ['Type A', 'Type B', 'Type C'][Math.floor(Math.random() * 3)],
          status: ['active', 'pending', 'inactive', 'draft'][Math.floor(Math.random() * 4)],
          price: Math.floor(Math.random() * 10000) + 100,
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }))
        
        this.totalItems = this.items.length
        this.applyFilters()
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        this.loading = false
      }
    },

    applyFilters() {
      let filtered = [...this.items]
      
      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(search) ||
          item.code.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
        )
      }
      
      // Status filter
      if (this.filters.status) {
        filtered = filtered.filter(item => item.status === this.filters.status)
      }
      
      // Category filter
      if (this.filters.category) {
        filtered = filtered.filter(item => item.category.toLowerCase().replace(' ', '-') === this.filters.category)
      }
      
      // Date range filter
      if (this.filters.dateRange) {
        const now = new Date()
        const ranges = {
          today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          month: new Date(now.getFullYear(), now.getMonth(), 1),
          year: new Date(now.getFullYear(), 0, 1)
        }
        
        if (ranges[this.filters.dateRange]) {
          filtered = filtered.filter(item => item.created_at >= ranges[this.filters.dateRange])
        }
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aVal = a[this.sortColumn]
        let bVal = b[this.sortColumn]
        
        if (this.sortColumn === 'created_at') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
      
      this.filteredData = filtered
      this.currentPage = 1
      this.selectedItems = []
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
      }, 300)
    },

    resetFilters() {
      this.filters = {
        search: '',
        status: '',
        category: '',
        dateRange: ''
      }
      this.applyFilters()
    },

    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
      this.applyFilters()
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = this.selectedItems.filter(id => 
          !this.paginatedData.find(item => item.id === id)
        )
      } else {
        const newSelections = this.paginatedData
          .filter(item => !this.selectedItems.includes(item.id))
          .map(item => item.id)
        this.selectedItems.push(...newSelections)
      }
    },

    toggleSelectItem(itemId) {
      const index = this.selectedItems.indexOf(itemId)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(itemId)
      }
    },

    updatePagination() {
      // Method to handle pagination updates
    },

    // Actions
    viewItem(item) {
      console.log('View item:', item)
      // Implement view logic
      alert(`View item: ${item.name}`)
    },

    editItem(item) {
      console.log('Edit item:', item)
      // Navigate to edit page or open modal
      this.$router.push(`/dummy/items/${item.id}/edit`)
    },

    deleteItem(item) {
      if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        console.log('Delete item:', item)
        // Implement delete logic
        this.items = this.items.filter(i => i.id !== item.id)
        this.applyFilters()
      }
    },

    bulkAction(action) {
      if (confirm(`Are you sure you want to ${action} ${this.selectedItems.length} items?`)) {
        console.log(`Bulk ${action}:`, this.selectedItems)
        
        switch (action) {
          case 'activate':
            this.items.forEach(item => {
              if (this.selectedItems.includes(item.id)) {
                item.status = 'active'
              }
            })
            break
          case 'deactivate':
            this.items.forEach(item => {
              if (this.selectedItems.includes(item.id)) {
                item.status = 'inactive'
              }
            })
            break
          case 'delete':
            this.items = this.items.filter(item => !this.selectedItems.includes(item.id))
            break
        }
        
        this.selectedItems = []
        this.applyFilters()
      }
    },

    exportData() {
      console.log('Export data')
      // Implement export logic
      alert('Export functionality - implement as needed')
    },

    importData() {
      console.log('Import data')
      // Implement import logic
      alert('Import functionality - implement as needed')
    },

    // Utility methods
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
/* Custom animations */
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

/* Hover animations */
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
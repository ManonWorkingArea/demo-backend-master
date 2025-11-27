<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <i class="fas fa-building text-purple-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Fixed Assets - สินทรัพย์ถาวร</h1>
              <p class="text-sm text-gray-600 mt-1">ทะเบียนสินทรัพย์ถาวรและคำนวณค่าเสื่อมราคา</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Uncomment when route is available
            <router-link
              :to="{ name: 'accounting-fixed-asset-create' }"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              New Asset
            </router-link>
            -->
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <router-link to="/" class="text-gray-500 hover:text-gray-700 transition-colors">
            <i class="fas fa-home"></i>
            <span class="ml-1">Home</span>
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <router-link to="/accounting" class="text-gray-500 hover:text-gray-700 transition-colors">
            Accounting
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-gray-900 font-medium">Fixed Assets</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Assets -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total Assets</p>
              <p class="text-3xl font-bold">{{ summary.total_assets }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-building text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Cost Value -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Cost Value</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_cost) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-coins text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Accumulated Depreciation -->
        <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm font-medium mb-1">Depreciation</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.total_depreciation) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-chart-line text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Net Book Value -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium mb-1">Net Book Value</p>
              <p class="text-3xl font-bold">{{ formatCurrency(summary.net_book_value) }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-calculator text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search asset name, code..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Asset Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
            <select
              v-model="filters.asset_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="building">Building</option>
              <option value="machinery">Machinery</option>
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disposed">Disposed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <!-- Department -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              v-model="filters.department"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="production">Production</option>
              <option value="admin">Administration</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span v-if="hasActiveFilters" class="inline-flex items-center">
              <i class="fas fa-filter mr-2 text-blue-600"></i>
              Filters active
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i class="fas fa-times mr-2"></i>
              Clear Filters
            </button>
            <button
              @click="loadAssets"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assets Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Code
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acquisition Date
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depreciation
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Book Value
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="asset in paginatedAssets"
                :key="asset.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ asset.asset_code }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ asset.asset_name }}</div>
                  <div class="text-xs text-gray-500">{{ asset.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeBadgeClass(asset.asset_type)">
                    {{ getTypeLabel(asset.asset_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getDepartmentLabel(asset.department) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {{ formatDate(asset.acquisition_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {{ formatCurrency(asset.cost) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                  {{ formatCurrency(asset.accumulated_depreciation) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                  {{ formatCurrency(asset.net_book_value) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getStatusBadgeClass(asset.status)">
                    {{ getStatusLabel(asset.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="viewAsset(asset)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="asset.status === 'active'"
                      @click="calculateDepreciation(asset)"
                      class="text-purple-600 hover:text-purple-900 transition-colors"
                      title="Calculate Depreciation"
                    >
                      <i class="fas fa-calculator"></i>
                    </button>
                    <button
                      v-if="asset.status === 'active'"
                      @click="editAsset(asset)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      v-if="asset.status === 'active'"
                      @click="disposeAsset(asset)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      title="Dispose"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAssets.length === 0" class="text-center py-12">
          <i class="fas fa-building text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500 text-lg font-medium">No fixed assets found</p>
          <p class="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new asset</p>
        </div>

        <!-- Pagination -->
        <div v-if="filteredAssets.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredAssets.length) }} of {{ filteredAssets.length }} entries
            </div>
            <div class="flex space-x-2">
              <button
                @click="goToPage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                :class="pagination.current_page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-1 border rounded-md text-sm font-medium transition-colors"
                :class="page === pagination.current_page ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page === totalPages"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors"
                :class="pagination.current_page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../../plugins/index.js'

export default {
  name: 'FixedAssetsList',
  data() {
    return {
      loading: false,
      assets: [
        {
          id: 1,
          asset_code: 'FA-2020-001',
          asset_name: 'Office Building',
          description: 'Main office building - 5 floors',
          asset_type: 'building',
          department: 'admin',
          acquisition_date: '2020-01-15',
          cost: 10000000,
          useful_life: 20,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 2500000,
          net_book_value: 7500000,
          status: 'active'
        },
        {
          id: 2,
          asset_code: 'FA-2021-005',
          asset_name: 'CNC Machine',
          description: 'High precision CNC milling machine',
          asset_type: 'machinery',
          department: 'production',
          acquisition_date: '2021-03-10',
          cost: 3500000,
          useful_life: 10,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 1225000,
          net_book_value: 2275000,
          status: 'active'
        },
        {
          id: 3,
          asset_code: 'FA-2022-012',
          asset_name: 'Toyota Camry',
          description: 'Company car for sales team',
          asset_type: 'vehicle',
          department: 'sales',
          acquisition_date: '2022-06-01',
          cost: 1200000,
          useful_life: 8,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 300000,
          net_book_value: 900000,
          status: 'active'
        },
        {
          id: 4,
          asset_code: 'FA-2022-018',
          asset_name: 'Forklift',
          description: 'Electric forklift 3 tons',
          asset_type: 'equipment',
          department: 'production',
          acquisition_date: '2022-09-15',
          cost: 800000,
          useful_life: 10,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 160000,
          net_book_value: 640000,
          status: 'active'
        },
        {
          id: 5,
          asset_code: 'FA-2023-003',
          asset_name: 'Office Furniture Set',
          description: 'Desks, chairs, and cabinets for 20 employees',
          asset_type: 'furniture',
          department: 'admin',
          acquisition_date: '2023-02-01',
          cost: 500000,
          useful_life: 5,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 175000,
          net_book_value: 325000,
          status: 'active'
        },
        {
          id: 6,
          asset_code: 'FA-2023-008',
          asset_name: 'Production Line A',
          description: 'Automated production line',
          asset_type: 'machinery',
          department: 'production',
          acquisition_date: '2023-05-20',
          cost: 5000000,
          useful_life: 15,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 583333,
          net_book_value: 4416667,
          status: 'active'
        },
        {
          id: 7,
          asset_code: 'FA-2019-002',
          asset_name: 'Old Warehouse',
          description: 'Warehouse building - disposed in 2024',
          asset_type: 'building',
          department: 'production',
          acquisition_date: '2019-08-01',
          cost: 3000000,
          useful_life: 20,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 750000,
          net_book_value: 2250000,
          status: 'disposed'
        },
        {
          id: 8,
          asset_code: 'FA-2023-015',
          asset_name: 'Printing Machine',
          description: 'Industrial printer - under maintenance',
          asset_type: 'equipment',
          department: 'production',
          acquisition_date: '2023-11-10',
          cost: 1500000,
          useful_life: 7,
          depreciation_method: 'straight_line',
          accumulated_depreciation: 178571,
          net_book_value: 1321429,
          status: 'maintenance'
        }
      ],
      filters: {
        search: '',
        asset_type: '',
        status: '',
        department: ''
      },
      pagination: {
        current_page: 1,
        per_page: 10
      }
    }
  },
  computed: {
    filteredAssets() {
      let result = this.assets

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(asset =>
          asset.asset_code.toLowerCase().includes(search) ||
          asset.asset_name.toLowerCase().includes(search) ||
          asset.description.toLowerCase().includes(search)
        )
      }

      // Asset type filter
      if (this.filters.asset_type) {
        result = result.filter(asset => asset.asset_type === this.filters.asset_type)
      }

      // Status filter
      if (this.filters.status) {
        result = result.filter(asset => asset.status === this.filters.status)
      }

      // Department filter
      if (this.filters.department) {
        result = result.filter(asset => asset.department === this.filters.department)
      }

      return result
    },
    paginatedAssets() {
      const start = (this.pagination.current_page - 1) * this.pagination.per_page
      const end = start + this.pagination.per_page
      return this.filteredAssets.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredAssets.length / this.pagination.per_page)
    },
    startIndex() {
      return (this.pagination.current_page - 1) * this.pagination.per_page
    },
    endIndex() {
      return this.startIndex + this.pagination.per_page
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.pagination.current_page
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    },
    summary() {
      const activeAssets = this.assets.filter(a => a.status === 'active')
      return {
        total_assets: activeAssets.length,
        total_cost: activeAssets.reduce((sum, a) => sum + a.cost, 0),
        total_depreciation: activeAssets.reduce((sum, a) => sum + a.accumulated_depreciation, 0),
        net_book_value: activeAssets.reduce((sum, a) => sum + a.net_book_value, 0)
      }
    },
    hasActiveFilters() {
      return this.filters.search || this.filters.asset_type || this.filters.status || this.filters.department
    }
  },
  methods: {
    async loadAssets() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // Assets are already loaded in data
        console.log('Loaded', this.assets.length, 'fixed assets')
      } finally {
        this.loading = false
      }
    },
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    getTypeLabel(type) {
      const labels = {
        building: 'Building',
        machinery: 'Machinery',
        vehicle: 'Vehicle',
        equipment: 'Equipment',
        furniture: 'Furniture'
      }
      return labels[type] || type
    },
    getTypeBadgeClass(type) {
      const classes = {
        building: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
        machinery: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
        vehicle: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        equipment: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        furniture: 'px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800'
      }
      return classes[type] || classes.equipment
    },
    getDepartmentLabel(department) {
      const labels = {
        production: 'Production',
        admin: 'Administration',
        sales: 'Sales'
      }
      return labels[department] || department
    },
    getStatusLabel(status) {
      const labels = {
        active: 'Active',
        disposed: 'Disposed',
        maintenance: 'Maintenance'
      }
      return labels[status] || status
    },
    getStatusBadgeClass(status) {
      const classes = {
        active: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        disposed: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
        maintenance: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'
      }
      return classes[status] || classes.active
    },
    clearFilters() {
      this.filters = {
        search: '',
        asset_type: '',
        status: '',
        department: ''
      }
      this.pagination.current_page = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== '...') {
        this.pagination.current_page = page
      }
    },
    viewAsset(asset) {
      this.$swal({
        icon: 'info',
        title: 'View Asset',
        html: `
          <div class="text-left">
            <p><strong>Asset Code:</strong> ${asset.asset_code}</p>
            <p><strong>Asset Name:</strong> ${asset.asset_name}</p>
            <p><strong>Type:</strong> ${this.getTypeLabel(asset.asset_type)}</p>
            <p><strong>Cost:</strong> ${this.formatCurrency(asset.cost)}</p>
            <p><strong>NBV:</strong> ${this.formatCurrency(asset.net_book_value)}</p>
          </div>
        `
      })
    },
    editAsset(asset) {
      this.$swal({
        icon: 'info',
        title: 'Edit Asset',
        text: `Edit ${asset.asset_name}`
      })
    },
    calculateDepreciation(asset) {
      this.$swal({
        icon: 'info',
        title: 'Calculate Depreciation',
        html: `
          <div class="text-left">
            <p><strong>Asset:</strong> ${asset.asset_name}</p>
            <p><strong>Method:</strong> Straight Line</p>
            <p><strong>Useful Life:</strong> ${asset.useful_life} years</p>
            <p><strong>Annual Depreciation:</strong> ${this.formatCurrency(asset.cost / asset.useful_life)}</p>
          </div>
        `
      })
    },
    disposeAsset(asset) {
      this.$swal({
        title: 'Dispose Asset?',
        text: `Are you sure you want to dispose ${asset.asset_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, dispose it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Dispose logic here
          this.$swal('Disposed!', 'Asset has been marked as disposed.', 'success')
        }
      })
    }
  },
  watch: {
    'filters.search': function() {
      this.pagination.current_page = 1
    },
    'filters.asset_type': function() {
      this.pagination.current_page = 1
    },
    'filters.status': function() {
      this.pagination.current_page = 1
    },
    'filters.department': function() {
      this.pagination.current_page = 1
    }
  },
  mounted() {
    this.loadAssets()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p class="mt-2 text-gray-600">Comprehensive reporting and data visualization</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="exportToPDF"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-file-pdf mr-2"></i>
              Export PDF
            </button>
            <button 
              @click="exportToExcel"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
            <button 
              @click="printReport"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-print mr-2"></i>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Report Controls -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Date Range Picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="filters.dateRange"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <!-- Custom Date From -->
          <div v-if="filters.dateRange === 'custom'">
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              v-model="filters.fromDate"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Custom Date To -->
          <div v-if="filters.dateRange === 'custom'">
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              v-model="filters.toDate"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              v-model="filters.category"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="accessories">Accessories</option>
              <option value="software">Software</option>
            </select>
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
            </select>
          </div>

          <!-- Report Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              v-model="selectedReportType"
              @change="loadReportData"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="overview">Overview</option>
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="performance">Performance Report</option>
            </select>
          </div>

          <!-- Refresh Button -->
          <div class="flex items-end">
            <button
              @click="refreshData"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-lg">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg">
            <div class="h-64 bg-gray-200 rounded"></div>
          </div>
          <div class="bg-white p-6 rounded-lg">
            <div class="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Report Content -->
      <div v-else>
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            v-for="kpi in kpiData" 
            :key="kpi.label"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center">
              <div :class="kpi.iconBg" class="p-3 rounded-lg">
                <i :class="kpi.icon" class="text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ kpi.label }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center">
              <span 
                :class="kpi.trend > 0 ? 'text-green-500' : 'text-red-500'"
                class="text-sm font-medium"
              >
                <i :class="kpi.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" class="mr-1"></i>
                {{ Math.abs(kpi.trend) }}%
              </span>
              <span class="text-gray-600 text-sm ml-1">{{ kpi.comparison }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Line Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div class="flex space-x-2">
                <button
                  v-for="period in ['7D', '1M', '3M', '1Y']"
                  :key="period"
                  @click="chartPeriod = period; updateChartData()"
                  :class="chartPeriod === period ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  {{ period }}
                </button>
              </div>
            </div>
            <div class="relative h-64">
              <!-- Placeholder for Chart.js or other charting library -->
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <i class="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Line Chart Placeholder</p>
                  <p class="text-sm text-gray-400">Integrate Chart.js or similar library</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Category Performance</h3>
              <button
                @click="toggleChartType"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <i class="fas fa-exchange-alt mr-1"></i>
                Switch View
              </button>
            </div>
            <div class="relative h-64">
              <!-- Placeholder for Bar Chart -->
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <i class="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Bar Chart Placeholder</p>
                  <p class="text-sm text-gray-400">Category comparison data</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Status Distribution</h3>
            </div>
            <div class="relative h-64">
              <!-- Placeholder for Pie Chart -->
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <i class="fas fa-chart-pie text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Pie Chart Placeholder</p>
                  <p class="text-sm text-gray-400">Status distribution data</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Area Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Growth Analysis</h3>
            </div>
            <div class="relative h-64">
              <!-- Placeholder for Area Chart -->
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <i class="fas fa-chart-area text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Area Chart Placeholder</p>
                  <p class="text-sm text-gray-400">Growth trend visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Detailed Report Data</h3>
              <div class="flex space-x-2">
                <button
                  @click="exportTableData('csv')"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <i class="fas fa-download mr-1"></i>
                  CSV
                </button>
                <button
                  @click="exportTableData('excel')"
                  class="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <i class="fas fa-file-excel mr-1"></i>
                  Excel
                </button>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    v-for="column in reportColumns"
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
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="item in paginatedReportData"
                  :key="item.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.code }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.category }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getStatusClass(item.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(item.revenue) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.units_sold }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(item.last_updated) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-sm text-gray-700">
                  Showing {{ startIndex }} to {{ endIndex }} of {{ reportData.length }} results
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <select
                  v-model="perPage"
                  @change="currentPage = 1"
                  class="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option :value="10">10 per page</option>
                  <option :value="25">25 per page</option>
                  <option :value="50">50 per page</option>
                </select>
                <div class="flex items-center space-x-1">
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
                </div>
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
  name: 'DummyReports',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Reports' }
      ],
      
      loading: true,
      selectedReportType: 'overview',
      chartPeriod: '1M',
      
      // Filters
      filters: {
        dateRange: 'month',
        fromDate: '',
        toDate: '',
        category: '',
        status: ''
      },
      
      // Data
      kpiData: [],
      reportData: [],
      
      // Pagination
      currentPage: 1,
      perPage: 25,
      
      // Sorting
      sortColumn: 'revenue',
      sortDirection: 'desc',
      
      // Table Configuration
      reportColumns: [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'units_sold', label: 'Units Sold' },
        { key: 'last_updated', label: 'Last Updated' }
      ]
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.reportData.length / this.perPage)
    },

    paginatedReportData() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.reportData.slice(start, end)
    },

    startIndex() {
      return (this.currentPage - 1) * this.perPage + 1
    },

    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.reportData.length)
    }
  },

  async mounted() {
    await this.loadReportData()
  },

  methods: {
    async loadReportData() {
      try {
        this.loading = true
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock KPI data
        this.kpiData = [
          {
            label: 'Total Revenue',
            value: '$2,547,830',
            trend: 15.3,
            comparison: 'vs last month',
            icon: 'fas fa-dollar-sign text-green-600',
            iconBg: 'bg-green-100'
          },
          {
            label: 'Units Sold',
            value: '12,847',
            trend: 8.2,
            comparison: 'vs last month',
            icon: 'fas fa-shopping-cart text-blue-600',
            iconBg: 'bg-blue-100'
          },
          {
            label: 'Active Items',
            value: '1,247',
            trend: -2.1,
            comparison: 'vs last month',
            icon: 'fas fa-cube text-purple-600',
            iconBg: 'bg-purple-100'
          },
          {
            label: 'Conversion Rate',
            value: '3.24%',
            trend: 12.8,
            comparison: 'vs last month',
            icon: 'fas fa-percentage text-orange-600',
            iconBg: 'bg-orange-100'
          }
        ]

        // Mock report data
        this.reportData = Array.from({ length: 127 }, (_, index) => ({
          id: index + 1,
          name: `Item ${index + 1}`,
          code: `ITM-${String(index + 1).padStart(3, '0')}`,
          category: ['Electronics', 'Accessories', 'Software'][Math.floor(Math.random() * 3)],
          status: ['active', 'pending', 'inactive'][Math.floor(Math.random() * 3)],
          revenue: Math.floor(Math.random() * 50000) + 1000,
          units_sold: Math.floor(Math.random() * 500) + 10,
          last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }))
        
        this.sortReportData()
        
      } catch (error) {
        console.error('Error loading report data:', error)
      } finally {
        this.loading = false
      }
    },

    applyFilters() {
      console.log('Apply filters:', this.filters)
      this.loadReportData()
    },

    refreshData() {
      console.log('Refresh report data')
      this.loadReportData()
    },

    updateChartData() {
      console.log('Update chart data for period:', this.chartPeriod)
      // Update chart data based on selected period
    },

    toggleChartType() {
      console.log('Toggle chart type')
      // Switch between different chart visualizations
    },

    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
      this.sortReportData()
    },

    sortReportData() {
      this.reportData.sort((a, b) => {
        let aVal = a[this.sortColumn]
        let bVal = b[this.sortColumn]
        
        if (this.sortColumn === 'last_updated') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
    },

    // Export functions
    exportToPDF() {
      console.log('Export report to PDF')
      alert('PDF export functionality - integrate with jsPDF or similar library')
    },

    exportToExcel() {
      console.log('Export report to Excel')
      alert('Excel export functionality - integrate with SheetJS or similar library')
    },

    exportTableData(format) {
      console.log(`Export table data to ${format}`)
      alert(`${format.toUpperCase()} export functionality`)
    },

    printReport() {
      console.log('Print report')
      window.print()
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
        inactive: 'bg-gray-100 text-gray-800'
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

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .bg-gray-50 {
    background-color: white !important;
  }
  
  .shadow-sm {
    box-shadow: none !important;
  }
  
  .border-gray-200 {
    border-color: #000 !important;
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
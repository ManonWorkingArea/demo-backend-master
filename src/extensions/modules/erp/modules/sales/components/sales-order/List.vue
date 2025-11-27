<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales Order (Approved)</h1>
            <p class="mt-2 text-gray-600">ใบสั่งซื้อที่อนุมัติแล้ว พร้อมเข้า Production</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="$router.push('/sales/sales-order/create')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้างเอกสารการขาย
            </button>
            <button 
              @click="debugStats"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-bug mr-2"></i>
              Debug
            </button>
            <button 
              @click="refreshData"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <!-- Breadcrumb -->
    <ErpBreadcrumb :nav="breadcrumbNav" />    <!-- Filters & Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาด้วยหมายเลข SO หรือชื่อลูกค้า..."
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
              v-model="statusFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="in_production">กำลังผลิต</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>

          <!-- Production Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Production</label>
            <select 
              v-model="productionFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสถานะการผลิต</option>
              <option value="pending">รอเข้าผลิต</option>
              <option value="in_progress">กำลังผลิต</option>
              <option value="completed">ผลิตเสร็จ</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredSales.length }} sales orders found</span>
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

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-cogs text-blue-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">พร้อม Production</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-play-circle text-yellow-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">กำลังผลิต</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.inProduction }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-check-double text-green-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">เสร็จสิ้น</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.completed }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-chart-line text-purple-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">มูลค่ารวม</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Orders Grid/List View -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="sales.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="w-24 h-24 mx-auto mb-6">
          <i class="fas fa-shopping-cart text-6xl text-gray-300"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มี Sales Order ในระบบ</h3>
        <p class="text-gray-600 mb-6">เริ่มต้นด้วยการสร้าง Sales Order แรกของคุณ</p>
        <button 
          @click="$router.push('/sales/sales-order/create')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>
          สร้าง Sales Order
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="order in filteredSales" 
          :key="order.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
          @click="handleView(order)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-500">{{ order.customerName }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="relative">
                <button 
                  @click.stop="toggleDropdown(order.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div 
                  v-if="dropdownOpen === order.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button 
                      @click="handleEdit(order)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-edit mr-2"></i>แก้ไข
                    </button>
                    <button 
                      @click="printOrder(order)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-print mr-2"></i>พิมพ์
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDate(order.orderDate) }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-list mr-2"></i>
              {{ order.items?.length || 0 }} รายการ
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span 
              :class="getStatusClass(order.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(order.status) }}
            </span>
            <span class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(order.totalAmount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หมายเลข SO
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลูกค้า
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รายการ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดรวม
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="order in filteredSales" 
              :key="order.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="handleView(order)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">{{ order.orderNumber }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ order.customerPhone }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(order.orderDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.items?.length || 0 }} รายการ
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatCurrency(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(order.status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click.stop="handleEdit(order)"
                    class="text-blue-600 hover:text-blue-900"
                    title="แก้ไข"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click.stop="printOrder(order)"
                    class="text-gray-600 hover:text-gray-900"
                    title="พิมพ์"
                  >
                    <i class="fas fa-print"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { salesService } from '@/services/SalesService.js'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'SalesOrderList',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    
    // Reactive State
    const sales = ref([])
    const loading = ref(false)
    const viewMode = ref('grid') // 'grid' or 'list'
    const searchQuery = ref('')
    const statusFilter = ref('')
    const productionFilter = ref('')
    const dropdownOpen = ref(null)
    const searchTimeout = ref(null)

    // Breadcrumb
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Sales Orders', path: '/sales/sales-order', icon: 'fas fa-file-invoice' }
    ])

    // Computed Properties
    const filteredSales = computed(() => {
      let filtered = [...sales.value]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(sale =>
          sale.orderNumber?.toLowerCase().includes(query) ||
          sale.customerName?.toLowerCase().includes(query) ||
          sale.customerPhone?.includes(query)
        )
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(sale => sale.status === statusFilter.value)
      }

      // Production status filter  
      if (productionFilter.value) {
        filtered = filtered.filter(sale => sale.productionStatus === productionFilter.value)
      }

      return filtered
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || statusFilter.value || productionFilter.value
    })

    // Computed Stats  
    const stats = computed(() => {
      try {
        // Use all loaded sales orders data (already filtered by status in loadSales)
        const salesArray = Array.isArray(sales.value) ? sales.value : []
        console.log('📊 Computing stats for sales orders:', salesArray)
        
        // Count by production status
        const approved = salesArray.filter(s => {
          return (s.status === 'confirmed' || s.status === 'approved') && 
                 (!s.productionStatus || s.productionStatus === 'pending')
        }).length
        
        const inProduction = salesArray.filter(s => {
          return s.productionStatus === 'in_progress' || s.productionStatus === 'manufacturing'
        }).length
        
        const completed = salesArray.filter(s => {
          return s.productionStatus === 'completed' || s.status === 'completed'
        }).length
        
        // Calculate total value of approved orders
        const totalValue = salesArray.reduce((sum, s) => {
          const amount = Number(s.totalAmount) || 0
          return sum + amount
        }, 0)
        
        const result = {
          approved,
          inProduction,
          completed,
          totalValue
        }
        
        console.log('📊 Final stats:', result)
        return result
        
      } catch (error) {
        console.error('❌ Error computing sales stats:', error)
        return {
          quoted: 0,
          confirmed: 0,
          pendingDelivery: 0,
          todaySales: 0
        }
      }
    })

    // Load sales data - เอกสารที่มี status เป็น approved, in_production, completed
    const loadSales = async () => {
      loading.value = true
      try {
        console.log('🔄 Loading sales order data via SalesService (approved + production)...')
        
        // Initialize service if not ready
        if (!salesService.isReady()) {
          const app = getCurrentInstance()
          if (app) {
            salesService.initialize(app.appContext.config.globalProperties)
          } else {
            console.error('❌ Cannot initialize SalesService - no Vue app context')
            throw new Error('SalesService initialization failed')
          }
        }
        
        // Load sales orders using SalesService
        const resultArray = await salesService.getAllSalesOrders()
        console.log('📦 Raw sales result via SalesService:', resultArray)
        
        // Filter for sales orders by status (confirmed, approved, in_production, completed)
        sales.value = Array.isArray(resultArray) ? resultArray.filter(item => 
          item.status === 'confirmed' || 
          item.status === 'approved' || 
          item.status === 'in_production' || 
          item.status === 'completed'
        ) : []
        
        console.log('✅ Processed sales orders via SalesService:', sales.value.length)
        console.log('🔍 Available statuses in data:', [...new Set(resultArray.map(item => item.status))])
        
        // Debug mapping
        sales.value.forEach((order, index) => {
          console.log(`📋 Sales Order ${index + 1}:`, {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            status: order.status,
            totalAmount: order.totalAmount
          })
        })
        
      } catch (error) {
        console.error('❌ Error loading sales via SalesService:', error)
        sales.value = []
      } finally {
        loading.value = false
      }
    }

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return dateString
      }
    }

    // Get status class
    const getStatusClass = (status) => {
      const statusClasses = {
        'draft': 'bg-blue-100 text-blue-800',
        'quoted': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-green-100 text-green-800',
        'shipped': 'bg-purple-100 text-purple-800',
        'delivered': 'bg-indigo-100 text-indigo-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-blue-100 text-blue-800'
    }

    // Search & Filter Methods
    const debouncedSearch = () => {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = setTimeout(() => {
        // Trigger reactive update
      }, 300)
    }

    const applyFilters = () => {
      // Filters are reactive, so this is mainly for UI feedback
    }

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      productionFilter.value = ''
    }

    // UI Methods
    const toggleDropdown = (saleId) => {
      dropdownOpen.value = dropdownOpen.value === saleId ? null : saleId
    }

    // Get status text
    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'quoted': 'เสนอราคา',
        'confirmed': 'ยืนยันแล้ว',
        'shipped': 'จัดส่งแล้ว',
        'delivered': 'ส่งมอบแล้ว',
        'completed': 'สำเร็จ',
        'cancelled': 'ยกเลิก'
      }
      return statusTexts[status] || status
    }

    // Debug stats
    const debugStats = () => {
      console.log('🔍 === SALES ORDER DEBUG INFO ===')
      console.log('Raw sales data:', sales.value)
      console.log('Current stats:', stats.value)
      console.log('Today date string:', new Date().toDateString())
      
      alert('Debug info logged to console. กด F12 เพื่อดู console')
    }

    // Refresh data
    const refreshData = () => {
      loadSales()
    }

    // Handle view order detail
    const handleView = (order) => {
      router.push(`/sales/sales-order/${order.id}`)
    }

    // Handle edit order
    const handleEdit = (order) => {
      router.push(`/sales/sales-order/${order.id}/edit`)
    }

    // Print order
    const printOrder = (order) => {
      router.push(`/sales/sales-order/${order.id}/print`)
    }

    // Initialize
    onMounted(() => {
      loadSales()
    })

    return {
      // Data
      sales,
      loading,
      viewMode,
      searchQuery,
      statusFilter,
      productionFilter,
      dropdownOpen,
      breadcrumbNav,
      
      // Computed
      stats,
      filteredSales,
      hasActiveFilters,
      
      // Methods
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      debugStats,
      refreshData,
      handleView,
      handleEdit,
      printOrder,
      debouncedSearch,
      applyFilters,
      clearFilters,
      toggleDropdown
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
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales Invoice</h1>
            <p class="mt-2 text-gray-600">ใบแจ้งหนี้ขาย - จัดการการออกบิลและยืนยันชำระเงิน</p>
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
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/sales/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Sales Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Sales Invoice</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Filters & Search -->
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
              <option value="confirmed">ลูกค้ายืนยันแล้ว</option>
            </select>
          </div>

          <!-- Due Date Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <select 
              v-model="dueDateFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกกำหนดชำระ</option>
              <option value="today">ครบกำหนดวันนี้</option>
              <option value="week">ครบกำหนดสัปดาห์นี้</option>
              <option value="overdue">เกินกำหนดแล้ว</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredInvoices?.length || 0 }} invoices found</span>
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
                <i class="fas fa-file-invoice text-blue-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">รอชำระเงิน</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.confirmed }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-chart-line text-green-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">มูลค่ารวม</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar-day text-yellow-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">วันนี้</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.todayCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-list text-purple-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">รวมทั้งหมด</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
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
      <div v-else-if="invoices.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="w-24 h-24 mx-auto mb-6">
          <i class="fas fa-file-invoice text-6xl text-gray-300"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">ไม่มี Sales Invoice</h3>
        <p class="text-gray-600 mb-6">ยังไม่มีใบแจ้งหนี้ขายในระบบ<br>เริ่มต้นด้วยการสร้างเอกสารการขายใหม่</p>
        <button 
          @click="$router.push('/sales/sales-order/create')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>
          สร้างเอกสารการขาย
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-if="filteredInvoices && filteredInvoices.length > 0">
          <div 
            v-for="invoice in filteredInvoices" 
            :key="invoice.id"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
            @click="viewInvoice(invoice.id)"
          >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ invoice.orderNumber }}</h3>
              <p class="text-sm text-gray-500">{{ invoice.customerName }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="relative">
                <button 
                  @click.stop="toggleDropdown(invoice.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div 
                  v-if="dropdownOpen === invoice.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button 
                      @click="viewInvoice(invoice.id)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-eye mr-2"></i>ดูรายละเอียด
                    </button>
                    <button 
                      v-if="invoice.status === 'confirmed'"
                      @click="confirmPayment(invoice)"
                      class="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <i class="fas fa-credit-card mr-2"></i>ยืนยันชำระเงิน
                    </button>
                    <button 
                      @click="printOrder(invoice)"
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
              {{ formatDate(invoice.orderDate) }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-clock mr-2"></i>
              กำหนดชำระ: {{ formatDate(invoice.dueDate) }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-list mr-2"></i>
              {{ invoice.items?.length || 0 }} รายการ
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span 
              :class="getStatusClass(invoice.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(invoice.status) }}
            </span>
            <span class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(invoice.totalAmount) }}
            </span>
          </div>
        </div>
        </template>
        
        <!-- Grid Empty State -->
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-12">
            <i class="fas fa-file-invoice text-4xl text-gray-400 mb-4"></i>
            <p class="text-lg font-medium text-gray-500">ไม่มีใบแจ้งหนี้</p>
            <p class="text-sm text-gray-400">ยังไม่มีใบแจ้งหนี้ที่รอการชำระเงิน</p>
          </div>
        </template>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เลขที่
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลูกค้า
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                กำหนดชำระ
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
            <template v-if="filteredInvoices && filteredInvoices.length > 0">
              <tr 
                v-for="invoice in filteredInvoices" 
                :key="invoice.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="viewInvoice(invoice.id)"
              >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">{{ invoice.orderNumber }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ invoice.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ invoice.customerPhone }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.orderDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatCurrency(invoice.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(invoice.status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click.stop="viewInvoice(invoice.id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="ดูรายละเอียด"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="invoice.status === 'confirmed'"
                    @click.stop="confirmPayment(invoice)"
                    class="text-green-600 hover:text-green-900"
                    title="ยืนยันชำระเงิน"
                  >
                    <i class="fas fa-credit-card"></i>
                  </button>
                  <button 
                    @click.stop="printOrder(invoice)"
                    class="text-gray-600 hover:text-gray-900"
                    title="พิมพ์"
                  >
                    <i class="fas fa-print"></i>
                  </button>
                </div>
              </td>
            </tr>
            </template>
            
            <!-- Empty State -->
            <template v-else>
              <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="text-gray-500">
                    <i class="fas fa-file-invoice text-4xl mb-4"></i>
                    <p class="text-lg font-medium">ไม่มีใบแจ้งหนี้</p>
                    <p class="text-sm">ยังไม่มีใบแจ้งหนี้ที่รอการชำระเงิน</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'

export default {
  name: 'SalesInvoiceList',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine()
    
    // Reactive State
    const invoices = ref([])
    const loading = ref(false)
    const viewMode = ref('grid') // 'grid' or 'list'
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dueDateFilter = ref('')
    const dropdownOpen = ref(null)
    const searchTimeout = ref(null)

    // Computed Properties
    const filteredInvoices = computed(() => {
      // Ensure invoices is always an array
      const invoicesArray = Array.isArray(invoices.value) ? invoices.value : []
      let filtered = [...invoicesArray]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(invoice =>
          invoice.orderNumber?.toLowerCase().includes(query) ||
          invoice.customerName?.toLowerCase().includes(query) ||
          invoice.customerPhone?.includes(query)
        )
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(invoice => invoice.status === statusFilter.value)
      }

      // Due date filter
      if (dueDateFilter.value) {
        // Add due date filtering logic here
      }

      return filtered
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || statusFilter.value || dueDateFilter.value
    })

    // Computed Stats  
    const stats = computed(() => {
      try {
        // Use all loaded invoices data (already filtered by status in loadInvoices)
        const invoicesArray = Array.isArray(invoices.value) ? invoices.value : []
        console.log('📊 Computing stats for invoices:', invoicesArray)
        
        // Count by status
        const confirmed = invoicesArray.filter(i => {
          return i.status === 'confirmed'
        }).length
        
        // Calculate total value of confirmed invoices
        const totalValue = invoicesArray.reduce((sum, i) => {
          const amount = Number(i.totalAmount) || 0
          return sum + amount
        }, 0)
        
        // Count today's invoices
        const today = new Date().toDateString()
        const todayCount = invoicesArray.filter(i => {
          const itemDate = new Date(i.orderDate || i.updatedAt).toDateString()
          return itemDate === today
        }).length
        
        const total = invoicesArray.length
        
        const result = {
          confirmed,
          totalValue,
          todayCount,
          total
        }
        
        console.log('📊 Final invoice stats:', result)
        return result
        
      } catch (error) {
        console.error('❌ Error computing invoice stats:', error)
        return {
          confirmed: 0,
          totalValue: 0,
          todayCount: 0,
          total: 0
        }
      }
    })

    // Load invoices data - เอกสารที่มี status เป็น confirmed
    const loadInvoices = async () => {
      loading.value = true
      try {
        console.log('🔄 Loading sales invoice data (confirmed)...')
        
        // Initialize invoices as empty array first
        invoices.value = []
        
        const result = await engine.list(TRANSACTION_TYPES.SALES)
        console.log('📦 Raw sales result:', result)
        
        // Extract data from response object with safety checks
        const resultData = result?.data || []
        const resultArray = Array.isArray(resultData) ? resultData : []
        
        // Filter for sales invoices by status (confirmed only)
        invoices.value = resultArray.filter(item => 
          item && item.status === 'confirmed'
        )
        
        console.log('✅ Processed sales invoices:', invoices.value)
        console.log('🔍 Available statuses in data:', [...new Set(resultArray.map(item => item?.status).filter(Boolean))])
        
      } catch (error) {
        console.error('❌ Error loading invoices:', error)
        // Ensure invoices is always an array
        invoices.value = []
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
      dueDateFilter.value = ''
    }

    // UI Methods
    const toggleDropdown = (invoiceId) => {
      dropdownOpen.value = dropdownOpen.value === invoiceId ? null : invoiceId
    }

    // Get status text
    const getStatusText = (status) => {
      const statusTexts = {
        'confirmed': 'ลูกค้ายืนยันแล้ว',
        'paid': 'ชำระเงินแล้ว'
      }
      return statusTexts[status] || status
    }

    // Debug stats
    const debugStats = () => {
      console.log('🔍 === SALES INVOICE DEBUG INFO ===')
      console.log('Raw invoice data:', invoices.value)
      console.log('Current stats:', stats.value)
      
      alert('Debug info logged to console. กด F12 เพื่อดู console')
    }

    // Refresh data
    const refreshData = () => {
      loadInvoices()
    }

    // Handle view invoice detail
    const viewInvoice = (id) => {
      router.push(`/sales/sales-order/${id}`)
    }

    // Print invoice
    const printOrder = (invoice) => {
      router.push(`/sales/sales-order/${invoice.id}/print`)
    }

    // Confirm payment function
    const confirmPayment = async (invoice) => {
      try {
        if (!confirm(`ยืนยันการชำระเงินสำหรับ ${invoice.orderNumber} หรือไม่?`)) {
          return
        }

        console.log('💳 Confirming payment for:', invoice.orderNumber)
        
        // Update status to approved
        const updateData = {
          ...invoice,
          status: 'approved',
          paymentStatus: 'paid',
          updatedAt: new Date().toISOString()
        }

        const result = await engine.update(TRANSACTION_TYPES.SALES, invoice.id, updateData)
        
        if (result?.success) {
          console.log('✅ Payment confirmed successfully')
          alert('ยืนยันการชำระเงินสำเร็จ! เอกสารจะแสดงใน Sales Order List')
          
          // Refresh data to remove confirmed item from invoice list
          loadInvoices()
        } else {
          throw new Error(result?.error || 'Failed to confirm payment')
        }
      } catch (error) {
        console.error('❌ Error confirming payment:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      }
    }

    // Initialize
    onMounted(() => {
      loadInvoices()
    })

    return {
      // Data
      invoices,
      loading,
      viewMode,
      searchQuery,
      statusFilter,
      dueDateFilter,
      dropdownOpen,
      
      // Computed
      stats,
      filteredInvoices,
      hasActiveFilters,
      
      // Methods
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      debugStats,
      refreshData,
      viewInvoice,
      confirmPayment,
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
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p class="mt-2 text-gray-600">จัดการรายการใบแจ้งหนี้ทั้งหมด</p>
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
              @click="refreshData"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
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
            <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="เลขที่ Invoice, Quotation, ชื่อลูกค้า..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedSearch"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select
              v-model="filterStatus"
              @change="handleSearch"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending_payment">รอชำระเงิน</option>
              <option value="paid">ชำระเงินแล้ว</option>
              <option value="overdue">เกินกำหนด</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>

          <!-- Payment Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">การชำระเงิน</label>
            <select
              v-model="filterPaymentStatus"
              @change="handleSearch"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">ยังไม่ชำระ</option>
              <option value="partial">ชำระบางส่วน</option>
              <option value="paid">ชำระครบ</option>
              <option value="overdue">เกินกำหนด</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredInvoices.length }} invoices found</span>
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
      <div v-if="selectedInvoices.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-blue-800 font-medium">
            {{ selectedInvoices.length }} invoice{{ selectedInvoices.length > 1 ? 's' : '' }} selected
          </span>
          <div class="flex space-x-2">
            <button 
              @click="bulkPrint"
              class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              <i class="fas fa-print mr-1"></i>
              Print All
            </button>
            <button 
              @click="bulkExport"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              <i class="fas fa-download mr-1"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i class="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
        <p class="text-red-800 font-medium">{{ error }}</p>
        <button 
          @click="loadInvoices" 
          class="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
        >
          ลองอีกครั้ง
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredInvoices.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-file-invoice text-gray-300 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">ไม่มีข้อมูล Invoice</h3>
        <p class="text-gray-500">{{ searchQuery ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มี Invoice ในระบบ' }}</p>
      </div>

      <!-- Content Area -->
      <div v-else>
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="invoice in paginatedInvoices" 
            :key="invoice._id"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
            @click="handleView(invoice._id)"
          >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ invoice.invoice_number }}</h3>
              <p class="text-sm text-gray-500">{{ invoice.customerName || `Customer ID: ${invoice.customer_id}` }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                :checked="selectedInvoices.includes(invoice._id)"
                @change="toggleInvoiceSelection(invoice._id)"
                @click.stop
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div class="relative">
                <button 
                  @click.stop="toggleDropdown(invoice._id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div 
                  v-if="dropdownOpen === invoice._id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button 
                      @click="handleView(invoice._id)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-eye mr-2"></i>View Details
                    </button>
                    <button 
                      @click="handlePrint(invoice._id)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-print mr-2"></i>Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600">
              <i class="fas fa-calendar mr-2"></i>
              {{ formatDate(invoice.invoice_date) }}
            </p>
            <p v-if="invoice.quotation_number" class="text-sm text-purple-600">
              <i class="fas fa-link mr-2"></i>
              {{ invoice.quotation_number }}
            </p>
            <p v-if="invoice.due_date" class="text-xs text-gray-500">
              <i class="fas fa-clock mr-1"></i>
              ครบกำหนด: {{ formatDate(invoice.due_date) }}
            </p>
          </div>

          <div class="flex items-center justify-between mb-3">
            <span 
              :class="getStatusClass(invoice.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(invoice.status) }}
            </span>
            <span 
              :class="getPaymentStatusClass(invoice.payment_status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getPaymentStatusText(invoice.payment_status) }}
            </span>
          </div>

          <div class="pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">ยอดรวม</span>
              <span class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(invoice.total_amount) }}
              </span>
            </div>
          </div>
        </div>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allInvoicesSelected"
                  @change="toggleAllInvoices"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เลขที่ Invoice
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลูกค้า
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อ้างอิง
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดรวม
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                การชำระเงิน
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="invoice in paginatedInvoices" 
              :key="invoice._id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="handleView(invoice._id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="selectedInvoices.includes(invoice._id)"
                  @change="toggleInvoiceSelection(invoice._id)"
                  @click.stop
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ invoice.invoice_number }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ invoice.customerName || `Customer ID: ${invoice.customer_id}` }}</div>
                <div v-if="invoice.customerPhone" class="text-xs text-gray-500">{{ invoice.customerPhone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="invoice.quotation_number" class="text-xs text-purple-600">
                  <i class="fas fa-link mr-1"></i>{{ invoice.quotation_number }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(invoice.invoice_date) }}</div>
                <div v-if="invoice.due_date" class="text-xs text-gray-500">ครบกำหนด: {{ formatDate(invoice.due_date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(invoice.total_amount) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span 
                  :class="getStatusClass(invoice.status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span 
                  :class="getPaymentStatusClass(invoice.payment_status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getPaymentStatusText(invoice.payment_status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click.stop="handleView(invoice._id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="ดูรายละเอียด"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click.stop="handlePrint(invoice._id)"
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm mt-6">
        <div class="text-sm text-gray-500">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} 
          of {{ filteredInvoices.length }} results
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

      <!-- Summary -->
      <div v-if="filteredInvoices.length > 0" class="bg-white rounded-lg shadow-sm px-6 py-4 mt-6">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-700">
            แสดง <span class="font-medium">{{ filteredInvoices.length }}</span> รายการ
          </p>
          <div class="text-sm text-gray-700">
            ยอดรวมทั้งหมด: <span class="font-bold text-blue-600">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'InvoiceList',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    const salesService = inject('salesService')
    
    // Breadcrumb navigation
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Invoices', path: '/sales/invoice', icon: 'fas fa-file-invoice-dollar' }
    ])
    
    const invoices = ref([])
    const loading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const filterStatus = ref('')
    const filterPaymentStatus = ref('')
    const viewMode = ref('list') // 'grid' or 'list'
    const selectedInvoices = ref([])
    const dropdownOpen = ref(null)
    const searchTimeout = ref(null)
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    
    const loadInvoices = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log('🔄 [Invoice List] Loading invoices...')
        
        let result
        if (salesService && salesService.getAllSalesInvoices) {
          result = await salesService.getAllSalesInvoices()
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getAllSalesInvoices()
        }
        
        invoices.value = result || []
        console.log('✅ [Invoice List] Loaded invoices:', invoices.value.length)
      } catch (err) {
        console.error('❌ [Invoice List] Error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    const filteredInvoices = computed(() => {
      let result = invoices.value
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(invoice => 
          invoice.invoice_number?.toLowerCase().includes(query) ||
          invoice.quotation_number?.toLowerCase().includes(query) ||
          invoice.customerName?.toLowerCase().includes(query) ||
          invoice.customerPhone?.includes(query) ||
          invoice.customer_id?.toLowerCase().includes(query)
        )
      }
      
      // Filter by status
      if (filterStatus.value) {
        result = result.filter(invoice => invoice.status === filterStatus.value)
      }
      
      // Filter by payment status
      if (filterPaymentStatus.value) {
        result = result.filter(invoice => invoice.payment_status === filterPaymentStatus.value)
      }
      
      return result
    })
    
    const totalAmount = computed(() => {
      return filteredInvoices.value.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0)
    })
    
    const paginatedInvoices = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredInvoices.value.slice(start, end)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredInvoices.value.length / itemsPerPage.value)
    })
    
    const visiblePages = computed(() => {
      const current = currentPage.value
      const total = totalPages.value
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
    })
    
    const hasActiveFilters = computed(() => {
      return searchQuery.value || filterStatus.value || filterPaymentStatus.value
    })
    
    const allInvoicesSelected = computed(() => {
      return paginatedInvoices.value.length > 0 && 
             paginatedInvoices.value.every(invoice => selectedInvoices.value.includes(invoice._id))
    })
    
    const debouncedSearch = () => {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
        handleSearch()
      }, 300)
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filterStatus.value = ''
      filterPaymentStatus.value = ''
      currentPage.value = 1
    }
    
    const toggleInvoiceSelection = (invoiceId) => {
      const index = selectedInvoices.value.indexOf(invoiceId)
      if (index > -1) {
        selectedInvoices.value.splice(index, 1)
      } else {
        selectedInvoices.value.push(invoiceId)
      }
    }
    
    const toggleAllInvoices = () => {
      if (allInvoicesSelected.value) {
        paginatedInvoices.value.forEach(invoice => {
          const index = selectedInvoices.value.indexOf(invoice._id)
          if (index > -1) {
            selectedInvoices.value.splice(index, 1)
          }
        })
      } else {
        paginatedInvoices.value.forEach(invoice => {
          if (!selectedInvoices.value.includes(invoice._id)) {
            selectedInvoices.value.push(invoice._id)
          }
        })
      }
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const toggleDropdown = (invoiceId) => {
      dropdownOpen.value = dropdownOpen.value === invoiceId ? null : invoiceId
    }
    
    const bulkPrint = () => {
      console.log('Bulk print:', selectedInvoices.value)
      alert(`พิมพ์ ${selectedInvoices.value.length} ใบแจ้งหนี้`)
    }
    
    const bulkExport = () => {
      console.log('Bulk export:', selectedInvoices.value)
      alert(`ส่งออก ${selectedInvoices.value.length} ใบแจ้งหนี้`)
    }
    
    const exportData = () => {
      console.log('Export all data')
      alert('ส่งออกข้อมูลทั้งหมด')
    }
    
    const refreshData = () => {
      loadInvoices()
    }
    
    const handleSearch = () => {
      // Trigger computed property update
    }
    
    const handleView = (id) => {
      router.push(`/sales/invoice/${id}`)
    }
    
    const handlePrint = (id) => {
      router.push(`/sales/invoice/${id}/print`)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return dateString
      }
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        'pending_payment': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'overdue': 'bg-red-100 text-red-800',
        'cancelled': 'bg-gray-100 text-gray-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusText = (status) => {
      const statusTexts = {
        'pending_payment': 'รอชำระเงิน',
        'paid': 'ชำระแล้ว',
        'overdue': 'เกินกำหนด',
        'cancelled': 'ยกเลิก'
      }
      return statusTexts[status] || status
    }
    
    const getPaymentStatusClass = (paymentStatus) => {
      const statusClasses = {
        'pending': 'bg-orange-100 text-orange-800',
        'partial': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'overdue': 'bg-red-100 text-red-800'
      }
      return statusClasses[paymentStatus] || 'bg-gray-100 text-gray-800'
    }
    
    const getPaymentStatusText = (paymentStatus) => {
      const statusTexts = {
        'pending': 'ยังไม่ชำระ',
        'partial': 'บางส่วน',
        'paid': 'ชำระครบ',
        'overdue': 'เกินกำหนด'
      }
      return statusTexts[paymentStatus] || paymentStatus
    }
    
    onMounted(() => {
      loadInvoices()
    })
    
    return {
      // Data
      invoices,
      loading,
      error,
      searchQuery,
      filterStatus,
      filterPaymentStatus,
      viewMode,
      selectedInvoices,
      dropdownOpen,
      currentPage,
      itemsPerPage,
      breadcrumbNav,
      
      // Computed
      filteredInvoices,
      totalAmount,
      paginatedInvoices,
      totalPages,
      visiblePages,
      hasActiveFilters,
      allInvoicesSelected,
      
      // Methods
      loadInvoices,
      handleSearch,
      handleView,
      handlePrint,
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      getPaymentStatusClass,
      getPaymentStatusText,
      debouncedSearch,
      clearFilters,
      toggleInvoiceSelection,
      toggleAllInvoices,
      goToPage,
      toggleDropdown,
      bulkPrint,
      bulkExport,
      exportData,
      refreshData
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

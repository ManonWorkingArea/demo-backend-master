<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Quotation</h1>
            <p class="mt-2 text-gray-600">ใบเสนอราคา - จัดการใบเสนอราคาและแปลงเป็น Sales Order</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="$router.push('/sales/quotations/create')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้างใบเสนอราคา
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
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาด้วยหมายเลข QT หรือชื่อลูกค้า..."
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
              <option value="draft">ร่าง</option>
              <option value="quoted">เสนอราคาแล้ว</option>
            </select>
          </div>

          <!-- Date Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select 
              v-model="dateFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredQuotations.length }} quotations found</span>
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
                <i class="fas fa-file-alt text-blue-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">ร่าง (Draft)</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.draft }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-file-invoice text-green-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">เสนอราคาแล้ว</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.quoted }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-arrow-right text-purple-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">แปลงเป็น SO</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.convertedToSO }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-chart-line text-indigo-600"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 truncate">มูลค่ารวม</p>
              <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quotations Grid/List View -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="quotations.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="w-24 h-24 mx-auto mb-6">
          <i class="fas fa-file-contract text-6xl text-gray-300"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มี Quotation ในระบบ</h3>
        <p class="text-gray-600 mb-6">เริ่มต้นด้วยการสร้าง Quotation แรกของคุณ</p>
        <button 
          @click="$router.push('/sales/quotations/create')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>
          สร้าง Quotation
        </button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="quotation in filteredQuotations" 
          :key="quotation.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
          @click="handleView(quotation)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ quotation.quote_number || quotation.orderNumber || 'N/A' }}</h3>
              <p class="text-sm text-gray-500">
                {{ quotation.customerName || `Customer ID: ${quotation.customer_id || 'N/A'}` }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="relative">
                <button 
                  @click.stop="toggleDropdown(quotation.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div 
                  v-if="dropdownOpen === quotation.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div class="py-1">
                    <button 
                      @click="handleEdit(quotation)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-edit mr-2"></i>แก้ไข
                    </button>
                    <button 
                      @click="convertToSO(quotation)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i class="fas fa-exchange-alt mr-2"></i>แปลงเป็น SO
                    </button>
                    <button 
                      @click="printQuotation(quotation)"
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
              {{ formatDate(quotation.quotation_date || quotation.orderDate) }}
            </p>
            <p v-if="quotation.customerPhone" class="text-sm text-gray-600">
              <i class="fas fa-phone mr-2"></i>
              {{ quotation.customerPhone }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span 
              :class="getStatusClass(quotation.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(quotation.status) }}
            </span>
            <span class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(quotation.total_amount) }}
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
                หมายเลข QT
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลูกค้า
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันหมดอายุ
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
              v-for="quotation in filteredQuotations" 
              :key="quotation.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="handleView(quotation)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">{{ quotation.quote_number || quotation.orderNumber || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ quotation.customerName || `Customer ID: ${quotation.customer_id}` }}
                  </div>
                  <div class="text-sm text-gray-500">{{ quotation.customerPhone || '-' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(quotation.quotation_date || quotation.orderDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(quotation.expiry_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatCurrency(quotation.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(quotation.status)"
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(quotation.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click.stop="handleEdit(quotation)"
                    class="text-blue-600 hover:text-blue-900"
                    title="แก้ไข"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click.stop="convertToSO(quotation)"
                    class="text-green-600 hover:text-green-900"
                    title="แปลงเป็น Sales Order"
                  >
                    <i class="fas fa-exchange-alt"></i>
                  </button>
                  <button 
                    @click.stop="printQuotation(quotation)"
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
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'QuotationList',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    
    // ✅ Inject SalesService
    const salesService = inject('salesService')
    
    // Reactive State
    const quotations = ref([])
    const loading = ref(false)
    const viewMode = ref('grid') // 'grid' or 'list'
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dateFilter = ref('')
    const dropdownOpen = ref(null)
    const searchTimeout = ref(null)

    // Breadcrumb
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Quotations', path: '/sales/quotation', icon: 'fas fa-file-alt' }
    ])

    // Computed Properties
    const filteredQuotations = computed(() => {
      let filtered = [...quotations.value]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(quotation =>
          (quotation.quote_number || quotation.orderNumber)?.toLowerCase().includes(query) ||
          quotation.customerName?.toLowerCase().includes(query) ||
          quotation.customerPhone?.includes(query) ||
          quotation.customer_id?.toLowerCase().includes(query)
        )
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(quotation => quotation.status === statusFilter.value)
      }

      // Date filter
      if (dateFilter.value) {
        const today = new Date()
        const startDate = new Date()
        
        switch (dateFilter.value) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(today.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(today.getMonth() - 1)
            break
        }
        
        filtered = filtered.filter(quotation => {
          const quotationDate = new Date(quotation.quotation_date || quotation.orderDate)
          return quotationDate >= startDate
        })
      }

      return filtered
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || statusFilter.value || dateFilter.value
    })

    // Computed Stats
    const stats = computed(() => {
      try {
        // Use all loaded quotations data (already filtered by subtype in loadQuotations)
        const quotationsArray = Array.isArray(quotations.value) ? quotations.value : []
        console.log('📊 Computing stats for quotations:', quotationsArray)
        
        // Count by status
        const draft = quotationsArray.filter(q => 
          q.status === 'draft'
        ).length
        
        const quoted = quotationsArray.filter(q => 
          q.status === 'quoted'
        ).length
        
        const convertedToSO = quotationsArray.filter(q => 
          q.status === 'confirmed' || q.convertedToSO === true
        ).length
        
        // Calculate total value
        const totalValue = quotationsArray.reduce((sum, q) => {
          const amount = Number(q.total_amount) || 0
          return sum + amount
        }, 0)
        
        const result = {
          draft,
          quoted,
          convertedToSO,
          totalValue
        }
        
        console.log('📊 Final quotation stats:', result)
        return result
        
      } catch (error) {
        console.error('❌ Error computing quotation stats:', error)
        return {
          draft: 0,
          sent: 0,
          accepted: 0,
          totalValue: 0
        }
      }
    })

    // Load quotations data - ดึงจาก SalesService
    const loadQuotations = async () => {
      loading.value = true
      try {
        console.log('🔄 [Quotation List] Loading quotation data from SalesService...')
        
        // ✅ ใช้ SalesService แทน Transaction Engine
        if (!salesService) {
          console.error('❌ SalesService not available')
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          const result = await newSalesService.getAllQuotations()
          quotations.value = result || []
        } else {
          const result = await salesService.getAllQuotations()
          quotations.value = result || []
        }
        
        console.log('✅ [Quotation List] Loaded quotations:', quotations.value.length, 'items')
        console.log('📋 [Quotation List] Quotation details:', quotations.value.map(q => ({
          id: q.id,
          quote_number: q.quote_number,
          customer_id: q.customer_id,
          status: q.status,
          total_amount: q.total_amount
        })))
        
      } catch (error) {
        console.error('❌ [Quotation List] Error loading quotations:', error)
        quotations.value = []
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
        'sent': 'bg-yellow-100 text-yellow-800', 
        'accepted': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'expired': 'bg-gray-100 text-gray-800'
      }
      return statusClasses[status] || 'bg-blue-100 text-blue-800'
    }

    // Get status text
    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'sent': 'ส่งแล้ว',
        'accepted': 'ตอบรับแล้ว',
        'rejected': 'ปฏิเสธ',
        'expired': 'หมดอายุ'
      }
      return statusTexts[status] || status
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
      dateFilter.value = ''
    }

    // UI Methods
    const toggleDropdown = (quotationId) => {
      dropdownOpen.value = dropdownOpen.value === quotationId ? null : quotationId
    }

    // Debug stats
    const debugStats = () => {
      console.log('🔍 === QUOTATION DEBUG INFO ===')
      console.log('Raw quotation data:', quotations.value)
      console.log('Filtered quotations:', filteredQuotations.value)
      console.log('Current stats:', stats.value)
      
      alert('Debug info logged to console. กด F12 เพื่อดู console')
    }

    // Refresh data
    const refreshData = () => {
      loadQuotations()
    }

    // Handle view quotation detail
    const handleView = (quotation) => {
      router.push(`/sales/quotation/${quotation.id}`)
    }

    // Handle edit quotation
    const handleEdit = (quotation) => {
      router.push(`/sales/quotation/${quotation.id}/edit`)
    }

    // Convert quotation to sales order
    const convertToSO = async (quotation) => {
      try {
        if (!confirm('แปลง Quotation นี้เป็น Sales Order หรือไม่?')) {
          return
        }
        
        // ✅ ใช้ SalesService สำหรับการแปลง Quotation เป็น Sales Order
        console.log('🔄 [Quotation List] Converting quotation to SO:', quotation.quote_number)
        
        // Create sales order data from quotation
        const soData = {
          ...quotation,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          sourceQuotationId: quotation.id,
          sourceQuotationNumber: quotation.quote_number
        }
        
        // Remove quotation-specific fields
        delete soData.quote_number
        delete soData.quotation_date
        delete soData.expiry_date
        delete soData.id
        delete soData._id
        delete soData.createdAt
        delete soData.updatedAt
        
        let result
        if (salesService && salesService.createSalesOrder) {
          result = await salesService.createSalesOrder(soData)
        } else {
          // Fallback: Dynamic import
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.createSalesOrder(soData)
        }
        
        if (result && result.success) {
          console.log('✅ [Quotation List] Sales Order created:', result.data)
          alert('แปลง Quotation เป็น Sales Order สำเร็จ!')
          router.push(`/sales/sales-order/${result.data.id}`)
        } else {
          throw new Error(result?.message || 'การสร้าง Sales Order ล้มเหลว')
        }
        
      } catch (error) {
        console.error('❌ [Quotation List] Error converting to SO:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      }
    }

    // Print quotation
    const printQuotation = (quotation) => {
      router.push(`/sales/quotation/${quotation.id}/print`)
    }

    // Initialize
    onMounted(() => {
      loadQuotations()
    })

    return {
      // Data
      quotations,
      loading,
      viewMode,
      searchQuery,
      statusFilter,
      dateFilter,
      dropdownOpen,
      breadcrumbNav,
      
      // Computed
      stats,
      filteredQuotations,
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
      convertToSO,
      printQuotation,
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
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-check-circle text-purple-500"></i>
              Delivery Confirmation
            </h1>
            <p class="mt-2 text-gray-600">ยืนยันการส่งมอบสินค้า และบันทึกการรับสินค้า</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="refreshData"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
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
                to="/delivery/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Delivery Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Delivery Confirmation</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button 
          @click="loadData"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-refresh mr-2"></i>
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
              <p class="text-sm text-gray-600">รอยืนยัน</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.confirmed }}</p>
              <p class="text-sm text-gray-600">ยืนยันแล้ว</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-times-circle text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
              <p class="text-sm text-gray-600">ปฏิเสธ</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-boxes text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</p>
              <p class="text-sm text-gray-600">รายการทั้งหมด</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Confirmations Table -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i class="fas fa-clipboard-check text-purple-500"></i>
              รายการยืนยันการส่งมอบ
            </h3>
            <p class="text-sm text-gray-600 mt-1">การยืนยันการรับสินค้าจากลูกค้า</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="confirmations.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีการยืนยันการส่งมอบ</h3>
          <p class="text-gray-600 mb-4">เมื่อมีการยืนยันการรับสินค้าจากลูกค้าจะแสดงที่นี่</p>
        </div>

        <!-- Confirmations Table -->
        <div v-else class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery No
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmation Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="confirmation in confirmations" 
                  :key="confirmation.id"
                  class="hover:bg-gray-50 cursor-pointer"
                  @click="viewConfirmationDetail(confirmation)"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <i class="fas fa-file-alt text-gray-400 mr-2"></i>
                      <span class="text-sm font-medium text-gray-900">{{ confirmation.delivery_number }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ confirmation.customer_name }}</div>
                    <div class="text-xs text-gray-500">{{ confirmation.customer_phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(confirmation.confirmation_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ confirmation.received_by || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        confirmation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        confirmation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ getStatusText(confirmation.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click.stop="viewConfirmationDetail(confirmation)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      <i class="fas fa-eye mr-1"></i>
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Detail Modal -->
    <div v-if="showConfirmationDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i class="fas fa-clipboard-check text-purple-600"></i>
            รายละเอียดการยืนยันการส่งมอบ
          </h3>
          <button @click="closeConfirmationDetail" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6" v-if="selectedConfirmation">
          <!-- Confirmation Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Delivery Number</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ selectedConfirmation.delivery_number }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Customer</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ selectedConfirmation.customer_name }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Confirmation Date</label>
                <p class="text-sm text-gray-900 mt-1">{{ formatDateTime(selectedConfirmation.confirmation_date) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Received By</label>
                <p class="text-sm text-gray-900 mt-1">{{ selectedConfirmation.received_by || '-' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Status</label>
                <p class="mt-1">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      selectedConfirmation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedConfirmation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ getStatusText(selectedConfirmation.status) }}
                  </span>
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase">Confirmation Type</label>
                <p class="text-sm text-gray-900 mt-1">{{ selectedConfirmation.confirmation_type || '-' }}</p>
              </div>
            </div>
            <div v-if="selectedConfirmation.notes" class="mt-4">
              <label class="text-xs font-medium text-gray-500 uppercase">Notes</label>
              <p class="text-sm text-gray-900 mt-1">{{ selectedConfirmation.notes }}</p>
            </div>
          </div>

          <!-- Items List -->
          <div v-if="selectedConfirmation.items && selectedConfirmation.items.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-boxes text-blue-500"></i>
              สินค้าที่ส่งมอบ
            </h4>
            
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in selectedConfirmation.items" :key="item.id">
                    <td class="px-4 py-3">
                      <div class="text-sm font-medium text-gray-900">{{ item.product_name }}</div>
                      <div class="text-xs text-gray-500">{{ item.product_code }}</div>
                    </td>
                    <td class="px-4 py-3 text-right text-sm text-gray-900">
                      {{ item.received_quantity || item.quantity }} {{ item.unit }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span 
                        :class="[
                          'px-2 py-1 text-xs font-semibold rounded-full',
                          item.status === 'received' ? 'bg-green-100 text-green-800' :
                          item.status === 'damaged' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        ]"
                      >
                        {{ item.status || 'pending' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activities -->
          <div v-if="selectedConfirmation.activities && selectedConfirmation.activities.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-history text-gray-500"></i>
              ประวัติการดำเนินการ
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div v-for="(activity, index) in selectedConfirmation.activities" :key="index" class="flex items-start mb-3 last:mb-0">
                <i class="fas fa-circle text-xs text-blue-500 mt-1.5 mr-3"></i>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">{{ activity.action }}</p>
                  <p class="text-xs text-gray-500">{{ formatDateTime(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            @click="closeConfirmationDetail"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const ERP_CORE = window.ERP_CORE
const { general } = ERP_CORE.utils

export default {
  name: 'DeliveryConfirmationList',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const confirmations = ref([])
    const loading = ref(true)
    const error = ref('')
    
    // Modal State
    const showConfirmationDetail = ref(false)
    const selectedConfirmation = ref(null)

    // Computed Stats
    const stats = computed(() => {
      return {
        pending: confirmations.value.filter(c => c.status === 'pending').length,
        confirmed: confirmations.value.filter(c => c.status === 'confirmed').length,
        rejected: confirmations.value.filter(c => c.status === 'rejected').length,
        totalItems: confirmations.value.reduce((sum, c) => sum + (c.items?.length || 0), 0)
      }
    })

    // Methods
    const loadData = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Load Delivery Confirmations
        const result = await engine.list(TRANSACTION_TYPES.DELIVERY_CONFIRMATION)
        confirmations.value = result.data || []
        
        console.log('📋 Loaded confirmations:', confirmations.value.length)
        
      } catch (err) {
        console.error('❌ Error loading data:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const viewConfirmationDetail = (confirmation) => {
      selectedConfirmation.value = confirmation
      showConfirmationDetail.value = true
    }

    const closeConfirmationDetail = () => {
      showConfirmationDetail.value = false
      selectedConfirmation.value = null
    }

    const refreshData = () => {
      loadData()
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'รอยืนยัน',
        'confirmed': 'ยืนยันแล้ว',
        'rejected': 'ปฏิเสธ',
        'cancelled': 'ยกเลิก'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return general.formatDate(dateString, 'short')
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      return general.formatDateTime(dateString)
    }

    const formatNumber = (number) => {
      return general.formatCurrency(number || 0, { symbol: false })
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      confirmations,
      loading,
      error,
      showConfirmationDetail,
      selectedConfirmation,
      
      // Computed
      stats,
      
      // Methods
      loadData,
      viewConfirmationDetail,
      closeConfirmationDetail,
      refreshData,
      getStatusText,
      formatDate,
      formatDateTime,
      formatNumber,
      
      // Router
      $router: router
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

/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
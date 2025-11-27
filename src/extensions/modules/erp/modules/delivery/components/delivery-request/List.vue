<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Delivery Management</h1>
            <p class="mt-2 text-gray-600">จัดการการจัดส่งสินค้า ติดตามสถานะ และการรับมอบ</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="refreshData"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
              รีเฟรช
            </button>
            <button 
              @click="showCreateForm = true"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้างใบจัดส่งใหม่
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
                <span class="text-sm font-medium text-gray-500">Delivery Request</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-alt text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.scheduled }}</p>
              <p class="text-sm text-gray-600">นัดจัดส่ง</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-truck text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.shipped }}</p>
              <p class="text-sm text-gray-600">ส่งแล้ว</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-double text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ stats.delivered }}</p>
              <p class="text-sm text-gray-600">ลูกค้ารับแล้ว</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-dollar-sign text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalShippingCost) }}</p>
              <p class="text-sm text-gray-600">ค่าขนส่งรวม</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          @click="$router.push('/delivery/delivery-queue')"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-orange-500 group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-truck-loading text-white text-xl"></i>
              </div>
              <div class="ml-4">
                <h4 class="text-base font-semibold text-gray-900">คิวจัดส่งสินค้า</h4>
                <p class="text-sm text-gray-600 mt-1">Work Orders พร้อมจัดส่ง</p>
              </div>
            </div>
            <i class="fas fa-arrow-right text-gray-400 group-hover:text-orange-500 transition-colors"></i>
          </div>
        </div>

        <div 
          @click="$router.push('/delivery/pick-pack')"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-500 group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-boxes text-white text-xl"></i>
              </div>
              <div class="ml-4">
                <h4 class="text-base font-semibold text-gray-900">Pick & Pack</h4>
                <p class="text-sm text-gray-600 mt-1">จัดการการเบิกและแพ็ค</p>
              </div>
            </div>
            <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 transition-colors"></i>
          </div>
        </div>

        <div 
          @click="$router.push('/delivery/shipment-tracking')"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-green-500 group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-map-marked-alt text-white text-xl"></i>
              </div>
              <div class="ml-4">
                <h4 class="text-base font-semibold text-gray-900">Shipment Tracking</h4>
                <p class="text-sm text-gray-600 mt-1">ติดตามสถานะการจัดส่ง</p>
              </div>
            </div>
            <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-500 transition-colors"></i>
          </div>
        </div>

        <div 
          @click="$router.push('/delivery/delivery-confirmation')"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-purple-500 group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-check-circle text-white text-xl"></i>
              </div>
              <div class="ml-4">
                <h4 class="text-base font-semibold text-gray-900">Delivery Confirmation</h4>
                <p class="text-sm text-gray-600 mt-1">ยืนยันการส่งมอบ</p>
              </div>
            </div>
            <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-shipping-fast text-gray-400 text-4xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">ยินดีต้อนรับสู่ระบบจัดการจัดส่ง</h3>
        <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
          ระบบพร้อมใช้งาน UI ทุกส่วนใช้งานได้แล้ว<br>
          ฟีเจอร์การจัดการข้อมูลจะพัฒนาในเฟสถัดไป
        </p>
        <div class="flex items-center justify-center space-x-4">
          <button 
            @click="$router.push('/delivery/delivery-queue')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-truck-loading mr-2"></i>
            คิวจัดส่งสินค้า
          </button>
          <button 
            @click="showCreateForm = true"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            ทดสอบสร้างใบจัดส่ง
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showCreateForm = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" @click.stop>
        <h3 class="text-xl font-bold text-gray-900 mb-3">สร้างใบจัดส่งใหม่</h3>
        <p class="text-gray-600 mb-6">ฟีเจอร์นี้จะพัฒนาในเฟสถัดไป</p>
        <div class="flex justify-end">
          <button 
            @click="showCreateForm = false" 
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
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
import { DELIVERY_STATES } from '../../plugins/index.js'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const { general } = window.ERP_CORE.utils

export default {
  name: 'DeliveryManager',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const deliveries = ref([])
    const loading = ref(false)
    
    // Form States
    const showCreateForm = ref(false)

    // Computed Stats
    const stats = computed(() => {
      return {
        scheduled: deliveries.value.filter(d => d.state === DELIVERY_STATES.SCHEDULED).length,
        shipped: deliveries.value.filter(d => d.state === DELIVERY_STATES.SHIPPED).length,
        delivered: deliveries.value.filter(d => d.state === DELIVERY_STATES.DELIVERED).length,
        totalShippingCost: deliveries.value.reduce((sum, d) => sum + (d.shippingCost || 0), 0)
      }
    })

    // Load delivery data
    const loadDeliveries = async () => {
      loading.value = true
      try {
        const result = await engine.list(TRANSACTION_TYPES.DELIVERY)
        deliveries.value = result.data || []
      } catch (error) {
        console.error('Error loading deliveries:', error)
        deliveries.value = []
      } finally {
        loading.value = false
      }
    }

    // Format currency using ERP utils
    const formatCurrency = (amount) => {
      return general.formatCurrency(amount)
    }

    // Refresh data
    const refreshData = () => {
      loadDeliveries()
    }

    // Initialize
    onMounted(() => {
      loadDeliveries()
    })

    return {
      // Data
      deliveries,
      loading,
      
      // Form states
      showCreateForm,
      
      // Computed
      stats,
      
      // Methods
      formatCurrency,
      refreshData,
      
      // Router
      $router: router
    }
  }
}
</script>

<style scoped>
/* Modern UI styles using Tailwind-like utilities */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
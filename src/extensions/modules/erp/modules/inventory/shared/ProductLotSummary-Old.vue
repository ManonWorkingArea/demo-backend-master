<!-- Product Lot Summary Component -->
<template>
  <div class="product-lot-summary">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดข้อมูล Lot...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <i class="fas fa-exclamation-triangle text-red-400 text-6xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่สามารถโหลดข้อมูล Lot ได้</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadProductAndLots" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-refresh mr-2"></i>ลองใหม่
        </button>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!product" class="text-center py-12">
      <i class="fas fa-box-open text-gray-300 text-6xl mb-4"></i>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่มีข้อมูลสินค้า</h3>
      <p class="text-gray-500">กรุณาตรวจสอบรหัสสินค้าและลองใหม่อีกครั้ง</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Product Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ product.product_name }}</h2>
              <p class="text-sm text-gray-600">รหัส: {{ product.product_code }} | SKU: {{ product.sku }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-sm text-gray-500">รวม {{ totalLots }} ม้วน</p>
                <p class="text-lg font-semibold text-blue-600">{{ totalMeters.toFixed(2) }} เมตร</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">มูลค่า</p>
                <p class="text-lg font-semibold text-green-600">₿{{ totalValue.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="px-6 py-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">รุ่น-สี-กว้าง:</span>
              <p class="font-medium">{{ product.model_code }}-{{ product.color_code }}-{{ product.fabric_width_cm }}cm</p>
            </div>
            <div>
              <span class="text-gray-500">ประเภทผ้า:</span>
              <p class="font-medium">{{ formatFabricType(product.fabric_type) }}</p>
            </div>
            <div>
              <span class="text-gray-500">น้ำหนัก/เมตร:</span>
              <p class="font-medium">{{ product.weight_per_meter }} kg/m</p>
            </div>
            <div>
              <span class="text-gray-500">GSM:</span>
              <p class="font-medium">{{ product.gsm || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lot Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Full Rolls -->
        <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i class="fas fa-circle text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-green-900">ม้วนเต็ม</p>
              <p class="text-2xl font-bold text-green-600">{{ fullRolls.count }}</p>
              <p class="text-xs text-green-700">{{ fullRolls.meters.toFixed(2) }} เมตร</p>
            </div>
          </div>
        </div>

        <!-- Partial Rolls -->
        <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <i class="fas fa-adjust text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-yellow-900">ม้วนใช้บางส่วน</p>
              <p class="text-2xl font-bold text-yellow-600">{{ partialRolls.count }}</p>
              <p class="text-xs text-yellow-700">{{ partialRolls.meters.toFixed(2) }} เมตร</p>
            </div>
          </div>
        </div>

        <!-- Consumed Rolls -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <i class="fas fa-times-circle text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">ม้วนหมด</p>
              <p class="text-2xl font-bold text-gray-600">{{ consumedRolls.count }}</p>
              <p class="text-xs text-gray-700">{{ consumedRolls.meters.toFixed(2) }} เมตรที่ใช้ไป</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="showOnlyActive" class="rounded border-gray-300">
            <span class="text-sm font-medium text-gray-700">แสดงเฉพาะ Lot ที่ใช้งานได้</span>
          </label>

          <select v-model="sortBy" class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="lot_id">เรียงตาม Lot ID</option>
            <option value="usage_percentage">เรียงตามการใช้งาน</option>
            <option value="created_date">เรียงตามวันที่รับ</option>
          </select>
        </div>

        <!-- Lot Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ / Lot ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  น้ำหนัก (กก.)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เมตร (M)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การใช้งาน
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="lot in filteredLots" :key="lot.id" class="hover:bg-gray-50">
                <!-- Lot ID with Icon -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div :class="getRollIconClass(lot)" class="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <i :class="getRollIcon(lot)" class="text-white text-sm"></i>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ lot.lot_id }}</div>
                      <div class="text-sm text-gray-500">{{ lot.supplier_name }}</div>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(lot.lot_status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(lot.lot_status) }}
                  </span>
                </td>

                <!-- Weight -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{{ lot.current_weight_kg?.toFixed(2) }}</div>
                  <div class="text-xs text-gray-500">จาก {{ lot.original_weight_kg?.toFixed(2) }}</div>
                </td>

                <!-- Meters -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{{ lot.current_meters?.toFixed(2) }}</div>
                  <div class="text-xs text-gray-500">จาก {{ lot.calculated_meters?.toFixed(2) }}</div>
                </td>

                <!-- Usage -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{{ getUsageText(lot) }}</span>
                        <span>{{ getUsagePercentage(lot) }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div :class="getUsageBarClass(lot)" class="h-1.5 rounded-full transition-all duration-300"
                             :style="{ width: getUsagePercentage(lot) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Location -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{{ lot.current_location || '-' }}</div>
                  <div class="text-xs text-gray-400">{{ lot.warehouse || '-' }}</div>
                </td>

                <!-- Created Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(lot.created_date) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State for Lots -->
        <div v-if="filteredLots.length === 0" class="text-center py-12">
          <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล Lot</h3>
          <p class="text-gray-500">{{ showOnlyActive ? 'ไม่มี Lot ที่ใช้งานได้' : 'ไม่มีข้อมูล Lot สำหรับสินค้านี้' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ProductLotSummaryService from './services/ProductLotSummaryService.js'

export default {
  name: 'ProductLotSummary',
  props: {
    productId: {
      type: String,
      required: true
    }
  },

  setup(props) {
    // State
    const loading = ref(false)
    const error = ref(null)
    const product = ref(null)
    const lots = ref([])
    const statistics = ref({})
    const showOnlyActive = ref(true)
    const sortBy = ref('lot_id')

    // Service instance
    const lotService = ProductLotSummaryService

    // Computed Properties
    const filteredLots = computed(() => {
      let filtered = lots.value || []
      
      if (showOnlyActive.value) {
        filtered = filtered.filter(lot => 
          lot.lot_status === 'active' || lot.lot_status === 'partial'
        )
      }
      
      return filtered.sort((a, b) => {
        const field = sortBy.value
        if (field === 'usage_percentage') {
          return (b[field] || 0) - (a[field] || 0)
        }
        return (a[field] || '').toString().localeCompare((b[field] || '').toString())
      })
    })

    const totalLots = computed(() => filteredLots.value.length)

    const totalMeters = computed(() => {
      return filteredLots.value.reduce((sum, lot) => sum + (lot.current_meters || 0), 0)
    })

    const totalValue = computed(() => {
      return filteredLots.value.reduce((sum, lot) => {
        return sum + ((lot.current_weight_kg || 0) * (lot.price_per_kg || 0))
      }, 0)
    })

    const fullRolls = computed(() => {
      const fullLots = filteredLots.value.filter(lot => lot.roll_type === 'full')
      return {
        count: fullLots.length,
        meters: fullLots.reduce((sum, lot) => sum + (lot.current_meters || 0), 0)
      }
    })

    const partialRolls = computed(() => {
      const partialLots = filteredLots.value.filter(lot => lot.roll_type === 'partial')
      return {
        count: partialLots.length,
        meters: partialLots.reduce((sum, lot) => sum + (lot.current_meters || 0), 0)
      }
    })

    const consumedRolls = computed(() => {
      const consumedLots = filteredLots.value.filter(lot => lot.roll_type === 'consumed')
      return {
        count: consumedLots.length,
        meters: consumedLots.reduce((sum, lot) => {
          return sum + ((lot.calculated_meters || 0) - (lot.current_meters || 0))
        }, 0)
      }
    })

    // Methods
    const loadProductAndLots = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log('🔄 Loading product lot summary for:', props.productId)
        
        // Initialize service if needed
        if (window.$apiRequest && lotService) {
          lotService.initialize(window.$apiRequest)
          console.log('✅ ProductLotSummaryService initialized')
        } else {
          console.warn('⚠️ API Request not available, will fail with error')
        }
        
        // Load data using real service  
        const result = await lotService.getProductWithLots(props.productId)
        
        if (result.success) {
          const { product: productData, lots: lotsData, statistics: statsData } = result.data
          
          product.value = productData
          lots.value = lotsData || []
          statistics.value = statsData || {}
          
          console.log('✅ Product lot summary loaded successfully:', {
            product: productData.product_name,
            lots: lotsData?.length || 0,
            totalMeters: statsData?.total_meters || 0
          })
        } else {
          // Don't use mock data - show error instead
          console.error('❌ API failed:', result.error)
          error.value = result.error || 'ไม่สามารถดึงข้อมูล Lot ได้'
          
          if (window.$toast) {
            window.$toast.error('API ไม่พร้อมใช้งาน: ' + result.error)
          }
        }
        
      } catch (err) {
        console.error('❌ Error loading product and lots:', err)
        error.value = err.message
        
        // Don't use mock data - show error state
        if (window.$toast) {
          window.$toast.error('ไม่สามารถเชื่อมต่อ API ได้: ' + err.message)
        }
      } finally {
        loading.value = false
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        partial: 'bg-yellow-100 text-yellow-800',
        consumed: 'bg-gray-100 text-gray-800',
        hold: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (status) => {
      const texts = {
        active: 'ใช้งานได้',
        partial: 'ใช้บางส่วน',
        consumed: 'ใช้หมด',
        hold: 'ระงับ'
      }
      return texts[status] || status
    }

    const getRollIconClass = (lot) => {
      return lot.status_class || 'bg-blue-500'
    }

    const getRollIcon = (lot) => {
      const rollType = lot.roll_type || 'unknown'
      
      switch (rollType) {
        case 'full':
          return 'fas fa-circle'
        case 'partial':
          return 'fas fa-adjust'
        case 'consumed':
          return 'fas fa-times-circle'
        default:
          return 'fas fa-question-circle'
      }
    }

    const getUsagePercentage = (lot) => {
      return lot.usage_percentage || 0
    }

    const getUsageBarClass = (lot) => {
      const percentage = getUsagePercentage(lot)
      if (percentage === 0) return 'bg-green-500'
      if (percentage < 50) return 'bg-yellow-500'
      if (percentage < 100) return 'bg-orange-500'
      return 'bg-red-500'
    }

    const getUsageText = (lot) => {
      const used = (lot.calculated_meters || 0) - (lot.current_meters || 0)
      if (used === 0) return 'ยังไม่ได้ใช้'
      return `ใช้ไป ${used.toFixed(2)} เมตร`
    }

    const formatFabricType = (type) => {
      const types = {
        cotton: 'ผ้าฝ้าย',
        polyester: 'ผ้าโพลีเอสเตอร์',
        silk: 'ผ้าไหม',
        wool: 'ผ้าขนสัตว์',
        blend: 'ผ้าผสม'
      }
      return types[type] || type || '-'
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      try {
        return new Date(dateStr).toLocaleDateString('th-TH')
      } catch {
        return '-'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadProductAndLots()
    })

    return {
      // State
      loading,
      error,
      product,
      lots,
      showOnlyActive,
      sortBy,
      
      // Computed
      filteredLots,
      totalLots,
      totalMeters,
      totalValue,
      fullRolls,
      partialRolls,
      consumedRolls,
      
      // Methods
      loadProductAndLots,
      getStatusClass,
      getStatusText,
      getRollIconClass,
      getRollIcon,
      getUsagePercentage,
      getUsageBarClass,
      getUsageText,
      formatFabricType,
      formatDate
    }
  }
}
</script>

<style scoped>
.product-lot-summary {
  max-width: 100%;
}

.transition-all {
  transition: all 0.3s ease;
}

/* Custom loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
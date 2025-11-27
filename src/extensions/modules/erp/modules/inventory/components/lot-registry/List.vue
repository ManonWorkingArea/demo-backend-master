<!-- Lot Registry List Component -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-cut mr-3 text-green-600"></i>
              Lot Registry สิ่งทอ
            </h1>
            <p class="mt-1 text-gray-600">จัดการ Lot สิ่งทอและผ้า รูปแบบ 402-177-152-08883</p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="showCreateModal = true"
              class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              สร้าง Lot ใหม่
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหา Lot</label>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="รหัส Lot, ชื่อสินค้า..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งานได้</option>
              <option value="partial">ใช้บางส่วน</option>
              <option value="consumed">ใช้หมด</option>
              <option value="reserved">จองไว้</option>
              <option value="on_hold">หยุดใช้ชั่วคราว</option>
            </select>
          </div>

          <!-- Fabric Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทผ้า</label>
            <select
              v-model="filters.fabric_type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">ทุกประเภท</option>
              <option value="cotton">ผ้าฝ้าย</option>
              <option value="polyester">ผ้าโพลีเอสเตอร์</option>
              <option value="silk">ผ้าไหม</option>
              <option value="wool">ผ้าขนสัตว์</option>
              <option value="blend">ผ้าผสม</option>
            </select>
          </div>

          <!-- Model Code Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">รหัสรุ่น</label>
            <input
              type="text"
              v-model="filters.model_code"
              placeholder="402"
              maxlength="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-end space-x-2">
            <button
              @click="searchLots"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <i class="fas fa-search mr-2"></i>
              ค้นหา
            </button>
            <button
              @click="clearFilters"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-times mr-2"></i>
              ล้าง
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-boxes text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Lots</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_lots }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Lots</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.active_lots }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Partial Used</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.partial_lots }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-weight text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Weight</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatWeight(summary.total_weight_kg) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-percentage text-indigo-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Utilization</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.utilization_percentage }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lots Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">รายการ Lot ({{ lots.length }})</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">น้ำหนัก (kg)</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เมตร</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทผ้า</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การใช้งาน</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading" class="text-center">
                <td colspan="9" class="px-6 py-12">
                  <div class="flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    กำลังโหลดข้อมูล...
                  </div>
                </td>
              </tr>
              <tr v-else-if="lots.length === 0" class="text-center">
                <td colspan="9" class="px-6 py-12 text-gray-500">
                  <i class="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                  <p>ไม่พบข้อมูล Lot</p>
                  <button 
                    @click="showCreateModal = true"
                    class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    สร้าง Lot แรก
                  </button>
                </td>
              </tr>
              <tr v-else v-for="lot in lots" :key="lot.lot_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900 font-mono">{{ lot.lot_id }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(lot.created_at) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-900">{{ lot.product_name || 'ไม่ระบุ' }}</div>
                    <div class="text-xs text-gray-500">{{ lot.fabric_composition || '' }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm text-gray-900">{{ formatWeight(lot.current_weight_kg) }}</div>
                    <div class="text-xs text-gray-500">จาก {{ formatWeight(lot.original_weight_kg) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm text-gray-900">{{ formatNumber(lot.current_meters) }} m</div>
                    <div class="text-xs text-gray-500">จาก {{ formatNumber(lot.calculated_meters) }} m</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ formatFabricType(lot.fabric_type) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getLotStatusClass(lot.lot_status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getLotStatusLabel(lot.lot_status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ lot.current_location || '-' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="h-2 rounded-full"
                        :class="getUtilizationColor(calculateUtilization(lot))"
                        :style="{ width: calculateUtilization(lot) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-600">{{ calculateUtilization(lot) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewLot(lot)"
                      class="text-blue-600 hover:text-blue-900"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      @click="splitLot(lot)"
                      :disabled="lot.lot_status === 'consumed'"
                      class="text-green-600 hover:text-green-900 disabled:text-gray-400"
                      title="แบ่ง Lot"
                    >
                      <i class="fas fa-cut"></i>
                    </button>
                    <button
                      @click="consumeLot(lot)"
                      :disabled="lot.lot_status === 'consumed'"
                      class="text-orange-600 hover:text-orange-900 disabled:text-gray-400"
                      title="ใช้งาน Lot"
                    >
                      <i class="fas fa-minus-circle"></i>
                    </button>
                    <button
                      @click="editLot(lot)"
                      class="text-gray-600 hover:text-gray-900"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Lot Modal -->
    <CreateLotModal 
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onLotCreated"
    />

    <!-- Split Lot Modal -->
    <SplitLotModal
      v-if="showSplitModal"
      :lot="selectedLot"
      @close="showSplitModal = false"
      @split="onLotSplit"
    />

    <!-- Consume Lot Modal -->
    <ConsumeLotModal
      v-if="showConsumeModal"
      :lot="selectedLot"
      @close="showConsumeModal = false"
      @consumed="onLotConsumed"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { LotRegistryService } from '../../../services/LotRegistryService.js'
import CreateLotModal from './CreateLotModal.vue'
import SplitLotModal from './SplitLotModal.vue'
import ConsumeLotModal from './ConsumeLotModal.vue'

export default {
  name: 'LotRegistryList',
  components: {
    CreateLotModal,
    SplitLotModal,
    ConsumeLotModal
  },
  setup() {
    // State
    const loading = ref(false)
    const lots = ref([])
    const searchQuery = ref('')
    const showCreateModal = ref(false)
    const showSplitModal = ref(false)
    const showConsumeModal = ref(false)
    const selectedLot = ref(null)
    
    const filters = reactive({
      status: '',
      fabric_type: '',
      model_code: '',
      location: ''
    })

    const summary = reactive({
      total_lots: 0,
      active_lots: 0,
      partial_lots: 0,
      consumed_lots: 0,
      total_weight_kg: 0,
      remaining_weight_kg: 0,
      total_meters: 0,
      remaining_meters: 0,
      utilization_percentage: 0
    })

    // Service
    const lotService = new LotRegistryService()

    // Computed
    const filteredLots = computed(() => {
      let filtered = lots.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(lot => 
          lot.lot_id.toLowerCase().includes(query) ||
          (lot.product_name && lot.product_name.toLowerCase().includes(query)) ||
          (lot.fabric_type && lot.fabric_type.toLowerCase().includes(query))
        )
      }

      if (filters.status) {
        filtered = filtered.filter(lot => lot.lot_status === filters.status)
      }

      if (filters.fabric_type) {
        filtered = filtered.filter(lot => lot.fabric_type === filters.fabric_type)
      }

      if (filters.model_code) {
        filtered = filtered.filter(lot => lot.model_code === filters.model_code)
      }

      return filtered
    })

    // Methods
    const loadLots = async () => {
      loading.value = true
      try {
        // Initialize service with apiRequest if available
        if (window.$apiRequest) {
          lotService.initialize(window.$apiRequest)
        }

        const result = await lotService.searchLotRegistries({
          limit: 100,
          sort: { created_at: -1 }
        })

        if (result.success) {
          lots.value = result.data
          console.log('✅ Loaded lots:', lots.value.length)
        } else {
          console.error('❌ Failed to load lots:', result.error)
          lots.value = []
        }
      } catch (error) {
        console.error('❌ Error loading lots:', error)
        lots.value = []
      } finally {
        loading.value = false
      }
    }

    const loadSummary = async () => {
      try {
        const result = await lotService.getLotUtilizationSummary()
        if (result.success) {
          Object.assign(summary, result.data)
        }
      } catch (error) {
        console.error('❌ Error loading summary:', error)
      }
    }

    const searchLots = async () => {
      await loadLots()
    }

    const clearFilters = () => {
      searchQuery.value = ''
      Object.keys(filters).forEach(key => {
        filters[key] = ''
      })
      loadLots()
    }

    const viewLot = (lot) => {
      // TODO: Navigate to lot detail page
      console.log('View lot:', lot.lot_id)
    }

    const splitLot = (lot) => {
      selectedLot.value = lot
      showSplitModal.value = true
    }

    const consumeLot = (lot) => {
      selectedLot.value = lot
      showConsumeModal.value = true
    }

    const editLot = (lot) => {
      // TODO: Navigate to lot edit page
      console.log('Edit lot:', lot.lot_id)
    }

    const onLotCreated = (newLot) => {
      lots.value.unshift(newLot)
      loadSummary()
    }

    const onLotSplit = () => {
      // Refresh the lots list
      loadLots()
      loadSummary()
    }

    const onLotConsumed = () => {
      // Refresh the lots list
      loadLots()
      loadSummary()
    }

    // Utility methods
    const formatWeight = (weight) => {
      if (weight === null || weight === undefined) return '-'
      return Number(weight).toFixed(3) + ' kg'
    }

    const formatNumber = (num) => {
      if (num === null || num === undefined) return '-'
      return Number(num).toFixed(2)
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH')
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

    const getLotStatusLabel = (status) => {
      const labels = {
        active: 'ใช้งานได้',
        partial: 'ใช้บางส่วน',
        consumed: 'ใช้หมด',
        reserved: 'จองไว้',
        on_hold: 'หยุดใช้ชั่วคราว',
        damaged: 'เสียหาย'
      }
      return labels[status] || status
    }

    const getLotStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        partial: 'bg-yellow-100 text-yellow-800',
        consumed: 'bg-gray-100 text-gray-800',
        reserved: 'bg-blue-100 text-blue-800',
        on_hold: 'bg-orange-100 text-orange-800',
        damaged: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const calculateUtilization = (lot) => {
      if (!lot.original_weight_kg || lot.original_weight_kg <= 0) return 0
      const used = lot.original_weight_kg - lot.current_weight_kg
      return Math.round((used / lot.original_weight_kg) * 100)
    }

    const getUtilizationColor = (percentage) => {
      if (percentage >= 80) return 'bg-red-500'
      if (percentage >= 60) return 'bg-yellow-500'
      if (percentage >= 40) return 'bg-blue-500'
      return 'bg-green-500'
    }

    // Lifecycle
    onMounted(async () => {
      await loadLots()
      await loadSummary()
    })

    return {
      // State
      loading,
      lots: filteredLots,
      searchQuery,
      filters,
      summary,
      showCreateModal,
      showSplitModal,
      showConsumeModal,
      selectedLot,

      // Methods
      searchLots,
      clearFilters,
      viewLot,
      splitLot,
      consumeLot,
      editLot,
      onLotCreated,
      onLotSplit,
      onLotConsumed,

      // Utilities
      formatWeight,
      formatNumber,
      formatDate,
      formatFabricType,
      getLotStatusLabel,
      getLotStatusClass,
      calculateUtilization,
      getUtilizationColor
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
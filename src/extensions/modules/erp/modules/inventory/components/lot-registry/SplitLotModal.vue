<!-- Split Lot Modal Component -->
<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-cut mr-2 text-orange-600"></i>
            แยก Lot: {{ lot?.lot_id }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <div class="p-6" v-if="lot">
        <!-- Current Lot Info -->
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 mb-3">ข้อมูล Lot ปัจจุบัน</h4>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">น้ำหนักปัจจุบัน:</span>
                <p class="text-blue-600 font-semibold">{{ lot.current_weight_kg }} kg</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">เมตรปัจจุบัน:</span>
                <p class="text-blue-600 font-semibold">{{ lot.current_meters }} m</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">น้ำหนัก/เมตร:</span>
                <p class="text-gray-900">{{ lot.weight_per_meter }} kg/m</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">สถานะ:</span>
                <span :class="getStatusClass(lot.lot_status)" class="px-2 py-1 rounded text-xs">
                  {{ getStatusText(lot.lot_status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Split Configuration -->
        <form @submit.prevent="splitLot">
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">กำหนดการแยก</h4>
            
            <!-- Split Method Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-3">วิธีการแยก</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="splitMethod"
                    value="weight"
                    class="mr-2 text-orange-500 focus:ring-orange-500"
                  />
                  <span class="text-sm">แยกตามน้ำหนัก (kg)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="splitMethod"
                    value="meters"
                    class="mr-2 text-orange-500 focus:ring-orange-500"
                  />
                  <span class="text-sm">แยกตามเมตร (m)</span>
                </label>
              </div>
            </div>

            <!-- Split Input -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ splitMethod === 'weight' ? 'น้ำหนักที่ต้องการแยก (kg)' : 'เมตรที่ต้องการแยก (m)' }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  v-model.number="splitAmount"
                  @input="calculateSplit"
                  :placeholder="splitMethod === 'weight' ? 'เช่น 5.5' : 'เช่น 18.3'"
                  :min="0.001"
                  :max="splitMethod === 'weight' ? lot.current_weight_kg : lot.current_meters"
                  step="0.001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ splitMethod === 'weight' ? 'เมตรที่จะได้' : 'น้ำหนักที่จะได้' }}
                </label>
                <input
                  type="number"
                  :value="splitMethod === 'weight' ? calculatedMeters : calculatedWeight"
                  placeholder="คำนวณอัตโนมัติ"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readonly
                />
              </div>
            </div>

            <!-- Split Preview -->
            <div v-if="splitAmount && splitAmount > 0" class="mt-4">
              <div class="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h5 class="text-sm font-medium text-orange-800 mb-3">ผลการแยก:</h5>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- New Lot -->
                  <div class="bg-white border border-orange-300 rounded-lg p-3">
                    <h6 class="text-xs font-medium text-orange-700 mb-2">
                      <i class="fas fa-plus mr-1"></i>
                      Lot ใหม่ ({{ newLotId }})
                    </h6>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-gray-600">น้ำหนัก:</span>
                        <span class="font-medium text-orange-700">{{ splitMethod === 'weight' ? splitAmount : calculatedWeight }} kg</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เมตร:</span>
                        <span class="font-medium text-orange-700">{{ splitMethod === 'meters' ? splitAmount : calculatedMeters }} m</span>
                      </div>
                    </div>
                  </div>

                  <!-- Remaining Lot -->
                  <div class="bg-white border border-gray-300 rounded-lg p-3">
                    <h6 class="text-xs font-medium text-gray-700 mb-2">
                      <i class="fas fa-minus mr-1"></i>
                      Lot เดิมที่เหลือ ({{ lot.lot_id }})
                    </h6>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-gray-600">น้ำหนัก:</span>
                        <span class="font-medium text-blue-700">{{ remainingWeight }} kg</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เมตร:</span>
                        <span class="font-medium text-blue-700">{{ remainingMeters }} m</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Validation Messages -->
                <div v-if="validationErrors.length > 0" class="mt-3">
                  <div class="text-red-600 text-sm">
                    <ul class="list-disc list-inside">
                      <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Lot Details -->
          <div v-if="splitAmount && splitAmount > 0 && validationErrors.length === 0" class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">ข้อมูล Lot ใหม่</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ตำแหน่งจัดเก็บ</label>
                <input
                  type="text"
                  v-model="splitData.location"
                  placeholder="WH01-A-002"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">คลังสินค้า</label>
                <input
                  type="text"
                  v-model="splitData.warehouse"
                  placeholder="WH01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลในการแยก</label>
              <textarea
                v-model="splitData.reason"
                rows="3"
                placeholder="ระบุเหตุผลในการแยก Lot..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="splitting || !canSplit"
              class="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <i v-if="splitting" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-cut mr-2"></i>
              {{ splitting ? 'กำลังแยก...' : 'แยก Lot' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { LotRegistryService } from '../../../services/LotRegistryService.js'

export default {
  name: 'SplitLotModal',
  props: {
    lot: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'split'],
  setup(props, { emit }) {
    // State
    const splitting = ref(false)
    const splitMethod = ref('weight') // 'weight' or 'meters'
    const splitAmount = ref(null)
    
    const splitData = reactive({
      location: '',
      warehouse: '',
      reason: ''
    })

    // Service
    const lotService = new LotRegistryService()

    // Computed
    const calculatedMeters = computed(() => {
      if (!splitAmount.value || splitMethod.value !== 'weight' || !props.lot?.weight_per_meter) {
        return 0
      }
      return Math.round((splitAmount.value / props.lot.weight_per_meter) * 100) / 100
    })

    const calculatedWeight = computed(() => {
      if (!splitAmount.value || splitMethod.value !== 'meters' || !props.lot?.weight_per_meter) {
        return 0
      }
      return Math.round((splitAmount.value * props.lot.weight_per_meter) * 100) / 100
    })

    const remainingWeight = computed(() => {
      if (!splitAmount.value || !props.lot?.current_weight_kg) return props.lot?.current_weight_kg || 0
      
      const splitWeight = splitMethod.value === 'weight' ? splitAmount.value : calculatedWeight.value
      return Math.round((props.lot.current_weight_kg - splitWeight) * 100) / 100
    })

    const remainingMeters = computed(() => {
      if (!splitAmount.value || !props.lot?.current_meters) return props.lot?.current_meters || 0
      
      const splitMeters = splitMethod.value === 'meters' ? splitAmount.value : calculatedMeters.value
      return Math.round((props.lot.current_meters - splitMeters) * 100) / 100
    })

    const newLotId = computed(() => {
      if (!props.lot?.lot_id) return ''
      
      // Generate new lot ID by incrementing sequence
      const parts = props.lot.lot_id.split('-')
      if (parts.length === 4) {
        const sequence = parseInt(parts[3]) + 1
        parts[3] = String(sequence).padStart(5, '0')
        return parts.join('-')
      }
      
      return props.lot.lot_id + '-01'
    })

    const validationErrors = computed(() => {
      const errors = []
      
      if (!splitAmount.value || splitAmount.value <= 0) {
        return errors
      }
      
      if (splitMethod.value === 'weight') {
        if (splitAmount.value >= props.lot.current_weight_kg) {
          errors.push('น้ำหนักที่แยกต้องน้อยกว่าน้ำหนักปัจจุบัน')
        }
      } else {
        if (splitAmount.value >= props.lot.current_meters) {
          errors.push('เมตรที่แยกต้องน้อยกว่าเมตรปัจจุบัน')
        }
      }
      
      if (remainingWeight.value <= 0 || remainingMeters.value <= 0) {
        errors.push('จำนวนที่เหลือต้องมากกว่า 0')
      }
      
      return errors
    })

    const canSplit = computed(() => {
      return splitAmount.value &&
             splitAmount.value > 0 &&
             validationErrors.value.length === 0 &&
             splitData.reason.trim()
    })

    // Methods
    const calculateSplit = () => {
      // Calculations are handled by computed properties
    }

    const splitLot = async () => {
      if (!canSplit.value) return
      
      splitting.value = true
      
      try {
        // Initialize service if needed
        if (window.$apiRequest) {
          lotService.initialize(window.$apiRequest)
        }

        // Prepare split data
        const splitParams = {
          lot_id: props.lot.lot_id,
          split_method: splitMethod.value,
          amount: splitAmount.value,
          new_lot_data: {
            location: splitData.location || props.lot.current_location,
            warehouse: splitData.warehouse || props.lot.warehouse,
            reason: splitData.reason
          }
        }

        const result = await lotService.splitLot(splitParams)
        
        if (result.success) {
          emit('split', result.data)
          emit('close')
          
          if (window.$toast) {
            window.$toast.success(`แยก Lot สำเร็จ: สร้าง ${newLotId.value}`)
          }
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('❌ Error splitting lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถแยก Lot ได้: ' + error.message)
        }
      } finally {
        splitting.value = false
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

    // Watch for split method changes to reset amount
    watch(splitMethod, () => {
      splitAmount.value = null
    })

    return {
      // State
      splitting,
      splitMethod,
      splitAmount,
      splitData,
      
      // Computed
      calculatedMeters,
      calculatedWeight,
      remainingWeight,
      remainingMeters,
      newLotId,
      validationErrors,
      canSplit,
      
      // Methods
      calculateSplit,
      splitLot,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
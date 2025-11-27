<!-- Consume Lot Modal Component -->
<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-minus-circle mr-2 text-red-600"></i>
            เบิกใช้ Lot: {{ lot?.lot_id }}
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

            <!-- Usage History -->
            <div v-if="lot.usage_history && lot.usage_history.length > 0" class="mt-4 pt-4 border-t border-gray-200">
              <h6 class="text-xs font-medium text-gray-600 mb-2">ประวัติการใช้งาน:</h6>
              <div class="space-y-1">
                <div v-for="usage in lot.usage_history.slice(0, 3)" :key="usage.date" class="text-xs text-gray-500">
                  {{ formatDate(usage.date) }}: ใช้ {{ usage.amount_used }} {{ usage.unit }} 
                  (เหลือ {{ usage.remaining }})
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Consumption Form -->
        <form @submit.prevent="consumeLot">
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">กำหนดการเบิกใช้</h4>
            
            <!-- Consumption Method -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-3">วิธีการเบิก</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="consumeMethod"
                    value="weight"
                    class="mr-2 text-red-500 focus:ring-red-500"
                  />
                  <span class="text-sm">เบิกตามน้ำหนัก (kg)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="consumeMethod"
                    value="meters"
                    class="mr-2 text-red-500 focus:ring-red-500"
                  />
                  <span class="text-sm">เบิกตามเมตร (m)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="consumeMethod"
                    value="full"
                    class="mr-2 text-red-500 focus:ring-red-500"
                  />
                  <span class="text-sm">เบิกทั้งหมด</span>
                </label>
              </div>
            </div>

            <!-- Amount Input -->
            <div v-if="consumeMethod !== 'full'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ consumeMethod === 'weight' ? 'น้ำหนักที่เบิก (kg)' : 'เมตรที่เบิก (m)' }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  v-model.number="consumeAmount"
                  @input="calculateConsumption"
                  :placeholder="consumeMethod === 'weight' ? 'เช่น 2.5' : 'เช่น 8.3'"
                  :min="0.001"
                  :max="consumeMethod === 'weight' ? lot.current_weight_kg : lot.current_meters"
                  step="0.001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ consumeMethod === 'weight' ? 'เมตรที่จะเบิก' : 'น้ำหนักที่จะเบิก' }}
                </label>
                <input
                  type="number"
                  :value="consumeMethod === 'weight' ? calculatedMeters : calculatedWeight"
                  placeholder="คำนวณอัตโนมัติ"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readonly
                />
              </div>
            </div>

            <!-- Consumption Preview -->
            <div v-if="(consumeAmount && consumeAmount > 0) || consumeMethod === 'full'" class="mb-4">
              <div class="border border-red-200 rounded-lg p-4 bg-red-50">
                <h5 class="text-sm font-medium text-red-800 mb-3">สรุปการเบิกใช้:</h5>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Consumed Amount -->
                  <div class="bg-white border border-red-300 rounded-lg p-3">
                    <h6 class="text-xs font-medium text-red-700 mb-2">
                      <i class="fas fa-minus mr-1"></i>
                      จำนวนที่เบิก
                    </h6>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-gray-600">น้ำหนัก:</span>
                        <span class="font-medium text-red-700">{{ finalConsumedWeight }} kg</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เมตร:</span>
                        <span class="font-medium text-red-700">{{ finalConsumedMeters }} m</span>
                      </div>
                    </div>
                  </div>

                  <!-- Remaining Amount -->
                  <div class="bg-white border border-gray-300 rounded-lg p-3">
                    <h6 class="text-xs font-medium text-gray-700 mb-2">
                      <i class="fas fa-check mr-1"></i>
                      จำนวนที่เหลือ
                    </h6>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-gray-600">น้ำหนัก:</span>
                        <span class="font-medium" :class="remainingWeight <= 0 ? 'text-red-600' : 'text-green-600'">
                          {{ remainingWeight }} kg
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เมตร:</span>
                        <span class="font-medium" :class="remainingMeters <= 0 ? 'text-red-600' : 'text-green-600'">
                          {{ remainingMeters }} m
                        </span>
                      </div>
                      <div class="flex justify-between pt-1 border-t">
                        <span class="text-gray-600">สถานะใหม่:</span>
                        <span class="text-xs px-2 py-1 rounded" :class="getNewStatusClass()">
                          {{ getNewStatusText() }}
                        </span>
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

          <!-- Usage Details -->
          <div v-if="((consumeAmount && consumeAmount > 0) || consumeMethod === 'full') && validationErrors.length === 0" class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">รายละเอียดการใช้งาน</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  วัตถุประสงค์การใช้งาน <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="consumeData.purpose"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">เลือกวัตถุประสงค์...</option>
                  <option value="production">การผลิต</option>
                  <option value="sampling">การทำตัวอย่าง</option>
                  <option value="quality_check">การตรวจคุณภาพ</option>
                  <option value="waste">ของเสีย/เสียหาย</option>
                  <option value="transfer">โอนย้าย</option>
                  <option value="return">คืนสินค้า</option>
                  <option value="adjustment">ปรับปรุงสต็อก</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขที่เอกสารอ้างอิง</label>
                  <input
                    type="text"
                    v-model="consumeData.reference_document"
                    placeholder="WO-2024-0001, PO-2024-0001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้เบิก</label>
                  <input
                    type="text"
                    v-model="consumeData.requested_by"
                    placeholder="ชื่อผู้เบิก"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">แผนก/หน่วยงาน</label>
                  <input
                    type="text"
                    v-model="consumeData.department"
                    placeholder="แผนกผลิต, แผนกควบคุมคุณภาพ"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ศูนย์ต้นทุน</label>
                  <input
                    type="text"
                    v-model="consumeData.cost_center"
                    placeholder="CC-001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea
                  v-model="consumeData.notes"
                  rows="3"
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
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
              :disabled="consuming || !canConsume"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <i v-if="consuming" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-minus-circle mr-2"></i>
              {{ consuming ? 'กำลังเบิก...' : 'ยืนยันการเบิก' }}
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
  name: 'ConsumeLotModal',
  props: {
    lot: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'consumed'],
  setup(props, { emit }) {
    // State
    const consuming = ref(false)
    const consumeMethod = ref('weight') // 'weight', 'meters', 'full'
    const consumeAmount = ref(null)
    
    const consumeData = reactive({
      purpose: '',
      reference_document: '',
      requested_by: '',
      department: '',
      cost_center: '',
      notes: ''
    })

    // Service
    const lotService = new LotRegistryService()

    // Computed
    const calculatedMeters = computed(() => {
      if (!consumeAmount.value || consumeMethod.value !== 'weight' || !props.lot?.weight_per_meter) {
        return 0
      }
      return Math.round((consumeAmount.value / props.lot.weight_per_meter) * 100) / 100
    })

    const calculatedWeight = computed(() => {
      if (!consumeAmount.value || consumeMethod.value !== 'meters' || !props.lot?.weight_per_meter) {
        return 0
      }
      return Math.round((consumeAmount.value * props.lot.weight_per_meter) * 100) / 100
    })

    const finalConsumedWeight = computed(() => {
      if (consumeMethod.value === 'full') {
        return props.lot?.current_weight_kg || 0
      } else if (consumeMethod.value === 'weight') {
        return consumeAmount.value || 0
      } else {
        return calculatedWeight.value
      }
    })

    const finalConsumedMeters = computed(() => {
      if (consumeMethod.value === 'full') {
        return props.lot?.current_meters || 0
      } else if (consumeMethod.value === 'meters') {
        return consumeAmount.value || 0
      } else {
        return calculatedMeters.value
      }
    })

    const remainingWeight = computed(() => {
      if (!props.lot?.current_weight_kg) return 0
      return Math.round((props.lot.current_weight_kg - finalConsumedWeight.value) * 100) / 100
    })

    const remainingMeters = computed(() => {
      if (!props.lot?.current_meters) return 0
      return Math.round((props.lot.current_meters - finalConsumedMeters.value) * 100) / 100
    })

    const validationErrors = computed(() => {
      const errors = []
      
      if (consumeMethod.value === 'full') {
        return errors // Full consumption is always valid
      }
      
      if (!consumeAmount.value || consumeAmount.value <= 0) {
        return errors
      }
      
      if (consumeMethod.value === 'weight') {
        if (consumeAmount.value > props.lot.current_weight_kg) {
          errors.push('น้ำหนักที่เบิกต้องไม่เกินน้ำหนักปัจจุบัน')
        }
      } else {
        if (consumeAmount.value > props.lot.current_meters) {
          errors.push('เมตรที่เบิกต้องไม่เกินเมตรปัจจุบัน')
        }
      }
      
      if (remainingWeight.value < 0 || remainingMeters.value < 0) {
        errors.push('จำนวนที่เหลือต้องไม่ติดลบ')
      }
      
      return errors
    })

    const canConsume = computed(() => {
      if (consumeMethod.value === 'full') {
        return consumeData.purpose
      }
      
      return (consumeAmount.value && consumeAmount.value > 0) &&
             validationErrors.value.length === 0 &&
             consumeData.purpose
    })

    // Methods
    const calculateConsumption = () => {
      // Calculations are handled by computed properties
    }

    const getNewStatusClass = () => {
      if (remainingWeight.value <= 0 || remainingMeters.value <= 0) {
        return 'bg-gray-100 text-gray-800'
      } else if (remainingWeight.value < props.lot.original_weight_kg * 0.5) {
        return 'bg-yellow-100 text-yellow-800'
      }
      return 'bg-green-100 text-green-800'
    }

    const getNewStatusText = () => {
      if (remainingWeight.value <= 0 || remainingMeters.value <= 0) {
        return 'ใช้หมด'
      } else if (remainingWeight.value < props.lot.original_weight_kg * 0.5) {
        return 'ใช้บางส่วน'
      }
      return 'ใช้งานได้'
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

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('th-TH')
    }

    const consumeLot = async () => {
      if (!canConsume.value) return
      
      consuming.value = true
      
      try {
        // Initialize service if needed
        if (window.$apiRequest) {
          lotService.initialize(window.$apiRequest)
        }

        // Prepare consume data
        const consumeParams = {
          lot_id: props.lot.lot_id,
          consume_method: consumeMethod.value,
          amount: consumeMethod.value === 'full' ? null : consumeAmount.value,
          usage_data: {
            ...consumeData,
            consumed_weight: finalConsumedWeight.value,
            consumed_meters: finalConsumedMeters.value,
            remaining_weight: remainingWeight.value,
            remaining_meters: remainingMeters.value
          }
        }

        const result = await lotService.consumeLot(consumeParams)
        
        if (result.success) {
          emit('consumed', result.data)
          emit('close')
          
          if (window.$toast) {
            window.$toast.success(`เบิกใช้ Lot ${props.lot.lot_id} สำเร็จ`)
          }
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('❌ Error consuming lot:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถเบิกใช้ Lot ได้: ' + error.message)
        }
      } finally {
        consuming.value = false
      }
    }

    // Watch for method changes to reset amount
    watch(consumeMethod, (newMethod) => {
      if (newMethod === 'full') {
        consumeAmount.value = null
      } else {
        consumeAmount.value = null
      }
    })

    return {
      // State
      consuming,
      consumeMethod,
      consumeAmount,
      consumeData,
      
      // Computed
      calculatedMeters,
      calculatedWeight,
      finalConsumedWeight,
      finalConsumedMeters,
      remainingWeight,
      remainingMeters,
      validationErrors,
      canConsume,
      
      // Methods
      calculateConsumption,
      getNewStatusClass,
      getNewStatusText,
      getStatusClass,
      getStatusText,
      formatDate,
      consumeLot
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
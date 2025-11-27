<!-- Lot Reservation Modal Component -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="bg-purple-600 text-white px-5 py-3 flex items-center justify-between sticky top-0 z-10">
            <h3 class="text-base font-semibold flex items-center gap-2">
              <i class="fas fa-lock"></i>
              จองสต็อค {{ lot ? `Lot ${lot.lot_code}` : '' }}
            </h3>
            <button 
              @click="closeModal" 
              class="text-white hover:text-gray-200 transition-colors"
              title="ปิด (ESC)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="p-4 space-y-3">
            <!-- Lot Info -->
            <div v-if="lot" class="bg-gray-50 border border-gray-200 rounded p-3">
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">คงเหลือ</div>
                  <div class="font-bold text-blue-700">{{ formatNumber(lot.remaining_meters || lot.calculated_meters || 0) }}</div>
                </div>
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">จองแล้ว</div>
                  <div class="font-bold text-orange-600">{{ formatNumber(lot.reserved_meters || 0) }}</div>
                </div>
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">ใช้ไป</div>
                  <div class="font-bold text-red-600">{{ formatNumber(lot.used_meters || 0) }}</div>
                </div>
                <div class="text-center p-2 bg-green-50 rounded border border-green-300">
                  <div class="text-green-700 mb-0.5 font-medium">พร้อมจอง</div>
                  <div class="font-bold text-green-700">{{ formatNumber(availableMeters) }}</div>
                </div>
              </div>
              
              <div v-if="lot.location_code || lot.weight_kg" class="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span v-if="lot.location_code">
                  <i class="fas fa-map-marker-alt mr-1"></i>{{ lot.location_code }} {{ lot.rack_position }}
                </span>
                <span v-if="lot.weight_kg">
                  <i class="fas fa-weight-hanging mr-1"></i>{{ formatNumber(lot.weight_kg) }} กก.
                </span>
              </div>
            </div>

            <!-- Reservation Form -->
            <div class="space-y-3">
              <!-- Reservation Type Selection -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  เลือกวิธีการจอง <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <!-- จองเป็นเมตร -->
                  <button
                    @click="form.reservation_type = 'meters'"
                    type="button"
                    class="p-3 border-2 rounded transition-all text-left"
                    :class="{
                      'border-purple-600 bg-purple-50': form.reservation_type === 'meters',
                      'border-gray-300 hover:border-purple-300 bg-white': form.reservation_type !== 'meters'
                    }"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div class="w-8 h-8 rounded flex items-center justify-center"
                           :class="form.reservation_type === 'meters' ? 'bg-purple-600' : 'bg-gray-200'">
                        <i class="fas fa-ruler-horizontal text-sm"
                           :class="form.reservation_type === 'meters' ? 'text-white' : 'text-gray-500'"></i>
                      </div>
                      <div>
                        <div class="font-semibold text-sm"
                             :class="form.reservation_type === 'meters' ? 'text-purple-700' : 'text-gray-800'">
                          จองเป็นเมตร
                        </div>
                        <div class="text-xs text-gray-500">ระบุจำนวน</div>
                      </div>
                    </div>
                  </button>

                  <!-- จองทั้งม้วน -->
                  <button
                    @click="selectWholeRoll"
                    type="button"
                    class="p-3 border-2 rounded transition-all text-left"
                    :class="{
                      'border-purple-600 bg-purple-50': form.reservation_type === 'whole_roll',
                      'border-gray-300 hover:border-purple-300 bg-white': form.reservation_type !== 'whole_roll'
                    }"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div class="w-8 h-8 rounded flex items-center justify-center"
                           :class="form.reservation_type === 'whole_roll' ? 'bg-purple-600' : 'bg-gray-200'">
                        <i class="fas fa-box-full text-sm"
                           :class="form.reservation_type === 'whole_roll' ? 'text-white' : 'text-gray-500'"></i>
                      </div>
                      <div>
                        <div class="font-semibold text-sm"
                             :class="form.reservation_type === 'whole_roll' ? 'text-purple-700' : 'text-gray-800'">
                          จองทั้งม้วน
                        </div>
                        <div class="text-xs text-gray-500">จองทั้งหมด</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Reserved Meters Input -->
              <div v-if="form.reservation_type === 'meters'">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  จำนวนที่ต้องการจอง (เมตร) <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <input
                      v-model.number="form.reserved_meters"
                      type="number"
                      step="0.01"
                      min="0.01"
                      :max="availableMeters"
                      class="w-full pl-3 pr-12 py-2 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      :class="{
                        'border-red-500 bg-red-50': form.reserved_meters > availableMeters,
                        'border-gray-300': form.reserved_meters <= availableMeters
                      }"
                      placeholder="0.00"
                      @input="validateReservedMeters"
                    />
                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                      เมตร
                    </div>
                  </div>
                  <button
                    v-if="availableMeters > 0"
                    @click="form.reserved_meters = availableMeters"
                    type="button"
                    class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors whitespace-nowrap"
                  >
                    ใช้เต็ม
                  </button>
                </div>
                
                <div class="mt-1 flex items-center justify-between text-xs">
                  <span class="text-gray-600">สูงสุด {{ formatNumber(availableMeters) }} ม.</span>
                </div>
                
                <p v-if="form.reserved_meters > availableMeters" 
                   class="text-xs text-red-600 mt-1">
                  <i class="fas fa-exclamation-triangle mr-1"></i>
                  เกินสต็อกพร้อมใช้
                </p>
                
                <!-- Weight Calculation -->
                <div v-if="form.reserved_meters > 0 && lot?.weight_kg" 
                     class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-blue-700">น้ำหนักโดยประมาณ:</span>
                    <span class="font-semibold text-blue-800">{{ formatNumber(calculateReservedWeight()) }} กก.</span>
                  </div>
                </div>
              </div>

              <!-- Whole Roll Summary -->
              <div v-else-if="form.reservation_type === 'whole_roll'" 
                   class="bg-purple-50 border border-purple-200 rounded p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-purple-900">จองทั้งม้วน</span>
                  <span class="text-lg font-bold text-purple-700">{{ formatNumber(availableMeters) }} ม.</span>
                </div>
                
                <div v-if="lot?.weight_kg" class="text-xs text-purple-700">
                  น้ำหนัก: {{ formatNumber(calculateReservedWeight()) }} กก.
                </div>
              </div>

              <!-- Customer Name & Reference Type -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    ชื่อลูกค้า / บริษัท
                  </label>
                  <input
                    v-model="form.customer_name"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="ระบุชื่อลูกค้า (ถ้ามี)"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    สถานะการชำระเงิน <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.payment_status"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="unpaid">ยังไม่ชำระ (Unpaid)</option>
                    <option value="deposit">มีเงินมัดจำ (Deposit)</option>
                    <option value="paid">ชำระแล้ว (Paid)</option>
                  </select>
                </div>
              </div>

              <!-- Reference Type & Reference Number -->
              <div class="grid grid-cols-2 gap-3">
                <div v-if="!referenceType">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    ประเภทเอกสาร
                  </label>
                  <select
                    v-model="form.reference_type"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="manual">🔧 จองด่วน</option>
                    <option value="quotation">📋 ใบเสนอราคา</option>
                    <option value="sales_order">📝 ใบสั่งขาย</option>
                    <option value="invoice">🧾 ใบแจ้งหนี้</option>
                  </select>
                </div>

                <div :class="referenceType ? 'col-span-2' : ''">
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    เลขที่เอกสารอ้างอิง
                  </label>
                  <input
                    v-model="form.reference_number"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="เช่น QT-2025-001 (ถ้ามี)"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <input
                  v-model="form.notes"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="ระบุรายละเอียด..."
                />
              </div>
            </div>

            <!-- Warning -->
            <div class="bg-amber-50 border border-amber-200 rounded p-2">
              <p class="text-xs text-amber-800 flex items-start gap-2">
                <i class="fas fa-info-circle text-amber-600 mt-0.5"></i>
                <span>
                  <strong>ยังไม่ชำระ:</strong> หมดอายุ 7 วัน ยกเลิกได้ • 
                  <strong>มัดจำ:</strong> มีเงินจอง ยกเลิกตามเงื่อนไข • 
                  <strong>ชำระแล้ว:</strong> ตัดสต็อกทันที ยกเลิกไม่ได้
                </span>
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-200">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-gray-700 rounded border border-gray-300 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              @click="handleReserve"
              :disabled="!isFormValid || saving"
              class="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas fa-spinner fa-spin" v-if="saving"></i>
              <i class="fas fa-lock" v-else></i>
              {{ saving ? 'กำลังจอง...' : 'ยืนยันการจอง' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'LotReservationModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    lot: {
      type: Object,
      default: null
    },
    productId: {
      type: String,
      default: null
    },
    // ข้อมูลเพิ่มเติมที่อาจส่งมาจากระบบอื่น
    referenceType: {
      type: String,
      default: null // 'manual', 'quotation', 'sales_order', 'invoice'
    },
    referenceId: {
      type: String,
      default: null
    },
    referenceNumber: {
      type: String,
      default: null
    },
    customerId: {
      type: String,
      default: null
    },
    customerName: {
      type: String,
      default: ''
    },
    // สำหรับระบุค่าเริ่มต้นจำนวนจอง
    defaultReservedMeters: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'reserved', 'close'],
  setup(props, { emit }) {
    const saving = ref(false)
    
    // Form data
    const form = ref({
      reservation_type: 'meters', // 'meters' หรือ 'whole_roll'
      reserved_meters: 0,
      customer_name: '',
      payment_status: 'unpaid', // 'unpaid', 'deposit', 'paid'
      reference_type: 'manual',
      reference_number: '',
      notes: ''
    })

    // Computed: Available meters
    const availableMeters = computed(() => {
      if (!props.lot) return 0
      const total = props.lot.remaining_meters || props.lot.calculated_meters || 0
      const reserved = props.lot.reserved_meters || 0
      return Math.max(0, total - reserved)
    })

    // Computed: Form validation
    const isFormValid = computed(() => {
      if (!props.lot) return false
      
      if (form.value.reservation_type === 'whole_roll') {
        return availableMeters.value > 0
      } else {
        return form.value.reserved_meters > 0 &&
               form.value.reserved_meters <= availableMeters.value
      }
    })

    // Format number
    const formatNumber = (value) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    }

    // Calculate reserved weight (proportional to reserved meters)
    const calculateReservedWeight = () => {
      if (!props.lot?.weight_kg) return 0
      
      const totalMeters = props.lot.remaining_meters || props.lot.calculated_meters || 0
      if (totalMeters === 0) return 0
      
      const reservedMeters = form.value.reservation_type === 'whole_roll' 
        ? availableMeters.value 
        : form.value.reserved_meters
      
      return (reservedMeters / totalMeters) * props.lot.weight_kg
    }

    // Select whole roll
    const selectWholeRoll = () => {
      form.value.reservation_type = 'whole_roll'
      form.value.reserved_meters = availableMeters.value
    }

    // Validate reserved meters
    const validateReservedMeters = () => {
      if (form.value.reserved_meters > availableMeters.value) {
        console.warn('⚠️ Reserved meters exceeds available stock')
      }
    }

    // Reset form
    const resetForm = () => {
      form.value = {
        reservation_type: 'meters',
        reserved_meters: props.defaultReservedMeters || 0,
        customer_name: props.customerName || '',
        payment_status: 'unpaid',
        reference_type: props.referenceType || 'manual',
        reference_number: props.referenceNumber || '',
        notes: ''
      }
    }

    // Watch for lot changes
    watch(() => props.lot, (newLot) => {
      if (newLot) {
        resetForm()
      }
    }, { immediate: true })

    // Watch for props changes
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        resetForm()
      }
    })

    // Close modal
    const closeModal = () => {
      emit('update:modelValue', false)
      emit('close')
      setTimeout(resetForm, 300)
    }

    // Handle reserve
    const handleReserve = async () => {
      if (!isFormValid.value || saving.value) return

      saving.value = true

      try {
        console.log('🔒 [LotReservationModal] Creating reservation...')

        // ตรวจสอบว่ามี InventoryService
        if (!window.ERP_CORE?.inventory) {
          throw new Error('InventoryService not available')
        }

        // คำนวณจำนวนที่จะจอง
        const metersToReserve = form.value.reservation_type === 'whole_roll' 
          ? availableMeters.value 
          : form.value.reserved_meters

        // คำนวณน้ำหนัก
        const weightToReserve = calculateReservedWeight()

        // เตรียมข้อมูลการจอง
        const reservationData = {
          lot_id: props.lot._id,
          product_id: props.productId || props.lot.product_id,
          product_code: props.lot.product_code || props.lot.sku,
          product_name: props.lot.product_name,
          lot_code: props.lot.lot_code,
          
          // Reservation details
          reservation_type: form.value.reservation_type,
          reserved_meters: metersToReserve,
          reserved_weight_kg: weightToReserve,
          
          // Payment status
          payment_status: form.value.payment_status,
          status: form.value.payment_status === 'paid' ? 'paid' : 'not_paid',
          
          // Customer info
          customer_id: props.customerId,
          customer_name: form.value.customer_name || props.customerName,
          
          // Reference
          reference_type: props.referenceType || form.value.reference_type,
          reference_id: props.referenceId,
          reference_number: form.value.reference_number || props.referenceNumber,
          
          // Location
          location: props.lot.location_code,
          
          // Notes
          notes: form.value.notes,
          
          // Reserved by
          reserved_by: 'system' // อาจจะแก้ให้ดึงจาก user session
        }

        console.log('📥 Reservation data:', reservationData)

        // เรียกใช้ฟังก์ชันจอง
        const result = await window.ERP_CORE.inventory.reserveLotStock(reservationData)

        if (result.success) {
          console.log('✅ Reservation created successfully:', result.reservation)

          // Emit event พร้อมข้อมูลที่สร้าง
          emit('reserved', {
            reservation: result.reservation,
            lot_updated: result.lot_updated,
            balance_updated: result.balance_updated
          })

          // แสดง toast notification
          if (window.$toast) {
            const message = form.value.reservation_type === 'whole_roll'
              ? `จองทั้งม้วน (${formatNumber(metersToReserve)} เมตร) จาก Lot ${props.lot.lot_code} สำเร็จ`
              : `จองสต็อค ${formatNumber(metersToReserve)} เมตร จาก Lot ${props.lot.lot_code} สำเร็จ`
            
            window.$toast.success(message)
          }

          // ปิด modal
          closeModal()
        } else {
          throw new Error(result.errors?.join(', ') || 'เกิดข้อผิดพลาด')
        }

      } catch (error) {
        console.error('❌ [LotReservationModal] Error reserving lot:', error)
        
        if (window.$toast) {
          window.$toast.error('ไม่สามารถจองสต็อคได้: ' + error.message)
        }
      } finally {
        saving.value = false
      }
    }

    // Handle ESC key
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && props.modelValue) {
        closeModal()
      }
    }

    // Watch for modal open/close to add/remove ESC listener
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        window.addEventListener('keydown', handleEscKey)
      } else {
        window.removeEventListener('keydown', handleEscKey)
      }
    })

    return {
      saving,
      form,
      availableMeters,
      isFormValid,
      formatNumber,
      calculateReservedWeight,
      selectWholeRoll,
      validateReservedMeters,
      closeModal,
      handleReserve
    }
  }
}
</script>

<style scoped>
/* Modal Fade Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from > div {
  transform: scale(0.95);
}

.modal-fade-leave-to > div {
  transform: scale(0.95);
}
</style>

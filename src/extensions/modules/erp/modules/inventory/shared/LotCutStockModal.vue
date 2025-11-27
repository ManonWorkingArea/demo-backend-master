<!-- Lot Cut Stock Modal Component -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal Container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="bg-purple-600 px-5 py-3 rounded-t-xl">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold text-white flex items-center gap-2">
                  <i class="fas fa-cut"></i>
                  ตัดสต็อค
                </h3>
                <button
                  @click="closeModal"
                  class="text-white hover:text-gray-200 transition-colors"
                  title="ปิด (ESC)"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Lot Information -->
              <div v-if="lot" class="bg-gray-50 border border-gray-200 rounded p-3">
                <div class="grid grid-cols-4 gap-2 text-xs">
                  <div class="text-center p-2 bg-white rounded border border-gray-200">
                    <div class="text-gray-500 mb-0.5">Lot Code</div>
                    <div class="font-bold text-gray-700">{{ lot.lot_code }}</div>
                  </div>
                  <div class="text-center p-2 bg-white rounded border border-gray-200">
                    <div class="text-gray-500 mb-0.5">รหัส Lot</div>
                    <div class="font-mono text-xs text-gray-700">{{ lot.full_lot_code || '-' }}</div>
                  </div>
                  <div class="text-center p-2 bg-white rounded border border-gray-200">
                    <div class="text-gray-500 mb-0.5">คงเหลือ</div>
                    <div class="font-bold text-blue-700">{{ lot.remaining_meters || 0 }} ม.</div>
                  </div>
                  <div class="text-center p-2 bg-white rounded border border-gray-200">
                    <div class="text-gray-500 mb-0.5">พร้อมใช้</div>
                    <div class="font-bold text-green-700">{{ availableMeters }} ม.</div>
                  </div>
                </div>
              </div>

              <!-- Warning if no paid reservations -->
              <div v-if="!hasPaidReservations" class="bg-red-50 border border-red-200 rounded p-3">
                <div class="flex items-start gap-2">
                  <i class="fas fa-exclamation-triangle text-red-600 text-sm mt-0.5"></i>
                  <div class="flex-1">
                    <h4 class="font-semibold text-red-800 text-sm mb-1">ไม่สามารถตัดสต็อคได้</h4>
                    <p class="text-xs text-red-700">
                      ไม่มีรายการจองที่ชำระเงินแล้ว กรุณาสร้างการจองและยืนยันการชำระเงินก่อนตัดสต็อค
                    </p>
                  </div>
                </div>
              </div>

              <!-- Paid Reservations List -->
              <div v-else>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-xs text-gray-700 flex items-center gap-2">
                    <i class="fas fa-list-check text-green-600"></i>
                    รายการจองที่ชำระเงินแล้ว
                  </h4>
                  <span class="text-xs text-gray-500">{{ paidReservations.length }} รายการ</span>
                </div>

                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div
                    v-for="reservation in paidReservations"
                    :key="reservation._id"
                    class="border-2 rounded p-3 cursor-pointer transition-all"
                    :class="{
                      'border-purple-500 bg-purple-50': selectedReservation?._id === reservation._id,
                      'border-gray-200 hover:border-purple-300 bg-white': selectedReservation?._id !== reservation._id
                    }"
                    @click="selectReservation(reservation)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1.5">
                          <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                               :class="{
                                 'border-purple-500 bg-purple-500': selectedReservation?._id === reservation._id,
                                 'border-gray-300': selectedReservation?._id !== reservation._id
                               }">
                            <i v-if="selectedReservation?._id === reservation._id" 
                               class="fas fa-check text-white text-xs"></i>
                          </div>
                          <span class="font-semibold text-sm text-gray-800">{{ reservation.customer_name || 'ไม่ระบุลูกค้า' }}</span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2 text-xs ml-6">
                          <div class="flex items-center gap-1">
                            <i class="fas fa-ruler text-gray-400"></i>
                            <span class="text-gray-600">จอง:</span>
                            <span class="font-semibold text-blue-700">{{ reservation.reserved_meters }} ม.</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <i class="fas fa-file-alt text-gray-400"></i>
                            <span class="text-gray-600">เอกสาร:</span>
                            <span class="font-mono text-xs text-gray-700">{{ reservation.reference_number || '-' }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <i class="fas fa-calendar text-gray-400"></i>
                            <span class="text-gray-600">วันจอง:</span>
                            <span class="text-gray-700">{{ formatDate(reservation.reserved_date) }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <span class="font-semibold text-green-700">ชำระแล้ว</span>
                          </div>
                        </div>

                        <div v-if="reservation.notes" class="mt-2 ml-6 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                          <i class="fas fa-comment text-gray-400 mr-1"></i>
                          {{ reservation.notes }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cut Amount Input -->
                <div v-if="selectedReservation" class="mt-3 space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">
                      จำนวนที่ต้องการตัด (เมตร) <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <div class="relative flex-1">
                        <input
                          v-model.number="cutMeters"
                          type="number"
                          step="0.01"
                          min="0"
                          :max="selectedReservation.reserved_meters"
                          class="w-full pl-3 pr-12 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="0.00"
                        />
                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                          เมตร
                        </div>
                      </div>
                      <button
                        @click="cutMeters = selectedReservation.reserved_meters"
                        class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors whitespace-nowrap"
                      >
                        ตัดทั้งหมด
                      </button>
                    </div>
                    <div class="mt-1 flex items-center justify-between text-xs">
                      <span class="text-blue-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        สูงสุด: {{ selectedReservation.reserved_meters }} เมตร
                      </span>
                      <span v-if="cutMeters > 0" class="font-semibold text-purple-700">
                        เหลือในการจอง: {{ (selectedReservation.reserved_meters - cutMeters).toFixed(2) }} ม.
                      </span>
                    </div>
                  </div>

                  <!-- Additional Notes -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      หมายเหตุการตัดสต็อค (ถ้ามี)
                    </label>
                    <textarea
                      v-model="cutNotes"
                      rows="2"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      placeholder="ระบุหมายเหตุเพิ่มเติม..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 rounded-b-xl flex items-center justify-end gap-2 border-t border-gray-200">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>

            <button
              @click="handleCutStock"
              :disabled="!canCutStock || processing"
              class="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas fa-cut" :class="{ 'fa-spin': processing }"></i>
              <span>{{ processing ? 'กำลังตัดสต็อค...' : 'ยืนยันตัดสต็อค' }}</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'LotCutStockModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    lot: {
      type: Object,
      default: null
    },
    paidReservations: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'cut-stock'],
  setup(props, { emit }) {
    const selectedReservation = ref(null)
    const cutMeters = ref(0)
    const cutNotes = ref('')
    const processing = ref(false)

    // Computed
    const hasPaidReservations = computed(() => {
      return props.paidReservations && props.paidReservations.length > 0
    })

    const availableMeters = computed(() => {
      if (!props.lot) return 0
      const remaining = props.lot.remaining_meters || 0
      const reserved = props.lot.reserved_meters || 0
      return remaining - reserved
    })

    const canCutStock = computed(() => {
      return (
        selectedReservation.value &&
        cutMeters.value > 0 &&
        cutMeters.value <= selectedReservation.value.reserved_meters &&
        cutMeters.value <= (props.lot?.remaining_meters || 0) &&
        !processing.value
      )
    })

    // Methods
    const selectReservation = (reservation) => {
      selectedReservation.value = reservation
      cutMeters.value = reservation.reserved_meters
    }

    const closeModal = () => {
      if (!processing.value) {
        resetForm()
        emit('close')
      }
    }

    const handleBackdropClick = () => {
      closeModal()
    }

    const resetForm = () => {
      selectedReservation.value = null
      cutMeters.value = 0
      cutNotes.value = ''
      processing.value = false
    }

    const handleCutStock = async () => {
      if (!canCutStock.value) return

      processing.value = true

      try {
        const cutData = {
          lot_id: props.lot._id,
          reservation_id: selectedReservation.value._id,
          cut_meters: cutMeters.value,
          notes: cutNotes.value
        }

        emit('cut-stock', cutData)
        
        // Modal will be closed by parent after successful cut
      } catch (error) {
        console.error('Error in cut stock modal:', error)
        processing.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }

    // Watch for modal open/close
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        // Auto-select first reservation if only one
        if (props.paidReservations.length === 1) {
          selectReservation(props.paidReservations[0])
        }
      } else {
        resetForm()
      }
    })

    return {
      selectedReservation,
      cutMeters,
      cutNotes,
      processing,
      hasPaidReservations,
      availableMeters,
      canCutStock,
      selectReservation,
      closeModal,
      handleBackdropClick,
      handleCutStock,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}

/* Custom Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>

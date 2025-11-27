<!-- Lot Detail Modal Component -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show && lot" class="fixed inset-0 z-50 bg-black bg-opacity-50" @click.self="handleClose">
        <div class="flex h-full">
          <!-- Modal Content -->
          <div class="w-full lg:w-2/3 xl:w-1/2 bg-white ml-auto overflow-y-auto">
            <!-- Header - Clean Purple Theme -->
            <div class="sticky top-0 z-10 bg-purple-600 text-white px-5 py-3 flex items-center justify-between shadow-md">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <i class="fas fa-box-open text-base"></i>
                รายละเอียด Lot: {{ lot.lot_code }}
              </h2>
              <button
                @click="handleClose"
                class="p-1.5 hover:bg-purple-700 rounded-lg transition-colors"
                title="ปิด"
              >
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
                <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            </div>

            <!-- Content - Clean & Compact -->
            <div v-else class="p-4 space-y-3">
              <!-- Lot Information Card -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <i class="fas fa-info-circle text-purple-600 text-xs"></i>
                    ข้อมูลพื้นฐาน
                  </h3>
                </div>
                
                <div class="p-3 space-y-2 text-sm">
                  <!-- Lot Code -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">รหัส Lot:</span>
                    <span class="font-semibold text-gray-800">{{ lot.lot_code || '-' }}</span>
                  </div>

                  <!-- Full Lot Code -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">รหัสเต็ม:</span>
                    <span class="font-mono text-sm font-semibold text-gray-800">{{ lot.full_lot_code || '-' }}</span>
                  </div>

                  <!-- Supplier -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">ผู้ส่งมอบ:</span>
                    <span class="font-semibold text-gray-800">{{ lot.supplier_name || '-' }}</span>
                  </div>

                  <!-- Location -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">สถานที่:</span>
                    <span class="font-semibold text-gray-800">
                      {{ lot.location_code || '-' }}
                      <span v-if="lot.rack_position" class="text-gray-500 text-xs ml-1">({{ lot.rack_position }})</span>
                    </span>
                  </div>

                  <!-- Received Date -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">วันที่รับเข้า:</span>
                    <span class="font-semibold text-gray-800">{{ formatDate(lot.received_date) }}</span>
                  </div>

                  <!-- Status -->
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">สถานะ:</span>
                    <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', getStatusInfo(lot.status).colorClass]">
                      <span :class="['w-1.5 h-1.5 rounded-full', getStatusInfo(lot.status).dotClass]"></span>
                      {{ getStatusInfo(lot.status).label }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Stock Summary Card -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <i class="fas fa-warehouse text-purple-600 text-xs"></i>
                    สรุปสต็อค
                  </h3>
                </div>

                <div class="p-3">
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <!-- Total Meters -->
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                    <div class="text-xs text-blue-600 font-medium mb-0.5">ทั้งหมด</div>
                    <div class="text-lg font-bold text-blue-700">{{ formatNumber(lot.remaining_meters ?? lot.calculated_meters ?? 0) }}</div>
                    <div class="text-xs text-blue-600">ม.</div>
                  </div>

                  <!-- Reserved -->
                  <div class="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                    <div class="text-xs text-orange-600 font-medium mb-0.5">กำหนด</div>
                    <div class="text-lg font-bold text-orange-700">{{ formatNumber(lot.reserved_meters ?? 0) }}</div>
                    <div class="text-xs text-orange-600">ม.</div>
                  </div>

                  <!-- Available -->
                  <div :class="['border rounded-lg p-2 text-center', getAvailableStockColor(lot).replace('text-', 'bg-').replace('-600', '-50'), getAvailableStockColor(lot).replace('text-', 'border-').replace('-600', '-200')]">
                    <div :class="['text-xs font-medium mb-0.5', getAvailableStockColor(lot)]">พร้อมใช้</div>
                    <div :class="['text-lg font-bold', getAvailableStockColor(lot)]">{{ formatNumber(getLotAvailableMeters(lot)) }}</div>
                    <div :class="['text-xs', getAvailableStockColor(lot)]">ม.</div>
                  </div>

                  <!-- Weight -->
                  <div class="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                    <div class="text-xs text-purple-600 font-medium mb-0.5">น้ำหนัก</div>
                    <div class="text-lg font-bold text-purple-700">{{ formatNumber(lot.weight_kg ?? 0) }}</div>
                    <div class="text-xs text-purple-600">กก.</div>
                  </div>

                  <!-- Meters per KG (NEW) -->
                  <div class="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <div class="text-xs text-green-600 font-medium mb-0.5">ม./กก.</div>
                    <div class="text-lg font-bold text-green-700">{{ formatNumber(lot.meters_per_kg ?? 0, 2) }}</div>
                    <div class="text-xs text-green-600">สำหรับชั่ง</div>
                  </div>
                </div>
รง
                <!-- Scrap/Sample/Defective Breakdown -->
                <div v-if="lot.scrap_meters || lot.sample_meters || lot.defective_meters" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="text-xs text-gray-600 font-medium mb-2">
                    <i class="fas fa-exclamation-triangle mr-1"></i>ข้อมูลที่ไม่นับสต็อก:
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <!-- Scrap -->
                    <div v-if="lot.scrap_meters" class="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                      <div class="text-xs text-red-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                        <i class="fas fa-trash-alt"></i>
                        ของเสีย
                      </div>
                      <div class="text-base font-bold text-red-700">{{ formatNumber(lot.scrap_meters) }}</div>
                      <div class="text-xs text-red-600">ม.</div>
                    </div>

                    <!-- Sample -->
                    <div v-if="lot.sample_meters" class="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                      <div class="text-xs text-green-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                        <i class="fas fa-flask"></i>
                        ตัวอย่าง
                      </div>
                      <div class="text-base font-bold text-green-700">{{ formatNumber(lot.sample_meters) }}</div>
                      <div class="text-xs text-green-600">ม.</div>
                    </div>

                    <!-- Defective -->
                    <div v-if="lot.defective_meters" class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                      <div class="text-xs text-amber-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                        <i class="fas fa-exclamation-circle"></i>
                        ชำรุด
                      </div>
                      <div class="text-base font-bold text-amber-700">{{ formatNumber(lot.defective_meters) }}</div>
                      <div class="text-xs text-amber-600">ม.</div>
                    </div>
                  </div>
                </div>

                </div>
                
                <!-- Breakdown -->
                <div v-if="lot.temporary_reserved_meters || lot.permanent_reserved_meters" class="px-3 pb-3">
                  <div class="text-xs text-gray-500 mb-1.5">รายละเอียดการจอง:</div>
                  <div class="flex gap-3 text-xs">
                    <div v-if="lot.temporary_reserved_meters" class="flex items-center gap-1.5">
                      <i class="fas fa-clock text-yellow-600"></i>
                      <span class="text-gray-700">ชั่วคราว: <span class="font-semibold">{{ formatNumber(lot.temporary_reserved_meters) }} ม.</span></span>
                    </div>
                    <div v-if="lot.permanent_reserved_meters" class="flex items-center gap-1.5">
                      <i class="fas fa-lock text-red-600"></i>
                      <span class="text-gray-700">ถาวร: <span class="font-semibold">{{ formatNumber(lot.permanent_reserved_meters) }} ม.</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QR Code & Barcode -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <i class="fas fa-qrcode text-purple-600 text-xs"></i>
                    QR Code & Barcode
                  </h3>
                </div>

                <div class="p-3">
                <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <!-- QR Code -->
                  <div class="text-center">
                    <div class="bg-gray-50 p-2 rounded-lg inline-block">
                      <img 
                        :src="`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lot.full_lot_code || lot.lot_code)}&code=QRCode&translate-esc=on&eclevel=L&dpi=96&imagetype=Gif`"
                        alt="QR Code"
                        class="w-24 h-24"
                      >
                    </div>
                    <div class="text-xs text-gray-500 mt-1">QR Code</div>
                  </div>

                  <!-- Barcode -->
                  <div class="text-center">
                    <div class="bg-gray-50 p-2 rounded-lg inline-block">
                      <img 
                        :src="`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lot.full_lot_code || lot.lot_code)}&code=Code128&translate-esc=on&dpi=96&imagetype=Gif`"
                        alt="Barcode"
                        class="h-16"
                      >
                    </div>
                    <div class="text-xs text-gray-500 mt-1 font-mono">{{ lot.full_lot_code || lot.lot_code }}</div>
                  </div>
                </div>

                </div>
                
                <!-- Print Button -->
                <div class="px-3 pb-3 text-center">
                  <button
                    @click="printBarcodes"
                    class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <i class="fas fa-print"></i>
                    <span>พิมพ์</span>
                  </button>
                </div>
              </div>

              <!-- Reservations -->
              <div v-if="reservations.length > 0" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <i class="fas fa-bookmark text-purple-600 text-xs"></i>
                      การจอง
                    </span>
                    <span class="text-xs bg-purple-200 px-2 py-0.5 rounded-full">{{ reservations.length }}</span>
                  </h3>
                </div>

                <div class="p-3 space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="reservation in reservations"
                    :key="reservation._id"
                    class="border border-gray-200 rounded p-2 hover:border-purple-300 transition-colors text-sm"
                  >
                    <div class="flex items-start justify-between mb-1.5">
                      <div>
                        <div class="font-semibold text-gray-800 text-xs">{{ reservation.customer_name || 'ไม่ระบุลูกค้า' }}</div>
                        <div class="text-xs text-gray-500">{{ formatDate(reservation.created_at) }}</div>
                      </div>
                      <span :class="getReservationStatusClass(reservation.status)">
                        {{ getReservationStatusLabel(reservation.status) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-600">จำนวน:</span>
                      <span class="font-semibold text-gray-800">{{ formatNumber(reservation.reserved_meters) }} ม.</span>
                    </div>
                    <div v-if="reservation.reference_number" class="text-xs text-gray-500 mt-1">
                      เอกสาร: {{ reservation.reference_number }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Movements -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <i class="fas fa-exchange-alt text-purple-600 text-xs"></i>
                    ประวัติการเคลื่อนไหว
                  </h3>
                  <button
                    @click="loadMovements"
                    :disabled="loadingMovements"
                    class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                  >
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingMovements }"></i>
                  </button>
                </div>

                <div v-if="loadingMovements" class="p-3 text-center text-sm text-gray-500">
                  <i class="fas fa-spinner fa-spin"></i> กำลังโหลด...
                </div>

                <div v-else-if="movements.length === 0" class="p-3 text-center text-sm text-gray-500">
                  <i class="fas fa-inbox text-2xl mb-1"></i>
                  <div>ไม่มีประวัติการเคลื่อนไหว</div>
                </div>

                <div v-else class="p-3 space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="movement in movements"
                    :key="movement._id"
                    class="border border-gray-200 rounded p-2 hover:border-purple-300 transition-colors text-xs"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-1.5">
                        <span :class="['w-1.5 h-1.5 rounded-full', movement.movement_type === 'IN' ? 'bg-green-500' : 'bg-red-500']"></span>
                        <span class="font-semibold text-gray-800">{{ movement.transaction_type || movement.movement_type }}</span>
                      </div>
                      <span class="text-gray-500">{{ formatDate(movement.movement_date) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600">จำนวน:</span>
                      <span :class="['font-semibold', movement.movement_type === 'IN' ? 'text-green-700' : 'text-red-700']">
                        {{ movement.movement_type === 'IN' ? '+' : '-' }}{{ formatNumber(movement.quantity) }} ม.
                      </span>
                    </div>
                    <div v-if="movement.notes" class="text-gray-500 mt-1">
                      {{ movement.notes }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inventory Balance -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-purple-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <i class="fas fa-balance-scale text-purple-600 text-xs"></i>
                    ยอดคงคลัง
                  </h3>
                  <button
                    @click="loadBalance"
                    :disabled="loadingBalance"
                    class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                  >
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingBalance }"></i>
                  </button>
                </div>

                <div v-if="loadingBalance" class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <div class="text-sm">กำลังโหลด...</div>
                </div>

                <div v-else-if="!balance" class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-3xl mb-2"></i>
                  <div class="text-sm">ไม่มีข้อมูลยอดคงคลัง</div>
                </div>

                <div v-else class="space-y-3">
                  <div class="grid grid-cols-3 gap-3">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div class="text-xs text-blue-600 mb-1">มีอยู่</div>
                      <div class="text-lg font-bold text-blue-700">{{ formatNumber(balance.qty_on_hand ?? 0) }}</div>
                    </div>
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div class="text-xs text-orange-600 mb-1">จอง</div>
                      <div class="text-lg font-bold text-orange-700">{{ formatNumber(balance.qty_reserved ?? 0) }}</div>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div class="text-xs text-green-600 mb-1">พร้อมใช้</div>
                      <div class="text-lg font-bold text-green-700">{{ formatNumber(balance.qty_available ?? 0) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons - Clean & Compact -->
              <div class="flex gap-2 pt-2">
                <button
                  @click="$emit('reserve', lot)"
                  :disabled="getLotAvailableMeters(lot) <= 0"
                  class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <i class="fas fa-lock text-xs"></i>
                  <span>จองสต็อค</span>
                </button>

                <button
                  @click="$emit('cut', lot)"
                  :disabled="(lot.permanent_reserved_meters || 0) <= 0"
                  class="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <i class="fas fa-cut text-xs"></i>
                  <span>ตัดสต็อค</span>
                </button>

                <button
                  @click="$emit('return', lot)"
                  class="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <i class="fas fa-undo text-xs"></i>
                  <span>รับคืน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'LotDetailModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    lot: {
      type: Object,
      default: null
    },
    productId: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'reserve', 'cut', 'return'],
  setup(props, { emit }) {
    const loading = ref(false)
    const loadingMovements = ref(false)
    const loadingBalance = ref(false)
    const reservations = ref([])
    const movements = ref([])
    const balance = ref(null)

    // Format functions
    const formatNumber = (value, decimals = 2) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      try {
        return new Date(dateString).toLocaleDateString('th-TH', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    }

    const getLotAvailableMeters = (lot) => {
      if (!lot) return 0
      const total = lot.remaining_meters ?? lot.calculated_meters ?? 0
      const reserved = lot.reserved_meters ?? 0
      return total - reserved
    }

    const getAvailableStockColor = (lot) => {
      const available = getLotAvailableMeters(lot)
      const total = lot.remaining_meters ?? lot.calculated_meters ?? 0
      
      if (available <= 0) {
        return 'text-red-600'
      }
      
      if (total > 0 && (available / total) < 0.5) {
        return 'text-orange-600'
      }
      
      return 'text-green-600'
    }

    const getStatusInfo = (status) => {
      const statusMap = {
        'active': {
          label: 'พร้อมใช้',
          colorClass: 'bg-green-100 text-green-800',
          dotClass: 'bg-green-500'
        },
        'partial': {
          label: 'ใช้แล้วบางส่วน',
          colorClass: 'bg-yellow-100 text-yellow-800',
          dotClass: 'bg-yellow-500'
        },
        'empty': {
          label: 'ใช้หมดแล้ว',
          colorClass: 'bg-red-100 text-red-800',
          dotClass: 'bg-red-500'
        },
        'reserved': {
          label: 'จองแล้ว',
          colorClass: 'bg-blue-100 text-blue-800',
          dotClass: 'bg-blue-500'
        }
      }

      return statusMap[status] || {
        label: 'ไม่ทราบสถานะ',
        colorClass: 'bg-gray-100 text-gray-800',
        dotClass: 'bg-gray-500'
      }
    }

    const getReservationStatusLabel = (status) => {
      const labels = {
        'not_paid': 'รอชำระ',
        'paid': 'ชำระแล้ว',
        'completed': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก',
        'expired': 'หมดอายุ'
      }
      return labels[status] || status
    }

    const getReservationStatusClass = (status) => {
      const classes = {
        'not_paid': 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
        'paid': 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
        'completed': 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
        'cancelled': 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800',
        'expired': 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
      }
      return classes[status] || 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    }

    // Load reservations
    const loadReservations = async () => {
      if (!props.lot || !props.lot._id) return

      try {
        const lotIdToQuery = props.lot.lot_id || props.lot._id

        const pipeline = [
          {
            $match: {
              lot_id: lotIdToQuery,
              status: { $ne: 'cancelled' }
            }
          },
          {
            $sort: { created_at: -1 }
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('lot_reservations/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        reservations.value = result?.data || []
        console.log(`✅ Loaded ${reservations.value.length} reservations`)
      } catch (error) {
        console.error('❌ Error loading reservations:', error)
        reservations.value = []
      }
    }

    // Load stock movements
    const loadMovements = async () => {
      if (!props.lot || !props.lot._id) return

      loadingMovements.value = true
      try {
        const lotIdToQuery = props.lot.lot_id || props.lot._id

        const pipeline = [
          {
            $match: {
              product_id: props.productId,
              lot_id: lotIdToQuery
            }
          },
          {
            $sort: { created_at: -1 }
          },
          {
            $limit: 50
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('stock_movements/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        movements.value = result?.data || []
        console.log(`✅ Loaded ${movements.value.length} movements`)
      } catch (error) {
        console.error('❌ Error loading movements:', error)
        movements.value = []
      } finally {
        loadingMovements.value = false
      }
    }

    // Load inventory balance
    const loadBalance = async () => {
      if (!props.lot || !props.lot._id) return

      loadingBalance.value = true
      try {
        const pipeline = [
          {
            $match: {
              product_id: props.productId
            }
          }
        ]

        const result = await window.ERP_CORE.inventory.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: pipeline
        }, window.ERP_CORE.inventory.clientKey)

        const fullBalance = result?.data?.[0] || null
        
        if (fullBalance?.lot_details) {
          const lotIdToQuery = props.lot.lot_id || props.lot._id
          const lotDetail = fullBalance.lot_details.find(
            detail => detail.lot_id === lotIdToQuery
          )
          
          balance.value = lotDetail || null
        } else {
          balance.value = null
        }

        console.log('✅ Loaded balance:', balance.value)
      } catch (error) {
        console.error('❌ Error loading balance:', error)
        balance.value = null
      } finally {
        loadingBalance.value = false
      }
    }

    // Print barcodes
    const printBarcodes = () => {
      const lotCode = props.lot.full_lot_code || props.lot.lot_code
      
      const width = 700
      const height = 700
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      
      const printWindow = window.open('', 'PrintWindow', `width=${width},height=${height},left=${left},top=${top}`)
      if (!printWindow) return

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode - ${lotCode}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              .barcode-container {
                text-align: center;
                page-break-inside: avoid;
              }
              .qr-code, .barcode {
                margin: 20px 0;
              }
              .lot-code {
                font-size: 18px;
                font-weight: bold;
                margin-top: 10px;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="qr-code">
                <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lotCode)}&code=QRCode&translate-esc=on&eclevel=L&dpi=200&imagetype=Gif" alt="QR Code">
              </div>
              <div class="barcode">
                <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(lotCode)}&code=Code128&translate-esc=on&dpi=200&imagetype=Gif" alt="Barcode">
              </div>
              <div class="lot-code">${lotCode}</div>
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        setTimeout(() => printWindow.close(), 500)
      }, 1000)
    }

    // Handle close
    const handleClose = () => {
      emit('close')
    }

    // Lock/Unlock body scroll
    const lockBodyScroll = () => {
      document.body.style.overflow = 'hidden'
    }

    const unlockBodyScroll = () => {
      document.body.style.overflow = ''
    }

    // Watch for show changes
    watch(() => props.show, async (newVal) => {
      if (newVal && props.lot) {
        lockBodyScroll()
        loading.value = true
        
        // Load all data
        await Promise.all([
          loadReservations(),
          loadMovements(),
          loadBalance()
        ])
        
        loading.value = false
      } else {
        unlockBodyScroll()
        // Reset data
        reservations.value = []
        movements.value = []
        balance.value = null
      }
    })

    return {
      loading,
      loadingMovements,
      loadingBalance,
      reservations,
      movements,
      balance,
      formatNumber,
      formatDate,
      getLotAvailableMeters,
      getAvailableStockColor,
      getStatusInfo,
      getReservationStatusLabel,
      getReservationStatusClass,
      loadMovements,
      loadBalance,
      printBarcodes,
      handleClose
    }
  }
}
</script>

<style scoped>
/* Modal Transition Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div {
  transform: translateX(100%);
}

.modal-leave-to > div {
  transform: translateX(100%);
}

/* Smooth scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

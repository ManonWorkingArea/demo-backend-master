<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="close">
        <div class="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="bg-orange-600 text-white px-5 py-3 flex items-center justify-between sticky top-0 z-10">
            <h3 class="text-base font-semibold flex items-center gap-2">
              <i class="fas fa-undo"></i>
              รับสินค้าคืน / เครมสินค้า
            </h3>
            <button 
              @click="close" 
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
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">คงเหลือ</div>
                  <div class="font-bold text-blue-700">{{ formatNumber(lot.remaining_meters) }}</div>
                </div>
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">รหัส Lot</div>
                  <div class="font-mono text-xs text-gray-700">{{ lot.lot_code }}</div>
                </div>
                <div class="text-center p-2 bg-white rounded border border-gray-200">
                  <div class="text-gray-500 mb-0.5">คลัง</div>
                  <div class="font-bold text-gray-700">{{ lot.location_code }}</div>
                </div>
              </div>
            </div>

            <!-- Return Form -->
            <div class="space-y-3">
              <!-- Return Type Selection -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  ประเภทการคืน <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <!-- เครม/คืนเงิน -->
                  <button
                    @click="formData.return_type = 'refund'"
                    type="button"
                    class="p-3 border-2 rounded transition-all text-center"
                    :class="{
                      'border-blue-600 bg-blue-50': formData.return_type === 'refund',
                      'border-gray-300 hover:border-blue-300 bg-white': formData.return_type !== 'refund'
                    }"
                  >
                    <div class="w-8 h-8 mx-auto rounded flex items-center justify-center mb-1"
                         :class="formData.return_type === 'refund' ? 'bg-blue-600' : 'bg-gray-200'">
                      <i class="fas fa-money-bill-wave text-sm"
                         :class="formData.return_type === 'refund' ? 'text-white' : 'text-gray-500'"></i>
                    </div>
                    <div class="font-semibold text-xs"
                         :class="formData.return_type === 'refund' ? 'text-blue-700' : 'text-gray-800'">
                      เครม/คืนเงิน
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">สินค้ากลับเข้าสต็อค</div>
                  </button>

                  <!-- เปลี่ยนสินค้า -->
                  <button
                    @click="formData.return_type = 'exchange'"
                    type="button"
                    class="p-3 border-2 rounded transition-all text-center"
                    :class="{
                      'border-green-600 bg-green-50': formData.return_type === 'exchange',
                      'border-gray-300 hover:border-green-300 bg-white': formData.return_type !== 'exchange'
                    }"
                  >
                    <div class="w-8 h-8 mx-auto rounded flex items-center justify-center mb-1"
                         :class="formData.return_type === 'exchange' ? 'bg-green-600' : 'bg-gray-200'">
                      <i class="fas fa-exchange-alt text-sm"
                         :class="formData.return_type === 'exchange' ? 'text-white' : 'text-gray-500'"></i>
                    </div>
                    <div class="font-semibold text-xs"
                         :class="formData.return_type === 'exchange' ? 'text-green-700' : 'text-gray-800'">
                      เปลี่ยนสินค้า
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">สินค้ากลับเข้าสต็อค</div>
                  </button>

                  <!-- ของเสีย -->
                  <button
                    @click="formData.return_type = 'defective'"
                    type="button"
                    class="p-3 border-2 rounded transition-all text-center"
                    :class="{
                      'border-red-600 bg-red-50': formData.return_type === 'defective',
                      'border-gray-300 hover:border-red-300 bg-white': formData.return_type !== 'defective'
                    }"
                  >
                    <div class="w-8 h-8 mx-auto rounded flex items-center justify-center mb-1"
                         :class="formData.return_type === 'defective' ? 'bg-red-600' : 'bg-gray-200'">
                      <i class="fas fa-exclamation-triangle text-sm"
                         :class="formData.return_type === 'defective' ? 'text-white' : 'text-gray-500'"></i>
                    </div>
                    <div class="font-semibold text-xs"
                         :class="formData.return_type === 'defective' ? 'text-red-700' : 'text-gray-800'">
                      ของเสีย
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">ไม่กลับเข้าสต็อค</div>
                  </button>
                </div>
              </div>

              <!-- Warning for Defective -->
              <div v-if="formData.return_type === 'defective'" class="bg-red-50 border border-red-200 rounded p-2">
                <p class="text-xs text-red-700">
                  <i class="fas fa-exclamation-circle mr-1"></i>
                  <strong>คำเตือน:</strong> สินค้าจะ<strong>ไม่กลับเข้าสต็อค</strong>ปกติ และจะถูกบันทึกเป็น "ของเสีย" แยกต่างหาก
                </p>
              </div>

              <!-- Select Sale Transaction -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  เลือกรายการขายที่ต้องการคืน <span class="text-red-500">*</span>
                </label>

                <!-- No OUT movements -->
                <div v-if="returnableMovements.length === 0" class="bg-amber-50 border border-amber-200 rounded p-3 text-center">
                  <i class="fas fa-box-open text-amber-600 text-xl mb-1"></i>
                  <p class="text-xs text-amber-800 font-medium">ไม่พบรายการขาย (OUT)</p>
                  <p class="text-xs text-amber-600 mt-0.5">Lot นี้ยังไม่มีการขายออก จึงไม่สามารถรับคืนได้</p>
                </div>

                <!-- Movements list -->
                <div v-else class="space-y-2 max-h-48 overflow-y-auto">
                  <div
                    v-for="movement in returnableMovements"
                    :key="movement._id"
                    @click="selectMovement(movement)"
                    class="border-2 rounded p-2 cursor-pointer transition-all hover:shadow-sm"
                    :class="selectedMovement?._id === movement._id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                          <i class="fas fa-arrow-up text-red-600 text-xs"></i>
                        </div>
                        <div>
                          <div class="text-xs font-semibold text-gray-900">{{ formatDate(movement.movement_date) }}</div>
                          <div class="text-xs text-gray-500">{{ movement.transaction_type || 'sale' }}</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-bold text-red-600">{{ formatNumber(movement.quantity || movement.quantity_meters || 0) }} ม.</div>
                        <div v-if="movement.returned_meters > 0" class="text-xs text-orange-600 mt-0.5">
                          คืนแล้ว {{ formatNumber(movement.returned_meters) }} ม.
                        </div>
                      </div>
                    </div>
                    
                    <!-- แสดงจำนวนที่คืนได้คงเหลือ -->
                    <div v-if="movement.returnable_meters !== undefined" class="mt-1.5 pt-1.5 border-t border-gray-200">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-600">
                          <i class="fas fa-undo mr-1"></i>คืนได้คงเหลือ:
                        </span>
                        <span class="font-bold text-green-600">{{ formatNumber(movement.returnable_meters) }} ม.</span>
                      </div>
                    </div>
                    
                    <div v-if="selectedMovement?._id === movement._id" class="mt-1.5 pt-1.5 border-t border-orange-200">
                      <div class="text-xs text-orange-700 font-medium">
                        <i class="fas fa-check-circle mr-1"></i>
                        เลือกรายการนี้แล้ว - สามารถคืนได้สูงสุด {{ formatNumber(maxReturnableMeters) }} เมตร
                      </div>
                      <div class="text-xs text-gray-500 mt-1 font-mono">
                        ID: {{ movement._id }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Location + Return Meters (2 Columns) -->
              <div v-if="selectedMovement" class="grid grid-cols-2 gap-3">
                <!-- Stock Location -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    คลังที่รับคืนเข้า <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <button
                      type="button"
                      @click="toggleLocationDropdown"
                      class="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                      :class="{ 'ring-1 ring-orange-500': showLocationDropdown }"
                    >
                      <span :class="formData.return_location_code ? 'text-gray-900' : 'text-gray-400'">
                        {{ selectedLocationDisplay || 'เลือกคลัง' }}
                      </span>
                      <i class="fas fa-chevron-down text-xs" :class="{ 'rotate-180': showLocationDropdown }"></i>
                    </button>
                    
                    <!-- Dropdown Panel -->
                    <div
                      v-if="showLocationDropdown"
                      class="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      <!-- Loading State -->
                      <div v-if="loadingLocations" class="px-3 py-4 text-sm text-gray-500 text-center">
                        <i class="fas fa-spinner fa-spin mb-1"></i>
                        <div>กำลังโหลด...</div>
                      </div>
                      
                      <!-- Location List -->
                      <div v-else-if="availableLocations.length > 0">
                        <div
                          v-for="location in availableLocations"
                          :key="location.code"
                          @click="selectLocation(location)"
                          class="px-3 py-2 text-sm hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                          :class="{ 'bg-orange-100': formData.return_location_code === location.code }"
                        >
                          <div class="flex items-start justify-between gap-2">
                            <div class="flex-1">
                              <div class="flex items-center gap-2 mb-0.5">
                                <span class="font-medium text-gray-900">{{ location.code }}</span>
                                <span 
                                  class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded"
                                  :class="{
                                    'bg-red-100 text-red-700': location.type === 'scrap',
                                    'bg-green-100 text-green-700': location.type === 'sample',
                                    'bg-purple-100 text-purple-700': location.type === 'virtual',
                                    'bg-blue-100 text-blue-700': location.type === 'warehouse'
                                  }"
                                >
                                  <i class="fas mr-1" :class="{
                                    'fa-trash-alt': location.type === 'scrap',
                                    'fa-flask': location.type === 'sample',
                                    'fa-cloud': location.type === 'virtual',
                                    'fa-warehouse': location.type === 'warehouse'
                                  }"></i>
                                  {{ getLocationTypeLabel(location.type) }}
                                </span>
                              </div>
                              <div class="text-xs text-gray-600">{{ location.name }}</div>
                            </div>
                            <i v-if="formData.return_location_code === location.code" class="fas fa-check text-orange-600 mt-1"></i>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Empty State -->
                      <div v-else class="px-3 py-4 text-sm text-gray-500 text-center">
                        <i class="fas fa-info-circle mb-1"></i>
                        <div>ไม่มีข้อมูล Warehouse</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Return Meters -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    จำนวนที่คืน (เมตร) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="formData.return_meters"
                      type="number"
                      step="0.01"
                      min="0.01"
                      :max="maxReturnableMeters"
                      class="w-full pl-3 pr-12 py-2 text-sm border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      :class="{
                        'border-red-500 bg-red-50': formData.return_meters > maxReturnableMeters,
                        'border-gray-300': formData.return_meters <= maxReturnableMeters
                      }"
                      :placeholder="'สูงสุด ' + formatNumber(maxReturnableMeters)"
                    />
                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                      ม.
                    </div>
                  </div>
                  <p v-if="formData.return_meters > maxReturnableMeters" 
                     class="text-xs text-red-600 mt-1">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    เกิน {{ formatNumber(maxReturnableMeters) }} ม.
                  </p>
                </div>
              </div>

              <!-- Scrap Location Warning Banner -->
              <div v-if="selectedMovement && isScrapLocation" class="bg-red-50 border border-red-200 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <i class="fas fa-exclamation-triangle text-red-600 mt-0.5"></i>
                  <div class="flex-1 text-sm">
                    <div class="font-semibold text-red-800 mb-1">คลังของเสีย (Scrap Location)</div>
                    <div class="text-red-700">
                      • การรับคืนเข้าคลังนี้จะ<strong>ไม่นับเป็นสต็อก</strong>สำหรับขาย<br>
                      • ระบบจะบันทึก<strong>ร่องรอย</strong>การเคลื่อนไหวเท่านั้น
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sample Location Info Banner -->
              <div v-else-if="selectedMovement && isSampleLocation" class="bg-green-50 border border-green-200 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <i class="fas fa-info-circle text-green-600 mt-0.5"></i>
                  <div class="flex-1 text-sm">
                    <div class="font-semibold text-green-800 mb-1">คลังตัวอย่าง (Sample Location)</div>
                    <div class="text-green-700">
                      สินค้าที่รับคืนเข้าคลังนี้เป็นตัวอย่าง ไม่นับเป็นสต็อกขาย
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer Name & Reason -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    ชื่อลูกค้า
                  </label>
                  <input
                    v-model="formData.customer_name"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="ระบุชื่อ (ถ้ามี)"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    เลขที่อ้างอิง (Invoice/Receipt)
                  </label>
                  <input
                    v-model="formData.reference_number"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="เลขที่"
                  />
                </div>
              </div>

              <!-- Reason -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  เหตุผลการคืน <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.reason"
                  rows="2"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="ระบุเหตุผลการคืนสินค้า..."
                ></textarea>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  v-model="formData.notes"
                  rows="2"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="หมายเหตุ..."
                ></textarea>
              </div>

              <!-- Validation Errors -->
              <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded p-2">
                <ul class="text-xs text-red-700 space-y-0.5">
                  <li v-for="(error, idx) in validationErrors" :key="idx">
                    <i class="fas fa-exclamation-circle mr-1"></i>{{ error }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-200 sticky bottom-0">
            <button
              @click="close"
              type="button"
              class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            
            <button
              @click="handleSubmit"
              :disabled="processing || !isFormValid"
              type="button"
              class="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center gap-2"
            >
              <i class="fas fa-check-circle" :class="{ 'fa-spin fa-spinner': processing }"></i>
              <span>{{ processing ? 'กำลังบันทึก...' : 'รับสินค้าคืน' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, getCurrentInstance } from 'vue'

export default {
  name: 'LotReturnModal',
  
  props: {
    show: {
      type: Boolean,
      required: true
    },
    lot: {
      type: Object,
      default: null
    },
    recentMovements: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close', 'returned'],

  setup(props, { emit }) {
    // Get InventoryService
    const currentInstance = getCurrentInstance()
    const inventoryService = currentInstance.appContext.config.globalProperties.$inventoryService || 
                           window.InventoryService || 
                           window.ERP_CORE?.inventory

    const processing = ref(false)
    const selectedMovement = ref(null)
    const showLocationDropdown = ref(false)
    const loadingLocations = ref(false)
    const availableLocations = ref([])
    
    const formData = ref({
      return_type: 'refund',       // 'refund' | 'exchange' | 'defective'
      return_meters: 0,
      customer_name: '',
      reason: '',
      reference_number: '',
      notes: '',
      movement_id: null,           // reference ไปยัง stock_movement ที่ขายไป
      return_location_code: ''     // คลังที่รับคืนเข้า
    })

    // คำนวณ OUT movements ล่าสุดที่สามารถคืนได้
    const returnableMovements = computed(() => {
      if (!props.recentMovements || props.recentMovements.length === 0) {
        return []
      }
      
      // เอาเฉพาะ OUT movements (ที่ขายออกไป)
      return props.recentMovements
        .filter(m => m.movement_type?.toUpperCase() === 'OUT' && 
                     m.transaction_type === 'sale')
        .slice(0, 10) // เอา 10 รายการล่าสุด
    })

    // คำนวณจำนวนสูงสุดที่คืนได้
    const maxReturnableMeters = computed(() => {
      if (!selectedMovement.value) {
        return 0
      }
      // ใช้ returnable_meters ที่คำนวณมาจาก backend (quantity - returned_meters)
      if (selectedMovement.value.returnable_meters !== undefined) {
        return selectedMovement.value.returnable_meters
      }
      // fallback: ถ้าไม่มี field นี้ ให้ใช้แบบเดิม
      const totalQuantity = selectedMovement.value.quantity || selectedMovement.value.quantity_meters || 0
      const alreadyReturned = selectedMovement.value.returned_meters || 0
      return totalQuantity - alreadyReturned
    })

    // Select movement to return
    const selectMovement = (movement) => {
      selectedMovement.value = movement
      formData.value.movement_id = movement._id
      formData.value.customer_name = movement.customer_name || ''
      formData.value.reference_number = movement.reference_number || ''
      // Set max returnable quantity as default (จำนวนที่คืนได้คงเหลือ)
      const maxReturnable = movement.returnable_meters !== undefined 
        ? movement.returnable_meters 
        : (movement.quantity || movement.quantity_meters || 0) - (movement.returned_meters || 0)
      formData.value.return_meters = maxReturnable
    }

    // Reset form when modal opens
    watch(() => props.show, (newVal) => {
      if (newVal) {
        selectedMovement.value = null
        formData.value = {
          return_type: 'refund',
          return_meters: 0,
          customer_name: '',
          reason: '',
          reference_number: '',
          notes: '',
          movement_id: null,
          return_location_code: ''
        }
        // โหลด stock locations
        loadStockLocations()
      }
    })

    // Load stock locations
    const loadStockLocations = async () => {
      try {
        loadingLocations.value = true
        
        console.log('📍 [LotReturnModal] Loading stock locations...')
        
        if (!inventoryService) {
          console.warn('⚠️ [LotReturnModal] InventoryService not available')
          availableLocations.value = []
          return
        }
        
        const locations = await inventoryService.getAllStockLocations()
        
        console.log('📍 [LotReturnModal] Raw locations:', locations)
        
        availableLocations.value = locations.map(loc => ({
          code: loc.location_code || loc.code,
          name: loc.location_name || loc.name,
          zone: loc.zone || '',
          type: loc.location_type || loc.type || 'warehouse',
          capacity: loc.capacity_numeric ? 
            `${loc.capacity_numeric} ${loc.capacity_unit || 'หน่วย'}` : 
            'ไม่จำกัด',
          current_usage: loc.current_usage || 0,
          status: loc.status || 'active'
        }))
        
        console.log(`✅ [LotReturnModal] Loaded ${availableLocations.value.length} stock locations`)
        console.log('📍 [LotReturnModal] Mapped locations:', availableLocations.value)
      } catch (error) {
        console.error('❌ [LotReturnModal] Error loading stock locations:', error)
        availableLocations.value = []
      } finally {
        loadingLocations.value = false
      }
    }

    // Toggle location dropdown
    const toggleLocationDropdown = () => {
      showLocationDropdown.value = !showLocationDropdown.value
    }

    // Select location
    const selectLocation = (location) => {
      formData.value.return_location_code = location.code
      showLocationDropdown.value = false
    }

    // Computed: Check if scrap location
    const isScrapLocation = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === formData.value.return_location_code
      )
      return location?.type === 'scrap'
    })

    // Computed: Check if sample location
    const isSampleLocation = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === formData.value.return_location_code
      )
      return location?.type === 'sample'
    })

    // Computed: Selected location display
    const selectedLocationDisplay = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === formData.value.return_location_code
      )
      if (!location) return null
      return `${location.code} - ${location.name}`
    })

    // Helper: Get location type label
    const getLocationTypeLabel = (type) => {
      const labels = {
        'warehouse': 'คลังทั่วไป',
        'scrap': 'ของเสีย',
        'sample': 'ตัวอย่าง',
        'virtual': 'คลังเสมือน'
      }
      return labels[type] || type
    }

    // Validation
    const validationErrors = computed(() => {
      const errors = []
      
      if (!formData.value.return_type) {
        errors.push('กรุณาเลือกประเภทการคืน')
      }
      
      if (!selectedMovement.value) {
        errors.push('กรุณาเลือกรายการขายที่ต้องการคืน')
      }
      
      if (!formData.value.movement_id) {
        errors.push('ไม่พบ Movement ID - กรุณาเลือกรายการใหม่')
      }
      
      if (!formData.value.return_meters || formData.value.return_meters <= 0) {
        errors.push('กรุณาระบุจำนวนที่คืน')
      }
      
      if (selectedMovement.value && formData.value.return_meters > maxReturnableMeters.value) {
        errors.push(`ไม่สามารถคืนมากกว่า ${formatNumber(maxReturnableMeters.value)} เมตรได้`)
      }
      
      if (!formData.value.reason || formData.value.reason.trim() === '') {
        errors.push('กรุณาระบุเหตุผลการคืน')
      }
      
      if (!formData.value.return_location_code) {
        errors.push('กรุณาเลือกคลังที่รับคืนเข้า')
      }
      
      return errors
    })

    const isFormValid = computed(() => {
      return validationErrors.value.length === 0
    })

    // Format number
    const formatNumber = (value) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value || 0)
    }

    // Format date
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('th-TH', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (e) {
        return dateStr
      }
    }

    // Close modal
    const close = () => {
      if (!processing.value) {
        emit('close')
      }
    }

    // Submit
    const handleSubmit = async () => {
      if (!isFormValid.value || processing.value) {
        console.warn('⚠️ Form is invalid or already processing')
        return
      }

      processing.value = true

      try {
        // ดึงข้อมูล location type
        const selectedLocation = availableLocations.value.find(
          loc => loc.code === formData.value.return_location_code
        )
        
        const returnData = {
          lot_id: props.lot._id || props.lot.lot_id,
          movement_id: formData.value.movement_id,
          return_meters: formData.value.return_meters,
          return_type: formData.value.return_type,
          reason: formData.value.reason,
          customer_name: formData.value.customer_name,
          reference_number: formData.value.reference_number,
          notes: formData.value.notes,
          // ✅ เพิ่มข้อมูล location
          return_location_code: formData.value.return_location_code,
          location_type: selectedLocation?.type || 'warehouse',
          is_scrap_return: selectedLocation?.type === 'scrap',
          is_sample: selectedLocation?.type === 'sample',
          count_in_stock: !['scrap', 'sample'].includes(selectedLocation?.type)
        }
        
        console.log('📤 [LotReturnModal] Submitting return data:')
        console.log('   Movement ID:', returnData.movement_id)
        console.log('   Return meters:', returnData.return_meters)
        console.log('   Return type:', returnData.return_type)
        console.log('   Return location:', returnData.return_location_code, `(${returnData.location_type})`)
        console.log('   Count in stock:', returnData.count_in_stock)
        
        if (returnData.is_scrap_return) {
          console.log('🗑️ [LotReturnModal] Scrap return detected - will NOT count in stock')
        }
        
        if (!returnData.movement_id) {
          throw new Error('ไม่พบ Movement ID - ไม่สามารถติดตามสถานะการคืนได้')
        }

        emit('returned', returnData)
      } catch (error) {
        console.error('❌ Error in handleSubmit:', error)
      } finally {
        processing.value = false
      }
    }

    return {
      processing,
      formData,
      selectedMovement,
      returnableMovements,
      maxReturnableMeters,
      validationErrors,
      isFormValid,
      formatNumber,
      formatDate,
      selectMovement,
      close,
      handleSubmit,
      // Location related
      showLocationDropdown,
      loadingLocations,
      availableLocations,
      toggleLocationDropdown,
      selectLocation,
      isScrapLocation,
      isSampleLocation,
      selectedLocationDisplay,
      getLocationTypeLabel
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

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>

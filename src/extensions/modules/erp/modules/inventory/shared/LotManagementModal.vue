<!-- Lot Management Modal - Compact & Efficient -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModal"
      >
        <div 
          class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white sticky top-0 z-10">
            <h3 class="text-base font-semibold flex items-center gap-2">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
              {{ isEditMode ? 'แก้ไข Lot' : 'เพิ่ม Lot ใหม่' }}
            </h3>
            <button 
              @click="closeModal"
              class="p-1 hover:bg-white/20 rounded transition-colors"
              title="ปิด (ESC)"
            >
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3">
              <!-- Lot Code -->
              <div class="col-span-2 sm:col-span-1">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-medium text-gray-700">
                    Lot Code (5 ตัว) <span class="text-red-500">*</span>
                  </label>
                  <!-- Status Message (ย้ายมาไว้ด้านขวาของ label) -->
                  <div class="flex items-center gap-1">
                    <p v-if="lotCodeStatus === 'invalid_length'" class="text-xs text-red-600 flex items-center gap-1">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>ต้องมี 5 ตัว</span>
                    </p>
                    <p v-else-if="lotCodeStatus === 'duplicate'" class="text-xs text-red-600 flex items-center gap-1">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>มีในระบบแล้ว</span>
                    </p>
                    <p v-else-if="lotCodeStatus === 'available'" class="text-xs text-green-600 flex items-center gap-1">
                      <i class="fas fa-check"></i>
                      <span>พร้อมใช้งาน</span>
                    </p>
                  </div>
                </div>
                <div class="relative">
                  <input
                    v-model="form.lot_code"
                    @input="handleLotCodeInput"
                    type="text"
                    placeholder="เช่น 08883"
                    maxlength="5"
                    :disabled="isEditMode"
                    class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                    :class="{
                      'border-gray-300': !lotCodeStatus,
                      'border-yellow-400 bg-yellow-50': lotCodeStatus === 'checking',
                      'border-red-500 bg-red-50': lotCodeStatus === 'duplicate' || lotCodeStatus === 'invalid_length',
                      'border-green-500 bg-green-50': lotCodeStatus === 'available'
                    }"
                  />
                  <!-- Status Icon - ใช้ key เพื่อ force re-render -->
                  <div 
                    v-if="lotCodeStatus"
                    :key="lotCodeStatus" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <i v-if="lotCodeStatus === 'checking'" class="fas fa-spinner fa-spin text-yellow-600"></i>
                    <i v-else-if="lotCodeStatus === 'duplicate' || lotCodeStatus === 'invalid_length'" class="fas fa-times-circle text-red-600"></i>
                    <i v-else-if="lotCodeStatus === 'available'" class="fas fa-check-circle text-green-600"></i>
                  </div>
                </div>
              </div>

              <!-- Meters (ความยาว) -->
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  <i class="fas fa-ruler-horizontal text-blue-600 mr-1"></i>
                  ความยาว (เมตร) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.calculated_meters"
                  @input="calculateMetersPerKg"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="เช่น 50"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  ระบุความยาวตามที่วัดได้จริง
                </p>
              </div>

              <!-- Weight (น้ำหนัก) - Optional -->
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  <i class="fas fa-weight text-purple-600 mr-1"></i>
                  น้ำหนัก (kg) <span class="text-gray-400 text-xs">(ไม่บังคับ)</span>
                </label>
                <input
                  v-model.number="form.weight_kg"
                  @input="calculateMetersPerKg"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ไม่ระบุจะใช้ค่าจากสินค้า"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p v-if="metersPerKg > 0" class="text-xs text-green-600 mt-1 font-semibold">
                  <i class="fas fa-calculator mr-1"></i>
                  {{ metersPerKg.toFixed(2) }} ม./กก. (ชั่งสต็อค)
                </p>
                <p v-else-if="form.calculated_meters > 0 && !form.weight_kg" class="text-xs text-gray-500 mt-1">
                  <i class="fas fa-info-circle mr-1"></i>
                  จะใช้ค่าจากข้อมูลสินค้า
                </p>
              </div>

              <!-- Location Code (Warehouse) -->
              <div class="col-span-2 sm:col-span-1 relative">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Location <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <button
                    type="button"
                    @click="toggleLocationDropdown"
                    class="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                    :class="{ 'ring-2 ring-emerald-500': showLocationDropdown }"
                  >
                    <span :class="form.location_code ? 'text-gray-900' : 'text-gray-400'">
                      {{ selectedLocationDisplay || 'เลือก Warehouse' }}
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
                      <div>กำลังโหลดข้อมูล...</div>
                    </div>
                    
                    <!-- Location List -->
                    <div
                      v-else-if="availableLocations.length > 0"
                    >
                      <div
                        v-for="location in availableLocations"
                        :key="location.code"
                        @click="selectLocation(location)"
                        class="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                        :class="{ 'bg-emerald-100': form.location_code === location.code }"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="font-medium text-gray-900">{{ location.code }}</span>
                              <!-- Location Type Badge -->
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
                            <!-- Scrap Warning -->
                            <div v-if="location.type === 'scrap'" class="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <i class="fas fa-exclamation-triangle"></i>
                              <span>ของเสีย - ไม่นับสต็อก (มีร่องรอยเท่านั้น)</span>
                            </div>
                            <!-- Sample Info -->
                            <div v-else-if="location.type === 'sample'" class="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <i class="fas fa-info-circle"></i>
                              <span>ตัวอย่าง - ไม่นับเป็นสต็อกขาย</span>
                            </div>
                          </div>
                          <i v-if="form.location_code === location.code" class="fas fa-check text-emerald-600 mt-1"></i>
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

              <!-- Scrap Location Warning Banner -->
              <div v-if="isScrapLocation" class="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <i class="fas fa-exclamation-triangle text-red-600 mt-0.5"></i>
                  <div class="flex-1 text-sm">
                    <div class="font-semibold text-red-800 mb-1">คลังของเสีย (Scrap Location)</div>
                    <div class="text-red-700">
                      • การรับเข้าคลังนี้จะ<strong>ไม่นับเป็นสต็อก</strong>สำหรับขาย<br>
                      • ระบบจะบันทึก<strong>ร่องรอย</strong>การเคลื่อนไหวเท่านั้น<br>
                      • ใช้สำหรับติดตามของเสีย/ชำรุด
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sample Location Info Banner -->
              <div v-else-if="isSampleLocation" class="col-span-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <i class="fas fa-info-circle text-green-600 mt-0.5"></i>
                  <div class="flex-1 text-sm">
                    <div class="font-semibold text-green-800 mb-1">คลังตัวอย่าง (Sample Location)</div>
                    <div class="text-green-700">
                      สินค้าในคลังนี้เป็นตัวอย่าง ไม่นับเป็นสต็อกขาย
                    </div>
                  </div>
                </div>
              </div>

              <!-- Rack Position -->
              <div class="col-span-2 sm:col-span-1 relative">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Rack Position
                  <span class="text-gray-400 text-xs">(ไม่บังคับ)</span>
                </label>
                <div class="relative">
                  <button
                    type="button"
                    @click="toggleRackDropdown"
                    :disabled="!form.location_code || !hasRackDesign"
                    class="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                    :class="{ 'ring-2 ring-emerald-500': showRackDropdown }"
                  >
                    <span :class="form.rack_position ? 'text-gray-900' : 'text-gray-400'">
                      {{ form.rack_position || getPlaceholderText }}
                    </span>
                    <i v-if="hasRackDesign" class="fas fa-chevron-down text-xs" :class="{ 'rotate-180': showRackDropdown }"></i>
                  </button>
                  
                  <!-- Rack Dropdown Panel -->
                  <div
                    v-if="showRackDropdown && hasRackDesign"
                    class="absolute z-50 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4 w-full min-w-[16rem]"
                    style="left: 50%; transform: translateX(-50%);"
                  >
                    <!-- Step 1: Select Rack -->
                    <div v-if="!selectedRackForModal">
                      <h4 class="text-xs font-semibold text-gray-700 mb-2">เลือก Rack:</h4>
                      <div class="space-y-1">
                        <button
                          v-for="rack in availableRacks"
                          :key="rack.id"
                          type="button"
                          @click="selectRack(rack)"
                          class="w-full px-3 py-2 text-sm text-left rounded hover:bg-emerald-50 transition-colors flex items-center justify-between"
                        >
                          <span class="font-medium">{{ rack.name }}</span>
                          <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Step 2: Select Position -->
                    <div v-else>
                      <div class="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          @click="selectedRackForModal = null"
                          class="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <i class="fas fa-chevron-left"></i>
                          <span>{{ selectedRackForModal.name }}</span>
                        </button>
                      </div>
                      <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }">
                        <button
                          v-for="position in rackPositions"
                          :key="position.id"
                          type="button"
                          @click="selectPosition(position)"
                          class="px-2 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-emerald-50 hover:border-emerald-500 transition-colors"
                          :class="{
                            'bg-emerald-500 text-white border-emerald-500': form.rack_position === getFullRackPosition(selectedRackForModal, position)
                          }"
                        >
                          {{ position.code }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Received Date -->
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  วันที่รับเข้า
                </label>
                <input
                  v-model="form.received_date"
                  type="date"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <!-- Notes -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  หมายเหตุ
                </label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="หมายเหตุเพิ่มเติม..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200 sticky bottom-0">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              @click="handleSave"
              :disabled="!isFormValid || saving"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'

export default {
  name: 'LotManagementModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    productId: {
      type: String,
      required: true
    },
    product: {
      type: Object,
      default: null
    },
    lotData: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'save', 'close'],
  setup(props, { emit }) {
    // ใช้ InventoryService หลักผ่าน global (เหมือน Index.vue)
    const currentInstance = getCurrentInstance()
    const inventoryService = currentInstance.appContext.config.globalProperties.$inventoryService || 
                           window.InventoryService || 
                           window.ERP_CORE.inventory

    // Initialize InventoryService if needed
    if (!inventoryService?.isReady?.()) {
      inventoryService?.initialize?.(currentInstance)
    }

    const saving = ref(false)
    const loadingLocations = ref(false)
    const lotCodeStatus = ref(null) // null | 'checking' | 'duplicate' | 'available'
    const lotCodeCheckTimeout = ref(null)
    
    // Dropdown states
    const showLocationDropdown = ref(false)
    const showRackDropdown = ref(false)
    const selectedRackForModal = ref(null)
    
    // Available options (จะถูกโหลดจากระบบจริง)
    const availableLocations = ref([])
    
    // Dynamic rack positions based on selected location
    const availableRacks = computed(() => {
      const selectedLocation = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      
      if (!selectedLocation?.rack_design) {
        return []
      }
      
      const config = selectedLocation.rack_design.config
      const sides = []
      
      if (config.layout === 'both' || config.layout === 'left') {
        sides.push({ id: 'left', name: 'Rack ซ้าย', side: 'left' })
      }
      if (config.layout === 'both' || config.layout === 'right') {
        sides.push({ id: 'right', name: 'Rack ขวา', side: 'right' })
      }
      
      return sides
    })
    
    const rackPositions = computed(() => {
      const selectedLocation = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      
      if (!selectedLocation?.rack_design || !selectedRackForModal.value) {
        return []
      }
      
      // Filter positions by selected side
      const positions = selectedLocation.rack_design.positions.filter(
        pos => pos.side === selectedRackForModal.value.side
      )
      
      return positions.map(pos => ({
        id: pos.code,
        row: pos.row,
        col: pos.col,
        code: pos.code
      }))
    })
    
    const form = ref({
      lot_code: '',
      calculated_meters: 0, // ✅ เปลี่ยนจากการคำนวณเป็นกรอกโดยตรง
      weight_kg: 0,
      location_code: '',
      rack_position: '',
      supplier_name: '',
      received_date: new Date().toISOString().split('T')[0],
      notes: ''
    })

    // ฟังก์ชันโหลด Stock Locations จากระบบจริง (เหมือน Index.vue)
    const loadStockLocations = async () => {
      try {
        loadingLocations.value = true
        console.log('📍 [LotManagementModal] Loading stock locations via InventoryService...')
        
        // ✅ ใช้ InventoryService เพื่อดึงข้อมูล stock locations
        const locations = await inventoryService.getAllStockLocations()
        
        availableLocations.value = locations.map(loc => {
          const code = loc.location_code || loc.code || loc.id
          const name = loc.location_name || loc.name || 'ไม่ระบุชื่อ'
          const zone = loc.zone || loc.location_zone || loc.area || ''
          
          console.log(`📍 [LotManagementModal] Mapped location: ${code} - ${name} (${zone})`)
          
          return {
            code: code,
            name: name,
            zone: zone,
            id: loc.id || code,
            type: loc.location_type || loc.type || 'warehouse',
            capacity: loc.capacity_numeric ? 
              `${loc.capacity_numeric} ${loc.capacity_unit || 'หน่วย'}` : 
              'ไม่จำกัด',
            current_usage: loc.current_usage || 0,
            status: loc.status || 'active',
            rack_design: loc.rack_design || null
          }
        })
        
        console.log(`✅ [LotManagementModal] Stock locations loaded: ${availableLocations.value.length}`)
        console.log('📍 [LotManagementModal] Final stock locations:', availableLocations.value)
        
        if (availableLocations.value.length === 0) {
          console.warn('⚠️ [LotManagementModal] No stock locations found in system')
        }
        
      } catch (error) {
        console.error('❌ [LotManagementModal] Error loading stock locations via InventoryService:', error)
        availableLocations.value = []
        
        // แสดง error message ให้ user (optional - อาจจะไม่แสดงใน modal)
        console.error(`เกิดข้อผิดพลาดในการโหลดสถานที่เก็บสินค้า: ${error.message}`)
      } finally {
        loadingLocations.value = false
      }
    }

    // Check if in edit mode
    const isEditMode = computed(() => !!props.lotData)

    // ✅ คำนวณ meters_per_kg จากความยาวและน้ำหนัก
    // ถ้าไม่กรอกน้ำหนัก จะ return 0 และใช้ค่าจาก product.weight_per_meter ใน backend แทน
    const metersPerKg = computed(() => {
      if (!form.value.calculated_meters || !form.value.weight_kg || form.value.weight_kg <= 0) return 0
      return parseFloat((form.value.calculated_meters / form.value.weight_kg).toFixed(4))
    })

    // ฟังก์ชันคำนวณ meters_per_kg
    const calculateMetersPerKg = () => {
      // Auto-calculated, using computed property
    }

    // ตรวจสอบว่าเป็น Scrap Location หรือไม่
    const isScrapLocation = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      return location?.type === 'scrap'
    })

    // ตรวจสอบว่าเป็น Sample Location หรือไม่
    const isSampleLocation = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      return location?.type === 'sample'
    })

    // แสดงชื่อ Location ที่เลือก
    const selectedLocationDisplay = computed(() => {
      const location = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      if (!location) return null
      return `${location.code} - ${location.name}`
    })

    // ฟังก์ชันแปลง Location Type เป็นภาษาไทย
    const getLocationTypeLabel = (type) => {
      const labels = {
        'warehouse': 'คลังทั่วไป',
        'scrap': 'ของเสีย',
        'sample': 'ตัวอย่าง',
        'virtual': 'คลังเสมือน'
      }
      return labels[type] || type
    }

    // Check if selected location has rack design
    const hasRackDesign = computed(() => {
      const selectedLocation = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      return !!selectedLocation?.rack_design
    })

    // Placeholder text for rack position
    const getPlaceholderText = computed(() => {
      if (!form.value.location_code) return 'เลือก Warehouse ก่อน'
      if (!hasRackDesign.value) return 'ไม่มี Rack'
      return 'เลือก Rack Position'
    })

    // Calculate grid columns based on rack design
    const gridColumns = computed(() => {
      const selectedLocation = availableLocations.value.find(
        loc => loc.code === form.value.location_code
      )
      return selectedLocation?.rack_design?.config?.columns || 3
    })

    // Form validation
    const isFormValid = computed(() => {
      return form.value.lot_code && 
             form.value.lot_code.length === 5 && // ต้องมี 5 ตัวพอดี
             form.value.calculated_meters > 0 && // ✅ ต้องมีความยาว
             // weight_kg ไม่บังคับ - ถ้าไม่กรอกจะใช้ค่าจากสินค้า
             form.value.location_code && 
             // ✅ ไม่บังคับ rack_position แม้จะมี rack design
             lotCodeStatus.value !== 'duplicate' && // ต้องไม่ซ้ำ
             lotCodeStatus.value !== 'invalid_length' && // ต้องไม่ผิด length
             lotCodeStatus.value !== 'checking' // ต้องเช็คเสร็จแล้ว
    })
    
    // ฟังก์ชันตรวจสอบ Lot Code ซ้ำ
    const checkLotCodeDuplicate = async () => {
      const lotCode = form.value.lot_code?.trim()
      
      // ถ้าไม่มี lot code หรือเป็น edit mode ไม่ต้องเช็ค
      if (!lotCode || isEditMode.value) {
        lotCodeStatus.value = null
        return
      }
      
      // ตรวจสอบความยาว lot code ต้องเป็น 5 ตัวพอดี
      if (lotCode.length !== 5) {
        lotCodeStatus.value = 'invalid_length'
        console.warn('⚠️ [LotManagementModal] Invalid lot code length:', lotCode.length)
        return
      }
      
      try {
        lotCodeStatus.value = 'checking'
        console.log('🔍 [LotManagementModal] Checking lot code:', lotCode)
        
        // ใช้ inventoryService ที่ initialize ไว้แล้ว (มี apiRequest อยู่แล้ว)
        if (!inventoryService || !inventoryService.apiRequest) {
          console.warn('⚠️ [LotManagementModal] InventoryService not available')
          lotCodeStatus.value = null
          return
        }
        
        const clientKey = inventoryService.clientKey || window.ERP_CORE?.clientKey || null
        
        const response = await inventoryService.apiRequest.POST('lot_tracking/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { lot_code: lotCode },
                  { full_lot_code: lotCode }
                ],
                status: { $ne: 'deleted' } // ไม่เอาที่ถูกลบแล้ว
              }
            },
            { $limit: 1 } // เอาแค่ 1 record ก็พอรู้ว่าซ้ำ
          ]
        }, clientKey)
        
        const existingLots = response?.data || []
        const isDuplicate = existingLots.length > 0
        
        if (isDuplicate) {
          lotCodeStatus.value = 'duplicate'
          console.warn('⚠️ [LotManagementModal] Duplicate lot code found:', lotCode, existingLots[0])
        } else {
          lotCodeStatus.value = 'available'
          console.log('✅ [LotManagementModal] Lot code is available:', lotCode)
        }
        
      } catch (error) {
        console.error('❌ [LotManagementModal] Error checking lot code:', error)
        lotCodeStatus.value = null // ถ้า error ให้ผ่านไปก่อน
      }
    }
    
    // ฟังก์ชัน debounce สำหรับการพิมพ์ lot code
    const handleLotCodeInput = (event) => {
      console.log('⌨️ [LotManagementModal] Input event triggered, value:', event.target?.value || form.value.lot_code)
      
      // Clear timeout เดิม
      if (lotCodeCheckTimeout.value) {
        clearTimeout(lotCodeCheckTimeout.value)
        lotCodeCheckTimeout.value = null
      }
      
      // Reset status
      lotCodeStatus.value = null
      
      const lotCode = form.value.lot_code?.trim()
      
      // ถ้าไม่มี lot code ไม่ต้องเช็ค
      if (!lotCode || isEditMode.value) {
        console.log('🚫 [LotManagementModal] Skip checking - empty or edit mode')
        return
      }
      
      console.log('⏱️ [LotManagementModal] Setting timeout to check lot code...')
      
      // เช็คหลังจากผู้ใช้หยุดพิมพ์ 800ms
      lotCodeCheckTimeout.value = setTimeout(() => {
        console.log('⏰ [LotManagementModal] Timeout triggered, checking now...')
        checkLotCodeDuplicate()
      }, 800)
    }
    
    // Dropdown methods
    const toggleLocationDropdown = () => {
      showLocationDropdown.value = !showLocationDropdown.value
      if (showLocationDropdown.value) {
        showRackDropdown.value = false
      }
    }
    
    const toggleRackDropdown = () => {
      if (!form.value.location_code) return
      showRackDropdown.value = !showRackDropdown.value
      if (showRackDropdown.value) {
        showLocationDropdown.value = false
      }
    }
    
    const selectLocation = (location) => {
      form.value.location_code = location.code
      showLocationDropdown.value = false
      
      // Reset rack position when changing location
      form.value.rack_position = ''
      selectedRackForModal.value = null
    }
    
    const selectRack = (rack) => {
      selectedRackForModal.value = rack
    }
    
    const getFullRackPosition = (rack, position) => {
      if (!rack || !position) return ''
      return position.code // ใช้ code จาก rack_design โดยตรง เช่น "L1A", "R2B"
    }
    
    const selectPosition = (position) => {
      if (!selectedRackForModal.value) return
      form.value.rack_position = getFullRackPosition(selectedRackForModal.value, position)
      
      // Close dropdown after selection
      setTimeout(() => {
        showRackDropdown.value = false
        selectedRackForModal.value = null
      }, 300)
    }
    
    // Close dropdowns on click outside
    const handleClickOutside = (event) => {
      const target = event.target
      if (!target.closest('.relative')) {
        showLocationDropdown.value = false
        showRackDropdown.value = false
        selectedRackForModal.value = null
      }
    }

    // Reset form
    const resetForm = () => {
      form.value = {
        lot_code: '',
        calculated_meters: 0,
        weight_kg: 0,
        location_code: '',
        rack_position: '',
        supplier_name: '',
        received_date: new Date().toISOString().split('T')[0],
        notes: ''
      }
      showLocationDropdown.value = false
      showRackDropdown.value = false
      selectedRackForModal.value = null
      lotCodeStatus.value = null // Reset lot code status
      
      // Clear timeout
      if (lotCodeCheckTimeout.value) {
        clearTimeout(lotCodeCheckTimeout.value)
        lotCodeCheckTimeout.value = null
      }
    }

    // Load lot data when editing
    const loadLotData = (lotData) => {
      if (lotData) {
        form.value = {
          lot_code: lotData.lot_code || '',
          calculated_meters: lotData.calculated_meters || lotData.remaining_meters || 0,
          weight_kg: lotData.weight_kg || 0,
          location_code: lotData.location_code || 'WH-01',
          rack_position: lotData.rack_position || '',
          supplier_name: lotData.supplier_name || '',
          received_date: lotData.received_date || new Date().toISOString().split('T')[0],
          notes: lotData.notes || ''
        }
      }
    }

    // Watch for lotData changes
    watch(() => props.lotData, (newValue) => {
      if (newValue) {
        loadLotData(newValue)
      } else {
        resetForm()
      }
    }, { immediate: true })

    // Close modal
    const closeModal = () => {
      emit('update:modelValue', false)
      emit('close')
      setTimeout(resetForm, 300) // Reset after transition
    }

    // Handle save
    const handleSave = async () => {
      if (!isFormValid.value || saving.value) return

      saving.value = true
      
      try {
        // ดึงข้อมูล location type
        const selectedLocation = availableLocations.value.find(
          loc => loc.code === form.value.location_code
        )
        
        const lotData = {
          ...form.value,
          meters_per_kg: metersPerKg.value, // ✅ เพิ่มค่า meters_per_kg ที่คำนวณไว้
          product_id: props.productId,
          sku: props.product?.sku,
          product_name: props.product?.name,
          created_from: 'manual',
          // ✅ เพิ่มข้อมูล location type สำหรับตรวจสอบว่าต้องนับสต็อกหรือไม่
          location_type: selectedLocation?.type || 'warehouse',
          is_scrap_return: selectedLocation?.type === 'scrap',
          is_sample: selectedLocation?.type === 'sample',
          count_in_stock: !['scrap', 'sample'].includes(selectedLocation?.type) // ถ้าเป็น scrap/sample ไม่นับสต็อก
        }

        console.log('💾 [LotManagementModal] Saving lot with data:', lotData)
        if (lotData.is_scrap_return) {
          console.log('🗑️ [LotManagementModal] Scrap return detected - will NOT count in stock')
        }

        emit('save', {
          data: lotData,
          isEdit: isEditMode.value,
          originalLot: props.lotData
        })
      } catch (error) {
        console.error('Error in handleSave:', error)
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

    // Add/remove ESC listener
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        window.addEventListener('keydown', handleEscKey)
        document.addEventListener('click', handleClickOutside)
      } else {
        window.removeEventListener('keydown', handleEscKey)
        document.removeEventListener('click', handleClickOutside)
      }
    })
    
    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // โหลด stock locations เมื่อ component ถูก mount
      loadStockLocations()
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      saving,
      form,
      isEditMode,
      metersPerKg,
      calculateMetersPerKg,
      isFormValid,
      closeModal,
      handleSave,
      // Dropdown states
      showLocationDropdown,
      showRackDropdown,
      selectedRackForModal,
      availableLocations,
      availableRacks,
      rackPositions,
      loadingLocations,
      // Lot code validation
      lotCodeStatus,
      handleLotCodeInput,
      checkLotCodeDuplicate,
      // Dropdown methods
      toggleLocationDropdown,
      toggleRackDropdown,
      selectLocation,
      selectRack,
      selectPosition,
      getFullRackPosition,
      // Location type detection
      isScrapLocation,
      isSampleLocation,
      selectedLocationDisplay,
      getLocationTypeLabel,
      hasRackDesign,
      getPlaceholderText,
      gridColumns
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

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Dropdown transitions */
.fa-chevron-down {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Ensure dropdowns appear above other content */
.relative {
  position: relative;
  z-index: 1;
}

.z-50 {
  z-index: 50;
}
</style>

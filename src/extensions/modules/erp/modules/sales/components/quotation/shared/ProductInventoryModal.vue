<template>
  <div>
    <!-- Product Selection Modal -->
    <div v-if="modelValue" class="modal-overlay" @click="$emit('update:modelValue', false)">
      <div class="modal-content modal-fullscreen" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-boxes mr-2"></i>
            เลือกสินค้าจากคลัง
          </h3>
          <button class="close-btn" @click="$emit('update:modelValue', false)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-split">
          <!-- Left Sidebar: Product List -->
          <div class="sidebar-left">
            <div class="sidebar-header">
              <!-- Search Box -->
              <div class="search-container">
                <div class="relative">
                  <input 
                    v-model="localInventorySearch"
                    type="text" 
                    class="search-input"
                    placeholder="ค้นหาสินค้าจาก SKU, ชื่อสินค้า, หรือรหัสม้วน..."
                    @input="filterInventoryItems"
                  >
                  <i class="fas fa-search search-icon"></i>
                </div>
                
                <!-- Filters -->
                <div class="filters-row">
                  <div class="filters-left">
                    <label class="filter-checkbox">
                      <input 
                        type="checkbox" 
                        v-model="localShowOnlyTextile" 
                        @change="filterInventoryItems"
                      >
                      <span>เฉพาะสินค้าผ้า</span>
                    </label>
                    <label class="filter-checkbox">
                      <input 
                        type="checkbox" 
                        v-model="localShowOnlyAvailable" 
                        @change="filterInventoryItems"
                      >
                      <span>มีสต็อค</span>
                    </label>
                  </div>
                  <span class="filter-count">
                    {{ localFilteredItems.length }} รายการ
                  </span>
                </div>
              </div>
            </div>

            <!-- Product List -->
            <div class="product-list">
              <div 
                v-for="(item, index) in localFilteredItems" 
                :key="item?.id || `item-${index}`"
                @click="selectProductItem(item)"
                class="product-item"
                :class="{
                  'product-item-active': selectedProductItem?.id === item?.id,
                  'product-item-textile': item?.category === 'textile',
                  'product-item-available': (item?.stock_quantity || 0) > 0
                }"
              >
                <!-- Large Fabric Image Left -->
                <div v-if="item?.category === 'textile'" class="product-fabric-image">
                  <img 
                    :src="item.fabric_image || 'https://recasens.com/wp-content/uploads/2017/02/r_085.jpg'"
                    :alt="item.product_name"
                    class="fabric-img"
                  />
                  <span class="product-badge badge-textile-overlay">
                    <i class="fas fa-scroll"></i>
                  </span>
                </div>
                
                <div class="product-item-content">
                  <div class="product-item-header">
                    <span class="product-sku">{{ item?.sku || 'N/A' }}</span>
                  </div>
                  
                  <h4 class="product-name">
                    {{ item.product_name || 'ไม่ระบุชื่อ' }}
                  </h4>
                  
                  <div class="product-meta">
                    <div class="meta-item">
                      <i class="fas fa-tag"></i>
                      <span>{{ formatCurrency(item.unit_price || 0) }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-boxes"></i>
                      <span>{{ item?.stock_quantity || 0 }} {{ item?.unit || 'ชิ้น' }}</span>
                    </div>
                  </div>

                  <div v-if="item?.category === 'textile' && item?.lots" class="product-lots-count">
                    <i class="fas fa-layer-group"></i>
                    {{ item.lots.length }} ม้วน
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="localFilteredItems.length === 0" class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>ไม่พบสินค้า</h4>
                <p v-if="localInventorySearch">
                  ไม่พบสินค้าที่ตรงกับ "{{ localInventorySearch }}"
                </p>
                <p v-else>ยังไม่มีสินค้าในระบบ</p>
              </div>
            </div>
          </div>

          <!-- Right Panel: Product Details & Lot Selection -->
          <div class="content-right">
            <!-- Loading State -->
            <div v-if="isLoadingReservations" class="loading-overlay">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>กำลังโหลดข้อมูลการจอง...</p>
              </div>
            </div>
            
            <!-- Product Details -->
            <div v-if="selectedProductItem" class="product-details">
              <div class="details-header">
                <div>
                  <h3 class="details-title">{{ selectedProductItem.product_name }}</h3>
                  <p class="details-sku">SKU: {{ selectedProductItem.sku }}</p>
                </div>
                <button
                  v-if="selectedProductItem.category !== 'textile'"
                  @click="handleSelectProduct(selectedProductItem)"
                  class="btn-select-product"
                >
                  <i class="fas fa-check mr-2"></i>
                  เลือกสินค้านี้
                </button>
              </div>

              <div class="details-grid">
                <div class="detail-card">
                  <div class="detail-label">ราคาต่อหน่วย</div>
                  <div class="detail-value">{{ formatCurrency(selectedProductItem.unit_price || 0) }}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">หน่วย</div>
                  <div class="detail-value">{{ selectedProductItem.unit || 'ชิ้น' }}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">คงเหลือ</div>
                  <div class="detail-value">{{ selectedProductItem.stock_quantity || 0 }}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">พร้อมใช้</div>
                  <div class="detail-value text-green-600">{{ getTotalAvailable(selectedProductItem).toFixed(2) }}</div>
                </div>
                <div v-if="getTotalReserved(selectedProductItem) > 0" class="detail-card">
                  <div class="detail-label">ติดจอง</div>
                  <div class="detail-value text-orange-600">{{ getTotalReserved(selectedProductItem).toFixed(2) }}</div>
                </div>
              </div>

              <!-- Lot Selection (for Textile Products) -->
              <div v-if="selectedProductItem.category === 'textile' && selectedProductItem.lots" class="lots-section">
                <div class="lots-header">
                  <h4>
                    <i class="fas fa-layer-group mr-2"></i>
                    เลือกม้วนผ้า
                  </h4>
                  <span class="lots-count">{{ selectedProductItem.lots.length }} ม้วน</span>
                </div>

                <div class="lots-grid">
                  <div 
                    v-for="lot in selectedProductItem.lots" 
                    :key="lot._id || lot.lot_code"
                    class="lot-card"
                    :class="{
                      'lot-card-available': getAvailableMeters(lot) > 0,
                      'lot-card-unavailable': getAvailableMeters(lot) <= 0
                    }"
                    @click="getAvailableMeters(lot) > 0 ? handleSelectProductWithLot(selectedProductItem, lot) : null"
                  >
                    <div class="lot-header">
                      <div class="lot-header-left">
                        <img 
                          :src="lot.status === 'full' || lot.status === 'available' || !lot.status ? 
                            'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762841228909.png' : 
                            'https://vue-project.sgp1.digitaloceanspaces.com/2025/11/1762841229498.png'" 
                          :alt="lot.status === 'full' || lot.status === 'available' || !lot.status ? 'full roll' : 'partial roll'" 
                          class="lot-roll-icon"
                          :title="lot.status === 'full' || lot.status === 'available' || !lot.status ? 'ม้วนเต็ม' : 'ม้วนบางส่วน'"
                        />
                        <!-- Fabric texture preview -->
                        <img 
                          :src="lot.fabric_image || 'https://recasens.com/wp-content/uploads/2017/02/r_085.jpg'"
                          :alt="`ผ้า ${lot.color_code || ''}`"
                          class="lot-fabric-preview"
                          :title="`สี: ${lot.color_code || 'ไม่ระบุ'}`"
                        />
                        <span class="lot-code">{{ lot.full_lot_code || lot.lot_code }}</span>
                      </div>
                      <span 
                        v-if="getLotReservationStatus(lot)"
                        :class="{
                          'badge-fully-reserved': getLotReservationStatus(lot).type === 'fully_reserved',
                          'badge-partially-reserved': getLotReservationStatus(lot).type === 'partially_reserved'
                        }"
                        class="lot-badge"
                      >
                        <i class="fas fa-lock mr-1"></i>
                        {{ getLotReservationStatus(lot).label }}
                      </span>
                    </div>
                    
                    <div class="lot-stats">
                      <div class="stat-row">
                        <span class="stat-label">คงเหลือทั้งหมด:</span>
                        <span class="stat-value">{{ lot.remaining_meters?.toFixed(2) || '0.00' }} ม.</span>
                      </div>
                      
                      <div 
                        v-if="lot.remaining_meters - getAvailableMeters(lot) > 0"
                        class="stat-row stat-reserved"
                      >
                        <span class="stat-label">
                          <i class="fas fa-lock mr-1"></i>
                          ติดจอง:
                        </span>
                        <span class="stat-value">
                          {{ (lot.remaining_meters - getAvailableMeters(lot)).toFixed(2) }} ม.
                          <span 
                            v-if="lotReservations && lotReservations[lot._id]" 
                            class="stat-count"
                          >
                            ({{ lotReservations[lot._id].reservations.length }} รายการ)
                          </span>
                        </span>
                      </div>
                      
                      <div class="stat-row stat-available">
                        <span class="stat-label">
                          <i class="fas fa-check-circle mr-1"></i>
                          พร้อมใช้:
                        </span>
                        <span class="stat-value stat-value-highlight">
                          {{ getAvailableMeters(lot).toFixed(2) }} ม.
                        </span>
                      </div>
                      
                      <div class="stat-row">
                        <span class="stat-label">
                          <i class="fas fa-weight mr-1"></i>
                          น้ำหนัก:
                        </span>
                        <span class="stat-value">{{ lot.weight_kg || 0 }} กก.</span>
                      </div>
                    </div>

                    <!-- Reservation Details -->
                    <div 
                      v-if="getLotReservationStatus(lot)" 
                      class="lot-reservations"
                    >
                      <div class="reservation-header">
                        <i class="fas fa-info-circle mr-1"></i>
                        การจอง:
                      </div>
                      <div class="reservation-list">
                        <div 
                          v-for="reservation in getLotReservationStatus(lot).reservations.slice(0, 2)" 
                          :key="reservation.id"
                          class="reservation-item"
                        >
                          <i class="fas fa-caret-right mr-1"></i>
                          <span class="reservation-meters">{{ reservation.reserved_meters.toFixed(2) }} ม.</span>
                          <span v-if="reservation.is_full_roll" class="reservation-full-roll">(ทั้งม้วน)</span>
                          - {{ reservation.reference_code || reservation.reference_type }}
                          <span 
                            :class="{
                              'text-orange-600': reservation.status === 'not_paid',
                              'text-green-600': reservation.status === 'paid'
                            }"
                            class="reservation-status"
                          >
                            ({{ reservation.status === 'not_paid' ? 'รอชำระ' : 'ชำระแล้ว' }})
                          </span>
                        </div>
                        <div 
                          v-if="getLotReservationStatus(lot).reservations.length > 2" 
                          class="reservation-more"
                        >
                          ... และอีก {{ getLotReservationStatus(lot).reservations.length - 2 }} รายการ
                        </div>
                      </div>
                    </div>
                    
                    <!-- Not Available Notice -->
                    <div v-if="getAvailableMeters(lot) <= 0" class="lot-unavailable">
                      <i class="fas fa-ban mr-2"></i>
                      <span>ไม่สามารถเลือกได้ (ติดจองหมดแล้ว)</span>
                    </div>

                    <!-- Select Action -->
                    <div v-else class="lot-action">
                      <i class="fas fa-hand-pointer mr-2"></i>
                      คลิกเพื่อเลือกม้วนนี้
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State when no product selected -->
            <div v-else class="no-selection">
              <i class="fas fa-hand-pointer"></i>
              <h4>เลือกสินค้าจากรายการด้านซ้าย</h4>
              <p>คลิกที่สินค้าเพื่อดูรายละเอียดและเลือกม้วนผ้า</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lot Selection Method Modal -->
    <div v-if="showLotMethodModal" class="modal-overlay" @click="showLotMethodModal = false">
      <div class="modal-content" @click.stop style="max-width: 500px;">
        <div class="modal-header">
          <h3>
            <i class="fas fa-scroll mr-2"></i>
            เลือกวิธีการสั่งซื้อ
          </h3>
          <button class="close-btn" @click="showLotMethodModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedLot" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="text-sm font-semibold text-blue-900 mb-1">
              {{ selectedProduct?.product_name }}
            </div>
            <div class="text-xs text-blue-700">
              <span class="font-mono">{{ selectedLot.full_lot_code || selectedLot.lot_code }}</span>
              - คงเหลือ: <span class="font-semibold">{{ selectedLot.remaining_meters }} เมตร</span>
              ({{ selectedLot.weight_kg }} กก.)
            </div>
          </div>

          <div class="space-y-3">
            <!-- Option 1: ยกทั้งม้วน -->
            <div 
              @click="confirmLotSelection('full_roll')"
              class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center">
                    <i class="fas fa-layer-group text-purple-600 text-lg"></i>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">ยกทั้งม้วน</h4>
                  <p class="text-xs text-gray-600 mb-2">
                    รับผ้าทั้งม้วน {{ selectedLot?.remaining_meters }} เมตร
                  </p>
                  <div class="flex items-center text-xs text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>
                    ไม่ต้องระบุจำนวน
                  </div>
                </div>
              </div>
            </div>

            <!-- Option 2: ระบุจำนวนเมตร -->
            <div 
              @click="confirmLotSelection('custom_meters')"
              class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                    <i class="fas fa-ruler-horizontal text-blue-600 text-lg"></i>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">ระบุจำนวนเมตร</h4>
                  <p class="text-xs text-gray-600 mb-2">
                    ตัดตามจำนวนที่ต้องการ (สูงสุด {{ selectedLot?.remaining_meters }} ม.)
                  </p>
                  <div class="flex items-center text-xs text-blue-600">
                    <i class="fas fa-edit mr-1"></i>
                    กำหนดจำนวนเองได้
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="showLotMethodModal = false" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'ProductInventoryModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    products: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['update:modelValue', 'select-product', 'select-product-with-lot'],
  
  setup(props, { emit }) {
    // Local state
    const localInventorySearch = ref('')
    const localShowOnlyTextile = ref(false)
    const localShowOnlyAvailable = ref(false)
    const localFilteredItems = ref([])
    const selectedProductItem = ref(null)
    
    // Lot reservations
    const lotReservations = ref({})
    const isLoadingReservations = ref(false)
    
    // Lot method modal
    const showLotMethodModal = ref(false)
    const selectedProduct = ref(null)
    const selectedLot = ref(null)
    
    // Methods
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    }
    
    const filterInventoryItems = () => {
      console.log('[ProductInventoryModal] filterInventoryItems called')
      console.log('[ProductInventoryModal] props.products:', props.products.length)
      
      let items = [...props.products]
      
      // Filter by search term
      if (localInventorySearch.value) {
        const search = localInventorySearch.value.toLowerCase()
        items = items.filter(item => {
          const matchesBasic = 
            item.sku?.toLowerCase().includes(search) ||
            item.product_name?.toLowerCase().includes(search)
          
          // Also search in lot codes for textile products
          if (item.category === 'textile' && item.lots) {
            const matchesLot = item.lots.some(lot => 
              lot.lot_code?.toLowerCase().includes(search) ||
              lot.full_lot_code?.toLowerCase().includes(search)
            )
            return matchesBasic || matchesLot
          }
          
          return matchesBasic
        })
      }
      
      // Filter by textile only
      if (localShowOnlyTextile.value) {
        items = items.filter(item => item.category === 'textile')
      }
      
      // Filter by available stock
      if (localShowOnlyAvailable.value) {
        items = items.filter(item => (item.stock_quantity || 0) > 0)
      }
      
      localFilteredItems.value = items
      console.log('[ProductInventoryModal] Filtered items:', items.length)
    }
    
    // ✅ Load lot reservations for specific product
    const loadLotReservationsForProduct = async (productId) => {
      try {
        isLoadingReservations.value = true
        console.log('[ProductInventoryModal] 📦 Loading lots with reservations for product:', productId)
        
        const core = window.ERP_CORE
        if (!core?.inventory) {
          console.warn('[ProductInventoryModal] No inventory service available')
          return
        }
        
        // ✅ ใช้ API ใหม่ที่ join reservations มาพร้อมกับ lot_tracking
        const lotsWithReservations = await core.inventory.getLotsWithReservations(productId)
        
        console.log(`[ProductInventoryModal] ✅ Received ${lotsWithReservations.length} lots with reservations`)
        
        // Update product lots และ reservation map
        const product = props.products.find(p => (p.id || p._id) === productId)
        if (product && lotsWithReservations.length > 0) {
          // ✅ Replace (ไม่ merge) เพื่อให้ได้ข้อมูลล่าสุดเสมอ
          const reservationMap = {}
          
          lotsWithReservations.forEach(lot => {
            const lotId = lot._id
            
            // เก็บข้อมูล reservation (รวมทั้ง lots ที่ไม่มี reservation)
            reservationMap[lotId] = {
              total_reserved_meters: lot.total_reserved_meters || 0,
              available_meters: lot.available_meters || 0,
              is_fully_reserved: lot.is_fully_reserved || false,
              reservations: (lot.reservations || []).map(r => ({
                id: r._id || r.id,
                product_id: r.product_id,
                product_code: r.product_code,
                lot_code: r.lot_code,
                reference_type: r.reference_type,
                reference_id: r.reference_id,
                reference_code: r.reference_number || r.reference_code,
                reserved_meters: parseFloat(r.reserved_meters || 0),
                status: r.status,
                is_full_roll: r.is_full_roll || false,
                expiry_date: r.expiry_date,
                created_at: r.created_at
              }))
            }
            
            if (lot.reservations && lot.reservations.length > 0) {
              console.log(`[ProductInventoryModal] ✅ Lot ${lot.lot_code}:`, {
                lot_id: lotId,
                remaining: lot.remaining_meters,
                reserved: lot.total_reserved_meters,
                available: lot.available_meters,
                reservations_count: lot.reservations.length
              })
            }
          })
          
          // ✅ Replace instead of merge (fresh data every time)
          lotReservations.value = reservationMap
          
          console.log('[ProductInventoryModal] ✅ Updated reservation map:', {
            product_id: productId,
            total_lots: Object.keys(reservationMap).length,
            lots_with_reservations: Object.values(reservationMap).filter(r => r.reservations.length > 0).length
          })
        }
      } catch (err) {
        console.error('[ProductInventoryModal] ❌ Error loading lots with reservations:', err)
      } finally {
        isLoadingReservations.value = false
      }
    }
    
    const selectProductItem = async (item) => {
      selectedProductItem.value = item
      console.log('[ProductInventoryModal] Selected product:', item.sku)
      
      // ✅ Clear old reservation data (ป้องกัน stale data)
      lotReservations.value = {}
      
      // โหลด reservations สำหรับสินค้านี้ (ดึงข้อมูลสดๆ ทุกครั้ง)
      if (item.category === 'textile' && (item.id || item._id)) {
        await loadLotReservationsForProduct(item.id || item._id)
      }
    }
    
    const getAvailableMeters = (lot) => {
      if (!lot?._id) {
        return lot?.remaining_meters || 0
      }
      
      const reservationData = lotReservations.value[lot._id]
      
      // ✅ ใช้ available_meters ที่คำนวณไว้แล้ว
      if (reservationData && typeof reservationData.available_meters === 'number') {
        return reservationData.available_meters
      }
      
      // Fallback: คำนวณเอง ถ้าไม่มี available_meters
      if (reservationData) {
        const remaining = parseFloat(lot.remaining_meters || 0)
        const reserved = parseFloat(reservationData.total_reserved_meters || 0)
        return Math.max(0, remaining - reserved)
      }
      
      return lot?.remaining_meters || 0
    }
    
    const getLotReservationStatus = (lot) => {
      if (!lot?._id || !lotReservations.value[lot._id]) {
        return null
      }
      
      const reservationData = lotReservations.value[lot._id]
      const reservations = reservationData.reservations || []
      
      if (reservations.length === 0) {
        return null
      }
      
      const availableMeters = reservationData.available_meters || 0
      const isFullyReserved = availableMeters <= 0
      
      return {
        type: isFullyReserved ? 'fully_reserved' : 'partially_reserved',
        label: isFullyReserved ? 'จองหมดแล้ว' : `จองแล้ว ${reservations.length} รายการ`,
        reservations: reservations
      }
    }
    
    const getTotalReserved = (item) => {
      if (item?.category === 'textile' && item?.lots) {
        return item.lots.reduce((total, lot) => {
          const reservationData = lotReservations.value[lot._id]
          if (reservationData) {
            const reserved = (lot.remaining_meters || 0) - (reservationData.available_meters || 0)
            return total + reserved
          }
          return total
        }, 0)
      }
      return 0
    }
    
    const getTotalAvailable = (item) => {
      if (item?.category === 'textile' && item?.lots) {
        return item.lots.reduce((total, lot) => {
          return total + getAvailableMeters(lot)
        }, 0)
      }
      return item?.stock_quantity || 0
    }
    
    const handleSelectProduct = (item) => {
      emit('select-product', item)
      emit('update:modelValue', false)
    }
    
    const handleSelectProductWithLot = (item, lot) => {
      selectedProduct.value = item
      selectedLot.value = lot
      showLotMethodModal.value = true
    }
    
    const confirmLotSelection = (method) => {
      emit('select-product-with-lot', {
        product: selectedProduct.value,
        lot: selectedLot.value,
        method: method
      })
      showLotMethodModal.value = false
      emit('update:modelValue', false)
      selectedProduct.value = null
      selectedLot.value = null
    }
    
    // Initialize filtered items
    filterInventoryItems()
    
    // Watch for products changes (when modal opens and loads data)
    watch(() => props.products, async () => {
      console.log('[ProductInventoryModal] Products updated:', props.products.length)
      filterInventoryItems()
      
      // ✅ Auto-select first product when products are loaded
      if (props.modelValue && props.products.length > 0 && !selectedProductItem.value) {
        // Wait for filtered items to update
        await nextTick()
        if (localFilteredItems.value.length > 0) {
          console.log('[ProductInventoryModal] Auto-selecting first product:', localFilteredItems.value[0].sku)
          await selectProductItem(localFilteredItems.value[0])
        }
      }
    }, { deep: true })
    
    // Watch for modal open (also auto-select if products already loaded)
    watch(() => props.modelValue, async (isOpen) => {
      if (isOpen && props.products.length > 0 && !selectedProductItem.value) {
        await nextTick()
        if (localFilteredItems.value.length > 0) {
          console.log('[ProductInventoryModal] Auto-selecting first product on modal open:', localFilteredItems.value[0].sku)
          await selectProductItem(localFilteredItems.value[0])
        }
      } else if (!isOpen) {
        // Reset selection when modal closes
        selectedProductItem.value = null
        lotReservations.value = {}
      }
    })
    
    // Watch for search/filter changes
    watch([localInventorySearch, localShowOnlyTextile, localShowOnlyAvailable], () => {
      filterInventoryItems()
    })
    
    return {
      // Local state
      localInventorySearch,
      localShowOnlyTextile,
      localShowOnlyAvailable,
      localFilteredItems,
      selectedProductItem,
      // Reservations
      lotReservations,
      isLoadingReservations,
      // Lot method modal
      showLotMethodModal,
      selectedProduct,
      selectedLot,
      // Methods
      formatCurrency,
      filterInventoryItems,
      selectProductItem,
      loadLotReservationsForProduct,
      getAvailableMeters,
      getLotReservationStatus,
      getTotalReserved,
      getTotalAvailable,
      handleSelectProduct,
      handleSelectProductWithLot,
      confirmLotSelection
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-fullscreen {
  max-width: 95vw;
  max-height: 95vh;
  width: 95vw;
  height: 95vh;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal Header */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}

.modal-header .close-btn:hover {
  color: #4b5563;
}

/* Split Layout */
.modal-body-split {
  display: grid;
  grid-template-columns: 350px 1fr;
  flex: 1;
  overflow: hidden;
}

/* Left Sidebar */
.sidebar-left {
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relative {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.filters-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #4b5563;
}

.filter-checkbox input {
  margin-right: 6px;
  cursor: pointer;
}

.filter-count {
  font-weight: 600;
  color: #3b82f6;
  white-space: nowrap;
}

/* Product List */
.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.product-item {
  display: flex;
  flex-direction: row;
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-height: 90px;
  padding: 8px;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.product-item:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.product-item-active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transform: translateX(4px);
}

.product-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px 0 0 8px;
}

.product-item-active .product-fabric-image {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.product-item-textile {
  position: relative;
}

.product-fabric-image {
  position: relative;
  width: 80px;
  min-width: 80px;
  height: 80px;
  overflow: hidden;
  background: #f9fafb;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.fabric-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-textile-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(124, 58, 237, 0.95);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.product-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.product-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-fabric-thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  border: 1.5px solid #e5e7eb;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.product-sku {
  font-family: monospace;
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
}

.product-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
}

.badge-textile {
  background: #f3e8ff;
  color: #7c3aed;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-lots-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

/* Empty State in Sidebar */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
}

/* Right Content Panel */
.content-right {
  position: relative;
  overflow-y: auto;
  background: white;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  text-align: center;
  color: #3b82f6;
}

.loading-spinner i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.loading-spinner p {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

/* No Selection State */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}

.no-selection i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.no-selection h4 {
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.no-selection p {
  font-size: 14px;
  color: #9ca3af;
}

/* Product Details */
.product-details {
  padding: 24px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.details-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.details-sku {
  font-size: 14px;
  color: #6b7280;
  font-family: monospace;
}

.btn-select-product {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-select-product:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* Lots Section */
.lots-section {
  margin-top: 24px;
}

.lots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.lots-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
}

.lots-count {
  background: #eff6ff;
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

/* Lots Grid */
.lots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.lot-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
}

.lot-card-available {
  cursor: pointer;
}

.lot-card-available:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.lot-card-unavailable {
  opacity: 0.6;
  background: #f9fafb;
  cursor: not-allowed;
}

.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.lot-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lot-roll-icon {
  width: 48px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}

.lot-fabric-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: help;
  transition: all 0.2s;
}

.lot-fabric-preview:hover {
  transform: scale(1.15);
  border-color: #9ca3af;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.lot-code {
  font-family: monospace;
  font-weight: 700;
  color: #7c3aed;
  font-size: 15px;
}

.lot-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.badge-fully-reserved {
  background: #fee2e2;
  color: #dc2626;
}

.badge-partially-reserved {
  background: #fed7aa;
  color: #ea580c;
}

/* Lot Stats */
.lot-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.stat-label {
  color: #6b7280;
  display: flex;
  align-items: center;
}

.stat-value {
  font-weight: 600;
  color: #111827;
}

.stat-reserved .stat-label {
  color: #ea580c;
}

.stat-reserved .stat-value {
  color: #ea580c;
}

.stat-available {
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.stat-available .stat-label {
  color: #059669;
  font-weight: 600;
}

.stat-value-highlight {
  font-size: 20px;
  color: #059669;
}

.stat-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}

/* Lot Reservations */
.lot-reservations {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 10px;
  margin-top: 12px;
  font-size: 12px;
}

.reservation-header {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 6px;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reservation-item {
  color: #78350f;
  line-height: 1.5;
}

.reservation-meters {
  font-weight: 600;
}

.reservation-full-roll {
  color: #7c3aed;
  font-weight: 600;
}

.reservation-status {
  font-weight: 600;
}

.reservation-more {
  color: #a16207;
  font-style: italic;
}

/* Lot Actions */
.lot-unavailable {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  margin-top: 12px;
}

.lot-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  margin-top: 12px;
  transition: all 0.2s;
}

.lot-card-available:hover .lot-action {
  background: #3b82f6;
  color: white;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 12px 12px;
}

/* Scrollbar */
.product-list::-webkit-scrollbar,
.content-right::-webkit-scrollbar {
  width: 8px;
}

.product-list::-webkit-scrollbar-track,
.content-right::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.product-list::-webkit-scrollbar-thumb,
.content-right::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.product-list::-webkit-scrollbar-thumb:hover,
.content-right::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Utility Classes */
.text-green-600 {
  color: #059669;
}

.text-orange-600 {
  color: #ea580c;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>

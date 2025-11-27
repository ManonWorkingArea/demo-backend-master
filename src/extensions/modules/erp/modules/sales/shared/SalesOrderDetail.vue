<template>
  <div class="sales-order-detail">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-content">
        <div class="title-section">
          <button class="btn-back" @click="$router.go(-1)">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="title-info">
            <h2>รายละเอียดใบขาย</h2>
            <p class="order-number">{{ order?.orderNumber || 'กำลังโหลด...' }}</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-success" @click="createWorkOrder" v-if="order?.status === 'confirmed' && !hasWorkOrder">
            <i class="fas fa-tasks"></i>
            สร้าง Work Order
          </button>
          <button class="btn btn-outline" @click="viewWorkOrder" v-if="hasWorkOrder">
            <i class="fas fa-eye"></i>
            ดู Work Order
          </button>
          <button class="btn btn-outline" @click="printOrder">
            <i class="fas fa-print"></i>
            พิมพ์
          </button>
          <button class="btn btn-outline" @click="editOrder" v-if="order?.status === 'draft'">
            <i class="fas fa-edit"></i>
            แก้ไข
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadOrder">
        <i class="fas fa-refresh"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="order-content">
      <!-- Status & Actions Bar -->
      <div class="status-bar">
        <div class="current-status">
          <span class="status-label">สถานะปัจจุบัน:</span>
          <span class="status-badge" :class="getStatusClass(order?.status)">
            {{ getStatusText(order?.status) }}
          </span>
        </div>
        
        <div class="status-actions">
          <button 
            v-for="action in availableActions" 
            :key="action.status"
            @click="changeStatus(action.status)"
            class="btn btn-sm"
            :class="action.class"
            :disabled="loading"
          >
            <i :class="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Order Information Grid -->
      <div class="order-info-grid">
        <!-- Customer Information -->
        <div class="info-card">
          <h3>
            <i class="fas fa-user"></i>
            ข้อมูลลูกค้า
          </h3>
          <div class="info-content">
            <div class="info-row">
              <label>ชื่อลูกค้า:</label>
              <span>{{ order?.customerName || '-' }}</span>
            </div>
            <div class="info-row" v-if="order?.customer_phone">
              <label>เบอร์โทร:</label>
              <span>{{ order.customer_phone }}</span>
            </div>
            <div class="info-row" v-if="order?.customer_email">
              <label>อีเมล:</label>
              <span>{{ order.customer_email }}</span>
            </div>
            <div class="info-row" v-if="order?.customer_address">
              <label>ที่อยู่:</label>
              <span>{{ order.customer_address }}</span>
            </div>
          </div>
        </div>

        <!-- Order Information -->
        <div class="info-card">
          <h3>
            <i class="fas fa-file-alt"></i>
            ข้อมูลใบขาย
          </h3>
          <div class="info-content">
            <div class="info-row">
              <label>เลขที่ใบขาย:</label>
              <span>{{ order?.orderNumber || '-' }}</span>
            </div>
            
            <!-- Invoice Reference -->
            <div class="info-row" v-if="order?.invoice_number">
              <label>อ้างอิงจาก Invoice:</label>
              <button 
                class="reference-link invoice-link"
                @click="viewInvoice"
                title="คลิกเพื่อดู Invoice"
              >
                <i class="fas fa-file-invoice"></i>
                {{ order.invoice_number }}
              </button>
            </div>
            
            <!-- Quotation Reference -->
            <div class="info-row" v-if="order?.quotation_number">
              <label>อ้างอิงจาก Quotation:</label>
              <button 
                class="reference-link quotation-link"
                @click="viewQuotation"
                title="คลิกเพื่อดู Quotation"
              >
                <i class="fas fa-file-alt"></i>
                {{ order.quotation_number }}
              </button>
            </div>
            
            <div class="info-row">
              <label>วันที่สร้าง:</label>
              <span>{{ formatDate(order?.order_date || order?.created_date) }}</span>
            </div>
            <div class="info-row">
              <label>วันที่แก้ไขล่าสุด:</label>
              <span>{{ formatDate(order?.updated_date || order?.created_date) }}</span>
            </div>
            <div class="info-row" v-if="order?.notes">
              <label>หมายเหตุ:</label>
              <span>{{ order.notes }}</span>
            </div>
          </div>
        </div>
        
        <!-- Stock Status Information -->
        <div class="info-card" v-if="order?.status === 'confirmed' || stockReservation">
          <h3>
            <i class="fas fa-boxes"></i>
            สถานะสต็อกและการจอง
          </h3>
          <div class="info-content">
            <div class="info-row" v-if="stockReservation && stockReservation.length > 0">
              <label>การจองสต็อก:</label>
              <span class="stock-reserved">
                <i class="fas fa-lock text-success"></i>
                จองแล้ว {{ stockReservation.length }} รายการ
              </span>
            </div>
            <div class="info-row" v-else-if="order?.status === 'confirmed'">
              <label>การจองสต็อก:</label>
              <span class="stock-not-reserved">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                ยังไม่ได้จองสต็อก
              </span>
            </div>
            <div class="info-row" v-if="order?.status === 'confirmed'">
              <label>ขั้นตอนถัดไป:</label>
              <span class="next-step-info">
                <i class="fas fa-info-circle text-info"></i>
                ไปที่โมดูล Production เพื่อสร้าง Work Order
              </span>
            </div>
            <div class="info-row">
              <button 
                class="btn btn-sm btn-info" 
                @click="checkCurrentStock"
                :disabled="checkingStock"
              >
                <i v-if="checkingStock" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                {{ checkingStock ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสต็อกปัจจุบัน' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reservation Records Section -->
      <div class="reservation-section" v-if="reservationRecords && reservationRecords.length > 0">
        <h3>
          <i class="fas fa-link"></i>
          รายการจอง Inventory ที่เชื่อมโยง
        </h3>
        
        <div class="table-wrapper">
          <table class="reservation-table">
            <thead>
              <tr>
                <th>Inventory ID</th>
                <th>สินค้า</th>
                <th>จำนวนจอง</th>
                <th>หน่วย</th>
                <th>สถานะ</th>
                <th>วันที่จอง</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in reservationRecords" :key="record.id">
                <td>
                  <code class="inventory-id">{{ record.id }}</code>
                </td>
                <td>
                  <div class="product-info">
                    <strong>{{ record.product_name || 'ไม่ระบุชื่อ' }}</strong>
                    <div class="product-code" v-if="record.sku">
                      SKU: {{ record.sku }}
                    </div>
                  </div>
                </td>
                <td class="text-center">{{ record.quantity || 0 }}</td>
                <td class="text-center">{{ record.unit || 'ชิ้น' }}</td>
                <td class="text-center">
                  <span class="status-badge" :class="getReservationStatusClass(record.status)">
                    {{ getReservationStatusText(record.status) }}
                  </span>
                </td>
                <td class="text-center">{{ formatDate(record.movement_date || record.created_date) }}</td>
                <td>
                  <div class="notes-cell">
                    {{ record.notes || '-' }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="reservation-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">รวมรายการจอง:</span>
              <span class="stat-value">{{ reservationRecords.length }} รายการ</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">จำนวนรวม:</span>
              <span class="stat-value">{{ totalReservedQuantity }} หน่วย</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="items-section">
        <h3>
          <i class="fas fa-list"></i>
          รายการสินค้า
        </h3>
        
        <div class="table-wrapper">
          <table class="items-table">
            <thead>
              <tr>
                <th>รายการ</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>ราคาต่อหน่วย</th>
                <th>ส่วนลด</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in (order?.items || [])" :key="index">
                <td>
                  <div class="item-info">
                    <strong>{{ item.productName || item.product_name || item.name || item.itemName || 'ไม่ระบุชื่อสินค้า' }}</strong>
                    <div class="item-code" v-if="item.code || item.sku">
                      รหัส: {{ item.code || item.sku }}
                    </div>
                    <!-- Debug info - disabled to prevent DOM issues -->
                    <div style="font-size: 10px; color: #888; margin-top: 2px;" v-if="false">
                      Debug: {{ JSON.stringify({
                        productName: item.productName,
                        product_name: item.product_name,
                        name: item.name,
                        itemName: item.itemName,
                        code: item.code,
                        sku: item.sku
                      }) }}
                    </div>
                  </div>
                </td>
                <td class="text-center">{{ item.quantity || 0 }}</td>
                <td class="text-center">{{ item.unit || 'ชิ้น' }}</td>
                <td class="text-right">{{ formatCurrency(item.price || item.unitPrice || 0) }}</td>
                <td class="text-right">
                  {{ item.discount ? formatCurrency(item.discount) : '-' }}
                </td>
                <td class="text-right">
                  <strong>{{ formatCurrency(item.total || (item.quantity * (item.price || item.unitPrice)) || 0) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-content">
          <div class="summary-row">
            <label>ยอดรวมก่อนภาษี:</label>
            <span>{{ formatCurrency(order?.subtotal || calculateSubtotal()) }}</span>
          </div>
          <div class="summary-row" v-if="order?.discount">
            <label>ส่วนลด:</label>
            <span class="discount">-{{ formatCurrency(order.discount) }}</span>
          </div>
          <div class="summary-row" v-if="order?.tax">
            <label>ภาษี ({{ order?.taxRate || 7 }}%):</label>
            <span>{{ formatCurrency(order.tax) }}</span>
          </div>
          <div class="summary-row summary-total">
            <label>ยอดรวมทั้งสิ้น:</label>
            <span>{{ formatCurrency(order?.totalAmount || order?.total || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="activity-section" v-if="allActivityLogs && allActivityLogs.length">
        <h3>
          <i class="fas fa-history"></i>
          ประวัติการดำเนินการ
        </h3>
        
        <div class="activity-list">
          <div 
            v-for="(activity, index) in allActivityLogs" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="getActivityIconClass(activity.action)">
              <i :class="getActivityIcon(activity.action)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.description }}</div>
              <div class="activity-meta">
                <span class="activity-user" v-if="activity.user">{{ activity.user }}</span>
                <span class="activity-date">{{ formatDateTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Confirmation Modal -->
    <div v-show="showStatusModal" class="modal-overlay" @click="cancelStatusChange">
      <div class="modal-content status-modal" @click.stop>
        <div class="modal-header">
          <h3>ยืนยันการเปลี่ยนสถานะ</h3>
          <button class="modal-close" @click="cancelStatusChange">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="status-change-info">
            <div class="status-from">
              <label>สถานะปัจจุบัน:</label>
              <span class="status-badge" :class="getStatusClass(order?.status)">
                {{ getStatusText(order?.status) }}
              </span>
            </div>
            
            <div class="status-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            
            <div class="status-to">
              <label>สถานะใหม่:</label>
              <span class="status-badge" :class="getStatusClass(pendingStatus)">
                {{ getStatusText(pendingStatus) }}
              </span>
            </div>
          </div>
          
          <div class="status-notes">
            <label for="statusNotes">หมายเหตุ (ไม่บังคับ):</label>
            <textarea 
              id="statusNotes"
              v-model="statusNotes"
              class="form-textarea"
              rows="3"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelStatusChange" class="btn btn-secondary">
            ยกเลิก
          </button>
          <button @click="confirmStatusChange" class="btn btn-primary" :disabled="changingStatus">
            <i v-show="changingStatus" class="fas fa-spinner fa-spin"></i>
            <i v-show="!changingStatus" class="fas fa-check"></i>
            {{ changingStatus ? 'กำลังบันทึก...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Debug Panel -->
  <DocumentDebugPanel
    v-if="order"
    documentType="Sales Order"
    :currentDocument="order"
    :salesService="salesService"
  />
</template>

<script>
import { ref, computed, onMounted, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransactionEngine } from '../../../core/Engine.js'
import { TRANSACTION_TYPES } from '../../../core/Types.js'
import DocumentDebugPanel from './DocumentDebugPanel.vue'

export default {
  name: 'SalesOrderDetail',
  components: {
    DocumentDebugPanel
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const salesService = inject('salesService')
    
    // Data
    const order = ref(null)
    const loading = ref(true)
    const error = ref('')
    
    // Status change modal
    const showStatusModal = ref(false)
    const pendingStatus = ref('')
    const statusNotes = ref('')
    const changingStatus = ref(false)
    const isUpdating = ref(false) // ป้องกัน concurrent update
    
    // Work Order related
    const workOrder = ref(null)
    const hasWorkOrder = ref(false)
    const creatingWorkOrder = ref(false)
    
    // Transaction engine
    const engine = new TransactionEngine('local')
    
    // Stock management
    const stockReservation = ref(null)
    const checkingStock = ref(false)
    const reservationRecords = ref([]) // เก็บรายการ inventory records ที่จอง
    
    // Status definitions (ตรงกับ TRANSACTION_STATES.SALES)
    const statusDefinitions = {
      'draft': {
        label: 'ร่าง',
        class: 'status-draft',
        nextActions: [
          { status: 'quoted', label: 'ส่งใบเสนอราคา', class: 'btn-info', icon: 'fas fa-paper-plane' }
        ]
      },
      'quoted': {
        label: 'เสนอราคา',
        class: 'status-quoted',
        nextActions: [
          { status: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', class: 'btn-success', icon: 'fas fa-check' }
        ]
      },
      'confirmed': {
        label: 'ยืนยันแล้ว',
        class: 'status-confirmed',
        nextActions: [
          // ซ่อนปุ่มจัดส่ง - ต้องไปทำในโมดูลอื่น (Production/Delivery)
        ]
      },
      'delivered': {
        label: 'จัดส่งแล้ว',
        class: 'status-delivered',
        nextActions: [
          { status: 'invoiced', label: 'ออกใบแจ้งหนี้', class: 'btn-info', icon: 'fas fa-file-invoice' }
        ]
      },
      'invoiced': {
        label: 'ออกใบแจ้งหนี้แล้ว',
        class: 'status-invoiced',
        nextActions: [
          { status: 'complete', label: 'เสร็จสิ้น', class: 'btn-success', icon: 'fas fa-check-circle' }
        ]
      },
      'complete': {
        label: 'เสร็จสิ้น',
        class: 'status-complete',
        nextActions: []
      }
    }
    
    // Computed
    const availableActions = computed(() => {
      if (!order.value?.status) return []
      const statusDef = statusDefinitions[order.value.status]
      return statusDef ? statusDef.nextActions : []
    })

    const allActivityLogs = computed(() => {
      const dbLogs = order.value?.activityLog || []
      const localLogs = order.value?._localActivityLog || []
      
      // Combine and sort by timestamp
      return [...dbLogs, ...localLogs].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
    })

    const totalReservedQuantity = computed(() => {
      if (!reservationRecords.value || reservationRecords.value.length === 0) return 0
      return reservationRecords.value.reduce((total, record) => {
        return total + (record.quantity || 0)
      }, 0)
    })
    
    // Methods
    const loadOrder = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const orderId = route.params.id
        const result = await engine.read('sales', orderId)
        
        if (result.success && result.data) {
          order.value = result.data
          
          // Debug: ตรวจสอบข้อมูล items
          console.log('🛒 Order loaded:', result.data)
          console.log('📦 Order items:', result.data.items)
          if (result.data.items && result.data.items.length > 0) {
            console.log('🔍 First item fields:', Object.keys(result.data.items[0]))
            console.log('🏷️ First item product names:', {
              productName: result.data.items[0].productName,
              product_name: result.data.items[0].product_name,
              name: result.data.items[0].name,
              itemName: result.data.items[0].itemName
            })
          }
          // ตรวจสอบ work order ที่เกี่ยวข้อง
          await checkWorkOrder()
          
          // ตรวจสอบการจองสต็อกที่มีอยู่
          await checkStockReservation()
          
          // ✅ เมื่อสถานะเป็น "ยืนยันแล้ว" ควร query inventory records ที่เป็นการจอง
          if (result.data.status === 'confirmed') {
            console.log('📋 Order is confirmed - Loading reservation inventory records...')
            await loadReservationInventoryRecords()
          }
        } else {
          error.value = result.error || 'ไม่พบข้อมูลใบขาย'
        }
      } catch (err) {
        console.error('Error loading order:', err)
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    // Stock Management Functions
    const checkStockAvailability = async () => {
      try {
        if (!order.value?.items) return { available: false, details: [] }
        
        checkingStock.value = true
        console.log('📦 Checking stock availability for sales order items...')
        
        // โหลดข้อมูล Product และ Balance
        const [productResult, balanceResult] = await Promise.all([
          engine.list('product'),
          engine.list('inventory_balance') // ใช้ inventory_balance แบบ GoodsReceipt.vue
        ])
        
        const products = productResult?.data || []
        const balances = balanceResult?.data || []
        
        const stockDetails = []
        let allAvailable = true
        
        for (const item of order.value.items) {
          // ค้นหา product_id
          let productId = item.product_id
          
          if (!productId) {
            // พยายามค้นหาจาก product name หรือ SKU
            const product = products.find(p => 
              p.name === (item.productName || item.product_name || item.name) ||
              p.sku === (item.code || item.sku)
            )
            productId = product?.id
          }
          
          if (!productId) {
            stockDetails.push({
              item: item,
              product_id: null,
              available: false,
              current_stock: 0,
              reserved_stock: 0,
              available_stock: 0,
              required: item.quantity || 0,
              status: 'no_product_id'
            })
            allAvailable = false
            continue
          }
          
          // หา Balance สำหรับ product นี้
          const balance = balances.find(b => b.product_id === productId)
          const currentStock = balance?.qty_on_hand || 0
          const reservedStock = balance?.qty_reserved || 0
          const availableStock = balance?.qty_available || (currentStock - reservedStock)
          const required = item.quantity || 0
          
          const itemAvailable = availableStock >= required
          
          stockDetails.push({
            item: item,
            product_id: productId,
            available: itemAvailable,
            current_stock: currentStock,
            reserved_stock: reservedStock,
            available_stock: availableStock,
            required: required,
            status: itemAvailable ? 'available' : 'insufficient'
          })
          
          if (!itemAvailable) {
            allAvailable = false
          }
        }
        
        console.log('📊 Stock check results:', stockDetails)
        
        return {
          available: allAvailable,
          details: stockDetails
        }
        
      } catch (error) {
        console.error('❌ Error checking stock availability:', error)
        return { available: false, details: [], error: error.message }
      } finally {
        checkingStock.value = false
      }
    }
    
    const reserveStock = async () => {
      try {
        console.log('🔒 Starting stock reservation process for sales order...')
        console.log('📋 Order ID:', order.value?.id)
        console.log('📦 Order items:', order.value?.items)
        
        // ตรวจสอบสต็อกก่อน
        const stockCheck = await checkStockAvailability()
        console.log('📊 Stock check result:', stockCheck)
        
        if (!stockCheck.available) {
          console.error('❌ Stock not available:', stockCheck)
          throw new Error('สต็อกไม่เพียงพอสำหรับการจอง')
        }
        
        const reservations = []
        console.log(`🔄 Processing ${stockCheck.details?.length || 0} stock details for reservation...`)
        
        // ใช้ ERP_CORE Balance Manager (แบบเดียวกับ GoodsReceipt.vue)
        if (window.ERP_CORE && window.ERP_CORE.balance) {
          console.log('📊 Using ERP_CORE Balance Manager for stock reservation...')
          
          for (const detail of stockCheck.details) {
            if (detail.status === 'available' && detail.product_id) {
              try {
                // อัปเดต Balance โดยตรง - เพิ่ม reserved_quantity
                console.log(`🔍 Processing reservation for product ${detail.product_id}`)
                console.log(`📦 Item detail:`, detail)
                
                // ✅ ดึงข้อมูลสินค้าจริงๆ จาก Product table
                let productInfo = null
                try {
                  if (detail.product_id) {
                    const productResult = await engine.read('product', detail.product_id)
                    if (productResult.success && productResult.data) {
                      productInfo = productResult.data
                      console.log(`✅ Found product info:`, productInfo)
                    }
                  }
                  
                  // ถ้าไม่พบจาก product_id ให้ลองค้นหาจาก list
                  if (!productInfo) {
                    const productsResult = await engine.list('product')
                    if (productsResult.success && productsResult.data) {
                      productInfo = productsResult.data.find(p => 
                        p.id === detail.product_id ||
                        p.sku === (detail.item?.sku || detail.item?.code || detail.sku) ||
                        p.name === (detail.item?.productName || detail.item?.product_name || detail.item?.name)
                      )
                      if (productInfo) {
                        console.log(`✅ Found product by search:`, productInfo)
                      }
                    }
                  }
                } catch (productError) {
                  console.warn(`⚠️ Failed to fetch product info:`, productError.message)
                }
                
                console.log(`🏷️ Product info: ID=${detail.product_id}, SKU=${productInfo?.sku || detail.item?.sku}, Name=${productInfo?.name || detail.item?.productName}`)
                
                const balanceResult = await engine.list('inventory_balance')
                const balances = balanceResult?.data || []
                const existingBalance = balances.find(b => b.product_id === detail.product_id)
                
                console.log(`📊 Found balance for ${detail.product_id}:`, existingBalance)
                
                if (existingBalance) {
                  const updateData = {
                    qty_reserved: (existingBalance.qty_reserved || 0) + detail.required,
                    qty_available: Math.max(0, (existingBalance.qty_on_hand || 0) - ((existingBalance.qty_reserved || 0) + detail.required)),
                    updated_date: new Date().toISOString(),
                    updated_by: 'sales_system'
                  }
                  
                  const updateResult = await engine.update('inventory_balance', existingBalance.id, updateData)
                  
                  if (updateResult.success) {
                    // ✅ สร้าง stock_reservation record (แบบ GoodsReceipt.vue)
                    // ✅ ใช้ข้อมูลสินค้าจริงจาก Product table
                    const actualSku = productInfo?.sku || detail.item?.sku || detail.item?.code || detail.sku || detail.product_code || detail.productCode || 'UNKNOWN'
                    const actualProductName = productInfo?.name || detail.item?.productName || detail.item?.product_name || detail.item?.name || detail.product_name || detail.productName || detail.name || 'ไม่ทราบชื่อสินค้า'
                    
                    // ✅ แปลงหน่วยให้ตรงกับ validation schema
                    let actualUnit = productInfo?.unit || detail.item?.unit || detail.unit || 'ชิ้น'
                    const unitMapping = {
                      'roll': 'ม้วน',
                      'piece': 'ชิ้น', 
                      'pcs': 'ชิ้น',
                      'set': 'ชุด',
                      'box': 'กล่อง',
                      'pack': 'แพ็ค',
                      'kg': 'กิโลกรัม',
                      'g': 'กรัม', 
                      'gram': 'กรัม',
                      'l': 'ลิตร',
                      'liter': 'ลิตร',
                      'm': 'เมตร',
                      'meter': 'เมตร',
                      'bottle': 'ขวด',
                      'bag': 'ถุง'
                    }
                    
                    // แปลงหน่วยถ้าพบใน mapping หรือใช้ค่าเดิมถ้าเป็นภาษาไทยอยู่แล้ว
                    if (unitMapping[actualUnit]) {
                      actualUnit = unitMapping[actualUnit]
                    } else if (!['ชิ้น', 'ชุด', 'กล่อง', 'แพ็ค', 'กิโลกรัม', 'กรัม', 'ลิตร', 'เมตร', 'ม้วน', 'ขวด', 'ถุง'].includes(actualUnit)) {
                      actualUnit = 'ชิ้น' // fallback เป็นชิ้น
                    }
                    
                    const reservationData = {
                      subtype: 'reservation', // เปลี่ยนจาก 'stock_reservation' เป็น 'reservation'
                      product_id: detail.product_id,
                      sku: actualSku,
                      product_name: actualProductName,
                      product_code: productInfo?.code || productInfo?.sku || actualSku,
                      category: productInfo?.category || null,
                      brand: productInfo?.brand || null,
                      movement_type: 'adjustment', // ใช้ 'adjustment' ตาม validation schema ที่อนุญาต
                      transaction_type: 'reservation',
                      quantity: Math.abs(detail.required), // ใช้ค่าบวก (ไม่ใช่ลบ) เพื่อหลีกเลี่ยง validation error
                      unit: actualUnit,
                      reference_type: 'sales_order',
                      reference_id: order.value.id,
                      reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
                      sales_order_id: order.value.id,
                      notes: `Stock reserved for Sales Order ${order.value.orderNumber || order.value.id} - Product: ${actualProductName} (${actualSku})`,
                      movement_date: new Date().toISOString(),
                      created_by: 'sales_system',
                      status: 'available' // ใช้ 'available' ตามข้อมูลที่บันทึกจริง
                    }
                    
                    console.log(`📝 Creating stock reservation record with TRANSACTION_TYPES.INVENTORY:`)
                    console.log('🔗 TRANSACTION_TYPES.INVENTORY:', TRANSACTION_TYPES.INVENTORY)
                    console.log('📄 Reservation data:', JSON.stringify(reservationData, null, 2))
                    
                    const reservationResult = await engine.create(TRANSACTION_TYPES.INVENTORY, reservationData, 'sales_system')
                    console.log(`📊 Reservation creation result:`, reservationResult)
                    
                    // แสดง error ถ้ามี
                    if (!reservationResult.success) {
                      console.error(`❌ Failed to create reservation record:`, reservationResult.error)
                      console.error(`🚨 Full error details:`, reservationResult)
                    } else {
                      console.log(`✅ Successfully created reservation record with ID: ${reservationResult.data?.id}`)
                      // เพิ่ม record ใหม่ลงใน reservationRecords array
                      const newRecord = {
                        ...reservationData,
                        id: reservationResult.data?.id || `temp_${Date.now()}`,
                        created_date: reservationData.movement_date
                      }
                      reservationRecords.value.push(newRecord)
                    }
                    
                    reservations.push({
                      product_id: detail.product_id,
                      quantity: detail.required,
                      balance_id: existingBalance.id,
                      sales_order_id: order.value.id,
                      reservation_id: `pending_${Date.now()}` // จะได้ ID จริงจาก create result
                    })
                    console.log(`✅ Reserved ${detail.required} units for product ${detail.product_id}`)
                    
                    // Optional: ใช้ ERP_CORE.balance.recalculateProductBalance() เพื่อให้แน่ใจว่าคำนวณถูกต้อง
                    try {
                      if (window.ERP_CORE.balance.recalculateProductBalance) {
                        await window.ERP_CORE.balance.recalculateProductBalance(detail.product_id, {
                          updatedBy: 'sales_system'
                        })
                        console.log(`✅ Balance recalculated for product ${detail.product_id}`)
                      }
                    } catch (recalcError) {
                      console.warn(`⚠️ Balance recalculation failed for ${detail.product_id}:`, recalcError.message)
                      // ไม่หยุดกระบวนการ เพราะ reservation ได้ทำแล้ว
                    }
                  }
                } else {
                  console.warn(`⚠️ No balance record found for product ${detail.product_id}`)
                }
                
              } catch (error) {
                console.error(`❌ Error reserving stock for product ${detail.product_id}:`, error)
                throw error
              }
            }
          }
        } else {
          console.warn('⚠️ ERP_CORE.balance not available - using fallback method')
          console.log(`🔄 Processing ${stockCheck.details.length} items with fallback method`)
          
          // Fallback: อัปเดต Balance โดยตรงผ่าง TransactionEngine (วิธีเดิม)
          for (const detail of stockCheck.details) {
            if (detail.status === 'available' && detail.product_id) {
              
              // ✅ ดึงข้อมูลสินค้าจริงๆ จาก Product table (fallback)
              let productInfo = null
              try {
                if (detail.product_id) {
                  const productResult = await engine.read('product', detail.product_id)
                  if (productResult.success && productResult.data) {
                    productInfo = productResult.data
                  }
                }
              } catch (productError) {
                console.warn(`⚠️ Failed to fetch product info (fallback):`, productError.message)
              }
              
              const balanceResult = await engine.list('inventory_balance')
              const balances = balanceResult?.data || []
              const existingBalance = balances.find(b => b.product_id === detail.product_id)
              
              if (existingBalance) {
                const updateData = {
                  qty_reserved: (existingBalance.qty_reserved || 0) + detail.required,
                  qty_available: Math.max(0, (existingBalance.qty_on_hand || 0) - ((existingBalance.qty_reserved || 0) + detail.required)),
                  updated_date: new Date().toISOString(),
                  updated_by: 'sales_system'
                }
                
                const updateResult = await engine.update('inventory_balance', existingBalance.id, updateData)
                
                if (updateResult.success) {
                  // ✅ สร้าง stock_reservation record (fallback method) พร้อมข้อมูลสินค้าจริง
                  const actualSku = productInfo?.sku || detail.item?.sku || detail.item?.code || detail.sku || detail.product_code || detail.productCode || 'UNKNOWN'
                  const actualProductName = productInfo?.name || detail.item?.productName || detail.item?.product_name || detail.item?.name || detail.product_name || detail.productName || detail.name || 'ไม่ทราบชื่อสินค้า'
                  
                  // ✅ แปลงหน่วยให้ตรงกับ validation schema (fallback)
                  let actualUnit = productInfo?.unit || detail.item?.unit || detail.unit || 'ชิ้น'
                  const unitMapping = {
                    'roll': 'ม้วน',
                    'piece': 'ชิ้น', 
                    'pcs': 'ชิ้น',
                    'set': 'ชุด',
                    'box': 'กล่อง',
                    'pack': 'แพ็ค',
                    'kg': 'กิโลกรัม',
                    'g': 'กรัม', 
                    'gram': 'กรัม',
                    'l': 'ลิตร',
                    'liter': 'ลิตร',
                    'm': 'เมตร',
                    'meter': 'เมตร',
                    'bottle': 'ขวด',
                    'bag': 'ถุง'
                  }
                  
                  if (unitMapping[actualUnit]) {
                    actualUnit = unitMapping[actualUnit]
                  } else if (!['ชิ้น', 'ชุด', 'กล่อง', 'แพ็ค', 'กิโลกรัม', 'กรัม', 'ลิตร', 'เมตร', 'ม้วน', 'ขวด', 'ถุง'].includes(actualUnit)) {
                    actualUnit = 'ชิ้น' // fallback เป็นชิ้น
                  }
                  
                  const reservationData = {
                    subtype: 'reservation', // เปลี่ยนจาก 'stock_reservation' เป็น 'reservation'
                    product_id: detail.product_id,
                    sku: actualSku,
                    product_name: actualProductName,
                    product_code: productInfo?.code || productInfo?.sku || actualSku,
                    category: productInfo?.category || null,
                    brand: productInfo?.brand || null,
                    movement_type: 'adjustment', // ใช้ 'adjustment' ตาม validation schema ที่อนุญาต
                    transaction_type: 'reservation',
                    quantity: Math.abs(detail.required), // ใช้ค่าบวก (ไม่ใช่ลบ) เพื่อหลีกเลี่ยง validation error
                    unit: actualUnit,
                    reference_type: 'sales_order',
                    reference_id: order.value.id,
                    reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
                    sales_order_id: order.value.id,
                    notes: `Stock reserved for Sales Order ${order.value.orderNumber || order.value.id} - Product: ${actualProductName} (${actualSku}) (fallback)`,
                    movement_date: new Date().toISOString(),
                    created_by: 'sales_system',
                    status: 'available' // ใช้ 'available' ตามข้อมูลที่บันทึกจริง
                  }
                  
                  const reservationResult = await engine.create(TRANSACTION_TYPES.INVENTORY, reservationData, 'sales_system')
                  console.log(`✅ Created stock reservation record for ${detail.sku} (fallback):`, reservationResult)
                  
                  if (!reservationResult.success) {
                    console.error(`❌ Failed to create reservation record (fallback):`, reservationResult.error)
                  } else {
                    // เพิ่ม record ใหม่ลงใน reservationRecords array (fallback)
                    const newRecord = {
                      ...reservationData,
                      id: reservationResult.data?.id || `temp_fallback_${Date.now()}`,
                      created_date: reservationData.movement_date
                    }
                    reservationRecords.value.push(newRecord)
                  }
                  
                  reservations.push({
                    product_id: detail.product_id,
                    quantity: detail.required,
                    balance_id: existingBalance.id,
                    sales_order_id: order.value.id,
                    reservation_id: `pending_${Date.now()}`
                  })
                  console.log(`✅ Reserved ${detail.required} units for product ${detail.product_id} (fallback)`)
                }
              }
            }
          }
        }
        
        stockReservation.value = reservations
        console.log(`✅ Stock reservation completed: ${reservations.length} items reserved`)
        
        return reservations
        
      } catch (error) {
        console.error('❌ Error reserving stock:', error)
        throw error
      }
    }
    
    const checkStockReservation = async () => {
      try {
        if (!order.value?.id) return
        
        // ตรวจสอบ stock_reservation records จาก inventory
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        
        if (inventoryResult.success && inventoryResult.data) {
          // หา reservation records ที่ reserved สำหรับใบขายนี้
          const foundReservationRecords = inventoryResult.data.filter(
            inv => inv.subtype === 'reservation' && 
                   inv.sales_order_id === order.value.id && 
                   inv.movement_type === 'adjustment' && // เปลี่ยนจาก 'reserve' เป็น 'adjustment'
                   inv.transaction_type === 'reservation'
                   // ไม่กรอง status เพราะข้อมูลจริงอาจจะเป็น 'available' แทน 'reserved'
          )
          
          if (foundReservationRecords.length > 0) {
            // เก็บ inventory records ที่ใช้แสดงผล
            reservationRecords.value = foundReservationRecords
            
            // แปลงข้อมูล inventory records เป็นรูปแบบการจอง (เพื่อความเข้ากันได้)
            stockReservation.value = foundReservationRecords.map(record => ({
              product_id: record.product_id,
              quantity: record.quantity,
              balance_id: null, // จะหาได้จาก balance list ถ้าจำเป็น
              sales_order_id: record.sales_order_id,
              reservation_id: record.id
            }))
            
            console.log(`📋 Found ${foundReservationRecords.length} existing stock reservations from inventory records`)
          } else {
            // ล้างข้อมูล reservation records ถ้าไม่พบ
            reservationRecords.value = []
            
            // Fallback: ดูจาก Balance ถ้าไม่มี reservation records
            const balanceResult = await engine.list('inventory_balance')
            
            if (balanceResult.success && balanceResult.data && order.value.items) {
              const reservationData = []
              
              for (const item of order.value.items) {
                if (item.product_id) {
                  const balance = balanceResult.data.find(b => b.product_id === item.product_id)
                  
                  if (balance && (balance.qty_reserved || 0) > 0) {
                    reservationData.push({
                      product_id: item.product_id,
                      quantity: Math.min(item.quantity || 0, balance.qty_reserved || 0),
                      balance_id: balance.id,
                      sales_order_id: order.value.id,
                      reservation_id: `estimated_${item.product_id}`
                    })
                  }
                }
              }
              
              if (reservationData.length > 0) {
                stockReservation.value = reservationData
                console.log(`📋 Found ${reservationData.length} potential stock reservations (estimated from balance)`)
              }
            }
          }
        }
        
      } catch (error) {
        console.error('Error checking stock reservations:', error)
      }
    }
    
    const loadReservationInventoryRecords = async () => {
      try {
        if (!order.value?.id) return
        
        console.log('🔍 Loading detailed reservation inventory records for confirmed order...')
        
        // Query inventory records ที่เป็นการจองสำหรับ sales order นี้
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        
        if (inventoryResult.success && inventoryResult.data) {
          // ค้นหา inventory records ที่เป็นการจองสำหรับออเดอร์นี้
          const reservationInventoryRecords = inventoryResult.data.filter(record => 
            record.subtype === 'reservation' && 
            record.sales_order_id === order.value.id && 
            record.movement_type === 'adjustment' && // ใช้ 'adjustment' ตามที่เราแก้ไข
            record.transaction_type === 'reservation'
            // ไม่กรอง status เพราะข้อมูลจริงอาจจะเป็น 'available' แทน 'reserved'
          )
          
          console.log(`📋 Found ${reservationInventoryRecords.length} reservation inventory records`)
          
          if (reservationInventoryRecords.length > 0) {
            // อัปเดต reservationRecords สำหรับแสดงผล
            reservationRecords.value = reservationInventoryRecords
            
            // อัปเดต stockReservation เพื่อใช้ในการจัดการ
            stockReservation.value = reservationInventoryRecords.map(record => ({
              product_id: record.product_id,
              quantity: record.quantity,
              balance_id: null, // จะหาได้จาก balance list ถ้าจำเป็น
              sales_order_id: record.sales_order_id,
              reservation_id: record.id
            }))
            
            // แสดงสรุปข้อมูลการจอง
            const totalReserved = reservationInventoryRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
            console.log(`✅ Loaded reservation records - Total ${totalReserved} units reserved across ${reservationInventoryRecords.length} products`)
            
            // ตรวจสอบ product information ในการจอง
            for (const record of reservationInventoryRecords) {
              console.log(`📦 Reserved: ${record.quantity} x ${record.product_name || record.sku} (${record.product_id})`)
            }
          } else {
            console.log('⚠️ No reservation inventory records found for confirmed order')
            // ล้างข้อมูลถ้าไม่มีการจอง
            reservationRecords.value = []
            stockReservation.value = null
          }
          
          // ตรวจสอบสถานะ inventory_balance ด้วย
          const balanceResult = await engine.list('inventory_balance')
          if (balanceResult.success && balanceResult.data && order.value.items) {
            console.log('📊 Checking balance status for reserved products...')
            
            for (const item of order.value.items) {
              if (item.product_id) {
                const balance = balanceResult.data.find(b => b.product_id === item.product_id)
                if (balance && balance.qty_reserved > 0) {
                  console.log(`💰 Balance check - Product ${item.product_id}: On hand: ${balance.qty_on_hand}, Reserved: ${balance.qty_reserved}, Available: ${balance.qty_available}`)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading reservation inventory records:', error)
      }
    }
    
    const releaseStockReservation = async () => {
      try {
        if (!stockReservation.value || stockReservation.value.length === 0) {
          return
        }
        
        console.log('🔓 Releasing stock reservations...')
        
        // ใช้ ERP_CORE Balance Manager (แบบเดียวกับ GoodsReceipt.vue)
        if (window.ERP_CORE && window.ERP_CORE.balance) {
          console.log('📊 Using ERP_CORE Balance Manager for stock release...')
          
          for (const reservation of stockReservation.value) {
            try {
              // อัปเดต Balance - ลด reserved_quantity และลบการอ้างอิง
              const balanceResult = await engine.list('inventory_balance')
              const balances = balanceResult?.data || []
              const existingBalance = balances.find(b => b.product_id === reservation.product_id)
              
              if (existingBalance) {
                const newReservedQuantity = Math.max(0, (existingBalance.qty_reserved || 0) - reservation.quantity)
                const newAvailableQuantity = Math.max(0, (existingBalance.qty_on_hand || 0) - newReservedQuantity)
                const updateData = {
                  qty_reserved: newReservedQuantity,
                  qty_available: newAvailableQuantity,
                  updated_date: new Date().toISOString(),
                  updated_by: 'sales_system'
                }
                
                await engine.update('inventory_balance', existingBalance.id, updateData)
                console.log(`✅ Released ${reservation.quantity} units for product ${reservation.product_id}`)
                
                // ✅ สร้าง stock_release record (แบบ GoodsReceipt.vue)
                const releaseData = {
                  subtype: 'stock_movement', // เปลี่ยนเป็น stock_movement สำหรับการคืนสต็อก
                  product_id: reservation.product_id,
                  movement_type: 'adjustment', // ใช้ 'adjustment' แทน 'release'
                  transaction_type: 'reservation_release',
                  quantity: Math.abs(reservation.quantity), // ใช้ค่าบวกเพื่อคืนสต็อก
                  reference_type: 'sales_order',
                  reference_id: order.value.id,
                  reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
                  sales_order_id: order.value.id,
                  notes: `Stock reservation released for Sales Order ${order.value.orderNumber || order.value.id}`,
                  movement_date: new Date().toISOString(),
                  created_by: 'sales_system',
                  status: 'completed'
                }
                
                const releaseResult = await engine.create(TRANSACTION_TYPES.INVENTORY, releaseData, 'sales_system')
                console.log(`✅ Created stock release record for product ${reservation.product_id}:`, releaseResult)
                
                if (!releaseResult.success) {
                  console.error(`❌ Failed to create release record:`, releaseResult.error)
                }
                
                // Optional: ใช้ ERP_CORE.balance.recalculateProductBalance() เพื่อให้แน่ใจว่าคำนวณถูกต้อง
                try {
                  if (window.ERP_CORE.balance.recalculateProductBalance) {
                    await window.ERP_CORE.balance.recalculateProductBalance(reservation.product_id, {
                      updatedBy: 'sales_system'
                    })
                    console.log(`✅ Balance recalculated after release for product ${reservation.product_id}`)
                  }
                } catch (recalcError) {
                  console.warn(`⚠️ Balance recalculation failed for ${reservation.product_id}:`, recalcError.message)
                  // ไม่หยุดกระบวนการ เพราะ release ได้ทำแล้ว
                }
              }
            } catch (error) {
              console.error(`❌ Error releasing stock for product ${reservation.product_id}:`, error)
              // ทำต่อกับสินค้าอื่นๆ
            }
          }
        } else {
          console.warn('⚠️ ERP_CORE.balance not available - using fallback method')
          
          // Fallback: อัปเดต Balance โดยตรงผ่าน TransactionEngine (วิธีเดิม)
          for (const reservation of stockReservation.value) {
            const balanceResult = await engine.list('inventory_balance')
            const balances = balanceResult?.data || []
            const existingBalance = balances.find(b => b.product_id === reservation.product_id)
            
            if (existingBalance) {
              const newReservedQuantity = Math.max(0, (existingBalance.qty_reserved || 0) - reservation.quantity)
              const newAvailableQuantity = Math.max(0, (existingBalance.qty_on_hand || 0) - newReservedQuantity)
              const updateData = {
                qty_reserved: newReservedQuantity,
                qty_available: newAvailableQuantity,
                updated_date: new Date().toISOString(),
                updated_by: 'sales_system'
              }
              
              await engine.update('inventory_balance', existingBalance.id, updateData)
              console.log(`✅ Released ${reservation.quantity} units for product ${reservation.product_id} (fallback)`)
              
              // ✅ สร้าง stock_release record (fallback method)
              const releaseData = {
                subtype: 'stock_movement', // เปลี่ยนเป็น stock_movement สำหรับการคืนสต็อก
                product_id: reservation.product_id,
                movement_type: 'adjustment', // ใช้ 'adjustment' แทน 'release'
                transaction_type: 'reservation_release',
                quantity: Math.abs(reservation.quantity), // ใช้ค่าบวกเพื่อคืนสต็อก
                reference_type: 'sales_order',
                reference_id: order.value.id,
                reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
                sales_order_id: order.value.id,
                notes: `Stock reservation released for Sales Order ${order.value.orderNumber || order.value.id} (fallback)`,
                movement_date: new Date().toISOString(),
                created_by: 'sales_system',
                status: 'completed'
              }
              
              const releaseResult = await engine.create(TRANSACTION_TYPES.INVENTORY, releaseData, 'sales_system')
              console.log(`✅ Created stock release record for product ${reservation.product_id} (fallback):`, releaseResult)
              
              if (!releaseResult.success) {
                console.error(`❌ Failed to create release record (fallback):`, releaseResult.error)
              }
            }
          }
        }
        
        stockReservation.value = null
        reservationRecords.value = [] // ล้าง reservation records ด้วย
        console.log('✅ Stock reservations released')
        
      } catch (error) {
        console.error('❌ Error releasing stock reservations:', error)
        throw error
      }
    }
    
    const handleStockManagement = async (fromStatus, toStatus) => {
      try {
        console.log(`🔄 Managing stock transition: ${fromStatus} → ${toStatus}`)
        
        // ✅ เมื่อเปลี่ยนเป็น "confirmed" = จองสต็อก (ลูกค้าจ่ายเงินแล้ว)
        if (toStatus === 'confirmed') {
          console.log('🔒 Customer paid - Reserving stock...')
          
          // ตรวจสอบสต็อกก่อน
          const stockCheck = await checkStockAvailability()
          
          if (!stockCheck.available) {
            // แสดงรายละเอียดสต็อกที่ไม่เพียงพอ
            let errorMessage = 'สต็อกไม่เพียงพอสำหรับการยืนยันคำสั่งซื้อ:\n\n'
            
            stockCheck.details.forEach(detail => {
              if (detail.status === 'insufficient') {
                const productName = detail.item.productName || detail.item.product_name || detail.item.name || 'สินค้าไม่ทราบชื่อ'
                errorMessage += `• ${productName}: ต้องการ ${detail.required} แต่มีเพียง ${detail.available_stock} (รวม ${detail.current_stock} - จอง ${detail.reserved_stock})\n`
              } else if (detail.status === 'no_product_id') {
                const productName = detail.item.productName || detail.item.product_name || detail.item.name || 'สินค้าไม่ทราบชื่อ'
                errorMessage += `• ${productName}: ไม่พบรหัสสินค้าในระบบ\n`
              }
            })
            
            throw new Error(errorMessage)
          }
          
          // ดำเนินการจองสต็อก
          await reserveStock()
          
          console.log('✅ Stock reserved successfully for confirmed order')
          
        }
        
        // 🔓 เมื่อเปลี่ยนจาก "confirmed" เป็นสถานะอื่น (ยกเลิกการจอง)
        else if (fromStatus === 'confirmed' && toStatus !== 'delivered') {
          console.log('🔓 Order status changed from confirmed - Releasing stock reservations...')
          await releaseStockReservation()
          console.log('✅ Stock reservations released')
        }
        
        // 📦 เมื่อเปลี่ยนเป็น "delivered" = ตัดสต็อกจริง
        else if (toStatus === 'delivered') {
          console.log('📦 Order delivered - Converting reservations to actual stock usage...')
          await convertReservationToUsage()
          console.log('✅ Stock usage recorded and reservations cleared')
        }
        
      } catch (error) {
        console.error('❌ Error in stock management:', error)
        throw error // Re-throw เพื่อให้ confirmStatusChange จัดการ
      }
    }
    
    const convertReservationToUsage = async () => {
      try {
        if (!stockReservation.value || stockReservation.value.length === 0) {
          console.log('⚠️ No stock reservations to convert')
          return
        }
        
        console.log('🔄 Converting stock reservations to actual usage...')
        
        // ใช้ ERP_CORE Balance Manager (แบบเดียวกับ GoodsReceipt.vue)
        if (window.ERP_CORE && window.ERP_CORE.balance) {
          console.log('📊 Using ERP_CORE Balance Manager for usage conversion...')
          
          for (const reservation of stockReservation.value) {
            try {
              // 1. บันทึก Stock Movement (การใช้สต็อกจริง) ด้วย enhanced format
              const movementData = {
                product_id: reservation.product_id,
                movement_type: 'OUT', // ใช้ 'OUT' แบบ GoodsReceipt.vue
                transaction_type: 'out', 
                quantity: reservation.quantity,
                reference_type: 'sales_order',
                reference_id: order.value.id,
                reference_number: order.value.orderNumber || order.value.order_number,
                notes: `จัดส่งสินค้าตาม Sales Order ${order.value.orderNumber || order.value.order_number}`,
                movement_date: new Date().toISOString(),
                created_by: 'sales_system',
                status: 'completed'
              }
              
              // ✅ สร้าง stock_movement ใน inventory (แบบ GoodsReceipt.vue)
              const inventoryMovementData = {
                subtype: 'stock_movement',
                product_id: reservation.product_id,
                movement_type: 'issue', // ใช้ 'issue' แทน 'out' (ตาม validation rules)
                transaction_type: 'out',
                quantity: Math.abs(reservation.quantity), // ใช้ค่าบวกสำหรับการจ่ายออก
                reference_type: 'sales_order',
                reference_id: order.value.id,
                reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
                sales_order_id: order.value.id,
                notes: `Stock consumed for Sales Order delivery ${order.value.orderNumber || order.value.id}`,
                movement_date: new Date().toISOString(),
                created_by: 'sales_system',
                status: 'completed'
              }
              
              const movementResult = await engine.create(TRANSACTION_TYPES.INVENTORY, inventoryMovementData, 'sales_system')
              console.log(`✅ Created inventory stock movement for product ${reservation.product_id}:`, movementResult)
              
              if (!movementResult.success) {
                console.error(`❌ Failed to create inventory movement:`, movementResult.error)
              }
              
              // ✅ สร้าง stock_movement แบบเดิม (ถ้าใช้ระบบแยก)
              await engine.create('stock_movement', movementData)
              console.log(`✅ Created stock movement for product ${reservation.product_id}`)
              
              // 2. อัปเดต Balance - ลดจำนวนจริง และ reserved_quantity
              const balanceResult = await engine.list('inventory_balance')
              const balances = balanceResult?.data || []
              const existingBalance = balances.find(b => b.product_id === reservation.product_id)
              
              if (existingBalance) {
                const newQuantity = Math.max(0, (existingBalance.qty_on_hand || 0) - reservation.quantity)
                const newReservedQuantity = Math.max(0, (existingBalance.qty_reserved || 0) - reservation.quantity)
                const newAvailableQuantity = Math.max(0, newQuantity - newReservedQuantity)
                
                const updateData = {
                  qty_on_hand: newQuantity,
                  qty_reserved: newReservedQuantity,
                  qty_available: newAvailableQuantity,
                  updated_date: new Date().toISOString(),
                  updated_by: 'sales_system'
                }
                
                await engine.update('inventory_balance', existingBalance.id, updateData)
                console.log(`✅ Updated balance for product ${reservation.product_id}: qty_on_hand ${existingBalance.qty_on_hand} → ${newQuantity}, qty_reserved ${existingBalance.qty_reserved} → ${newReservedQuantity}`)
                
                // 3. ใช้ ERP_CORE.balance เพื่ออัปเดต Balance จาก movement (แบบ GoodsReceipt.vue)
                try {
                  if (window.ERP_CORE.balance.updateBalanceFromMovement) {
                    // Enhanced movement data with proper categorization
                    const enhancedMovementData = {
                      ...movementData,
                      movement_type: 'OUT',
                      unit_cost: existingBalance.unit_cost || 0,
                      total_value: reservation.quantity * (existingBalance.unit_cost || 0)
                    }
                    
                    await window.ERP_CORE.balance.updateBalanceFromMovement(enhancedMovementData, {
                      updatedBy: 'sales_system'
                    })
                    console.log(`✅ Balance updated successfully from movement for product ${reservation.product_id}`)
                  }
                } catch (movementError) {
                  console.warn(`⚠️ Could not update balance from movement for ${reservation.product_id}:`, movementError.message)
                  
                  // Fallback: ใช้ recalculateProductBalance
                  try {
                    if (window.ERP_CORE.balance.recalculateProductBalance) {
                      await window.ERP_CORE.balance.recalculateProductBalance(reservation.product_id, {
                        updatedBy: 'sales_system'
                      })
                      console.log(`✅ Fallback: Balance recalculated for product ${reservation.product_id}`)
                    }
                  } catch (recalcError) {
                    console.warn(`⚠️ Fallback balance recalculation failed for ${reservation.product_id}:`, recalcError.message)
                  }
                }
              }
            } catch (error) {
              console.error(`❌ Error processing usage conversion for product ${reservation.product_id}:`, error)
              // ทำต่อกับสินค้าอื่นๆ
            }
          }
        } else {
          console.warn('⚠️ ERP_CORE.balance not available - using fallback method')
          
          // Fallback: อัปเดต Balance โดยตรงผ่าน TransactionEngine (วิธีเดิม)
          for (const reservation of stockReservation.value) {
            // 1. บันทึก Stock Movement (การใช้สต็อกจริง)
            const movementData = {
              product_id: reservation.product_id,
              movement_type: 'out',
              quantity: reservation.quantity,
              reference_type: 'sales_order',
              reference_id: order.value.id,
              notes: `จัดส่งสินค้าตาม Sales Order ${order.value.orderNumber || order.value.order_number}`,
              movement_date: new Date().toISOString(),
              created_by: 'sales_system'
            }
            
            // ✅ สร้าง inventory stock_movement (fallback)
            const inventoryMovementData = {
              subtype: 'stock_movement',
              product_id: reservation.product_id,
              movement_type: 'issue', // ใช้ 'issue' แทน 'out'
              transaction_type: 'out',
              quantity: Math.abs(reservation.quantity), // ใช้ค่าบวกสำหรับการจ่ายออก
              reference_type: 'sales_order',
              reference_id: order.value.id,
              reference_number: order.value.orderNumber || order.value.order_number || order.value.id,
              sales_order_id: order.value.id,
              notes: `Stock consumed for Sales Order delivery ${order.value.orderNumber || order.value.id} (fallback)`,
              movement_date: new Date().toISOString(),
              created_by: 'sales_system',
              status: 'completed'
            }
            
            const movementResult = await engine.create(TRANSACTION_TYPES.INVENTORY, inventoryMovementData, 'sales_system')
            console.log(`✅ Created inventory stock movement for product ${reservation.product_id} (fallback):`, movementResult)
            
            if (!movementResult.success) {
              console.error(`❌ Failed to create inventory movement (fallback):`, movementResult.error)
            }
            
            await engine.create('stock_movement', movementData)
            
            // 2. อัปเดต Balance
            const balanceResult = await engine.list('inventory_balance')
            const balances = balanceResult?.data || []
            const existingBalance = balances.find(b => b.product_id === reservation.product_id)
            
            if (existingBalance) {
              const newQuantity = Math.max(0, (existingBalance.qty_on_hand || 0) - reservation.quantity)
              const newReservedQuantity = Math.max(0, (existingBalance.qty_reserved || 0) - reservation.quantity)
              const newAvailableQuantity = Math.max(0, newQuantity - newReservedQuantity)
              
              const updateData = {
                qty_on_hand: newQuantity,
                qty_reserved: newReservedQuantity,
                qty_available: newAvailableQuantity,
                updated_date: new Date().toISOString(),
                updated_by: 'sales_system'
              }
              
              await engine.update('inventory_balance', existingBalance.id, updateData)
              console.log(`✅ Updated balance for product ${reservation.product_id} (fallback)`)
            }
          }
        }
        
        // ล้างการอ้างอิงท้องถิ่น
        stockReservation.value = null
        // อัปเดต status ของ reservation records แทนการลบ (เพื่อให้ยังเห็น history)
        reservationRecords.value.forEach(record => {
          record.status = 'used'
          record.notes = (record.notes || '') + ' | ใช้แล้วเมื่อจัดส่ง'
        })
        console.log('✅ Stock reservations converted to usage successfully')
        
      } catch (error) {
        console.error('❌ Error converting reservations to usage:', error)
        throw error
      }
    }
    
    const changeStatus = (newStatus) => {
      pendingStatus.value = newStatus
      statusNotes.value = ''
      showStatusModal.value = true
    }
    
    const confirmStatusChange = async () => {
      // ป้องกัน concurrent update
      if (isUpdating.value || changingStatus.value) {
        return
      }
      
      try {
        changingStatus.value = true
        isUpdating.value = true
        
        // จัดการการจองสต็อกตามสถานะใหม่
        await handleStockManagement(order.value.status, pendingStatus.value)
        
        // Send only fields that exist in schema
        const updateData = {
          status: pendingStatus.value,
          notes: statusNotes.value || order.value.notes || ''
        }
        
        // Save to database - use same type as loadOrder (sales)
        const updateResult = await engine.update('sales', order.value.id, updateData)
        
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'ไม่สามารถอัพเดทข้อมูลได้')
        }
        
        // Log success first
        console.log(`✅ เปลี่ยนสถานะเป็น "${getStatusText(pendingStatus.value)}" เรียบร้อยแล้ว`)
        
        // Close modal immediately before updating order data to prevent DOM conflicts
        showStatusModal.value = false
        changingStatus.value = false
        
        // Wait for modal to fully close
        await nextTick()
        
        // ✅ แสดงข้อความสำเร็จและรีเฟรชหน้าจอเพื่อป้องกัน DOM error
        const successMessage = `เปลี่ยนสถานะเป็น "${getStatusText(pendingStatus.value)}" เรียบร้อยแล้ว!`
        
        // แสดงข้อความสำเร็จ
        alert(successMessage)
        
        // รีเฟรชหน้าจอเพื่อโหลดข้อมูลใหม่และป้องกัน Vue DOM error
        window.location.reload()
        
      } catch (err) {
        console.error('Error changing status:', err)
        console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', err.message)
        
        // Close modal and reset state on error too
        showStatusModal.value = false
        changingStatus.value = false
        isUpdating.value = false
      }
    }
    
    const cancelStatusChange = () => {
      showStatusModal.value = false
      pendingStatus.value = ''
      statusNotes.value = ''
    }
    
    const editOrder = () => {
      router.push(`/sales/sales-order/edit/${order.value.id}`)
    }
    
    const printOrder = () => {
      window.print()
    }
    
    // Navigation to related documents
    const viewInvoice = () => {
      if (order.value?.invoice_id) {
        router.push(`/sales/invoice/${order.value.invoice_id}`)
      }
    }
    
    const viewQuotation = () => {
      if (order.value?.quotation_id) {
        router.push(`/sales/quotation/${order.value.quotation_id}`)
      }
    }
    
    // Work Order methods
    const checkWorkOrder = async () => {
      try {
        if (!order.value?.id) return
        
        // ค้นหา work order ที่เชื่อมกับ sales order นี้
        const result = await engine.list('work-order')
        if (result.success && result.data) {
          const existingWorkOrder = result.data.find(wo => wo.sales_order_id === order.value.id)
          if (existingWorkOrder) {
            workOrder.value = existingWorkOrder
            hasWorkOrder.value = true
          } else {
            hasWorkOrder.value = false
          }
        }
      } catch (error) {
        console.error('Error checking work order:', error)
      }
    }
    
    const createWorkOrder = async () => {
      try {
        creatingWorkOrder.value = true
        
        if (!order.value || !order.value.items) {
          throw new Error('ไม่พบข้อมูลสินค้าในใบขาย')
        }
        
        // ✅ รวบรวมข้อมูล inventory reservation records
        const inventoryReservationIds = reservationRecords.value?.map(record => record.id) || []
        const reservationSummary = reservationRecords.value?.map(record => ({
          inventory_id: record.id,
          product_id: record.product_id,
          sku: record.sku,
          product_name: record.product_name,
          reserved_quantity: record.quantity,
          notes: record.notes
        })) || []
        
        console.log('🔗 Including reservation data in Work Order:', {
          reservationIds: inventoryReservationIds,
          reservationSummary: reservationSummary
        })
        
        // เตรียมข้อมูล work order
        const workOrderData = {
          sales_order_id: order.value.id,
          sales_order_number: order.value.order_number || order.value.orderNumber,
          order_number: `WO-${Date.now()}`,
          customer_name: order.value.customer_name || order.value.customerName,
          due_date: order.value.due_date,
          priority: 'normal',
          warehouse: 'main',
          notes: `Work Order สำหรับใบขาย ${order.value.order_number || order.value.orderNumber}`,
          
          // ✅ เพิ่ม inventory reservation data
          inventory_reservation_ids: inventoryReservationIds,
          inventory_reservations: reservationSummary,
          
          // แปลง items จาก sales order เป็น work order items พร้อม inventory data
          items: order.value.items.map(item => {
            // หา reservation record ที่เกี่ยวข้องกับสินค้านี้
            const relatedReservation = reservationRecords.value?.find(
              res => res.product_id === (item.productId || item.product_id)
            )
            
            return {
              product_id: item.productId || item.product_id,
              product_name: item.productName || item.product_name || item.name || item.itemName,
              sku: item.sku || item.code,
              required_quantity: item.quantity || 0,
              picked_quantity: 0,
              unit: item.unit || 'ชิ้น',
              status: 'pending',
              // ✅ เพิ่มข้อมูล reservation ที่เกี่ยวข้อง
              inventory_reservation_id: relatedReservation?.id || null,
              reserved_quantity: relatedReservation?.quantity || 0,
              reservation_notes: relatedReservation?.notes || null
            }
          }),
          
          activities: [{
            timestamp: new Date().toISOString(),
            user: 'ผู้ใช้ระบบ',
            action: 'created',
            description: 'สร้าง Work Order จากใบขาย',
            notes: `สร้างจากใบขาย ${order.value.order_number || order.value.orderNumber}`,
            sales_order_id: order.value.id,
            inventory_reservations_linked: inventoryReservationIds.length,
            reservation_details: `เชื่อมโยงกับ ${inventoryReservationIds.length} reservation records`
          }]
        }
        
        console.log('📋 Creating Work Order with data:', workOrderData)
        
        const result = await engine.create('work-order', workOrderData)
        
        if (result.success) {
          workOrder.value = result.data
          hasWorkOrder.value = true
          console.log('✅ Work Order สร้างเรียบร้อยแล้ว:', result.data.id)
          console.log('🔗 Work Order includes reservation data:', {
            sales_order_id: result.data.sales_order_id,
            inventory_reservation_ids: result.data.inventory_reservation_ids,
            total_items: result.data.items?.length || 0,
            items_with_reservations: result.data.items?.filter(item => item.inventory_reservation_id).length || 0
          })
          
          // แจ้งให้ผู้ใช้ทราบข้อมูลการเชื่อมโยง
          const linkedCount = result.data.inventory_reservation_ids?.length || 0
          if (linkedCount > 0) {
            console.log(`🎉 Work Order เชื่อมโยงกับ ${linkedCount} inventory reservation records สำเร็จ`)
          }
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้าง Work Order ได้')
        }
        
      } catch (error) {
        console.error('Error creating work order:', error)
        alert('เกิดข้อผิดพลาดในการสร้าง Work Order: ' + error.message)
      } finally {
        creatingWorkOrder.value = false
      }
    }
    
    const viewWorkOrder = () => {
      if (workOrder.value) {
        router.push(`/production/work-order/${workOrder.value.id}`)
      }
    }
    
    const calculateSubtotal = () => {
      if (!order.value?.items) return 0
      
      return order.value.items.reduce((sum, item) => {
        const itemTotal = item.total || ((item.quantity || 0) * (item.price || item.unitPrice || 0))
        return sum + itemTotal
      }, 0)
    }
    
    // Utility functions
    const formatCurrency = (amount) => {
      if (!amount) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (err) {
        return dateString
      }
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (err) {
        return dateString
      }
    }
    
    const getStatusText = (status) => {
      if (!status) return 'ไม่ระบุสถานะ'
      const statusDef = statusDefinitions[status]
      return statusDef ? statusDef.label : status
    }
    
    const getStatusClass = (status) => {
      if (!status) return 'status-unknown'
      const statusDef = statusDefinitions[status]
      return statusDef ? statusDef.class : 'status-unknown'
    }
    
    const getActivityIcon = (action) => {
      const icons = {
        'created': 'fas fa-plus-circle',
        'status_change': 'fas fa-exchange-alt',
        'updated': 'fas fa-edit',
        'cancelled': 'fas fa-times-circle',
        'completed': 'fas fa-check-circle'
      }
      return icons[action] || 'fas fa-info-circle'
    }
    
    const getActivityIconClass = (action) => {
      const classes = {
        'created': 'activity-icon-success',
        'status_change': 'activity-icon-info',
        'updated': 'activity-icon-warning',
        'cancelled': 'activity-icon-danger',
        'completed': 'activity-icon-success'
      }
      return classes[action] || 'activity-icon-default'
    }

    const getReservationStatusText = (status) => {
      const statuses = {
        'reserved': 'จองแล้ว',
        'used': 'ใช้แล้ว',
        'cancelled': 'ยกเลิกแล้ว',
        'active': 'ใช้งาน',
        'completed': 'เสร็จสิ้น'
      }
      return statuses[status] || status
    }

    const getReservationStatusClass = (status) => {
      const classes = {
        'reserved': 'status-reserved',
        'used': 'status-used',
        'cancelled': 'status-cancelled',
        'active': 'status-active',
        'completed': 'status-completed'
      }
      return classes[status] || 'status-default'
    }
    
    const checkCurrentStock = async () => {
      try {
        const stockCheck = await checkStockAvailability()
        
        let message = 'สถานะสต็อกปัจจุบัน:\n\n'
        
        if (stockCheck.details && stockCheck.details.length > 0) {
          stockCheck.details.forEach(detail => {
            const productName = detail.item.productName || detail.item.product_name || detail.item.name || 'สินค้าไม่ทราบชื่อ'
            
            if (detail.status === 'available') {
              message += `✅ ${productName}\n`
              message += `   ต้องการ: ${detail.required}, มีอยู่: ${detail.available_stock} (รวม ${detail.current_stock} - จอง ${detail.reserved_stock})\n\n`
            } else if (detail.status === 'insufficient') {
              message += `❌ ${productName}\n`
              message += `   ต้องการ: ${detail.required}, มีอยู่: ${detail.available_stock} (รวม ${detail.current_stock} - จอง ${detail.reserved_stock})\n\n`
            } else if (detail.status === 'no_product_id') {
              message += `⚠️ ${productName}\n`
              message += `   ไม่พบรหัสสินค้าในระบบ\n\n`
            }
          })
        } else {
          message += 'ไม่พบข้อมูลสินค้า'
        }
        
        if (stockCheck.error) {
          message += `\n❌ ข้อผิดพลาด: ${stockCheck.error}`
        }
        
        alert(message)
        
      } catch (error) {
        console.error('Error checking current stock:', error)
        alert('เกิดข้อผิดพลาดในการตรวจสอบสต็อก: ' + error.message)
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadOrder()
    })
    
    return {
      // Data
      order,
      loading,
      error,
      salesService,
      
      // Status modal
      showStatusModal,
      pendingStatus,
      statusNotes,
      changingStatus,
      
      // Work Order
      workOrder,
      hasWorkOrder,
      creatingWorkOrder,
      
      // Computed
      availableActions,
      allActivityLogs,
      
      // Methods
      loadOrder,
      loadReservationInventoryRecords,
      changeStatus,
      confirmStatusChange,
      cancelStatusChange,
      editOrder,
      printOrder,
      viewInvoice,
      viewQuotation,
      calculateSubtotal,
      
      // Work Order methods
      checkWorkOrder,
      createWorkOrder,
      viewWorkOrder,
      
      // Stock Management
      stockReservation,
      checkingStock,
      checkCurrentStock,
      
      // Reservation Records
      reservationRecords,
      totalReservedQuantity,
      getReservationStatusText,
      getReservationStatusClass,
      
      // Utilities
      formatCurrency,
      formatDate,
      formatDateTime,
      getStatusText,
      getStatusClass,
      getActivityIcon,
      getActivityIconClass
    }
  }
}
</script>

<style scoped>
.sales-order-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.detail-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  padding: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  background: #e9ecef;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #dee2e6;
  transform: translateX(-2px);
}

.title-info h2 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.order-number {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 16px;
}

.error-state i {
  font-size: 48px;
  color: #dc3545;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 8px;
}

/* Status Bar */
.status-bar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  font-weight: 500;
  color: #495057;
}

.status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Status Badges */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-draft {
  background: #e9ecef;
  color: #6c757d;
}

.status-quoted {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-pending-delivery {
  background: #cce5ff;
  color: #004085;
}

.status-delivered {
  background: #e2e3ff;
  color: #383d41;
}

.status-invoiced {
  background: #fff3cd;
  color: #856404;
}

.status-complete {
  background: #d1ecf1;
  color: #0c5460;
}

/* Order Info Grid */
.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.info-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-card h3 i {
  color: #007bff;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 500;
  color: #6c757d;
  min-width: 120px;
}

.info-row span {
  color: #2c3e50;
  text-align: right;
  flex: 1;
}

/* Reference Links */
.reference-link {
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.reference-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.invoice-link {
  color: #17a2b8;
  background: #e7f7f9;
}

.invoice-link:hover {
  background: #b8e9ee;
  color: #138496;
}

.quotation-link {
  color: #9b59b6;
  background: #f4ecf7;
}

.quotation-link:hover {
  background: #e8daef;
  color: #7d3c98;
}

/* Items Section */
.items-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.items-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-section h3 i {
  color: #007bff;
}

/* Reservation Section */
.reservation-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.reservation-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reservation-section h3 i {
  color: #17a2b8;
}

.table-wrapper {
  overflow-x: auto;
}

.items-table,
.reservation-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.items-table th,
.reservation-table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.items-table td,
.reservation-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: top;
}

.items-table tbody tr:hover,
.reservation-table tbody tr:hover {
  background: #f8f9fa;
}

.item-info strong,
.product-info strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 4px;
}

.item-code,
.product-code {
  font-size: 12px;
  color: #6c757d;
}

.inventory-id {
  background: #f8f9fa;
  color: #495057;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
}

.notes-cell {
  max-width: 200px;
  font-size: 12px;
  color: #6c757d;
  word-wrap: break-word;
}

.reservation-summary {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.summary-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
}

/* Reservation Status Badges */
.status-reserved {
  background: #d4edda;
  color: #155724;
}

.status-used {
  background: #cce5ff;
  color: #004085;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-active {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-default {
  background: #e9ecef;
  color: #6c757d;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Order Summary */
.order-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.summary-content {
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-total {
  border-top: 2px solid #dee2e6;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
  font-size: 18px;
  color: #2c3e50;
}

.discount {
  color: #dc3545;
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.activity-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-section h3 i {
  color: #007bff;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon-success {
  background: #d4edda;
  color: #155724;
}

.activity-icon-info {
  background: #cce5ff;
  color: #004085;
}

.activity-icon-warning {
  background: #fff3cd;
  color: #856404;
}

.activity-icon-danger {
  background: #f8d7da;
  color: #721c24;
}

.activity-icon-default {
  background: #e9ecef;
  color: #6c757d;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

/* Status Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.status-modal {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.modal-body {
  padding: 24px;
}

.status-change-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-from,
.status-to {
  flex: 1;
}

.status-from label,
.status-to label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-arrow {
  color: #007bff;
  font-size: 20px;
}

.status-notes {
  margin-bottom: 16px;
}

.status-notes label {
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #117a8b;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Stock Status */
.stock-reserved {
  color: #28a745;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stock-not-reserved {
  color: #ffc107;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.next-step-info {
  color: #17a2b8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .sales-order-detail {
    padding: 12px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .status-bar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .status-actions {
    justify-content: center;
  }
  
  .order-info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .info-row span {
    text-align: left;
  }
  
  .summary-content {
    max-width: none;
    margin: 0;
  }
  
  .status-change-info {
    flex-direction: column;
    text-align: center;
  }
  
  .status-arrow {
    transform: rotate(90deg);
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .reservation-section {
    padding: 16px;
  }
  
  .reservation-table {
    font-size: 12px;
  }
  
  .reservation-table th,
  .reservation-table td {
    padding: 8px;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .notes-cell {
    max-width: 150px;
  }
}

@media print {
  .detail-header .header-actions,
  .status-actions,
  .btn-back {
    display: none !important;
  }
  
  .sales-order-detail {
    background: white;
    padding: 0;
  }
  
  .detail-header,
  .info-card,
  .items-section,
  .order-summary,
  .activity-section {
    box-shadow: none;
    border: 1px solid #dee2e6;
    break-inside: avoid;
  }
}
</style>
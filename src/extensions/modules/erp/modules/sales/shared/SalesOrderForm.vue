<template>
  <div class="sales-order-form">
    <!-- Header -->
    <div class="form-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="fas fa-file-invoice"></i>
            สร้างใบขายใหม่ (Sales Order)
          </h2>
          <p class="subtitle">สร้างใบสั่งขายและเลือกสินค้าจาก Inventory</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-outline btn-sm" @click="debugInventoryData" title="Debug ข้อมูลสินค้า">
            <i class="fas fa-bug"></i>
            Debug
          </button>
          <button class="btn btn-outline" @click="$router.back()">
            <i class="fas fa-arrow-left"></i>
            ย้อนกลับ
          </button>
          <button class="btn btn-success" @click="saveSalesOrder" :disabled="!canSave || saving">
            <i class="fas fa-save" :class="{ 'fa-spin': saving }"></i>
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกใบขาย' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <div class="form-grid">
        <!-- Customer Information -->
        <div class="form-section">
          <h3>
            <i class="fas fa-user"></i>
            ข้อมูลลูกค้า
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">เลือกลูกค้า</label>
              <div class="customer-search-wrapper">
                <div class="customer-input-container">
                  <div class="input-with-icon">
                    <i class="input-icon fas fa-user"></i>
                    <input
                      v-model="customerSearchQuery"
                      @input="onCustomerInput"
                      @focus="showCustomerDropdown = true"
                      @blur="hideCustomerDropdown"
                      type="text"
                      class="form-control customer-input"
                      :class="{ 'has-selection': selectedCustomer }"
                      placeholder="พิมพ์ชื่อลูกค้า หรือรหัสลูกค้า..."
                      required
                    />
                    <i 
                      v-if="selectedCustomer" 
                      class="selected-indicator fas fa-check-circle"
                    ></i>
                  </div>
                  
                  <!-- Customer Dropdown -->
                  <div v-if="showCustomerDropdown" class="customer-dropdown">
                    <div class="dropdown-header">
                      <span class="dropdown-title">เลือกลูกค้า</span>
                      <span class="dropdown-count">{{ (filteredCustomers || []).length }} รายการ</span>
                    </div>
                    
                    <div class="customers-list">
                      <!-- Create New Customer Option -->
                      <template v-if="customerSearchQuery && !exactCustomerMatch">
                        <div 
                          class="customer-option new-customer"
                          @mousedown="selectCustomer(null, customerSearchQuery)"
                        >
                          <div class="option-icon new-icon">
                            <i class="fas fa-plus"></i>
                          </div>
                          <div class="option-content">
                            <div class="option-name">สร้างลูกค้าใหม่: "{{ customerSearchQuery }}"</div>
                            <div class="option-description">ลูกค้ารายใหม่ในระบบ</div>
                            <div class="option-meta">
                              <span class="customer-code">จะสร้างรหัสใหม่อัตโนมัติ</span>
                            </div>
                          </div>
                          <div class="option-action">
                            <i class="fas fa-arrow-right"></i>
                          </div>
                        </div>
                      </template>
                      
                      <!-- Empty States -->
                      <template v-if="!filteredCustomers || filteredCustomers.length === 0">
                        <div class="empty-state" v-if="!customerSearchQuery">
                          <div class="empty-icon">
                            <i class="fas fa-users"></i>
                          </div>
                          <div class="empty-text">
                            <p>ยังไม่มีลูกค้าในระบบ</p>
                            <p>เริ่มต้นพิมพ์ชื่อเพื่อสร้างลูกค้าใหม่</p>
                          </div>
                        </div>
                        
                        <div class="empty-state" v-else>
                          <div class="empty-icon">
                            <i class="fas fa-search"></i>
                          </div>
                          <div class="empty-text">
                            <p>ไม่พบลูกค้าที่ค้นหา</p>
                            <p>ลองเปลี่ยนคำค้นหา หรือสร้างลูกค้าใหม่</p>
                          </div>
                        </div>
                      </template>
                      
                      <!-- Existing Customers List -->
                      <template v-if="filteredCustomers && filteredCustomers.length > 0">
                        <div 
                          v-for="(customer, index) in filteredCustomers" 
                          :key="`customer-${customer?.id || customer?.customer_code || index}`"
                          class="customer-option existing-customer"
                          @mousedown="selectCustomer(customer)"
                        >
                          <div class="option-icon">
                            <i class="fas fa-user"></i>
                          </div>
                          <div class="option-content">
                            <div class="option-name">{{ customer?.customer_name || customer?.name || 'ไม่ระบุชื่อ' }}</div>
                            <div class="option-description">
                              <span class="customer-code">{{ customer?.customer_code || 'ไม่มีรหัส' }}</span>
                              <span v-if="customer?.contact_person" class="contact-person">
                                • {{ customer.contact_person }}
                              </span>
                              <span v-if="customer?.phone" class="phone">
                                • {{ customer.phone }}
                              </span>
                            </div>
                            <div class="option-meta">
                              <span class="customer-id">ID: {{ customer?.id || 'N/A' }}</span>
                              <span class="option-status" :class="`status-${customer?.status || 'unknown'}`">
                                {{ formatCustomerStatus(customer?.status) }}
                              </span>
                              <span v-if="customer?.customer_group" class="customer-group">
                                {{ formatCustomerGroup(customer.customer_group) }}
                              </span>
                            </div>
                          </div>
                          <div class="option-action">
                            <i class="fas fa-arrow-right"></i>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                
                <!-- Selected Customer Display -->
                <div v-if="selectedCustomer" class="selected-customer">
                  <div class="selected-customer-info">
                    <i class="fas fa-user"></i>
                    <span class="selected-name">{{ selectedCustomer.customer_name || selectedCustomer.name }}</span>
                    <span v-if="selectedCustomer.id" class="selected-id">{{ selectedCustomer.customer_code }}</span>
                  </div>
                  <button 
                    type="button"
                    @click="clearCustomer" 
                    class="clear-selection-btn"
                    title="ล้างการเลือก"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="customerPhone" class="form-label">เบอร์โทรศัพท์</label>
              <input 
                id="customerPhone"
                v-model="salesOrder.customerPhone" 
                type="tel" 
                class="form-control"
                placeholder="เบอร์โทรศัพท์"
                :disabled="selectedCustomer && selectedCustomer.phone"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group full-width">
              <label for="customerAddress" class="form-label">ที่อยู่ลูกค้า</label>
              <textarea 
                id="customerAddress"
                v-model="salesOrder.customerAddress" 
                class="form-control"
                rows="3"
                placeholder="ที่อยู่ลูกค้า"
                :disabled="selectedCustomer && selectedCustomer.address"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Order Information -->
        <div class="form-section">
          <h3>
            <i class="fas fa-file-alt"></i>
            ข้อมูลใบขาย
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="orderDate" class="form-label required">วันที่ขาย</label>
              <input 
                id="orderDate"
                v-model="salesOrder.orderDate" 
                type="date" 
                class="form-control"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="dueDate" class="form-label">วันครบกำหนด</label>
              <input 
                id="dueDate"
                v-model="salesOrder.dueDate" 
                type="date" 
                class="form-control"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="salesPerson" class="form-label required">พนักงานขาย</label>
              <input 
                id="salesPerson"
                v-model="salesOrder.salesPerson" 
                type="text" 
                class="form-control"
                placeholder="ชื่อพนักงานขาย"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="orderStatus" class="form-label">สถานะ</label>
              <select id="orderStatus" v-model="salesOrder.status" class="form-control">
                <option value="draft">ร่าง</option>
                <option value="quoted">เสนอราคา</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="shipped">จัดส่งแล้ว</option>
                <option value="completed">สำเร็จ</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="form-section products-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-boxes"></i>
            รายการสินค้า
          </h3>
          
          <div class="section-actions">
            <button class="btn btn-primary" @click="showInventorySelector = true">
              <i class="fas fa-plus"></i>
              เลือกสินค้าจากคลัง
            </button>
            <button class="btn btn-outline" @click="addManualItem">
              <i class="fas fa-edit"></i>
              เพิ่มรายการแบบกรอกเอง
            </button>
          </div>
        </div>

        <!-- Products Table -->
        <div class="products-table-container">
          <table class="products-table" v-if="salesOrder.items.length > 0">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>ราคาต่อหน่วย</th>
                <th>ส่วนลด</th>
                <th>ราคารวม</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in validSalesOrderItems" :key="`item-${index}-${item.sku || 'new'}`">
                <td>
                  <input 
                    v-model="item.sku" 
                    type="text" 
                    class="form-control small"
                    placeholder="รหัสสินค้า"
                  >
                </td>
                <td>
                  <input 
                    v-model="item.productName" 
                    type="text" 
                    class="form-control"
                    placeholder="ชื่อสินค้า"
                  >
                </td>
                <td>
                  <input 
                    v-model.number="item.quantity" 
                    type="number" 
                    class="form-control small"
                    min="1"
                    @input="calculateItemTotal(item)"
                  >
                </td>
                <td>
                  <input 
                    v-model="item.unit" 
                    type="text" 
                    class="form-control small"
                    placeholder="หน่วย"
                  >
                </td>
                <td>
                  <input 
                    v-model.number="item.unitPrice" 
                    type="number" 
                    class="form-control small"
                    min="0"
                    step="0.01"
                    @input="calculateItemTotal(item)"
                  >
                </td>
                <td>
                  <input 
                    v-model.number="item.discount" 
                    type="number" 
                    class="form-control small"
                    min="0"
                    step="0.01"
                    @input="calculateItemTotal(item)"
                  >
                </td>
                <td>
                  <span class="total-amount">
                    {{ formatCurrency(item.totalPrice || 0) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-danger btn-small" 
                    @click="removeItem(index)"
                    title="ลบรายการ"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-else class="empty-products">
            <div class="empty-icon">
              <i class="fas fa-box-open"></i>
            </div>
            <p>ยังไม่มีรายการสินค้า</p>
            <p class="text-muted">กดปุ่ม "เลือกสินค้าจากคลัง" เพื่อเพิ่มสินค้า</p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary" v-if="salesOrder.items.length > 0">
          <div class="summary-row">
            <span>รวมเป็นเงิน:</span>
            <span>{{ formatCurrency(orderSummary.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>ส่วนลดรวม:</span>
            <span>{{ formatCurrency(orderSummary.totalDiscount) }}</span>
          </div>
          <div class="summary-row">
            <span>ภาษี ({{ taxRate }}%):</span>
            <span>{{ formatCurrency(orderSummary.tax) }}</span>
          </div>
          <div class="summary-row total">
            <span>รวมทั้งสิ้น:</span>
            <span>{{ formatCurrency(orderSummary.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="form-section">
        <h3>
          <i class="fas fa-sticky-note"></i>
          หมายเหตุ
        </h3>
        
        <div class="form-group">
          <textarea 
            v-model="salesOrder.notes" 
            class="form-control"
            rows="4"
            placeholder="หมายเหตุเพิ่มเติม..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Inventory Selector Modal -->
    <div v-if="showInventorySelector" class="modal-overlay" @click="closeInventorySelector">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-boxes"></i>
            เลือกสินค้าจากคลัง
          </h3>
          <button class="btn-close" @click="closeInventorySelector">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Search and Filter -->
          <div class="search-section">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input 
                v-model="inventorySearch" 
                type="text" 
                placeholder="ค้นหาสินค้า (รหัส, ชื่อ, คำอธิบาย...)"
                class="form-control"
              >
            </div>
            
            <div class="filter-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="showOnlyInStock"
                >
                แสดงเฉพาะสินค้าที่มีสต็อก
              </label>
            </div>
          </div>
          
          <!-- Inventory Items -->
          <div class="inventory-items">
            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              กำลังโหลดข้อมูล...
            </div>
            
            <div v-else-if="inventoryItems.length === 0" class="empty-state">
              <i class="fas fa-box-open"></i>
              <p>ไม่พบข้อมูลสินค้าในระบบ</p>
              <p class="text-muted">กรุณาไปเพิ่มสินค้าในระบบ Inventory ก่อน</p>
              <button class="btn btn-primary btn-sm" @click="loadInventoryData">
                <i class="fas fa-refresh"></i>
                โหลดข้อมูลใหม่
              </button>
            </div>
            
            <div v-else-if="filteredInventoryItems.length === 0" class="empty-state">
              <i class="fas fa-search"></i>
              <p>ไม่พบสินค้าที่ตรงตามเงื่อนไข</p>
              <p class="text-muted">ลองเปลี่ยนคำค้นหาหรือปิดตัวกรอง</p>
            </div>
            
            <div v-else class="items-grid">
              <div 
                v-for="item in filteredInventoryItems" 
                :key="item.id"
                class="inventory-item"
                :class="{ 'out-of-stock': (item.quantity || 0) <= 0 }"
              >
                <div class="item-info">
                  <div class="item-header">
                    <span class="item-sku">{{ item.sku }}</span>
                    <span class="item-stock" :class="getStockStatusClass(item.quantity)">
                      {{ item.quantity || 0 }} {{ item.unit || 'ชิ้น' }}
                    </span>
                  </div>
                  <h4 class="item-name">{{ item.product_name || item.name }}</h4>
                  <p class="item-description">{{ item.description || '-' }}</p>
                  <div class="item-price">
                    ราคา: {{ formatCurrency(item.unit_price || 0) }}
                  </div>
                </div>
                
                <div class="item-actions">
                  <button 
                    class="btn btn-primary btn-small"
                    @click="selectInventoryItem(item)"
                    :disabled="(item.quantity || 0) <= 0"
                  >
                    <i class="fas fa-plus"></i>
                    เลือก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeInventorySelector">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'

export default {
  name: 'SalesOrderForm',
  setup() {
    // Router
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine()
    
    // Reactive State
    const loading = ref(false)
    const saving = ref(false)
    const navigating = ref(false) // ป้องกัน duplicate navigation
    const showInventorySelector = ref(false)
    const inventoryItems = ref([])
    const inventorySearch = ref('')
    const showOnlyInStock = ref(false) // ✅ แสดงทุกสินค้า (รวมที่ stock = 0)
    const taxRate = ref(7) // 7% VAT
    
    // Customer Selection State
    const customers = ref([])
    const customerSearchQuery = ref('')
    const showCustomerDropdown = ref(false)
    const selectedCustomer = ref(null)
    
    // Initialize reactive data to prevent null reference errors
    const initializeData = () => {
      try {
        // Ensure all refs have safe default values
        if (!customers.value) customers.value = []
        if (!customerSearchQuery.value) customerSearchQuery.value = ''
        if (showCustomerDropdown.value === null) showCustomerDropdown.value = false
        if (!selectedCustomer.value) selectedCustomer.value = null
      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }
    

    
    // Sales Order Data
    const salesOrder = ref({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      salesPerson: 'system',
      status: 'draft',
      items: [],
      notes: ''
    })
    
    // Safe sales order items (filter out null/undefined)
    const validSalesOrderItems = computed(() => {
      try {
        const items = salesOrder.value?.items || []
        return items.filter(item => item != null)
      } catch (error) {
        console.error('Error filtering sales order items:', error)
        return []
      }
    })
    
    // Computed Properties
    const filteredInventoryItems = computed(() => {
      let filtered = inventoryItems.value || []
      
      // Filter by search term
      if (inventorySearch.value) {
        const searchTerm = inventorySearch.value.toLowerCase()
        filtered = filtered.filter(item => 
          (item.sku && item.sku.toLowerCase().includes(searchTerm)) ||
          (item.product_name && item.product_name.toLowerCase().includes(searchTerm)) ||
          (item.name && item.name.toLowerCase().includes(searchTerm)) ||
          (item.description && item.description.toLowerCase().includes(searchTerm))
        )
      }
      
      // Filter by stock status
      if (showOnlyInStock.value) {
        filtered = filtered.filter(item => (item.quantity || 0) > 0)
      }
      
      return filtered
    })
    
    const orderSummary = computed(() => {
      const items = salesOrder.value.items || []
      
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
        return sum + itemTotal
      }, 0)
      
      const totalDiscount = items.reduce((sum, item) => {
        return sum + (item.discount || 0)
      }, 0)
      
      const afterDiscount = subtotal - totalDiscount
      const tax = afterDiscount * (taxRate.value / 100)
      const total = afterDiscount + tax
      
      return {
        subtotal,
        totalDiscount,
        tax,
        total
      }
    })
    
    // Customer Computed Properties
    const availableCustomers = computed(() => {
      if (!customers.value || !Array.isArray(customers.value)) {
        return []
      }
      
      return customers.value.filter(customer => {
        if (customer.status !== 'active') return false
        if (!customer.customer_name && !customer.name && !customer.customer_code) return false
        return true
      }).sort((a, b) => {
        const nameA = a.customer_name || a.name || a.customer_code || ''
        const nameB = b.customer_name || b.name || b.customer_code || ''
        return nameA.localeCompare(nameB)
      })
    })
    
    const filteredCustomers = computed(() => {
      try {
        if (!customerSearchQuery.value || !customerSearchQuery.value.trim()) {
          return availableCustomers.value.slice(0, 10)
        }
        
        const query = customerSearchQuery.value.toLowerCase().trim()
        
        return availableCustomers.value.filter(customer => {
          if (!customer) return false
          
          const name = (customer.customer_name || customer.name || '').toLowerCase()
          const code = (customer.customer_code || '').toLowerCase()
          const contact = (customer.contact_person || '').toLowerCase()
          const phone = (customer.phone || '').toLowerCase()
          const email = (customer.email || '').toLowerCase()
          
          return name.includes(query) || 
                 code.includes(query) || 
                 contact.includes(query) ||
                 phone.includes(query) ||
                 email.includes(query)
        }).slice(0, 8)
      } catch (error) {
        console.error('Error in filteredCustomers:', error)
        return []
      }
    })
    
    const exactCustomerMatch = computed(() => {
      try {
        if (!customerSearchQuery.value || !customerSearchQuery.value.trim()) return null
        
        const query = customerSearchQuery.value.toLowerCase().trim()
        return availableCustomers.value.find(customer => {
          if (!customer) return false
          const name = (customer.customer_name || customer.name || '').toLowerCase()
          const code = (customer.customer_code || '').toLowerCase()
          return name === query || code === query
        }) || null
      } catch (error) {
        console.error('Error in exactCustomerMatch:', error)
        return null
      }
    })

    const canSave = computed(() => {
      // Check basic required fields
      const hasBasicInfo = (selectedCustomer.value || salesOrder.value.customerName) &&
                          salesOrder.value.orderDate &&
                          salesOrder.value.salesPerson &&
                          validSalesOrderItems.value.length > 0
      
      // Check that all items have required fields
      const hasValidItems = validSalesOrderItems.value.every(item => 
        item.productName && 
        item.quantity > 0 && 
        item.unitPrice >= 0
      )
      
      return hasBasicInfo && hasValidItems
    })
    
    // Customer Methods
    const loadCustomers = async () => {
      try {
        console.log('🔄 Loading customers for sales order...')
        
        // Initialize as empty array to prevent null issues
        customers.value = []
        
        // Try to load from TransactionEngine
        const result = await engine.list('customer')
        console.log('📦 Customer engine result:', result)
        
        if (result && result.success && Array.isArray(result.data)) {
          const validCustomers = result.data.filter(customer => 
            customer && 
            customer.status === 'active' && 
            (customer.customer_name || customer.name)
          ) || []
          customers.value = validCustomers
          console.log('✅ Loaded customers from engine:', customers.value.length)
        } else {
          // Fallback to localStorage
          const customerKey = `transaction_customer`
          const storedData = localStorage.getItem(customerKey)
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData)
              if (Array.isArray(parsed)) {
                const validCustomers = parsed.filter(customer => 
                  customer && 
                  customer.status === 'active' && 
                  (customer.customer_name || customer.name)
                ) || []
                customers.value = validCustomers
                console.log('✅ Loaded customers from localStorage:', customers.value.length)
              }
            } catch (parseError) {
              console.error('❌ Error parsing customer data:', parseError)
              customers.value = []
            }
          } else {
            customers.value = []
            console.log('⚠️ No customers found')
          }
        }
        
      } catch (error) {
        console.error('❌ Error loading customers:', error)
        customers.value = []
      }
    }

    const onCustomerInput = (event) => {
      try {
        const value = event?.target?.value || ''
        customerSearchQuery.value = value
        showCustomerDropdown.value = true
        
        // Clear selection if user is typing new text
        if (selectedCustomer.value && 
            value !== (selectedCustomer.value.customer_name || selectedCustomer.value.name)) {
          selectedCustomer.value = null
          // Reset form fields when customer is cleared
          if (!value) {
            salesOrder.value.customerName = ''
            salesOrder.value.customerPhone = ''
            salesOrder.value.customerAddress = ''
          }
        }
      } catch (error) {
        console.error('Error in onCustomerInput:', error)
      }
    }

    const selectCustomer = async (customer, customName = null) => {
      if (customName) {
        // Create new customer with manual entry
        const newCustomer = await createCustomerIfNotExists(customName)
        if (newCustomer) {
          selectedCustomer.value = newCustomer
          salesOrder.value.customerName = newCustomer.customer_name || newCustomer.name
          salesOrder.value.customerId = newCustomer.id
          customerSearchQuery.value = newCustomer.customer_name || newCustomer.name
        } else {
          // If creation failed, use as manual entry
          selectedCustomer.value = null
          salesOrder.value.customerName = customName
          salesOrder.value.customerId = null
          customerSearchQuery.value = customName
        }
      } else if (customer) {
        // Select existing customer
        selectedCustomer.value = customer
        salesOrder.value.customerName = customer.customer_name || customer.name
        salesOrder.value.customerId = customer.id
        salesOrder.value.customerPhone = customer.phone || ''
        salesOrder.value.customerAddress = customer.address || ''
        customerSearchQuery.value = customer.customer_name || customer.name
      }
      
      hideCustomerDropdown()
    }

    const hideCustomerDropdown = () => {
      setTimeout(() => {
        showCustomerDropdown.value = false
      }, 150)
    }

    const clearCustomer = () => {
      selectedCustomer.value = null
      customerSearchQuery.value = ''
      salesOrder.value.customerName = ''
      salesOrder.value.customerId = null
      salesOrder.value.customerPhone = ''
      salesOrder.value.customerAddress = ''
      showCustomerDropdown.value = false
    }

    const createCustomerIfNotExists = async (customerName) => {
      if (!customerName || customerName.trim() === '') return null
      
      const cleanName = customerName.trim()
      
      // Check if customer already exists
      const existingCustomer = availableCustomers.value.find(customer => 
        (customer.customer_name || customer.name) === cleanName
      )
      
      if (existingCustomer) {
        console.log('✅ Customer already exists:', existingCustomer.customer_name || existingCustomer.name)
        return existingCustomer
      }
      
      try {
        console.log('🆕 Creating new customer:', cleanName)
        
        // Generate customer code
        const customerCode = `CUS${String(Date.now()).slice(-6)}`
        
        const newCustomerData = {
          subtype: 'customer_master',
          customer_code: customerCode,
          customer_name: cleanName,
          name: cleanName,
          status: 'active',
          customer_type: 'individual',
          customer_group: 'retail',
          created_date: new Date().toISOString()
        }
        
        console.log('🔄 Creating customer with data:', newCustomerData)
        
        const result = await engine.create('customer', newCustomerData, 'system')
        
        if (result.success) {
          console.log('✅ Customer created successfully:', result.data)
          
          // Add to local customers array
          customers.value.push(result.data)
          
          return result.data
        } else {
          console.error('❌ Failed to create customer:', result.error)
          return null
        }
        
      } catch (error) {
        console.error('❌ Error creating customer:', error)
        return null
      }
    }

    const formatCustomerStatus = (status) => {
      try {
        const statusLabels = {
          'active': 'ใช้งาน',
          'inactive': 'ไม่ใช้งาน',
          'suspended': 'ระงับการใช้งาน',
          'blacklisted': 'บัญชีดำ'
        }
        return statusLabels[status] || status || 'ไม่ระบุ'
      } catch (error) {
        console.error('Error formatting customer status:', error)
        return 'ไม่ระบุ'
      }
    }

    const formatCustomerGroup = (group) => {
      try {
        const groupLabels = {
          'retail': 'ปลีก',
          'wholesale': 'ส่ง',
          'distributor': 'จัดจำหน่าย',
          'vip': 'VIP',
          'regular': 'ทั่วไป'
        }
        return groupLabels[group] || group || 'ไม่ระบุ'
      } catch (error) {
        console.error('Error formatting customer group:', error)
        return 'ไม่ระบุ'
      }
    }

    // Methods
    const loadInventoryData = async () => {
      loading.value = true
      try {
        console.log('🔄 Loading inventory data for sales (ProductManager style)...')
        
        // ✅ โหลดข้อมูล Products และ Balance พร้อมกัน (เหมือน ProductManager)
        const [productsResult, balanceResult] = await Promise.all([
          engine.list(TRANSACTION_TYPES.PRODUCT),
          engine.list(TRANSACTION_TYPES.INVENTORY_BALANCE)
        ])
        
        if (productsResult?.success && productsResult?.data) {
          const productsData = productsResult.data
          const balanceData = balanceResult?.success ? balanceResult.data : []
          
          console.log('✅ Products loaded:', productsData.length)
          console.log('📊 Balance records loaded:', balanceData.length)
          
          // ✅ รวมข้อมูล Product และ Balance เข้าด้วยกัน (เหมือน ProductManager)
          const items = productsData
            .filter(product => product.status === 'active') // กรองเฉพาะสินค้าที่ active
            .map(product => {
              const balance = balanceData.find(b => 
                b.product_id === product.id || 
                b.product_sku === product.sku ||
                b.sku === product.sku
              )
              
              // Debug: แสดงข้อมูล balance ที่พบ
              if (product.sku === 'FB000001') {
                console.log(`🔍 Product ${product.sku}:`, {
                  product_id: product.id,
                  found_balance: balance ? {
                    id: balance.id,
                    qty_on_hand: balance.qty_on_hand,
                    qty_available: balance.qty_available
                  } : null
                })
              }
              
              return {
                id: product.id,
                sku: product.sku || product.product_code,
                product_name: product.product_name || product.name,
                name: product.product_name || product.name,
                description: product.description || '',
                quantity: balance?.qty_available || balance?.qty_on_hand || 0, // ✅ ใช้ Balance data
                unit: product.unit || 'ชิ้น',
                unit_price: balance?.weighted_avg_cost || product.unit_price || 0, // ✅ ใช้ cost จาก Balance
                location: balance?.stock_location_code || 'MAIN',
                category: product.category || 'General',
                supplier: product.supplier || '',
                min_stock: product.min_stock || 0,
                subtype: 'product_with_balance',
                last_updated: balance?.updated_at || product.updated_at,
                status: 'active',
                balance: balance || null, // เก็บข้อมูล balance ไว้
                product_id: product.id,
                balance_id: balance?.id
              }
            })
          
          console.log('🔗 Products with balance merged:', items.length)
          
          inventoryItems.value = items
          
          console.log(`✅ Final inventory items: ${inventoryItems.value.length}`)
          console.log('📊 Sample items:', inventoryItems.value.slice(0, 3))
          
        } else {
          console.warn('⚠️ No products found or error:', productsResult?.error)
          inventoryItems.value = []
        }

        
      } catch (error) {
        console.error('❌ Error loading inventory:', error)
        inventoryItems.value = []
      } finally {
        loading.value = false
      }
    }
    
    const selectInventoryItem = (item) => {
      console.log('🔍 Selecting inventory item:', item)
      console.log('🔑 Available IDs:', {
        product_id: item.product_id,
        id: item.id,
        sku: item.sku,
        balance_id: item.balance_id
      })
      
      // Add item to sales order พร้อม product_id ที่ถูกต้อง
      const actualProductId = item.product_id || item.id
      console.log('✅ Using product_id:', actualProductId)
      
      const newItem = {
        productId: actualProductId, // ✅ ใช้ product_id ที่แท้จริงแทน SKU
        product_id: actualProductId, // ✅ เพิ่ม product_id สำหรับ backend
        sku: item.sku,
        productName: item.product_name || item.name,
        product_name: item.product_name || item.name, // ✅ เพิ่ม product_name สำหรับ backend
        quantity: 1,
        unit: item.unit || 'ชิ้น',
        unitPrice: item.unit_price || 0,
        unit_price: item.unit_price || 0, // ✅ เพิ่ม unit_price สำหรับ backend
        discount: 0,
        totalPrice: item.unit_price || 0,
        total_price: item.unit_price || 0, // ✅ เพิ่ม total_price สำหรับ backend
        availableStock: item.quantity || 0
      }
      
      console.log('📦 New item created with product_id:', newItem.product_id)
      
      // Check if item already exists (ใช้ product_id แทน sku)
      const existingIndex = salesOrder.value.items.findIndex(existing => 
        existing.product_id === item.product_id || existing.productId === item.product_id
      )
      
      if (existingIndex >= 0) {
        // Increase quantity if not exceeding stock
        const existing = salesOrder.value.items[existingIndex]
        if (existing.quantity < newItem.availableStock) {
          existing.quantity += 1
          calculateItemTotal(existing)
        } else {
          alert(`ไม่สามารถเพิ่มได้ เนื่องจากสต็อกมีเพียง ${newItem.availableStock} ${newItem.unit}`)
        }
      } else {
        // Add new item
        salesOrder.value.items.push(newItem)
      }
      
      closeInventorySelector()
    }
    
    const addManualItem = () => {
      salesOrder.value.items.push({
        productId: '', // ✅ สำหรับรายการแบบกรอกเองจะต้องระบุ product_id ภายหลัง
        product_id: '', // ✅ เพิ่ม product_id สำหรับ backend
        sku: '',
        productName: '',
        product_name: '', // ✅ เพิ่ม product_name สำหรับ backend
        quantity: 1,
        unit: 'ชิ้น',
        unitPrice: 0,
        unit_price: 0, // ✅ เพิ่ม unit_price สำหรับ backend
        discount: 0,
        totalPrice: 0,
        total_price: 0, // ✅ เพิ่ม total_price สำหรับ backend
        availableStock: null
      })
    }
    
    const removeItem = (index) => {
      salesOrder.value.items.splice(index, 1)
    }
    
    const calculateItemTotal = (item) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0)
      item.totalPrice = Math.max(0, subtotal - (item.discount || 0))
    }
    
    const closeInventorySelector = () => {
      showInventorySelector.value = false
      inventorySearch.value = ''
    }
    
    const saveSalesOrder = async () => {
      // Detailed validation with specific error messages
      if (!selectedCustomer.value && !salesOrder.value.customerName) {
        alert('กรุณาเลือกลูกค้าหรือกรอกชื่อลูกค้า')
        return
      }
      
      if (!salesOrder.value.orderDate) {
        alert('กรุณาระบุวันที่ขาย')
        return
      }
      
      if (!salesOrder.value.salesPerson) {
        alert('กรุณาระบุพนักงานขาย')
        return
      }
      
      if (salesOrder.value.items.length === 0) {
        alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ')
        return
      }
      
      // Validate each item
      for (let i = 0; i < salesOrder.value.items.length; i++) {
        const item = salesOrder.value.items[i]
        if (!item.productName) {
          alert(`รายการที่ ${i + 1}: กรุณาระบุชื่อสินค้า`)
          return
        }
        if (!item.quantity || item.quantity <= 0) {
          alert(`รายการที่ ${i + 1}: กรุณาระบุจำนวนที่ถูกต้อง`)
          return
        }
        if (item.unitPrice < 0) {
          alert(`รายการที่ ${i + 1}: ราคาต่อหน่วยไม่สามารถติดลบได้`)
          return
        }
      }
      
      saving.value = true
      let orderData = null
      
      try {
        // Generate order number
        const orderNumber = `SO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-6)}`
        
        // Prepare sales order data with all required fields
        orderData = {
          subtype: 'sales_order',
          
          // Required customer fields
          customerId: selectedCustomer.value?.id || salesOrder.value.customerId || `CUST-${Date.now()}`,
          customerName: selectedCustomer.value?.customer_name || selectedCustomer.value?.name || salesOrder.value.customerName,
          customer_name: selectedCustomer.value?.customer_name || selectedCustomer.value?.name || salesOrder.value.customerName,
          customer_code: selectedCustomer.value?.customer_code || null,
          customer_phone: salesOrder.value.customerPhone || selectedCustomer.value?.phone,
          customer_address: salesOrder.value.customerAddress || selectedCustomer.value?.address,
          
          // Required order fields
          orderNumber: orderNumber,
          order_date: salesOrder.value.orderDate,
          due_date: salesOrder.value.dueDate,
          
          // Required financial fields
          totalAmount: orderSummary.value.total,
          currency: 'THB',
          
          // Required delivery fields  
          deliveryAddress: salesOrder.value.customerAddress || 'ที่อยู่ตามใบขาย',
          
          // Transform items to match required schema
          items: salesOrder.value.items.map((item, index) => ({
            productId: item.product_id || item.productId || `PROD-${Date.now()}-${index}`, // ✅ ใช้ product_id ที่แท้จริง
            product_id: item.product_id || item.productId, // ✅ เพิ่ม product_id สำหรับ backend
            sku: item.sku,
            productName: item.productName,
            product_name: item.productName, // Keep both formats
            quantity: item.quantity || 0,
            unit: item.unit || 'ชิ้น',
            unitPrice: item.unitPrice || 0,
            unit_price: item.unitPrice || 0, // Keep both formats
            discount: item.discount || 0,
            totalPrice: item.totalPrice || 0,
            total_price: item.totalPrice || 0, // Keep both formats
            availableStock: item.availableStock || null
          })),
          
          // Other fields
          sales_person: salesOrder.value.salesPerson,
          status: salesOrder.value.status,
          notes: salesOrder.value.notes,
          subtotal: orderSummary.value.subtotal,
          total_discount: orderSummary.value.totalDiscount,
          tax: orderSummary.value.tax,
          total: orderSummary.value.total,
          tax_rate: taxRate.value,
          
          // Additional metadata
          created_date: new Date().toISOString(),
          created_by: salesOrder.value.salesPerson
        }
        
        // Debug: Log the data being sent
        console.log('🔍 Sales Order Data to be saved:', JSON.stringify(orderData, null, 2))
        
        // Save to system
        const result = await engine.create(TRANSACTION_TYPES.SALES, orderData, salesOrder.value.salesPerson)
        console.log('✅ Sales Order saved successfully:', result)
        
        alert('บันทึกใบขายเรียบร้อยแล้ว!')
        
        // Navigate back to main page (no form reset to avoid DOM issues)
        if (navigating.value) {
          console.log('⏸️ Navigation already in progress, skipping...')
          return
        }
        
        navigating.value = true
        
        try {
          console.log('🔄 Navigating back to sales page...')
          await nextTick() // รอให้ DOM update เสร็จ
          
          // เพิ่ม timeout protection
          const navigationTimeout = setTimeout(() => {
            console.warn('⏰ Navigation timeout, forcing redirect...')
            window.location.href = '/sales'
          }, 3000)
          
          // ไปหน้า sales หลักเลย (ไม่ต้องเช็ค history)
          router.push('/sales')
          
          // Clear timeout ถ้า navigation สำเร็จ
          clearTimeout(navigationTimeout)
          console.log('✅ Navigation to sales page completed')
          
        } catch (routerError) {
          console.warn('❌ Router navigation failed:', routerError)
          
          // Fallback: ใช้ window.location แทน
          try {
            window.location.href = '/sales'
          } catch (windowError) {
            console.error('❌ Window navigation also failed:', windowError)
            // Last resort: reload page
            window.location.reload()
          }
        } finally {
          // Reset navigation flag หลังจาก 2 วินาที
          setTimeout(() => {
            navigating.value = false
          }, 2000)
        }
        
      } catch (error) {
        console.error('❌ Error saving sales order:', error)
        console.error('📋 Order data that failed:', JSON.stringify(orderData, null, 2))
        
        // Show detailed error message
        let errorMessage = 'เกิดข้อผิดพลาดในการบันทึก: ' + error.message
        
        // Check if it's a validation error
        if (error.message && error.message.includes('Validation failed')) {
          errorMessage += '\n\nกรุณาตรวจสอบข้อมูลดังนี้:\n'
          if (error.message.includes('customerId')) errorMessage += '- รหัสลูกค้า\n'
          if (error.message.includes('customerName')) errorMessage += '- ชื่อลูกค้า\n'
          if (error.message.includes('orderNumber')) errorMessage += '- เลขที่ใบสั่งขาย\n'
          if (error.message.includes('totalAmount')) errorMessage += '- ยอดรวม\n'
          if (error.message.includes('currency')) errorMessage += '- สกุลเงิน\n'
          if (error.message.includes('deliveryAddress')) errorMessage += '- ที่อยู่จัดส่ง\n'
          if (error.message.includes('productId')) errorMessage += '- รหัสสินค้า\n'
        }
        
        alert(errorMessage)
      } finally {
        saving.value = false
      }
    }
    
    const getStockStatusClass = (quantity) => {
      const qty = quantity || 0
      if (qty <= 0) return 'out-of-stock'
      if (qty <= 5) return 'low-stock'
      return 'in-stock'
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }
    
    // Debug function
    const debugInventoryData = async () => {
      console.log('🔍 === SALES INVENTORY & BALANCE DEBUG ===')
      
      try {
        // 1. Check Balance System (NEW - ข้อมูลที่ถูกต้อง)
        console.log('📊 Checking Balance System...')
        const balanceResult = await engine.list(TRANSACTION_TYPES.INVENTORY_BALANCE)
        console.log('📊 Balance result:', balanceResult)
        
        // 2. Check Product Master
        console.log('📦 Checking Product Master...')
        const productResult = await engine.list(TRANSACTION_TYPES.PRODUCT)
        console.log('📦 Product result:', productResult)
        
        // 3. Check Legacy Inventory (OLD)
        console.log('📋 Checking Legacy Inventory...')
        const inventoryResult = await engine.list(TRANSACTION_TYPES.INVENTORY)
        console.log('📋 Legacy inventory result:', inventoryResult)
        
        // 4. Check localStorage keys
        const balanceKey = `transaction_${TRANSACTION_TYPES.INVENTORY_BALANCE}`
        const productKey = `transaction_${TRANSACTION_TYPES.PRODUCT}`
        const inventoryKey = `transaction_${TRANSACTION_TYPES.INVENTORY}`
        
        const balanceData = localStorage.getItem(balanceKey)
        const productData = localStorage.getItem(productKey)
        const inventoryData = localStorage.getItem(inventoryKey)
        
        console.log('💾 localStorage keys:')
        console.log(`  Balance: ${balanceData ? JSON.parse(balanceData).length + ' items' : 'No data'}`)
        console.log(`  Product: ${productData ? JSON.parse(productData).length + ' items' : 'No data'}`)
        console.log(`  Inventory: ${inventoryData ? JSON.parse(inventoryData).length + ' items' : 'No data'}`)
        
        // 5. Current state analysis
        console.log('📊 Current State:')
        console.log(`  inventoryItems: ${inventoryItems.value.length} items`)
        console.log(`  filteredItems: ${filteredInventoryItems.value.length} items`)
        
        // 6. ✅ Product ID Mapping Debug
        console.log('🔗 === PRODUCT ID MAPPING DEBUG ===')
        if (productResult?.success && balanceResult?.success) {
          const products = productResult.data || []
          const balances = balanceResult.data || []
          
          console.log('📦 Products with IDs:')
          products.forEach(p => {
            console.log(`  Product ID: ${p.id}, SKU: ${p.sku}, Name: ${p.name}`)
          })
          
          console.log('📊 Balance Records with Product IDs:')
          balances.forEach(b => {
            const matchedProduct = products.find(p => p.id === b.product_id)
            console.log(`  Balance ID: ${b.id}, Product ID: ${b.product_id}, SKU: ${b.sku}, Product: ${matchedProduct?.name || 'NOT FOUND'}`)
          })
          
          console.log('⚠️ POTENTIAL DUPLICATES:')
          const skuGroups = {}
          products.forEach(p => {
            if (!skuGroups[p.sku]) skuGroups[p.sku] = []
            skuGroups[p.sku].push(p)
          })
          
          Object.entries(skuGroups).forEach(([sku, products]) => {
            if (products.length > 1) {
              console.log(`  Duplicate SKU "${sku}":`, products.map(p => `ID: ${p.id}, Name: ${p.name}`))
            }
          })
        }
        
        // Create comprehensive summary
        let summary = `🔍 Sales Order - Inventory Debug Report\n\n`
        
        const balanceCount = balanceResult?.data?.length || 0
        const productCount = productResult?.data?.length || 0
        const inventoryCount = inventoryResult?.data?.length || 0
        
        summary += `📊 Balance System: ${balanceCount} records\n`
        summary += `📦 Product Master: ${productCount} records\n`
        summary += `📋 Legacy Inventory: ${inventoryCount} records\n\n`
        
        summary += `🎯 Current Sales Items: ${inventoryItems.value.length} items\n`
        summary += `🔍 Items with stock: ${inventoryItems.value.filter(item => item.quantity > 0).length}\n\n`
        
        if (balanceCount > 0) {
          summary += `✅ Balance System Available!\n`
          
          // Show balance sample
          const activeBalances = balanceResult.data.filter(b => 
            b.status === 'active' && b.qty_available > 0
          )
          
          summary += `   📊 Active Balances: ${activeBalances.length}\n`
          
          if (activeBalances.length > 0) {
            summary += `   🔸 Sample Items:\n`
            activeBalances.slice(0, 3).forEach((balance, i) => {
              const product = productResult.data?.find(p => p.id === balance.product_id)
              summary += `   ${i+1}. ${balance.product_code} - ${balance.qty_available} available`
              if (product) summary += ` (${product.product_name})`
              summary += `\n`
            })
          }
          
          summary += `\n🎯 Recommendation: Using Balance System for accurate stock levels`
          
        } else if (productCount > 0) {
          summary += `⚠️ No Balance System - Using Product Master\n`
          summary += `   📦 Products: ${productCount}\n`
          summary += `   💡 Tip: Run Goods Receipt to create Balance records\n`
          
        } else if (inventoryCount > 0) {
          summary += `⚠️ Legacy Mode - Using Inventory Transactions\n`
          summary += `   📋 Inventory Records: ${inventoryCount}\n`
          summary += `   💡 Tip: Update to Balance System for better accuracy\n`
          
        } else {
          summary += `❌ No Inventory Data Found!\n\n`
          summary += `🔧 Solutions:\n`
          summary += `1. Go to Inventory → Add Products\n`
          summary += `2. Create Purchase Order → Goods Receipt\n`
          summary += `3. Check console for detailed errors\n`
        }
        
        if (inventoryItems.value.length > 0) {
          summary += `\n📊 Available Items (All Products):\n`
          inventoryItems.value.slice(0, 5).forEach((item, i) => {
            const stock = item.quantity || 0
            const stockStatus = stock > 0 ? '✅' : '❌'
            summary += `${i+1}. ${stockStatus} ${item.product_name} (${item.sku}) - ${stock} ${item.unit}\n`
          })
          
          if (inventoryItems.value.length > 5) {
            summary += `   ... และอีก ${inventoryItems.value.length - 5} รายการ\n`
          }
        }
        
        alert(summary)
        
      } catch (error) {
        console.error('❌ Debug error:', error)
        alert('เกิดข้อผิดพลาดในการ debug: ' + error.message)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      try {
        console.log('🔄 SalesOrderForm mounting...')
        initializeData()
        await loadCustomers()
        await loadInventoryData()
        console.log('✅ SalesOrderForm mounted successfully')
      } catch (error) {
        console.error('❌ Error mounting SalesOrderForm:', error)
        // Ensure safe state even if loading fails
        initializeData()
      }
    })
    
    // Watch for inventory selector opening
    watch(showInventorySelector, (newValue) => {
      if (newValue && inventoryItems.value.length === 0) {
        loadInventoryData()
      }
    })
    
    return {
      // Data
      loading,
      saving,
      showInventorySelector,
      inventoryItems,
      inventorySearch,
      showOnlyInStock,
      taxRate,
      salesOrder,
      
      // Customer Data
      customers,
      customerSearchQuery,
      showCustomerDropdown,
      selectedCustomer,
      
      // Computed
      filteredInventoryItems,
      orderSummary,
      canSave,
      availableCustomers,
      filteredCustomers,
      exactCustomerMatch,
      validSalesOrderItems,
      
      // Methods
      loadInventoryData,
      selectInventoryItem,
      addManualItem,
      removeItem,
      calculateItemTotal,
      closeInventorySelector,
      saveSalesOrder,
      getStockStatusClass,
      formatCurrency,
      debugInventoryData,
      
      // Customer Methods
      loadCustomers,
      onCustomerInput,
      selectCustomer,
      hideCustomerDropdown,
      clearCustomer,
      createCustomerIfNotExists,
      formatCustomerStatus,
      formatCustomerGroup,
      initializeData
    }
  }
}
</script>

<style scoped>
.sales-order-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.form-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h2 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
}

.title-section .subtitle {
  margin: 0;
  color: #718096;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section h3 i {
  color: #4299e1;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
}

.form-group.full-width {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #4a5568;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
}

.form-control.small {
  padding: 6px 8px;
  font-size: 12px;
}

/* Products Section */
.products-section {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.products-table-container {
  margin-bottom: 24px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.products-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.products-table tbody tr:hover {
  background: #f7fafc;
}

.total-amount {
  font-weight: 600;
  color: #2d3748;
}

.empty-products {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Order Summary */
.order-summary {
  border-top: 2px solid #e2e8f0;
  padding-top: 20px;
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 0;
}

.summary-row.total {
  border-top: 2px solid #e2e8f0;
  margin-top: 12px;
  padding-top: 12px;
  font-weight: 600;
  font-size: 18px;
  color: #2d3748;
}

/* Modal */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content.large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover {
  color: #2d3748;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Search Section */
.search-section {
  margin-bottom: 24px;
}

.search-input {
  position: relative;
  margin-bottom: 16px;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-input input {
  padding-left: 40px;
}

.filter-options {
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #4a5568;
}

/* Inventory Items */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.loading-state i,
.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.inventory-item {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
}

.inventory-item:hover {
  border-color: #4299e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.inventory-item.out-of-stock {
  opacity: 0.6;
  border-color: #e53e3e;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-sku {
  background: #edf2f7;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.item-stock {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.item-stock.in-stock {
  background: #c6f6d5;
  color: #22543d;
}

.item-stock.low-stock {
  background: #fefcbf;
  color: #744210;
}

.item-stock.out-of-stock {
  background: #feb2b2;
  color: #742a2a;
}

.item-name {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
}

.item-description {
  margin: 0 0 8px 0;
  color: #718096;
  font-size: 14px;
}

.item-price {
  color: #4299e1;
  font-weight: 600;
  margin-bottom: 12px;
}

.item-actions {
  margin-top: auto;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #38a169;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

.btn-outline {
  background: transparent;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-small, .btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Customer Search Styles */
.customer-search-wrapper {
  position: relative;
}

.customer-input-container {
  position: relative;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  z-index: 2;
}

.customer-input {
  padding-left: 40px !important;
  padding-right: 40px !important;
}

.customer-input.has-selection {
  background-color: #f0fdf4;
  border-color: #10b981;
}

.selected-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-size: 16px;
  z-index: 2;
}

/* Dropdown Styles */
.customer-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 400px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.dropdown-count {
  font-size: 11px;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.customers-list {
  max-height: 280px;
  overflow-y: auto;
}

/* Customer Option Styles */
.customer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
}

.customer-option:hover {
  background-color: #f8fafc;
}

.customer-option:last-child {
  border-bottom: none;
}

.option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.new-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.existing-customer .option-icon {
  background: #f0fdf4;
  color: #16a34a;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.option-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.2;
}

.option-description {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

.customer-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #475569;
}

.contact-person, .phone {
  color: #64748b;
}

.option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  margin-top: 2px;
}

.customer-id {
  color: #94a3b8;
  font-family: monospace;
  font-weight: 500;
}

.option-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.option-status.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.option-status.status-inactive {
  background-color: #f1f5f9;
  color: #64748b;
}

.customer-group {
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 10px;
  background: #e0f2fe;
  color: #0e7490;
}

.option-action {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 12px;
  transition: all 0.2s ease;
}

.customer-option:hover .option-action {
  color: #3b82f6;
}

/* New Customer Option */
.new-customer {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 1px solid #bae6fd;
  position: relative;
}

.new-customer::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.new-customer .option-name {
  color: #1e40af;
}

.new-customer .option-description {
  color: #1e40af;
  font-weight: 500;
}

.new-customer .option-meta {
  color: #3b82f6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: #64748b;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
  color: #94a3b8;
}

.empty-text {
  font-size: 14px;
  text-align: center;
}

/* Selected Customer Display */
.selected-customer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.selected-customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.selected-customer-info i {
  color: #16a34a;
  font-size: 14px;
}

.selected-name {
  font-weight: 500;
  color: #15803d;
  font-size: 14px;
}

.selected-id {
  font-size: 11px;
  color: #16a34a;
  font-family: monospace;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 4px;
}

.clear-selection-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #fca5a5;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
}

.clear-selection-btn:hover {
  background: #f87171;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .products-table {
    font-size: 12px;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content.large {
    width: 95vw;
  }
  
  /* Customer dropdown responsive */
  .customer-dropdown {
    max-height: 300px;
  }
  
  .customers-list {
    max-height: 200px;
  }
  
  .customer-option {
    padding: 12px;
  }
  
  .option-icon {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .option-name {
    font-size: 13px;
  }
  
  .option-description {
    font-size: 11px;
    flex-wrap: wrap;
  }
}
</style>
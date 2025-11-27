<template>
  <div class="sales-order-form">
    <!-- Breadcrumb -->
    <ErpBreadcrumb :nav="breadcrumbNav" />
    
    <!-- Form Header -->
    <div class="form-header">
      <div class="header-content">
        <h2>สร้างเอกสารการขาย</h2>
        <p>เลือกประเภทเอกสารและกรอกข้อมูลการขาย</p>
      </div>
      
      <div class="header-actions">
        <button class="btn btn-secondary" @click="$router.go(-1)">
          <i class="fas fa-arrow-left"></i>
          ย้อนกลับ
        </button>
        <button class="btn btn-success" @click="saveOrder" :disabled="!canSave">
          <i class="fas fa-save"></i>
          บันทึก
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <!-- Document Type Selection -->
      <div class="form-section">
        <h3>ประเภทเอกสาร</h3>
        <div class="document-type-selector">
          <label class="type-option" :class="{ active: orderForm.status === 'draft' }">
            <input type="radio" v-model="orderForm.status" value="draft" @change="updateDocumentType">
            <div class="option-content">
              <i class="fas fa-file-alt"></i>
              <h4>Quotation</h4>
              <p>ใบเสนอราคา (Draft)</p>
            </div>
          </label>
          
          <label class="type-option" :class="{ active: orderForm.status === 'approved' }">
            <input type="radio" v-model="orderForm.status" value="approved" @change="updateDocumentType">
            <div class="option-content">
              <i class="fas fa-shopping-cart"></i>
              <h4>Sales Order</h4>
              <p>ใบสั่งซื้อ (รอเข้า Production)</p>
            </div>
          </label>
          
          <label class="type-option" :class="{ active: orderForm.status === 'pending_payment' }">
            <input type="radio" v-model="orderForm.status" value="pending_payment" @change="updateDocumentType">
            <div class="option-content">
              <i class="fas fa-file-invoice"></i>
              <h4>Sales Invoice</h4>
              <p>ใบแจ้งหนี้ (รอชำระเงิน)</p>
            </div>
          </label>
        </div>
      </div>
      <!-- Customer Information -->
      <div class="form-section">
        <h3>ข้อมูลลูกค้า</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>ลูกค้า *</label>
            <select v-model="orderForm.customerId" class="form-input" required>
              <option value="">เลือกลูกค้า</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }} - {{ customer.phone }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>เลขที่เอกสาร</label>
            <input type="text" v-model="orderForm.orderNumber" class="form-input" readonly>
          </div>
          
          <div class="form-group">
            <label>วันที่สั่ง *</label>
            <input type="date" v-model="orderForm.orderDate" class="form-input" required>
          </div>
          
          <div class="form-group">
            <label>วันที่ส่งมอบ</label>
            <input type="date" v-model="orderForm.deliveryDate" class="form-input">
          </div>
        </div>
        
        <div class="form-group">
          <label>หมายเหตุ</label>
          <textarea v-model="orderForm.notes" class="form-input" rows="3" placeholder="หมายเหตุเพิ่มเติม"></textarea>
        </div>
      </div>

      <!-- Items Section -->
      <div class="form-section">
        <div class="section-header">
          <h3>รายการสินค้า</h3>
          <button class="btn btn-primary" @click="addItem">
            <i class="fas fa-plus"></i>
            เพิ่มสินค้า
          </button>
        </div>
        
        <!-- Items Table -->
        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>ราคา/หน่วย</th>
                <th>ส่วนลด</th>
                <th>ยอดรวม</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderForm.items" :key="index" class="item-row">
                <td>
                  <select v-model="item.productId" @change="updateItemProduct(index)" class="form-input">
                    <option value="">เลือกสินค้า</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }} - {{ formatCurrency(product.price) }}
                      <span v-if="product.qty_available !== undefined">
                        (ขายได้: {{ product.qty_available }})
                      </span>
                      <span v-if="product.qty_on_hand && product.qty_on_hand !== product.qty_available" class="text-muted">
                        [รวม: {{ product.qty_on_hand }}]
                      </span>
                    </option>
                  </select>
                  <!-- แสดงข้อมูลสต็อคที่ขายได้ -->
                  <div v-if="item.productId && (item.availableStock !== undefined || item.currentStock !== undefined)" class="stock-info">
                    <span class="stock-badge" :class="getStockStatusClass(item)">
                      <i :class="getStockStatusIcon(item)"></i>
                      ขายได้: {{ item.availableStock || item.currentStock || 0 }} {{ item.unit }}
                    </span>
                    <!-- แสดงข้อมูลเพิ่มเติมถ้ามีการจอง -->
                    <span v-if="item.totalStock && item.totalStock !== item.availableStock" class="reserved-badge">
                      รวม: {{ item.totalStock }} (จอง: {{ item.totalStock - item.availableStock }})
                    </span>
                    <span v-if="item.location" class="location-badge">
                      📍 {{ item.location }}
                    </span>
                  </div>
                </td>
                <td>
                  <input type="number" v-model.number="item.quantity" @input="calculateItemTotal(index)" class="form-input" min="0" step="0.01">
                  <!-- แสดงคำเตือนถ้าสั่งเกินสต็อค -->
                  <div v-if="item.currentStock !== undefined && item.quantity > item.currentStock" class="stock-warning">
                    ⚠️ สั่งเกินสต็อค!
                  </div>
                </td>
                <td>
                  <input type="text" v-model="item.unit" class="form-input" placeholder="หน่วย">
                </td>
                <td>
                  <input type="number" v-model.number="item.unitPrice" @input="calculateItemTotal(index)" class="form-input" min="0" step="0.01">
                </td>
                <td>
                  <input type="number" v-model.number="item.discount" @input="calculateItemTotal(index)" class="form-input" min="0" step="0.01">
                </td>
                <td class="total-cell">
                  {{ formatCurrency(item.total || 0) }}
                </td>
                <td>
                  <button class="btn-icon btn-danger" @click="removeItem(index)" title="ลบรายการ">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              
              <!-- Empty state -->
              <tr v-if="orderForm.items.length === 0">
                <td colspan="7" class="empty-items">
                  <i class="fas fa-shopping-cart"></i>
                  <p>ยังไม่มีรายการสินค้า กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มต้น</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="form-section">
        <h3>สรุปยอดรวม</h3>
        <div class="summary-grid">
          <div class="summary-row">
            <span>ยอดรวมสินค้า:</span>
            <span class="amount">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>ส่วนลดรวม:</span>
            <span class="amount discount">-{{ formatCurrency(totalDiscount) }}</span>
          </div>
          <div class="summary-row">
            <span>ยอดก่อน VAT:</span>
            <span class="amount">{{ formatCurrency(beforeVat) }}</span>
          </div>
          <div class="summary-row">
            <span>VAT ({{ vatRate }}%):</span>
            <span class="amount">{{ formatCurrency(vatAmount) }}</span>
          </div>
          <div class="summary-row total-row">
            <span>ยอดรวมสุทธิ:</span>
            <span class="amount total">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES, ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'SalesOrderCreate',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const router = useRouter()
    const engine = new TransactionEngine()
    
    // Breadcrumb
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Sales Orders', path: '/sales/sales-order', icon: 'fas fa-file-invoice' },
      { name: 'Create Sales Order' }
    ])
    
    // Form data
    const orderForm = ref({
      orderNumber: '',
      customerId: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: '',
      items: [],
      status: 'draft', // draft = Quotation, approved = Sales Order, pending_payment = Sales Invoice
      subtype: 'quotation' // Will be updated based on status
    })
    
    // Reference data
    const customers = ref([])
    const products = ref([])
    
    // Computed values
    const subtotal = computed(() => {
      return orderForm.value.items.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
        return sum + itemTotal
      }, 0)
    })
    
    const totalDiscount = computed(() => {
      return orderForm.value.items.reduce((sum, item) => {
        return sum + (item.discount || 0)
      }, 0)
    })
    
    const beforeVat = computed(() => {
      return subtotal.value - totalDiscount.value
    })
    
    const vatRate = ref(7) // 7% VAT
    
    const vatAmount = computed(() => {
      return beforeVat.value * (vatRate.value / 100)
    })
    
    const grandTotal = computed(() => {
      return beforeVat.value + vatAmount.value
    })
    
    const canSave = computed(() => {
      return orderForm.value.customerId && 
             orderForm.value.orderDate && 
             orderForm.value.items.length > 0
    })

    // Generate order number based on document type
    const generateOrderNumber = () => {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      
      let prefix = 'QT' // Default to Quotation
      if (orderForm.value.status === 'approved') {
        prefix = 'SO' // Sales Order
      } else if (orderForm.value.status === 'pending_payment') {
        prefix = 'SI' // Sales Invoice
      }
      
      orderForm.value.orderNumber = `${prefix}${year}${month}${day}${random}`
    }

    // Update document type and related data
    const updateDocumentType = () => {
      // Update subtype based on status
      if (orderForm.value.status === 'draft') {
        orderForm.value.subtype = 'quotation'
      } else if (orderForm.value.status === 'approved') {
        orderForm.value.subtype = 'sales_order'
      } else if (orderForm.value.status === 'pending_payment') {
        orderForm.value.subtype = 'sales_invoice'
      }
      
      // Regenerate order number with appropriate prefix
      generateOrderNumber()
    }

    // Load reference data
    const loadCustomers = async () => {
      try {
        const result = await engine.list(TRANSACTION_TYPES.CUSTOMER)
        customers.value = result?.data || []
      } catch (error) {
        console.error('Error loading customers:', error)
      }
    }
    
    const loadProducts = async () => {
      console.log('🔄 โหลดข้อมูลสินค้าแบบเดียวกับ Product List...')
      
      try {
        // ใช้วิธีเดียวกันกับ Product List - โหลด Products และ Balance แยกกัน
        console.log('📦 กำลังโหลดข้อมูล Products และ Balance...')
        
        const [productsResult, balanceResult] = await Promise.all([
          engine.list(TRANSACTION_TYPES.PRODUCT),
          engine.list(TRANSACTION_TYPES.INVENTORY_BALANCE)
        ])
        
        if (productsResult?.success && productsResult?.data) {
          const productsData = productsResult.data
          const balanceData = balanceResult?.success ? balanceResult.data : []
          
          console.log('✅ Products loaded:', productsData.length)
          console.log('📊 Balance records loaded:', balanceData.length)
          
          // รวมข้อมูล Product และ Balance เข้าด้วยกัน (แบบเดียวกับ Product List)
          const mergedProducts = productsData.map(product => {
            const balance = balanceData.find(b => 
              b.product_id === product.id || 
              b.product_sku === product.sku ||
              b.sku === product.sku
            )
            
            // Debug: แสดงข้อมูล balance ที่พบ (เฉพาะ FB000001)
            if (product.sku === 'FB000001') {
              console.log(`Product ${product.sku}:`, {
                product_id: product.id,
                found_balance: balance ? {
                  id: balance.id,
                  qty_on_hand: balance.qty_on_hand,
                  qty_available: balance.qty_available,
                  total_quantity: balance.total_quantity
                } : null
              })
            }
            
            // แปลงข้อมูลให้ตรงกับที่ต้องการใน Sales Order
            return {
              id: product.id,
              sku: product.sku,
              name: product.product_name || product.name,
              description: product.description || '',
              price: parseFloat(product.unit_price || product.price || 0),
              unit: product.unit || 'ชิ้น',
              category: product.category || 'General',
              supplier: product.supplier || '',
              
              // ⚡ ข้อมูล Stock - แสดงยอดที่ขายได้จริง (หักจองแล้ว)
              qty_on_hand: balance?.qty_on_hand || balance?.total_quantity || 0,        // ยอดรวมในคลัง
              qty_reserved: balance?.qty_reserved || balance?.qty_committed || 0,       // ยอดจอง/จัดสรร
              qty_available: balance?.qty_available || 0,                              // ยอดที่ขายได้ (On Hand - Reserved)
              
              // สำหรับการแสดงผล (ใช้ยอดที่ขายได้เป็นหลัก)
              stock_quantity: balance?.qty_available || 0,                             // 🎯 ยอดที่ขายได้จริง
              available_quantity: balance?.qty_available || 0,                         // เหมือนกับ stock_quantity
              
              min_stock_level: parseFloat(product.min_stock || 0),
              max_stock_level: parseFloat(product.max_stock || 0),
              location: balance?.location || 'คลังหลัก',
              
              // ข้อมูลเพิ่มเติม
              status: product.status || 'active',
              balance: balance || null,
              source: 'product_list_method'
            }
          })
          
          // กรองเฉพาะสินค้าที่ active
          const activeProducts = mergedProducts.filter(product => 
            product.status === 'active' && 
            product.name && 
            product.name.trim() !== ''
          )
          
          console.log(`🔗 Products with balance merged: ${mergedProducts.length} total, ${activeProducts.length} active`)
          
          // แสดงตัวอย่างข้อมูลสินค้า 3 รายการแรก
          if (activeProducts.length > 0) {
            console.log('📋 ตัวอย่างสินค้า 3 รายการแรก:', 
              activeProducts.slice(0, 3).map(p => ({
                sku: p.sku,
                name: p.name,
                price: p.price,
                stock: p.stock_quantity,
                available: p.available_quantity
              }))
            )
          }
          
          products.value = activeProducts
          
        } else {
          console.warn('⚠️ No products found or error:', productsResult?.error)
          products.value = []
        }
        
      } catch (error) {
        console.error('❌ Error loading products (Product List method):', error)
        products.value = []
      }
    }

    // Item management
    const addItem = () => {
      orderForm.value.items.push({
        productId: '',
        productName: '',
        quantity: 1,
        unit: 'ชิ้น',
        unitPrice: 0,
        discount: 0,
        total: 0
      })
    }
    
    const removeItem = (index) => {
      orderForm.value.items.splice(index, 1)
    }
    
    const updateItemProduct = (index) => {
      const item = orderForm.value.items[index]
      const product = products.value.find(p => p.id === item.productId)
      
      if (product) {
        console.log('🔄 อัพเดตข้อมูลสินค้า:', product)
        
        item.productName = product.name
        item.unitPrice = product.price || 0
        item.unit = product.unit || 'ชิ้น'
        
        // 🎯 ข้อมูลสต็อค - ใช้ยอดที่ขายได้เป็นหลัก
        item.sku = product.sku || product.id
        item.totalStock = product.qty_on_hand || 0           // ยอดรวมในคลัง
        item.reservedStock = product.qty_reserved || 0       // ยอดจอง
        item.availableStock = product.qty_available || 0     // ยอดที่ขายได้ (หักจองแล้ว)
        item.currentStock = product.qty_available || 0       // เหมือนกับ availableStock (สำหรับ backward compatibility)
        
        item.category = product.category || 'ไม่ระบุ'
        item.location = product.location || 'คลังหลัก'
        
        console.log('✅ อัพเดตข้อมูลสินค้าสำเร็จ:', {
          name: item.productName,
          price: item.unitPrice,
          totalStock: item.totalStock,
          reservedStock: item.reservedStock,
          availableStock: item.availableStock,
          '🎯 ยอดที่ขายได้': item.availableStock
        })
        
        calculateItemTotal(index)
      }
    }
    
    const calculateItemTotal = (index) => {
      const item = orderForm.value.items[index]
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0)
      item.total = subtotal - (item.discount || 0)
    }

    // Save order
    const saveOrder = async () => {
      try {
        console.log('💾 Saving sales document...', orderForm.value)
        
        // Prepare order data
        const orderData = {
          ...orderForm.value,
          totalAmount: grandTotal.value,
          subtotal: subtotal.value,
          totalDiscount: totalDiscount.value,
          vatAmount: vatAmount.value,
          createdAt: new Date().toISOString()
        }
        
        // Find customer data
        const customer = customers.value.find(c => c.id === orderData.customerId)
        if (customer) {
          orderData.customerName = customer.name
          orderData.customerPhone = customer.phone
        }
        
        console.log('📦 Final order data:', orderData)
        
        // Determine transaction type based on status
        let transactionType = TRANSACTION_TYPES.SALES
        let successMessage = 'บันทึกเอกสารการขายสำเร็จ!'
        let redirectPath = '/sales/quotation'
        
        if (orderData.status === 'draft') {
          // Quotation
          successMessage = 'บันทึกใบเสนอราคาสำเร็จ!'
          redirectPath = '/sales/quotation'
        } else if (orderData.status === 'approved') {
          // Sales Order
          successMessage = 'บันทึก Sales Order สำเร็จ! พร้อมเข้า Production'
          redirectPath = '/sales/sales-order'
        } else if (orderData.status === 'pending_payment') {
          // Sales Invoice
          successMessage = 'บันทึก Sales Invoice สำเร็จ! รอการชำระเงิน'
          redirectPath = '/sales/sales-invoice'
        }
        
        const result = await engine.create(transactionType, orderData)
        console.log('✅ Document created:', result)
        
        alert(successMessage)
        router.push(redirectPath)
        
      } catch (error) {
        console.error('❌ Error saving document:', error)
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
      }
    }

    // 🎯 Stock status helpers - ใช้ยอดที่ขายได้เป็นหลัก
    const getStockStatusClass = (item) => {
      const availableStock = item.availableStock || item.currentStock || 0  // ยอดที่ขายได้
      const quantity = item.quantity || 0
      
      if (availableStock === 0) return 'out-of-stock'
      if (quantity > availableStock) return 'over-stock'  // เช็คกับยอดที่ขายได้
      if (availableStock <= (item.minStock || 5)) return 'low-stock'
      return 'in-stock'
    }

    const getStockStatusIcon = (item) => {
      const availableStock = item.availableStock || item.currentStock || 0  // ยอดที่ขายได้
      const quantity = item.quantity || 0
      
      if (availableStock === 0) return 'fas fa-times-circle'
      if (quantity > availableStock) return 'fas fa-exclamation-triangle'  // เช็คกับยอดที่ขายได้
      if (availableStock <= (item.minStock || 5)) return 'fas fa-exclamation-triangle'
      return 'fas fa-check-circle'
    }

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    // Initialize
    onMounted(() => {
      console.log('🚀 [SalesOrderCreate] Component mounted - เริ่มโหลดข้อมูล')
      generateOrderNumber()
      
      console.log('👥 กำลังโหลดข้อมูลลูกค้า...')
      loadCustomers()
      
      console.log('📦 กำลังโหลดข้อมูลสินค้าจากคลัง...')
      loadProducts()
      
      // Add initial item
      addItem()
      console.log('✅ [SalesOrderCreate] เสร็จสิ้นการเริ่มต้น component')
    })

    return {
      // Breadcrumb
      breadcrumbNav,
      
      // Form data
      orderForm,
      customers,
      products,
      
      // Computed
      subtotal,
      totalDiscount,
      beforeVat,
      vatRate,
      vatAmount,
      grandTotal,
      canSave,
      
      // Methods
      addItem,
      removeItem,
      updateItemProduct,
      calculateItemTotal,
      updateDocumentType,
      saveOrder,
      formatCurrency,
      getStockStatusClass,
      getStockStatusIcon
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

/* Document Type Selector */
.document-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.type-option {
  position: relative;
  display: block;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s ease;
}

.type-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.type-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.type-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.option-content {
  text-align: center;
}

.option-content i {
  font-size: 28px;
  color: #6b7280;
  margin-bottom: 12px;
  display: block;
}

.type-option.active .option-content i {
  color: #3b82f6;
}

.option-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.type-option.active .option-content h4 {
  color: #1e40af;
}

.option-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.type-option.active .option-content p {
  color: #3730a3;
}

/* Header */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.header-content h2 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
}

.header-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Form Layout */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-input[readonly] {
  background-color: #f9fafb;
  color: #6b7280;
}

/* Items Table */
.items-table-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.items-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.item-row:hover {
  background: #f9fafb;
}

.item-row .form-input {
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  font-size: 13px;
}

.total-cell {
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

/* Stock Information */
.stock-info {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.stock-badge.in-stock {
  background: #dcfce7;
  color: #166534;
}

.stock-badge.low-stock {
  background: #fef3c7;
  color: #a16207;
}

.stock-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.stock-badge.over-stock {
  background: #fee2e2;
  color: #991b1b;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  font-size: 10px;
}

.reserved-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: #fef3c7;
  color: #a16207;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.9em;
}

.stock-warning {
  color: #dc2626;
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

.empty-items {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-items i {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
  color: #d1d5db;
}

.empty-items p {
  margin: 0;
  font-size: 16px;
}

/* Summary */
.summary-grid {
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total-row {
  border-top: 2px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
  font-size: 18px;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

.amount.discount {
  color: #ef4444;
}

.amount.total {
  color: #059669;
  font-size: 20px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.btn-danger {
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .items-table-container {
    overflow-x: auto;
  }
  
  .items-table {
    min-width: 800px;
  }
  
  .summary-grid {
    max-width: none;
    margin-left: 0;
  }
}
</style>
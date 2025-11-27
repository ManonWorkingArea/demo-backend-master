# 🚀 ERP CORE QUICK REFERENCE
*คู่มืออ้างอิงรวดเร็วสำหรับ Daily Development*

---

## ⚡ **INSTANT COMMANDS**

### 🎯 **Common Operations (Core-Only)**
```javascript
// 📦 Data Operations (เท่านั้น!)
const result = await engine.create(TRANSACTION_TYPES.INVENTORY, data, userId)
const item = await engine.read(TRANSACTION_TYPES.INVENTORY, id)
const updated = await engine.update(TRANSACTION_TYPES.INVENTORY, id, data, userId)
const stateChanged = await engine.updateState(TRANSACTION_TYPES.INVENTORY, id, 'reserved', userId)
const deleted = await engine.delete(TRANSACTION_TYPES.INVENTORY, id, userId)
const items = await engine.list(TRANSACTION_TYPES.INVENTORY, { status: 'active', limit: 10 })

// 🔧 Module Functions (เท่านั้น!)
const eoq = await engine.executeModuleFunction('inventory', 'calculateEOQ', demand, orderCost, holdingCost)
const validation = await engine.executeModuleFunction('inventory', 'validateData', data)
const formatted = await engine.executeModuleFunction('sales', 'formatForDisplay', data)

// 🚀 Convenience Methods
const result = await ERP_CORE.calculate('inventory', 'calculateEOQ', 1000, 50, 10)
const isValid = await ERP_CORE.validate('inventory', data)
```

### 🎣 **Hook Registration**
```javascript
// Register event hooks
engine.on('afterCreate', async (type, transaction) => {
  if (type === TRANSACTION_TYPES.SALES) {
    await updateInventoryLevels(transaction)
  }
})

engine.on('beforeUpdate', async (type, data) => {
  await validateBusinessRules(type, data)
})

engine.on('stateChange', async (type, id, oldState, newState) => {
  await notifyStakeholders(type, id, oldState, newState)
})
```

---

## 📋 **MASTERDATA PATTERNS**

### 🗂️ **Standard Module Structure**
```javascript
// module/schema.js
export const MODULE_TYPES = { STANDARD: 'standard', PREMIUM: 'premium' }
export const MODULE_STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' }
export const MODULE_STATES = ['draft', 'active', 'completed']
export const MODULE_TRANSITIONS = {
  'draft': ['active'],
  'active': ['completed'],
  'completed': []
}
export const MODULE_INITIAL_STATE = 'draft'
export const MODULE_STORAGE_KEY = 'erp_module_transactions'

// module/data.js
export const ModuleUtils = {
  validateData(data) { /* validation logic */ },
  calculateSomething(params) { /* business logic */ },
  formatForDisplay(data) { /* formatting */ },
  filterByStatus(data, status) { /* filtering */ }
}

// module/index.js
export default { ...ModuleSchema, ...ModuleData }
```

### 🔗 **Integration with Core**
```javascript
// Import in TransactionTypes.js
import { MODULE_STATES, MODULE_TRANSITIONS } from './masterdata/module/schema.js'

// Use in configurations
export const TRANSACTION_STATES = {
  [TRANSACTION_TYPES.MODULE]: MODULE_STATES
}

export const TRANSACTION_TRANSITIONS = {
  [TRANSACTION_TYPES.MODULE]: MODULE_TRANSITIONS
}
```

---

## 🛡️ **VALIDATION PATTERNS**

### ✅ **Standard Validation**
```javascript
// Basic validation
const validation = TransactionValidator.validateForCreate(type, data)
if (!validation.isValid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
}

// Custom validation with business rules
const customValidation = await CustomValidator.validateBusinessRules(type, data)
if (!customValidation.isValid) {
  return { success: false, error: customValidation.message }
}
```

### 🔄 **State Validation**
```javascript
// Check if state transition is valid
if (!canTransitionTo(type, currentState, newState)) {
  throw new Error(`Cannot transition from ${currentState} to ${newState}`)
}

// Validate state before operations
if (!isValidState(type, data.state)) {
  throw new Error(`Invalid state: ${data.state} for type: ${type}`)
}
```

---

## 📊 **PERFORMANCE PATTERNS**

### ⚡ **Caching**
```javascript
// Manual cache operations
const cached = engine.getFromCache(type, id)
if (cached) return cached

const fresh = await engine.read(type, id)
engine.setCache(type, id, fresh)

// Batch operations
const results = await engine.batchCreate(type, dataArray)
const items = await engine.batchRead(type, idArray)
```

### 📈 **Monitoring**
```javascript
// Get engine metrics
const metrics = engine.getMetrics()
console.log(`Transactions created: ${metrics.created}`)
console.log(`Average response time: ${metrics.avgResponseTime}ms`)

// Get performance stats
const stats = await engine.getStats(TRANSACTION_TYPES.INVENTORY)
console.log(`Total items: ${stats.total}`)
console.log(`Cache hit rate: ${stats.cacheHitRate}%`)
```

---

## 🚨 **ERROR HANDLING PATTERNS**

### 🛡️ **Standard Error Handling**
```javascript
try {
  const result = await engine.create(type, data, userId)
  return { success: true, data: result.data }
} catch (error) {
  console.error(`Operation failed: ${error.message}`)
  return { 
    success: false, 
    error: error.message,
    metadata: { operation: 'create', type, timestamp: Date.now() }
  }
}
```

### 🔄 **Graceful Degradation**
```javascript
// With fallback mechanisms
async function createWithFallback(type, data, userId) {
  try {
    return await engine.create(type, data, userId)
  } catch (error) {
    // Log error and try offline mode
    console.warn(`Online create failed, trying offline: ${error.message}`)
    return await offlineEngine.create(type, data, userId)
  }
}
```

---

## 🎯 **COMMON USE CASES**

### 📦 **Inventory Management**
```javascript
// สร้างสินค้าใหม่
const product = await engine.create(TRANSACTION_TYPES.INVENTORY, {
  sku: 'PRD-001',
  name: 'สินค้าทดสอบ',
  quantity: 100,
  unit_price: 50.00
}, userId)

// จองสินค้า
await engine.updateState(TRANSACTION_TYPES.INVENTORY, productId, 'reserved', userId)

// ปรับปรุงจำนวน
await engine.update(TRANSACTION_TYPES.INVENTORY, productId, {
  quantity: newQuantity,
  updated_reason: 'stock_adjustment'
}, userId)
```

### 💰 **Sales Process**
```javascript
// สร้างใบเสนอราคา
const quotation = await engine.create(TRANSACTION_TYPES.QUOTATION, {
  customer_id: 'CUST-001',
  items: [{ product_id: 'PRD-001', quantity: 5, unit_price: 50 }],
  total_amount: 250.00
}, userId)

// แปลงเป็น Sales Order
await engine.updateState(TRANSACTION_TYPES.QUOTATION, quotation.id, 'accepted', userId)
const salesOrder = await engine.create(TRANSACTION_TYPES.SALES, {
  quotation_id: quotation.id,
  // ... other fields
}, userId)
```

### 🚚 **Delivery Flow**
```javascript
// สร้างใบจัดส่ง
const delivery = await engine.create(TRANSACTION_TYPES.DELIVERY, {
  sales_order_id: salesOrderId,
  delivery_address: address,
  scheduled_date: scheduledDate
}, userId)

// อัพเดทสถานะการจัดส่ง
await engine.updateState(TRANSACTION_TYPES.DELIVERY, delivery.id, 'shipped', userId)
await engine.updateState(TRANSACTION_TYPES.DELIVERY, delivery.id, 'delivered', userId)
```

---

## 🔍 **DEBUGGING HELPERS**

### 📊 **Inspection Commands**
```javascript
// ดู transaction history
const history = engine.getHistory({ type: TRANSACTION_TYPES.INVENTORY, limit: 10 })

// ตรวจสอบ cache status
const cacheInfo = engine.getCacheInfo(TRANSACTION_TYPES.INVENTORY, id)

// ดู active locks
const locks = engine.getActiveLocks()

// ตรวจสอบ hook registrations
const hooks = engine.getRegisteredHooks()
```

### 🐛 **Debug Mode**
```javascript
// เปิด debug logging
engine.setDebugMode(true)

// ดู detailed metrics
const detailedMetrics = engine.getDetailedMetrics()

// Export system state
const systemState = engine.exportSystemState()
```

---

## 🎨 **FRONTEND INTEGRATION**

### 🔌 **Vue.js Integration (Core-Only Pattern)**
```javascript
// ✅ CORRECT: เรียกผ่าน ERP_CORE เท่านั้น
import { ERP_CORE } from '@/extensions/modules/erp/core'
// ❌ NEVER: import module โดยตรง
// import InventoryModule from '@/extensions/modules/erp/core/masterdata/inventory'

export default {
  data() {
    return {
      products: [],
      loading: false,
      error: null
    }
  },
  
  async created() {
    await this.loadProducts()
  },
  
  methods: {
    // ✅ Data operations ผ่าน Core
    async loadProducts() {
      this.loading = true
      try {
        const result = await ERP_CORE.engine.list('inventory', { status: 'active' })
        this.products = result.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async createProduct(productData) {
      // ✅ Validation ผ่าน Core
      const validation = await ERP_CORE.validate('inventory', productData)
      if (!validation.data.isValid) {
        this.$toast.error(validation.data.errors.join(', '))
        return
      }
      
      // ✅ Create ผ่าน Core
      const result = await ERP_CORE.engine.create('inventory', productData, this.userId)
      if (result.success) {
        this.products.push(result.data)
        this.$toast.success('สร้างสินค้าสำเร็จ')
      } else {
        this.$toast.error(result.error)
      }
    },
    
    // ✅ Business logic ผ่าน Core
    async calculateReorderPoint(productId) {
      const product = await ERP_CORE.engine.read('inventory', productId)
      const reorderPoint = await ERP_CORE.calculate('inventory', 'calculateReorderPoint', 
        product.data.avg_demand, product.data.lead_time, product.data.safety_stock
      )
      return reorderPoint.data
    }
  }
}
```

---

## 📚 **CHEAT SHEET**

### 🎯 **Transaction Types**
```javascript
TRANSACTION_TYPES.INVENTORY   // สินค้าคงคลั่ง
TRANSACTION_TYPES.PURCHASE    // การสั่งซื้อ
TRANSACTION_TYPES.SALES       // การขาย
TRANSACTION_TYPES.DELIVERY    // การจัดส่ง
TRANSACTION_TYPES.WORKORDER   // ใบสั่งงาน
TRANSACTION_TYPES.PRODUCTION  // การผลิต
TRANSACTION_TYPES.RETURNS     // การส่งคืน
TRANSACTION_TYPES.QUOTATION   // ใบเสนอราคา
TRANSACTION_TYPES.PAYMENT     // การชำระเงิน
```

### 🎣 **Available Hooks**
```javascript
'beforeCreate'  // ก่อนสร้าง transaction
'afterCreate'   // หลังสร้าง transaction
'beforeUpdate'  // ก่อนอัพเดท
'afterUpdate'   // หลังอัพเดท
'beforeDelete'  // ก่อนลบ
'afterDelete'   // หลังลบ
'stateChange'   // เมื่อเปลี่ยน state
```

### 🚀 **Quick Import**
```javascript
// Complete core import
import { ERP_CORE } from '@/extensions/modules/erp/core'

// Specific imports
import { TRANSACTION_TYPES } from '@/extensions/modules/erp/core/TransactionTypes'
import { TransactionValidator } from '@/extensions/modules/erp/core/TransactionValidator'
```

---

## 🆘 **EMERGENCY COMMANDS**

### 🔥 **System Recovery**
```javascript
// Clear all caches
engine.clearCache()

// Reset engine to clean state
engine.reset()

// Force cache refresh
await engine.refreshCache(type)

// Emergency data export
const backup = await engine.exportAllData()
```

### 🚨 **Debug Emergency**
```javascript
// Enable full logging
engine.setDebugMode(true)
engine.setLogLevel('verbose')

// Check system health
const health = await engine.getSystemHealth()

// Force garbage collection
engine.cleanup()
```

---

*📌 พิมพ์ใส่กรอบแล้วติดไว้ข้างโต๊ะ! 🖨️📋*

---

*📅 Updated: October 2025 | ⚡ Always Current | 🚀 ERP Core Team*
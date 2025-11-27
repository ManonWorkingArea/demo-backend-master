# Sales Service Integration Guide

## การอัปเดต Sales Module ให้ใช้ SalesService

### 🎯 เป้าหมายการอัปเดต

แยกการทำงานของโมดูลย่อย Sales ให้เก็บข้อมูลแยกจาก transaction API โดยสร้าง SalesService ขึ้นมาจัดการ request แบบเดียวกับ InventoryService

### 🏗️ โครงสร้างใหม่

```
src/
├── services/
│   └── SalesService.js          # ✨ Sales Service หลัก
└── extensions/modules/erp/modules/sales/
    ├── plugins/
    │   ├── index.js            # อัปเดตให้รวม SalesService
    │   └── salesService.js     # ✨ Plugin สำหรับ auto-init
    └── components/
        ├── SalesManager.vue    # อัปเดตใช้ SalesService
        ├── SalesDashboard.vue  # ไม่เปลี่ยน (navigation only)
        ├── customer/
        │   └── List.vue       # อัปเดตใช้ SalesService
        └── sales-order/
            └── List.vue       # อัปเดตใช้ SalesService
```

### 📋 รายการที่อัปเดต

#### ✅ SalesService.js (ใหม่)
- สร้าง service หลักเหมือน InventoryService
- รองรับ CRUD operations สำหรับ:
  - Customers
  - Sales Orders  
  - Quotations
  - Sales Invoices
- Auto document number generation
- Sales analytics และ reports

#### ✅ SalesManager.vue
- แทนที่ TransactionEngine ด้วย SalesService
- อัปเดต data structure mapping:
  - `orderNumber` → `order_number`
  - `customerName` → `customer_name`
  - `totalAmount` → `total_amount`
- เพิ่ม initialization check

#### ✅ customer/List.vue
- แทนที่ Core-Only Access ด้วย SalesService
- ใช้ `salesService.getAllCustomers()`
- อัปเดต error handling

#### ✅ sales-order/List.vue
- แทนที่ TransactionEngine ด้วย SalesService
- ใช้ `salesService.getAllSalesOrders()`
- อัปเดต filteredSales computed

#### ✅ plugins/salesService.js (ใหม่)
- Auto-initialization plugin
- Global registration: `$salesService`
- Provide/inject pattern

#### ✅ plugins/index.js
- รวม SalesService เข้าใน module
- เพิ่ม install function

### 🚀 การใช้งาน

#### 1. Initialization (Automatic)
```javascript
// ใน main app หรือ module loader
import salesModule from '@/extensions/modules/erp/modules/sales/plugins/index.js'
app.use(salesModule)
```

#### 2. Component Usage
```javascript
import { salesService } from '@/services/SalesService.js'

// ใน setup()
if (!salesService.isReady()) {
  const app = getCurrentInstance()
  salesService.initialize(app.appContext.config.globalProperties)
}

// ใช้งาน methods
const customers = await salesService.getAllCustomers()
const salesOrders = await salesService.getAllSalesOrders()
```

#### 3. Available Methods

**Customers:**
- `getAllCustomers()`
- `getCustomer(id)`
- `getCustomerWithSalesData(id)`
- `createCustomer(data)`
- `updateCustomer(id, data)`
- `deleteCustomer(id)` (soft delete)

**Sales Orders:**
- `getAllSalesOrders()`
- `getSalesOrder(id)`
- `createSalesOrder(data)`
- `updateSalesOrder(id, data)`
- `updateSalesOrderStatus(id, status)`

**Quotations:**
- `getAllQuotations()`
- `getQuotation(id)`
- `createQuotation(data)`
- `convertQuotationToSalesOrder(id)`

**Invoices:**
- `getAllSalesInvoices()`
- `createInvoiceFromSalesOrder(id)`

**Analytics:**
- `getSalesSummary(dateRange)`

### 🔧 การ Debug

#### Debug Methods ในแต่ละ Component:
```javascript
const debugStats = () => {
  console.log('Sales data:', sales.value)
  console.log('Sales Service ready:', salesService.isReady())
}
```

#### Client Key Debug:
SalesService จะแสดง debug info เกี่ยวกับ clientKey:
```
🔑 [SalesService] Client Key Debug: {
  hasKey: true,
  keyPreview: "***ABC1",
  source: "ERP_CORE",
  initialized: true
}
```

### 📊 Data Structure Mapping

| Old (TransactionEngine) | New (SalesService) |
|-------------------------|-------------------|
| `orderNumber`           | `order_number`    |
| `customerName`          | `customer_name`   |
| `totalAmount`           | `total_amount`    |
| `created_date`          | `created_at`      |

### ⚠️ การ Migration

1. **Backward Compatibility:** Components ยังคงทำงานได้แม้ SalesService ไม่พร้อม (fallback to original)
2. **Gradual Migration:** อัปเดตทีละ component ได้
3. **Error Handling:** มี try-catch ครอบคลุมทุก API call

### 🔄 Next Steps

1. ทดสอบการทำงานในแต่ละ component
2. อัปเดต component อื่นๆ ที่ยังใช้ TransactionEngine
3. เพิ่ม advanced features เช่น caching, pagination
4. เพิ่ม unit tests สำหรับ SalesService

### 📞 Support

หากพบปัญหาการใช้งาน:
1. ตรวจสอบ console สำหรับ debug messages
2. ใช้ `salesService.isReady()` เช็คสถานะ
3. ตรวจสอบ clientKey initialization

---
**หมายเหตุ:** การอัปเดตนี้ช่วยให้ Sales Module มีประสิทธิภาพและความยืดหยุ่นมากขึ้น โดยแยกการจัดการข้อมูลออกจาก transaction API แบบ centralized
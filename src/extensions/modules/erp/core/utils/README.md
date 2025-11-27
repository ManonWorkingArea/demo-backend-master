# ERP Utils - Centralized Business Utilities

## 🎯 Overview

ERP Utils เป็นชุด utilities ที่รวมศูนย์ไว้ใน ERP Core เพื่อจัดการคำนวณและฟังก์ชันทางธุรกิจต่างๆ ให้เป็นมาตรฐานทั้งระบบ

## 📦 Structure

```
core/
└── utils/
    ├── index.js              # Main export file
    ├── deliveryUtils.js      # Delivery calculations
    ├── salesUtils.js         # Sales calculations  
    ├── inventoryUtils.js     # Inventory management
    ├── financeUtils.js       # Financial calculations
    ├── productionUtils.js    # Production planning
    └── generalUtils.js       # General utilities
```

## 🚀 Usage Patterns

### Method 1: Import from ERP Core (Recommended)

```javascript
import { ERP_CORE } from '@/extensions/modules/erp/core'

// Access utils through core
const { delivery, sales, general } = ERP_CORE.utils

// Use utilities
const shippingCost = delivery.calculateShippingCost({
  weight: 10,
  volume: 0.1,
  shippingMethod: 'delivery'
})

const formattedPrice = general.formatCurrency(1500)
const orderTotal = sales.calculateOrderTotal(items, { taxRate: 0.07 })
```

### Method 2: Direct Import (Alternative)

```javascript
import { delivery, sales, general } from '@/extensions/modules/erp/core/utils'

// Direct usage
const result = delivery.calculateShippingCost(options)
```

### Method 3: Complete Utils Object

```javascript
import { ERP_UTILS } from '@/extensions/modules/erp/core'

// Access all utils
const deliveryResult = ERP_UTILS.delivery.calculateShippingCost(options)
const salesResult = ERP_UTILS.sales.calculateOrderTotal(items)
```

## 🔧 Available Modules

### 📦 Delivery Utils
- `calculateShippingCost()` - คำนวณค่าขนส่ง
- `calculateDeliveryTime()` - คำนวณเวลาจัดส่ง
- `calculatePackageMetrics()` - คำนวณน้ำหนักและปริมาตร
- `calculatePackagingCost()` - คำนวณค่าบรรจุภัณฑ์

### 💰 Sales Utils
- `calculateOrderTotal()` - คำนวณยอดรวมคำสั่งซื้อ
- `calculateCommission()` - คำนวณค่าคอมมิชชั่น
- `calculateDiscount()` - คำนวณส่วนลด
- `validateOrder()` - ตรวจสอบความถูกต้องของคำสั่งซื้อ

### 📊 Inventory Utils  
- `calculateStockLevels()` - คำนวณระดับสต็อก
- `calculateABCAnalysis()` - วิเคราะห์ ABC
- `calculateInventoryTurnover()` - อัตราการหมุนเวียนสต็อก
- `calculateEOQ()` - Economic Order Quantity

### 💳 Finance Utils
- `calculateFinancialRatios()` - อัตราส่วนทางการเงิน
- `calculateCashFlowProjection()` - ประมาณการกระแสเงินสด
- `calculateBreakEvenAnalysis()` - จุดคุ้มทุน
- `calculateNPV()` - Net Present Value

### 🏭 Production Utils
- `calculateProductionCapacity()` - กำลังการผลิต
- `calculateOEE()` - Overall Equipment Effectiveness
- `calculateMRP()` - Material Requirements Planning
- `calculateWIPMetrics()` - Work In Progress metrics

### 🛠️ General Utils
- `formatCurrency()` - จัดรูปแบบเงิน
- `formatDate()` - จัดรูปแบบวันที่
- `generateReferenceNumber()` - สร้างเลขอ้างอิง
- `validateEmail()` - ตรวจสอบอีเมล
- `validateThaiPhone()` - ตรวจสอบเบอร์โทรไทย

## 💡 Benefits

### 🎯 Centralized Management
- จัดการ utilities ทั้งหมดในที่เดียว
- ใช้งานผ่าน ERP Core เป็นมาตรฐาน
- ง่ายต่อการบำรุงรักษา

### 📦 Tree Shaking Support
```javascript
// โหลดเฉพาะที่ต้องการ
import { delivery, general } from '@/extensions/modules/erp/core/utils'

// ไม่โหลดโมดูลที่ไม่ได้ใช้
// sales, inventory, finance, production จะไม่ถูกรวมใน bundle
```

### 🚀 Performance Optimization
- Bundle size เล็กลงด้วย tree shaking
- ฟังก์ชันที่ได้รับการปรับให้เหมาะสม
- Cache-friendly โดยการรวมศูนย์

### 🔄 Consistent API
- รูปแบบการเรียกใช้เหมือนกันทุกโมดูล
- Error handling ที่เป็นมาตรฐาน
- Documentation ครบถ้วน

## 🔄 Migration from Old Utils

### Before (Old Structure)
```javascript
// แบบเดิม - import จาก utils folder
import { delivery } from '@/extensions/modules/erp/utils'
import { sales } from '@/extensions/modules/erp/utils'
import { general } from '@/extensions/modules/erp/utils'
```

### After (New Structure)
```javascript
// แบบใหม่ - import จาก core
import { ERP_CORE } from '@/extensions/modules/erp/core'
const { delivery, sales, general } = ERP_CORE.utils

// หรือ import ตรง
import { delivery, sales, general } from '@/extensions/modules/erp/core/utils'
```

## 🎯 Example: Delivery Module Integration

```javascript
// DeliveryManager.vue
import { ERP_CORE } from '@/extensions/modules/erp/core'
const { delivery, general } = ERP_CORE.utils

export default {
  setup() {
    // ใช้ general utils สำหรับ formatting
    const formatCurrency = (amount) => general.formatCurrency(amount)
    const formatDate = (date) => general.formatDate(date, 'long')
    
    // ใช้ delivery utils สำหรับการคำนวณ
    const calculateShipping = (options) => {
      return delivery.calculateShippingCost(options)
    }
    
    return {
      formatCurrency,
      formatDate,
      calculateShipping
    }
  }
}
```

## 📈 Future Enhancements

### 🔮 Planned Features
- Real-time calculations with WebWorkers
- Advanced caching strategies  
- Plugin architecture for custom utils
- Integration with external APIs

### 🎯 Module Expansion
- CRM utilities
- HR utilities  
- Marketing utilities
- Analytics utilities

---

## 📞 Support

สำหรับคำถามหรือปัญหาเกี่ยวกับ ERP Utils:
1. ดู documentation ใน code comments
2. ตรวจสอบ usage examples
3. ทดสอบใน development environment

**Happy calculating! 🧮✨**
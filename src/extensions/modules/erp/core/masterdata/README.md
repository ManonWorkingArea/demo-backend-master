# Master Data - Organized Structure

โครงสร้างใหม่ของ Master Data ที่จัดระเบียบแล้ว เพื่อความสะดวกในการบำรุงรักษาและพัฒนา

## โครงสร้างไฟล์

```
masterdata/
├── README.md                    # เอกสารนี้
│
├── base/                        # ✅ โมดูลพื้นฐาน (Base Schema & Utils)
│   ├── schema.js               # Base constants, types, schema structure
│   ├── data.js                 # Base functions, validation, formatters
│   └── index.js                # Base module exports
│
├── document/                    # ✅ โมดูลเอกสาร (Receipt, Tax Invoice, etc.)
│   ├── schema.js               # Document types, schemas, transaction fields
│   ├── data.js                 # Document functions, validation, calculations
│   └── index.js                # Document module exports
│
├── inventory/                   # ✅ จัดระเบียบแล้ว
│   ├── schema.js               # ค่าคงที่ และ enums
│   ├── data.js                 # ข้อมูลหลัก และ helper functions
│   └── index.js                # ดัชนีของ inventory
│
├── purchase/                    # ✅ จัดระเบียบแล้ว
│   ├── schema.js               # ค่าคงที่ และ enums
│   ├── data.js                 # ข้อมูลหลัก และ helper functions
│   └── index.js                # ดัชนีของ purchase
│
├── sales/                       # ✅ จัดระเบียบแล้ว
│   ├── schema.js               # ค่าคงที่ และ enums
│   ├── data.js                 # ข้อมูลหลัก และ helper functions
│   └── index.js                # ดัชนีของ sales
│
├── delivery/                    # ✅ จัดระเบียบแล้ว
├── workorder/                   # ✅ จัดระเบียบแล้ว
├── production/                  # ✅ จัดระเบียบแล้ว
├── returns/                     # ✅ จัดระเบียบแล้ว
├── quotation/                   # ✅ จัดระเบียบแล้ว
└── payment/                     # ✅ จัดระเบียบแล้ว
```

## การใช้งาน

### แบบใหม่ (Organized Structure)

```javascript
// Import Base Module
import BaseModule from './masterdata/base/index.js'
import DocumentModule from './masterdata/document/index.js'

// Import ทั้งโมดูล
import InventoryMasterData from './masterdata/inventory/index.js'
import PurchaseMasterData from './masterdata/purchase/index.js'

// Import เฉพาะที่ต้องการ
import { INVENTORY_TYPES, STOCK_STATUS } from './masterdata/inventory/schema.js'
import { DOCUMENT_TYPES, RECEIPT_SCHEMA_STRUCTURE } from './masterdata/document/schema.js'
import { InventoryMasterData } from './masterdata/inventory/data.js'

// ใช้งาน
const label = InventoryMasterData.getInventoryTypeLabel(INVENTORY_TYPES.FINISHED_GOODS)
const eoq = InventoryMasterData.calculateEOQ(1000, 50, 10)
```

### แบบเดิม (Legacy - ยังใช้งานได้)

```javascript
// Import จาก index หลัก
import { InventoryMasterData, PurchaseMasterData } from './masterdata/index.js'

// หรือ import แต่ละไฟล์
import { SalesMasterData } from './masterdata/SalesMasterData.js'
```

### แบบรวม (Mixed)

```javascript
// Import จาก index ใหม่
import MasterData from './masterdata/index-new.js'

// ใช้งาน
const inventory = MasterData.inventory
const purchase = MasterData.purchase
const utils = MasterData.utils

// ตรวจสอบโครงสร้าง
if (utils.isOrganizedStructure('inventory')) {
  console.log('Inventory ใช้โครงสร้างใหม่แล้ว')
}
```

## ประโยชน์ของโครงสร้างใหม่

### ✅ การจัดระเบียบที่ดีขึ้น
- แยกไฟล์ตามประเภทธุรกรรม
- แยก schema (ค่าคงที่) กับ data (ฟังก์ชัน)
- ง่ายต่อการค้นหาและแก้ไข

### ✅ การบำรุงรักษาที่ง่ายขึ้น
- แก้ไขค่าคงที่ที่ `schema.js`
- แก้ไขฟังก์ชันที่ `data.js`
- ไม่ต้องค้นหาในไฟล์ใหญ่

### ✅ การขยายระบบ
- เพิ่มประเภทธุรกรรมใหม่ได้ง่าย
- เพิ่มฟังก์ชันใหม่โดยไม่กระทบเดิม
- รองรับการทำงานร่วมกันของทีม

### ✅ Backward Compatibility
- ไฟล์เก่ายังใช้งานได้
- ย้ายทีละส่วนได้
- ไม่ต้องแก้โค้ดเดิมทั้งหมด

## แผนการย้าย (Migration Plan)

### ✅ เสร็จสิ้นแล้วทั้งหมด (100% Complete)
- [x] สร้างโครงสร้างโฟลเดอร์ 11 โมดูล
- [x] ย้าย Base Module (โครงสร้างพื้นฐาน)
- [x] ย้าย Document Module (เอกสาร และ Transaction Fields)
- [x] ย้าย Inventory (สินค้าคงคลัง)
- [x] ย้าย Purchase (การสั่งซื้อ)
- [x] ย้าย Sales (การขาย)
- [x] ย้าย Delivery (การจัดส่ง)
- [x] ย้าย WorkOrder (ใบสั่งงาน)
- [x] ย้าย Production (การผลิต)
- [x] ย้าย Returns (การส่งคืน)
- [x] ย้าย Quotation (ใบเสนอราคา)
- [x] ย้าย Payment (การชำระเงิน)
- [x] อัพเดท TransactionSchema.js ให้ใช้ SOT
- [x] ลบไฟล์เก่าที่ไม่ใช้แล้ว
- [x] กำจัด hardcode ทั้งหมด

## 🎉 ระบบพร้อมใช้งาน (Production Ready)

### ✅ Single Source of Truth (SOT) Architecture
- masterdata เป็น SOT สำหรับ schemas และ business logic ทั้งหมด
- TransactionSchema.js ใช้ข้อมูลจาก masterdata modules
- ไม่มี hardcode เหลืออยู่ในระบบ

### ✅ Clean Architecture
- 11 โมดูลที่จัดระเบียบแล้ว
- โคร้งสร้างสม่ำเสมอ: schema.js / data.js / index.js
- แยกหน้าที่ชัดเจน: constants vs functions

## ตัวอย่างการใช้งาน

### Inventory Management

```javascript
import { 
  INVENTORY_TYPES, 
  STOCK_STATUS, 
  InventoryMasterData 
} from './masterdata/inventory/index.js'

// ใช้ constants
const productType = INVENTORY_TYPES.FINISHED_GOODS
const stockStatus = STOCK_STATUS.AVAILABLE

// ใช้ helper functions
const label = InventoryMasterData.getInventoryTypeLabel(productType)
const eoq = InventoryMasterData.calculateEOQ(1000, 50, 10)
const reorderPoint = InventoryMasterData.calculateReorderPoint(10, 7, 20)

// Validate data
const validation = InventoryMasterData.validateInventoryData({
  sku: 'PRD-001',
  product_name: 'สินค้าทดสอบ',
  quantity: 100
})
```

### Document Management

```javascript
import { 
  DOCUMENT_TYPES, 
  RECEIPT_SCHEMA_STRUCTURE,
  DocumentUtils 
} from './masterdata/document/index.js'

// สร้างเอกสาร
const documentNumber = DocumentUtils.generateDocumentNumber(DOCUMENT_TYPES.RECEIPT)
const totalAmount = DocumentUtils.calculateDocumentValues(lineItems)
```

### Purchase Management

```javascript
import { 
  PURCHASE_TYPES, 
  PURCHASE_STATUS, 
  PurchaseMasterData 
} from './masterdata/purchase/index.js'

// สร้างเลข PO
const poNumber = PurchaseMasterData.generatePurchaseOrderNumber(
  PURCHASE_TYPES.STANDARD, 
  1
)

// คำนวณยอดรวม
const totals = PurchaseMasterData.calculatePurchaseTotals([
  { quantity: 10, unit_price: 100 },
  { quantity: 5, unit_price: 200 }
], 5, 7) // ส่วนลด 5%, ภาษี 7%
```

## คำแนะนำสำหรับนักพัฒนา

1. **ใช้โครงสร้างใหม่สำหรับโค้ดใหม่**: เริ่มใช้ organized structure สำหรับการพัฒนาใหม่

2. **ค่อย ๆ ย้ายโค้ดเก่า**: ไม่ต้องรีบย้ายทั้งหมด ทำทีละส่วน

3. **ตรวจสอบ import paths**: ใช้ utils.isOrganizedStructure() เพื่อตรวจสอบ

4. **เขียนเทส**: สร้างเทสสำหรับ helper functions ใหม่

5. **อัพเดทเอกสาร**: อัพเดทเอกสารเมื่อย้ายโมดูลเสร็จ

## การทดสอบ

```javascript
// ทดสอบโครงสร้างใหม่
import { MasterDataUtils } from './masterdata/index-new.js'

console.log('Organized types:', MasterDataUtils.getOrganizedTransactionTypes())
console.log('Legacy types:', MasterDataUtils.getLegacyTransactionTypes())
console.log('Is inventory organized?', MasterDataUtils.isOrganizedStructure('inventory'))
```

---

## 📚 **DEVELOPER RESOURCES**

### 📖 **Complete Documentation**
- [**📁 DOCS FOLDER**](../docs/) - Complete documentation suite
- [**SUMMARY**](../docs/SUMMARY.md) - Quick overview of all rules ⚡
- [**AI GUIDELINES**](../docs/AI_GUIDELINES.md) - Rules for AI assistants 🤖
- [**CORE RULES**](../docs/CORE_RULES.md) - Architecture principles 🛡️
- [**QUICK REFERENCE**](../docs/QUICK_REFERENCE.md) - Daily development guide 🚀

### 🎭 **Developer Personas**
- 🏗️ **Core Architect** - ผู้พิทักษ์สถาปัตยกรรม
- 🧩 **Module Developer** - ผู้สร้างโมดูล
- 🌊 **Workflow Engineer** - ผู้จัดการ Business Process
- 🎨 **Frontend Integrator** - ผู้เชื่อมต่อ UI

### ⚡ **Quick Start**
```javascript
// Import ERP Core
import { ERP_CORE, TRANSACTION_TYPES } from '../core'

// Create transaction
const result = await ERP_CORE.engine.create(
  TRANSACTION_TYPES.INVENTORY, 
  data, 
  userId
)
```

*📅 Updated: October 2025 | 🔄 Version: 1.0 | 👨‍💻 Team: ERP Core*
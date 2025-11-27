# Sales Code Sequence Management Guide

## การจัดการรหัสเอกสารระบบขาย

### 🎯 ภาพรวมระบบ

ระบบจัดการรหัสเอกสารสำหรับ Sales Module ได้รับการพัฒนาให้ใช้ Code Manager แบบเดียวกับระบบ Purchase โดยรองรับเอกสารต่อไปนี้:

1. **Quotation (QT)** - ใบเสนอราคา
2. **Sales Order (SO)** - ใบสั่งขาย
3. **Sales Invoice (INV)** - ใบแจ้งหนี้
4. **Tax Invoice (TAX)** - ใบกำกับภาษี
5. **Delivery Note (DN)** - ใบส่งของ
6. **Receipt (RCP)** - ใบรับเงิน

### 📋 รูปแบบเลขที่เอกสาร

#### รูปแบบมาตรฐาน:
```
{prefix}{year}{month}{sequence}
```

#### ตัวอย่าง:
- `QT25110001` - ใบเสนอราคาลำดับที่ 1 เดือน พ.ย. 2025
- `SO25110001` - ใบสั่งขายลำดับที่ 1 เดือน พ.ย. 2025
- `INV25110001` - ใบแจ้งหนี้ลำดับที่ 1 เดือน พ.ย. 2025
- `TAX25110001` - ใบกำกับภาษีลำดับที่ 1 เดือน พ.ย. 2025

### ⚙️ การตั้งค่า Code Patterns

#### Default Patterns:
```javascript
{
  quotation: {
    prefix: 'QT',
    year: true,
    month: true,
    sequence: { digits: 4, start: 1, resetOnYearChange: true },
    format: '{prefix}{year}{month}{sequence}'
  },
  sales_order: {
    prefix: 'SO',
    year: true, 
    month: true,
    sequence: { digits: 4, start: 1, resetOnYearChange: true },
    format: '{prefix}{year}{month}{sequence}'
  }
  // ... และอื่นๆ
}
```

#### Alternative Patterns:
```javascript
// ใช้ปี 4 หลัก
quotation_full_year: {
  format: '{prefix}{year}{sequence}',
  example: 'QT202500001'
}

// รวมรหัสสาขา
invoice_with_branch: {
  format: '{prefix}{branch}{year}{month}{sequence}',
  example: 'INV0125110001'
}
```

### 🚀 การใช้งาน

#### 1. การสร้างเอกสารผ่าน SalesService

```javascript
// สร้างใบเสนอราคา
const quotationData = {
  customer_id: 'customer123',
  items: [...],
  // quote_number จะถูก generate อัตโนมัติ
}

const quotation = await salesService.createQuotation(quotationData)
console.log('Generated quote number:', quotation.quote_number)
```

#### 2. การ Generate หมายเลขเอกสารแยก

```javascript
// Generate หมายเลขใบเสนอราคา
const quoteNumber = await salesService.generateQuotationNumber()

// Generate หมายเลขใบสั่งขาย
const orderNumber = await salesService.generateSalesOrderNumber()

// Generate หมายเลขใบแจ้งหนี้
const invoiceNumber = await salesService.generateInvoiceNumber()

// Generate หมายเลขใบกำกับภาษี
const taxInvoiceNumber = await salesService.generateTaxInvoiceNumber()
```

#### 3. การ Generate ด้วยข้อมูลเพิ่มเติม

```javascript
const customData = {
  branch_code: '01',
  department: 'SALES',
  // ... ข้อมูลอื่นๆ
}

const orderNumber = await salesService.generateSalesOrderNumber(customData)
```

#### 4. การใช้งานผ่าน Global Helpers

```javascript
// ใน Vue component
const quoteNumber = await this.$salesHelpers.generateQuotationNumber()

// Debug code patterns
const patterns = await this.$salesHelpers.debugCodePatterns()

// ทดสอบการ generate code
const testCodes = await this.$salesHelpers.testCodeGeneration()
```

### 🔧 การตั้งค่าและจัดการ

#### 1. Auto-Initialization

Code patterns จะถูก initialize อัตโนมัติเมื่อ Sales Module โหลด:

```javascript
// ใน plugin installation
app.use(salesModule) // จะ auto-init patterns
```

#### 2. Manual Initialization

```javascript
import { SalesCodeInitializer } from '@/extensions/modules/erp/modules/sales/config/codeInitializer.js'

const initializer = new SalesCodeInitializer()

// Initialize ทุก patterns
await initializer.initializeSalesPatterns()

// ตรวจสอบ patterns ที่ติดตั้งแล้ว
const verification = await initializer.verifySalesPatterns()

// Reset sequences (ระวัง!)
await initializer.resetSalesSequences()
```

#### 3. การตั้งค่าใหม่ผ่าน CodeManager

```javascript
// เข้าถึง CodeManager
const codeManager = window.ERP_CORE.codeManager

// อัปเดต pattern
await codeManager.updatePattern('quotation', {
  prefix: 'QUOTE',
  year: true,
  month: false,
  sequence: { digits: 5, start: 1 }
})

// สร้าง pattern ใหม่
await codeManager.addPattern('credit_note', {
  prefix: 'CN',
  year: true,
  month: true,
  sequence: { digits: 4, start: 1 }
})
```

### 💾 Database Storage

#### Sequence Management Collection:
```javascript
{
  module: 'quotation',
  prefix: 'QT',
  year: '2025',
  current_sequence: 15,
  last_generated_code: 'QT25110015',
  last_updated: '2025-11-08T10:30:00Z'
}
```

#### Code Patterns Collection:
```javascript
{
  module: 'sales_order',
  name: 'ใบสั่งขาย',
  prefix: 'SO',
  format: '{prefix}{year}{month}{sequence}',
  active: true,
  created_at: '2025-11-08T09:00:00Z',
  updated_at: '2025-11-08T10:30:00Z'
}
```

### 🔍 การตรวจสอบและ Debug

#### 1. Console Commands:

```javascript
// ตรวจสอบ CodeManager
console.log('CodeManager ready:', !!window.ERP_CORE?.codeManager)

// ตรวจสอบ Sales patterns
const patterns = window.ERP_CORE.codeManager.patterns
console.log('Sales patterns:', 
  Array.from(patterns.keys()).filter(k => 
    ['quotation', 'sales_order', 'sales_invoice', 'tax_invoice'].includes(k)
  )
)

// Generate test codes
for (const module of ['quotation', 'sales_order']) {
  const code = await window.ERP_CORE.codeManager.generateCode(module)
  console.log(`${module}:`, code)
}
```

#### 2. API Verification:

```javascript
// ตรวจสอบผ่าน SalesService
const isReady = salesService.isReady()
const testQuote = await salesService.generateQuotationNumber()
const testOrder = await salesService.generateSalesOrderNumber()

console.log('SalesService ready:', isReady)
console.log('Test codes:', { testQuote, testOrder })
```

### ⚠️ การ Troubleshooting

#### ปัญหาที่อาจเกิดขึ้น:

1. **CodeManager ไม่พร้อม**
   ```
   ⚠️ [SalesService] Using fallback quotation number: QT25110001
   ```
   **แก้ไข:** รอให้ CodeManager initialize หรือใช้ manual initialization

2. **Pattern ไม่ถูกติดตั้ง**
   ```
   ❌ Pattern not found for module: quotation
   ```
   **แก้ไข:** ใช้ `SalesCodeInitializer.initializeSalesPatterns()`

3. **Sequence ซ้ำกัน**
   ```
   🔒 Sequence generation already in progress for quotation (5432ms)
   ```
   **แก้ไข:** รอให้ sequence lock หมดอายุ หรือ restart service

### 📚 ไฟล์ที่เกี่ยวข้อง

```
src/
├── services/
│   └── SalesService.js                    # Method generation ใหม่
└── extensions/modules/erp/modules/sales/
    ├── config/
    │   ├── codePatterns.js               # Pattern definitions
    │   └── codeInitializer.js            # Initialization helpers
    └── plugins/
        ├── index.js                      # Updated with code management
        └── salesService.js               # Updated with auto-init
```

### 🎯 สรุปการใช้งาน

1. **Auto-Generation:** หมายเลขเอกสารจะถูก generate อัตโนมัติ
2. **Flexible Patterns:** รองรับการปรับแต่งรูปแบบได้หลากหลาย  
3. **Sequence Management:** จัดการลำดับเลขที่อัตโนมัติ
4. **Fallback Support:** มี fallback เมื่อ CodeManager ไม่พร้อม
5. **Database Integration:** บันทึก sequence ลงฐานข้อมูล
6. **Debug Support:** มี tools สำหรับตรวจสอบและ debug

---

**การใช้งานนี้ทำให้ Sales Module มีระบบจัดการรหัสเอกสารที่สมบูรณ์และยืดหยุ่นเหมือนกับ Purchase Module** 🚀
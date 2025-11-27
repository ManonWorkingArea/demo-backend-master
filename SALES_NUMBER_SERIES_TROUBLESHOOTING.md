# Sales Module Number Series Integration Guide
## คู่มือแก้ปัญหา Sales module ไม่ปรากฏใน Number Series

### 🔍 **ปัญหา: Sales module ไม่ปรากฏในหน้า Number Series**

เมื่อเข้าไปดูหน้า Number Series (`/accounting/settings/number-series`) แต่ไม่เห็น Sales module หรือไม่เห็นการตั้งค่าต่าง ๆ ของ Sales

---

## 🚀 **วิธีแก้ไข**

### **1. ตรวจสอบการลงทะเบียน Sales Module**

เปิด Browser Console และรันคำสั่งเหล่านี้:

```javascript
// ตรวจสอบสถานะการลงทะเบียน
window.SalesAutoLoader.debug.checkRegistrationStatus()

// ดูรายการ modules ที่ลงทะเบียนแล้ว
window.SalesAutoLoader.debug.listMasterDataModules()
```

### **2. บังคับลงทะเบียนใหม่**

หาก Sales module ไม่ปรากฏ ให้บังคับลงทะเบียนใหม่:

```javascript
// บังคับลงทะเบียนใหม่
window.SalesAutoLoader.debug.forceRegister()

// หรือ
window.SalesAutoLoader.reinitialize()
```

### **3. รีโหลดหน้า Number Series**

หลังจากลงทะเบียนแล้ว:

```javascript
// รีโหลดข้อมูลใน Number Series component
if (this.loadModules) {
  await this.loadModules()
} else {
  // หรือรีโหลดหน้าเว็บ
  location.reload()
}
```

---

## 🔧 **การตรวจสอบแบบละเอียด**

### **ตรวจสอบ ERP_CORE**

```javascript
// ตรวจสอบ ERP_CORE
console.log('ERP_CORE available:', !!window.ERP_CORE)
console.log('masterdata available:', !!window.ERP_CORE?.masterdata)

// ดูรายการ modules
if (window.ERP_CORE?.masterdata) {
  console.log('Available modules:', Object.keys(window.ERP_CORE.masterdata))
}

// ตรวจสอบ sales module
console.log('Sales module:', window.ERP_CORE?.masterdata?.sales)
```

### **ตรวจสอบ Sales Code Config**

```javascript
// ตรวจสอบ SALES_CODE_CONFIG
const salesConfig = window.ERP_CORE?.masterdata?.sales?.SALES_CODE_CONFIG
console.log('Sales Code Config:', salesConfig)

if (salesConfig?.patterns) {
  console.log('Sales patterns:', Object.keys(salesConfig.patterns))
}
```

---

## 📋 **Expected Output ที่ถูกต้อง**

เมื่อ Sales module ถูกลงทะเบียนถูกต้อง คุณควรเห็น:

### **1. ใน Console**
```
✅ [Sales Auto-Init] Sales module registered to ERP_CORE.masterdata
📋 [Sales Auto-Init] Available patterns: default,quotation,sales_order,sales_invoice,tax_invoice,receipt,delivery_note
```

### **2. ใน Number Series**
- **Sales - การขาย** จะปรากฏในรายการ modules
- เมื่อคลิก expand จะเห็น sub-patterns:
  - Quotation - ใบเสนอราคา (QT)
  - Sales Order - ใบสั่งขาย (SO)  
  - Invoice - ใบแจ้งหนี้ (INV)
  - Tax Invoice - ใบกำกับภาษี (TAX)
  - Receipt - ใบรับเงิน (RCP)
  - Delivery Note - ใบส่งของ (DN)

### **3. Debug Status Check**
```javascript
{
  hasERPCore: true,
  hasMasterData: true,
  hasSales: true,
  hasCodeConfig: true,
  patterns: ["default", "quotation", "sales_order", "sales_invoice", "tax_invoice", "receipt", "delivery_note"]
}
```

---

## ⚠️ **Troubleshooting**

### **Sales module ยังไม่ปรากฏ**

1. **ตรวจสอบการโหลด plugin**
   ```javascript
   // ดูว่า SalesService plugin ถูกโหลดหรือไม่
   console.log('Sales Service:', this.$salesService)
   console.log('Sales Debug:', this.$salesDebug)
   ```

2. **Manual registration**
   ```javascript
   // ลงทะเบียนด้วยตนเอง
   const { registerSalesToMasterData } = await import('@/extensions/modules/erp/modules/sales/config/autoInit.js')
   registerSalesToMasterData()
   ```

3. **ตรวจสอบ Import paths**
   - ตรวจสอบว่า auto-loader ถูกเรียกใน main.js หรือไม่
   - ตรวจสอบ path ของ Sales module

### **Module ปรากฏแต่ไม่มี sub-patterns**

1. **ตรวจสอบ pattern structure**
   ```javascript
   const patterns = window.ERP_CORE?.masterdata?.sales?.SALES_CODE_CONFIG?.patterns
   console.log('Pattern structure:', patterns)
   
   // ควรมี patterns ทั้งหมดนี้
   ['default', 'quotation', 'sales_order', 'sales_invoice', 'tax_invoice', 'receipt', 'delivery_note']
   ```

2. **Re-register with correct structure**
   ```javascript
   window.SalesAutoLoader.debug.unregister()
   window.SalesAutoLoader.debug.forceRegister()
   ```

---

## 🎯 **การทดสอบ**

### **Test Script สำหรับ Browser Console**

```javascript
// Complete test script
async function testSalesIntegration() {
  console.log('🧪 Testing Sales Module Integration...')
  
  // 1. Check registration
  const status = window.SalesAutoLoader.debug.checkRegistrationStatus()
  console.log('1. Registration Status:', status)
  
  if (!status.hasSales) {
    console.log('2. Forcing registration...')
    window.SalesAutoLoader.debug.forceRegister()
  }
  
  // 3. Check patterns
  const patterns = window.ERP_CORE?.masterdata?.sales?.SALES_CODE_CONFIG?.patterns
  console.log('3. Available Patterns:', Object.keys(patterns || {}))
  
  // 4. Test in Number Series context
  if (window.location.pathname.includes('number-series')) {
    console.log('4. Reloading Number Series...')
    if (typeof this !== 'undefined' && this.loadModules) {
      await this.loadModules()
      console.log('✅ Number Series reloaded')
    } else {
      console.log('⚠️ Please manually refresh the page')
    }
  }
  
  console.log('🎉 Sales Module Integration Test Complete!')
  return status
}

// Run test
testSalesIntegration()
```

---

## 📚 **เอกสารอ้างอิง**

- **Sales Code Patterns**: `/modules/sales/config/codePatterns.js`
- **Auto Initialization**: `/modules/sales/config/autoInit.js`
- **Sales Plugin**: `/modules/sales/plugins/salesService.js`
- **Number Series Component**: `/accounting/components/number-series/List.vue`

---

## 💡 **Tips**

1. **เรียก debug helpers ได้ทุกที่**:
   ```javascript
   window.SalesAutoLoader.debug.checkRegistrationStatus()
   ```

2. **Force reload ทุกอย่าง**:
   ```javascript
   window.SalesAutoLoader.reinitialize()
   location.reload()
   ```

3. **ตรวจสอบ Console เสมอ** เพื่อดู error หรือ warning messages

4. **ใช้ Browser DevTools** เพื่อดู network requests และ component state

---

*📅 Updated: November 2024 | 🔧 Version: 1.0 | 👨‍💻 Sales Module Team*
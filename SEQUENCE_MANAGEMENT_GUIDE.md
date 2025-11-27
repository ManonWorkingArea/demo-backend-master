# 📋 Sequence Management System - Complete Guide

**เอกสารสรุปการทำระบบ Auto-Increment Code ที่ถูกต้อง**  
**วันที่อัพเดท:** 8 พฤศจิกายน 2025  
**Status:** ✅ แก้ไขเสร็จสมบูรณ์สำหรับ Product Module

---

## 📌 ภาพรวมของปัญหา

### ❌ ปัญหาที่พบในระบบเดิม

1. **Sequence ไม่ถูกบันทึกลง Database**
   - รหัสสินค้าเริ่มต้นที่ 1 เสมอ แม้จะมีการสร้างสินค้าไปแล้ว
   - ทุกครั้งที่ Refresh หน้า sequence รีเซ็ตกลับไปเป็น 1

2. **Year Duplication Bug**
   - รหัสที่สร้างออกมาเป็น `FB20252025000012` แทนที่จะเป็น `FB2025000012`
   - สาเหตุ: Database เก็บ sequence เป็น `2025000001` (year+sequence) แทนที่จะเป็น `1` (pure sequence)

3. **Extraction Logic ผิดพลาด**
   - ใช้ `.replace(year, '')` ซึ่งลบเฉพาะการเจอครั้งแรก
   - ถ้ามี "2025" ปรากฏ 2 ครั้ง จะลบได้แค่ครั้งเดียว

4. **ระบบอื่นๆ ยังไม่มี Sequence Update**
   - Purchase Request และ Supplier ใช้ CodeManager แต่ไม่ update sequence กลับ database

---

## ✅ สถาปัตยกรรมที่ถูกต้อง

### 🗂️ Database Structure (erp_corporate_config)

```json
{
  "config_key": "number_series.product",
  "config_data": {
    "prefix": "FB",
    "format": "FB{year}{sequence}",
    "sequence": {
      "digits": 6,
      "current": 1,        // ✅ PURE sequence number (ไม่มีปีเจือปน)
      "next": 2,           // ✅ PURE sequence number + 1
      "lastUpdated": "2025-11-08T10:30:00.000Z"
    }
  }
}
```

**🔑 หลักการสำคัญ:**
- `current` และ `next` ต้องเก็บเป็น **PURE SEQUENCE NUMBER** เท่านั้น (1, 2, 3, ...)
- **ห้าม** เก็บค่าที่มีปีเจือปน (2025000001 ❌)
- ปี (`{year}`) เป็นเพียง **placeholder** ในการสร้างรหัส ไม่ใช่ส่วนของ sequence

---

## 🔧 ขั้นตอนการทำงานที่ถูกต้อง

### 1️⃣ Code Generation Flow

```javascript
// Step 1: โหลด pattern จาก database
const pattern = {
  prefix: "FB",
  format: "FB{year}{sequence}",
  sequence: { current: 1, next: 2, digits: 6 }
}

// Step 2: สร้างรหัส
let code = pattern.format                    // "FB{year}{sequence}"
code = code.replace('{prefix}', 'FB')        // "FB{year}{sequence}"
code = code.replace('{year}', '2025')        // "FB2025{sequence}"

const nextSeq = pattern.sequence.next || 1   // 1
const paddedSeq = String(nextSeq).padStart(6, '0')  // "000001"
code = code.replace('{sequence}', paddedSeq) // "FB2025000001" ✅
```

**📊 ผลลัพธ์:**
- รหัสที่ได้: `FB2025000001`
- Sequence ที่ใช้: `1` (pure number)

---

### 2️⃣ Sequence Extraction Flow (หลังบันทึกสำเร็จ)

```javascript
// รหัสที่สร้าง: "FB2025000001"
const generatedCode = productData.product_code
const format = pattern.format  // "FB{year}{sequence}"

// Step 1: ลบ prefix
const prefix = pattern.prefix || 'FB'
let remaining = generatedCode.replace(prefix, '')
// "FB2025000001" → "2025000001"

// Step 2: ลบปี (ใช้ substring แทน replace)
const currentYear = new Date().getFullYear().toString() // "2025"
if (remaining.startsWith(currentYear)) {
  remaining = remaining.substring(currentYear.length)
  // "2025000001" → "000001"
}

// Step 3: แปลงเป็นตัวเลข
const usedSequence = parseInt(remaining) || 1
// "000001" → 1 ✅
```

**⚠️ จุดสำคัญ:**
- ต้องใช้ `.substring(year.length)` **ไม่ใช่** `.replace(year, '')`
- `.replace()` ลบเฉพาะการเจอครั้งแรก จะทำให้เกิด bug ถ้าปีซ้ำ

---

### 3️⃣ Database Update Flow

```javascript
// หลังจากบันทึกสินค้าสำเร็จแล้ว
const patternInfo = {
  pattern: {
    sequence: {
      current: usedSequence  // 1 (PURE number)
    }
  }
}

// Update sequence ใน database
await window.ERP_CORE.codeManager.updateSequenceInDatabase(
  patternInfo, 
  'product'
)
```

**💾 Database จะถูกอัพเดทเป็น:**
```json
{
  "sequence": {
    "current": 1,
    "next": 2,
    "lastUpdated": "2025-11-08T10:35:00.000Z"
  }
}
```

---

## 📝 Implementation Guide

### ✅ Product Module (ตัวอย่างที่แก้ไขเสร็จแล้ว)

**ไฟล์:** `/src/extensions/modules/erp/modules/inventory/components/products/Form.vue`

#### 1. Generate Code (เมื่อคลิกปุ่ม "สร้างรหัสอัตโนมัติ")

```vue
<script setup>
const generateCode = async () => {
  try {
    const codeManager = window.ERP_CORE?.codeManager
    
    // สร้างรหัสผ่าน CodeManager
    const newCode = await codeManager.generateCode('product', null, {
      existingRecords: []  // optional: ป้องกัน duplicate
    })
    
    productData.product_code = newCode  // "FB2025000001"
    
    console.log('✅ Generated code:', newCode)
  } catch (error) {
    console.error('❌ Code generation failed:', error)
  }
}
</script>
```

#### 2. Save Product (เมื่อบันทึกข้อมูลสำเร็จ)

```vue
<script setup>
const saveProduct = async () => {
  try {
    // 1. บันทึกข้อมูลสินค้า
    const result = await inventoryService.createProduct(productData)
    
    if (result.success) {
      // 2. Extract PURE sequence จากรหัสที่ใช้
      const usedSequence = extractPureSequence(productData.product_code)
      
      // 3. อัพเดท sequence กลับไป database
      await updateSequenceDatabase(usedSequence)
      
      console.log('✅ Product saved and sequence updated')
    }
  } catch (error) {
    console.error('❌ Save failed:', error)
  }
}

// ฟังก์ชันแยก PURE sequence
const extractPureSequence = (code) => {
  const codeManager = window.ERP_CORE?.codeManager
  const usedPattern = codeManager?.getPatternForModule('product')?.pattern
  
  if (!usedPattern || !code) return 1
  
  const format = usedPattern.format || 'FB{year}{sequence}'
  let usedSequence = 1
  
  if (format.includes('{year}')) {
    // Step 1: ลบ prefix
    const prefix = usedPattern.prefix || 'FB'
    let remaining = code.replace(prefix, '')
    
    console.log(`  Step 1 - Remove prefix "${prefix}": "${code}" → "${remaining}"`)
    
    // Step 2: ลบปี (ใช้ substring)
    const currentYear = new Date().getFullYear().toString()
    if (remaining.startsWith(currentYear)) {
      remaining = remaining.substring(currentYear.length)
      console.log(`  Step 2 - Remove year "${currentYear}": → "${remaining}"`)
    }
    
    // Step 3: แปลงเป็นตัวเลข
    usedSequence = parseInt(remaining) || 1
    console.log(`  Step 3 - Parse sequence: "${remaining}" → ${usedSequence}`)
  }
  
  return usedSequence
}

// ฟังก์ชันอัพเดท database
const updateSequenceDatabase = async (usedSequence) => {
  const patternInfo = {
    pattern: {
      sequence: {
        current: usedSequence  // PURE number เท่านั้น
      }
    }
  }
  
  await window.ERP_CORE.codeManager.updateSequenceInDatabase(
    patternInfo,
    'product'
  )
  
  console.log(`✅ Sequence updated: current=${usedSequence}, next=${usedSequence + 1}`)
}
</script>
```

---

## 🔄 วิธีแก้ไขโมดูลอื่นๆ

### 📋 Checklist สำหรับทุกโมดูล

- [ ] **1. มีการ Generate Code หรือไม่?**
  - ✅ ใช้: `codeManager.generateCode('module_name')`
  
- [ ] **2. มีการ Save ข้อมูลหรือไม่?**
  - ✅ หลัง save สำเร็จ ต้อง extract sequence และ update database
  
- [ ] **3. มี Format ที่มี `{year}` หรือไม่?**
  - ✅ ใช้ `.substring(year.length)` **ห้ามใช้** `.replace(year, '')`
  
- [ ] **4. Sequence ที่ส่งไป database เป็น PURE number หรือไม่?**
  - ✅ ต้องเป็น `1, 2, 3, ...` **ไม่ใช่** `2025000001`

---

### 🛒 Purchase Request Module

**ไฟล์:** `/src/extensions/modules/erp/modules/purchase/components/request/PurchaseRequestForm.vue`

#### ปัญหาปัจจุบัน:
```javascript
// ✅ มีการ generate
const newCode = await core.codeManager.generateCode('purchase')
form.value.purchase_request_code = newCode

// ❌ แต่ไม่มีการ update sequence กลับไป database!
```

#### วิธีแก้ไข:
```javascript
const submitForm = async () => {
  try {
    // 1. บันทึกใบขอซื้อ
    const result = await createPurchaseRequest(requestData)
    
    if (result.success) {
      // 2. Extract sequence จากรหัสที่ใช้
      const usedCode = requestData.purchase_request_code
      const usedSequence = extractPureSequence(usedCode, 'purchase')
      
      // 3. Update sequence กลับ database
      await updateSequenceDatabase(usedSequence, 'purchase')
      
      console.log('✅ PR saved and sequence updated')
    }
  } catch (error) {
    console.error('❌ Submit failed:', error)
  }
}

// ใช้ฟังก์ชัน extractPureSequence และ updateSequenceDatabase 
// เหมือนกับใน Product Module (ปรับ module name)
```

---

### 👤 Supplier Module

**ไฟล์:** `/src/extensions/modules/erp/modules/purchase/components/supplier/Form.vue`

#### ปัญหาปัจจุบัน:
```javascript
// ✅ มีการ generate
const code = await window.ERP_CORE.codeManager.generateCode('supplier')
formData.supplier_code = code

// ❌ แต่ไม่มีการ update sequence!
```

#### วิธีแก้ไข:
```javascript
const saveSupplier = async () => {
  try {
    // 1. บันทึก Supplier
    const result = await erpCore.create('supplier', formData)
    
    if (result.success) {
      // 2. Extract sequence
      const usedSequence = extractPureSequence(
        formData.supplier_code, 
        'supplier'
      )
      
      // 3. Update database
      await updateSequenceDatabase(usedSequence, 'supplier')
      
      console.log('✅ Supplier saved and sequence updated')
    }
  } catch (error) {
    console.error('❌ Save failed:', error)
  }
}
```

---

## 🗃️ Database Pattern Config

### ตัวอย่าง Config สำหรับแต่ละโมดูล

```javascript
// Product
{
  "config_key": "number_series.product",
  "config_data": {
    "prefix": "FB",
    "format": "FB{year}{sequence}",
    "sequence": { "digits": 6, "current": 1, "next": 2 }
  }
}

// Purchase Request
{
  "config_key": "number_series.purchase",
  "config_data": {
    "prefix": "PR",
    "format": "PR{year}{sequence}",
    "sequence": { "digits": 5, "current": 1, "next": 2 }
  }
}

// Supplier
{
  "config_key": "number_series.supplier",
  "config_data": {
    "prefix": "SUP",
    "format": "SUP{year}{sequence}",
    "sequence": { "digits": 4, "current": 1, "next": 2 }
  }
}
```

---

## 🐛 Database Migration (กรณี Sequence เสียแล้ว)

### สคริปต์แก้ไข Sequence ที่มี Year เจือปน

**ไฟล์:** `/fix-sequence-database.js`

```javascript
const { MongoClient } = require('mongodb')

const MONGO_URI = 'mongodb://localhost:27017'
const DB_NAME = 'erp_corporate'
const COLLECTION_NAME = 'erp_corporate_config'

async function fixSequenceDatabase() {
  const client = new MongoClient(MONGO_URI)
  
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)
    
    // ดึงข้อมูล config ทั้งหมดที่มี sequence
    const configs = await collection.find({
      'config_data.sequence': { $exists: true }
    }).toArray()
    
    console.log(`Found ${configs.length} configs with sequence`)
    
    const currentYear = new Date().getFullYear()
    let fixedCount = 0
    
    for (const config of configs) {
      const currentSeq = config.config_data?.sequence?.current || 0
      
      // ตรวจสอบว่า sequence มีปีเจือปนหรือไม่
      if (currentSeq > 9999) {
        const seqString = String(currentSeq)
        const yearString = String(currentYear)
        
        let pureSequence = currentSeq
        
        // ถ้าขึ้นต้นด้วยปี ให้ลบออก
        if (seqString.startsWith(yearString)) {
          const withoutYear = seqString.replace(yearString, '')
          pureSequence = parseInt(withoutYear) || 1
          
          console.log(`Fixing ${config.config_key}:`)
          console.log(`  Before: current=${currentSeq}`)
          console.log(`  After:  current=${pureSequence}`)
          
          // อัพเดท database
          await collection.updateOne(
            { _id: config._id },
            {
              $set: {
                'config_data.sequence.current': pureSequence,
                'config_data.sequence.next': pureSequence + 1,
                'config_data.sequence.lastUpdated': new Date()
              }
            }
          )
          
          fixedCount++
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} sequences`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

// เรียกใช้
fixSequenceDatabase()
```

**วิธีใช้:**
```bash
node fix-sequence-database.js
```

---

## ⚠️ ข้อควรระวัง (Common Pitfalls)

### 1. ❌ ใช้ `.replace()` แทน `.substring()` สำหรับการลบปี

```javascript
// ❌ ผิด - จะลบเฉพาะการเจอครั้งแรก
let remaining = "20252025000001"
remaining = remaining.replace("2025", "")
// ผลลัพธ์: "2025000001" (ลบแค่ตัวแรก)

// ✅ ถูก - ลบตาม position
let remaining = "20252025000001"
remaining = remaining.substring(4)  // ลบ 4 ตัวแรก
// ผลลัพธ์: "2025000001" (ยังไม่ถูก ต้องลบอีกรอบ)

// ✅ ถูกที่สุด - ตรวจสอบแล้วค่อยลบ
if (remaining.startsWith("2025")) {
  remaining = remaining.substring(4)
}
```

### 2. ❌ เก็บ Sequence ที่มี Year ใน Database

```javascript
// ❌ ผิด
const sequence = {
  current: 2025000001,  // มีปีเจือปน
  next: 2025000002
}

// ✅ ถูก
const sequence = {
  current: 1,  // Pure number
  next: 2
}
```

### 3. ❌ ลืม Update Sequence หลัง Save

```javascript
// ❌ ผิด - generate แล้วไม่ update
const code = await codeManager.generateCode('product')
productData.product_code = code
await saveProduct(productData)
// ไม่มีการ update sequence → รหัสซ้ำในครั้งถัดไป

// ✅ ถูก - update sequence ทุกครั้งที่ save สำเร็จ
const code = await codeManager.generateCode('product')
productData.product_code = code
const result = await saveProduct(productData)

if (result.success) {
  const usedSeq = extractPureSequence(code)
  await updateSequenceDatabase(usedSeq, 'product')
}
```

### 4. ❌ Update Sequence ก่อนบันทึกสำเร็จ

```javascript
// ❌ ผิด - update ก่อน save สำเร็จ
const code = await codeManager.generateCode('product')
await updateSequenceDatabase(1, 'product')  // อัพเดทก่อน!
await saveProduct(productData)  // ถ้า save ล้มเหลว sequence จะหลุด

// ✅ ถูก - update หลัง save สำเร็จเท่านั้น
const code = await codeManager.generateCode('product')
const result = await saveProduct(productData)

if (result.success) {  // ต้อง success ก่อน
  await updateSequenceDatabase(1, 'product')
}
```

---

## 🧪 Testing Checklist

### ทดสอบทุกครั้งหลังแก้ไข

- [ ] **1. Generate รหัสครั้งแรก**
  - รหัสที่ได้: `{prefix}2025000001` ✅
  - Database: `current=1, next=2` ✅

- [ ] **2. Generate รหัสครั้งที่สอง**
  - รหัสที่ได้: `{prefix}2025000002` ✅
  - Database: `current=2, next=3` ✅

- [ ] **3. Refresh หน้า แล้ว Generate ใหม่**
  - รหัสต้อง**ไม่รีเซ็ต**กลับไปเป็น 000001
  - รหัสต้องต่อจากเลขล่าสุดที่บันทึก

- [ ] **4. ปีเปลี่ยน (2026)**
  - ถ้า `resetOnYearChange: true` → รีเซ็ตเป็น 000001 ✅
  - ถ้า `resetOnYearChange: false` → ต่อเลขเดิม ✅

- [ ] **5. ตรวจสอบ Console Logs**
  ```
  📐 Format: {prefix}{year}{sequence}
    Step 1 - Remove prefix: "{code}" → "{remaining}"
    Step 2 - Remove year: → "{remaining}"
    Step 3 - Parse sequence: "{remaining}" → {number}
  ✅ Extracted PURE sequence: {number}
  ✅ Sequence updated: current={n}, next={n+1}
  ```

- [ ] **6. ตรวจสอบ Database**
  ```javascript
  // ต้องไม่มีปีเจือปนเลย
  {
    "sequence": {
      "current": 5,      // ✅ Pure number
      "next": 6,         // ✅ Pure number
      "lastUpdated": "..."
    }
  }
  ```

---

## 📚 Reference Files

### ไฟล์ที่เกี่ยวข้อง

1. **CodeManager.js** - Core logic
   - `/src/extensions/modules/erp/core/CodeManager.js`
   - `generateCode()` - สร้างรหัส
   - `getNextSequence()` - ดึง sequence ถัดไป
   - `updateSequenceInDatabase()` - อัพเดท sequence

2. **Product Form** (✅ แก้ไขเสร็จแล้ว)
   - `/src/extensions/modules/erp/modules/inventory/components/products/Form.vue`
   - Line ~700-750: Generate code
   - Line ~1230-1325: Extract sequence และ update

3. **Purchase Request Form** (⏳ ต้องแก้ไข)
   - `/src/extensions/modules/erp/modules/purchase/components/request/PurchaseRequestForm.vue`
   - Line ~1650-1670: Generate code (มีแล้ว)
   - Line ~1520-1600: Submit form (ต้องเพิ่ม update sequence)

4. **Supplier Form** (⏳ ต้องแก้ไข)
   - `/src/extensions/modules/erp/modules/purchase/components/supplier/Form.vue`
   - Line ~800-820: Generate code (มีแล้ว)
   - Line ~1360-1400: Save supplier (ต้องเพิ่ม update sequence)

---

## 🎯 Next Steps

### โมดูลที่ต้องแก้ไขต่อไป

1. **Purchase Request** (`purchase`)
   - ✅ มี CodeManager แล้ว
   - ❌ ยังไม่มี updateSequenceInDatabase
   - 📋 Pattern: `PR{year}{sequence}`

2. **Supplier** (`supplier`)
   - ✅ มี CodeManager แล้ว
   - ❌ ยังไม่มี updateSequenceInDatabase
   - 📋 Pattern: `SUP{year}{sequence}`

3. **Purchase Order** (`purchase_order`)
   - ❓ ต้องตรวจสอบว่ามี CodeManager หรือยัง
   - 📋 Pattern: `PO{year}{sequence}`

4. **Sales Order** (`sales`)
   - ❓ ต้องตรวจสอบว่ามี CodeManager หรือยัง
   - 📋 Pattern: `SO{year}{sequence}`

5. **Delivery** (`delivery`)
   - ❓ ต้องตรวจสอบว่ามี CodeManager หรือยัง
   - 📋 Pattern: `DN{year}{sequence}`

---

## 📞 Support & Troubleshooting

### ถ้าเจอปัญหา

1. **รหัสซ้ำกัน**
   - ✅ ตรวจสอบว่า `updateSequenceInDatabase()` ถูกเรียกหรือไม่
   - ✅ เช็ค Console logs ว่ามีการ update sequence หรือไม่

2. **รหัสมีปีซ้ำ (FB20252025...)**
   - ✅ ตรวจสอบ database ว่า sequence เป็น pure number หรือไม่
   - ✅ รัน migration script: `node fix-sequence-database.js`

3. **Sequence รีเซ็ตทุกครั้งที่ Refresh**
   - ✅ ตรวจสอบว่า `updateSequenceInDatabase()` ทำงานหลัง save สำเร็จ
   - ✅ ตรวจสอบว่า extracted sequence เป็น pure number

4. **Sequence หลุดไป**
   - ✅ ตรวจสอบว่ามีการ save ล้มเหลวแต่ update sequence ไปแล้วหรือไม่
   - ✅ ต้อง update sequence **หลัง** save success เท่านั้น

---

## 📝 Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0 | 2025-11-08 | ✅ แก้ไข Product Module สำเร็จ | Complete |
| 1.1 | TBD | ⏳ แก้ไข Purchase Request | Pending |
| 1.2 | TBD | ⏳ แก้ไข Supplier | Pending |
| 2.0 | TBD | 📋 แก้ไขโมดูลอื่นๆ ทั้งหมด | Planned |

---

## 👨‍💻 Contributors

- **Main Developer:** GitHub Copilot + User
- **Testing:** User
- **Documentation:** GitHub Copilot

---

**🔖 Tags:** `sequence`, `auto-increment`, `code-generation`, `database`, `erp`, `product`, `purchase`, `supplier`

**📌 สถานะเอกสาร:** Living Document - จะอัพเดทเมื่อแก้ไขโมดูลอื่นๆ เพิ่มเติม

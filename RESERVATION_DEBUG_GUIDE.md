# 🐛 Stock Reservation Debug Guide

## ปัญหา: ไม่มีการสร้าง lot_reservations ใน Database

### วิธีตรวจสอบและแก้ไข

---

## 1. ✅ ตรวจสอบ Console Logs

เมื่อสร้าง Invoice จาก Quotation ให้เปิด Browser Console (F12) และดู logs:

### Logs ที่ควรเห็น (ถ้าทำงานปกติ):

```
🔄 [SalesService] Creating invoice from quotation: <quotation_id>
📋 [SalesService] Quotation items for reservation: [...]
🔒 [SalesService] Reserving stock for invoice...
🔄 [SalesService] Initializing InventoryService...
🔄 [SalesService] Calling reserveStockForQuotation with: { quotationId, itemsCount: X }

🔒 [InventoryService] Reserving stock for quotation: <quotation_id>
📋 [InventoryService] Items to reserve: X
🔍 [InventoryService] Processing item 1/X: { product_id, product_name, quantity }
🔍 [InventoryService] Searching lots with condition: { ... }
📦 [InventoryService] Found X lots for product
📊 [InventoryService] Lot LOT-XXX: available=Y, toReserve=Z
💾 [InventoryService] Creating reservation record: { ... }
✅ [InventoryService] Reservation created with ID: <reservation_id>
✅ จอง Z เมตร จาก Lot LOT-XXX (สถานะ: not_paid)

📊 [SalesService] Reservation result: { success: true, reservations: [...] }
✅ [SalesService] Stock reserved successfully: X items
```

---

## 2. 🔍 ตรวจสอบข้อมูล Quotation Items

### กรณีที่ไม่มีการจอง อาจเพราะ:

#### A. Quotation ไม่มี Items
```javascript
📋 [SalesService] Quotation items for reservation: []
⚠️ [InventoryService] No items to reserve
```
**วิธีแก้:** ตรวจสอบว่า Quotation มีรายการสินค้าหรือไม่

#### B. Items ไม่มี product_id
```javascript
🔍 [InventoryService] Processing item 1/1: { 
  product_id: undefined,
  product_code: undefined,
  sku: undefined
}
❌ [InventoryService] Missing product identifier for item
```
**วิธีแก้:** ตรวจสอบโครงสร้างข้อมูล Quotation Items ว่ามี product_id, product_code หรือ sku หรือไม่

#### C. Items มี quantity = 0
```javascript
⚠️ [InventoryService] Invalid quantity for item: { quantity: 0 }
```
**วิธีแก้:** ตรวจสอบว่า quantity > 0

---

## 3. 📦 ตรวจสอบข้อมูล Lot Tracking

### กรณีที่ไม่พบ Lots:
```javascript
📦 [InventoryService] Found 0 lots for product
```

**สาเหตุที่เป็นไปได้:**

#### A. ไม่มี Lot ในระบบ
- ตรวจสอบ MongoDB collection: `lot_tracking`
- ตรวจสอบว่ามีข้อมูล Lot สำหรับสินค้านี้หรือไม่

```javascript
// ใน MongoDB Shell หรือ Compass
db.lot_tracking.find({ 
  product_id: "PROD001",  // หรือ product_code
  lot_status: { $in: ["active", "partial"] },
  current_meters: { $gt: 0 }
})
```

#### B. Lot Status ไม่ถูกต้อง
- Lot ต้องมี `lot_status` = "active" หรือ "partial"
- Lot ต้องมี `current_meters` > 0

#### C. Product Identifier ไม่ตรงกัน
```javascript
🔍 [InventoryService] Searching lots with condition: {
  product_id: "PROD001",  // หรือ
  product_code: "SKU001"
}
```
- ตรวจสอบว่า `product_id` ใน `quotation.items` ตรงกับใน `lot_tracking` หรือไม่

---

## 4. 💾 ตรวจสอบการสร้าง Reservation Record

### กรณีที่สร้างไม่สำเร็จ:
```javascript
❌ [InventoryService] Failed to create reservation, no data returned
```

**สาเหตุที่เป็นไปได้:**

#### A. Database Connection Error
- ตรวจสอบการเชื่อมต่อ MongoDB
- ตรวจสอบ API endpoint `/lot_reservations`

#### B. Schema Validation Error
- ตรวจสอบว่า collection `lot_reservations` มีอยู่ใน database
- ตรวจสอบ schema validation (ถ้ามี)

#### C. Permission Error
- ตรวจสอบ client_key มีสิทธิ์ POST ไปยัง `lot_reservations` หรือไม่

---

## 5. 🧪 วิธีทดสอบแบบ Step-by-Step

### Step 1: ตรวจสอบ Quotation Data
```javascript
// ใน Browser Console
// หลังจากเปิดหน้า Quotation Detail
console.log('Quotation Data:', quotation.value)
console.log('Quotation Items:', quotation.value?.items)
```

### Step 2: ตรวจสอบ Lot Tracking Data
```javascript
// Query ใน MongoDB
db.lot_tracking.find({
  lot_status: { $in: ["active", "partial"] },
  current_meters: { $gt: 0 }
}).pretty()
```

### Step 3: ทดสอบสร้าง Invoice
1. เปิด Quotation Detail
2. คลิก "สร้าง Invoice"
3. เปิด Browser Console (F12)
4. ดู logs ทั้งหมด
5. บันทึก error messages (ถ้ามี)

### Step 4: ตรวจสอบ Database
```javascript
// หลังจากสร้าง Invoice
db.lot_reservations.find({
  reference_type: "quotation",
  reference_id: "<quotation_id>"
}).pretty()
```

---

## 6. 🔧 วิธีแก้ไขปัญหาที่พบบ่อย

### Problem 1: "ไม่พบ product_id"
**Solution:**
```javascript
// ตรวจสอบว่า Quotation Items มีโครงสร้างถูกต้อง
// ควรมีอย่างน้อย 1 ใน 3:
{
  product_id: "xxx",      // รูปแบบที่ 1
  product_code: "yyy",    // รูปแบบที่ 2
  sku: "zzz"              // รูปแบบที่ 3
}
```

### Problem 2: "ไม่พบ Lot"
**Solution:**
```javascript
// สร้างข้อมูล Lot ทดสอบใน lot_tracking
db.lot_tracking.insertOne({
  lot_id: "LOT-TEST-001",
  product_id: "<product_id จาก quotation>",
  product_code: "<product_code>",
  product_name: "Test Product",
  lot_status: "active",
  current_meters: 100,
  reserved_meters: 0,
  total_meters: 100,
  available_meters: 100,
  supplier: "Test Supplier",
  receive_date: new Date(),
  created_at: new Date(),
  updated_at: new Date()
})
```

### Problem 3: "InventoryService not initialized"
**Solution:**
```javascript
// ตรวจสอบว่า window.vueApp มีค่า
console.log('Vue App:', window.vueApp)
console.log('Config:', window.vueApp?.config?.globalProperties)

// หรือ
// ตรวจสอบว่า apiRequest และ clientKey ถูกส่งไปใน initialize()
```

---

## 7. 📊 Query ที่มีประโยชน์

### ดู Reservations ทั้งหมด:
```javascript
db.lot_reservations.find().sort({ created_at: -1 }).limit(10).pretty()
```

### ดู Reservations ของ Quotation:
```javascript
db.lot_reservations.find({
  reference_type: "quotation",
  reference_id: "<quotation_id>"
}).pretty()
```

### ดู Lots ที่มี Stock:
```javascript
db.lot_tracking.find({
  lot_status: { $in: ["active", "partial"] },
  current_meters: { $gt: 0 }
}).pretty()
```

### ดู Invoices ที่มี Reservations:
```javascript
db.sales_invoices.find({
  stock_reservations: { $exists: true, $ne: [] }
}).pretty()
```

---

## 8. 🚨 Error Messages และวิธีแก้

### Error: "InventoryService not initialized"
```
❌ [InventoryService] Error: InventoryService not initialized
```
**วิธีแก้:**
- ตรวจสอบว่า `inventoryService.initialize()` ถูกเรียก
- ตรวจสอบว่า `this.apiRequest` มีค่า

### Error: "Missing product identifier"
```
❌ [InventoryService] Missing product identifier for item
```
**วิธีแก้:**
- เพิ่ม `product_id` หรือ `product_code` ใน quotation items
- ตรวจสอบ schema ของ quotation items

### Error: "ไม่พบ Lot ที่มีสต็อกเพียงพอ"
```
❌ ไม่พบ Lot ที่มีสต็อกเพียงพอ
```
**วิธีแก้:**
- สร้างข้อมูล Lot ในระบบ
- ตรวจสอบว่า Lot มี `current_meters` > 0

---

## 9. ✅ Checklist การตรวจสอบ

- [ ] Quotation มีรายการสินค้า (items.length > 0)
- [ ] Items มี product_id, product_code หรือ sku
- [ ] Items มี quantity > 0
- [ ] Database มี collection `lot_tracking`
- [ ] Database มี collection `lot_reservations`
- [ ] มีข้อมูล Lot ในระบบ (lot_status = active/partial, current_meters > 0)
- [ ] Lot product_id ตรงกับ quotation items
- [ ] InventoryService initialized ถูกต้อง
- [ ] API endpoint `/lot_reservations` ทำงาน
- [ ] Client key มีสิทธิ์ POST/PUT

---

## 10. 📞 ขั้นตอนการ Report Bug

หากยังไม่สามารถแก้ไขได้ ให้ทำตามนี้:

1. **เปิด Browser Console (F12)**
2. **Reproduce ปัญหา** - สร้าง Invoice จาก Quotation
3. **บันทึก Console Logs ทั้งหมด**
4. **ตรวจสอบ Network Tab** - ดูว่า API calls ไหนล้มเหลว
5. **ตรวจสอบ Database** - ดูข้อมูล quotation, lot_tracking, lot_reservations
6. **รวบรวมข้อมูล:**
   - Console logs
   - Network errors
   - Database queries results
   - Quotation data structure

---

**💡 Tip:** ปัญหาส่วนใหญ่มักมาจาก:
1. ไม่มีข้อมูล Lot ในระบบ
2. Product identifiers ไม่ตรงกัน
3. Quotation items ไม่มี product_id

ลองตรวจสอบ 3 ข้อนี้ก่อนเสมอ!

# 🔍 ตรวจสอบข้อมูล Lot ที่มีปัญหา

## ปัญหาที่เกิดขึ้น

จากการสร้าง Invoice จาก Quotation:
- Product ID: `690efbfdf5cbf1a8243324c1`
- Product SKU: `QWDQWDQW`
- Lot ID (จาก Quotation): `690f298dd04c13d4086ccb8e`
- Lot Code: `12345615201234`
- Quantity: 50 เมตร

**ผลลัพธ์:** ไม่พบ Lot ในระบบ → ไม่สามารถจองได้

---

## Query ตรวจสอบ Lot

### 1. ค้นหา Lot ด้วย lot_id จาก Quotation:

```javascript
db.lot_tracking.find({
  lot_id: "690f298dd04c13d4086ccb8e"
}).pretty()
```

### 2. ค้นหา Lot ด้วย product_id:

```javascript
db.lot_tracking.find({
  product_id: "690efbfdf5cbf1a8243324c1"
}).pretty()
```

### 3. ค้นหา Lot ที่ active และมี stock:

```javascript
db.lot_tracking.find({
  product_id: "690efbfdf5cbf1a8243324c1",
  lot_status: { $in: ["active", "partial"] },
  current_meters: { $gt: 0 }
}).pretty()
```

### 4. ค้นหา Lot ทั้งหมดของ product นี้ (ไม่สนสถานะ):

```javascript
db.lot_tracking.find({
  product_id: "690efbfdf5cbf1a8243324c1"
}).pretty()
```

---

## วิธีแก้ไข

### ✅ กรณีที่ 1: Lot มีอยู่แล้วแต่สถานะไม่ถูกต้อง

ถ้า Query พบ Lot แต่มี:
- `lot_status` ไม่ใช่ "active" หรือ "partial"
- `current_meters` = 0

**วิธีแก้:** อัปเดตสถานะ Lot

```javascript
db.lot_tracking.updateOne(
  { lot_id: "690f298dd04c13d4086ccb8e" },
  {
    $set: {
      lot_status: "active",
      current_meters: 50,  // หรือจำนวนที่มีจริง
      available_meters: 50,
      reserved_meters: 0,
      updated_at: new Date()
    }
  }
)
```

### ✅ กรณีที่ 2: ไม่มี Lot เลย

**วิธีแก้:** สร้าง Lot ใหม่

```javascript
db.lot_tracking.insertOne({
  lot_id: "LOT-2025-001",  // หรือใช้ lot_id จาก quotation
  product_id: "690efbfdf5cbf1a8243324c1",
  product_code: "QWDQWDQW",
  product_name: "ชื่อสินค้า",  // ใส่ชื่อจริง
  
  // Lot Status
  lot_status: "active",
  
  // Meters Tracking
  total_meters: 50,
  current_meters: 50,
  available_meters: 50,
  reserved_meters: 0,
  used_meters: 0,
  
  // Weight (optional)
  weight_per_meter: 0.5,  // กก./เมตร
  total_weight_kg: 25,    // น้ำหนักรวม
  
  // Supplier Info
  supplier: "ชื่อซัพพลายเออร์",
  supplier_lot_number: "12345615201234",
  
  // Dates
  receive_date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  
  // Location
  current_location: "WAREHOUSE-A",
  location_code: "WH-A-001"
})
```

### ✅ กรณีที่ 3: Product ID ไม่ตรงกัน

ตรวจสอบว่า `product_id` ใน `lot_tracking` ตรงกับ `product_id` ใน `quotation.items` หรือไม่:

```javascript
// ตรวจสอบ product_id
db.products.findOne({ _id: ObjectId("690efbfdf5cbf1a8243324c1") })

// ตรวจสอบ quotation items
db.quotations.findOne({ _id: ObjectId("6911d62218848ad06add19e7") })
```

---

## ✅ Script สร้าง Lot ทดสอบ (Quick Fix)

```javascript
// สร้าง Lot สำหรับ product ที่มีปัญหา
db.lot_tracking.insertOne({
  lot_id: "690f298dd04c13d4086ccb8e",  // ใช้ lot_id จาก quotation
  product_id: "690efbfdf5cbf1a8243324c1",
  product_code: "QWDQWDQW",
  product_name: "Test Product",
  
  lot_status: "active",
  
  total_meters: 100,
  current_meters: 100,
  available_meters: 100,
  reserved_meters: 0,
  used_meters: 0,
  
  supplier: "Test Supplier",
  supplier_lot_number: "12345615201234",
  
  receive_date: new Date("2025-11-01"),
  created_at: new Date(),
  updated_at: new Date(),
  
  current_location: "MAIN-WAREHOUSE",
  location_code: "WH-001"
})
```

---

## 🧪 ทดสอบหลังแก้ไข

1. **สร้าง/อัปเดต Lot** ตาม script ข้างบน
2. **ลองสร้าง Invoice จาก Quotation ใหม่อีกครั้ง**
3. **ดู console logs** ควรเห็น:
   ```
   📦 [InventoryService] Found 1 lots for product
   ✅ จอง 50 เมตร จาก Lot XXX (สถานะ: not_paid)
   ```

4. **ตรวจสอบ Database:**
   ```javascript
   db.lot_reservations.find({
     reference_type: "quotation",
     reference_id: "6911d62218848ad06add19e7"
   }).pretty()
   ```

---

## 📌 สรุป

**Root Cause:** ไม่มีข้อมูล Lot ในระบบ

**Solution:** สร้างหรืออัปเดต lot_tracking ให้มี:
- ✅ `lot_status` = "active" หรือ "partial"
- ✅ `current_meters` > 0
- ✅ `product_id` ตรงกับใน quotation

**หลังแก้ไข:** ระบบจะสามารถจองสต็อคได้อัตโนมัติเมื่อสร้าง Invoice

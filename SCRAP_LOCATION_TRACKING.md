# Scrap Location Tracking System

## ภาพรวม

ระบบการติดตามคลังของเสีย (Scrap Location) ที่ช่วยให้สามารถบันทึกการรับเข้าสินค้าที่เสียหาย/ของเสีย โดย**ไม่นับเป็นสต็อกสำหรับขาย** แต่**มีร่องรอยการเคลื่อนไหว**สำหรับการตรวจสอบ

## ฟีเจอร์หลัก

### 1. Location Type Detection (4 ประเภท)

```javascript
location_type:
- 'warehouse'  → คลังทั่วไป (นับสต็อก)
- 'scrap'      → ของเสีย (ไม่นับสต็อก แต่มีร่องรอย)
- 'sample'     → ตัวอย่าง (ไม่นับสต็อกขาย)
- 'virtual'    → คลังเสมือน
```

### 2. Visual Indicators

**Location Dropdown มี Badges แสดงประเภท:**
- 🗑️ **Scrap** (สีแดง) - พร้อมคำเตือน "ของเสีย - ไม่นับสต็อก (มีร่องรอยเท่านั้น)"
- 🧪 **Sample** (สีเขียว) - "ตัวอย่าง - ไม่นับเป็นสต็อกขาย"
- 📦 **Warehouse** (สีน้ำเงิน) - คลังปกติ
- ☁️ **Virtual** (สีม่วง) - คลังเสมือน

**Warning Banner เมื่อเลือก Scrap Location:**
```
⚠️ คลังของเสีย (Scrap Location)
• การรับเข้าคลังนี้จะไม่นับเป็นสต็อกสำหรับขาย
• ระบบจะบันทึกร่องรอยการเคลื่อนไหวเท่านั้น
• ใช้สำหรับติดตามของเสีย/ชำรุด
```

### 3. Backend Data Structure

เมื่อบันทึก Lot จะส่งข้อมูลเพิ่มเติม:

```javascript
{
  lot_code: "12345",
  calculated_meters: 100,
  weight_kg: 50,
  location_code: "SCRAP-01",
  rack_position: "L101",
  
  // ✅ ข้อมูลใหม่สำหรับ Scrap Tracking
  location_type: "scrap",           // ประเภทคลัง
  is_scrap_return: true,            // flag บอกว่าเป็นของเสีย
  is_sample: false,                 // flag บอกว่าเป็นตัวอย่าง
  count_in_stock: false             // ✅ ไม่นับสต็อก (scrap/sample)
}
```

### 4. Stock Counting Logic

```javascript
// Backend ควรตรวจสอบ count_in_stock flag
if (lotData.count_in_stock === false) {
  // บันทึก transaction ลง lot_tracking collection
  // แต่ไม่ update product.current_stock
  await db.lot_tracking.insertOne(lotData)
  
  // ไม่เพิ่ม stock
  // await db.products.updateOne(
  //   { _id: product_id },
  //   { $inc: { current_stock: lotData.calculated_meters } }
  // )
} else {
  // บันทึกปกติและนับสต็อก
  await db.lot_tracking.insertOne(lotData)
  await db.products.updateOne(
    { _id: product_id },
    { $inc: { current_stock: lotData.calculated_meters } }
  )
}
```

## UI Components ที่ถูกอัปเดต

### LotManagementModal.vue

**Computed Properties เพิ่มเติม:**
```javascript
isScrapLocation    // ตรวจสอบว่าเลือก scrap location
isSampleLocation   // ตรวจสอบว่าเลือก sample location
selectedLocationDisplay  // แสดงชื่อ location ที่เลือก
getLocationTypeLabel(type) // แปลง type เป็นภาษาไทย
```

**Template Changes:**
1. Location dropdown แสดง badges แยกตามประเภท
2. เพิ่ม warning banner สำหรับ scrap/sample
3. Dropdown height เพิ่มเป็น max-h-64 (รองรับข้อมูลเพิ่ม)
4. แสดง location name + code แบบ `selectedLocationDisplay`

## Use Cases

### Use Case 1: รับของเสียเข้าคลัง
```
1. เปิด LotManagementModal
2. เลือก Location = "SCRAP-01" (ของเสีย)
3. ⚠️ Warning banner แสดงทันที
4. กรอกข้อมูล lot อื่นๆ
5. บันทึก → ระบบบันทึกร่องรอย แต่ไม่นับสต็อก
```

### Use Case 2: รับตัวอย่างเข้าคลัง
```
1. เปิด LotManagementModal
2. เลือก Location = "SAMPLE-01" (ตัวอย่าง)
3. ℹ️ Info banner แสดง "ไม่นับเป็นสต็อกขาย"
4. กรอกข้อมูล lot
5. บันทึก → บันทึกร่องรอย แต่ไม่นับเป็นสต็อกขาย
```

### Use Case 3: รับเข้าคลังปกติ
```
1. เปิด LotManagementModal
2. เลือก Location = "WH-01" (คลังทั่วไป)
3. ไม่มี warning
4. กรอกข้อมูล lot
5. บันทึก → บันทึกร่องรอย + นับสต็อกปกติ
```

## Database Schema Recommendation

### Collection: `lot_tracking`

```javascript
{
  _id: ObjectId,
  lot_code: String,          // "12345"
  product_id: ObjectId,
  calculated_meters: Number,
  weight_kg: Number,
  location_code: String,     // "SCRAP-01"
  rack_position: String,     // "L101"
  
  // ✅ เพิ่ม fields ใหม่
  location_type: String,     // "scrap" | "warehouse" | "sample" | "virtual"
  is_scrap_return: Boolean,  // true ถ้าเป็นของเสีย
  is_sample: Boolean,        // true ถ้าเป็นตัวอย่าง
  count_in_stock: Boolean,   // false = ไม่นับสต็อก
  
  created_at: Date,
  created_from: String       // "manual" | "import" | "production"
}
```

### Index Recommendations

```javascript
// สำหรับ query ของเสีย/ตัวอย่าง
db.lot_tracking.createIndex({ location_type: 1, created_at: -1 })
db.lot_tracking.createIndex({ is_scrap_return: 1 })
db.lot_tracking.createIndex({ count_in_stock: 1 })

// สำหรับ audit trail
db.lot_tracking.createIndex({ location_code: 1, created_at: -1 })
```

## Audit Trail Queries

### รายการของเสียทั้งหมด
```javascript
db.lot_tracking.find({
  is_scrap_return: true
}).sort({ created_at: -1 })
```

### ของเสียตามช่วงเวลา
```javascript
db.lot_tracking.find({
  is_scrap_return: true,
  created_at: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
})
```

### สรุปของเสียแยกตาม Location
```javascript
db.lot_tracking.aggregate([
  { $match: { is_scrap_return: true } },
  {
    $group: {
      _id: "$location_code",
      total_lots: { $sum: 1 },
      total_meters: { $sum: "$calculated_meters" },
      total_weight: { $sum: "$weight_kg" }
    }
  }
])
```

## Benefits

✅ **ความปลอดภัย**: ของเสียไม่ปนสต็อกขาย
✅ **Audit Trail**: มีร่องรอยทุกการเคลื่อนไหว
✅ **การรายงาน**: สามารถดูสถิติของเสียได้
✅ **UI ชัดเจน**: Warning และ badges แสดงข้อมูลครบถ้วน
✅ **Flexible**: รองรับ 4 ประเภทคลัง (warehouse, scrap, sample, virtual)

## Next Steps (Backend Implementation)

1. อัปเดต `InventoryService` ให้ตรวจสอบ `count_in_stock` flag
2. เพิ่ม validation ห้าม update `is_scrap_return` หลังบันทึก
3. สร้าง API endpoint `/api/inventory/scrap-report` สำหรับรายงาน
4. เพิ่ม database indexes ตามที่แนะนำ
5. อัปเดต MongoDB schema validation

## Testing Checklist

- [ ] เลือก Scrap location → แสดง warning banner
- [ ] เลือก Sample location → แสดง info banner  
- [ ] เลือก Warehouse location → ไม่แสดง warning
- [ ] บันทึก lot ที่เป็น scrap → `count_in_stock: false`
- [ ] บันทึก lot ที่เป็น warehouse → `count_in_stock: true`
- [ ] ตรวจสอบ database ว่ามี fields ครบ
- [ ] ตรวจสอบว่า scrap ไม่ update product stock
- [ ] ตรวจสอบว่า warehouse update product stock ปกติ

## Files Modified

- `src/extensions/modules/erp/modules/inventory/shared/LotManagementModal.vue`
  - เพิ่ม computed properties (isScrapLocation, isSampleLocation, selectedLocationDisplay)
  - เพิ่ม getLocationTypeLabel() helper
  - อัปเดต location dropdown UI
  - เพิ่ม warning banners
  - อัปเดต handleSave() ให้ส่ง location_type flags

---

**Created**: 2024
**Updated**: After scrap location integration
**Status**: ✅ Ready for backend implementation

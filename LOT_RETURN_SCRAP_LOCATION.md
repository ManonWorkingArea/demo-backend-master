# Lot Return with Scrap Location Tracking

## ภาพรวม

อัปเดต **LotReturnModal.vue** ให้รองรับการเลือก Stock Location สำหรับการรับสินค้าคืน โดยสามารถระบุได้ว่าจะรับคืนเข้าคลังไหน ถ้าเลือก **Scrap Location** ระบบจะ**ไม่นับสต็อก**แต่**มีร่องรอย**สำหรับ Audit Trail

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. Stock Location Dropdown

ผู้ใช้สามารถเลือกคลังที่ต้องการรับสินค้าคืนเข้า:
- 📦 **Warehouse** (คลังทั่วไป) - นับสต็อกปกติ
- 🗑️ **Scrap** (ของเสีย) - **ไม่นับสต็อก** มีร่องรอยเท่านั้น
- 🧪 **Sample** (ตัวอย่าง) - ไม่นับเป็นสต็อกขาย
- ☁️ **Virtual** (คลังเสมือน) - คลังเสมือน

### 2. Visual Indicators

**Location Badges:**
- แต่ละ location แสดง badge สีต่างกันตามประเภท
- Scrap มีคำเตือน: "ของเสีย - ไม่นับสต็อก (มีร่องรอยเท่านั้น)"
- Sample มีคำอธิบาย: "ตัวอย่าง - ไม่นับเป็นสต็อกขาย"

**Warning Banners:**

**Scrap Location Banner (สีแดง):**
```
⚠️ คลังของเสีย (Scrap Location)
• การรับคืนเข้าคลังนี้จะไม่นับเป็นสต็อกสำหรับขาย
• ระบบจะบันทึกร่องรอยการเคลื่อนไหวเท่านั้น
• ใช้สำหรับติดตามของเสีย/ชำรุด
```

**Sample Location Banner (สีเขียว):**
```
ℹ️ คลังตัวอย่าง (Sample Location)
สินค้าที่รับคืนเข้าคลังนี้เป็นตัวอย่าง ไม่นับเป็นสต็อกขาย
```

### 3. Data Structure

เมื่อบันทึกการรับคืน ระบบจะส่งข้อมูลเพิ่มเติม:

```javascript
{
  lot_id: "...",
  movement_id: "...",
  return_meters: 50,
  return_type: "refund",
  reason: "สินค้าชำรุด",
  customer_name: "บริษัท ABC",
  reference_number: "INV-001",
  notes: "...",
  
  // ✅ ข้อมูลใหม่สำหรับ Scrap Tracking
  return_location_code: "SCRAP-01",
  location_type: "scrap",
  is_scrap_return: true,
  is_sample: false,
  count_in_stock: false  // ✅ ไม่นับสต็อก
}
```

### 4. Backend Logic

Backend ควรตรวจสอบ `count_in_stock` flag:

```javascript
// ตัวอย่าง Backend Implementation
async function handleLotReturn(returnData) {
  // 1. บันทึก Return Transaction
  const returnRecord = await db.lot_returns.insertOne({
    lot_id: returnData.lot_id,
    movement_id: returnData.movement_id,
    return_meters: returnData.return_meters,
    return_location: returnData.return_location_code,
    location_type: returnData.location_type,
    is_scrap: returnData.is_scrap_return,
    count_in_stock: returnData.count_in_stock,
    created_at: new Date()
  })
  
  // 2. อัปเดต Original Movement (เพิ่ม returned_meters)
  await db.stock_movements.updateOne(
    { _id: returnData.movement_id },
    { $inc: { returned_meters: returnData.return_meters } }
  )
  
  // 3. ถ้า count_in_stock = true (ไม่ใช่ scrap/sample) → เพิ่มสต็อก
  if (returnData.count_in_stock) {
    // บันทึก IN movement
    await db.stock_movements.insertOne({
      lot_id: returnData.lot_id,
      movement_type: 'IN',
      transaction_type: 'return',
      quantity_meters: returnData.return_meters,
      location_code: returnData.return_location_code,
      reference_id: returnRecord._id,
      created_at: new Date()
    })
    
    // อัปเดตสต็อกของ lot
    await db.lot_tracking.updateOne(
      { _id: returnData.lot_id },
      { $inc: { remaining_meters: returnData.return_meters } }
    )
    
    // อัปเดตสต็อกของ product
    const lot = await db.lot_tracking.findOne({ _id: returnData.lot_id })
    await db.products.updateOne(
      { _id: lot.product_id },
      { $inc: { current_stock: returnData.return_meters } }
    )
  } else {
    // 4. ถ้า count_in_stock = false (scrap/sample) → บันทึกร่องรอยเท่านั้น
    console.log('🗑️ Scrap/Sample return - NOT counting in stock')
    
    // บันทึก movement แต่ไม่เพิ่มสต็อก (สำหรับ audit trail)
    await db.stock_movements.insertOne({
      lot_id: returnData.lot_id,
      movement_type: 'IN',
      transaction_type: 'scrap_return',  // แยก type
      quantity_meters: returnData.return_meters,
      location_code: returnData.return_location_code,
      is_scrap: true,
      count_in_stock: false,
      reference_id: returnRecord._id,
      created_at: new Date()
    })
    
    // ไม่อัปเดต remaining_meters และ current_stock
  }
  
  return returnRecord
}
```

## UI Flow

### Use Case 1: รับคืนเข้าคลังปกติ

```
1. เปิด LotReturnModal
2. เลือกประเภทการคืน: เครม/คืนเงิน
3. เลือกรายการขาย (OUT movement)
4. เลือก Stock Location: "WH-01" (คลังทั่วไป)
5. ระบุจำนวนที่คืน: 50 เมตร
6. ระบุเหตุผล: "ลูกค้าไม่ต้องการ"
7. บันทึก
   → ระบบบันทึกร่องรอย + เพิ่มสต็อกกลับเข้าคลัง 50 เมตร
```

### Use Case 2: รับคืนเข้าคลังของเสีย (Scrap)

```
1. เปิด LotReturnModal
2. เลือกประเภทการคืน: ของเสีย
3. เลือกรายการขาย (OUT movement)
4. เลือก Stock Location: "SCRAP-01" (ของเสีย)
   → ⚠️ Warning banner แสดงทันที
5. ระบุจำนวนที่คืน: 30 เมตร
6. ระบุเหตุผล: "สินค้าชำรุด มีรอยฉีก"
7. บันทึก
   → ระบบบันทึกร่องรอย แต่ไม่เพิ่มสต็อก (count_in_stock: false)
```

### Use Case 3: รับคืนเข้าคลังตัวอย่าง (Sample)

```
1. เปิด LotReturnModal
2. เลือกประเภทการคืน: เปลี่ยนสินค้า
3. เลือกรายการขาย
4. เลือก Stock Location: "SAMPLE-01" (ตัวอย่าง)
   → ℹ️ Info banner แสดง
5. ระบุจำนวนที่คืน: 20 เมตร
6. ระบุเหตุผล: "ใช้เป็นตัวอย่าง"
7. บันทึก
   → บันทึกร่องรอย แต่ไม่นับเป็นสต็อกขาย
```

## Validation Rules

ต้องกรอกข้อมูลครบก่อนบันทึก:
- ✅ เลือกประเภทการคืน (refund/exchange/defective)
- ✅ เลือกรายการขาย (movement_id)
- ✅ ระบุจำนวนที่คืน (> 0 และ ≤ maxReturnableMeters)
- ✅ ระบุเหตุผลการคืน
- ✅ **เลือก Stock Location ที่รับคืนเข้า** ← ใหม่!

## Database Schema

### Collection: `lot_returns`

```javascript
{
  _id: ObjectId,
  lot_id: ObjectId,
  movement_id: ObjectId,        // reference ไปยัง stock_movement ที่ขายไป
  return_meters: Number,
  return_type: String,          // "refund" | "exchange" | "defective"
  return_location: String,      // "SCRAP-01" | "WH-01" | etc.
  location_type: String,        // "scrap" | "warehouse" | "sample" | "virtual"
  is_scrap_return: Boolean,
  is_sample: Boolean,
  count_in_stock: Boolean,      // ✅ false = ไม่นับสต็อก
  reason: String,
  customer_name: String,
  reference_number: String,
  notes: String,
  created_at: Date,
  created_by: ObjectId
}
```

### Collection: `stock_movements` (อัปเดต)

เพิ่ม field:
```javascript
{
  // ... existing fields
  is_scrap: Boolean,           // true ถ้าเป็น scrap return
  count_in_stock: Boolean,     // false ถ้าไม่ต้องนับสต็อก
  transaction_type: String     // "sale" | "return" | "scrap_return" | etc.
}
```

### Indexes

```javascript
// สำหรับ query scrap returns
db.lot_returns.createIndex({ is_scrap_return: 1, created_at: -1 })
db.lot_returns.createIndex({ location_type: 1, created_at: -1 })

// สำหรับ query movements
db.stock_movements.createIndex({ is_scrap: 1, movement_type: 1 })
db.stock_movements.createIndex({ count_in_stock: 1, created_at: -1 })
```

## Audit Trail Queries

### ดูรายการ Scrap Returns ทั้งหมด

```javascript
db.lot_returns.find({
  is_scrap_return: true
}).sort({ created_at: -1 })
```

### สรุป Scrap Returns ตาม Location

```javascript
db.lot_returns.aggregate([
  { $match: { is_scrap_return: true } },
  {
    $group: {
      _id: "$return_location",
      total_returns: { $sum: 1 },
      total_meters: { $sum: "$return_meters" }
    }
  },
  { $sort: { total_meters: -1 } }
])
```

### ดูรายการคืนที่นับสต็อก vs ไม่นับสต็อก

```javascript
db.lot_returns.aggregate([
  {
    $group: {
      _id: "$count_in_stock",
      count: { $sum: 1 },
      total_meters: { $sum: "$return_meters" }
    }
  }
])
```

### ดู Movement History ของ Lot รวมทั้ง Scrap

```javascript
db.stock_movements.find({
  lot_id: ObjectId("..."),
  $or: [
    { movement_type: "IN" },
    { movement_type: "OUT" },
    { transaction_type: "scrap_return" }
  ]
}).sort({ created_at: -1 })
```

## Component Changes

### LotReturnModal.vue

**New Props:**
- ไม่มีการเพิ่ม props ใหม่

**New Data:**
```javascript
showLocationDropdown: ref(false)
loadingLocations: ref(false)
availableLocations: ref([])
formData.return_location_code: '' // เพิ่ม field ใหม่
```

**New Computed:**
```javascript
isScrapLocation()       // ตรวจสอบว่าเลือก scrap
isSampleLocation()      // ตรวจสอบว่าเลือก sample
selectedLocationDisplay() // แสดงชื่อ location
```

**New Methods:**
```javascript
loadStockLocations()      // โหลด locations จาก API
toggleLocationDropdown()  // เปิด/ปิด dropdown
selectLocation(location)  // เลือก location
getLocationTypeLabel(type) // แปลง type เป็นภาษาไทย
```

**Updated Methods:**
```javascript
handleSubmit() // เพิ่มการส่ง location_type, is_scrap_return, count_in_stock
watch(props.show) // เรียก loadStockLocations() เมื่อเปิด modal
```

**New Validation:**
```javascript
// เพิ่มการตรวจสอบ
if (!formData.value.return_location_code) {
  errors.push('กรุณาเลือกคลังที่รับคืนเข้า')
}
```

## Benefits

✅ **ความปลอดภัย**: ของเสียไม่ปนกับสต็อกขาย
✅ **Audit Trail**: บันทึกร่องรอยทุกการคืน รวมทั้ง scrap
✅ **การรายงาน**: สามารถดูสถิติของเสียได้แม่นยำ
✅ **UI ชัดเจน**: Warning banners แจ้งเตือนชัดเจน
✅ **Flexible**: รองรับหลายประเภทคลัง
✅ **Consistent**: ใช้ระบบเดียวกับ LotManagementModal

## Testing Checklist

- [ ] เปิด LotReturnModal → แสดง location dropdown
- [ ] โหลด locations สำเร็จ → แสดงรายการ locations
- [ ] เลือก Scrap location → แสดง warning banner สีแดง
- [ ] เลือก Sample location → แสดง info banner สีเขียว
- [ ] เลือก Warehouse location → ไม่แสดง warning
- [ ] Validation: ไม่เลือก location → แสดง error
- [ ] บันทึกข้อมูล → ส่ง return_location_code, location_type ครบ
- [ ] Scrap return → `count_in_stock: false`
- [ ] Warehouse return → `count_in_stock: true`
- [ ] Backend: ตรวจสอบว่า scrap return ไม่เพิ่มสต็อก
- [ ] Backend: ตรวจสอบว่า warehouse return เพิ่มสต็อกปกติ
- [ ] Query audit trail: ดูรายการ scrap returns ได้
- [ ] Dropdown: Badge แสดงสีถูกต้องตาม type

## Files Modified

- `src/extensions/modules/erp/modules/inventory/shared/LotReturnModal.vue`
  - เพิ่ม Stock Location dropdown พร้อม badges
  - เพิ่ม Warning banners สำหรับ scrap/sample
  - เพิ่ม formData.return_location_code field
  - เพิ่ม computed properties (isScrapLocation, isSampleLocation, etc.)
  - เพิ่ม loadStockLocations() method
  - อัปเดต handleSubmit() ให้ส่ง location data
  - เพิ่ม validation สำหรับ location

## Next Steps (Backend)

1. ✅ รับข้อมูล `return_location_code`, `location_type`, `is_scrap_return`, `count_in_stock`
2. ✅ ตรวจสอบ `count_in_stock` flag ก่อน update สต็อก
3. ✅ บันทึก lot_returns collection พร้อม location info
4. ✅ อัปเดต stock_movements.returned_meters
5. ✅ ถ้า count_in_stock = true → เพิ่มสต็อก
6. ✅ ถ้า count_in_stock = false → บันทึกร่องรอยเท่านั้น
7. ✅ สร้าง API endpoint `/api/inventory/scrap-returns` สำหรับรายงาน
8. ✅ เพิ่ม indexes ตามที่แนะนำ

---

**Created**: 2024-11-24
**Status**: ✅ Ready for testing & backend implementation
**Related**: SCRAP_LOCATION_TRACKING.md (LotManagementModal)

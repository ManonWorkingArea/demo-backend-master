# 🏷️ คู่มือระบบ Lot Tracking

> **สำหรับ:** ผู้ใช้งานระบบและนักพัฒนา  
> **อัปเดต:** 24 พฤศจิกายน 2025

---

## 📋 สารบัญ

1. [ความหมายของ Lot Tracking](#ความหมายของ-lot-tracking)
2. [โครงสร้างรหัส Lot](#โครงสร้างรหัส-lot)
3. [การสร้างและจัดการ Lot](#การสร้างและจัดการ-lot)
4. [Lot Status และ Roll Condition](#lot-status-และ-roll-condition)
5. [การติดตามการเคลื่อนไหว](#การติดตามการเคลื่อนไหว)
6. [Best Practices](#best-practices)

---

## ความหมายของ Lot Tracking

### Lot คืออะไร?

**Lot** = ชุดสินค้าที่รับเข้ามาพร้อมกัน มีคุณสมบัติเดียวกัน จากผู้จัดจำหน่ายเดียวกัน ในเวลาเดียวกัน

**การใช้งาน Lot Tracking:**
- ✅ ระบุแหล่งที่มาของสินค้า (Traceability)
- ✅ ติดตามสต็อกแยกตามม้วน/ชุด
- ✅ จัดการการหมดอายุ (FIFO - First In First Out)
- ✅ ตรวจสอบคุณภาพย้อนหลัง
- ✅ แยกการจองและการตัดสต็อคตาม Lot

---

## โครงสร้างรหัส Lot

### รูปแบบรหัส Lot สำหรับสิ่งทอ

```
รูปแบบ: [Model Code][Color Code][Width][Lot Sequence]
ตัวอย่าง: 402-177-152-08883

ส่วนประกอบ:
├─ 402      = Model Code (รหัสรุ่น 3 หลัก)
├─ 177      = Color Code (รหัสสี 3 หลัก)
├─ 152      = Fabric Width (ความกว้าง cm)
└─ 08883    = Lot Sequence (ลำดับ lot 5 หลัก)
```

### ตัวอย่างรหัส Lot

| Full Lot Code | Model | Color | Width | Lot Seq | ความหมาย |
|---------------|-------|-------|-------|---------|----------|
| 402-177-152-08883 | 402 | 177 | 152 | 08883 | ผ้ารุ่น 402 สีกรม กว้าง 152cm ล็อตที่ 08883 |
| 401-045-140-00125 | 401 | 045 | 140 | 00125 | ผ้ารุ่น 401 สีเทา กว้าง 140cm ล็อตที่ 00125 |
| 500-200-160-12345 | 500 | 200 | 160 | 12345 | ผ้ารุ่น 500 สีขาว กว้าง 160cm ล็อตที่ 12345 |

### Auto-Generation

```javascript
// ระบบจะ auto-generate ถ้าไม่ระบุ
const fullLotCode = generateFullLotCode(
  product.model_code,    // 402
  product.color_code,    // 177
  product.fabric_width_cm, // 152
  lot.lot_code           // 08883
)
// Result: "402177152-08883"
```

---

## การสร้างและจัดการ Lot

### 1. สร้าง Lot ใหม่

```javascript
const createLot = async () => {
  const lotData = {
    // === ข้อมูลสินค้า ===
    product_id: 'product_xxx',
    sku: 'SKU-2024-001',
    product_name: 'ผ้าฝ้าย สีกรม 152cm',
    
    // === รหัส Lot ===
    lot_code: '08883',              // 5 หลัก (บังคับ)
    // full_lot_code จะ auto-generate เป็น "402177152-08883"
    
    // === ข้อมูลสิ่งทอ ===
    model_code: '402',
    color_code: '177',
    fabric_width_cm: 152,
    fabric_type: 'cotton',          // cotton, polyester, blend, etc.
    fabric_composition: 'cotton 100%',
    
    // === ปริมาณ ===
    original_meters: 100,           // จำนวนเมตรตอนรับเข้า
    remaining_meters: 100,          // เมตรคงเหลือ
    weight_kg: 30,                  // น้ำหนักรวม
    weight_per_meter: 0.3,          // น้ำหนักต่อเมตร
    
    // === สถานที่จัดเก็บ ===
    location_code: 'WH-01',         // รหัสคลัง
    rack_position: 'A-001',         // ตำแหน่งชั้นวาง
    zone: 'A',                      // โซน
    
    // === ผู้จำหน่าย ===
    supplier_name: 'บริษัท ABC จำกัด',
    supplier_id: 'SUPPLIER-001',
    
    // === ข้อมูลการสั่งซื้อ ===
    purchase_order_id: 'PO-2024-001',
    purchase_order_number: 'PO-001',
    unit_cost: 80,                  // ต้นทุนต่อหน่วย
    unit_price: 120,                // ราคาขายแนะนำ
    
    // === วันที่ ===
    received_date: '2024-11-24',    // วันที่รับเข้า
    manufactured_date: '2024-11-20', // วันที่ผลิต (ถ้ามี)
    expiry_date: null,              // วันหมดอายุ (สำหรับสินค้าที่มีอายุ)
    
    // === คุณภาพ ===
    quality_grade: 'A',             // A, B, C, Defect
    roll_condition: 'full',         // full, partial, empty
    
    // === สถานะ ===
    status: 'available',            // available, reserved, sold, empty, deleted
    
    // === หมายเหตุ ===
    notes: 'คุณภาพดีเยี่ยม เก็บในที่แห้ง',
    
    // === ผู้บันทึก ===
    created_by: 'admin'
  }
  
  const result = await inventoryService.addLotTracking(lotData)
  console.log('✅ สร้าง Lot:', result.full_lot_code)
  return result
}
```

### 2. ดึงข้อมูล Lot

```javascript
const getLots = async (productId) => {
  const lots = await inventoryService.getLotTracking(productId)
  
  lots.forEach(lot => {
    console.log({
      // รหัส Lot
      lot_code: lot.lot_code,
      full_lot_code: lot.full_lot_code,
      
      // ปริมาณ
      original_meters: lot.original_meters,
      remaining_meters: lot.remaining_meters,
      reserved_meters: lot.reserved_meters,
      
      // คำนวณ
      available_meters: lot.remaining_meters - lot.reserved_meters,
      used_meters: lot.original_meters - lot.remaining_meters,
      usage_percent: ((lot.original_meters - lot.remaining_meters) / lot.original_meters * 100).toFixed(2),
      
      // Scrap/Sample Breakdown
      scrap_meters: lot.scrap_meters,        // ของเสีย
      sample_meters: lot.sample_meters,      // ตัวอย่าง
      defective_meters: lot.defective_meters, // ชำรุด
      
      // สถานที่
      location_code: lot.location_code,
      rack_position: lot.rack_position,
      
      // คุณภาพ
      quality_grade: lot.quality_grade,
      roll_condition: lot.roll_condition,
      
      // สถานะ
      status: lot.status,
      
      // ผู้จำหน่าย
      supplier_name: lot.supplier_name,
      
      // วันที่
      received_date: lot.received_date,
      created_at: lot.created_at
    })
  })
  
  return lots
}
```

### 3. อัปเดต Lot

```javascript
const updateLot = async (lotId) => {
  const updates = {
    // อัปเดตปริมาณ (ปกติจะอัปเดตผ่าน movement)
    remaining_meters: 80,
    
    // ย้ายตำแหน่ง
    location_code: 'WH-02',
    rack_position: 'B-005',
    
    // เปลี่ยนสภาพม้วน
    roll_condition: 'partial',
    
    // อัปเดตคุณภาพ
    quality_grade: 'B',
    
    // เพิ่มหมายเหตุ
    notes: 'ย้ายตำแหน่งเนื่องจากปรับปรุงคลัง',
    
    updated_by: 'admin'
  }
  
  const result = await inventoryService.updateLotTracking(lotId, updates)
  console.log('✅ อัปเดต Lot สำเร็จ')
  return result
}
```

### 4. ลบ Lot

```javascript
// Soft Delete (แนะนำ)
const deleteLot = async (lotId) => {
  await inventoryService.deleteLotTracking(lotId, false)
  // status จะเปลี่ยนเป็น 'deleted'
  // ข้อมูลยังอยู่ในระบบ สามารถกู้คืนได้
}

// Hard Delete (ระวัง! ลบถาวร)
const permanentDeleteLot = async (lotId) => {
  await inventoryService.deleteLotTracking(lotId, true)
  // ลบออกจากฐานข้อมูลถาวร ไม่สามารถกู้คืนได้
}

// กู้คืน Lot ที่ถูก soft delete
const restoreLot = async (lotId) => {
  await inventoryService.restoreLotTracking(lotId)
  // status จะเปลี่ยนกลับเป็น 'available'
}
```

---

## Lot Status และ Roll Condition

### Lot Status

| Status | ความหมาย | การใช้งาน |
|--------|----------|-----------|
| `available` | พร้อมใช้ | สามารถจองและตัดสต็อคได้ |
| `reserved` | ถูกจองแล้ว | มีการจองบางส่วนหรือทั้งหมด |
| `sold` | ขายหมดแล้ว | remaining_meters = 0 |
| `empty` | ว่างเปล่า | ไม่มีสินค้าเหลือ |
| `on_hold` | ระงับใช้งาน | ไม่สามารถจองหรือตัดได้ชั่วคราว |
| `quarantine` | กักกัน | รอตรวจสอบคุณภาพ |
| `deleted` | ลบแล้ว | Soft deleted |

### Roll Condition

| Condition | ความหมาย | ปริมาณ |
|-----------|----------|--------|
| `full` | ม้วนเต็ม | 90-100% ของ original |
| `partial` | ม้วนไม่เต็ม | 10-89% ของ original |
| `empty` | ว่างเปล่า | 0% |
| `damaged` | เสียหาย | มีความเสียหาย |

### Quality Grade

| Grade | ความหมาย | การใช้งาน |
|-------|----------|-----------|
| `A` | เกรด A (ดีเยี่ยม) | ขายราคาเต็ม |
| `B` | เกรด B (ดี) | ขายราคาลด 10-20% |
| `C` | เกรด C (พอใช้) | ขายราคาลด 30-50% |
| `Defect` | มีตำหนิ | ลดราคาพิเศษ หรือไม่ขาย |

---

## การติดตามการเคลื่อนไหว

### 1. Stock Movement Log

ทุกครั้งที่ Lot มีการเคลื่อนไหว จะมีการบันทึกใน `stock_movements`:

```javascript
// ตัวอย่าง Movement Record
{
  lot_id: "lot_xxx",
  lot_code: "08883",
  full_lot_code: "402177152-08883",
  
  movement_type: "OUT",           // IN (รับเข้า) | OUT (จ่ายออก)
  transaction_type: "sale",       // sale, return, adjustment, scrap_return, etc.
  
  quantity: 10.5,                 // จำนวนที่เคลื่อนไหว
  unit: "เมตร",
  
  location_code: "WH-01",
  location_type: "warehouse",
  
  // Flags
  is_scrap: false,                // เป็นของเสียหรือไม่
  is_sample: false,               // เป็นตัวอย่างหรือไม่
  count_in_stock: true,           // นับสต็อกหรือไม่
  
  reference_type: "sales_order",
  reference_id: "SO-2024-001",
  
  movement_date: "2024-11-24",
  created_at: "2024-11-24T10:30:00Z"
}
```

### 2. ดูประวัติการเคลื่อนไหวของ Lot

```javascript
const getLotMovements = async (lotId) => {
  const movements = await inventoryService.apiRequest.POST('stock_movements/aggregate', {
    pipeline: [
      {
        $match: {
          lot_id: lotId
        }
      },
      {
        $sort: { created_at: -1 }
      }
    ]
  }, inventoryService.clientKey)
  
  console.log(`พบ ${movements.data.length} รายการเคลื่อนไหว`)
  
  movements.data.forEach(m => {
    console.log({
      date: m.movement_date,
      type: `${m.movement_type} - ${m.transaction_type}`,
      quantity: m.quantity,
      location: m.location_code,
      reference: m.reference_number,
      notes: m.notes
    })
  })
  
  return movements.data
}
```

### 3. การคำนวณสต็อคคงเหลือ

```javascript
const calculateLotBalance = (lot) => {
  return {
    // สต็อกทั้งหมด
    total_stock: lot.remaining_meters,
    
    // จองไว้
    reserved: lot.reserved_meters,
    
    // แยกการจองตามประเภท
    temporary_reserved: lot.temporary_reserved_meters, // unpaid, deposit
    permanent_reserved: lot.permanent_reserved_meters, // paid
    
    // พร้อมใช้
    available: lot.remaining_meters - lot.reserved_meters,
    
    // ใช้ไปแล้ว
    used: lot.original_meters - lot.remaining_meters,
    
    // เปอร์เซ็นต์การใช้งาน
    usage_percent: ((lot.original_meters - lot.remaining_meters) / lot.original_meters * 100).toFixed(2),
    
    // ของเสีย/ตัวอย่าง (ไม่นับสต็อก)
    scrap: lot.scrap_meters || 0,
    sample: lot.sample_meters || 0,
    defective: lot.defective_meters || 0,
    
    // สรุปรวม
    total_accounted: lot.remaining_meters + lot.reserved_meters + 
                     (lot.scrap_meters || 0) + (lot.sample_meters || 0) + 
                     (lot.defective_meters || 0)
  }
}
```

---

## Best Practices

### 1. การตั้งชื่อ Lot Code

```javascript
// ✅ ดี: ใช้ running number 5 หลัก
lot_code: "00001", "00002", "00003", ...

// ✅ ดี: ใช้วันที่ + running
lot_code: "24112401", "24112402", ... (YYMMDD + XX)

// ❌ หลีกเลี่ยง: รหัสสุ่มที่อ่านยาก
lot_code: "A1B2C3"
```

### 2. FIFO (First In First Out)

```javascript
/**
 * เลือก Lot ตามหลัก FIFO - ล็อตที่เข้าก่อนขายก่อน
 */
const selectLotByFIFO = (lots) => {
  return lots
    .filter(lot => lot.status === 'available' && lot.remaining_meters > 0)
    .sort((a, b) => new Date(a.received_date) - new Date(b.received_date))
    [0] // เอาล็อตแรก (เข้าก่อนสุด)
}
```

### 3. การจัดการ Lot ที่เหลือน้อย

```javascript
/**
 * แจ้งเตือน Lot ที่เหลือน้อย
 */
const checkLowStockLots = (lots, threshold = 10) => {
  return lots.filter(lot => {
    const available = lot.remaining_meters - lot.reserved_meters
    return available > 0 && available <= threshold
  })
}

// ใช้งาน
const lowStockLots = checkLowStockLots(lots, 10)
if (lowStockLots.length > 0) {
  console.log(`⚠️ มี ${lowStockLots.length} ล็อตที่เหลือน้อย (≤ 10 เมตร)`)
}
```

### 4. การรวม Lot (Lot Consolidation)

```javascript
/**
 * รวม Lot ที่เหลือน้อยหลายๆ ล็อตเข้าด้วยกัน
 * ใช้เมื่อมี partial rolls หลายม้วนของสินค้าเดียวกัน
 */
const consolidateLots = async (sourceLotIds, targetLotId) => {
  // 1. รวม quantity จาก source lots
  const totalMeters = sourceLotIds.reduce((sum, id) => {
    const lot = getLotById(id)
    return sum + lot.remaining_meters
  }, 0)
  
  // 2. เพิ่ม quantity ให้ target lot
  await inventoryService.updateLotTracking(targetLotId, {
    remaining_meters: targetLot.remaining_meters + totalMeters,
    roll_condition: 'full',
    notes: `รวมจาก ${sourceLotIds.length} ล็อต`
  })
  
  // 3. ลบ source lots
  for (const id of sourceLotIds) {
    await inventoryService.deleteLotTracking(id, false)
  }
  
  console.log(`✅ รวม ${sourceLotIds.length} ล็อต → ${targetLotId}`)
}
```

### 5. การตรวจสอบความถูกต้อง

```javascript
/**
 * ตรวจสอบความสอดคล้องของข้อมูล Lot
 */
const validateLot = (lot) => {
  const errors = []
  
  // ตรวจสอบ remaining <= original
  if (lot.remaining_meters > lot.original_meters) {
    errors.push('remaining_meters ไม่ควรมากกว่า original_meters')
  }
  
  // ตรวจสอบ reserved <= remaining
  if (lot.reserved_meters > lot.remaining_meters) {
    errors.push('reserved_meters ไม่ควรมากกว่า remaining_meters')
  }
  
  // ตรวจสอบ available >= 0
  const available = lot.remaining_meters - lot.reserved_meters
  if (available < 0) {
    errors.push('available_meters ต้องไม่ติดลบ')
  }
  
  // ตรวจสอบ weight vs meters
  const calculatedWeight = lot.remaining_meters * lot.weight_per_meter
  if (Math.abs(calculatedWeight - lot.weight_kg) > 0.1) {
    errors.push('น้ำหนักไม่สอดคล้องกับจำนวนเมตร')
  }
  
  if (errors.length > 0) {
    console.error('❌ Lot Validation Errors:', errors)
    return false
  }
  
  console.log('✅ Lot data valid')
  return true
}
```

### 6. Lot Reporting

```javascript
/**
 * สรุปรายงาน Lot
 */
const generateLotReport = (lots) => {
  const report = {
    total_lots: lots.length,
    
    by_status: {
      available: lots.filter(l => l.status === 'available').length,
      reserved: lots.filter(l => l.status === 'reserved').length,
      sold: lots.filter(l => l.status === 'sold').length,
      empty: lots.filter(l => l.status === 'empty').length
    },
    
    by_condition: {
      full: lots.filter(l => l.roll_condition === 'full').length,
      partial: lots.filter(l => l.roll_condition === 'partial').length,
      empty: lots.filter(l => l.roll_condition === 'empty').length
    },
    
    by_grade: {
      A: lots.filter(l => l.quality_grade === 'A').length,
      B: lots.filter(l => l.quality_grade === 'B').length,
      C: lots.filter(l => l.quality_grade === 'C').length,
      Defect: lots.filter(l => l.quality_grade === 'Defect').length
    },
    
    stock_summary: {
      total_meters: lots.reduce((sum, l) => sum + l.remaining_meters, 0),
      reserved_meters: lots.reduce((sum, l) => sum + l.reserved_meters, 0),
      available_meters: lots.reduce((sum, l) => sum + (l.remaining_meters - l.reserved_meters), 0),
      
      scrap_meters: lots.reduce((sum, l) => sum + (l.scrap_meters || 0), 0),
      sample_meters: lots.reduce((sum, l) => sum + (l.sample_meters || 0), 0),
      defective_meters: lots.reduce((sum, l) => sum + (l.defective_meters || 0), 0)
    },
    
    oldest_lot: lots.sort((a, b) => new Date(a.received_date) - new Date(b.received_date))[0],
    newest_lot: lots.sort((a, b) => new Date(b.received_date) - new Date(a.received_date))[0]
  }
  
  console.log('📊 Lot Report:', report)
  return report
}
```

---

## 🎯 สรุป

### ✅ สิ่งที่ควรทำ

1. ใช้รหัส Lot ที่เป็นระบบและอ่านง่าย
2. บันทึกข้อมูล Lot ครบถ้วน (ผู้จำหน่าย, วันที่, คุณภาพ)
3. อัปเดต remaining_meters ผ่าน stock_movements เสมอ
4. ใช้หลัก FIFO ในการเลือก Lot
5. ตรวจสอบความถูกต้องของข้อมูลเป็นประจำ
6. เก็บ Lot ที่ใช้หมดแล้วไว้เป็นประวัติ (ไม่ควร hard delete)

### ❌ สิ่งที่ไม่ควรทำ

1. อัปเดต remaining_meters โดยตรง (ควรผ่าน movement)
2. ลบ Lot ที่มี transaction ผูกอยู่
3. ใช้รหัส Lot ซ้ำกัน
4. ปล่อยให้มี partial rolls มากเกินไป
5. ไม่บันทึก location_code และ rack_position

---

**📧 ติดต่อ:** ERP Development Team  
**🔗 เอกสารที่เกี่ยวข้อง:**
- [INVENTORY_SERVICE_GUIDE.md](./INVENTORY_SERVICE_GUIDE.md)
- [STOCK_LOCATION_GUIDE.md](./STOCK_LOCATION_GUIDE.md)
- [SCRAP_SAMPLE_GUIDE.md](./SCRAP_SAMPLE_GUIDE.md)

# 🗑️ คู่มือจัดการของเสีย ตัวอย่าง และสินค้าชำรุด

> **สำหรับ:** ผู้ใช้งานและนักพัฒนา  
> **อัปเดต:** 24 พฤศจิกายน 2025

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [Stock Location Types](#stock-location-types)
3. [การรับคืนเข้า Scrap](#การรับคืนเข้า-scrap)
4. [การรับคืนเข้า Sample](#การรับคืนเข้า-sample)
5. [การจัดการสินค้าชำรุด](#การจัดการสินค้าชำรุด)
6. [การแสดงผลและรายงาน](#การแสดงผลและรายงาน)
7. [Best Practices](#best-practices)

---

## ภาพรวมระบบ

### ทำไมต้องแยก Scrap/Sample?

**ปัญหาเดิม:**
- สินค้าเสียหายถูกนับรวมกับสต็อกปกติ → ตัวเลขไม่ตรง
- ไม่มีร่องรอยของสินค้าที่เสียหาย → ตรวจสอบย้อนหลังไม่ได้
- ตัวอย่างสินค้านับเป็นสต็อกขาย → คำนวณผิดพลาด

**วิธีแก้:**
- แยก **Stock Location** ตามประเภท: warehouse, scrap, sample, virtual
- บันทึก **ร่องรอย** ทุกการเคลื่อนไหวใน `stock_movements`
- **ไม่นับสต็อก** สำหรับ scrap/sample แต่เก็บข้อมูลไว้ตรวจสอบ
- แสดงผล **แยกประเภท** ใน UI

---

## Stock Location Types

### 1. Warehouse (คลังปกติ)

```javascript
{
  code: "WH-01",
  name: "คลังหลัก ชั้น 1",
  type: "warehouse",  // ✅ คลังปกติ
  status: "active"
}
```

**การใช้งาน:**
- เก็บสินค้าปกติที่พร้อมขาย
- **นับสต็อก** (count_in_stock: true)
- รับคืนสินค้าสภาพดี

---

### 2. Scrap (คลังของเสีย)

```javascript
{
  code: "SCRAP-01",
  name: "คลังของเสีย",
  type: "scrap",  // ✅ คลังของเสีย
  status: "active",
  description: "เก็บสินค้าที่เสียหาย ไม่นับสต็อก"
}
```

**การใช้งาน:**
- เก็บสินค้าที่เสียหาย ขาด ฉีก เปื้อน
- **ไม่นับสต็อก** (count_in_stock: false)
- มีร่องรอยใน stock_movements และ inventory_balance.scrap_qty
- ใช้สำหรับ: รายงานของเสีย, ตรวจสอบ loss rate

**ตัวอย่างการสร้าง:**

```javascript
const createScrapLocation = async () => {
  const scrapData = {
    code: 'SCRAP-01',
    name: 'คลังของเสีย',
    type: 'scrap',
    zone: 'Z',
    status: 'active',
    description: 'เก็บสินค้าที่เสียหาย ไม่สามารถขายได้'
  }
  
  const result = await inventoryService.createStockLocation(scrapData)
  console.log('✅ สร้างคลังของเสียสำเร็จ')
  return result
}
```

---

### 3. Sample (คลังตัวอย่าง)

```javascript
{
  code: "SAMPLE-01",
  name: "คลังตัวอย่าง",
  type: "sample",  // ✅ คลังตัวอย่าง
  status: "active",
  description: "เก็บตัวอย่างสินค้า ไม่นับสต็อกขาย"
}
```

**การใช้งาน:**
- เก็บตัวอย่างสินค้าสำหรับโชว์ลูกค้า
- **ไม่นับสต็อกขาย** (count_in_stock: false)
- มีร่องรอยใน stock_movements และ inventory_balance.sample_qty
- ใช้สำหรับ: ห้องโชว์รูม, ตัวอย่างส่งลูกค้า

**ตัวอย่างการสร้าง:**

```javascript
const createSampleLocation = async () => {
  const sampleData = {
    code: 'SAMPLE-01',
    name: 'ห้องโชว์รูม',
    type: 'sample',
    zone: 'S',
    building: 'อาคารหลัก',
    floor: '1',
    status: 'active',
    description: 'ตัวอย่างสินค้าสำหรับลูกค้า'
  }
  
  const result = await inventoryService.createStockLocation(sampleData)
  console.log('✅ สร้างคลังตัวอย่างสำเร็จ')
  return result
}
```

---

### 4. Virtual (คลังเสมือน)

```javascript
{
  code: "VIRTUAL-01",
  name: "คลังเสมือน",
  type: "virtual",  // ✅ คลังเสมือน
  status: "active"
}
```

**การใช้งาน:**
- ใช้สำหรับสินค้าที่ยังไม่ได้รับจริง (pre-order, consignment)
- สำหรับ adjustment, transfer

---

## การรับคืนเข้า Scrap

### กรณีที่ 1: ลูกค้าคืนสินค้าเสียหาย

```javascript
/**
 * รับคืนสินค้าที่เสียหาย เข้าคลังของเสีย
 */
const returnDamagedGoodsToScrap = async () => {
  try {
    const returnData = {
      // Lot Info
      lot_id: 'lot_xxx',
      movement_id: 'movement_xxx', // reference ไปยังการขายเดิม
      
      // Return Details
      return_meters: 5,
      return_type: 'defective', // refund | exchange | defective
      reason: 'ผ้าขาด เปื้อนน้ำมัน',
      customer_name: 'บริษัท ABC',
      reference_number: 'RETURN-001',
      
      // ✅ Scrap Location
      return_location_code: 'SCRAP-01',
      location_type: 'scrap',
      is_scrap_return: true,      // ✅ Flag: เป็นของเสีย
      count_in_stock: false,       // ✅ สำคัญ! ไม่นับสต็อก
      
      notes: 'สินค้าเสียหาย ไม่สามารถนำกลับมาขายได้'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    
    console.log('✅ บันทึกของเสียสำเร็จ:')
    console.log('   Location:', result.movement_created.location_code)
    console.log('   Movement Type:', result.movement_created.movement_type) // "OUT"
    console.log('   Is Scrap:', result.movement_created.is_scrap) // true
    console.log('   Count in Stock:', result.movement_created.count_in_stock) // false
    console.log('   Scrap Qty:', result.balance_updated.scrap_qty)
    
    // ✅ ผลลัพธ์:
    // - stock_movements สร้างด้วย is_scrap: true, count_in_stock: false
    // - lot.remaining_meters ไม่เปลี่ยนแปลง (ไม่เพิ่มกลับ)
    // - balance.scrap_qty เพิ่มขึ้น 5 เมตร
    // - UI จะแสดง "ของเสีย: 5 ม." (สีแดง)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### กรณีที่ 2: ตรวจพบของเสียในคลัง

```javascript
/**
 * พบของเสียขณะตรวจนับสต็อก
 */
const recordScrapFound = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      
      return_meters: 3,
      return_type: 'defective',
      reason: 'พบความเสียหายขณะตรวจสอบคุณภาพ',
      
      // Scrap Location
      return_location_code: 'SCRAP-01',
      location_type: 'scrap',
      is_scrap_return: true,
      count_in_stock: false,
      
      notes: 'ตรวจพบ: ผ้าซีดสี, มีรอยตำหนิ 3 จุด'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    console.log('✅ บันทึกของเสียจากการตรวจสอบสำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### Data Flow: Return to Scrap

```
┌──────────────────────────────────────────────────┐
│ 1. User เลือกสินค้าที่จะคืน                       │
│    - Lot: LOT-08883                              │
│    - จำนวน: 5 เมตร                               │
│    - Location: SCRAP-01 (type: scrap)           │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│ 2. InventoryService.returnLotStock()             │
│    - สร้าง stock_returns record                 │
│    - สร้าง stock_movements:                     │
│      {                                           │
│        movement_type: "OUT",                     │
│        location_code: "SCRAP-01",                │
│        is_scrap: true,                           │
│        count_in_stock: false                     │
│      }                                           │
│    - ไม่อัปเดต lot.remaining_meters              │
│    - อัปเดต balance.scrap_qty += 5               │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│ 3. Database Records                              │
│                                                  │
│ stock_movements:                                 │
│ ├─ movement_type: "OUT"                          │
│ ├─ is_scrap: true                                │
│ ├─ count_in_stock: false                         │
│ └─ quantity: 5                                   │
│                                                  │
│ inventory_balance:                               │
│ ├─ qty_on_hand: 100 (ไม่เปลี่ยน)                │
│ └─ scrap_qty: 5 (เพิ่มขึ้น)                      │
│                                                  │
│ lot_tracking:                                    │
│ └─ remaining_meters: 100 (ไม่เปลี่ยน)            │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│ 4. UI Display                                    │
│                                                  │
│ LotDetailModal:                                  │
│ ┌─────────────────────────────────────┐          │
│ │ 🗑️ ของเสีย: 5 ม. (สีแดง)           │          │
│ └─────────────────────────────────────┘          │
│                                                  │
│ ProductLotSummary:                               │
│ ┌─────────────────────────────────────┐          │
│ │ ของเสีย (รวมทั้งหมด): 5 ม.          │          │
│ └─────────────────────────────────────┘          │
└──────────────────────────────────────────────────┘
```

---

## การรับคืนเข้า Sample

### กรณีที่ 1: เก็บตัวอย่างสินค้า

```javascript
/**
 * เก็บสินค้าเป็นตัวอย่างโชว์ลูกค้า
 */
const moveToSample = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      
      return_meters: 2,
      return_type: 'refund',
      reason: 'เก็บไว้เป็นตัวอย่างในห้องโชว์รูม',
      
      // ✅ Sample Location
      return_location_code: 'SAMPLE-01',
      location_type: 'sample',
      is_sample: true,             // ✅ Flag: เป็นตัวอย่าง
      count_in_stock: false,        // ✅ ไม่นับสต็อกขาย
      
      notes: 'สำหรับโชว์ลูกค้าในห้องโชว์รูม'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    
    console.log('✅ บันทึกตัวอย่างสำเร็จ:')
    console.log('   Location:', result.movement_created.location_code)
    console.log('   Is Sample:', result.movement_created.is_sample) // true
    console.log('   Sample Qty:', result.balance_updated.sample_qty)
    
    // ✅ ผลลัพธ์:
    // - movement: is_sample: true, count_in_stock: false
    // - lot.remaining_meters ไม่เปลี่ยน
    // - balance.sample_qty เพิ่มขึ้น 2 เมตร
    // - UI แสดง "ตัวอย่าง: 2 ม." (สีเขียว)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### กรณีที่ 2: ส่งตัวอย่างให้ลูกค้า

```javascript
/**
 * ตัดตัวอย่างส่งให้ลูกค้าดู
 */
const sendSampleToCustomer = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      
      return_meters: 1,
      return_type: 'exchange',
      reason: 'ส่งตัวอย่างให้ลูกค้า ABC',
      customer_name: 'บริษัท ABC จำกัด',
      
      return_location_code: 'SAMPLE-01',
      location_type: 'sample',
      is_sample: true,
      count_in_stock: false,
      
      notes: 'ส่งตัวอย่างเพื่อพิจารณาสั่งซื้อจำนวนมาก'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    console.log('✅ บันทึกตัวอย่างส่งลูกค้าสำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## การจัดการสินค้าชำรุด

### Defective vs Scrap

| ประเภท | Defective (ชำรุด) | Scrap (ของเสีย) |
|--------|------------------|-----------------|
| ความหมาย | สินค้าชำรุด อาจซ่อมได้ | สินค้าเสียหายถาวร |
| Return Type | `defective` | `defective` |
| Location | คลังปกติ หรือ Scrap | Scrap |
| Flag | ไม่มี flag พิเศษ | is_scrap: true |
| นับสต็อก | ไม่นับ | ไม่นับ |
| Balance Field | defective_qty | scrap_qty |

### รับคืนสินค้าชำรุด

```javascript
/**
 * รับคืนสินค้าที่มีตำหนิ รอตรวจสอบ/ซ่อม
 */
const returnDefectiveGoods = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      
      return_meters: 3,
      return_type: 'defective',  // ✅ ประเภทชำรุด
      reason: 'สีไม่ตรงตามสเปค รอตรวจสอบจากผู้จำหน่าย',
      customer_name: 'บริษัท XYZ',
      
      // อาจเข้าคลังปกติ หรือ Scrap ขึ้นกับนโยบาย
      return_location_code: 'WH-QUARANTINE',
      location_type: 'warehouse',
      count_in_stock: false,      // ✅ ไม่นับสต็อก
      
      notes: 'รอผู้จำหน่ายมาตรวจสอบ'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    
    console.log('✅ บันทึกสินค้าชำรุดสำเร็จ:')
    console.log('   Defective Qty:', result.balance_updated.defective_qty)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## การแสดงผลและรายงาน

### 1. แสดงใน Lot Detail Modal

```vue
<!-- LotDetailModal.vue -->
<template>
  <!-- Main Stock Summary -->
  <div class="grid grid-cols-5 gap-3">
    <div>Total: {{ lot.remaining_meters }} ม.</div>
    <div>Reserved: {{ lot.reserved_meters }} ม.</div>
    <div>Available: {{ lot.remaining_meters - lot.reserved_meters }} ม.</div>
    <div>Weight: {{ lot.weight_kg }} kg</div>
    <div>Meters/Kg: {{ metersPerKg }}</div>
  </div>

  <!-- Scrap/Sample/Defective Breakdown -->
  <div 
    v-if="lot.scrap_meters || lot.sample_meters || lot.defective_meters"
    class="mt-3 pt-3 border-t grid grid-cols-3 gap-3"
  >
    <!-- ของเสีย -->
    <div v-if="lot.scrap_meters" class="bg-red-50 border-red-200">
      <i class="fas fa-trash-alt text-red-600"></i> ของเสีย
      <div class="text-red-700 font-bold">{{ lot.scrap_meters }} ม.</div>
    </div>
    
    <!-- ตัวอย่าง -->
    <div v-if="lot.sample_meters" class="bg-green-50 border-green-200">
      <i class="fas fa-flask text-green-600"></i> ตัวอย่าง
      <div class="text-green-700 font-bold">{{ lot.sample_meters }} ม.</div>
    </div>
    
    <!-- ชำรุด -->
    <div v-if="lot.defective_meters" class="bg-amber-50 border-amber-200">
      <i class="fas fa-exclamation-circle text-amber-600"></i> ชำรุด
      <div class="text-amber-700 font-bold">{{ lot.defective_meters }} ม.</div>
    </div>
  </div>
</template>
```

### 2. แสดงใน Product Summary

```vue
<!-- ProductLotSummary.vue -->
<template>
  <!-- Main Summary Cards (9 cards) -->
  <div class="grid grid-cols-9 gap-3">
    <!-- ... existing cards ... -->
  </div>

  <!-- Scrap/Sample/Defective Summary (ถ้ามีข้อมูล) -->
  <div 
    v-if="lotSummary.scrapMeters || lotSummary.sampleMeters || lotSummary.defectiveMeters"
    class="grid grid-cols-3 gap-3 mt-3"
  >
    <!-- ของเสีย -->
    <div v-if="lotSummary.scrapMeters > 0" class="bg-red-50">
      🗑️ ของเสีย: {{ lotSummary.scrapMeters.toFixed(0) }} ม.
    </div>
    
    <!-- ตัวอย่าง -->
    <div v-if="lotSummary.sampleMeters > 0" class="bg-green-50">
      🧪 ตัวอย่าง: {{ lotSummary.sampleMeters.toFixed(0) }} ม.
    </div>
    
    <!-- ชำรุด -->
    <div v-if="lotSummary.defectiveMeters > 0" class="bg-amber-50">
      ⚠️ ชำรุด: {{ lotSummary.defectiveMeters.toFixed(0) }} ม.
    </div>
  </div>
</template>

<script setup>
const lotSummary = computed(() => {
  const summary = lotData.value.reduce((acc, lot) => {
    acc.totalMeters += lot.remaining_meters || 0
    acc.scrapMeters += lot.scrap_meters || 0      // ✅ รวมของเสีย
    acc.sampleMeters += lot.sample_meters || 0    // ✅ รวมตัวอย่าง
    acc.defectiveMeters += lot.defective_meters || 0 // ✅ รวมชำรุด
    return acc
  }, {
    totalMeters: 0,
    scrapMeters: 0,
    sampleMeters: 0,
    defectiveMeters: 0
  })
  
  return summary
})
</script>
```

### 3. รายงานสรุป

```javascript
/**
 * รายงานของเสีย/ตัวอย่าง/ชำรุด รายสินค้า
 */
const generateScrapSampleReport = async (productId) => {
  try {
    const balance = await inventoryService.getInventoryBalance(productId)
    const lots = await inventoryService.getLotTracking(productId)
    
    const report = {
      product_id: productId,
      product_name: balance.product_name,
      
      // Summary
      total_stock: balance.qty_on_hand,
      available_stock: balance.qty_available,
      reserved_stock: balance.qty_reserved,
      
      // Scrap/Sample/Defective
      scrap_qty: balance.scrap_qty || 0,
      sample_qty: balance.sample_qty || 0,
      defective_qty: balance.defective_qty || 0,
      
      // Percentage
      scrap_percent: ((balance.scrap_qty / balance.qty_on_hand) * 100).toFixed(2),
      sample_percent: ((balance.sample_qty / balance.qty_on_hand) * 100).toFixed(2),
      defective_percent: ((balance.defective_qty / balance.qty_on_hand) * 100).toFixed(2),
      
      // Lot Breakdown
      lots: lots.map(lot => ({
        lot_code: lot.lot_code,
        scrap_meters: lot.scrap_meters || 0,
        sample_meters: lot.sample_meters || 0,
        defective_meters: lot.defective_meters || 0
      }))
    }
    
    console.log('📊 Scrap/Sample Report:')
    console.log('   Scrap:', report.scrap_qty, 'ม.', `(${report.scrap_percent}%)`)
    console.log('   Sample:', report.sample_qty, 'ม.', `(${report.sample_percent}%)`)
    console.log('   Defective:', report.defective_qty, 'ม.', `(${report.defective_percent}%)`)
    
    return report
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Best Practices

### 1. การตั้งชื่อ Location

```javascript
// ✅ ดี: ชื่อชัดเจน บอกวัตถุประสงค์
const locations = [
  { code: 'SCRAP-01', name: 'คลังของเสีย - ชั้น 1' },
  { code: 'SAMPLE-SHOWROOM', name: 'ห้องโชว์รูม' },
  { code: 'SAMPLE-CUSTOMER', name: 'ตัวอย่างส่งลูกค้า' }
]

// ❌ หลีกเลี่ยง: ชื่อไม่ชัดเจน
const badLocations = [
  { code: 'LOC-999', name: 'อื่นๆ' },
  { code: 'TEMP', name: 'Temp' }
]
```

### 2. การบันทึกเหตุผล

```javascript
// ✅ ดี: ระบุเหตุผลละเอียด
const returnData = {
  reason: 'ผ้าขาดตรงกลางม้วน ความยาว 15 cm, เปื้อนน้ำมันขนาด 10x10 cm',
  notes: 'พบขณะตรวจสอบคุณภาพก่อนส่งมอบลูกค้า, เจ้าหน้าที่: นาย A'
}

// ❌ หลีกเลี่ยง: ไม่ระบุเหตุผล
const badReturnData = {
  reason: 'เสีย',
  notes: ''
}
```

### 3. การแยกประเภท Scrap อย่างชัดเจน

```javascript
/**
 * แนวทางการแยกประเภท
 */
const categorizeReturn = (condition) => {
  if (condition === 'ผ้าขาด' || condition === 'ผ้าฉีก' || condition === 'เปื้อนถาวร') {
    return {
      location_code: 'SCRAP-01',
      is_scrap_return: true,
      count_in_stock: false
    }
  }
  
  if (condition === 'ตัวอย่าง' || condition === 'โชว์รูม') {
    return {
      location_code: 'SAMPLE-01',
      is_sample: true,
      count_in_stock: false
    }
  }
  
  if (condition === 'สีไม่ตรง' || condition === 'รอตรวจสอบ') {
    return {
      location_code: 'WH-QUARANTINE',
      return_type: 'defective',
      count_in_stock: false
    }
  }
  
  // Default: คืนเข้าคลังปกติ
  return {
    location_code: 'WH-01',
    count_in_stock: true
  }
}
```

### 4. การตรวจสอบ Scrap Rate

```javascript
/**
 * คำนวณและเตือนเมื่อ Scrap Rate สูง
 */
const checkScrapRate = (balance, threshold = 5) => {
  const totalStock = balance.qty_on_hand + (balance.scrap_qty || 0)
  const scrapRate = (balance.scrap_qty / totalStock) * 100
  
  if (scrapRate > threshold) {
    console.warn(`⚠️ Scrap Rate สูง: ${scrapRate.toFixed(2)}%`)
    console.warn(`   สินค้า: ${balance.product_name}`)
    console.warn(`   ของเสีย: ${balance.scrap_qty} ม.`)
    console.warn(`   แนะนำ: ตรวจสอบคุณภาพจากผู้จำหน่าย`)
    
    return {
      alert: true,
      rate: scrapRate,
      suggestion: 'ตรวจสอบคุณภาพจากผู้จำหน่าย'
    }
  }
  
  return {
    alert: false,
    rate: scrapRate
  }
}
```

### 5. การทำ Scrap Disposal

```javascript
/**
 * บันทึกการกำจัดของเสีย (นำออกจากคลัง)
 */
const disposeScrap = async () => {
  try {
    // สร้าง movement แยกสำหรับการกำจัด
    const disposalData = {
      product_id: 'product_xxx',
      lot_id: 'lot_xxx',
      
      movement_type: 'OUT',
      transaction_type: 'scrap_disposal',
      quantity: 10,
      
      location_code: 'SCRAP-01',
      is_scrap: true,
      
      notes: 'กำจัดของเสียตามระเบียบ วันที่ 2024-11-24',
      disposal_method: 'recycle', // recycle, landfill, donate
      disposal_by: 'admin',
      disposal_date: '2024-11-24'
    }
    
    const movement = await inventoryService.createStockMovement(disposalData)
    
    // อัปเดต balance (ลด scrap_qty)
    const balance = await inventoryService.getInventoryBalance(productId)
    await inventoryService.apiRequest.PUT(`inventory_balance/${balance._id}`, {
      data: {
        scrap_qty: balance.scrap_qty - 10
      }
    }, inventoryService.clientKey)
    
    console.log('✅ กำจัดของเสียสำเร็จ 10 เมตร')
    
    return movement
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## 🎯 สรุป

### ✅ Key Points

1. **แยก Location ตามประเภท**: warehouse, scrap, sample, virtual
2. **ใช้ Flags ให้ถูกต้อง**: is_scrap, is_sample, count_in_stock
3. **บันทึกเหตุผลทุกครั้ง**: reason และ notes ต้องชัดเจน
4. **ตรวจสอบ Scrap Rate**: เฝ้าระวังของเสียสูงผิดปกติ
5. **แสดงผลแยกประเภท**: UI ต้องแยก scrap/sample/defective ชัดเจน

### 📊 Data Fields ที่สำคัญ

**stock_movements:**
- `is_scrap` (boolean) - เป็นของเสียหรือไม่
- `is_sample` (boolean) - เป็นตัวอย่างหรือไม่
- `count_in_stock` (boolean) - นับสต็อกหรือไม่

**inventory_balance:**
- `scrap_qty` (number) - จำนวนของเสีย
- `sample_qty` (number) - จำนวนตัวอย่าง
- `defective_qty` (number) - จำนวนชำรุด

**lot_tracking (from getLotTracking):**
- `scrap_meters` (number) - ของเสียของ lot นี้
- `sample_meters` (number) - ตัวอย่างของ lot นี้
- `defective_meters` (number) - ชำรุดของ lot นี้

---

**📧 ติดต่อ:** ERP Development Team  
**🔗 เอกสารที่เกี่ยวข้อง:**
- [INVENTORY_SERVICE_GUIDE.md](./INVENTORY_SERVICE_GUIDE.md)
- [LOT_TRACKING_GUIDE.md](./LOT_TRACKING_GUIDE.md)
- [STOCK_LOCATION_GUIDE.md](./STOCK_LOCATION_GUIDE.md)

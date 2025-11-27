# 📖 README - Inventory Module Documentation

> **คู่มือการใช้งานระบบ Inventory Management**  
> **สำหรับ:** นักพัฒนา และผู้ใช้งานระบบ

---

## 📚 เอกสารทั้งหมด

### 🎯 คู่มือหลัก

1. **[INVENTORY_SERVICE_GUIDE.md](./INVENTORY_SERVICE_GUIDE.md)**  
   📦 คู่มือการใช้งาน InventoryService API  
   - การเริ่มต้นใช้งาน
   - Product Management (CRUD)
   - Stock Location Management
   - Lot Tracking System
   - Stock Movement (รับเข้า/ตัดสต็อก/รับคืน)
   - Stock Reservation (จองสต็อค)
   - Inventory Balance
   - Error Handling

2. **[LOT_TRACKING_GUIDE.md](./LOT_TRACKING_GUIDE.md)**  
   🏷️ คู่มือระบบ Lot Tracking  
   - ความหมายและการใช้งาน Lot
   - โครงสร้างรหัส Lot (402-177-152-08883)
   - การสร้างและจัดการ Lot
   - Lot Status & Roll Condition
   - การติดตามการเคลื่อนไหว
   - Best Practices

3. **[SCRAP_SAMPLE_GUIDE.md](./SCRAP_SAMPLE_GUIDE.md)**  
   🗑️ คู่มือจัดการของเสีย ตัวอย่าง และสินค้าชำรุด  
   - Stock Location Types (warehouse, scrap, sample, virtual)
   - การรับคืนเข้า Scrap
   - การรับคืนเข้า Sample
   - การจัดการสินค้าชำรุด (Defective)
   - การแสดงผลและรายงาน
   - Best Practices

---

## 🚀 Quick Start

### การเริ่มต้นใช้งาน

```javascript
// 1. Import Service
import { inventoryService } from '@/services/InventoryService'

// 2. หรือใช้ผ่าน ERP_CORE
const inventory = window.ERP_CORE.inventory

// 3. ตรวจสอบสถานะ
if (inventory.isReady()) {
  console.log('✅ Inventory Service Ready')
}
```

### ตัวอย่างการใช้งานพื้นฐาน

```javascript
// ดึงสินค้าทั้งหมด
const products = await inventory.getAllProducts()

// ดึงข้อมูล Lot ของสินค้า
const lots = await inventory.getLotTracking(productId)

// จองสต็อค
const reservation = await inventory.reserveLotStock({
  lot_id: 'lot_xxx',
  reserved_meters: 10,
  customer_name: 'บริษัท ABC'
})

// รับคืนเข้า Scrap
const result = await inventory.returnLotStock({
  lot_id: 'lot_xxx',
  return_meters: 5,
  return_location_code: 'SCRAP-01',
  is_scrap_return: true,
  count_in_stock: false
})
```

---

## 📋 ฟีเจอร์หลัก

### ✅ Product Management
- สร้าง/แก้ไข/ลบสินค้า
- Soft Delete (ไม่ลบถาวร)
- ค้นหาด้วย Barcode/SKU
- ดึงข้อมูลครบถ้วนพร้อม Inventory

### ✅ Lot Tracking
- สร้าง Lot พร้อมรหัส Auto-generate
- ติดตามสต็อคแยกตาม Lot
- รองรับรหัสสิ่งทอ: 402-177-152-08883
- ดู Reservation & Scrap breakdown

### ✅ Stock Movement
- รับเข้าสินค้า (Goods Receipt)
- ตัดสต็อค (Cut/Issue)
- รับคืนสินค้า (Return)
  - คืนเข้าคลังปกติ
  - คืนเข้า Scrap
  - คืนเข้า Sample

### ✅ Stock Reservation
- จองสต็อคจาก Lot
- แยกประเภท: unpaid, deposit, paid
- Auto-expire (7 วัน)
- ยกเลิกการจอง
- ยืนยันการชำระเงิน

### ✅ Stock Location
- 4 ประเภท: warehouse, scrap, sample, virtual
- จัดการคลังสินค้า
- Rack Position Tracking

### ✅ Scrap/Sample Management
- แยกคลังของเสีย (ไม่นับสต็อก)
- แยกคลังตัวอย่าง (ไม่นับสต็อกขาย)
- บันทึกสินค้าชำรุด
- รายงาน Scrap Rate

### ✅ Inventory Balance
- สต็อครวมทั้งหมด (qty_on_hand)
- สต็อคพร้อมใช้ (qty_available)
- สต็อคจอง (qty_reserved)
- ของเสีย (scrap_qty)
- ตัวอย่าง (sample_qty)
- ชำรุด (defective_qty)

---

## 🗄️ Database Collections

### Core Collections

| Collection | จุดประสงค์ | เอกสารอ้างอิง |
|-----------|----------|--------------|
| `products` | ข้อมูลสินค้า | INVENTORY_SERVICE_GUIDE.md |
| `stock_locations` | คลังสินค้า | SCRAP_SAMPLE_GUIDE.md |
| `lot_tracking` | ติดตาม Lot | LOT_TRACKING_GUIDE.md |
| `stock_movements` | Log การเคลื่อนไหว | INVENTORY_SERVICE_GUIDE.md |
| `lot_reservations` | การจองสต็อค | INVENTORY_SERVICE_GUIDE.md |
| `inventory_balance` | ยอดสต็อครวม | INVENTORY_SERVICE_GUIDE.md |
| `stock_returns` | บันทึกการคืนสินค้า | SCRAP_SAMPLE_GUIDE.md |

---

## 🎓 Use Cases

### Case 1: รับเข้าสินค้าพร้อมสร้าง Lot

```javascript
const receiptData = {
  product_id: 'product_xxx',
  sku: 'SKU-2024-001',
  lot_code: '08883',
  quantity: 100,
  weight_kg: 30,
  location_code: 'WH-01',
  supplier_name: 'บริษัท ABC',
  received_date: '2024-11-24'
}

const result = await inventory.receiveGoodsWithLotTracking(receiptData)
// ✅ สร้าง: lot_tracking, stock_movements, inventory_balance
```

**อ่านเพิ่มเติม:** [LOT_TRACKING_GUIDE.md](./LOT_TRACKING_GUIDE.md)

---

### Case 2: จองสต็อคสำหรับ Quotation

```javascript
const reservationData = {
  lot_id: 'lot_xxx',
  product_id: 'product_xxx',
  reserved_meters: 10.5,
  payment_status: 'unpaid',
  reference_type: 'quotation',
  reference_id: 'quotation_xxx',
  customer_name: 'บริษัท XYZ'
}

const result = await inventory.reserveLotStock(reservationData)
// ✅ จองสต็อค 10.5 เมตร, หมดอายุ 7 วัน
```

**อ่านเพิ่มเติม:** [INVENTORY_SERVICE_GUIDE.md - Stock Reservation](./INVENTORY_SERVICE_GUIDE.md#stock-reservation)

---

### Case 3: รับคืนสินค้าเข้าคลังของเสีย

```javascript
const returnData = {
  lot_id: 'lot_xxx',
  return_meters: 5,
  return_type: 'defective',
  reason: 'ผ้าขาด เปื้อนน้ำมัน',
  
  // ✅ เข้า Scrap Location
  return_location_code: 'SCRAP-01',
  location_type: 'scrap',
  is_scrap_return: true,
  count_in_stock: false  // ไม่นับสต็อก
}

const result = await inventory.returnLotStock(returnData)
// ✅ บันทึกของเสีย 5 เมตร (ไม่เพิ่มกลับเข้าสต็อก)
```

**อ่านเพิ่มเติม:** [SCRAP_SAMPLE_GUIDE.md](./SCRAP_SAMPLE_GUIDE.md)

---

### Case 4: ตัดสต็อคจาก Lot

```javascript
const cutData = {
  lot_id: 'lot_xxx',
  reservation_id: 'reservation_xxx',
  cut_meters: 10.5,
  notes: 'ตัดขายให้ลูกค้า A'
}

const result = await inventory.cutLotStock(cutData)
// ✅ ตัดสต็อค 10.5 เมตร, อัปเดต lot, balance
```

**อ่านเพิ่มเติม:** [INVENTORY_SERVICE_GUIDE.md - Stock Movement](./INVENTORY_SERVICE_GUIDE.md#stock-movement)

---

## 🔍 การค้นหาข้อมูล

### ค้นหาสินค้า

```javascript
// ค้นหาจาก Barcode
const result = await inventory.searchProductByBarcode('8859012345678')

// ดึงสินค้าทั้งหมด
const products = await inventory.getAllProducts()

// ดึงสินค้าพร้อมข้อมูล Inventory
const data = await inventory.getProductWithInventoryData(productId)
```

### ค้นหา Lot

```javascript
// ดึง Lots ทั้งหมดของสินค้า
const lots = await inventory.getLotTracking(productId)

// Filter Lots ที่พร้อมใช้
const availableLots = lots.filter(lot => 
  lot.status === 'available' && 
  lot.remaining_meters > lot.reserved_meters
)

// FIFO - เลือก Lot เข้าก่อน
const oldestLot = lots
  .filter(lot => lot.status === 'available')
  .sort((a, b) => new Date(a.received_date) - new Date(b.received_date))[0]
```

### ค้นหา Movement

```javascript
// ดึง Movements ของ Lot
const movements = await inventory.apiRequest.POST('stock_movements/aggregate', {
  pipeline: [
    { $match: { lot_id: lotId } },
    { $sort: { created_at: -1 } }
  ]
}, inventory.clientKey)
```

---

## 📊 การออกรายงาน

### รายงาน Stock Summary

```javascript
const balance = await inventory.getInventoryBalance(productId)

console.log({
  qty_on_hand: balance.qty_on_hand,      // สต็อครวม
  qty_available: balance.qty_available,   // พร้อมใช้
  qty_reserved: balance.qty_reserved,     // จองไว้
  scrap_qty: balance.scrap_qty,           // ของเสีย
  sample_qty: balance.sample_qty,         // ตัวอย่าง
  defective_qty: balance.defective_qty    // ชำรุด
})
```

### รายงาน Lot Summary

```javascript
const lots = await inventory.getLotTracking(productId)

const summary = lots.reduce((acc, lot) => ({
  total_meters: acc.total_meters + lot.remaining_meters,
  reserved_meters: acc.reserved_meters + lot.reserved_meters,
  scrap_meters: acc.scrap_meters + (lot.scrap_meters || 0),
  sample_meters: acc.sample_meters + (lot.sample_meters || 0)
}), { total_meters: 0, reserved_meters: 0, scrap_meters: 0, sample_meters: 0 })
```

### รายงาน Scrap Rate

```javascript
const scrapRate = (balance.scrap_qty / balance.qty_on_hand) * 100

if (scrapRate > 5) {
  console.warn(`⚠️ Scrap Rate สูง: ${scrapRate.toFixed(2)}%`)
}
```

---

## 🛠️ Developer Tools

### Debug Mode

```javascript
// Enable debug logging
console.log('🔍 Debug Info:')
console.log('  Service Ready:', inventory.isReady())
console.log('  Client Key:', inventory.clientKey ? 'Set' : 'Missing')
console.log('  API Request:', typeof inventory.apiRequest)
```

### Validation Helper

```javascript
// ตรวจสอบความถูกต้องของ Lot
const validateLot = (lot) => {
  const errors = []
  
  if (lot.remaining_meters > lot.original_meters) {
    errors.push('remaining > original')
  }
  
  if (lot.reserved_meters > lot.remaining_meters) {
    errors.push('reserved > remaining')
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation Errors:', errors)
    return false
  }
  
  return true
}
```

---

## ⚠️ Common Issues

### Issue 1: Service not initialized
```javascript
Error: InventoryService not initialized

// แก้ไข:
if (!inventory.isReady()) {
  inventory.initialize(app.config.globalProperties)
}
```

### Issue 2: Client key missing
```javascript
Error: Client key is required

// แก้ไข:
console.log('Client Key:', window.ERP_CORE?.clientKey)
```

### Issue 3: Scrap ไม่แสดงใน UI
```javascript
// ตรวจสอบ:
const lots = await inventory.getLotTracking(productId)
console.log('Scrap data:', lots.map(l => ({
  lot: l.lot_code,
  scrap: l.scrap_meters
})))

// ถ้าไม่มีข้อมูล → ตรวจสอบว่า returnLotStock ส่ง is_scrap_return: true
```

---

## 📝 Best Practices

### ✅ ควรทำ

1. ใช้ FIFO สำหรับการเลือก Lot
2. บันทึกเหตุผลทุกครั้งที่ return/cut stock
3. ตรวจสอบ Scrap Rate เป็นประจำ
4. ใช้ Soft Delete แทน Hard Delete
5. Validate input ก่อนเรียก API

### ❌ ไม่ควรทำ

1. อัปเดต remaining_meters โดยตรง (ใช้ movement)
2. Hard Delete Lot ที่มี transaction
3. ปล่อยให้ reservation หมดอายุโดยไม่จัดการ
4. ไม่บันทึก location_code และ rack_position
5. ใช้รหัส Lot ซ้ำกัน

---

## 🔗 ลิงก์ที่เกี่ยวข้อง

### เอกสารภายใน
- [INVENTORY_SERVICE_GUIDE.md](./INVENTORY_SERVICE_GUIDE.md) - API Reference
- [LOT_TRACKING_GUIDE.md](./LOT_TRACKING_GUIDE.md) - Lot System
- [SCRAP_SAMPLE_GUIDE.md](./SCRAP_SAMPLE_GUIDE.md) - Scrap/Sample Management

### เอกสารระบบอื่น
- `../QUOTATION_STOCK_RESERVATION_SUMMARY.md` - Quotation Integration
- `../STOCK_RESERVATION_UI_IMPLEMENTATION.md` - UI Implementation
- `../RESERVATION_DEBUG_GUIDE.md` - Debugging Reservations

---

## 📧 ติดต่อ & สนับสนุน

**ERP Development Team**  
- 📧 Email: dev@example.com
- 💬 Chat: #erp-support
- 📖 Wiki: wiki.example.com/erp

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2024-11-24 | เพิ่ม Scrap/Sample Management, Enhanced Lot Tracking |
| 1.5.0 | 2024-11-01 | เพิ่ม Stock Reservation System |
| 1.0.0 | 2024-10-01 | Release แรก - Basic Inventory |

---

**อัปเดตล่าสุด:** 24 พฤศจิกายน 2025  
**เอกสารเวอร์ชัน:** 2.0

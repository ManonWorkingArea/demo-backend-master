# 📦 Inventory & Balance Usage Guide
คู่มือการใช้งาน Inventory (บันทึกความเคลื่อนไหวสต็อก) และ Balance (สรุปยอดคงเหลือสินค้า)

---

## 🎯 เป้าหมายของคู่มือนี้
- อธิบายแนวคิดและโครงสร้างข้อมูลของ Inventory และ Balance แบบ Product-Centric
- แสดงวิธีใช้งานสำหรับ 3 กรณีหลัก: รับเข้า (Goods Receipt), จองสินค้า (Reservation), และตัดสต็อกจริง (Consumption)
- ยึดตามรูปแบบการใช้งานที่พบในคอมโพเนนต์ตัวอย่าง:
  - SalesOrderDetail.vue (จอง, ตรวจสต็อก, เปลี่ยนสถานะคำสั่งขาย)
  - WorkOrderDetail.vue (จอง/ตัดวัตถุดิบระหว่าง Pick/Complete)
  - GoodsReceipt.vue (รับเข้าสินค้าเข้าคลังจากการซื้อหรือการผลิต)

สำคัญ: ปฏิบัติตาม Core Rules เสมอ — ทำงานผ่าน ERP_CORE และ TransactionEngine เท่านั้น โดยมี WorkflowEngine ช่วยประสานการเปลี่ยนสถานะข้ามโมดูล และ BalanceManager ดูแลข้อมูลสรุปสต็อกแบบรวม

---

## 🧠 แนวคิดหลัก (Key Concepts)

- Inventory = บันทึกหน่วยสต็อกจริงที่เคลื่อนไหวได้ เช่น สินค้าที่พร้อมใช้ จองแล้ว หรือถูกใช้ไปแล้ว แต่ละรายการเป็นธุรกรรมใน `TRANSACTION_TYPES.INVENTORY`
  - ฟิลด์สำคัญโดยทั่วไป: product_id, product_code/sku, quantity, unit, state, subtype, reference_type, reference_id, stock_location, cost/valuation, timestamps
  - สถานะหลักที่พบ: `available`, `reserved`, `allocated`, `consumed`, `inactive`
- Balance = ข้อมูลสรุปแบบ Product-Centric ต่อสินค้า 1 ตัว (รวมทุก location) เก็บใน `TRANSACTION_TYPES.INVENTORY_BALANCE`
  - ฟิลด์หลัก: qty_on_hand, qty_reserved, qty_available (= on_hand - reserved), weighted_avg_cost, total_cost_value, location_summary, last_movement_date, stock alerts
  - เป็นข้อมูลอนุพันธ์ (derived) จาก Movement Logs/Inventory Records ไม่แก้โดยตรงแบบ manual
- WorkflowEngine = จัดการเหตุการณ์ข้ามโมดูล เช่น
  - Purchase → Inventory (Goods Receipt)
  - Sales Confirmed → Inventory Reserve
  - Delivery Shipped → Inventory Consumed
  - Production Picking/Completion → Reserve/Consume วัตถุดิบ
- BalanceManager = บริการกลางสำหรับสร้าง/อัปเดต/คำนวณซ้ำ Balance โดยยึด Product-Centric

---

## 🔗 สัญญาข้อมูล (Data Contracts)

Inventory (อย่างย่อ):
```js
{
  id, product_id, product_code, quantity, unit,
  state: 'available' | 'reserved' | 'allocated' | 'consumed' | 'inactive',
  subtype: 'goods_receipt' | 'initial_stock' | 'stock_movement' | 'production_output' | 'reservation' | 'usage',
  reference_type: 'purchase' | 'sales' | 'delivery' | 'workorder' | 'production' | 'manual',
  reference_id,
  reservedFor,  // sales/workorder id เมื่อจอง
  reservedQuantity,
  stock_location_id,
  cost, weighted_avg_cost,
  created_at, updated_at
}
```

Balance (อย่างย่อ):
```js
{
  id, product_id, product_code,
  qty_on_hand, qty_reserved, qty_available, // qty_available = on_hand - reserved
  weighted_avg_cost, total_cost_value,
  total_locations, location_summary: [ { location_id, qty } ],
  min_stock_level, max_stock_level, reorder_point, reorder_quantity,
  last_movement_date,
  // สถานะเตือน
  low_stock, out_of_stock, overstock,
}
```

หมายเหตุ: รายละเอียด Schema/Helpers ดูเพิ่มใน `core/masterdata/inventory/balance/*` และ `BalanceManager`

---

## 🚦 โฟลว์หลัก 3 แบบ

### 1) รับเข้าสินค้า (Goods Receipt → เพิ่มสต็อก)
กรณีใช้งาน: รับของจากการซื้อ หรือผลผลิตจากการผลิตเข้าคลัง

แนะนำให้เปลี่ยนสถานะธุรกรรมต้นทาง แล้วให้ WorkflowEngine สร้าง Inventory ให้โดยอัตโนมัติ:

ขั้นตอนทั่วไป
1. อัปเดตสถานะ Purchase/Production ให้ถึงจุดที่ “รับเข้าได้”
2. WorkflowEngine เรียก `addInventoryFromPurchase()` หรือ flow ที่เทียบเท่า เพื่อ `engine.create('inventory', {... state: 'available' ...})`
3. Hook/Workflow ของ Balance จะอัปเดตยอดสรุปให้

ตัวอย่าง (แนวคิด)
```js
// เมื่อยืนยันรับเข้าในหน้ารับของ
await ERP_CORE.engine.update('purchase', purchaseId, { status: 'received' }, userId)
// WorkflowEngine จะสร้าง inventory records state=available ให้เองตามรายการสินค้า
```

กรณีต้องสร้าง Inventory ตรงๆ (เช่น initial stock หรืองานทดสอบ):
```js
const inv = await ERP_CORE.engine.create('inventory', {
  product_id, product_code, quantity, unit,
  state: 'available', subtype: 'goods_receipt',
  reference_type: 'purchase', reference_id: purchaseId
}, userId)

// แล้วอัปเดต Balance จาก movement ที่เกิดขึ้น (สำหรับกรณีพิเศษ/สคริปต์)
await ERP_CORE.balance.updateBalanceFromMovement(product_id, null /*ignore location*/, {
  delta: +quantity, type: 'inbound', reference_type: 'purchase', reference_id: purchaseId
}, userId)
```

เกี่ยวข้องกับคอมโพเนนต์: GoodsReceipt.vue (รับเข้า), ProductForm.vue (initial stock)

---

### 2) จองสินค้า (Reservation → ลด Available ชั่วคราว)
กรณีใช้งาน: ยืนยันคำสั่งขาย หรือเตรียมหยิบของเข้า Work Order

แนวปฏิบัติที่แนะนำ: เปลี่ยนสถานะ Sales/Work Order แล้วให้ WorkflowEngine จองสต็อกให้โดยอัตโนมัติ

ขั้นตอนทั่วไป
1. Sales Order เปลี่ยนจาก draft/quoted → confirmed
2. WorkflowEngine เรียก `reserveInventoryFromSales()` เพื่อหา `inventory` ที่ `state='available'` และ `engine.update()` ให้ `state='reserved'` พร้อมตั้ง `reservedFor`, `reservedQuantity`
3. Balance ถูกอัปเดต: `qty_reserved` เพิ่มขึ้น, `qty_available` ลดลง

ตัวอย่าง (แนวคิดจาก SalesOrderDetail.vue):
```js
// เมื่อผู้ใช้กด Confirm
await ERP_CORE.engine.update('sales', salesId, { status: 'confirmed' }, userId)
// ระบบจะสร้าง/อัปเดต reservation records ใต้ inventory และสะท้อนใน reservationRecords ของ UI
```

ตรวจสอบ/ยกเลิกการจอง:
```js
// ตรวจสอบรายการจองจาก inventory records
const reserved = await ERP_CORE.engine.list('inventory', { state: 'reserved', reservedFor: salesId })

// ยกเลิกการจอง (เช่น ยกเลิก SO)
for (const rec of reserved.data) {
  await ERP_CORE.engine.update('inventory', rec.id, { state: 'available', reservedFor: null, reservedQuantity: 0 }, userId)
}
```

เกี่ยวข้องกับคอมโพเนนต์: SalesOrderDetail.vue (checkStockAvailability, reserveStock, loadReservationInventoryRecords, releaseStockReservation), WorkOrderDetail.vue (hasItemReservation, canPickItems)

---

### 3) ตัดสต็อกจริง (Consumption/Usage → ลด On Hand)
กรณีใช้งาน: จัดส่งสินค้า (Delivery Shipped), งานผลิตตัดวัตถุดิบเมื่อ Pick/Complete

แนวปฏิบัติที่แนะนำ: เปลี่ยนสถานะธุรกรรมส่งผล เช่น Delivery → shipped หรือ Work Order → picked/completed แล้วให้ WorkflowEngine แปลง `reserved → consumed`

ขั้นตอนทั่วไป
1. Delivery เปลี่ยนสถานะเป็น shipped
2. WorkflowEngine เรียก `consumeInventoryFromDelivery()` ค้นหา inventory ที่ `reservedFor = salesId` แล้วอัปเดตเป็น `consumed`
3. Balance ถูกอัปเดต: `qty_on_hand` ลดลง และ `qty_reserved` ลดลง (ถ้าย้ายจาก reserved มา consumed)

ตัวอย่าง (แนวคิดจาก SalesOrderDetail.vue):
```js
await ERP_CORE.engine.update('delivery', deliveryId, { status: 'shipped' }, userId)
// ระบบจะหา reserved inventory ของ SO นี้และเปลี่ยนเป็น consumed ให้อัตโนมัติ
```

ในงานผลิต (จาก WorkOrderDetail.vue):
```js
// เมื่อยืนยัน Pick ของแต่ละรายการงาน
// ระบบจะทำเครื่องหมาย items เป็น picked และอาจอัปเดต inventory ให้เป็น reserved/consumed ตาม flow
// เมื่อ complete งาน ระบบสรุปและเปลี่ยน state inventory ที่เกี่ยวข้องให้เหมาะสม
```

---

## 🛠️ API ที่ใช้บ่อย (Cheatsheet)

TransactionEngine (ผ่าน ERP_CORE.engine):
```js
await ERP_CORE.engine.create('inventory', data, userId)
await ERP_CORE.engine.update('inventory', id, data, userId)
await ERP_CORE.engine.list('inventory', { state: 'available', product_id })
```

BalanceManager (ผ่าน ERP_CORE.balance):
```js
// สร้าง/อัปเดต Balance สำหรับสินค้า
await ERP_CORE.balance.ensureProductBalance(product, { updatedBy: userId })

// อัปเดต Balance จาก Movement เดี่ยว
await ERP_CORE.balance.updateBalanceFromMovement(productId, null, movement, userId)

// คำนวณใหม่ทั้งหมด จาก movement logs
await ERP_CORE.balance.recalculateBalance(productId, null, userId)

// ค้นหา/สรุป/ตรวจเตือน
await ERP_CORE.balance.findProductBalance(productId)
await ERP_CORE.balance.getProductBalanceSummary(productId)
await ERP_CORE.balance.checkStockAlerts(productId)
```

WorkflowEngine (โดยอ้อมผ่านการเปลี่ยนสถานะธุรกรรม):
- Purchase → received: เพิ่ม Inventory (available)
- Sales → confirmed: จอง Inventory (reserved)
- Delivery → shipped: ตัดสต็อก (consumed)
- Work Order → picking/picked/complete: จัดการจอง/ตัดวัตถุดิบ

---

## ✅ แนวปฏิบัติที่ดี (Best Practices)

- Core-only: หลีกเลี่ยงการแก้ไข Balance โดยตรง ควรผ่าน Workflow/Helpers เสมอ
- Generate close to commit: สร้าง/เปลี่ยนสถานะสต็อกให้ใกล้เวลาบันทึกจริง เพื่อลด race/ช่องว่างลำดับ
- Concurrency guards: ใช้แฟล็กป้องกันการกดซ้ำระหว่างเปลี่ยนสถานะ (ดู isUpdating/changingStatus ใน SalesOrderDetail.vue)
- Atomic mindset: ถ้าขั้นตอนหลายอย่างต้องสำเร็จร่วมกัน ให้พึ่งพา WorkflowEngine/Hook ที่ผูกกับ state change เพื่อลดความไม่สอดคล้อง
- Idempotency: ออกแบบให้เรียกซ้ำได้โดยไม่คูณยอดผิดพลาด (ตรวจสถานะปัจจุบันก่อนเปลี่ยน)
- Observability: เก็บ activityLog ทั้งฝั่ง DB และฝั่ง local UI เพื่อช่วยดีบัก (อ้างอิง allActivityLogs ในตัวอย่าง)

---

## 🧪 กรณีขอบ (Edge Cases) ที่ควรคำนึง

- สต็อคไม่พอระหว่าง Confirm/Reserve: แสดงรายละเอียดขาด, อย่าจองเกิน available, สนับสนุน partial reserve หากต้องการ
- ยกเลิกงานหลังจอง: คืนสถานะ reserved → available และลด qty_reserved ออก
- ตรวจพบยอดคงเหลือเพี้ยน: เรียก `recalculateBalance()` เพื่อ rebuild จาก movement logs
- หลาย location: ถึง Balance จะเป็น Product-Centric แต่ควรเก็บ location_summary เพื่อความโปร่งใสและรายงาน
- ต้นทุนถัวเฉลี่ย: อัปเดต weighted_avg_cost/total_cost_value เมื่อมี inbound movement ใหม่

---

## 🔍 อ้างอิงจากคอมโพเนนต์ตัวอย่าง

- SalesOrderDetail.vue
  - ตรวจสต็อก/จอง/ปล่อยจอง, ป้องกัน concurrent update, รวม activity logs, โหลด reservation inventory records
- WorkOrderDetail.vue
  - ตรวจสิทธิ์ Pick/Complete ตามสถานะ, เชื่อมโยง inventory_reservations ต่อ item, นับ progress และ log
- GoodsReceipt.vue
  - รับเข้าสินค้าเข้าคลัง, กระตุ้น Workflow เพิ่ม inventory state=available, อัปเดต Balance อัตโนมัติ
- ProductForm.vue
  - สร้าง Initial Stock, แสดง Balance แบบ Product-Centric, ปุ่ม Recalculate/Refresh

---

## 🧭 การแก้ปัญหา (Troubleshooting)

- ไม่เห็นยอด Balance อัปเดต: ตรวจว่า Workflow/Hook ทำงาน, ตรวจ log ใน Console ของ BalanceManager, ลอง `refreshBalance()` ใน UI
- ยอด available ติดลบ: ตรวจการจองเกิน, ตรวจ movement ผิด (เช่น consumed ซ้ำ), ใช้ `recalculateBalance()` และเพิ่มตรวจสอบใน validateBalance
- จองแล้วแต่ไม่ถูกตัดตอน shipped: ตรวจว่า delivery อ้างอิง sales/sourceTransactionId ถูกต้อง เพื่อให้ Workflow หา reserved ได้
- ไม่มี Balance record สำหรับสินค้า: ใช้ `ensureProductBalance(product)` เพื่อสร้างพร้อมค่าเริ่มต้น

---

## 🔗 เอกสารที่เกี่ยวข้อง

- CORE: `TransactionEngine`, `WorkflowEngine`, `BalanceManager`
- Masterdata: `core/masterdata/inventory/balance/*`, `inventory/stock_locations/*`
- ดูภาพรวมเริ่มต้นใน: `QUICK_REFERENCE.md`, `CORE_RULES.md`, `SUMMARY.md`

---

อัปเดต: October 2025 | เจ้าของเอกสาร: ERP Core Team

# 📋 สรุป: ระบบจองสต็อคสำหรับ Quotation & Invoice

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. **InventoryService.js** - เพิ่มฟังก์ชันจองสต็อค

```javascript
// ✅ จองสต็อคจาก Lots (FIFO) สำหรับ Quotation
async reserveStockForQuotation(quotationId, items)
// - สร้าง lot_reservations (status: not_paid, หมดอายุ 7 วัน)
// - อัปเดต lot_tracking.reserved_meters

// ✅ เปลี่ยนสถานะเป็น paid เมื่อชำระเงิน
async confirmReservationPayment(quotationId, invoiceId)
// - อัปเดต status: not_paid → paid
// - ล้าง expiry_date (ไม่หมดอายุแล้ว)

// ✅ ยกเลิกการจองหมดอายุ (Cron Job)
async cancelExpiredReservations()
// - หาการจองที่ status: not_paid และหมดอายุ
// - อัปเดตเป็น cancelled และคืนสต็อก

// ✅ ดึงข้อมูลการจอง
async getReservations(referenceType, referenceId)
```

---

### 2. **SalesService.js** - เชื่อมระบบจอง

**createInvoiceFromQuotation():**
```javascript
// Step 8: จองสต็อคอัตโนมัติหลังสร้าง Invoice
const reservationResult = await inventoryService.reserveStockForQuotation(
  quotationId,
  quotation.items
)
// → สร้าง lot_reservations (status: not_paid)
```

**recordPayment():**
```javascript
// Step 5: เปลี่ยนสถานะการจองเป็น paid
const confirmResult = await inventoryService.confirmReservationPayment(
  invoice.quotation_id,
  invoiceId
)
// → อัปเดต lot_reservations (status: paid)
```

---

### 3. **Quotation/Detail.vue** - แสดงข้อมูลการจอง

เพิ่ม UI แสดง:
- ✅ รายการ Lot ที่ถูกจอง
- ✅ สถานะ: not_paid (รอชำระ) หรือ paid (ชำระแล้ว)
- ✅ วันหมดอายุ (สำหรับ not_paid)
- ✅ ข้อมูล Lot (เมตร, น้ำหนัก, ตำแหน่ง)

---

## 🔄 Flow การทำงาน

### **Scenario 1: Quotation → Invoice → จองสต็อค**

```
1. Quotation ถูกยืนยัน
   ↓
2. กดปุ่ม "สร้าง Invoice"
   ↓
3. SalesService.createInvoiceFromQuotation()
   ├─ สร้าง Invoice
   └─ เรียก inventoryService.reserveStockForQuotation()
      ├─ หา Lots ที่มีสต็อก (FIFO)
      ├─ สร้าง lot_reservations (status: not_paid)
      ├─ ตั้งวันหมดอายุ +7 วัน
      └─ อัปเดต lot_tracking.reserved_meters
   ↓
4. ✅ สต็อคถูกจองแล้ว (ยกเลิกได้ใน 7 วัน)
```

---

### **Scenario 2: Invoice → ชำระเงิน → เปลี่ยนสถานะ**

```
1. Invoice status: pending_payment
   ↓
2. กดปุ่ม "บันทึกการชำระเงิน"
   ↓
3. SalesService.recordPayment()
   ├─ อัปเดต Invoice (payment_status: paid)
   └─ เรียก inventoryService.confirmReservationPayment()
      ├─ หา lot_reservations (status: not_paid)
      ├─ อัปเดตเป็น status: paid
      ├─ ล้าง expiry_date
      └─ เพิ่ม invoice_id
   ↓
4. ✅ สต็อคถูกจองแบบถาวร (ยกเลิกไม่ได้)
```

---

### **Scenario 3: Auto-Cancel หมดอายุ**

```
1. Cron Job รันทุกวัน 00:00
   ↓
2. inventoryService.cancelExpiredReservations()
   ├─ หา lot_reservations
   │  └─ status: not_paid
   │  └─ expiry_date < วันนี้
   ├─ อัปเดตเป็น status: cancelled
   └─ คืนสต็อก lot_tracking.reserved_meters
   ↓
3. ✅ การจองหมดอายุถูกยกเลิกและคืนสต็อค
```

---

## 📊 Database Collections

### **lot_reservations** (ใหม่)
```javascript
{
  lot_id: "402-177-152-08883",
  product_id: "xxx",
  reference_type: "quotation",
  reference_id: "quotation_xxx",
  reserved_meters: 10.5,
  status: "not_paid|paid|cancelled",
  expiry_date: ISODate,  // +7 วัน (not_paid เท่านั้น)
  confirmed_date: ISODate,  // วันที่ชำระเงิน
  invoice_id: "invoice_xxx",  // เพิ่มเมื่อชำระเงิน
}
```

### **lot_tracking** (อัปเดต)
```javascript
{
  // ... existing fields
  reserved_meters: Number,    // เพิ่ม
  available_meters: Number,   // เพิ่ม (current_meters - reserved_meters)
}
```

---

## 🎯 จุดเด่นของระบบ

1. **Flexible Cancellation** - จองได้ ยกเลิกได้ภายใน 7 วัน (not_paid)
2. **Payment Protection** - ชำระเงินแล้วยกเลิกไม่ได้ (paid)
3. **Auto Cleanup** - ยกเลิกการจองหมดอายุอัตโนมัติ
4. **FIFO Strategy** - ใช้สต็อคเก่าก่อน
5. **Lot Traceability** - ติดตามได้ว่าจองจาก lot ไหน
6. **Multi-Lot Support** - รองรับการจองหลาย lot ในคำสั่งเดียว

---

## 📝 ตัวอย่างการใช้งาน

### **ดูข้อมูลการจองใน Quotation Detail**
```
1. เปิด Quotation Detail
2. ถ้ามีการสร้าง Invoice แล้ว
3. จะแสดงส่วน "สถานะการจองสต็อค"
   - แสดง Lot ที่ถูกจอง
   - แสดงสถานะ (รอชำระ/ชำระแล้ว)
   - แสดงวันหมดอายุ (ถ้ารอชำระ)
```

### **Setup Cron Job สำหรับยกเลิกการจองหมดอายุ**
```javascript
// server.js
import cron from 'node-cron'
import { inventoryService } from './services/InventoryService.js'

// รันทุกวันเวลา 00:00
cron.schedule('0 0 * * *', async () => {
  await inventoryService.cancelExpiredReservations()
})
```

---

## 📚 เอกสารเพิ่มเติม

ดูรายละเอียดเพิ่มเติมใน:
- `QUOTATION_INVOICE_STOCK_RESERVATION.md` - เอกสารครบถ้วน
- `src/services/InventoryService.js` - Implementation
- `src/services/SalesService.js` - Integration
- `src/extensions/modules/erp/modules/sales/components/quotation/Detail.vue` - UI

---

**Created**: November 10, 2025  
**Status**: ✅ Ready to Test

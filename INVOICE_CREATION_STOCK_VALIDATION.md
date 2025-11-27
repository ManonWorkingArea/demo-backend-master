# การตรวจสอบสต็อคก่อนสร้างใบแจ้งหนี้ (Invoice Stock Validation)

## 📋 ภาพรวม

แก้ไขลำดับการทำงานในการสร้างใบแจ้งหนี้จากใบเสนอราคา โดย **จองสต็อคก่อน** แล้วค่อยสร้าง Invoice เพื่อป้องกันการสร้าง Invoice เมื่อสต็อคไม่เพียงพอ

## 🔄 การเปลี่ยนแปลงหลัก

### ❌ วิธีเก่า (มีปัญหา)
```
1. สร้าง Invoice ลง Database
2. Update sequence number
3. พยายามจองสต็อค
4. ถ้าจองไม่สำเร็จ → แค่ log warning (Invoice ยังคงถูกสร้าง!)
```

**ปัญหา:**
- Invoice ถูกสร้างแล้วแม้สต็อคไม่พอ
- ไม่มีการ rollback
- ข้อมูลไม่ตรงกับความเป็นจริง

### ✅ วิธีใหม่ (แก้ไขแล้ว)
```
1. จองสต็อคก่อน (CRITICAL STEP)
   ├─ ถ้าจองไม่สำเร็จ → STOP! throw error
   └─ ถ้าจองสำเร็จ → ดำเนินการต่อ
2. สร้าง Invoice พร้อมข้อมูลการจอง
3. ถ้าสร้าง Invoice ไม่สำเร็จ → Rollback การจอง
4. Update sequence number
5. Update quotation status
```

**ข้อดี:**
- ✅ ป้องกันสร้าง Invoice เมื่อสต็อคไม่พอ
- ✅ ข้อมูลตรงกับความเป็นจริง 100%
- ✅ มี rollback mechanism
- ✅ User ได้รับ error message ที่ชัดเจน

## 🛠️ Implementation Details

### ไฟล์ที่แก้ไข
`/src/services/SalesService.js` - Method: `createInvoiceFromQuotation()`

### Step 6: จองสต็อคก่อนสร้าง Invoice

```javascript
// 6. ✅ จองสต็อคก่อนสร้าง Invoice (CRITICAL - ต้องสำเร็จก่อน)
console.log('🔒 [SalesService] Step 6: Reserving stock BEFORE creating invoice...')

let reservationResult = null
let stockReservations = []

try {
  // Import InventoryService
  const { inventoryService } = await import('./InventoryService.js')
  
  // Initialize if needed
  if (!inventoryService.isReady()) {
    inventoryService.initialize(window.vueApp?.config?.globalProperties || { 
      $Request: this.apiRequest, 
      $Key: this.clientKey 
    })
  }

  // จองสต็อคจาก quotation items
  reservationResult = await inventoryService.reserveStockForQuotation(
    quotationId,
    quotation.items || []
  )

  console.log('📊 [SalesService] Reservation result:', reservationResult)

  // ✅ ตรวจสอบว่าการจองสำเร็จหรือไม่
  if (!reservationResult.success) {
    // มี errors - ต้องยกเลิก
    const errorMessages = reservationResult.errors?.map(err => err.message || err).join(', ')
    throw new Error(`ไม่สามารถจองสต็อคได้: ${errorMessages}`)
  }

  // ✅ ตรวจสอบว่าจองได้ทุกรายการหรือไม่
  if (!reservationResult.reservations || reservationResult.reservations.length === 0) {
    throw new Error('ไม่สามารถจองสต็อคได้เลย กรุณาตรวจสอบสต็อคคงเหลือ')
  }

  // ✅ ตรวจสอบว่ามี errors บางรายการหรือไม่
  if (reservationResult.errors && reservationResult.errors.length > 0) {
    const errorItems = reservationResult.errors.map(err => 
      err.product_name || err.lot_code || 'Unknown'
    ).join(', ')
    throw new Error(`จองสต็อคไม่สำเร็จสำหรับสินค้า: ${errorItems}`)
  }

  console.log('✅ Stock reserved successfully:', reservationResult.reservations.length, 'items')
  stockReservations = reservationResult.reservations

} catch (reservationError) {
  console.error('❌ Stock reservation FAILED:', reservationError)
  
  // ✅ ยกเลิกการสร้าง Invoice ทันทีเพราะจองสต็อคไม่สำเร็จ
  throw new Error(`ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจาก${reservationError.message}`)
}
```

### Step 7: เพิ่มข้อมูลการจองใน invoiceData

```javascript
// 7. เพิ่มข้อมูลการจองใน invoiceData
invoiceData.stock_reservations = stockReservations
invoiceData.reservation_status = 'not_paid'
invoiceData.reservation_date = new Date().toISOString()
```

### Step 8: สร้าง Invoice พร้อม Rollback

```javascript
// 8. Create invoice in database
const response = await this.apiRequest.POST('sales_invoices', {
  data: invoiceData
}, this.clientKey)

const invoiceId = response?.data?._id || response?.data?.id

if (!invoiceId) {
  // ❌ สร้าง Invoice ไม่สำเร็จ - ต้อง rollback การจอง
  console.error('❌ Invoice creation failed, need to rollback reservations')
  
  try {
    console.log('🔄 Rolling back stock reservations...')
    for (const reservation of stockReservations) {
      if (reservation.reservation_id) {
        console.log(`🔄 Rolling back reservation: ${reservation.reservation_id}`)
        // ลบการจองที่สร้างไว้
        await this.apiRequest.DELETE(`lot_reservations/${reservation.reservation_id}`, this.clientKey)
      }
    }
  } catch (rollbackError) {
    console.error('❌ Rollback failed:', rollbackError)
  }
  
  throw new Error('ไม่สามารถสร้าง Invoice ได้')
}
```

## 📊 Validation Logic

### 1. ตรวจสอบ `reservationResult.success`
```javascript
if (!reservationResult.success) {
  throw new Error(`ไม่สามารถจองสต็อคได้: ${errorMessages}`)
}
```

### 2. ตรวจสอบจำนวนรายการที่จองได้
```javascript
if (!reservationResult.reservations || reservationResult.reservations.length === 0) {
  throw new Error('ไม่สามารถจองสต็อคได้เลย กรุณาตรวจสอบสต็อคคงเหลือ')
}
```

### 3. ตรวจสอบ Partial Errors
```javascript
if (reservationResult.errors && reservationResult.errors.length > 0) {
  const errorItems = reservationResult.errors.map(err => 
    err.product_name || err.lot_code || 'Unknown'
  ).join(', ')
  throw new Error(`จองสต็อคไม่สำเร็จสำหรับสินค้า: ${errorItems}`)
}
```

## 🔄 Rollback Mechanism

เมื่อสร้าง Invoice ไม่สำเร็จหลังจากจองสต็อคแล้ว:

```javascript
// Rollback: ลบ lot_reservations ที่สร้างไว้
for (const reservation of stockReservations) {
  if (reservation.reservation_id) {
    await this.apiRequest.DELETE(
      `lot_reservations/${reservation.reservation_id}`, 
      this.clientKey
    )
  }
}
```

## 🎯 Error Messages

### User-Friendly Error Messages

1. **สต็อคไม่เพียงพอ:**
   ```
   ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจากไม่สามารถจองสต็อคได้: 
   สต็อก Lot ไม่เพียงพอ ขาดอีก 20 เมตร
   ```

2. **ไม่มีสต็อคเลย:**
   ```
   ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจาก
   ไม่สามารถจองสต็อคได้เลย กรุณาตรวจสอบสต็อคคงเหลือ
   ```

3. **จองบางรายการไม่สำเร็จ:**
   ```
   ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจาก
   จองสต็อคไม่สำเร็จสำหรับสินค้า: ผ้าคอตตอน, ผ้าโพลีเอสเตอร์
   ```

## 📝 Success Response

เมื่อสร้างสำเร็จ จะ return:

```javascript
{
  success: true,
  _id: "invoice_id_123",
  invoice_number: "INV20250001",
  customer_code: "CUS-001",
  quotation_id: "quotation_id_456",
  quotation_number: "SQX20250009",
  stock_reservations: [
    {
      reservation_id: "res_001",
      lot_id: "lot_123",
      lot_code: "LOT-251108-7738",
      reserved_meters: 50,
      status: "not_paid"
    }
  ],
  message: "สร้าง Invoice INV20250001 จาก SQX20250009 สำเร็จ (จองสต็อค 1 รายการ)"
}
```

## 🧪 Testing Scenarios

### Scenario 1: สต็อคเพียงพอ ✅
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน 30 เมตร
- Lot มีสต็อค 50 เมตร

**Expected:**
- จองสต็อคสำเร็จ 30 เมตร
- สร้าง Invoice สำเร็จ
- lot_reservations ถูกสร้าง
- Quotation status = 'invoiced'

### Scenario 2: สต็อคไม่พอ ❌
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน 60 เมตร
- Lot มีสต็อค 50 เมตร (ไม่พอ)

**Expected:**
- ❌ จองสต็อคไม่สำเร็จ
- ❌ Invoice ไม่ถูกสร้าง
- Error: "สต็อก Lot ไม่เพียงพอ ขาดอีก 10 เมตร"

### Scenario 3: ไม่มีสต็อคเลย ❌
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน 30 เมตร
- ไม่มี Lot ใดเลย

**Expected:**
- ❌ จองสต็อคไม่สำเร็จ
- ❌ Invoice ไม่ถูกสร้าง
- Error: "ไม่สามารถจองสต็อคได้เลย กรุณาตรวจสอบสต็อคคงเหลือ"

### Scenario 4: สต็อคติดจองบางส่วน ⚠️
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน 30 เมตร
- Lot มีสต็อค 50 เมตร แต่ติดจอง 25 เมตร (เหลือ 25 เมตร)

**Expected:**
- ❌ จองสต็อคไม่สำเร็จ (เพราะเหลือแค่ 25 < 30)
- ❌ Invoice ไม่ถูกสร้าง
- Error: "สต็อก Lot ไม่เพียงพอ ขาดอีก 5 เมตร"

### Scenario 5: จองทั้งม้วน ✅
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน ทั้งม้วน (50 เมตร)
- Lot มีสต็อค 50 เมตร

**Expected:**
- จองสต็อคสำเร็จ 50 เมตร (is_full_roll: true)
- สร้าง Invoice สำเร็จ
- lot_reservations.is_full_roll = true

### Scenario 6: จองระบุจำนวน แต่เกินสต็อค ❌
**Given:**
- Quotation มี 1 รายการ: ผ้าคอตตอน 60 เมตร
- Lot มีสต็อค 50 เมตร

**Expected:**
- ❌ จองสต็อคไม่สำเร็จ
- ❌ Invoice ไม่ถูกสร้าง
- Error: "สต็อก Lot ไม่เพียงพอ ขาดอีก 10 เมตร"

## 🔍 Debug Console Logs

### สำเร็จ:
```
🔒 [SalesService] Step 6: Reserving stock BEFORE creating invoice...
📋 [SalesService] Quotation items for reservation: [...]
🔄 [SalesService] Calling reserveStockForQuotation with: {quotationId, itemsCount: 1}
📊 [SalesService] Reservation result: {success: true, reservations: [...], errors: []}
✅ Stock reserved successfully: 1 items
📝 [SalesService] Step 7: Creating invoice after successful stock reservation...
✅ [SalesService] Invoice created with ID: invoice_id_123
✅ [SalesService] Invoice created successfully: {..., reservations_count: 1}
```

### ล้มเหลว:
```
🔒 [SalesService] Step 6: Reserving stock BEFORE creating invoice...
📋 [SalesService] Quotation items for reservation: [...]
🔄 [SalesService] Calling reserveStockForQuotation with: {quotationId, itemsCount: 1}
📊 [SalesService] Reservation result: {success: false, reservations: [], errors: [...]}
❌ Stock reservation FAILED: Error: ไม่สามารถจองสต็อคได้: สต็อก Lot ไม่เพียงพอ ขาดอีก 10 เมตร
❌ [SalesService] Failed to create invoice from quotation: ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจาก...
```

## 📌 Key Points

1. **Stock Reservation is Critical** - จองสต็อคเป็นขั้นตอนที่สำคัญที่สุด ต้องสำเร็จก่อนสร้าง Invoice
2. **All-or-Nothing** - ถ้าจองไม่สำเร็จแม้แค่รายการเดียว ก็ไม่สร้าง Invoice
3. **Clear Error Messages** - แสดง error ที่ชัดเจนว่าสินค้าไหนสต็อคไม่พอ
4. **Rollback Support** - ถ้าสร้าง Invoice ไม่สำเร็จ จะลบการจองที่สร้างไว้
5. **Data Integrity** - ข้อมูลการจองถูกเก็บไว้ใน Invoice ตั้งแต่แรก

## 🔗 Related Files

- `SalesService.js` - createInvoiceFromQuotation() method
- `InventoryService.js` - reserveStockForQuotation() method
- `QUOTATION_INVOICE_STOCK_RESERVATION.md` - Overall system documentation
- `LOT_RESERVATION_DISPLAY_IN_QUOTATION.md` - UI display documentation

## 🚀 Next Steps

1. ✅ Test การจองสต็อคก่อนสร้าง Invoice
2. ✅ Test error handling เมื่อสต็อคไม่พอ
3. ⏳ Test rollback mechanism
4. ⏳ Add unit tests
5. ⏳ Implement retry logic (optional)

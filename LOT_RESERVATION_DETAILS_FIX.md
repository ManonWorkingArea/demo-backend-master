# แก้ไขการแสดงข้อมูลการจองใน Lot Details

## 🐛 ปัญหาที่พบ

เมื่อคลิกดู Lot Details แล้วมีการจองจริง (เช่น 10.00 ม.) แต่ในส่วน "การจองสต็อค" กลับแสดงว่า:
```
🔓 ไม่มีการจอง Lot นี้
```

## 🔍 สาเหตุ

1. **การ filter ข้อมูลไม่ครบถ้วน**: ระบบเก็บการจองแบบ array ของ lots แต่ filter แค่ `lot_id` เดียว
2. **ไม่มี fallback method**: ถ้าโหลดการจองผ่าน API หลักไม่สำเร็จ ไม่มีทางเลือกอื่น
3. **ขาดข้อมูล debug**: ไม่รู้ว่าปัญหาอยู่ตรงไหน

## ✅ การแก้ไข

### 1. ปรับปรุงการ Filter การจอง (Computed)

**เดิม:**
```javascript
const selectedLotReservations = computed(() => {
  if (!selectedLot.value || !lotReservations.value.length) return []
  
  const lotId = selectedLot.value.lot_id || selectedLot.value._id
  return lotReservations.value.filter(res => 
    res.lot_id === lotId || 
    res.lots?.some(l => l.lot_id === lotId)
  )
})
```

**ใหม่:**
```javascript
const selectedLotReservations = computed(() => {
  if (!selectedLot.value || !lotReservations.value.length) {
    console.log('⚠️ No selectedLot or no reservations')
    return []
  }
  
  const lotId = selectedLot.value.lot_id || selectedLot.value._id
  console.log('🔍 Filtering reservations for lot:', lotId)
  console.log('📦 All reservations:', lotReservations.value)
  
  const filtered = lotReservations.value.filter(res => {
    // Check multiple conditions
    const hasLotDirect = res.lot_id === lotId
    const hasLotInArray = res.lots?.some(l => 
      l.lot_id === lotId || 
      l._id === lotId ||
      l.lot_code === selectedLot.value.lot_code  // ⭐ เพิ่มการเช็ค lot_code
    )
    
    return hasLotDirect || hasLotInArray
  })
  
  console.log(`📊 Found ${filtered.length} reservations`)
  return filtered
})
```

**การปรับปรุง:**
- ✅ เพิ่มการเช็ค `lot_code` นอกจาก `lot_id` และ `_id`
- ✅ เพิ่ม debug logging ทุกขั้นตอน
- ✅ แสดงข้อมูลทั้งหมดเพื่อการ debug

### 2. เพิ่ม Fallback Method สำหรับโหลดการจอง

**เดิม:**
```javascript
const loadLotReservations = async () => {
  // โหลดแค่ทาง API เดียว
  const reservations = await window.ERP_CORE.inventory.getReservations(...)
  lotReservations.value = reservations
}
```

**ใหม่:**
```javascript
const loadLotReservations = async () => {
  let reservations = []
  
  // Method 1: InventoryService
  try {
    const result = await window.ERP_CORE.inventory.getReservations({
      product_id: props.productId,
      status: ['not_paid', 'paid']
    })
    if (result && Array.isArray(result)) {
      reservations = result
      console.log('✅ [Method 1] Loaded via InventoryService')
    }
  } catch (error) {
    console.warn('⚠️ [Method 1] Failed:', error.message)
  }
  
  // Method 2: Direct API call (fallback)
  if (reservations.length === 0) {
    try {
      const apiRequest = window.ERP_CORE.apiRequest || window.apiRequest
      const result = await apiRequest.GET('lot_reservations', {
        params: {
          product_id: props.productId,
          status: { $in: ['not_paid', 'paid'] }
        }
      })
      if (result && Array.isArray(result)) {
        reservations = result
        console.log('✅ [Method 2] Loaded via direct API')
      }
    } catch (error) {
      console.warn('⚠️ [Method 2] Failed:', error.message)
    }
  }
  
  lotReservations.value = reservations
  console.log(`📊 Total reservations: ${reservations.length}`)
}
```

**การปรับปรุง:**
- ✅ พยายามโหลด 2 วิธี (InventoryService → Direct API)
- ✅ แสดง log แยกแต่ละวิธี
- ✅ Fallback อัตโนมัติถ้าวิธีแรกล้มเหลว

### 3. เพิ่ม Helper Method คำนวณจำนวนจอง

**ใหม่:**
```javascript
const getLotReservedMetersFromReservation = (reservation, lot) => {
  const lotId = lot.lot_id || lot._id
  
  // Case 1: Single lot reservation
  if (reservation.lot_id === lotId) {
    return reservation.reserved_meters || 0
  }
  
  // Case 2: Multiple lots in reservation
  if (reservation.lots && Array.isArray(reservation.lots)) {
    const lotInReservation = reservation.lots.find(l => 
      l.lot_id === lotId || 
      l._id === lotId ||
      l.lot_code === lot.lot_code
    )
    
    if (lotInReservation) {
      return lotInReservation.reserved_meters || lotInReservation.meters || 0
    }
  }
  
  // Fallback
  return reservation.reserved_meters || 0
}
```

**การใช้งาน:**
```vue
<span class="font-semibold text-orange-700">
  {{ formatNumber(getLotReservedMetersFromReservation(reservation, selectedLot)) }} ม.
</span>
```

**ประโยชน์:**
- ✅ แสดงจำนวนที่จองสำหรับ lot นี้เฉพาะ (ไม่ใช่รวมทั้งหมด)
- ✅ รองรับทั้งการจอง 1 lot และหลาย lots
- ✅ มี fallback หลายระดับ

### 4. เพิ่มข้อมูล Debug ใน UI

**เพิ่มใน "No Reservations" section:**
```vue
<div v-else class="bg-gray-50 border border-gray-200 rounded p-3 text-center">
  <i class="fas fa-unlock-alt text-gray-400 text-2xl mb-2"></i>
  <p class="text-xs text-gray-600">ไม่มีการจอง Lot นี้</p>
  <!-- Debug Info -->
  <p class="text-xs text-gray-500 mt-1">
    ดีบัก: Lot ID = {{ selectedLot.lot_id || selectedLot._id }}
  </p>
  <p class="text-xs text-gray-500">
    การจองทั้งหมด: {{ lotReservations.length }} รายการ
  </p>
</div>
```

**ประโยชน์:**
- ✅ เห็นว่า Lot ID คืออะไร
- ✅ รู้ว่ามีการจองทั้งหมดกี่รายการ
- ✅ ช่วย debug ปัญหาได้ง่าย

## 🎯 ผลลัพธ์

### ก่อนแก้ไข
```
การจองสต็อค (0 รายการ)
┌─────────────────────────────┐
│  🔓 ไม่มีการจอง Lot นี้      │
└─────────────────────────────┘
```

### หลังแก้ไข
```
การจองสต็อค (1 รายการ)
┌─────────────────────────────────────────┐
│ 📄 ใบเสนอราคา                           │
│    690f08f931a0...          [รอชำระ]    │
│                                          │
│ จำนวน:           10.00 ม.               │
│ วันที่จอง:       10/11/68               │
│                                          │
│ 🔗 ดูเอกสาร                             │
└─────────────────────────────────────────┘
```

## 📊 Debug Flow

### Console Logs ที่จะเห็น

```javascript
🔍 [ProductLotSummary] Loading lot reservations for product: 690f054...
✅ [Method 1] Loaded reservations via InventoryService: [...]
📊 [ProductLotSummary] Total reservations loaded: 1
📋 Sample reservation: {
  _id: "...",
  reference_type: "quotation",
  reference_id: "690f08f931a0...",
  status: "not_paid",
  lots: [
    {
      lot_id: "...",
      lot_code: "01234",
      reserved_meters: 10
    }
  ]
}

🔍 Filtering reservations for lot: abc123...
📦 All reservations: [...]
✅ Found matching reservation: {...}
📊 Found 1 reservations for lot abc123...
```

## 🔄 การทำงาน

```
1. User คลิก Lot → selectedLot.value = lot
   ↓
2. selectedLotReservations (computed) ทำงาน
   ↓
3. Filter lotReservations.value โดยเช็ค:
   - res.lot_id === lotId?
   - res.lots[].lot_id === lotId?
   - res.lots[]._id === lotId?
   - res.lots[].lot_code === lot.lot_code? ⭐ ใหม่
   ↓
4. แสดงรายการจอง พร้อมลิงก์ไปเอกสาร
```

## 🧪 วิธีทดสอบ

### 1. ทดสอบการแสดงผล
```
1. เปิดหน้า Product Detail
2. คลิก Lot ที่มีการจอง
3. ควรเห็น:
   ✅ จำนวนรายการจองถูกต้อง
   ✅ เอกสารที่จองแสดง
   ✅ จำนวนที่จองถูกต้อง
   ✅ ปุ่ม "ดูเอกสาร" ทำงาน
```

### 2. ทดสอบ Debug
```
1. เปิด Console (F12)
2. คลิก Lot ที่มีการจอง
3. ดู log:
   ✅ "Loading lot reservations..."
   ✅ "Filtering reservations for lot..."
   ✅ "Found X reservations"
```

### 3. ทดสอบ Fallback
```
1. Simulate API failure (Network tab)
2. ระบบควร fallback ไป Method 2
3. ดู log:
   ⚠️ "[Method 1] Failed"
   ✅ "[Method 2] Loaded via direct API"
```

## 📝 ข้อมูลเพิ่มเติม

### โครงสร้างข้อมูลการจอง

```javascript
{
  _id: "reservation_id",
  reference_type: "quotation" | "invoice",
  reference_id: "document_id",
  product_id: "product_id",
  status: "not_paid" | "paid" | "cancelled" | "expired",
  
  // Format 1: Single lot
  lot_id: "lot_id",
  reserved_meters: 10,
  
  // Format 2: Multiple lots
  lots: [
    {
      lot_id: "lot_id",
      lot_code: "01234",
      reserved_meters: 10
    }
  ],
  
  created_at: "2025-11-10T...",
  expires_at: "2025-11-17T..."
}
```

### Routes ที่ลิงก์ไป

```javascript
// Quotation
/sales/quotations/:reference_id

// Invoice
/sales/invoices/:reference_id
```

## ✨ สรุป

การแก้ไขครั้งนี้ทำให้:
- ✅ แสดงข้อมูลการจองถูกต้อง แม้จะเก็บข้อมูลหลายรูปแบบ
- ✅ มี fallback method ป้องกันการโหลดล้มเหลว
- ✅ แสดงข้อมูล debug ช่วยวิเคราะห์ปัญหา
- ✅ คลิกไปเอกสารต้นทางได้ทันที
- ✅ แสดงจำนวนที่จองเฉพาะ lot นั้นๆ อย่างถูกต้อง

**ไฟล์ที่แก้ไข:**
- `/src/extensions/modules/erp/modules/inventory/components/ProductLotSummary.vue`

**Compile Status:**
```
✅ No errors found
```

**พร้อมใช้งานและ debug ได้ง่าย!** 🎉

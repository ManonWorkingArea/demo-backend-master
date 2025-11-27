# การแสดงข้อมูลการจองสต็อคในการเลือกสินค้า (Quotation Form)

## 📋 ภาพรวม

ระบบแสดงข้อมูลการจองสต็อค (lot_reservations) ในหน้า "เลือกสินค้าจากคลัง" ของใบเสนอราคา เพื่อให้ผู้ใช้ทราบว่า lot ไหนติดจอง จองไปเท่าไร และสามารถเลือกได้หรือไม่

## 🎯 ฟีเจอร์หลัก

### 1. แสดงข้อมูลการจอง
- **ติดจองบางส่วน** (Partially Reserved)
  - แสดง badge สีส้ม: "ติดจอง X ม."
  - แสดงจำนวนเมตรที่เหลือหลังหักจอง
  - ยังสามารถเลือกได้

- **ติดจองหมด** (Fully Reserved)
  - แสดง badge สีแดง: "ติดจองหมด"
  - จำนวนเมตรที่เหลือ = 0
  - ไม่สามารถเลือกได้ (disabled)

### 2. รายละเอียดการจอง
แต่ละ lot แสดง:
- จำนวนเมตรที่ติดจอง
- ประเภทการจอง (ทั้งม้วน / ระบุเมตร)
- เลขที่เอกสารที่จอง
- สถานะการจอง (รอชำระ / ชำระแล้ว)

### 3. การคำนวณสต็อคที่พร้อมใช้
```javascript
Available Meters = Remaining Meters - Reserved Meters (DB) - Additional Reservations
```

## 🛠️ Implementation Details

### ไฟล์ที่แก้ไข
`/src/extensions/modules/erp/modules/sales/components/quotation/shared/QuotationForm.vue`

### 1. State Management

```javascript
const lotReservations = ref({}) // Map: lot_id -> reservation data

// Structure:
{
  "lot_id_1": {
    total_reserved_meters: 50.5,
    reservations: [
      {
        id: "res_1",
        reference_type: "quotation",
        reference_code: "SQX20250001",
        reserved_meters: 30,
        status: "not_paid",
        is_full_roll: false,
        expiry_date: "2025-11-17T00:00:00Z"
      },
      // ...more reservations
    ]
  }
}
```

### 2. Core Functions

#### `loadLotReservations()`
โหลดข้อมูลการจองทั้งหมดจาก InventoryService

```javascript
const loadLotReservations = async () => {
  const reservations = await core.inventory.getReservations({
    status: ['not_paid', 'paid']
  })
  
  // Map by lot_id
  const reservationMap = {}
  for (const reservation of reservations) {
    const lotId = reservation.lot_id
    if (!reservationMap[lotId]) {
      reservationMap[lotId] = {
        total_reserved_meters: 0,
        reservations: []
      }
    }
    reservationMap[lotId].total_reserved_meters += reservation.reserved_meters
    reservationMap[lotId].reservations.push(reservation)
  }
  
  lotReservations.value = reservationMap
}
```

#### `getAvailableMeters(lot)`
คำนวณจำนวนเมตรที่เหลือให้เลือก

```javascript
const getAvailableMeters = (lot) => {
  const remaining = lot.remaining_meters
  const reserved = lot.reserved_meters || 0
  const additionalReserved = lotReservations.value[lot.id]?.total_reserved_meters || 0
  
  return Math.max(0, remaining - reserved - additionalReserved)
}
```

#### `isLotFullyReserved(lot)`
ตรวจสอบว่า lot ติดจองหมดหรือไม่

```javascript
const isLotFullyReserved = (lot) => {
  return getAvailableMeters(lot) <= 0
}
```

#### `getLotReservationStatus(lot)`
ดึงข้อมูลสถานะการจอง

```javascript
const getLotReservationStatus = (lot) => {
  const reservation = lotReservations.value[lot.id]
  if (!reservation) return null
  
  const available = getAvailableMeters(lot)
  const remaining = lot.remaining_meters
  
  if (available <= 0) {
    return {
      type: 'fully_reserved',
      label: 'ติดจองหมด',
      color: 'red',
      reservations: reservation.reservations
    }
  } else if (available < remaining) {
    return {
      type: 'partially_reserved',
      label: `ติดจอง ${reservation.total_reserved_meters.toFixed(2)} ม.`,
      color: 'orange',
      reservations: reservation.reservations
    }
  }
  
  return null
}
```

### 3. UI Components

#### Lot Card with Reservation Status

```vue
<div 
  v-for="lot in item.lots" 
  :key="lot.id"
  class="bg-gray-50 rounded p-2 text-xs border"
  :class="{
    'border-gray-200 hover:border-blue-300 cursor-pointer': getAvailableMeters(lot) > 0,
    'border-red-300 bg-red-50 opacity-75 cursor-not-allowed': getAvailableMeters(lot) <= 0
  }"
  @click.stop="getAvailableMeters(lot) > 0 ? selectProductWithLot(item, lot) : null"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-1">
    <span class="font-mono font-semibold">{{ lot.full_lot_code }}</span>
    
    <div class="flex items-center gap-2">
      <!-- Reservation Badge -->
      <span 
        v-if="getLotReservationStatus(lot)"
        :class="{
          'bg-red-100 text-red-700': getLotReservationStatus(lot).type === 'fully_reserved',
          'bg-orange-100 text-orange-700': getLotReservationStatus(lot).type === 'partially_reserved'
        }"
        class="px-2 py-0.5 rounded-full text-xs font-semibold"
      >
        <i class="fas fa-lock"></i>
        {{ getLotReservationStatus(lot).label }}
      </span>
      
      <!-- Available Meters -->
      <span 
        :class="{
          'text-green-600': getAvailableMeters(lot) > 0,
          'text-red-600': getAvailableMeters(lot) <= 0
        }"
        class="font-semibold"
      >
        {{ getAvailableMeters(lot).toFixed(2) }} ม.
      </span>
    </div>
  </div>
  
  <!-- Basic Info -->
  <div class="grid grid-cols-2 gap-1 text-gray-600">
    <span>ทั้งหมด: {{ lot.remaining_meters }} ม.</span>
    <span>น้ำหนัก: {{ lot.weight_kg }} กก.</span>
  </div>
  
  <!-- Reservation Details -->
  <div v-if="getLotReservationStatus(lot)" class="mt-2 pt-2 border-t">
    <div class="text-xs text-gray-700 font-semibold mb-1">
      <i class="fas fa-info-circle"></i>
      การจอง:
    </div>
    <div class="space-y-1">
      <div 
        v-for="reservation in getLotReservationStatus(lot).reservations.slice(0, 2)" 
        :key="reservation.id"
        class="text-xs pl-3"
      >
        <i class="fas fa-caret-right text-gray-400"></i>
        <span class="font-semibold">{{ reservation.reserved_meters.toFixed(2) }} ม.</span>
        <span v-if="reservation.is_full_roll" class="text-purple-600">(ทั้งม้วน)</span>
        - {{ reservation.reference_code }}
        <span 
          :class="{
            'text-orange-600': reservation.status === 'not_paid',
            'text-green-600': reservation.status === 'paid'
          }"
          class="font-semibold"
        >
          ({{ reservation.status === 'not_paid' ? 'รอชำระ' : 'ชำระแล้ว' }})
        </span>
      </div>
      <div 
        v-if="getLotReservationStatus(lot).reservations.length > 2" 
        class="text-xs text-gray-500 pl-3"
      >
        ... และอีก {{ getLotReservationStatus(lot).reservations.length - 2 }} รายการ
      </div>
    </div>
  </div>
  
  <!-- Not Available Notice -->
  <div v-if="getAvailableMeters(lot) <= 0" class="mt-2 pt-2 border-t border-red-200">
    <div class="flex items-center text-red-700 font-semibold">
      <i class="fas fa-ban mr-2"></i>
      <span>ไม่สามารถเลือกได้ (ติดจองหมดแล้ว)</span>
    </div>
  </div>
</div>
```

## 📊 UI States

### State 1: ว่าง (No Reservation)
```
┌─────────────────────────────────────┐
│ LOT-251108-7738        50.00 ม.    │
│ ทั้งหมด: 50 ม.    น้ำหนัก: 10 กก. │
└─────────────────────────────────────┘
สถานะ: สีเขียว, คลิกได้
```

### State 2: ติดจองบางส่วน (Partially Reserved)
```
┌─────────────────────────────────────┐
│ LOT-251108-7738                     │
│ [🔒 ติดจอง 20 ม.] 30.00 ม.         │
│ ทั้งหมด: 50 ม.    น้ำหนัก: 10 กก. │
│ ─────────────────────────────────── │
│ ℹ️ การจอง:                          │
│   ▸ 20.00 ม. - SQX20250001 (รอชำระ)│
└─────────────────────────────────────┘
สถานะ: สีส้ม, คลิกได้
```

### State 3: ติดจองหมด (Fully Reserved)
```
┌─────────────────────────────────────┐
│ LOT-251108-7738                     │
│ [🔒 ติดจองหมด] 0.00 ม.             │
│ ทั้งหมด: 50 ม.    น้ำหนัก: 10 กก. │
│ ─────────────────────────────────── │
│ ℹ️ การจอง:                          │
│   ▸ 30.00 ม. - SQX20250001 (รอชำระ)│
│   ▸ 20.00 ม. (ทั้งม้วน) - SQX20250002 (ชำระแล้ว)│
│ ─────────────────────────────────── │
│ 🚫 ไม่สามารถเลือกได้ (ติดจองหมดแล้ว)│
└─────────────────────────────────────┘
สถานะ: สีแดง, คลิกไม่ได้
```

## 🔄 Data Flow

```
1. User clicks "เลือกจากคลัง"
   ↓
2. showProductModal() triggered
   ↓
3. Load products (if not loaded)
   ↓
4. Load lot tracking data for textile products
   ↓
5. loadLotReservations() - Fetch all reservations
   ↓
6. Map reservations by lot_id
   ↓
7. Display modal with reservation info
   ↓
8. User expands lot list
   ↓
9. For each lot:
   - Calculate getAvailableMeters()
   - Determine getLotReservationStatus()
   - Apply UI state (colors, disabled, etc.)
   ↓
10. User selects available lot
    ↓
11. If available > 0: Open lot method modal
    If available <= 0: Do nothing (disabled)
```

## 🎨 Color Scheme

| สถานะ | สี Badge | สีข้อความ | Cursor |
|-------|----------|-----------|--------|
| ว่าง | - | เขียว | pointer |
| ติดจองบางส่วน | ส้ม | ส้ม/เขียว | pointer |
| ติดจองหมด | แดง | แดง | not-allowed |

## 📝 Example Scenarios

### Scenario 1: Lot มี 50 เมตร ติดจอง 20 เมตร (รอชำระ)
- **แสดงผล**: Badge "ติดจอง 20 ม." สีส้ม, เหลือ 30 ม.
- **การทำงาน**: เลือกได้ สูงสุด 30 เมตร
- **รายละเอียด**: แสดง 1 รายการจอง SQX20250001 (รอชำระ)

### Scenario 2: Lot มี 50 เมตร ติดจองหมด (30 + 20 = 50)
- **แสดงผล**: Badge "ติดจองหมด" สีแดง, เหลือ 0 ม.
- **การทำงาน**: เลือกไม่ได้ (disabled)
- **รายละเอียด**: แสดง 2 รายการจอง (แสดงแค่ 2 รายการแรก + นับรวม)

### Scenario 3: Lot มี 50 เมตร ติดจอง 50 เมตร ทั้งม้วน (ชำระแล้ว)
- **แสดงผล**: Badge "ติดจองหมด" สีแดง, เหลือ 0 ม.
- **การทำงาน**: เลือกไม่ได้
- **รายละเอียด**: แสดง "50.00 ม. (ทั้งม้วน) - SQX20250001 (ชำระแล้ว)"

## 🔧 Testing Checklist

### 1. การโหลดข้อมูล
- [ ] โหลดข้อมูล lot_reservations ได้ถูกต้อง
- [ ] Map reservation กับ lot_id ถูกต้อง
- [ ] คำนวณ total_reserved_meters ถูกต้อง

### 2. การแสดงผล
- [ ] Lot ว่าง แสดงสีเขียว ไม่มี badge
- [ ] Lot ติดจองบางส่วน แสดง badge สีส้ม + จำนวนเมตร
- [ ] Lot ติดจองหมด แสดง badge สีแดง + disabled

### 3. การคำนวณ
- [ ] getAvailableMeters() คำนวณถูกต้อง
- [ ] รองรับ reserved_meters จาก DB + lotReservations
- [ ] ไม่ติดลบ (Math.max(0, ...))

### 4. รายละเอียดการจอง
- [ ] แสดงสูงสุด 2 รายการ
- [ ] แสดงจำนวนรายการเพิ่มเติม (... และอีก X รายการ)
- [ ] แสดงสถานะการจอง (รอชำระ/ชำระแล้ว) ถูกต้อง
- [ ] แสดง (ทั้งม้วน) เมื่อ is_full_roll = true

### 5. Interaction
- [ ] คลิกเลือก lot ที่มีสต็อคเหลือได้
- [ ] คลิก lot ที่ติดจองหมดไม่ทำงาน
- [ ] เปิด lot method modal ได้ถูกต้อง

## 🚀 Performance Considerations

1. **Lazy Loading**: โหลด reservations เมื่อเปิด modal เท่านั้น
2. **Caching**: เก็บ lotReservations ใน ref ไม่ต้องโหลดซ้ำ
3. **Computed Values**: ใช้ฟังก์ชัน getAvailableMeters() แทน computed เพื่อความยืดหยุ่น
4. **Limited Display**: แสดงรายละเอียดการจองสูงสุด 2 รายการเพื่อประหยัด space

## 📌 Notes

- ระบบรองรับทั้งการจอง **ทั้งม้วน** และ **ระบุเมตร**
- สถานะการจอง: `not_paid` (7 วัน) และ `paid` (ถาวร)
- reserved_meters ใน textile_lot_tracking อัปเดตเมื่อสร้างการจอง
- ระบบคำนวณ available_meters แบบ real-time จากหลายแหล่ง

## 🔗 Related Files

- `QuotationForm.vue` - Main component
- `InventoryService.js` - getReservations(), getLotTracking()
- `SalesService.js` - createInvoiceFromQuotation() (trigger reservation)
- `QUOTATION_INVOICE_STOCK_RESERVATION.md` - Overall system documentation

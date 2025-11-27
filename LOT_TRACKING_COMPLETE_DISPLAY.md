# การแสดงข้อมูล Lot Tracking แบบครบถ้วน (Product Detail)

## 📋 ภาพรวม

ปรับปรุงการแสดงข้อมูล Lot Tracking ในหน้า Product Detail ให้แสดงข้อมูลครบถ้วน ทั้ง:
- จำนวนที่มีทั้งหมด (Total)
- จำนวนที่ติดจอง (Reserved)
- จำนวนที่พร้อมใช้ (Available)

## 🎯 การเปลี่ยนแปลง

### 1. Summary Cards (5 Cards)

เพิ่ม card แสดงยอดรวมด้านบน:

```vue
<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
  <!-- 1. จำนวน Lot -->
  <div class="bg-blue-50">
    <div class="text-sm font-medium text-blue-800">จำนวน Lot</div>
    <div class="text-2xl font-bold text-blue-900">{{ validLotTrackingData.length }}</div>
    <div class="text-xs text-blue-600">ม้วน</div>
  </div>
  
  <!-- 2. เมตรทั้งหมด -->
  <div class="bg-purple-50">
    <div class="text-sm font-medium text-purple-800">เมตรทั้งหมด</div>
    <div class="text-2xl font-bold text-purple-900">{{ getTotalMeters() }}</div>
    <div class="text-xs text-purple-600">เมตร</div>
  </div>
  
  <!-- 3. ติดจองแล้ว (ใหม่!) -->
  <div class="bg-orange-50">
    <div class="text-sm font-medium text-orange-800">ติดจองแล้ว</div>
    <div class="text-2xl font-bold text-orange-900">{{ getTotalReservedMeters() }}</div>
    <div class="text-xs text-orange-600">เมตร</div>
  </div>
  
  <!-- 4. พร้อมใช้ (ใหม่!) -->
  <div class="bg-green-50">
    <div class="text-sm font-medium text-green-800">พร้อมใช้</div>
    <div class="text-2xl font-bold text-green-900">{{ getAvailableMeters() }}</div>
    <div class="text-xs text-green-600">เมตร</div>
  </div>
  
  <!-- 5. น้ำหนักรวม -->
  <div class="bg-yellow-50">
    <div class="text-sm font-medium text-yellow-800">น้ำหนักรวม</div>
    <div class="text-2xl font-bold text-yellow-900">{{ getTotalWeight() }}</div>
    <div class="text-xs text-yellow-600">กิโลกรัม</div>
  </div>
</div>
```

### 2. Table Column: จำนวน (เมตร)

เพิ่มคอลัมน์ใหม่แสดงรายละเอียดจำนวนสำหรับแต่ละ lot:

```vue
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  จำนวน (เมตร)
</th>
```

### 3. Lot Detail Display

แสดงข้อมูลแบบแยกชั้นในแต่ละแถว:

```vue
<td class="px-6 py-4">
  <div class="space-y-1">
    <!-- ทั้งหมด -->
    <div class="flex items-center justify-between text-sm">
      <span class="text-gray-600">ทั้งหมด:</span>
      <span class="font-semibold text-blue-900">
        {{ formatNumber(lot.remaining_meters || 0) }} ม.
      </span>
    </div>
    
    <!-- ติดจอง (แสดงเมื่อมีการจอง) -->
    <div class="flex items-center justify-between text-sm" 
         v-if="(lot.reserved_meters || 0) > 0">
      <span class="text-orange-600">ติดจอง:</span>
      <span class="font-semibold text-orange-700">
        {{ formatNumber(lot.reserved_meters || 0) }} ม.
      </span>
    </div>
    
    <!-- พร้อมใช้ -->
    <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-1">
      <span class="text-green-600 font-medium">พร้อมใช้:</span>
      <span class="font-bold text-green-700">
        {{ formatNumber((lot.remaining_meters || 0) - (lot.reserved_meters || 0)) }} ม.
      </span>
    </div>
  </div>
</td>
```

### 4. New Methods

เพิ่ม methods สำหรับคำนวณยอดรวม:

```javascript
const getTotalMeters = () => {
  if (!lotTrackingData.value.length) return '0'
  const total = lotTrackingData.value.reduce((sum, lot) => 
    sum + (lot.remaining_meters || lot.calculated_meters || 0), 0
  )
  return total.toFixed(2)
}

const getTotalReservedMeters = () => {
  if (!lotTrackingData.value.length) return '0'
  const total = lotTrackingData.value.reduce((sum, lot) => 
    sum + (lot.reserved_meters || 0), 0
  )
  return total.toFixed(2)
}

const getAvailableMeters = () => {
  if (!lotTrackingData.value.length) return '0'
  const total = lotTrackingData.value.reduce((sum, lot) => {
    const remaining = lot.remaining_meters || lot.calculated_meters || 0
    const reserved = lot.reserved_meters || 0
    return sum + (remaining - reserved)
  }, 0)
  return total.toFixed(2)
}
```

## 📊 ตัวอย่างการแสดงผล

### Summary Cards:
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  จำนวน Lot  │ เมตรทั้งหมด │ ติดจองแล้ว  │  พร้อมใช้   │ น้ำหนักรวม  │
│      8      │    971     │      0      │   971.0    │   854.0    │
│     ม้วน     │    เมตร    │    เมตร     │    เมตร    │  กิโลกรัม   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Lot Table Row (ตัวอย่าง):
```
┌──────────────┬────────────────┬────────────────────────┐
│  LOT-01234   │ น้ำหนัก: 50 กก.│ จำนวน (เมตร)          │
│              │ คำนวณ: 50 ม.  │ ทั้งหมด:    50.00 ม.  │
│              │                │ ติดจอง:     20.00 ม.  │
│              │                │ ───────────────────── │
│              │                │ พร้อมใช้:   30.00 ม.  │
└──────────────┴────────────────┴────────────────────────┘
```

## 🎨 Color Scheme

| ข้อมูล | สี | Tailwind Class |
|--------|----|--------------------|
| จำนวน Lot | น้ำเงิน | bg-blue-50 |
| เมตรทั้งหมด | ม่วง | bg-purple-50 |
| ติดจองแล้ว | ส้ม | bg-orange-50 |
| พร้อมใช้ | เขียว | bg-green-50 |
| น้ำหนักรวม | เหลือง | bg-yellow-50 |

## 🔢 การคำนวณ

### Available Meters (เมตรพร้อมใช้)
```
Available = Remaining - Reserved
```

### ตัวอย่าง:
```javascript
// Lot 1: remaining_meters = 50, reserved_meters = 20
Available = 50 - 20 = 30 เมตร

// Lot 2: remaining_meters = 100, reserved_meters = 0
Available = 100 - 0 = 100 เมตร

// Total Available = 30 + 100 = 130 เมตร
```

## 📝 Use Cases

### Case 1: ไม่มีการจอง
```
ทั้งหมด:   50.00 ม.
───────────────────
พร้อมใช้:  50.00 ม. ✅
```
*ไม่แสดงแถว "ติดจอง" เพราะเป็น 0*

### Case 2: มีการจองบางส่วน
```
ทั้งหมด:   50.00 ม.
ติดจอง:    20.00 ม. 🔒
───────────────────
พร้อมใช้:  30.00 ม. ✅
```

### Case 3: จองหมดแล้ว
```
ทั้งหมด:   50.00 ม.
ติดจอง:    50.00 ม. 🔒
───────────────────
พร้อมใช้:   0.00 ม. ⚠️
```

## 🛠️ Implementation Details

### Data Flow:
```
1. loadLotTrackingData()
   ↓
2. InventoryService.getLotTracking(product_id)
   ↓
3. lotTrackingData.value = results
   ↓
4. validLotTrackingData (filter valid lots)
   ↓
5. Calculate Summary:
   - getTotalMeters()
   - getTotalReservedMeters()
   - getAvailableMeters()
   ↓
6. Display in UI
```

### Field Mapping:
```javascript
{
  lot_id: "690f298dd04c13d4086ccb8e",
  lot_code: "01234",
  full_lot_code: "1234561520883",
  
  // จำนวนเมตร
  remaining_meters: 50,      // ทั้งหมด
  reserved_meters: 20,       // ติดจอง
  // available: 30 (calculated) // พร้อมใช้
  
  weight_kg: 10,
  calculated_meters: 50,
  status: "active"
}
```

## ✅ Benefits

1. **ความชัดเจน**: เห็นภาพรวมและรายละเอียดได้ชัดเจน
2. **Real-time**: ข้อมูลอัปเดตตามการจองจริง
3. **Visual Hierarchy**: ใช้สีและขนาดแสดงความสำคัญ
4. **Responsive**: แสดงผลดีทั้งจอใหญ่และมือถือ
5. **Accurate**: คำนวณจากข้อมูลจริงใน database

## 🔗 Related Files

- `Detail.vue` - Product detail page with lot tracking display
- `InventoryService.js` - getLotTracking() method
- `QUOTATION_INVOICE_STOCK_RESERVATION.md` - Overall reservation system
- `LOT_RESERVATION_DISPLAY_IN_QUOTATION.md` - Quotation form lot display

## 📌 Notes

- การจอง (reserved_meters) อัปเดตเมื่อมีการสร้าง Invoice จาก Quotation
- ข้อมูล lot ดึงจาก `textile_lot_tracking` collection
- Summary cards อัปเดตอัตโนมัติเมื่อ refresh lot data
- แสดง "ติดจอง" เฉพาะเมื่อ `reserved_meters > 0`

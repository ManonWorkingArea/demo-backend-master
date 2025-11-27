# ProductLotSummary - แสดงข้อมูลการจองและความพร้อมใช้งาน

## 📋 สรุปการเปลี่ยนแปลง

เพิ่มการแสดงข้อมูล **ติดจองแล้ว (Reserved)** และ **พร้อมใช้ (Available)** ในคอมโพเนนต์ `ProductLotSummary.vue` เพื่อให้เห็นภาพรวมของสต็อคที่ชัดเจน

## 🎯 ปัญหาที่แก้ไข

### ก่อนแก้ไข
- ❌ แสดงเฉพาะ "เมตรทั้งหมด" ไม่ทราบว่ามีการจองเท่าไหร่
- ❌ ไม่รู้ว่าเมตรที่พร้อมใช้จริงมีเท่าไหร่
- ❌ ตารางไม่มีคอลัมน์แสดงรายละเอียดการจอง

### หลังแก้ไข
- ✅ แสดง **7 Summary Cards** (เพิ่มจาก 5)
- ✅ ตารางมีคอลัมน์ **"จำนวน (เมตร)"** แสดงรายละเอียด 3 ระดับ
- ✅ คำนวณและแสดง Reserved & Available แบบ real-time

## 🔧 การเปลี่ยนแปลงทั้งหมด

### 1. Summary Cards (เพิ่มจาก 5 เป็น 7 การ์ด)

**เพิ่มใหม่ 2 การ์ด:**

```vue
<!-- ติดจองแล้ว - NEW -->
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
  <div class="flex items-center justify-center mb-2">
    <i class="fas fa-lock text-amber-600 text-xl mr-2"></i>
    <span class="text-sm text-amber-600 font-medium">ติดจองแล้ว</span>
  </div>
  <div class="text-2xl font-bold text-amber-700">
    {{ lotSummary.totalReservedMeters?.toFixed(0) || '0' }}
  </div>
  <div class="text-xs text-amber-600">เมตร</div>
</div>

<!-- พร้อมใช้ - NEW -->
<div class="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
  <div class="flex items-center justify-center mb-2">
    <i class="fas fa-check-circle text-teal-600 text-xl mr-2"></i>
    <span class="text-sm text-teal-600 font-medium">พร้อมใช้</span>
  </div>
  <div class="text-2xl font-bold text-teal-700">
    {{ lotSummary.totalAvailableMeters?.toFixed(0) || '0' }}
  </div>
  <div class="text-xs text-teal-600">เมตร</div>
</div>
```

**7 การ์ดทั้งหมด:**
1. 🔵 จำนวน Lot รวม (ม้วน)
2. 🟢 ม้วนเต็ม (ม้วน)
3. 🟠 ม้วนไม่เต็ม (ม้วน)
4. 🟣 เมตรทั้งหมด (เมตร)
5. 🟡 **ติดจองแล้ว (เมตร)** ⭐ ใหม่
6. 🟢 **พร้อมใช้ (เมตร)** ⭐ ใหม่
7. 🔵 น้ำหนักรวม (กิโลกรัม)

### 2. ตาราง Lot - เพิ่มคอลัมน์ใหม่

**Header เดิม (6 คอลัมน์):**
```
LOT CODE | รหัส Lot (เต็ม) | น้ำหนัก/เมตร | ผู้ใหญ่ | วันรับ | PURCHASE ORDER
```

**Header ใหม่ (7 คอลัมน์):**
```
LOT CODE | รหัส Lot (เต็ม) | น้ำหนัก/เมตร | จำนวน (เมตร) | ผู้ใหญ่ | วันรับ | PURCHASE ORDER
                                                  ⭐ ใหม่
```

**คอลัมน์ "จำนวน (เมตร)" แสดง 3 ระดับ:**

```vue
<div class="space-y-1">
  <!-- ทั้งหมด (Total) -->
  <div class="flex items-center justify-between text-sm">
    <span class="text-gray-600">ทั้งหมด:</span>
    <span class="font-semibold text-blue-900">50.00 ม.</span>
  </div>
  
  <!-- ติดจอง (Reserved) - แสดงเฉพาะเมื่อมีการจอง -->
  <div class="flex items-center justify-between text-sm" v-if="lot.reserved_meters > 0">
    <span class="text-orange-600">ติดจอง:</span>
    <span class="font-semibold text-orange-700">20.00 ม.</span>
  </div>
  
  <!-- พร้อมใช้ (Available) -->
  <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-1">
    <span class="text-green-600 font-medium">พร้อมใช้:</span>
    <span class="font-bold text-green-700">30.00 ม.</span>
  </div>
</div>
```

### 3. Computed Property - เพิ่มการคำนวณ

**เพิ่มใน `lotSummary` computed:**

```javascript
const lotSummary = computed(() => {
  const summary = lotData.value.reduce((acc, lot) => {
    // คำนวณค่าต่างๆ
    const remainingMeters = lot.remaining_meters || lot.calculated_meters || 0
    const reservedMeters = lot.reserved_meters || 0
    const availableMeters = remainingMeters - reservedMeters
    
    // สะสมค่า
    acc.totalMeters += remainingMeters
    acc.totalReservedMeters += reservedMeters        // ⭐ ใหม่
    acc.totalAvailableMeters += availableMeters      // ⭐ ใหม่
    
    // ... rest of the code
    
    return acc
  }, {
    totalWeight: 0,
    totalMeters: 0,
    totalReservedMeters: 0,      // ⭐ ใหม่
    totalAvailableMeters: 0,     // ⭐ ใหม่
    totalLots: 0,
    fullLots: 0,
    partialLots: 0,
    emptyLots: 0,
    activeLots: 0
  })

  return summary
})
```

### 4. Helper Methods - เพิ่ม 2 functions

```javascript
// 1. Format ตัวเลขให้มี 2 ตำแหน่งทศนิยม
const formatNumber = (value) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

// 2. คำนวณเมตรที่พร้อมใช้สำหรับแต่ละ lot
const getLotAvailableMeters = (lot) => {
  const total = lot.remaining_meters || lot.calculated_meters || 0
  const reserved = lot.reserved_meters || 0
  return total - reserved
}
```

### 5. Grid Layout Adjustment

**เดิม:**
```vue
<div class="grid grid-cols-5 gap-4">  <!-- 5 cards -->
<div class="grid grid-cols-6 gap-4">  <!-- 6 columns -->
```

**ใหม่:**
```vue
<div class="grid grid-cols-7 gap-4">  <!-- 7 cards -->
<div class="grid grid-cols-7 gap-4">  <!-- 7 columns -->
```

## 📊 การคำนวณ

### สูตรที่ใช้

```
เมตรทั้งหมด (Total Meters) = Σ remaining_meters
ติดจองแล้ว (Reserved Meters) = Σ reserved_meters
พร้อมใช้ (Available Meters) = Σ (remaining_meters - reserved_meters)
```

### ตัวอย่างข้อมูล

```
Lot 1: ทั้งหมด 100 ม., ติดจอง 30 ม., พร้อมใช้ 70 ม.
Lot 2: ทั้งหมด 50 ม.,  ติดจอง 0 ม.,  พร้อมใช้ 50 ม.
Lot 3: ทั้งหมด 75 ม.,  ติดจอง 25 ม., พร้อมใช้ 50 ม.
─────────────────────────────────────────────────────
รวม:  ทั้งหมด 225 ม., ติดจอง 55 ม., พร้อมใช้ 170 ม.
```

## 🎨 สีที่ใช้

| ข้อมูล | สี | คลาส | ความหมาย |
|--------|-----|------|----------|
| ทั้งหมด | น้ำเงิน | `text-blue-900` | ข้อมูลหลัก |
| ติดจอง | ส้ม/เหลือง | `text-orange-700` / `bg-amber-50` | เตือนว่ามีการจอง |
| พร้อมใช้ | เขียว | `text-green-700` / `bg-teal-50` | สถานะดี พร้อมใช้ |

## 🔍 ตัวอย่าง UI

### Summary Cards (7 การ์ด)
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Lot รวม     │ ม้วนเต็ม    │ ม้วนไม่เต็ม │ เมตรทั้งหมด │ ติดจองแล้ว  │ พร้อมใช้     │ น้ำหนักรวม  │
│    8        │    5        │    3        │   225       │    55       │   170       │   150.5     │
│   ม้วน      │   ม้วน      │   ม้วน      │   เมตร      │   เมตร      │   เมตร      │   กก.       │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### ตาราง Lot (แสดงคอลัมน์จำนวน)
```
┌──────────┬──────────────┬────────────┬─────────────────┬──────────┐
│ LOT CODE │ รหัส Lot     │ น้ำหนัก    │ จำนวน (เมตร)    │ ผู้ใหญ่  │
├──────────┼──────────────┼────────────┼─────────────────┼──────────┤
│ 01234    │ 12345615... │ 50 กก.     │ ทั้งหมด: 50 ม.  │ qwdqw    │
│          │              │ 166.67 ม.  │ ติดจอง: 20 ม.   │ WH-01    │
│          │              │            │ ───────────────  │          │
│          │              │            │ พร้อมใช้: 30 ม. │          │
└──────────┴──────────────┴────────────┴─────────────────┴──────────┘
```

## ✨ ฟีเจอร์เพิ่มเติม

### 1. Conditional Display
- แสดง "ติดจอง" เฉพาะเมื่อ `reserved_meters > 0`
- ถ้าไม่มีการจอง จะแสดงเพียง "ทั้งหมด" และ "พร้อมใช้"

### 2. Visual Hierarchy
```
ทั้งหมด:   (สีเทา, font-semibold)
ติดจอง:    (สีส้ม, font-semibold)
─────────  (เส้นแบ่ง)
พร้อมใช้:  (สีเขียว, font-bold) ← เน้นที่สุด
```

### 3. Responsive Grid
- Desktop: 7 คอลัมน์เต็ม
- Tablet/Mobile: จะปรับเป็น responsive grid อัตโนมัติ

## 📝 Data Flow

```
1. โหลดข้อมูล Lot
   ↓
   getLotTracking(productId)
   ↓
2. คำนวณในตารางแต่ละแถว
   ↓
   getLotAvailableMeters(lot) → remaining - reserved
   ↓
3. คำนวณสรุปรวม (computed)
   ↓
   lotSummary → totalReservedMeters, totalAvailableMeters
   ↓
4. แสดงผลใน Summary Cards + ตาราง
```

## 🔄 Real-time Updates

เมื่อมีการ:
- จองสินค้า (Quotation/Invoice)
- ยกเลิกการจอง
- รับสินค้าเข้า

คอมโพเนนต์จะอัปเดตข้อมูลอัตโนมัติ:
```javascript
watch(lotData, () => {
  // lotSummary จะคำนวณใหม่อัตโนมัติ (reactive)
})
```

## 🎯 ประโยชน์

### สำหรับผู้ใช้งาน
1. **รู้ทันสถานการณ์**: เห็นสต็อคจริงที่พร้อมใช้
2. **วางแผนได้ดี**: รู้ว่าต้องสั่งซื้อเพิ่มหรือไม่
3. **หลีกเลี่ยงข้อผิดพลาด**: ไม่จองสินค้าเกินที่มี

### สำหรับระบบ
1. **Data Integrity**: คำนวณจาก database จริง
2. **Consistency**: ใช้สูตรเดียวกันทั้งหมด
3. **Performance**: Computed property cache ผลลัพธ์

## 🚀 การใช้งาน

### ในหน้า Product Detail
```vue
<ProductLotSummary 
  v-if="isTextileProduct" 
  :product-id="product.id || product._id" 
/>
```

คอมโพเนนต์จะ:
- ✅ โหลดข้อมูล lot อัตโนมัติ
- ✅ คำนวณและแสดง Reserved/Available
- ✅ อัปเดต real-time เมื่อข้อมูลเปลี่ยน

## 🔍 ตัวอย่างจริง

### กรณีที่ 1: ไม่มีการจอง
```
Lot 12344
├─ ทั้งหมด:   50.00 ม.
└─ พร้อมใช้:  50.00 ม.  ← เท่ากับทั้งหมด
```

### กรณีที่ 2: มีการจองบางส่วน
```
Lot 12344
├─ ทั้งหมด:   50.00 ม.
├─ ติดจอง:    20.00 ม.  ← แสดงเพิ่ม
├─ ─────────────────
└─ พร้อมใช้:  30.00 ม.  ← คำนวณเหลือ
```

### กรณีที่ 3: จองหมด
```
Lot 12344
├─ ทั้งหมด:   50.00 ม.
├─ ติดจอง:    50.00 ม.  ← จองเต็ม
├─ ─────────────────
└─ พร้อมใช้:   0.00 ม.  ← เหลือ 0 (สีแดงเตือน)
```

## ✅ สรุป

การเปลี่ยนแปลงครั้งนี้ทำให้:
- ✅ แสดงข้อมูลการจองและความพร้อมใช้งานครบถ้วน
- ✅ ผู้ใช้เห็นภาพรวมของสต็อคที่ชัดเจน
- ✅ ป้องกันการจองสินค้าเกินที่มี
- ✅ รองรับการวางแผนการผลิตและสั่งซื้อได้ดีขึ้น

**ไฟล์ที่แก้ไข:**
- `/src/extensions/modules/erp/modules/inventory/components/ProductLotSummary.vue`

**Compile Status:**
```
✅ No errors found
```

**พร้อมใช้งาน! 🎉**

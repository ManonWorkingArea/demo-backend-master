# Textile Lot Registry System

ระบบจัดการ Lot สำหรับสินค้าประเภทผ้า รองรับการติดตาม การแยก และการเบิกใช้แบบรายละเอียด

## รูปแบบ Lot ID
```
XXX-XXX-XXX-XXXXX
402-177-152-08883
 |   |   |    |
 |   |   |    └── ลำดับ Lot (5 หลัก)
 |   |   └────── ความกว้าง (cm)
 |   └─────────── รหัสสี (3 หลัก)
 └─────────────── รหัสรุ่น (3 หลัก)
```

## คุณสมบัติหลัก

### 1. การสร้าง Lot ใหม่
- รองรับการสร้าง Lot จากข้อมูลสินค้า
- คำนวณเมตรจากน้ำหนักอัตโนมัติ
- ตรวจสอบความถูกต้องของข้อมูล
- สร้างลำดับ Lot อัตโนมัติ

### 2. การแยก Lot (Split)
- แยกตามน้ำหนัก (kg) หรือเมตร (m)
- สร้าง Lot ใหม่และปรับปรุง Lot เดิม
- ติดตามประวัติการแยก
- ตรวจสอบยอดคงเหลือ

### 3. การเบิกใช้ (Consume)
- เบิกบางส่วนหรือทั้งหมด
- บันทึกวัตถุประสงค์การใช้งาน
- ติดตามผู้เบิกและแผนก
- อัปเดตสถานะ Lot

### 4. การติดตาม
- ประวัติการเคลื่อนไหวทั้งหมด
- สถิติการใช้งาน
- รายงานการใช้งาน
- ตรวจสอบสต็อกคงเหลือ

## โครงสร้างไฟล์

### ไฟล์ Database Schema
```
/masterdata/inventory/
├── schema.js                      # เพิ่มฟิลด์ textile ใน inventory schema
├── lot_registry/
│   ├── schema.js                  # Lot registry schema
│   ├── index.js                   # MongoDB indexes
│   └── data.js                    # ข้อมูลเริ่มต้นและ helpers
```

### ไฟล์ Service Layer
```
/services/
└── LotRegistryService.js          # Business logic สำหรับ lot operations
```

### ไฟล์ Components
```
/components/lot-registry/
├── List.vue                       # หน้าแสดงรายการ lots
├── CreateLotModal.vue             # Modal สร้าง lot ใหม่
├── SplitLotModal.vue              # Modal แยก lot
├── ConsumeLotModal.vue            # Modal เบิกใช้ lot
└── index.js                       # Export components
```

### ไฟล์ Views
```
/views/
└── LotRegistry.vue                # หน้าหลักจัดการ lot registry
```

## การใช้งาน

### 1. การติดตั้ง
เพิ่ม route ใน inventory module:
```javascript
{
  path: '/lot-registry',
  name: 'LotRegistry',
  component: () => import('./views/LotRegistry.vue'),
  meta: {
    title: 'Lot Registry',
    icon: 'fas fa-layer-group'
  }
}
```

### 2. การกำหนดค่าสินค้า
เปิดใช้งาน lot tracking ในฟอร์มสินค้า:
```javascript
// ในฟอร์มสินค้า
category: 'textile',
enable_lot_tracking: true,
fabric_type: 'cotton',
weight_per_meter: 0.3,
fabric_width_cm: 152
```

### 3. การสร้าง Lot
```javascript
const lotData = {
  product_id: 'PRD001',
  model_code: '402',
  color_code: '177', 
  width_cm: 152,
  original_weight_kg: 25.5,
  weight_per_meter: 0.3
}

await lotService.createLotRegistry(lotData)
```

### 4. การแยก Lot
```javascript
await lotService.splitLot({
  lot_id: '402-177-152-08883',
  split_method: 'weight',
  amount: 5.0,
  new_lot_data: {
    location: 'WH01-A-002',
    reason: 'แยกสำหรับงานฉุกเฉิน'
  }
})
```

### 5. การเบิกใช้
```javascript
await lotService.consumeLot({
  lot_id: '402-177-152-08883',
  consume_method: 'meters',
  amount: 10.5,
  usage_data: {
    purpose: 'production',
    requested_by: 'นายก ช่าง',
    department: 'แผนกผลิต'
  }
})
```

## ข้อมูลเพิ่มเติม

### สถานะ Lot
- `active`: ใช้งานได้
- `partial`: ใช้บางส่วน
- `consumed`: ใช้หมด
- `hold`: ระงับการใช้งาน

### ประเภทการดำเนินการ
- `create`: สร้าง lot ใหม่
- `split`: แยก lot
- `consume`: เบิกใช้
- `transfer`: โอนย้าย
- `adjust`: ปรับปรุงสต็อก

### การตรวจสอบข้อผิดพลาด
- ตรวจสอบรูปแบบ Lot ID
- ตรวจสอบยอดคงเหลือ
- ตรวจสอบสิทธิการเข้าถึง
- ตรวจสอบสถานะ Lot

## การพัฒนาเพิ่มเติม

### 1. Integration กับ Goods Receipt
เชื่อมต่อกับระบบรับสินค้าเพื่อสร้าง lot อัตโนมัติ:

```javascript
// ในฟังก์ชันรับสินค้า
if (product.enable_lot_tracking) {
  await createLotFromGoodsReceipt(receiptData)
}
```

### 2. Reports & Analytics
เพิ่มรายงานการใช้งาน:
- รายงานการหมุนเวียนสต็อก
- วิเคราะห์การใช้งาน
- ประวัติการเคลื่อนไหว
- การพยากรณ์ความต้องการ

### 3. Barcode Integration
เพิ่มการสแกนบาร์โค้ด:
- สร้าง QR Code สำหรับ lot
- สแกนเพื่อดูข้อมูล
- สแกนเพื่อเบิกใช้

### 4. Mobile Support
รองรับการใช้งานบนมือถือ:
- สแกนบาร์โค้ดผ่านมือถือ
- เบิกใช้ในโรงงาน
- ตรวจสอบสต็อกแบบ real-time
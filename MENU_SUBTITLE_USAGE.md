# วิธีการใช้งาน Menu Subtitle

## การเพิ่ม subtitle ให้กับเมนู

### วิธีที่ 1: เพิ่มใน Plugin Route Structure
```javascript
// ในไฟล์ plugin route (เช่น extensions/modules/erp/routes.js)
export default {
  name: 'การจัดซื้อ',
  translatedTitle: 'การจัดซื้อ', 
  subtitle: 'จัดการใบสั่งซื้อ', // เพิ่มบรรทัดนี้
  path: '/purchase',
  icon: 'shopping-cart',
  // ... properties อื่นๆ
}
```

### วิธีที่ 2: เพิ่มใน meta object
```javascript
export default {
  name: 'การจัดซื้อ',
  translatedTitle: 'การจัดซื้อ',
  path: '/purchase', 
  icon: 'shopping-cart',
  meta: {
    subtitle: 'จัดการใบสั่งซื้อ' // เพิ่มใน meta object
  }
  // ... properties อื่นๆ
}
```

## ตัวอย่างการใช้งาน

### เมนูที่มี subtitle
```javascript
{
  name: 'การขาย',
  translatedTitle: 'การขาย',
  subtitle: 'บันทึกการขาย',
  path: '/sales',
  icon: 'cash-register'
}
```

### เมนูที่ไม่มี subtitle  
```javascript
{
  name: 'รายงาน',
  translatedTitle: 'รายงาน', 
  // ไม่มี subtitle - จะไม่แสดง
  path: '/reports',
  icon: 'chart-bar'
}
```

## ผลลัพธ์
- เมนูที่มี subtitle จะแสดง 2 บรรทัด:
  - บรรทัดแรก: ชื่อเมนูหลัก (text-xs, font-medium)
  - บรรทัดสอง: subtitle (text-xs, font-normal, opacity-70)

- เมนูที่ไม่มี subtitle จะแสดงแค่ 1 บรรทัดเหมือนเดิม

## CSS Classes ที่เกี่ยวข้อง
- `.nav-item-enhanced`: เปลี่ยนเป็น flex items-center เพื่อรองรับ layout ใหม่
- `.menu-subtitle`: สไตล์สำหรับ subtitle (text-xs, opacity-70, font-normal)

## หมายเหตุ
- subtitle จะแสดงเฉพาะใน desktop menu เท่านั้น
- การแปลภาษาสำหรับ subtitle ต้องจัดการแยกต่างหาก
- subtitle ควรมีความยาวไม่เกิน 15-20 ตัวอักษร เพื่อความสวยงาม
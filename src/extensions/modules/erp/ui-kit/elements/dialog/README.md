# Dialog Component

ระบบ Dialog ที่ให้รองรับการใช้งานแบบ alert, confirm, prompt ใช้งานง่าย เขียนโค้ดสั้น

## การใช้งานพื้นฐาน

### Import

```javascript
// นำเข้าแบบฟังก์ชัน (แนะนำ - โค้ดสั้น)
import { alert, confirm, prompt, success, warning, error } from '@/extensions/modules/erp/ui-kit/dialog'

// หรือ นำเข้าแบบ class
import { DialogService } from '@/extensions/modules/erp/ui-kit/dialog'
const dialog = new DialogService()
```

### ฟังก์ชันพร้อมใช้งาน

#### Alert Dialogs
```javascript
// Alert แบบธรรมดา
await alert('ข้อความแจ้งเตือน')

// Alert แต่ละประเภท
await success('บันทึกสำเร็จ!')
await warning('โปรดตรวจสอบข้อมูล')
await error('เกิดข้อผิดพลาด')
```

#### Confirm Dialog
```javascript
// Confirm พื้นฐาน
const result = await confirm('คุณต้องการบันทึกหรือไม่?')
if (result) {
  // ผู้ใช้กด OK
}

// Confirm ลบข้อมูล (แสดงปุ่มแดง)
const deleteResult = await confirmDelete('คุณต้องการลบรายการนี้หรือไม่?')
```

#### Prompt Dialog
```javascript
// รับข้อมูลจากผู้ใช้
const name = await prompt('กรุณาใส่ชื่อของคุณ')
if (name) {
  console.log('ชื่อที่ได้รับ:', name)
}

// Prompt พร้อม default value
const email = await prompt('กรุณาใส่อีเมล์', 'user@example.com')
```

### การใช้งานแบบ Options (Advanced)

```javascript
import { dialog } from '@/extensions/modules/erp/ui-kit/dialog'

// การตั้งค่าแบบละเอียด
const result = await dialog.show({
  title: 'ยืนยันการทำงาน',
  message: 'คุณต้องการดำเนินการต่อหรือไม่?',
  type: 'warning',
  showCancel: true,
  confirmText: 'ดำเนินการ',
  cancelText: 'ยกเลิก',
  showInput: false
})
```

## Properties

### Dialog Types
- `alert` - แจ้งเตือนทั่วไป (สีฟ้า)
- `success` - สำเร็จ (สีเขียว)
- `warning` - คำเตือน (สีส้ม)
- `error` - ข้อผิดพลาด (สีแดง)
- `confirm` - ยืนยัน (มีปุ่ม OK/Cancel)
- `prompt` - รับข้อมูล (มี input field)

### Options Object
```javascript
{
  title: String,        // หัวข้อ dialog
  message: String,      // ข้อความ
  type: String,         // ประเภท dialog
  showCancel: Boolean,  // แสดงปุ่ม Cancel
  confirmText: String,  // ข้อความปุ่ม confirm
  cancelText: String,   // ข้อความปุ่ม cancel
  showInput: Boolean,   // แสดง input field
  inputValue: String,   // ค่าเริ่มต้นใน input
  inputPlaceholder: String // placeholder ใน input
}
```

## การใช้งานใน Component

```vue
<template>
  <div>
    <button @click="handleSave" class="btn-primary">บันทึก</button>
    <button @click="handleDelete" class="btn-danger">ลบ</button>
  </div>
</template>

<script setup>
import { confirm, success, error, confirmDelete } from '@/extensions/modules/erp/ui-kit/dialog'

const handleSave = async () => {
  const result = await confirm('คุณต้องการบันทึกข้อมูลหรือไม่?')
  if (result) {
    try {
      // บันทึกข้อมูล
      await saveData()
      await success('บันทึกสำเร็จ!')
    } catch (err) {
      await error('เกิดข้อผิดพลาดในการบันทึก')
    }
  }
}

const handleDelete = async () => {
  const result = await confirmDelete('คุณต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้')
  if (result) {
    // ลบข้อมูล
    await deleteData()
    await success('ลบข้อมูลสำเร็จ!')
  }
}
</script>
```

## Features

- ✅ ใช้งานง่าย เขียนโค้ดสั้น
- ✅ รองรับ async/await
- ✅ Responsive design
- ✅ Keyboard support (Enter, Escape)
- ✅ Click backdrop to close
- ✅ Smooth animations
- ✅ ปรับแต่งได้ตามต้องการ
- ✅ TypeScript support
- ✅ Multiple instances support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- IE11+ (with polyfills)
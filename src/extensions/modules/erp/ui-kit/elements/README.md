# UI Elements

ชุด UI Components ทั้งหมดที่พร้อมใช้งาน แยกตามประเภทการใช้งาน

## 📁 Folder Structure

```
elements/
├── button/          # ErpButton - ปุ่มทุกรูปแบบ
├── input/           # ErpInput - Input fields
├── select/          # ErpSelect - Dropdown เลือกข้อมูล
├── textarea/        # ErpTextarea - Text area ขนาดใหญ่
├── checkbox/        # ErpCheckbox - Checkbox เลือกหลายรายการ
├── radio/           # ErpRadio - Radio button เลือกรายการเดียว
├── switch/          # ErpSwitch - Toggle switch เปิด/ปิด
├── breadcrumb/      # ErpBreadcrumb - Navigation breadcrumb
├── badge/           # ErpBadge - Status badges, tags
├── toast/           # ErpToast - Notification popups
└── dialog/          # ErpDialog - Modal dialogs
```

## 🎯 Usage Categories

### Form Elements (7 ตัว)
ใช้สำหรับสร้างฟอร์มและรับข้อมูลจากผู้ใช้

- **ErpButton** - ปุ่มทุกชนิด (submit, cancel, action buttons)
- **ErpInput** - ช่องกรอกข้อมูล (text, email, password, number)
- **ErpSelect** - Dropdown เลือกข้อมูล (single/multi-select, searchable)
- **ErpTextarea** - กรอกข้อความยาว (comments, descriptions)
- **ErpCheckbox** - เลือกหลายรายการ (permissions, features)
- **ErpRadio** - เลือกรายการเดียว (gender, status, options)
- **ErpSwitch** - เปิด/ปิด functions (notifications, features)

### Navigation Elements (1 ตัว)
ช่วยในการนำทางและแสดงตำแหน่งปัจจุบัน

- **ErpBreadcrumb** - แสดงเส้นทางการนำทาง

### Feedback Elements (2 ตัว)
แสดงข้อมูลป้อนกลับและการโต้ตอบกับผู้ใช้

- **ErpToast** - แสดงการแจ้งเตือนชั่วคราว
- **ErpDialog** - Modal dialogs สำหรับ confirm, alert, prompt

### Display Elements (1 ตัว)
แสดงข้อมูลและสถานะต่างๆ

- **ErpBadge** - แสดง status, tags, counts, labels

## 📦 Import Examples

```javascript
// Import specific elements
import { ErpButton, ErpInput, ErpSelect } from '@/ui-kit/elements'

// Import all elements
import * as Elements from '@/ui-kit/elements'

// Import from main ui-kit (recommended)
import { ErpButton, ErpInput, ErpSelect } from '@/ui-kit'
```

## 🎨 Design Principles

- **Consistent** - ใช้ design system เดียวกัน
- **Accessible** - รองรับ screen reader และ keyboard navigation
- **Responsive** - ทำงานได้ทุกหน้าจอ
- **Themeable** - ปรับแต่งสีและรูปแบบได้ง่าย
- **Type Safe** - รองรับ TypeScript

## 🔧 Development

แต่ละ element folder จะมี:

- `ErpComponentName.vue` - Component หลัก
- `index.js` - Export file
- `README.md` - คู่มือการใช้งาน (บางตัว)

การเพิ่ม element ใหม่:

1. สร้างโฟลเดอร์ใน `elements/`
2. สร้าง component และ index.js
3. เพิ่มใน `elements/index.js`
4. อัพเดท main `ui-kit/index.js`
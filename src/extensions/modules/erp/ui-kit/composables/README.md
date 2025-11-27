# Composables

ชุด Reusable Logic และ Utility Functions สำหรับจัดการ UI interactions

## 📁 Composables Available

### useDialog.js
จัดการ dialog/modal interactions

**Functions:**
- `useDialog()` - Composable สำหรับใช้ใน component
- `alert(message)` - แสดง alert dialog
- `success(message)` - แสดง success dialog  
- `warning(message)` - แสดง warning dialog
- `error(message)` - แสดง error dialog
- `confirm(message)` - แสดง confirm dialog (return true/false)
- `confirmDelete(message)` - แสดง delete confirmation
- `prompt(message, defaultValue)` - รับข้อมูลจากผู้ใช้

### useToast.js
จัดการ toast notifications

**Functions:**
- `useToast()` - Composable สำหรับใช้ใน component
- `success(message)` - แสดง success toast
- `error(message)` - แสดง error toast
- `warning(message)` - แสดง warning toast
- `info(message)` - แสดง info toast
- `dark(message)` - แสดง dark toast
- `toast(message, options)` - แสดง toast แบบ custom
- `clear()` - ลบ toast ทั้งหมด

## 🎯 Usage Patterns

### 1. ใช้แบบ Quick Functions (แนะนำ)

```javascript
import { success, error, confirm, toast } from '@/ui-kit'

// ใช้งานง่าย 1 บรรทัด
await success('บันทึกสำเร็จ!')
await error('เกิดข้อผิดพลาด')

const result = await confirm('คุณต้องการลบหรือไม่?')
if (result) {
  // ลบข้อมูล
}

toast('ข้อความแจ้งเตือน', { position: 'top-right' })
```

### 2. ใช้แบบ Composable (ใน component)

```javascript
import { useDialog, useToast } from '@/ui-kit'

export default {
  setup() {
    const { alert, confirm, prompt } = useDialog()
    const { success, error, clear } = useToast()
    
    const handleSave = async () => {
      try {
        // บันทึกข้อมูล
        await success('บันทึกสำเร็จ!')
      } catch (err) {
        await error('ไม่สามารถบันทึกได้')
      }
    }
    
    const handleDelete = async () => {
      const confirmed = await confirm('ลบข้อมูลนี้หรือไม่?')
      if (confirmed) {
        // ลบข้อมูล
        await success('ลบข้อมูลสำเร็จ!')
      }
    }
    
    return { handleSave, handleDelete }
  }
}
```

### 3. ใช้แบบ Direct Import

```javascript
import { useDialog } from '@/ui-kit/composables/useDialog'
import { useToast } from '@/ui-kit/composables/useToast'

// ใช้ในรูปแบบเฉพาะเจาะจง
```

## 🔧 Composable Pattern Benefits

### ✅ Reusability
- Logic แยกออกจาก UI components
- ใช้ซ้ำได้ในหลาย components
- Test ได้ง่าย

### ✅ Clean Code
- Component ไม่ต้องจัดการ logic ซับซ้อน
- Separation of concerns ชัดเจน
- Easy to maintain

### ✅ Type Safety
- Full TypeScript support
- Intellisense ทำงานได้ดี
- Compile-time error checking

## 📦 Export Strategy

```javascript
// composables/index.js exports all functions
export * from './useDialog'
export * from './useToast'

// Main ui-kit/index.js re-exports everything
export * from './composables'
```

## 🎨 Design Philosophy

- **Simple API** - ใช้งานง่าย เขียนโค้ดสั้น
- **Promise-based** - รองรับ async/await
- **Framework Agnostic** - ไม่ผูกติดกับ framework
- **Tree-shakeable** - Import เฉพาะที่ใช้
- **Developer Friendly** - API ที่เข้าใจง่าย

## 🔄 Migration from Services

เดิม: Service Pattern
```javascript
// ❌ Old way - ซับซ้อน
import { DialogService } from './DialogService'
const dialogService = new DialogService()
await dialogService.showAlert('message')
```

ใหม่: Composable Pattern  
```javascript
// ✅ New way - ง่าย
import { alert } from '@/ui-kit'
await alert('message')
```
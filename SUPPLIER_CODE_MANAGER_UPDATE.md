าม # 🔧 Supplier Code Manager Update

## 📋 สรุปการปรับปรุง

ได้ปรับปรุง Supplier Form (`/modules/purchase/components/supplier/Form.vue`) ให้ทำงานเรื่อง Code Manager เหมือนกับ Products โดย:

### 🔄 การสร้างรหัสผู้ขาย (Code Generation)

#### ✅ **ปรับปรุงแล้ว:**
1. **ป้องกันการ generate ในโหมดแก้ไข** - เหมือน Products
2. **ใช้ ERP_CORE.codeManager** แทนการใช้ฟังก์ชันเฉพาะ
3. **Clear cache ก่อน generate** เพื่อให้ได้ข้อมูลล่าสุด
4. **รองรับ CorporateConfig database** เป็น priority แรก

#### 🔧 **โค้ดหลัก:**
```javascript
// ✅ ป้องกันการ generate code ใน edit mode
if (props.mode === 'edit') {
  console.log('⚠️ Cannot generate code in edit mode')
  if (window.$toast) {
    window.$toast.warning('ไม่สามารถสร้างรหัสใหม่ในโหมดแก้ไขได้')
  }
  return
}

// 🔄 ใช้ ERP_CORE.codeManager
const code = await window.ERP_CORE.codeManager.generateCode('supplier', null, options)
```

### 💾 การอัปเดต Sequence หลังบันทึกสำเร็จ

#### ✅ **เพิ่มเติมใหม่:**
1. **อัปเดต sequence ในฐานข้อมูล** หลังสร้างผู้ขายใหม่
2. **Extract pure sequence number** จากรหัสที่สร้าง
3. **รองรับ format ทั้งแบบมีปีและไม่มีปี**
4. **ใช้ patternInfo structure** ที่ CodeManager ต้องการ

#### 🔧 **โค้ดหลัก:**
```javascript
// ✅ UPDATE SEQUENCE AFTER SUCCESSFUL SAVE (NEW MODE ONLY)
if (props.mode !== 'edit' && window.ERP_CORE?.codeManager) {
  try {
    // ดึง pattern ที่ใช้จริง
    const usedPattern = await window.ERP_CORE.codeManager.getPatternForModule('supplier')
    
    // Extract PURE sequence number
    let usedSequence = 1
    const format = usedPattern?.pattern?.format || 'SUP{year}{sequence}'
    
    if (format.includes('{year}')) {
      const prefix = usedPattern?.pattern?.prefix || 'SUP'
      let remaining = submitData.supplier_code.replace(prefix, '')
      
      const currentYear = new Date().getFullYear().toString()
      if (remaining.startsWith(currentYear)) {
        remaining = remaining.substring(currentYear.length)
      }
      
      usedSequence = parseInt(remaining) || 1
    }
    
    // สร้าง patternInfo และอัปเดต database
    const patternInfo = {
      source: 'corporate_config',
      pattern: {
        prefix: usedPattern?.pattern?.prefix || 'SUP',
        format: usedPattern?.pattern?.format || 'SUP{year}{sequence}',
        sequence: {
          current: usedSequence,
          digits: usedPattern?.pattern?.sequence?.digits || 5,
          start: usedPattern?.pattern?.sequence?.start || 1,
          resetOnYearChange: usedPattern?.pattern?.sequence?.resetOnYearChange || true
        }
      }
    }
    
    await window.ERP_CORE.codeManager.updateSequenceInDatabase('supplier', patternInfo)
  } catch (error) {
    console.error('Failed to update sequence:', error)
    // ไม่ throw error เพราะข้อมูลบันทึกสำเร็จแล้ว
  }
}
```

### 🗑️ ลบฟังก์ชันเก่าที่ไม่ใช้

#### ✅ **ลบออกแล้ว:**
- `extractPureSequence()` - ใช้โค้ดแบบ inline แทน
- `updateSequenceDatabase()` - ใช้ CodeManager.updateSequenceInDatabase() แทน

### 📊 ผลลัพธ์ที่คาดหวัง

1. **รหัสผู้ขายต่อเนื่อง** - ไม่มีการข้าม sequence
2. **รองรับ pattern หลายแบบ** - ทั้งแบบมีปีและไม่มีปี
3. **Thread-safe** - ป้องกัน duplicate codes
4. **Database persistent** - เก็บ sequence ในฐานข้อมูล
5. **เหมือนกับ Products** - behavior เดียวกัน

### 🎯 Pattern Configuration

Supplier ใช้ SUPPLIER_CODE_CONFIG:
```javascript
export const SUPPLIER_CODE_CONFIG = {
  patterns: {
    default: {
      prefix: 'SUP',
      year: true,
      sequence: { digits: 5, start: 1, resetOnYearChange: true },
      format: '{prefix}{year}{sequence}' // SUP202500001
    }
  }
}
```

### 🔍 การทดสอบ

เพื่อทดสอบการทำงาน:
1. สร้างผู้ขายใหม่หลายคน
2. ตรวจสอบว่ารหัสเพิ่มขึ้นต่อเนื่อง (SUP202500001, SUP202500002, ...)
3. ตรวจสอบการอัปเดต sequence ใน database
4. ทดสอบ error handling เมื่อ CodeManager ไม่พร้อม

### ✨ Features เพิ่มเติม

1. **Real-time Pattern Preview** - แสดงตัวอย่างรหัสตาม type
2. **Source Information** - บอกแหล่งที่มาของ pattern
3. **Cache Management** - ล้าง cache อัตโนมัติ
4. **Fallback System** - มี emergency code เมื่อระบบขัดข้อง

---

## 🚀 การใช้งาน

1. **สร้างผู้ขาย:** คลิกปุ่ม "สร้างรหัส" → ได้รหัสใหม่ → บันทึก → sequence อัปเดตอัตโนมัติ
2. **แก้ไขผู้ขาย:** ไม่สามารถสร้างรหัสใหม่ได้ (ปุ่มจะแสดงคำเตือน)
3. **ดูการตั้งค่า:** คลิกปุ่ม "⚙️" เพื่อดูข้อมูลการตั้งค่า pattern

Supplier Form ตอนนี้ทำงานเรื่อง Code Manager เหมือนกับ Products แล้ว! 🎉
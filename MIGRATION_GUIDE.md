# Migration Guide: localStorage → MongoDB

## 🎯 วัตถุประสงค์

ย้ายข้อมูลการตั้งค่าจาก localStorage ไปยัง MongoDB (CorporateConfig) เพื่อความถาวรของข้อมูล

## ⚠️ สำคัญ

ระบบใหม่ **ไม่ใช้ localStorage อีกต่อไป** - ข้อมูลทั้งหมดบันทึกใน MongoDB เท่านั้น

## 📋 ขั้นตอน Migration

### 1. เตรียมความพร้อม

ตรวจสอบว่ามีข้อมูลใน localStorage หรือไม่:

```javascript
// เปิด Browser Console (F12)
console.log(localStorage.getItem('accounting.account_mapping'))
console.log(localStorage.getItem('accounting.account_types'))
```

### 2. โหลด Migration Script

เปิดหน้า web app แล้วเพิ่ม script:

```html
<!-- ใส่ใน HTML หรือใช้ Browser Console -->
<script src="/migrate-localstorage.js"></script>
```

หรือ Copy-paste เนื้อหาจาก `public/migrate-localstorage.js` ลงใน Console

### 3. เรียกใช้งาน Migration

```javascript
// Run migration
await migrateToDatabase()

// ผลลัพธ์:
// 🚀 Starting migration...
// ✅ Found account_mapping in localStorage
// ✅ Found account_types in localStorage
// 📦 Found 2 configurations to migrate
// ✅ Migrated: accounting.account_mapping
// ✅ Migrated: accounting.account_types
// 
// 📊 Migration Summary:
// ✅ Success: 2
// ❌ Failed: 0
```

### 4. ตรวจสอบข้อมูล

```javascript
// Verify migration
await verifyMigration()

// ผลลัพธ์:
// 🔍 Verifying migration...
// ✅ accounting.account_mapping found in database
//    Items: 45
// ✅ accounting.account_types found in database
//    Types: 5
```

### 5. ลบข้อมูลเก่า (Optional)

```javascript
// Clean localStorage
cleanLocalStorage()

// ผลลัพธ์:
// 🗑️ Removed: accounting.account_mapping
// 🗑️ Removed: accounting.account_types
// ✅ Cleaned 2 items from localStorage
```

## 🔄 Migration ข้อมูลเดิม (Legacy Format)

หากมีข้อมูลรูปแบบเก่า:
- `accounting_account_mapping` (underscore)
- `accounting_account_types` (underscore)

Script จะ detect และ migrate อัตโนมัติ

## 📝 ข้อมูลที่ Migrate

1. **accounting.account_mapping**
   - ผังบัญชีทั้งหมด (45+ accounts)
   - Cash, Bank, AR, AP, Inventory, etc.

2. **accounting.account_types**
   - ประเภทบัญชี (5 types)
   - Asset, Liability, Equity, Revenue, Expense

## ✅ Checklist

- [ ] ตรวจสอบมีข้อมูลใน localStorage
- [ ] Backend API พร้อมใช้งาน (`/api/corporate-config`)
- [ ] MongoDB collection `corporate_config` ถูกสร้างแล้ว
- [ ] Run `migrateToDatabase()`
- [ ] Run `verifyMigration()` ตรวจสอบผลลัพธ์
- [ ] (Optional) Run `cleanLocalStorage()` ลบข้อมูลเก่า
- [ ] ทดสอบระบบทำงานปกติ

## 🚨 กรณีเกิด Error

### Error: "$Request not found"
**สาเหตุ:** App ยังไม่โหลดเสร็จ

**แก้ไข:** รอให้ app โหลดเสร็จแล้วลองใหม่

### Error: "Failed to migrate"
**สาเหตุ:** API ไม่ทำงาน

**แก้ไข:** 
1. ตรวจสอบ API route ใน server
2. ตรวจสอบ MongoDB connection
3. ดู Console error details

### Error: "Configuration already exists"
**สาเหตุ:** ข้อมูลมีในฐานข้อมูลแล้ว

**แก้ไข:** ใช้ API upsert แทน insert (script ใช้ upsert อยู่แล้ว)

## 🎯 หลัง Migration

ระบบจะ:
- ✅ โหลดข้อมูลจาก MongoDB เท่านั้น
- ✅ บันทึกข้อมูลลง MongoDB
- ❌ ไม่ใช้ localStorage อีกต่อไป
- ✅ Multi-user sync แบบ real-time
- ✅ ข้อมูลความถาวรสูง

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ Browser Console
2. ตรวจสอบ Network Tab
3. ดู error message จาก API
4. ติดต่อทีม DevOps/Backend

## 🔗 Related Files

- `/src/services/AccountingSettings.js` - Service หลัก
- `/api/corporate-config.js` - API endpoints
- `/src/extensions/modules/erp/schemas/CorporateConfig.js` - Schema definition
- `CORPORATE_CONFIG_GUIDE.md` - คู่มือระบบ

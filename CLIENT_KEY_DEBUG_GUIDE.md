# Client Key Configuration - Debug Guide

## 🔍 ปัญหาที่พบ

Services ต่างๆ (PurchaseService, InventoryService, AccountingSettings) อาจได้รับ `clientKey` ที่ไม่ตรงกันเพราะมี 2 แหล่งที่มา:

1. **`app.config.globalProperties.$Key`** - จาก `./master/host.js`
2. **`storageManager.get('configs')?.key`** - จาก Local Storage

## ✅ การแก้ไข (แก้ไขแล้ว)

### Before (❌ ผิด - ใช้ 2 แหล่ง)
```javascript
// main.js - Line 153
app.config.globalProperties.$Key = key;  // จาก ./master/host.js

// main.js - Line 228-234 (เดิม)
let configs = null;
try {
  configs = storageManager.get('configs');
} catch (error) {
  console.warn('Error getting configs from storage:', error);
}
const clientKey = configs?.key || null;  // ❌ จาก storage อาจไม่ตรงกับ $Key
```

### After (✅ ถูกต้อง - ใช้แหล่งเดียวกัน)
```javascript
// main.js - Line 153
app.config.globalProperties.$Key = key;  // จาก ./master/host.js

// main.js - Line 224-226 (ใหม่)
const clientKey = key;  // ✅ ใช้ค่าเดียวกับ $Key
console.log('Client key for API driver:', clientKey ? '***' + clientKey.slice(-4) : 'Not found');
```

## 📋 การตรวจสอบว่า Client Key ตรงกันทุกที่

### 1. ตรวจสอบใน Browser Console

เปิด Developer Tools แล้วพิมพ์:

```javascript
// ตรวจสอบ $Key
console.log('$Key:', window.vueApp.$Key)

// ตรวจสอบ API Engine
console.log('API Engine clientKey:', window.ERP_CORE?.engine?.driver?.clientKey)

// ตรวจสอบ Services
console.log('PurchaseService:', window.ERP_CORE?.purchase?.clientKey)
console.log('InventoryService:', window.ERP_CORE?.inventory?.clientKey)

// ตรวจสอบว่าเหมือนกันหรือไม่
const key1 = window.vueApp.$Key
const key2 = window.ERP_CORE?.engine?.driver?.clientKey
const key3 = window.ERP_CORE?.purchase?.clientKey
const key4 = window.ERP_CORE?.inventory?.clientKey

console.log('All keys match:', 
  key1 === key2 && 
  key2 === key3 && 
  key3 === key4
)
```

### 2. ใส่ Debug Log ใน Service Initialize

แก้ไข Services เพื่อ log clientKey ตอน initialize:

#### PurchaseService.js
```javascript
initialize(vueAppOrInstance) {
  // ...existing code...
  
  this.clientKey = vueAppOrInstance.$Key || null
  
  // ✅ Debug log
  console.log('🔑 [PurchaseService] Client Key Debug:', {
    hasKey: !!this.clientKey,
    keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
    source: vueAppOrInstance.$Key ? 'vueApp.$Key' : 'fallback'
  })
}
```

#### InventoryService.js
```javascript
initialize(vueAppOrInstance) {
  // ...existing code...
  
  this.clientKey = vueAppOrInstance.$Key || null
  
  // ✅ Debug log
  console.log('🔑 [InventoryService] Client Key Debug:', {
    hasKey: !!this.clientKey,
    keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
    source: vueAppOrInstance.$Key ? 'vueApp.$Key' : 'fallback'
  })
}
```

#### AccountingSettings.js
```javascript
initialize(vueAppOrInstance) {
  // ...existing code...
  
  this.clientKey = vueAppOrInstance.$Key || null
  
  // ✅ Debug log
  console.log('🔑 [AccountingSettings] Client Key Debug:', {
    hasKey: !!this.clientKey,
    keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
    source: vueAppOrInstance.$Key ? 'vueApp.$Key' : 'fallback'
  })
}
```

### 3. ตรวจสอบ Network Requests

เปิด Network Tab ใน DevTools และดูที่:
- Request Headers
- ควรเห็น `X-Client-Key` หรือ header ที่ใช้ส่ง clientKey
- ตรวจสอบว่าทุก request ใช้ key เดียวกันหรือไม่

## 🎯 Expected Behavior (ผลที่ถูกต้อง)

### Console Output ที่ควรเห็น

```
✅ $Request is available, initializing ERP_CORE with API driver...
Client key for API driver: ***abc123
✅ ERP_CORE initialized with API driver successfully!
🔑 [PurchaseService] Client Key Debug: { hasKey: true, keyPreview: '***abc123', source: 'vueApp.$Key' }
🔑 [InventoryService] Client Key Debug: { hasKey: true, keyPreview: '***abc123', source: 'vueApp.$Key' }
🔑 [AccountingSettings] Client Key Debug: { hasKey: true, keyPreview: '***abc123', source: 'vueApp.$Key' }
```

### ตรวจสอบความถูกต้อง

ทุก Service ควรมี:
- `hasKey: true` ✅
- `keyPreview` ตรงกันทุกตัว ✅
- `source: 'vueApp.$Key'` ✅

## 🐛 Troubleshooting

### ปัญหา: Service ไม่มี clientKey

**อาการ:**
```
🔑 [PurchaseService] Client Key Debug: { hasKey: false, keyPreview: 'null', source: 'fallback' }
```

**สาเหตุ:**
- Service initialize ก่อน `app.config.globalProperties.$Key` ถูกตั้งค่า
- ส่ง parameter ผิด (ไม่ใช่ Vue app instance)

**วิธีแก้:**
1. ตรวจสอบว่า `app.config.globalProperties.$Key` ถูกตั้งค่าแล้ว
2. ส่ง Vue app instance ที่ถูกต้องไปให้ `initialize()`
3. เรียก `initialize()` หลังจาก app ถูก mount แล้ว

### ปัญหา: Client Key ไม่ตรงกัน

**อาการ:**
```javascript
key1 === key2 && key2 === key3 && key3 === key4  // false
```

**สาเหตุ:**
- มีการ override `$Key` ที่ไหนสักแห่ง
- มีการดึง key จาก source อื่น

**วิธีแก้:**
1. Search ทั้ง codebase หา `$Key =` หรือ `clientKey =`
2. ตรวจสอบว่ามีที่ไหนดึง key จาก `storageManager.get('configs')` อีกหรือไม่
3. ใช้ค่า `key` จาก `./master/host.js` เป็นแหล่งเดียว (Single Source of Truth)

## 📝 Best Practices

### ✅ DO (ทำ)

1. **ใช้แหล่งเดียว (Single Source of Truth)**
   ```javascript
   import { key } from './master/host.js'
   app.config.globalProperties.$Key = key
   const clientKey = key  // ใช้ค่าเดียวกัน
   ```

2. **Log เมื่อ Initialize**
   ```javascript
   console.log('Service initialized with clientKey:', this.clientKey ? '***' + this.clientKey.slice(-4) : 'null')
   ```

3. **Validate ก่อนใช้**
   ```javascript
   if (!this.clientKey) {
     throw new Error('Service not initialized with clientKey')
   }
   ```

### ❌ DON'T (อย่าทำ)

1. **อย่าดึง key จากหลายแหล่ง**
   ```javascript
   // ❌ ผิด
   const key1 = app.config.globalProperties.$Key
   const key2 = storageManager.get('configs')?.key
   const clientKey = key1 || key2  // มีโอกาสไม่ตรงกัน
   ```

2. **อย่า hardcode key**
   ```javascript
   // ❌ ผิด
   this.clientKey = 'my-secret-key'
   ```

3. **อย่าลืม initialize**
   ```javascript
   // ❌ ผิด - ใช้ service ก่อน initialize
   const data = await purchaseService.getAllSuppliers()  // Error!
   
   // ✅ ถูกต้อง
   purchaseService.initialize(vueApp)
   const data = await purchaseService.getAllSuppliers()
   ```

## 🔗 Related Files

- **main.js** - กำหนด `$Key` และสร้าง API Engine
- **./master/host.js** - แหล่งที่มาของ `key`
- **PurchaseService.js** - รับ clientKey ตอน initialize
- **InventoryService.js** - รับ clientKey ตอน initialize
- **AccountingSettings.js** - รับ clientKey ตอน initialize

## 🎓 สรุป

การแก้ไขครั้งนี้ทำให้:
1. ✅ ทุก Service ใช้ `clientKey` จากแหล่งเดียวกัน (`key` จาก `./master/host.js`)
2. ✅ ไม่มีความเสี่ยงที่ key จะไม่ตรงกัน
3. ✅ ง่ายต่อการ debug และตรวจสอบ
4. ✅ เป็น Single Source of Truth

**หลัก 1 ประการ:** 
> **ใช้ `key` จาก `./master/host.js` เป็นแหล่งเดียว สำหรับทั้ง `$Key` และ `clientKey` ในทุก Service**

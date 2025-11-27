# 🛠️ Logic Configuration Troubleshooting Guide

## 🚨 **ปัญหา: แสดง "Unknown Parent Object"**

### อาการ:
- Element ปลายทางแสดง "Unknown Parent Object" แทนชื่อ element ต้นทาง
- Logic Configuration ไม่ทำงานตามที่ตั้งค่าไว้

### สาเหตุที่เป็นไปได้:
1. ข้อมูล `_metadata` ไม่ถูกสร้างหรือหายไป
2. ฟังก์ชั่น `getParentLogicObjectName` ไม่รองรับรูปแบบข้อมูลใหม่
3. การอ้างอิง element ต้นทางผิดพลาด

---

## 🔍 **วิธีการ Debug**

### Step 1: เปิด Browser Console
```javascript
// เข้าไปที่ Builder และเปิด Console (F12)
```

### Step 2: Import Debug Helper
```javascript
// ใน Console พิมพ์:
import('/src/interface/template/builder/plugin/LogicDebugHelper.js').then(module => {
  window.LogicDebugHelper = module.LogicDebugHelper;
});
```

### Step 3: รัน Debug
```javascript
// Debug ทั้งหมด
LogicDebugHelper.runFullDebug(window.builderController);

// หรือ Debug แยกส่วน
LogicDebugHelper.debugLogicConfiguration(window.builderController);
LogicDebugHelper.testParentLogicObjectName(window.builderController);
```

---

## 🔧 **วิธีแก้ไขปัญหา**

### Problem 1: Missing Metadata
```javascript
// ตรวจสอบว่ามี _metadata หรือไม่
// ถ้าไม่มี ให้สร้าง Logic Configuration ใหม่
```

### Problem 2: Incorrect Position Data
```javascript
// ตรวจสอบ position data
console.log('Position data:', {
  rowIndex: logic.rowIndex,
  columnIndex: logic.columnIndex, 
  objectIndex: logic.objectIndex
});
```

### Problem 3: Manual Fix
```javascript
// แก้ไขด้วยตนเอง (ใน Console)
const controller = window.builderController;
const targetElement = /* element ที่มีปัญหา */;

// แก้ไข logic item
if (targetElement.logics && targetElement.logics[0]) {
  const logic = targetElement.logics[0];
  if (logic.request === true && !logic._metadata) {
    // เพิ่ม metadata ขาดหาย
    logic._metadata = {
      uid: `request-${Date.now()}`,
      parentUid: 'SOURCE_ELEMENT_UID',
      parentName: 'ชื่อ Element ต้นทาง',
      sourceLogicUid: 'LOGIC_UID'
    };
  }
}
```

---

## 📋 **Checklist การตรวจสอบ**

### ✅ ข้อมูล Source Element:
- [ ] มี `logics` array
- [ ] มี `destination` object ครบถ้วน
- [ ] `destination.rowIndex`, `columnIndex`, `objIndex` ถูกต้อง
- [ ] `default` และ `method` ถูกต้อง

### ✅ ข้อมูล Target Element:
- [ ] มี `logics` array
- [ ] มี `request: true`
- [ ] มี `_metadata` object
- [ ] `_metadata.parentName` และ `parentUid` ถูกต้อง
- [ ] Position data ครบถ้วน

### ✅ การทำงานของ Controller:
- [ ] Controller ถูก initialize แล้ว
- [ ] ฟังก์ชั่น `getParentLogicObjectName` ทำงานได้
- [ ] ฟังก์ชั่น `findElementByPosition` ทำงานได้

---

## 🎯 **วิธีการสร้าง Logic Configuration ที่ถูกต้อง**

### Step 1: สร้าง Logic ที่ Source
```javascript
const sourceElement = {
  uid: "source_001",
  name: "ประเภทลูกค้า",
  logics: []
};

// เพิ่ม logic ผ่าน Controller
controller.addLogicItem({
  uid: `logic-${Date.now()}`,
  default: "offline-corporate",
  destination: {
    name: "เป้าหมาย",
    rowIndex: 11,
    columnIndex: 1,
    objIndex: 0,
    uid: "target_001"
  },
  method: "show"
}, sourceElement);
```

### Step 2: ตรวจสอบผลลัพธ์
```javascript
// ตรวจสอบที่ target element
const targetElement = controller.findElementByUid("target_001");
console.log('Target logics:', targetElement.logics);

// ควรเห็น:
// {
//   request: true,
//   default: "offline-corporate", 
//   method: "show",
//   rowIndex: 0, columnIndex: 0, objectIndex: 0,
//   _metadata: { ... }
// }
```

---

## 🚀 **Quick Fix Commands**

### รีเซ็ต Logic Configuration:
```javascript
// ลบ logic ทั้งหมดใน element
element.logics = [];
```

### สร้าง Logic ใหม่:
```javascript
// ผ่าน Controller (แนะนำ)
controller.addLogicItem(logicData, sourceElement);
```

### ตรวจสอบสถานะ:
```javascript
// ดู logic configuration ปัจจุบัน
LogicDebugHelper.debugLogicConfiguration(controller);
```

---

## ⚠️ **ข้อควรระวัง**

1. **อย่าแก้ไขข้อมูลโดยตรง** - ใช้ Controller methods เสมอ
2. **ตรวจสอบ Position Data** - ให้แน่ใจว่า rowIndex, columnIndex, objIndex ถูกต้อง
3. **Backup ข้อมูล** - ก่อนแก้ไขปัญหา ให้ export ข้อมูลออกไว้ก่อน
4. **Test หลังแก้ไข** - ทดสอบการทำงานของ logic หลังแก้ไขเสร็จ

---

## 📞 **หากยังแก้ไขไม่ได้**

1. ส่ง Console Debug Output มาให้ดู
2. ส่ง JSON export ของ Builder Data
3. บอกขั้นตอนที่ทำก่อนเกิดปัญหา
4. ระบุ element ไหนที่มีปัญหา 
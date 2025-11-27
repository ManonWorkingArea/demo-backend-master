# 📋 Logic Configuration Render Guide

## 🔄 การแปลงข้อมูลจาก Builder เป็น Render Format

### การใช้งานใน Render Engine:

```javascript
// 1. ดึงข้อมูล Logic Configuration จาก MainController
const controller = await MainController.createInstance({
  builderData: yourBuilderData,
  // ... other config
});

const logicConfig = controller.getLogicConfigurationForRender();

// 2. ใช้ข้อมูลที่แปลงแล้ว
const { renderData, logicPairs } = logicConfig;

// 3. สร้าง Logic Pairs (แทนที่ฟังก์ชั่นเดิม)
let globalLogicPairs = logicPairs;

// 4. รันฟังก์ชั่น Logic (แทนที่ฟังก์ชั่นเดิม)
function runLogic() {
  controller.runLogicForRender(globalLogicPairs);
}
```

## 📊 เปรียบเทียบ Data Structure

### Builder Format vs Render Format:

| Builder Format | Render Format | อธิบาย |
|---|---|---|
| `row.columns[i].object[j]` | `row.columns[i].objects[j]` | ชื่อ property ต่างกัน |
| `destination.objIndex` | `destination.obj` | ชื่อ field ต่างกัน |
| `logic.uid` | `logic.uid` | เหมือนกัน |
| `logic.method` | `logic.method` | เหมือนกัน |

### โครงสร้างข้อมูล Logic:

**Element ต้นทาง (Source) - Multiple Destinations:**
```json
{
  "uid": "radiobox_001",
  "name": "ประเภทลูกค้า",
  "logics": [
    {
      "uid": "logic-123",
      "default": "offline-corporate",
      "destination": {
        "name": "หมายเลขประจำตัวผู้เสียภาษี",
        "rowIndex": 11,
        "columnIndex": 1,
        "objIndex": 0,
        "obj": 0
      },
      "method": "show"
    },
    {
      "uid": "logic-124", 
      "default": "offline-corporate",
      "destination": {
        "name": "สาขา (ระบุเป็น 0 หากเป็นสำนักงานใหญ่)",
        "rowIndex": 11,
        "columnIndex": 1,
        "objIndex": 1,
        "obj": 1
      },
      "method": "show"
    },
    {
      "uid": "logic-125",
      "default": "offline-corporate", 
      "destination": {
        "name": "ชื่อนิติบุคคล",
        "rowIndex": 11,
        "columnIndex": 2,
        "objIndex": 0,
        "obj": 0
      },
      "method": "show"
    },
    {
      "uid": "logic-126",
      "default": "offline-corporate",
      "destination": {
        "name": "ที่อยู่ (สำหรับนิติบุคคล)", 
        "rowIndex": 11,
        "columnIndex": 3,
        "objIndex": 0,
        "obj": 0
      },
      "method": "show"
    }
  ]
}
```

**Element ปลายทาง (Target):**
```json
{
  "uid": "form_male_details",
  "name": "Male Details Form",
  "logics": [
    {
      "request": true,
      "default": "offline-corporate",
      "method": "show",
      "rowIndex": 11,
      "columnIndex": 0,
      "objectIndex": 0,
      "_metadata": {
        "uid": "request-456",
        "parentUid": "radiobox_001",
        "parentName": "Gender Selection",
        "sourceLogicUid": "logic-123",
        "targetRowIndex": 1,
        "targetColumnIndex": 0,
        "targetObjIndex": 0
      }
    }
  ]
}
```

## 🔧 การใช้งานฟังก์ชั่นใหม่

### 1. แทนที่ buildLogicPairs():

```javascript
// เดิม
function buildLogicPairs(dataset) {
  globalLogicPairs = [];
  // ... complex logic
}

// ใหม่ - ใช้จาก Controller
const logicConfig = controller.getLogicConfigurationForRender();
globalLogicPairs = logicConfig.logicPairs;
```

### 2. แทนที่ runLogic():

```javascript
// เดิม
function runLogic(logics, dataset) {
  logics.forEach(({ sourceObj, destinationObj, logic }) => {
    // ... manual logic execution
  });
}

// ใหม่ - ใช้จาก Controller
function runLogic() {
  controller.runLogicForRender(globalLogicPairs);
}
```

### 3. แทนที่ extractValue():

```javascript
// เดิม
function extractValue(value) {
  // ... manual value extraction
}

// ใหม่ - ใช้จาก Controller
const extractedValue = controller.extractValueForRender(someValue);
```

## 🎯 การ Integrate กับโค้ดเดิม

### Step 1: Setup Controller
```javascript
// ในไฟล์ Render
import MainController from '@/interface/template/builder/plugin/MainController.js';

let builderController = null;

async function initializeLogicSystem(builderData) {
  builderController = await MainController.createInstance({
    builderData: builderData
  });
  
  const logicConfig = builderController.getLogicConfigurationForRender();
  globalLogicPairs = logicConfig.logicPairs;
  
  console.log('Logic system initialized with', globalLogicPairs.length, 'pairs');
}
```

### Step 2: Update Existing Functions
```javascript
// แทนที่ฟังก์ชั่นเดิม
function buildLogicPairs(dataset) {
  // ไม่ต้องทำอะไร - ใช้จาก controller แล้ว
  console.log('Using pre-built logic pairs from controller');
  return globalLogicPairs;
}

function runLogic(logics, dataset) {
  if (builderController) {
    builderController.runLogicForRender(logics);
  } else {
    console.warn('Controller not initialized - falling back to original logic');
    // เรียกฟังก์ชั่นเดิม
    originalRunLogic(logics, dataset);
  }
}

function extractValue(value) {
  if (builderController) {
    return builderController.extractValueForRender(value);
  }
  // fallback to original function
  return originalExtractValue(value);
}
```

### Step 3: Update watchLogicsOnMount
```javascript
function watchLogicsOnMount(dataset) {
  if (builderController) {
    // ใช้ข้อมูลจาก controller
    const logicConfig = builderController.getLogicConfigurationForRender();
    globalLogicPairs = logicConfig.logicPairs;
  } else {
    // fallback ใช้ฟังก์ชั่นเดิม
    buildLogicPairs(dataset);
  }
}
```

## 🐛 การ Debug และ Troubleshooting

### เปิด Debug Logs:
```javascript
// ใน controller initialization
const controller = await MainController.createInstance({
  builderData: builderData,
  debug: true  // เปิด debug logs
});
```

### ตรวจสอบ Logic Pairs:
```javascript
console.log('Current logic pairs:', globalLogicPairs);
console.log('Total pairs:', globalLogicPairs.length);

globalLogicPairs.forEach((pair, index) => {
  console.log(`Pair ${index}:`, {
    source: pair.sourceObj.name,
    destination: pair.destinationObj.name,
    method: pair.logic.method,
    expectedValue: pair.logic.default
  });
});
```

### ตรวจสอบ Element References:
```javascript
// ตรวจสอบว่า componentRefs มี element หรือไม่
Object.keys(componentRefs.value).forEach(key => {
  console.log(`Component ref "${key}":`, !!componentRefs.value[key]);
});
```

## ⚠️ ข้อควรระวัง

1. **Backward Compatibility**: ฟังก์ชั่นเดิมยังคงทำงานได้ หากไม่มี Controller
2. **Performance**: Controller จะ cache ข้อมูลที่แปลงแล้ว ทำให้เร็วกว่าการ build ใหม่ทุกครั้ง
3. **Error Handling**: ตรวจสอบให้แน่ใจว่า Controller ถูก initialize ก่อนใช้งาน
4. **Data Sync**: เมื่อมีการเปลี่ยนแปลงใน Builder ต้องเรียก `getLogicConfigurationForRender()` ใหม่

## 🚀 ประโยชน์ที่ได้รับ

1. **Bidirectional Logic**: Element ปลายทางรู้ว่าถูกควบคุมโดยใคร
2. **Data Consistency**: ข้อมูลสอดคล้องกันระหว่าง Builder และ Render
3. **Better Performance**: ลดการ loop และ search ที่ไม่จำเป็น
4. **Easier Maintenance**: โค้ดจัดการ logic รวมอยู่ที่เดียว
5. **Enhanced Debugging**: มี logging และ error handling ที่ดีกว่า 
# Corporate Configuration System - คู่มือการใช้งาน

## 📋 ภาพรวม

ระบบจัดการการตั้งค่าของบริษัท (Corporate Configuration) สำหรับเก็บข้อมูลการตั้งค่าทั้งหมดในฐานข้อมูล

## 🗂️ ไฟล์ที่สร้าง

### 1. Schema Definition
**File:** `/src/extensions/modules/erp/schemas/CorporateConfig.js`

```javascript
{
  config_key: 'accounting.account_mapping',  // Unique key: module.category
  module: 'accounting',                       // accounting, inventory, sales, etc.
  category: 'account_mapping',                // หมวดหมู่ย่อย
  config_data: {...},                         // ข้อมูลจริง (JSON)
  name: 'Account Mapping Configuration',
  description: 'ผังบัญชีทั้งหมดในระบบ',
  version: '1.0.0',
  is_public: false,
  is_system: false,
  created_by: 'admin',
  updated_by: 'admin',
  created_at: Date,
  updated_at: Date
}
```

### 2. API Endpoints
**File:** `/api/corporate-config.js`

#### GET `/api/corporate-config`
ดึงการตั้งค่า (รองรับ filter)
```javascript
// ดึงตาม config_key
GET /api/corporate-config?config_key=accounting.account_mapping

// ดึงทั้ง module
GET /api/corporate-config?module=accounting

// ดึงตาม module + category
GET /api/corporate-config?module=accounting&category=account_types
```

#### GET `/api/corporate-config/:id`
ดึงการตั้งค่าตาม ID

#### POST `/api/corporate-config`
สร้างการตั้งค่าใหม่
```javascript
{
  "config_key": "accounting.account_mapping",
  "module": "accounting",
  "category": "account_mapping",
  "config_data": { ... },
  "name": "Account Mapping",
  "description": "ผังบัญชี"
}
```

#### POST `/api/corporate-config/upsert`
สร้างหรืออัพเดท (Upsert) - **แนะนำใช้อันนี้**
```javascript
{
  "config_key": "accounting.account_types",
  "module": "accounting",
  "category": "account_types",
  "config_data": {
    "asset": { "name": "Asset", "color": "green", ... },
    "liability": { ... }
  }
}
```

#### PUT `/api/corporate-config/:id`
อัพเดทการตั้งค่า

#### DELETE `/api/corporate-config/:id`
ลบการตั้งค่า (ไม่สามารถลบ is_system=true)

### 3. AccountingSettings Service
**File:** `/src/services/AccountingSettings.js`

**การเปลี่ยนแปลง:**
```javascript
// เดิม: ใช้ localStorage
localStorage.getItem('accounting_account_mapping')

// ใหม่: ใช้ API + localStorage fallback
await accountingSettings.getConfig('accounting.account_mapping')
```

**Methods:**
- `initialize(vueApp)` - เชื่อมต่อ Vue app สำหรับใช้ $Request
- `getConfig(configKey)` - ดึงจาก API หรือ localStorage
- `saveConfig(configKey, data, metadata)` - บันทึกไป API + localStorage
- `loadSettings()` - โหลดผังบัญชี
- `loadAccountTypes()` - โหลดประเภทบัญชี
- `saveSettings(data)` - บันทึกผังบัญชี
- `saveAccountTypes(data)` - บันทึกประเภทบัญชี

## 🚀 การติดตั้ง

### 1. Register API Route
เพิ่มใน Express server:
```javascript
// server.js หรือ app.js
const corporateConfigAPI = require('./api/corporate-config');
app.use('/api/corporate-config', corporateConfigAPI);
```

### 2. Create MongoDB Collection
```javascript
db.createCollection('corporate_config');

// Create indexes
db.corporate_config.createIndex({ config_key: 1 }, { unique: true });
db.corporate_config.createIndex({ module: 1, category: 1 });
db.corporate_config.createIndex({ module: 1 });
```

### 3. Initialize in Vue App
**File:** `/src/main.js` (Already added)
```javascript
const accountingSettings = (await import('@/services/AccountingSettings.js')).default;
accountingSettings.initialize(app.config.globalProperties);
```

## 📝 ตัวอย่างการใช้งาน

### Frontend (Vue Component)
```javascript
import accountingSettings from '@/services/AccountingSettings'

export default {
  async mounted() {
    // โหลดการตั้งค่า
    await accountingSettings.loadSettings()
    await accountingSettings.loadAccountTypes()
    
    // ดึงข้อมูล
    const accounts = accountingSettings.getAllAccounts()
    const types = accountingSettings.getAllAccountTypes()
    
    // บันทึกการตั้งค่า
    await accountingSettings.saveSettings(newData)
    await accountingSettings.saveAccountTypes(newTypes)
  }
}
```

### Backend API Testing
```bash
# สร้าง/อัพเดทการตั้งค่า
curl -X POST http://localhost:3000/api/corporate-config/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "accounting.account_mapping",
    "module": "accounting",
    "category": "account_mapping",
    "config_data": {
      "cash": {"code": "1010", "name": "Cash on Hand"},
      "bank": {"code": "1020", "name": "Bank Account"}
    },
    "name": "Account Mapping Configuration"
  }'

# ดึงการตั้งค่า
curl http://localhost:3000/api/corporate-config?config_key=accounting.account_mapping
```

## 🔄 Data Flow

```
User Action (Vue Component)
    ↓
accountingSettings.saveAccountTypes()
    ↓
saveConfig() → API Only (No localStorage)
    ↓
POST /api/corporate-config/upsert
    ↓
MongoDB: corporate_config collection
    ↓
Success!
```

## 🛡️ Error Handling

```javascript
async saveConfig(key, data) {
  if (!this.apiRequest) {
    throw new Error('Not initialized')
  }
  
  try {
    // API Only - No localStorage fallback
    await this.apiRequest.post('/api/corporate-config/upsert', ...)
    return true
  } catch (error) {
    // แสดง error ให้ user ทราบ
    throw error
  }
}
```

**หมายเหตุ:** ระบบต้องการ API connection เสมอ ไม่มี offline mode

## 📊 ข้อดีของระบบใหม่

✅ **Persistent Storage** - ข้อมูลอยู่ใน Database ถาวร
✅ **Multi-User Sync** - หลาย user เห็นการตั้งค่าเดียวกัน real-time
✅ **No Cache Issues** - ไม่มีปัญหาข้อมูลไม่ sync เพราะไม่ใช้ localStorage
✅ **Version Control** - มี version field สำหรับ track changes
✅ **Audit Trail** - มี created_by, updated_by, timestamps
✅ **Centralized** - การตั้งค่าทุกอย่างอยู่ Database เดียว
✅ **Flexible** - รองรับ module อื่นๆ ได้
✅ **Data Integrity** - ข้อมูลความถาวรสูง ไม่หายแม้ล้าง browser

## 🎯 Config Keys ที่ใช้

- `accounting.account_mapping` - ผังบัญชีทั้งหมด
- `accounting.account_types` - ประเภทบัญชี (asset, liability, etc.)
- `accounting.policies` - นโยบายบัญชี (อนาคต)
- `inventory.settings` - การตั้งค่า inventory (อนาคต)
- `sales.default_accounts` - บัญชีเริ่มต้นสำหรับขาย (อนาคต)

## 🔧 Troubleshooting

### ❌ Error: "AccountingSettings not initialized"
**Solution:** ตรวจสอบว่า initialize() ถูกเรียกใน main.js แล้ว
```javascript
accountingSettings.initialize(app.config.globalProperties)
```

### ❌ Error: "Failed to save config to API"
**Solution:** 
1. ตรวจสอบว่า API route ถูก register แล้ว
2. ตรวจสอบ Network tab ดู error message
3. ตรวจสอบว่า MongoDB connection ทำงานปกติ

### ❌ Error: "Configuration not found"
**Solution:** 
1. สร้างการตั้งค่าครั้งแรกผ่าน UI
2. หรือ POST ข้อมูล default ผ่าน API

### ⚠️ ต้องการ API เสมอ
**Note:** ระบบนี้ **ไม่รองรับ offline mode** เนื่องจากไม่ใช้ localStorage
หาก API ไม่ทำงาน จะไม่สามารถบันทึกหรือโหลดข้อมูลได้

## 🚨 สำคัญ

**ข้อมูลทั้งหมดบันทึกใน MongoDB เท่านั้น**
- ❌ ไม่มี localStorage backup
- ❌ ไม่มี offline mode
- ✅ ข้อมูลความถาวรสูง
- ✅ Multi-user sync แบบ real-time
- ✅ Audit trail ครบถ้วน

## 📞 Support

หากพบปัญหา ตรวจสอบ Console logs:
- `✅ AccountingSettings initialized with API` - พร้อมใช้งาน
- `❌ AccountingSettings not initialized` - ต้อง call initialize() ก่อน
- `✅ Loaded Account Types from Database` - โหลดสำเร็จ
- `❌ Failed to get config from API` - ตรวจสอบ API connection
- `❌ Failed to save config to API` - ตรวจสอบ API route และ MongoDB

**การตั้งค่าทั้งหมดใช้ API เท่านั้น - ไม่มี localStorage fallback**

# Dummy Module - Template สำหรับโมดูลใหม่

โมดูล Dummy เป็น template หรือแม่แบบสำหรับการสร้างโมดูลใหม่ในระบบ ERP โดยใช้ Tailwind CSS ครบถ้วน

## 📁 โครงสร้างโมดูล

```
dummy/
├── components/          # Vue Components
│   ├── DummyDashboard.vue      # หน้า Dashboard หลัก
│   ├── DummyItemsManager.vue   # หน้าจัดการรายการ Items
│   ├── DummyItemAdd.vue        # หน้าเพิ่ม Item ใหม่
│   └── DummySettings.vue       # หน้าตั้งค่าโมดูล
├── plugins/             # การกำหนดค่าและ Utilities
│   └── index.js                # Plugin หลักและ Constants
└── router.js            # Route Configuration
```

## 🎨 Tailwind CSS Components

### 1. **DummyDashboard.vue**
หน้า Dashboard หลักที่แสดงสถิติและข้อมูลสรุป
- **Stats Cards**: การแสดงสถิติด้วย Grid Layout
- **Recent Items**: รายการ Items ล่าสุดแบบ Card
- **Quick Actions**: ปุ่มลัดสำหรับการทำงาน
- **Gradient Cards**: การใช้ Gradient ใน Info Card

```vue
<!-- ตัวอย่าง Stats Card -->
<div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
  <div class="flex items-center">
    <div class="bg-blue-100 p-3 rounded-lg">
      <i class="fas fa-cubes text-blue-600 text-xl"></i>
    </div>
    <div class="ml-4">
      <p class="text-sm font-medium text-gray-600">Total Items</p>
      <p class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</p>
    </div>
  </div>
</div>
```

### 2. **DummyItemsManager.vue**
หน้าจัดการรายการ Items แบบ Grid และ List View
- **Filter & Search**: ระบบกรองและค้นหาขั้นสูง
- **Grid/List Toggle**: สลับระหว่าง Grid และ List View
- **Bulk Actions**: การจัดการหลายรายการพร้อมกัน
- **Pagination**: การแบ่งหน้าแบบ Custom

```vue
<!-- ตัวอย่าง Grid Item Card -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
  <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
      <p class="text-sm text-gray-500">{{ item.code }}</p>
    </div>
    <!-- Action Dropdown -->
  </div>
  <!-- Item Details -->
</div>
```

### 3. **DummyItemAdd.vue**
Form สำหรับเพิ่ม Item ใหม่พร้อม Validation
- **Multi-Section Form**: แบ่งฟอร์มเป็นหลายส่วน
- **Real-time Validation**: การตรวจสอบข้อมูลแบบ Real-time
- **Toggle Switches**: สวิทช์แบบ Custom
- **Tag System**: ระบบ Tag แบบ Dynamic

```vue
<!-- ตัวอย่าง Form Section -->
<div class="bg-white rounded-lg shadow-sm">
  <div class="px-6 py-4 border-b border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
  </div>
  <div class="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Form Fields -->
  </div>
</div>
```

### 4. **DummySettings.vue**
หน้าตั้งค่าโมดูลแบบ Tab Navigation
- **Tab Navigation**: เมนูแบบ Tab สำหรับแยกหมวดหมู่
- **Toggle Components**: สวิทช์ On/Off สำหรับ Features
- **Theme Selection**: การเลือกธีม UI
- **Danger Zone**: พื้นที่สำหรับการดำเนินการที่เป็นอันตราย

```vue
<!-- ตัวอย่าง Settings Tab -->
<nav class="-mb-px flex space-x-8 px-6">
  <button
    :class="[
      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
      activeTab === tab.id
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    {{ tab.label }}
  </button>
</nav>
```

## 🔧 Plugin Configuration (`plugins/index.js`)

### Constants และ Configuration
```javascript
export const DUMMY_CONSTANTS = {
  MODULE_NAME: 'dummy',
  STATUS: { ACTIVE: 'active', PENDING: 'pending' },
  PRIORITY: { LOW: 'low', HIGH: 'high' }
}

export const DEFAULT_CONFIG = {
  ui: { theme: 'light', itemsPerPage: 20 },
  features: { enableNotifications: true }
}
```

### Validation Rules
```javascript
export const VALIDATION_RULES = {
  item_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\u0E00-\u0E7F]+$/
  }
}
```

### Utility Functions
```javascript
export const MODULE_UTILS = {
  formatCurrency: (amount) => new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount),
  
  formatDate: (date) => new Intl.DateTimeFormat('th-TH').format(new Date(date))
}
```

## 🛣️ Router Configuration

```javascript
export default [
  {
    path: '/dummy',
    name: 'DummyDashboard',
    component: () => import('./components/DummyDashboard.vue'),
    meta: {
      title: 'Dummy Dashboard',
      requiresAuth: true,
      breadcrumb: [...]
    }
  }
]
```

## 🎯 Tailwind CSS Features ที่ใช้

### 1. **Layout & Spacing**
- `max-w-7xl mx-auto`: Container แบบ Responsive
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`: Grid System
- `space-x-3`, `space-y-4`: Spacing ระหว่าง Elements

### 2. **Colors & Themes**
- `bg-gray-50`, `bg-white`: Background Colors
- `text-gray-900`, `text-blue-600`: Text Colors
- `border-gray-200`: Border Colors

### 3. **Interactive States**
- `hover:bg-blue-700`: Hover Effects
- `focus:ring-2 focus:ring-blue-500`: Focus States
- `disabled:opacity-50`: Disabled States

### 4. **Animations & Transitions**
- `transition-colors`: Color Transitions
- `animate-pulse`: Loading Animations
- `transform translate-x-full`: Custom Animations

### 5. **Components**
- **Cards**: `rounded-lg shadow-sm`
- **Buttons**: `px-4 py-2 rounded-lg font-medium`
- **Forms**: `border rounded-lg focus:ring-2`
- **Badges**: `inline-flex px-2 py-1 rounded-full text-xs`

## 📊 Component Patterns

### Loading States
```vue
<div v-if="loading" class="animate-pulse">
  <div class="bg-gray-200 h-4 rounded mb-2"></div>
  <div class="bg-gray-200 h-3 rounded w-1/2"></div>
</div>
```

### Status Badges
```vue
<span :class="getStatusClass(item.status)" 
      class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
  {{ item.status }}
</span>
```

### Toggle Switch
```vue
<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer" />
  <div class="toggle-switch"></div>
</label>
```

### Card Components
```vue
<div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
  <!-- Card Content -->
</div>
```

## 🚀 การใช้งาน Template

1. **คัดลอกโฟลเดอร์ dummy** ไปยังตำแหน่งใหม่
2. **เปลี่ยนชื่อไฟล์และ Components** ตามโมดูลใหม่
3. **ปรับแต่ง Constants และ Configuration** ใน `plugins/index.js`
4. **เพิ่ม Routes** เข้าสู่ระบบ Router หลัก
5. **ปรับแต่ง UI และ Styling** ตามความต้องการ

## 🎨 Customization

### เปลี่ยนสีธีม
```javascript
// เปลี่ยนจาก blue เป็น purple
'bg-blue-600' → 'bg-purple-600'
'text-blue-600' → 'text-purple-600'
```

### เพิ่ม Custom Components
```vue
<!-- ใน components/ -->
<template>
  <div class="custom-component">
    <!-- Custom Content -->
  </div>
</template>
```

### เพิ่ม Features ใหม่
```javascript
// ใน plugins/index.js
export const NEW_FEATURE = {
  enabled: true,
  config: {...}
}
```

---

**📝 หมายเหตุ**: โมดูล Dummy นี้เป็น Template พื้นฐาน ควรปรับแต่งให้เหมาะสมกับความต้องการของแต่ละโปรเจกต์
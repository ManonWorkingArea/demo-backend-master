# ModuleDashboard Permission Integration Guide

## การใช้งาน ModuleDashboard กับ ERP Permissions

### 1. เพิ่ม prop `moduleName` ใน ModuleDashboard component

```vue
<ModuleDashboard
  title="Human Resources"
  subtitle="จัดการข้อมูลบุคลากรและทรัพยากรมนุษย์"
  module-name="hr"
  :menu-items="menuItems"
  footer-icon="users"
  footer-text="HR Module v.1.0"
/>
```

### 2. ตัวอย่างการใช้งานในแต่ละโมดูล

#### HR Module (hr/components/dashboard/index.vue)

```vue
<template>
  <ModuleDashboard
    title="Human Resources"
    subtitle="จัดการข้อมูลบุคลากรและทรัพยากรมนุษย์"
    module-name="hr"
    :menu-items="menuItems"
    footer-icon="users"
    footer-text="HR Module v.1.0"
  />
</template>

<script>
import ModuleDashboard from '@/extensions/modules/erp/ui-kit/ModuleDashboard.vue';

export default {
  name: 'HRDashboard',
  components: {
    ModuleDashboard
  },
  data() {
    return {
      menuItems: [
        {
          key: 'employees',
          label: 'พนักงาน',
          icon: 'users',
          to: '/hr/employees'
        },
        {
          key: 'user-management',
          label: 'จัดการผู้ใช้',
          icon: 'user-cog',
          to: '/hr/user-management'
        },
        {
          key: 'departments',
          label: 'แผนก',
          icon: 'sitemap',
          to: '/hr/departments'
        },
        {
          key: 'positions',
          label: 'ตำแหน่ง',
          icon: 'briefcase',
          to: '/hr/positions'
        },
        {
          key: 'attendance',
          label: 'เข้างาน-ลางาน',
          icon: 'clock',
          to: '/hr/attendance'
        },
        {
          key: 'payroll',
          label: 'เงินเดือน',
          icon: 'money-bill-wave',
          to: '/hr/payroll'
        },
        {
          key: 'leave',
          label: 'วันลา',
          icon: 'calendar-times',
          to: '/hr/leave'
        },
        {
          key: 'reports',
          label: 'รายงาน',
          icon: 'chart-bar',
          to: '/hr/reports'
        },
        {
          key: 'settings',
          label: 'ตั้งค่า',
          icon: 'cog',
          to: '/hr/settings'
        }
      ]
    }
  }
}
</script>
```

#### Inventory Module (inventory/components/dashboard/index.vue)

```vue
<template>
  <ModuleDashboard
    title="Inventory Management"
    subtitle="จัดการคลังสินค้าและสต็อก"
    module-name="inventory"
    :menu-items="menuItems"
    footer-icon="boxes"
    footer-text="Inventory Module v.1.0"
  />
</template>

<script>
import ModuleDashboard from '@/extensions/modules/erp/ui-kit/ModuleDashboard.vue';

export default {
  name: 'InventoryDashboard',
  components: {
    ModuleDashboard
  },
  data() {
    return {
      menuItems: [
        {
          key: 'stock-overview',
          label: 'ภาพรวมสต็อก',
          icon: 'boxes',
          to: '/inventory/stock-overview'
        },
        {
          key: 'stock-locations',
          label: 'ตำแหน่งคลัง',
          icon: 'map-marker-alt',
          to: '/inventory/stock-locations'
        },
        {
          key: 'products',
          label: 'สินค้า',
          icon: 'box',
          to: '/inventory/products'
        },
        {
          key: 'goods-receipt',
          label: 'รับเข้าสินค้า',
          icon: 'truck-loading',
          to: '/inventory/goods-receipt'
        },
        {
          key: 'stock-movement',
          label: 'เคลื่อนย้ายสต็อก',
          icon: 'exchange-alt',
          to: '/inventory/stock-movement'
        },
        {
          key: 'stock-adjustment',
          label: 'ปรับสต็อก',
          icon: 'edit',
          to: '/inventory/stock-adjustment'
        },
        {
          key: 'stock-reservation',
          label: 'จองสต็อก',
          icon: 'bookmark',
          to: '/inventory/stock-reservation'
        },
        {
          key: 'inventory-log',
          label: 'บันทึกคลัง',
          icon: 'history',
          to: '/inventory/inventory-log'
        },
        {
          key: 'reports',
          label: 'รายงาน',
          icon: 'chart-bar',
          to: '/inventory/reports'
        },
        {
          key: 'settings',
          label: 'ตั้งค่า',
          icon: 'cog',
          to: '/inventory/settings'
        }
      ]
    }
  }
}
</script>
```

#### Sales Module (sales/components/dashboard/index.vue)

```vue
<template>
  <ModuleDashboard
    title="Sales Management"
    subtitle="จัดการขายและลูกค้า"
    module-name="sales"
    :menu-items="menuItems"
    footer-icon="shopping-cart"
    footer-text="Sales Module v.1.0"
  />
</template>

<script>
import ModuleDashboard from '@/extensions/modules/erp/ui-kit/ModuleDashboard.vue';

export default {
  name: 'SalesDashboard',
  components: {
    ModuleDashboard
  },
  data() {
    return {
      menuItems: [
        {
          key: 'quotation',
          label: 'ใบเสนอราคา',
          icon: 'file-invoice',
          to: '/sales/quotation'
        },
        {
          key: 'invoice',
          label: 'ใบแจ้งหนี้',
          icon: 'receipt',
          to: '/sales/invoice'
        },
        {
          key: 'sales-order',
          label: 'ใบสั่งขาย',
          icon: 'shopping-bag',
          to: '/sales/sales-order'
        },
        {
          key: 'customers',
          label: 'ลูกค้า',
          icon: 'users',
          to: '/sales/customers'
        }
      ]
    }
  }
}
</script>
```

## 3. การทำงานของระบบ

### Flow การกรองเมนู:

1. **โหลด ERP Permissions:**
   ```javascript
   const erpData = storageManager.get('erp');
   // {
   //   job_assignments: [
   //     {
   //       permissions: [
   //         {
   //           module: "hr",
   //           menus: [
   //             { menu_key: "employees", visible: true },
   //             { menu_key: "departments", visible: false }
   //           ]
   //         }
   //       ]
   //     }
   //   ]
   // }
   ```

2. **รวม Permissions จากทุก job_assignments:**
   ```javascript
   const allPermissions = [];
   erpData.job_assignments.forEach(job => {
     allPermissions.push(...job.permissions);
   });
   ```

3. **กรองตาม moduleName:**
   ```javascript
   const modulePerms = allPermissions.filter(p => p.module === 'hr');
   ```

4. **เก็บเฉพาะ menu_key ที่ visible: true:**
   ```javascript
   const visibleMenuKeys = new Set();
   modulePerms.forEach(modulePerm => {
     modulePerm.menus.forEach(menu => {
       if (menu.visible === true) {
         visibleMenuKeys.add(menu.menu_key);
       }
     });
   });
   ```

5. **กรองเมนู menuItems:**
   ```javascript
   return this.menuItems.filter(item => visibleMenuKeys.has(item.key));
   ```

### ตัวอย่างผลลัพธ์:

**Input menuItems:**
```javascript
[
  { key: 'employees', label: 'พนักงาน', ... },
  { key: 'departments', label: 'แผนก', ... },
  { key: 'positions', label: 'ตำแหน่ง', ... }
]
```

**ERP Permissions:**
```javascript
{
  module: "hr",
  menus: [
    { menu_key: "employees", visible: true },
    { menu_key: "departments", visible: false },
    { menu_key: "positions", visible: true }
  ]
}
```

**Output (filteredMenuItems):**
```javascript
[
  { key: 'employees', label: 'พนักงาน', ... },  // ✅ visible: true
  { key: 'positions', label: 'ตำแหน่ง', ... }   // ✅ visible: true
]
// departments ถูกกรองออก เพราะ visible: false
```

## 4. สิ่งที่ต้องทำในแต่ละโมดูล

### ✅ Checklist:

- [ ] เพิ่ม `module-name` prop ใน `<ModuleDashboard>`
- [ ] ตรวจสอบว่า `menu_key` ใน permissions ตรงกับ `key` ใน menuItems
- [ ] ทดสอบการแสดงผลเมื่อ:
  - ไม่มี ERP data (แสดงทั้งหมด)
  - มี ERP data แต่ไม่มี permissions ของโมดูลนี้ (ไม่แสดงอะไร)
  - มี ERP data และมี permissions (แสดงเฉพาะ visible: true)

## 5. ตัวอย่าง Migration

### ก่อน:
```vue
<ModuleDashboard
  title="HR"
  :menu-items="menuItems"
/>
```

### หลัง:
```vue
<ModuleDashboard
  title="HR"
  module-name="hr"
  :menu-items="menuItems"
/>
```

## 6. Mapping ระหว่าง menu_key และ menuItems

**สำคัญ:** `menu_key` ใน ERP permissions ต้องตรงกับ `key` ใน menuItems

| menu_key (ERP) | key (menuItems) | ผลลัพธ์ |
|----------------|-----------------|---------|
| `employees` | `employees` | ✅ ตรงกัน - แสดงได้ |
| `user-mgmt` | `user-management` | ❌ ไม่ตรง - ไม่แสดง |
| `departments` | `departments` | ✅ ตรงกัน - แสดงได้ |

## 7. Backward Compatibility

- ✅ ถ้าไม่ส่ง `module-name` prop จะเกิด error (required)
- ✅ ถ้าไม่มี ERP data จะแสดงเมนูทั้งหมด
- ✅ ถ้ามี ERP data แต่ไม่มี permissions ของโมดูลนี้ จะไม่แสดงอะไรเลย

## 8. Debug Tips

```vue
<template>
  <div>
    <!-- แสดงจำนวนเมนูที่กรอง -->
    <div class="text-white text-center mb-4">
      Showing {{ filteredMenuItems.length }} / {{ menuItems.length }} menus
    </div>
    
    <ModuleDashboard
      :title="title"
      :module-name="moduleName"
      :menu-items="menuItems"
    />
  </div>
</template>

<script>
export default {
  mounted() {
    // Debug ERP permissions
    const erpData = storageManager.get('erp');
    console.log('ERP Data:', erpData);
    
    if (erpData && erpData.job_assignments) {
      erpData.job_assignments.forEach((job, idx) => {
        console.log(`Job ${idx}:`, job.permissions);
      });
    }
  }
}
</script>
```

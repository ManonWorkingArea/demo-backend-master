# Menu Registry - คู่มือการใช้งาน

## 📋 ภาพรวม

Menu Registry เป็นระบบรวมศูนย์ที่เก็บข้อมูลเมนูทั้งหมดจากทุกโมดูลใน ERP System ไว้ใน Object เดียว เพื่อให้ส่วนต่างๆ ของระบบสามารถเข้าถึงข้อมูลเมนูได้แบบรวมศูนย์และสะดวก

## 🏗️ โครงสร้างข้อมูล

Menu Registry จัดเก็บข้อมูลในรูปแบบ Object ที่มีโครงสร้างดังนี้:

```javascript
{
  hr: {
    menuItems: [...],        // Array ของ menu items
    count: 10,               // จำนวน menu items
    module: 'hr',            // ชื่อโมดูล
    moduleName: 'Human Resources',  // ชื่อโมดูล (EN)
    moduleNameTH: 'ทรัพยากรบุคคล'   // ชื่อโมดูล (TH)
  },
  sales: {
    menuItems: [...],
    count: 5,
    module: 'sales',
    moduleName: 'Sales',
    moduleNameTH: 'ขาย'
  },
  // ... โมดูลอื่นๆ
}
```

แต่ละ menu item มีโครงสร้างดังนี้:

```javascript
{
  key: 'employees',               // รหัสเฉพาะของเมนู
  label: 'Employee Management',   // ชื่อแสดง
  icon: 'id-badge',              // ไอคอน FontAwesome
  to: '/hr/employees',           // Route path
  opacity: false                 // (optional) แสดงแบบโปร่งใสหรือไม่
}
```

## 🚀 วิธีการใช้งาน

### 1. การเข้าถึงผ่าน ERP_CORE (แนะนำ)

```javascript
// ดึงข้อมูล menu ทั้งหมดของโมดูล HR
const hrMenus = window.ERP_CORE.menus.get('hr')
console.log(hrMenus.menuItems)  // Array ของ menu items
console.log(hrMenus.count)      // 10

// ดึง menu items เฉพาะ
const salesMenuItems = window.ERP_CORE.menus.getMenuItems('sales')
console.log(salesMenuItems)  // Array ของ menu items

// ดึงข้อมูล menu ทั้งหมด
const allMenus = window.ERP_CORE.menus.getAll()
console.log(allMenus.hr.menuItems)
console.log(allMenus.sales.menuItems)
console.log(allMenus.accounting.menuItems)
```

### 2. การเข้าถึงแบบ Direct Import

```javascript
import menuRegistry from '@/extensions/modules/erp/config/menuRegistry.js'

// ดึงข้อมูล menu ของโมดูล
const hrConfig = menuRegistry.getMenuConfig('hr')
console.log(hrConfig.menuItems)

// ดึง menu items โดยตรง
const inventoryItems = menuRegistry.getMenuItems('inventory')
console.log(inventoryItems)

// ดึงข้อมูลทั้งหมด
const all = menuRegistry.getAllMenuConfigs()
console.log(all)
```

### 3. ใน Vue Component

```vue
<template>
  <div>
    <h2>{{ moduleInfo.moduleNameTH }}</h2>
    <ul>
      <li v-for="menu in menuItems" :key="menu.key">
        <router-link :to="menu.to">
          <font-awesome-icon :icon="['fas', menu.icon]" />
          {{ menu.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [],
      moduleInfo: {}
    }
  },
  
  mounted() {
    // ดึงข้อมูลเมนูของโมดูล Sales
    const salesConfig = window.ERP_CORE.menus.get('sales')
    
    this.menuItems = salesConfig.menuItems
    this.moduleInfo = {
      moduleName: salesConfig.moduleName,
      moduleNameTH: salesConfig.moduleNameTH,
      count: salesConfig.count
    }
  }
}
</script>
```

## 📚 ฟังก์ชันที่มีให้ใช้งาน

### `getMenuConfig(moduleName)`
ดึงข้อมูล menu configuration ทั้งหมดของโมดูล

```javascript
const hrConfig = window.ERP_CORE.menus.getMenuConfig('hr')
// Returns: { menuItems: [...], count: 10, module: 'hr', ... }
```

### `getMenuItems(moduleName)`
ดึง menu items (Array) ของโมดูลโดยตรง

```javascript
const salesMenus = window.ERP_CORE.menus.getMenuItems('sales')
// Returns: [{key: 'quotation', label: 'Quotation', ...}, ...]
```

### `getAllMenuConfigs()`
ดึงข้อมูล menu ทั้งหมดจากทุกโมดูล

```javascript
const allMenus = window.ERP_CORE.menus.getAllMenuConfigs()
// Returns: { hr: {...}, sales: {...}, accounting: {...}, ... }
```

### `getModuleList()`
ดึงรายชื่อโมดูลทั้งหมด

```javascript
const modules = window.ERP_CORE.menus.getModuleList()
// Returns: ['hr', 'accounting', 'sales', 'inventory', ...]
```

### `getTotalMenuCount()`
นับจำนวน menu items ทั้งหมดในระบบ

```javascript
const total = window.ERP_CORE.menus.getTotalMenuCount()
// Returns: 76 (ตัวอย่าง)
```

### `findMenuByKey(menuKey)`
ค้นหา menu item จากทุกโมดูลโดยใช้ key

```javascript
const menu = window.ERP_CORE.menus.findMenuByKey('employees')
// Returns: {
//   menuItem: { key: 'employees', label: 'Employee Management', ... },
//   module: 'hr',
//   moduleName: 'Human Resources',
//   moduleNameTH: 'ทรัพยากรบุคคล'
// }
```

### `findMenusByRoute(routePath)`
ค้นหา menu items ที่ตรงกับ route path

```javascript
const menus = window.ERP_CORE.menus.findMenusByRoute('/hr/employees')
// Returns: [
//   {
//     menuItem: { ... },
//     module: 'hr',
//     moduleName: 'Human Resources',
//     moduleNameTH: 'ทรัพยากรบุคคล'
//   }
// ]
```

## 💡 ตัวอย่างการใช้งานจริง

### 1. สร้าง Breadcrumb Navigation

```vue
<template>
  <nav class="breadcrumb">
    <span v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.to" :to="item.to">{{ item.label }}</router-link>
      <span v-else>{{ item.label }}</span>
      <span v-if="index < breadcrumbs.length - 1"> / </span>
    </span>
  </nav>
</template>

<script>
export default {
  computed: {
    breadcrumbs() {
      const path = this.$route.path
      const menus = window.ERP_CORE.menus.findMenusByRoute(path)
      
      if (menus.length > 0) {
        const menu = menus[0]
        return [
          { label: 'หน้าหลัก', to: '/' },
          { label: menu.moduleNameTH, to: `/${menu.module}` },
          { label: menu.menuItem.label, to: null }
        ]
      }
      
      return [{ label: 'หน้าหลัก', to: '/' }]
    }
  }
}
</script>
```

### 2. สร้าง Module Switcher

```vue
<template>
  <div class="module-switcher">
    <select v-model="selectedModule" @change="switchModule">
      <option value="">เลือกโมดูล</option>
      <option v-for="module in modules" :key="module" :value="module">
        {{ getModuleName(module) }}
      </option>
    </select>
    
    <div v-if="selectedModule" class="menu-list">
      <div v-for="menu in currentMenus" :key="menu.key">
        <router-link :to="menu.to">
          <font-awesome-icon :icon="['fas', menu.icon]" />
          {{ menu.label }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      modules: [],
      selectedModule: '',
      currentMenus: []
    }
  },
  
  mounted() {
    this.modules = window.ERP_CORE.menus.getModuleList()
  },
  
  methods: {
    getModuleName(module) {
      const config = window.ERP_CORE.menus.get(module)
      return config?.moduleNameTH || module
    },
    
    switchModule() {
      if (this.selectedModule) {
        this.currentMenus = window.ERP_CORE.menus.getMenuItems(this.selectedModule)
      } else {
        this.currentMenus = []
      }
    }
  }
}
</script>
```

### 3. แสดงสถิติเมนู

```vue
<template>
  <div class="menu-stats">
    <h3>สถิติเมนูในระบบ</h3>
    <p>จำนวนโมดูลทั้งหมด: {{ moduleCount }} โมดูล</p>
    <p>จำนวนเมนูทั้งหมด: {{ totalMenus }} รายการ</p>
    
    <table>
      <thead>
        <tr>
          <th>โมดูล</th>
          <th>จำนวนเมนู</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(config, module) in allMenus" :key="module">
          <td>{{ config.moduleNameTH }}</td>
          <td>{{ config.count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allMenus: {},
      moduleCount: 0,
      totalMenus: 0
    }
  },
  
  mounted() {
    this.allMenus = window.ERP_CORE.menus.getAll()
    this.moduleCount = window.ERP_CORE.menus.getModuleList().length
    this.totalMenus = window.ERP_CORE.menus.getTotalMenuCount()
  }
}
</script>
```

### 4. Quick Search Menu

```vue
<template>
  <div class="menu-search">
    <input 
      v-model="searchQuery" 
      @input="search" 
      placeholder="ค้นหาเมนู..."
    />
    
    <div v-if="searchResults.length > 0" class="results">
      <div v-for="result in searchResults" :key="`${result.module}-${result.menuItem.key}`">
        <router-link :to="result.menuItem.to">
          <font-awesome-icon :icon="['fas', result.menuItem.icon]" />
          <strong>{{ result.menuItem.label }}</strong>
          <span class="module-name">({{ result.moduleNameTH }})</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      searchResults: []
    }
  },
  
  methods: {
    search() {
      if (!this.searchQuery.trim()) {
        this.searchResults = []
        return
      }
      
      const query = this.searchQuery.toLowerCase()
      const allMenus = window.ERP_CORE.menus.getAll()
      const results = []
      
      Object.entries(allMenus).forEach(([module, config]) => {
        config.menuItems.forEach(menu => {
          if (menu.label.toLowerCase().includes(query) || 
              menu.key.toLowerCase().includes(query)) {
            results.push({
              menuItem: menu,
              module: module,
              moduleName: config.moduleName,
              moduleNameTH: config.moduleNameTH
            })
          }
        })
      })
      
      this.searchResults = results
    }
  }
}
</script>
```

## 🎯 โมดูลที่รองรับ

ปัจจุบัน Menu Registry รองรับโมดูลดังนี้:

1. **HR** (Human Resources) - ทรัพยากรบุคคล - 10 เมนู
2. **Accounting** - บัญชี - 13 เมนู
3. **Sales** - ขาย - 5 เมนู
4. **Inventory** - คลังสินค้า - 11 เมนู
5. **Purchase** - จัดซื้อ - 8 เมนู
6. **Finance** - การเงิน - 10 เมนู
7. **Delivery** - จัดส่ง - 10 เมนู
8. **Production** - ผลิต - 9 เมนู

## 📝 หมายเหตุ

- ข้อมูลเมนูจะถูกโหลดพร้อมกับ ERP_CORE เมื่อระบบเริ่มทำงาน
- การเปลี่ยนแปลงข้อมูลเมนูต้องแก้ไขที่ไฟล์ `config/menuConfig.js` ของแต่ละโมดูล
- Menu Registry จะอัพเดตอัตโนมัติเมื่อมีการเพิ่มหรือแก้ไขเมนูในโมดูล
- สามารถเพิ่มโมดูลใหม่ได้โดยการสร้างไฟล์ `menuConfig.js` และ import ใน `menuRegistry.js`

## 🔗 ไฟล์ที่เกี่ยวข้อง

- `/src/extensions/modules/erp/config/menuRegistry.js` - ไฟล์หลัก Menu Registry
- `/src/extensions/modules/erp/core/index.js` - Integration กับ ERP_CORE
- `/src/extensions/modules/erp/modules/[module]/config/menuConfig.js` - Menu Config ของแต่ละโมดูล

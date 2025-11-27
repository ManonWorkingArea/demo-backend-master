# ERP Permission & Menu Integration Guide

## 📋 สรุปการทำงานของระบบเมนู

### 1. โครงสร้างข้อมูล Navigation

```javascript
// จาก router.js ของแต่ละโมดูล (เช่น accounting/router.js)
{
  path: '/accounting',
  name: 'accounting',
  description: 'ระบบบัญชี',
  groups: 'erp',           // กลุ่มโมดูล
  hasSubmenu: true,        // มี submenu หรือไม่
  hasDashboard: true,
  inApp: 'yes',           // แสดงใน Dashboard App
  inTop: 'yes',           // แสดงใน Top Navigation
  meta: {
    inMenu: true,
    title: 'Accounting',
    icon: 'calculator',
    role: ['admin', 'accountant']
  },
  children: [
    {
      path: 'journal-entries',
      name: 'accounting-journal-entries',
      meta: {
        inMenu: true,
        title: 'Journal Entries',
        icon: 'book',
        role: ['admin', 'accountant']
      }
    }
  ]
}
```

### 2. การประมวลผลเมนู (ใน Header.vue)

**Flow การทำงาน:**
```
1. pluginRoutes (จาก loader.js)
   ↓
2. getPluginRoutes() (UtilsLoader.js)
   ↓ แปลงโครงสร้าง + แปลภาษา
3. routesWithSubmenus
   ↓
4. applyRouterPermissionsToRoutes() 
   ↓ merge permissions จาก router
5. Filter by:
   - pluginData (plugins ที่เปิดใช้งาน)
   - role (สิทธิ์ผู้ใช้)
   - inMenu (แสดงในเมนูหรือไม่)
   ↓
6. buildMenuItemsWithRoleCheck()
   ↓ สร้าง submenu + เช็ค role ซ้ำ
7. mainRoutes
   ↓
8. storageManager.set('navigation', mainRoutes)
```

### 3. โครงสร้างข้อมูลใน Storage

```javascript
// storage: 'navigation'
[
  {
    slug: 'accounting',
    name: 'บัญชี',
    language: 'บัญชี',
    subtitle: 'จัดการข้อมูลบัญชี',
    href: '/accounting',
    icon: 'calculator',
    inApp: 'yes',
    inTop: 'yes',
    counter: false,
    hasSubmenu: true,
    session: false,
    fullscreen: false,
    current: false,
    submenu: [
      {
        name: 'Journal Entries',
        href: '/accounting/journal-entries',
        icon: 'book',
        role: ['admin', 'accountant'],
        language: 'Journal Entries',
        current: false,
        counter: false,
        session: false,
        front: false,
        submenu: null
      }
    ]
  }
]
```

## 🔑 โครงสร้างข้อมูล ERP Permissions

```javascript
// storage: 'erp'
{
  _id: "691f66673d896728b40432b0",
  user_id: "69078ed739cbc5602b23f978",
  username: "info@recasens.asia",
  job_assignments: [
    {
      department_id: "...",
      position_id: "...",
      permissions: [
        {
          module: "accounting",      // ตรงกับ groups ใน router
          menus: [
            {
              menu_key: "journal-entries",  // ตรงกับ path ของ children
              menu_title: "journal-entries",
              read: true,
              write: true,
              visible: true              // ควบคุมการแสดงผล
            },
            {
              menu_key: "general-ledger",
              read: true,
              write: false,
              visible: true
            }
          ]
        },
        {
          module: "sales",
          menus: [
            {
              menu_key: "quotation",
              read: true,
              write: true,
              visible: true
            }
          ]
        }
      ]
    }
  ]
}
```

## 🎯 แผนการ Integrate ERP Permissions

### วิธีที่ 1: Filter ที่ระดับ Header.vue (แนะนำ)

**ข้อดี:**
- ไม่ต้องแก้ router.js ของแต่ละโมดูล
- Centralized logic ที่ Header.vue
- ง่ายต่อการ maintain

**วิธีการ:**
```javascript
// ใน Header.vue เพิ่ม method ใหม่

// 1. ฟังก์ชันเช็ค ERP Permission
hasERPPermission(moduleName, menuKey) {
  const erpData = storageManager.get('erp');
  if (!erpData || !erpData.job_assignments) return false;
  
  // หา permissions จาก job_assignments[0]
  const permissions = erpData.job_assignments[0]?.permissions || [];
  
  // หาโมดูลที่ตรงกัน
  const modulePerms = permissions.find(p => p.module === moduleName);
  if (!modulePerms) return false;
  
  // ถ้าไม่ระบุ menuKey = เช็คว่ามี module หรือไม่
  if (!menuKey) return true;
  
  // หา menu ที่ตรงกัน
  const menuPerm = modulePerms.menus.find(m => m.menu_key === menuKey);
  if (!menuPerm) return false;
  
  // เช็ค visible flag
  return menuPerm.visible === true;
}

// 2. แก้ไข buildMenuItemsWithRoleCheck() เพื่อเช็ค ERP permission
buildMenuItemsWithRoleCheck(routes, parent, userRole) {
  if (!routes) return [];
  
  const erpData = storageManager.get('erp');
  const hasERP = erpData && erpData.job_assignments;
  
  return routes.reduce((acc, route) => {
    const shouldShowInMenu = this.checkMenuVisibility(route, parent);
    
    if (shouldShowInMenu) {
      // เช็ค role ปกติ
      const effectiveRole = this.getEffectiveRole(route, parent);
      const hasValidRole = this.checkRoleAccess(effectiveRole, userRole);
      
      if (hasValidRole) {
        // ถ้ามี ERP data ให้เช็ค permission เพิ่ม
        if (hasERP) {
          const menuPath = route.path;
          const hasPermission = this.hasERPPermission(parent, menuPath);
          
          // ถ้าไม่มี permission ให้ skip
          if (!hasPermission) {
            return acc;
          }
        }
        
        // สร้าง menu item...
        const menuItem = {
          name: route.translatedTitle || route.name,
          href: `/${parent}/${route.path}`,
          icon: route.meta?.icon || 'file',
          // ... rest of the code
        };
        
        acc.push(menuItem);
      }
    }
    return acc;
  }, []);
}

// 3. แก้ไข loadMenuData() เพื่อ filter parent modules
async loadMenuData() {
  const erpData = storageManager.get('erp');
  const hasERP = erpData && erpData.job_assignments;
  
  // ... existing code ...
  
  const mainRoutes = [].concat(
    routesWithPermissions
      .filter(routeWithSubmenu => {
        const hasValidRole = !routeWithSubmenu.role || 
          routeWithSubmenu.role.includes(roleDecrypt);
        
        const isInPlugins = pluginData.includes(routeWithSubmenu.slug);
        
        // เช็ค ERP permission ถ้ามี
        let hasERPAccess = true;
        if (hasERP && routeWithSubmenu.groups === 'erp') {
          hasERPAccess = this.hasERPPermission(routeWithSubmenu.slug);
        }
        
        return routeWithSubmenu.meta.inMenu && 
               isInPlugins && 
               hasValidRole && 
               hasERPAccess;
      })
      .map(routeWithSubmenu => {
        // ... existing mapping code
      })
  );
  
  storageManager.set('navigation', mainRoutes);
}
```

### วิธีที่ 2: เพิ่ม Middleware ใน Router

**ข้อดี:**
- ป้องกันการเข้าถึง URL โดยตรง
- Security ที่ดีกว่า

**วิธีการ:**
```javascript
// สร้างไฟล์ใหม่: src/plugins/erpPermissionGuard.js

import storageManager from '@/plugins/storage';

export function checkERPPermission(to, from, next) {
  const erpData = storageManager.get('erp');
  
  // ถ้าไม่มี ERP data = ปล่อยผ่าน (ใช้ role checking แบบเดิม)
  if (!erpData || !erpData.job_assignments) {
    return next();
  }
  
  // Parse route path เพื่อหา module และ menu_key
  const pathParts = to.path.split('/').filter(p => p);
  const moduleName = pathParts[0]; // เช่น 'accounting'
  const menuKey = pathParts[1];     // เช่น 'journal-entries'
  
  // หา permissions
  const permissions = erpData.job_assignments[0]?.permissions || [];
  const modulePerms = permissions.find(p => p.module === moduleName);
  
  if (!modulePerms) {
    // ไม่มีสิทธิ์เข้าโมดูลนี้
    return next('/unauthorized');
  }
  
  if (menuKey) {
    const menuPerm = modulePerms.menus.find(m => m.menu_key === menuKey);
    
    if (!menuPerm || !menuPerm.visible) {
      return next('/unauthorized');
    }
    
    // เก็บ permission flags ใน route meta สำหรับใช้ในหน้า
    to.meta.canRead = menuPerm.read;
    to.meta.canWrite = menuPerm.write;
  }
  
  next();
}

// ใน main.js หรือ router/index.js
import { checkERPPermission } from '@/plugins/erpPermissionGuard';

router.beforeEach((to, from, next) => {
  // ... existing auth checks ...
  
  // เช็ค ERP permission
  checkERPPermission(to, from, next);
});
```

## 📊 การ Mapping ระหว่าง Router กับ ERP Permissions

### ตาราง Mapping

| Router Field | ERP Permission Field | Note |
|--------------|---------------------|------|
| `groups` | `module` | เช่น 'erp', 'accounting', 'sales' |
| `children[].path` | `menus[].menu_key` | เช่น 'journal-entries' |
| `meta.inMenu` | `menus[].visible` | ควบคุมการแสดงในเมนู |
| - | `menus[].read` | สิทธิ์อ่าน (ใช้ในหน้า) |
| - | `menus[].write` | สิทธิ์เขียน (ใช้ในหน้า) |

### ตัวอย่างการใช้งานในหน้า Component

```javascript
// ใน Component
export default {
  computed: {
    canEdit() {
      // ดึงจาก route meta ที่ถูกตั้งโดย guard
      return this.$route.meta.canWrite === true;
    },
    canView() {
      return this.$route.meta.canRead === true;
    }
  },
  methods: {
    async saveData() {
      if (!this.canEdit) {
        this.$toast.error('คุณไม่มีสิทธิ์แก้ไข');
        return;
      }
      // ... save logic
    }
  }
}
```

## 🚀 การ Implementation (แนะนำ)

### ขั้นตอนที่ 1: เพิ่มฟังก์ชันเช็ค Permission ใน Header.vue

```javascript
// เพิ่มใน methods ของ Header.vue

/**
 * เช็คว่า user มีสิทธิ์เข้าถึง module/menu หรือไม่
 * @param {string} moduleName - ชื่อโมดูล (เช่น 'accounting')
 * @param {string} menuKey - menu key (เช่น 'journal-entries')
 * @returns {boolean} - มีสิทธิ์หรือไม่
 */
hasERPPermission(moduleName, menuKey = null) {
  const erpData = storageManager.get('erp');
  
  // ถ้าไม่มี ERP data = ไม่ใช้ระบบ permission นี้
  if (!erpData || !erpData.job_assignments || erpData.job_assignments.length === 0) {
    return true; // ปล่อยผ่านไปใช้ role checking แบบเดิม
  }
  
  const permissions = erpData.job_assignments[0].permissions || [];
  
  // หาโมดูลที่ตรงกัน
  const modulePerms = permissions.find(p => p.module === moduleName);
  if (!modulePerms) {
    return false; // ไม่พบโมดูล = ไม่มีสิทธิ์
  }
  
  // ถ้าไม่ระบุ menuKey = เช็คเฉพาะโมดูล
  if (!menuKey) {
    return true; // มีสิทธิ์เข้าโมดูล
  }
  
  // หา menu item ที่ตรงกัน
  const menuPerm = modulePerms.menus.find(m => m.menu_key === menuKey);
  if (!menuPerm) {
    return false; // ไม่พบ menu = ไม่มีสิทธิ์
  }
  
  // เช็ค visible flag
  return menuPerm.visible === true;
}
```

### ขั้นตอนที่ 2: แก้ไข buildMenuItemsWithRoleCheck()

```javascript
buildMenuItemsWithRoleCheck(routes, parent, userRole) {
  if (!routes) return [];
  
  const erpData = storageManager.get('erp');
  const useERPPermissions = erpData && erpData.job_assignments && erpData.job_assignments.length > 0;
  
  return routes.reduce((acc, route) => {
    const shouldShowInMenu = this.checkMenuVisibility(route, parent);
    
    if (shouldShowInMenu) {
      const effectiveRole = this.getEffectiveRole(route, parent);
      const hasValidRole = this.checkRoleAccess(effectiveRole, userRole);
      
      if (hasValidRole) {
        // เช็ค ERP permission ถ้าเปิดใช้งาน
        if (useERPPermissions) {
          const hasPermission = this.hasERPPermission(parent, route.path);
          if (!hasPermission) {
            return acc; // Skip menu นี้
          }
        }
        
        const translatedName = route.translatedTitle || route.meta?.translatedTitle || route.name;
        
        const menuItem = {
          name: translatedName,
          href: `/${parent}/${route.path}`,
          icon: route.meta?.icon || 'file',
          role: effectiveRole,
          language: translatedName,
          current: false,
          counter: false,
          session: route.session || false,
          front: route.meta?.inFront || false,
          submenu: null,
        };
        
        if (route.children && route.children.length > 0) {
          const childParent = parent.includes('/') ? `${parent}/${route.path}` : `${parent}-${route.path}`;
          const filteredChildren = this.buildMenuItemsWithRoleCheck(route.children, childParent, userRole);
          if (filteredChildren.length > 0) {
            menuItem.submenu = filteredChildren;
          }
        }
        
        acc.push(menuItem);
      }
    }
    return acc;
  }, []);
}
```

### ขั้นตอนที่ 3: แก้ไข loadMenuData() - Filter Parent Modules

```javascript
async loadMenuData() {
  const rowRaw = storageManager.get('session', 'role');
  const roleDecrypt = rowRaw;
  const pluginData = storedConfigData && storedConfigData.plugins ? storedConfigData.plugins : [];
  
  const erpData = storageManager.get('erp');
  const useERPPermissions = erpData && erpData.job_assignments && erpData.job_assignments.length > 0;
  
  const routesWithSubmenus = getPluginRoutes(pluginRoutes);
  const routesWithPermissions = this.applyRouterPermissionsToRoutes(routesWithSubmenus);

  const mainRoutes = [].concat(
    routesWithPermissions
      .filter(routeWithSubmenu => {
        const hasValidRole = !routeWithSubmenu.role || routeWithSubmenu.role.includes(roleDecrypt);
        const isInPlugins = pluginData.includes(routeWithSubmenu.slug);
        
        // เช็ค ERP permission สำหรับ parent module
        let hasERPAccess = true;
        if (useERPPermissions && routeWithSubmenu.groups === 'erp') {
          // ใช้ slug เป็น module name เช่น 'accounting', 'sales'
          hasERPAccess = this.hasERPPermission(routeWithSubmenu.slug);
        }
        
        return routeWithSubmenu.meta.inMenu && 
               isInPlugins && 
               hasValidRole && 
               hasERPAccess;
      })
      .map(routeWithSubmenu => {
        const filteredSubmenu = this.buildMenuItemsWithRoleCheck(
          routeWithSubmenu.routes, 
          routeWithSubmenu.slug, 
          roleDecrypt
        );
        
        return {
          slug: routeWithSubmenu.slug,
          name: routeWithSubmenu.translatedTitle || routeWithSubmenu.name,
          language: routeWithSubmenu.translatedTitle || routeWithSubmenu.name,
          subtitle: routeWithSubmenu.subtitle || routeWithSubmenu.meta?.subtitle || 'จัดการข้อมูล',
          href: routeWithSubmenu.path,
          icon: routeWithSubmenu.icon,
          inApp: routeWithSubmenu.inApp,
          inTop: routeWithSubmenu.inTop,
          counter: routeWithSubmenu.counter,
          hasSubmenu: routeWithSubmenu.hasSubmenu && filteredSubmenu.length > 0,
          session: routeWithSubmenu.session,
          fullscreen: routeWithSubmenu.fullscreen,
          current: false,
          submenu: filteredSubmenu,
          meta: routeWithSubmenu.meta
        };
      })
      .filter(route => {
        if (route.hasSubmenu) {
          return route.submenu.length > 0;
        }
        return true;
      })
  );

  // ... counter logic ...
  
  const filteredRoutes = mainRoutes.filter(Top => Top.inTop === 'yes');
  this.navigation = filteredRoutes;
  
  storageManager.set('navigation', mainRoutes);
}
```

## ✅ Testing Checklist

- [ ] User ที่ไม่มี ERP data ยังใช้งานได้ปกติ (ใช้ role checking แบบเดิม)
- [ ] User ที่มี ERP data เห็นเฉพาะเมนูที่มีสิทธิ์
- [ ] Submenu ถูกกรองตาม `visible: true`
- [ ] Module ที่ไม่มี permission เลยจะไม่แสดง parent menu
- [ ] Counter ยังทำงานได้ปกติ
- [ ] Session switching ยังทำงานได้ (ต้องโหลด ERP data ใหม่)
- [ ] Logout ลบ ERP data ออกจาก storage

## 🔍 Debug Tips

```javascript
// ใส่ใน loadMenuData() เพื่อ debug
console.log('ERP Data:', storageManager.get('erp'));
console.log('Available modules:', erpData?.job_assignments[0]?.permissions.map(p => p.module));
console.log('Filtered routes:', mainRoutes.map(r => ({ slug: r.slug, hasSubmenu: r.hasSubmenu, submenuCount: r.submenu?.length })));
```

## 📝 Notes

1. **Module Name Mapping**: ต้องให้ `router.js` ของแต่ละโมดูลใช้ `name` ที่ตรงกับ `module` ใน ERP permissions
   - Router: `name: 'accounting'`
   - ERP: `module: 'accounting'`

2. **Menu Key Mapping**: `children[].path` ใน router ต้องตรงกับ `menu_key` ใน ERP
   - Router: `path: 'journal-entries'`
   - ERP: `menu_key: 'journal-entries'`

3. **Groups Field**: ใช้ `groups: 'erp'` เพื่อระบุว่าโมดูลนี้ต้องเช็ค ERP permissions

4. **Backward Compatibility**: ถ้าไม่มี ERP data ระบบจะทำงานแบบเดิม (เช็คแค่ role)

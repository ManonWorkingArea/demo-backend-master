/**
 * Menu Registry - ตัวอย่างการใช้งานแบบง่าย
 * 
 * ไฟล์นี้แสดงตัวอย่างการใช้งาน Menu Registry ใน ERP Core
 */

// ========================================
// 1. การเข้าถึงข้อมูลเมนูแบบพื้นฐาน
// ========================================

// ดึงข้อมูลเมนูของโมดูล HR
const hrMenus = window.ERP_CORE.menus.get('hr')
console.log('HR Module Menus:', hrMenus.menuItems)
console.log('จำนวนเมนู HR:', hrMenus.count)

// ดึงเฉพาะ menu items ของโมดูล Sales
const salesMenuItems = window.ERP_CORE.menus.getMenuItems('sales')
console.log('Sales Menus:', salesMenuItems)

// ดึงข้อมูลเมนูทั้งหมด
const allMenus = window.ERP_CORE.menus.getAll()
console.log('All Menus:', allMenus)

// ========================================
// 2. การค้นหาและตรวจสอบข้อมูล
// ========================================

// ค้นหาเมนูด้วย key
const employeeMenu = window.ERP_CORE.menus.findMenuByKey('employees')
console.log('Employee Menu:', employeeMenu)
// Output: {
//   menuItem: { key: 'employees', label: 'Employee Management', ... },
//   module: 'hr',
//   moduleName: 'Human Resources',
//   moduleNameTH: 'ทรัพยากรบุคคล'
// }

// ค้นหาเมนูด้วย route path
const menus = window.ERP_CORE.menus.findMenusByRoute('/sales/quotation')
console.log('Menus for route:', menus)

// ดึงรายชื่อโมดูลทั้งหมด
const moduleList = window.ERP_CORE.menus.getModuleList()
console.log('Available modules:', moduleList)
// Output: ['hr', 'accounting', 'sales', 'inventory', 'purchase', 'finance', 'delivery', 'production']

// นับจำนวนเมนูทั้งหมด
const totalMenus = window.ERP_CORE.menus.getTotalMenuCount()
console.log('จำนวนเมนูทั้งหมด:', totalMenus)

// ========================================
// 3. การใช้งานในฟังก์ชัน
// ========================================

/**
 * ฟังก์ชันแสดงรายการเมนูของโมดูล
 */
function displayModuleMenus(moduleName) {
  const config = window.ERP_CORE.menus.get(moduleName)
  
  if (!config) {
    console.warn(`โมดูล ${moduleName} ไม่พบ`)
    return
  }
  
  console.log(`\n=== ${config.moduleNameTH} ===`)
  console.log(`จำนวนเมนู: ${config.count}`)
  console.log('รายการเมนู:')
  
  config.menuItems.forEach((menu, index) => {
    console.log(`  ${index + 1}. ${menu.label} (${menu.to})`)
  })
}

// ใช้งาน
displayModuleMenus('hr')
displayModuleMenus('sales')

/**
 * ฟังก์ชันสร้างเมนูแบบ dynamic
 */
function createDynamicMenu(moduleName) {
  const menuItems = window.ERP_CORE.menus.getMenuItems(moduleName)
  
  const menuHTML = menuItems.map(menu => {
    if (menu.key === 'back') return '' // ข้าม back button
    
    return `
      <a href="${menu.to}" class="menu-item ${menu.opacity ? 'opacity-60' : ''}">
        <i class="fas fa-${menu.icon}"></i>
        <span>${menu.label}</span>
      </a>
    `
  }).join('')
  
  return `<div class="dynamic-menu">${menuHTML}</div>`
}

// ใช้งาน
const hrMenu = createDynamicMenu('hr')
console.log(hrMenu)

/**
 * ฟังก์ชันแสดงสถิติเมนูทั้งหมด
 */
function showMenuStatistics() {
  const all = window.ERP_CORE.menus.getAll()
  const modules = window.ERP_CORE.menus.getModuleList()
  const total = window.ERP_CORE.menus.getTotalMenuCount()
  
  console.log('\n=== สถิติเมนูในระบบ ===')
  console.log(`จำนวนโมดูล: ${modules.length}`)
  console.log(`จำนวนเมนูทั้งหมด: ${total}`)
  console.log('\nรายละเอียดแต่ละโมดูล:')
  
  Object.entries(all).forEach(([, config]) => {
    console.log(`  - ${config.moduleNameTH}: ${config.count} เมนู`)
  })
}

// ใช้งาน
showMenuStatistics()

// ========================================
// 4. ตัวอย่างการใช้งานใน Vue Component
// ========================================

/*
export default {
  data() {
    return {
      currentModule: 'sales',
      menuItems: [],
      moduleInfo: {}
    }
  },
  
  mounted() {
    this.loadMenus()
  },
  
  methods: {
    loadMenus() {
      const config = window.ERP_CORE.menus.get(this.currentModule)
      
      if (config) {
        this.menuItems = config.menuItems
        this.moduleInfo = {
          name: config.moduleName,
          nameTH: config.moduleNameTH,
          count: config.count
        }
      }
    },
    
    switchModule(moduleName) {
      this.currentModule = moduleName
      this.loadMenus()
    },
    
    searchMenu(query) {
      const allMenus = window.ERP_CORE.menus.getAll()
      const results = []
      
      Object.entries(allMenus).forEach(([module, config]) => {
        config.menuItems.forEach(menu => {
          if (menu.label.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              ...menu,
              module: module,
              moduleName: config.moduleNameTH
            })
          }
        })
      })
      
      return results
    }
  }
}
*/

// ========================================
// 5. Utility Functions
// ========================================

/**
 * สร้าง breadcrumb จาก route path
 */
function createBreadcrumb(routePath) {
  const menus = window.ERP_CORE.menus.findMenusByRoute(routePath)
  
  if (menus.length > 0) {
    const menu = menus[0]
    return [
      { label: 'หน้าหลัก', path: '/' },
      { label: menu.moduleNameTH, path: `/${menu.module}` },
      { label: menu.menuItem.label, path: routePath }
    ]
  }
  
  return [{ label: 'หน้าหลัก', path: '/' }]
}

// ตัวอย่าง
const breadcrumb = createBreadcrumb('/hr/employees')
console.log('Breadcrumb:', breadcrumb)

/**
 * ตรวจสอบว่าเมนูมีอยู่จริงหรือไม่
 */
function isMenuExists(menuKey) {
  const result = window.ERP_CORE.menus.findMenuByKey(menuKey)
  return result !== null
}

// ตัวอย่าง
console.log('มีเมนู employees?', isMenuExists('employees')) // true
console.log('มีเมนู xyz?', isMenuExists('xyz')) // false

/**
 * ดึงเมนูทั้งหมดของโมดูลยกเว้น back button
 */
function getMenusWithoutBack(moduleName) {
  const items = window.ERP_CORE.menus.getMenuItems(moduleName)
  return items.filter(menu => menu.key !== 'back')
}

// ตัวอย่าง
const hrMenusOnly = getMenusWithoutBack('hr')
console.log('HR Menus (without back):', hrMenusOnly)

// ========================================
// 6. Advanced: การใช้งานร่วมกับ Router
// ========================================

/**
 * สร้าง router routes จาก menu config
 */
function generateRoutesFromMenus(moduleName) {
  const menuItems = window.ERP_CORE.menus.getMenuItems(moduleName)
  
  return menuItems
    .filter(menu => menu.key !== 'back')
    .map(menu => ({
      path: menu.to,
      name: menu.key,
      component: () => import(`@/modules/${moduleName}/views/${menu.key}.vue`),
      meta: {
        title: menu.label,
        icon: menu.icon,
        module: moduleName
      }
    }))
}

// ตัวอย่าง (สมมติ)
const salesRoutes = generateRoutesFromMenus('sales')
console.log('Generated routes for sales:', salesRoutes)

console.log('\n✅ ตัวอย่างการใช้งาน Menu Registry ทั้งหมด')

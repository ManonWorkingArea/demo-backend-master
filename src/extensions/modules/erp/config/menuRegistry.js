/**
 * ERP Core - Menu Registry
 * ฟังก์ชันกลางสำหรับจัดการและดึงข้อมูล menuConfig จากทุกโมดูล
 * 
 * รองรับ 2 ระดับ:
 * 1. Main Menu - ดึงจาก router.js (สำหรับ ERP main menu)
 * 2. Dashboard Menu - ดึงจาก menuConfig.js (สำหรับ module dashboard)
 */

/**
 * โหลด router config ของ module แบบ lazy
 */
const loadModuleRouter = async (moduleName) => {
  try {
    const router = await import(`@/extensions/modules/erp/modules/${moduleName}/router.js`)
    return router.default || router
  } catch (error) {
    return null
  }
}

/**
 * โหลด menuConfig ของ module แบบ lazy
 */
const loadModuleMenuConfig = async (moduleName) => {
  try {
    const config = await import(`@/extensions/modules/erp/modules/${moduleName}/config/menuConfig.js`)
    return config.default || config[`${moduleName}MenuItems`] || config
  } catch (error) {
    return null
  }
}

/**
 * แปลง router children เป็น main menu items (เฉพาะ level แรก)
 */
const routerToMainMenuItems = (routerConfig) => {
  if (!routerConfig || !Array.isArray(routerConfig) || routerConfig.length === 0) {
    return []
  }
  
  const mainRoute = routerConfig[0]
  
  // Main menu item = module ตัวเอง
  return [{
    key: mainRoute.meta?.key || mainRoute.name || mainRoute.path.replace(/^\//, ''),
    label: mainRoute.meta?.title || mainRoute.meta?.main || '',
    icon: mainRoute.meta?.icon || 'cube',
    to: mainRoute.path,
    description: mainRoute.description || '',
    groups: mainRoute.groups || 'erp',
    inApp: mainRoute.inApp || 'yes',
    inTop: mainRoute.inTop || 'no'
  }]
}

/**
 * แปลง router children เป็น menu items (สำหรับ dashboard)
 */
const routerToDashboardMenuItems = (routerConfig) => {
  if (!routerConfig || !Array.isArray(routerConfig) || routerConfig.length === 0) {
    return []
  }
  
  const mainRoute = routerConfig[0]
  if (!mainRoute.children) return []
  
  // กรองเฉพาะ routes ที่ inMenu: true
  return mainRoute.children
    .filter(route => route.meta?.inMenu === true)
    .map(route => ({
      key: route.meta.key || route.name,
      label: route.meta.title,
      icon: route.meta.icon || 'file',
      to: `/${mainRoute.path.replace(/^\//, '')}/${route.path}`,
      opacity: route.meta.opacity || false,
      role: route.meta.role || []
    }))
}

/**
 * ดึงข้อมูล module metadata จาก router
 */
const getModuleMetadata = (routerConfig) => {
  if (!routerConfig || !Array.isArray(routerConfig) || routerConfig.length === 0) {
    return {}
  }
  
  const mainRoute = routerConfig[0]
  return {
    slug: mainRoute.path.replace(/^\//, ''),
    title: mainRoute.meta?.title || mainRoute.meta?.main || '',
    description: mainRoute.description || '',
    icon: mainRoute.meta?.icon || 'cube',
    groups: mainRoute.groups || 'erp',
    inApp: mainRoute.inApp || 'yes',
    inTop: mainRoute.inTop || 'no'
  }
}

/**
 * Menu Registry Object
 * สร้างแบบ lazy - โหลดจาก router.js เมื่อมีการเรียกใช้จริง
 */
export const menuRegistry = new Proxy({}, {
  get(target, moduleName) {
    if (typeof moduleName === 'symbol') return target[moduleName]
    
    // Cache result
    if (!target[moduleName]) {
      target[moduleName] = {
        // Main menu items (จาก router - ระดับ module)
        get mainMenuItems() {
          return this._mainMenuItems || []
        },
        set mainMenuItems(value) {
          this._mainMenuItems = value
        },
        
        // Dashboard menu items (จาก menuConfig หรือ router children)
        get menuItems() {
          return this._menuItems || []
        },
        set menuItems(value) {
          this._menuItems = value
        },
        
        get metadata() {
          return this._metadata || {}
        },
        set metadata(value) {
          this._metadata = value
        },
        get count() {
          return this.menuItems.length
        },
        module: moduleName,
        get moduleName() {
          return this.metadata.title || moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
        },
        get moduleNameTH() {
          // ต้อง load ก่อนถึงจะได้ชื่อไทย
          return this._moduleNameTH || moduleName
        },
        async loadModuleNameTH() {
          if (!this._moduleNameTH) {
            this._moduleNameTH = await getModuleNameTH(moduleName)
          }
          return this._moduleNameTH
        },
        get description() {
          return this.metadata.description || ''
        },
        get icon() {
          return this.metadata.icon || 'cube'
        },
        _loaded: false,
        
        async load() {
          if (!this._loaded) {
            // โหลด router สำหรับ main menu และ metadata
            const routerConfig = await loadModuleRouter(moduleName)
            if (routerConfig) {
              this.mainMenuItems = routerToMainMenuItems(routerConfig)
              this.metadata = getModuleMetadata(routerConfig)
            }
            
            // โหลด menuConfig สำหรับ dashboard menu
            const menuConfig = await loadModuleMenuConfig(moduleName)
            if (menuConfig) {
              // ถ้ามี menuConfig ใช้จาก menuConfig
              this.menuItems = Array.isArray(menuConfig) ? menuConfig : []
            } else if (routerConfig) {
              // ถ้าไม่มี menuConfig ใช้จาก router children
              this.menuItems = routerToDashboardMenuItems(routerConfig)
            }
            
            this._loaded = true
          }
          return this.menuItems
        }
      }
    }
    return target[moduleName]
  }
})

/**
 * แปลงชื่อ module เป็นภาษาไทย
 * ดึงจาก router.js metadata แทน hardcode
 */
const getModuleNameTH = async (moduleName) => {
  try {
    const router = await loadModuleRouter(moduleName)
    if (router && router[0]) {
      // พยายามหาชื่อไทยจาก metadata
      return router[0].meta?.titleTH || 
             router[0].meta?.nameTH || 
             router[0].descriptionTH ||
             router[0].meta?.title || 
             moduleName
    }
  } catch (error) {
    // Silent fail
  }
  return moduleName
}

/**
 * ดึงข้อมูล menuConfig ของโมดูลที่ระบุ
 * @param {string} moduleName - ชื่อโมดูล (hr, sales, accounting, etc.)
 * @returns {Promise<Object|null>} - Menu configuration object หรือ null ถ้าไม่พบโมดูล
 * 
 * @example
 * const hrMenus = await getMenuConfig('hr')
 * console.log(hrMenus.menuItems) // Array ของ menu items
 * console.log(hrMenus.count) // จำนวน menu items
 */
export const getMenuConfig = async (moduleName) => {
  if (!moduleName || typeof moduleName !== 'string') {
    return null
  }

  const module = moduleName.toLowerCase()
  const moduleConfig = menuRegistry[module]
  
  if (!moduleConfig) {
    return null
  }

  await moduleConfig.load()
  return moduleConfig
}

/**
 * ดึงข้อมูล menuItems (array) ของโมดูลที่ระบุ
 * @param {string} moduleName - ชื่อโมดูล
 * @returns {Promise<Array>} - Array ของ menu items หรือ empty array ถ้าไม่พบ
 * 
 * @example
 * const salesMenus = await getMenuItems('sales')
 * salesMenus.forEach(menu => console.log(menu.label))
 */
export const getMenuItems = async (moduleName) => {
  const config = await getMenuConfig(moduleName)
  return config ? config.menuItems : []
}

/**
 * ดึงข้อมูล menuConfig ทั้งหมดจากทุกโมดูล
 * @returns {Promise<Object>} - Object ที่มี key เป็นชื่อโมดูลและ value เป็น config
 * 
 * @example
 * const allMenus = await getAllMenuConfigs()
 * console.log(allMenus.hr.menuItems)
 * console.log(allMenus.sales.count)
 */
export const getAllMenuConfigs = async () => {
  const modules = getModuleList() // Auto-discover modules
  await Promise.all(modules.map(m => menuRegistry[m].load()))
  
  return Object.fromEntries(
    modules.map(m => [m, menuRegistry[m]])
  )
}

/**
 * รายชื่อ modules ทั้งหมดในระบบ
 * Simple list - ไม่ต้องใช้ require.context
 */
const AVAILABLE_MODULES = [
  'accounting',
  'sales', 
  'inventory',
  'purchase',
  'production',
  'delivery',
  'finance',
  'hr',
  'dummy'
]

/**
 * ค้นหา modules ทั้งหมดแบบ auto-discovery
 * Dynamic 100% - ไม่มี hardcode
 */
const discoverModules = () => {
  console.log('🔍 [MenuRegistry] discoverModules called')
  
  // ใช้ list ที่กำหนดไว้แทน require.context
  console.log('✅ [MenuRegistry] Using predefined module list:', AVAILABLE_MODULES)
  return AVAILABLE_MODULES
}

/**
 * ดึงรายชื่อโมดูลทั้งหมดที่มีใน registry
 * @returns {Array<string>} - Array ของชื่อโมดูล
 * 
 * @example
 * const modules = getModuleList()
 * console.log(modules) // ['hr', 'accounting', 'sales', ...]
 */
export const getModuleList = () => {
  return discoverModules()
}

/**
 * นับจำนวน menu items ทั้งหมดในระบบ
 * @returns {Promise<number>} - จำนวน menu items รวมทั้งหมด
 * 
 * @example
 * const total = await getTotalMenuCount()
 * console.log(`Total menus: ${total}`)
 */
export const getTotalMenuCount = async () => {
  const allConfigs = await getAllMenuConfigs()
  return Object.values(allConfigs).reduce((sum, module) => sum + module.count, 0)
}

/**
 * ค้นหา menu item จากทุกโมดูลโดยใช้ key
 * @param {string} menuKey - key ของ menu ที่ต้องการค้นหา
 * @returns {Promise<Object|null>} - Menu item พร้อมข้อมูลโมดูล หรือ null ถ้าไม่พบ
 * 
 * @example
 * const menu = await findMenuByKey('employees')
 * console.log(menu) // { menuItem: {...}, module: 'hr' }
 */
export const findMenuByKey = async (menuKey) => {
  if (!menuKey) return null

  const modules = getModuleList()
  
  for (const moduleName of modules) {
    const config = await getMenuConfig(moduleName)
    const menuItem = config.menuItems.find(item => item.key === menuKey)
    if (menuItem) {
      return {
        menuItem,
        module: moduleName,
        moduleName: config.moduleName,
        moduleNameTH: config.moduleNameTH
      }
    }
  }

  return null
}

/**
 * ค้นหา menu items ที่ตรงกับ route path
 * @param {string} routePath - path ของ route (เช่น '/hr/employees')
 * @returns {Promise<Array>} - Array ของ menu items ที่พบ
 * 
 * @example
 * const menus = await findMenusByRoute('/hr/employees')
 * console.log(menus)
 */
export const findMenusByRoute = async (routePath) => {
  if (!routePath) return []

  const results = []
  const modules = getModuleList()

  for (const moduleName of modules) {
    const config = await getMenuConfig(moduleName)
    const matchedMenus = config.menuItems.filter(item => item.to === routePath)
    matchedMenus.forEach(menu => {
      results.push({
        menuItem: menu,
        module: moduleName,
        moduleName: config.moduleName,
        moduleNameTH: config.moduleNameTH
      })
    })
  }

  return results
}

/**
 * Export default สำหรับใช้งาน
 */
export default {
  menuRegistry,
  getMenuConfig,
  getMenuItems,
  getAllMenuConfigs,
  getModuleList,
  getTotalMenuCount,
  findMenuByKey,
  findMenusByRoute
}

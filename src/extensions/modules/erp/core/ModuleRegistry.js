/**
 * Module Registry System
 * ระบบจัดการ modules แบบ dynamic
 * เข้าถึง config, components, utilities ของแต่ละ module ได้โดยไม่ต้อง hardcode
 * 
 * Usage:
 * - ERP_CORE.modules.accounting.config.menuConfig
 * - ERP_CORE.modules.sales.shared.SalesManager
 * - ERP_CORE.getModuleConfig('accounting', 'menuConfig')
 */

// Import getModuleList from menuRegistry for auto-discovery
import { getModuleList } from '../config/menuRegistry.js'

class ModuleRegistry {
  constructor() {
    this.modules = {}
    this.moduleConfigs = {}
    this.moduleComponents = {}
    this.moduleUtils = {}
  }

  /**
   * ลงทะเบียน module
   * @param {string} moduleName - ชื่อ module (accounting, sales, etc.)
   * @param {Object} moduleExports - exports ทั้งหมดจาก module
   */
  registerModule(moduleName, moduleExports = {}) {
    this.modules[moduleName] = {
      name: moduleName,
      config: {},
      components: {},
      shared: {},
      utils: {},
      plugins: {},
      services: {},
      ...moduleExports
    }
    
    return this.modules[moduleName]
  }

  /**
   * ลงทะเบียน config ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} configName - ชื่อ config (menuConfig, settings, etc.)
   * @param {*} configData - ข้อมูล config
   */
  registerConfig(moduleName, configName, configData) {
    if (!this.modules[moduleName]) {
      this.registerModule(moduleName)
    }
    
    this.modules[moduleName].config[configName] = configData
    
    return configData
  }

  /**
   * ลงทะเบียน component ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} componentName - ชื่อ component
   * @param {*} component - Vue component
   */
  registerComponent(moduleName, componentName, component) {
    if (!this.modules[moduleName]) {
      this.registerModule(moduleName)
    }
    
    if (!this.modules[moduleName].components) {
      this.modules[moduleName].components = {}
    }
    
    this.modules[moduleName].components[componentName] = component
    
    return component
  }

  /**
   * ลงทะเบียน shared component
   * @param {string} moduleName - ชื่อ module
   * @param {string} componentName - ชื่อ component
   * @param {*} component - Vue component
   */
  registerShared(moduleName, componentName, component) {
    if (!this.modules[moduleName]) {
      this.registerModule(moduleName)
    }
    
    if (!this.modules[moduleName].shared) {
      this.modules[moduleName].shared = {}
    }
    
    this.modules[moduleName].shared[componentName] = component
    
    return component
  }

  /**
   * ลงทะเบียน utility functions
   * @param {string} moduleName - ชื่อ module
   * @param {string} utilName - ชื่อ util
   * @param {*} utilFunctions - utility functions
   */
  registerUtils(moduleName, utilName, utilFunctions) {
    if (!this.modules[moduleName]) {
      this.registerModule(moduleName)
    }
    
    if (!this.modules[moduleName].utils) {
      this.modules[moduleName].utils = {}
    }
    
    this.modules[moduleName].utils[utilName] = utilFunctions
    
    return utilFunctions
  }

  /**
   * ดึง module ทั้งหมด
   */
  getModule(moduleName) {
    return this.modules[moduleName] || null
  }

  /**
   * ดึง config ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} configName - ชื่อ config (optional)
   */
  async getModuleConfig(moduleName, configName = null) {
    console.log(`🔍 [ModuleRegistry] getModuleConfig called for: ${moduleName}, config: ${configName}`)
    
    // Auto-register if not exists
    if (!this.modules[moduleName]) {
      console.log(`⚙️ [ModuleRegistry] Module ${moduleName} not registered, auto-registering...`)
      await this.autoRegisterModule(moduleName)
    }
    
    const module = this.modules[moduleName]
    console.log(`🔍 [ModuleRegistry] Module ${moduleName}:`, module)
    
    if (!module) {
      console.warn(`⚠️ [ModuleRegistry] No module found for: ${moduleName}`)
      return null
    }
    
    if (configName) {
      const config = module.config[configName] || null
      console.log(`🔍 [ModuleRegistry] Config ${configName} for ${moduleName}:`, config)
      return config
    }
    
    console.log(`🔍 [ModuleRegistry] All configs for ${moduleName}:`, module.config)
    return module.config || {}
  }

  /**
   * ดึง component ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} componentName - ชื่อ component (optional)
   */
  getModuleComponent(moduleName, componentName = null) {
    const module = this.modules[moduleName]
    if (!module) {
      return null
    }
    
    if (componentName) {
      return module.components[componentName] || null
    }
    
    return module.components || {}
  }

  /**
   * ดึง shared component ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} componentName - ชื่อ component (optional)
   */
  getModuleShared(moduleName, componentName = null) {
    const module = this.modules[moduleName]
    if (!module) {
      return null
    }
    
    if (componentName) {
      return module.shared[componentName] || null
    }
    
    return module.shared || {}
  }

  /**
   * ดึง utils ของ module
   * @param {string} moduleName - ชื่อ module
   * @param {string} utilName - ชื่อ util (optional)
   */
  getModuleUtils(moduleName, utilName = null) {
    const module = this.modules[moduleName]
    if (!module) {
      return null
    }
    
    if (utilName) {
      return module.utils[utilName] || null
    }
    
    return module.utils || {}
  }

  /**
   * ดึงรายชื่อ modules ทั้งหมด (auto-discovery)
   */
  getModuleNames() {
    console.log('🔍 [ModuleRegistry] getModuleNames called')
    
    // ถ้ามี modules ลงทะเบียนแล้ว return ทันที
    const registeredModules = Object.keys(this.modules)
    console.log('🔍 [ModuleRegistry] Registered modules:', registeredModules)
    
    if (registeredModules.length > 0) {
      console.log('✅ [ModuleRegistry] Returning registered modules:', registeredModules)
      return registeredModules
    }

    // Use menuRegistry's getModuleList which has require.context
    console.log('⚙️ [ModuleRegistry] No registered modules, using menuRegistry auto-discovery...')
    try {
      const modules = getModuleList()
      console.log('✅ [ModuleRegistry] Auto-discovered modules from menuRegistry:', modules)
      return modules
    } catch (error) {
      console.error('❌ [ModuleRegistry] Auto-discovery failed:', error)
      return []
    }
  }

  /**
   * ตรวจสอบว่า module ถูกลงทะเบียนแล้วหรือไม่
   */
  hasModule(moduleName) {
    return !!this.modules[moduleName]
  }

  /**
   * Auto-register module จาก dynamic import
   * @param {string} moduleName - ชื่อ module
   */
  async autoRegisterModule(moduleName) {
    console.log(`🔍 [ModuleRegistry] autoRegisterModule called for: ${moduleName}`)
    
    if (this.hasModule(moduleName)) {
      console.log(`✅ [ModuleRegistry] Module ${moduleName} already registered`)
      return this.getModule(moduleName)
    }

    try {
      console.log(`⚙️ [ModuleRegistry] Attempting to import configs for: ${moduleName}`)
      
      // Import config (menuConfig) - ใช้ absolute path จาก @/
      try {
        const menuConfigModule = await import(`@/extensions/modules/erp/modules/${moduleName}/config/menuConfig.js`)
        const menuConfig = menuConfigModule.default || menuConfigModule.accountingMenuItems || menuConfigModule.salesMenuItems || menuConfigModule.purchaseMenuItems || menuConfigModule
        console.log(`✅ [ModuleRegistry] Loaded menuConfig for ${moduleName}:`, menuConfig)
        this.registerConfig(moduleName, 'menuConfig', menuConfig)
      } catch (err) {
        console.warn(`⚠️ [ModuleRegistry] No menuConfig for ${moduleName}:`, err.message)
      }
      
      // Import plugins (module exports)
      try {
        const pluginsModule = await import(`@/extensions/modules/erp/modules/${moduleName}/plugins/index.js`)
        console.log(`✅ [ModuleRegistry] Loaded plugins for ${moduleName}`)
        if (!this.modules[moduleName]) {
          this.registerModule(moduleName, pluginsModule)
        } else {
          this.modules[moduleName].plugins = pluginsModule
        }
      } catch (err) {
        console.warn(`⚠️ [ModuleRegistry] No plugins for ${moduleName}:`, err.message)
      }
      
      const module = this.getModule(moduleName)
      console.log(`✅ [ModuleRegistry] Module ${moduleName} registered:`, module)
      return module
      
    } catch (error) {
      console.error(`❌ [ModuleRegistry] Failed to auto-register ${moduleName}:`, error)
      return null
    }
  }

  /**
   * Helper: เข้าถึง module แบบ nested path
   * @param {string} path - เช่น 'accounting.config.menuConfig'
   * @returns {*} - ค่าที่ต้องการ
   */
  getByPath(path) {
    const parts = path.split('.')
    let current = this.modules
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part]
      } else {
        return null
      }
    }
    
    return current
  }

  /**
   * แสดงข้อมูล modules ทั้งหมด (for debugging)
   */
  debug() {
    return {
      modules: this.getModuleNames(),
      details: Object.keys(this.modules).reduce((acc, name) => {
        const module = this.modules[name]
        acc[name] = {
          configs: Object.keys(module.config || {}),
          components: Object.keys(module.components || {}),
          shared: Object.keys(module.shared || {}),
          utils: Object.keys(module.utils || {})
        }
        return acc
      }, {})
    }
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry()

export default ModuleRegistry

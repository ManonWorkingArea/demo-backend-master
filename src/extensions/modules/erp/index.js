/**
 * ERP Module - Central Export
 * 
 * นี่คือจุดเข้าถึงหลักของ ERP Module
 * ใช้สำหรับ import components, utilities และ services ต่างๆ 
 * จากที่เดียวโดยไม่ต้องระบุ path ที่ซับซ้อน
 * 
 * Usage:
 * import { ModuleDashboard, ModuleAccessSelector, useERPCore } from '@/extensions/modules/erp'
 */

// ==================== UI Components ====================
// Export ทุกอย่างจาก UI Kit
export * from './ui-kit/index.js'

// ==================== Shared Components ====================
// Export shared components ที่ใช้ร่วมกัน
export { default as ModuleAccessSelector } from './shared/ModuleAccessSelector.vue'

// ==================== Core Services ====================
// Export Core Engine และ utilities
export { default as ERPCore } from './core/Engine.js'
export * from './core/Types.js'

// Export Transaction Engine และ Types (ใช้บ่อยใน components)
export { 
  TransactionEngine, 
  TransactionService,
  TRANSACTION_TYPES 
} from './core/index.js'

// ==================== Composables ====================
// Export composables ที่ใช้บ่อย (ชื่อไฟล์ตรงกับที่มีจริง)
export { useErpCore } from './composables/useErpCore.js'

// ==================== Utilities ====================
// Export utilities
export { default as codeGenerator } from './utils/codeGenerator.js'

// ==================== Config ====================
// Export menu registry
export { default as menuRegistry } from './config/menuRegistry.js'

// ==================== Default Export ====================
// Export แบบ default สำหรับ import ทั้งหมด
export default {
  // UI Components from ui-kit will be included via export *
  // Core services
  ERPCore: () => import('./core/Engine.js'),
  
  // Composables
  useErpCore: () => import('./composables/useErpCore.js'),
  
  // Utilities
  codeGenerator: () => import('./utils/codeGenerator.js'),
  
  // Config
  menuRegistry: () => import('./config/menuRegistry.js'),
}

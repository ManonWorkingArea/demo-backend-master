// ==========================================
// ERP Core Utils - Centralized Utilities
// ==========================================

// Import all utility modules
import * as deliveryUtils from './deliveryUtils.js'
import * as salesUtils from './salesUtils.js'
import * as inventoryUtils from './inventoryUtils.js'
import * as financeUtils from './financeUtils.js'
import * as productionUtils from './productionUtils.js'
import * as generalUtils from './generalUtils.js'

// Module-based exports for tree shaking
export const delivery = deliveryUtils
export const sales = salesUtils
export const inventory = inventoryUtils
export const finance = financeUtils
export const production = productionUtils
export const general = generalUtils

// Legacy support - direct exports
export {
  deliveryUtils,
  salesUtils,
  inventoryUtils,
  financeUtils,
  productionUtils,
  generalUtils
}

// Convenience object for all utils
export const ERP_UTILS = {
  delivery: deliveryUtils,
  sales: salesUtils,
  inventory: inventoryUtils,
  finance: financeUtils,
  production: productionUtils,
  general: generalUtils
}

// Default export
export default ERP_UTILS
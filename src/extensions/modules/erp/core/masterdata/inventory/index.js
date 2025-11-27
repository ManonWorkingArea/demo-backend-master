/**
 * Inventory Master Data Index
 * ดัชนีรวมข้อมูลหลักสำหรับ Inventory
 */

// Import schema และ data
import * as Schema from './schema.js'
import * as Data from './data.js'

// Import stock locations sub-module
import StockLocationModule from './stock_locations/index.js'

// Re-export everything for easy access
export * from './schema.js'
export * from './data.js'
export { INVENTORY_CODE_CONFIG } from './data.js'

// Re-export stock locations module
export { default as StockLocationModule } from './stock_locations/index.js'
export * from './stock_locations/index.js'

// Main export object
export default {
  // Schema constants
  ...Schema,
  
  // Data and functions
  ...Data.default,
  
  // Sub-modules
  StockLocation: StockLocationModule,
  
  // Helper for backward compatibility
  InventoryMasterData: Data.InventoryMasterData
}
/**
 * Purchase Master Data Index
 * ดัชนีรวมข้อมูลหลักสำหรับ Purchase
 */

// Import schema และ data
import * as Schema from './schema.js'
import * as Data from './data.js'
import { PURCHASE_CODE_CONFIG } from './data.js'

// Re-export everything for easy access
export * from './schema.js'
export * from './data.js'
export { PURCHASE_CODE_CONFIG }

// Main export object
export default {
  // Schema constants
  ...Schema,
  
  // Data and functions
  ...Data.default,
  
  // Helper for backward compatibility
  PurchaseMasterData: Data.PurchaseMasterData
}
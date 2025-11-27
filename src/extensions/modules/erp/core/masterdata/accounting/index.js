// ==========================================
// ACCOUNTING MODULE - EXPORTS
// ==========================================

// Import all from schema
export * from './schema.js'

// Import all from data
export * from './data.js'

// Default export
import AccountingSchema from './schema.js'
import AccountingData from './data.js'

export default {
  ...AccountingSchema,
  ...AccountingData
}

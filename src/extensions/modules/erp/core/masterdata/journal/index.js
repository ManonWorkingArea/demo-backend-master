// ==========================================
// JOURNAL MODULE - EXPORTS
// ==========================================

// Import all from schema
export * from './schema.js'

// Import all from data
export * from './data.js'

// Default export
import JournalSchema from './schema.js'
import JournalData from './data.js'

export default {
  ...JournalSchema,
  ...JournalData
}

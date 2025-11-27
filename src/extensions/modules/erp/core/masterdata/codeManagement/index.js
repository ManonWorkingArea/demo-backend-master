/**
 * Code Management Module
 * Export schema และ utilities สำหรับจัดการรหัสแบบศูนย์กลาง
 */

import {
  CODE_MODULES,
  PATTERN_COMPONENTS,
  YEAR_FORMATS,
  MONTH_FORMATS,
  DAY_FORMATS,
  SEQUENCE_FORMATS,
  RESET_PERIODS,
  CODE_PATTERN_STATUS,
  DEFAULT_CODE_PATTERNS,
  CODE_MANAGEMENT_SCHEMA,
  CODE_MODULE_LABELS,
  PATTERN_COMPONENT_LABELS,
  RESET_PERIOD_LABELS,
  CODE_PATTERN_STATUS_LABELS
} from './schema.js'

import {
  generateCode,
  buildCodeFromPattern,
  calculateNextSequence,
  shouldResetSequence,
  createRegexFromPattern,
  escapeRegex,
  getCodePattern,
  saveCodePattern,
  updateCodePattern,
  getAllCodePatterns,
  getCodeFieldName,
  getModulePrefix,
  validateCode,
  generateCodeExample,
  resetSequence
} from './data.js'

// Main Schema Export
export const CODE_MANAGEMENT_MODULE = {
  schema: CODE_MANAGEMENT_SCHEMA,
  defaultPatterns: DEFAULT_CODE_PATTERNS,
  modules: CODE_MODULES,
  components: PATTERN_COMPONENTS,
  resetPeriods: RESET_PERIODS
}

// Business Logic Export
export const CODE_MANAGEMENT_LOGIC = {
  generate: generateCode,
  build: buildCodeFromPattern,
  calculateNext: calculateNextSequence,
  shouldReset: shouldResetSequence,
  createRegex: createRegexFromPattern,
  escape: escapeRegex,
  getPattern: getCodePattern,
  save: saveCodePattern,
  update: updateCodePattern,
  getAll: getAllCodePatterns,
  getFieldName: getCodeFieldName,
  getPrefix: getModulePrefix,
  validate: validateCode,
  generateExample: generateCodeExample,
  reset: resetSequence
}

// Constants Export
export {
  CODE_MODULES,
  PATTERN_COMPONENTS,
  YEAR_FORMATS,
  MONTH_FORMATS,
  DAY_FORMATS,
  SEQUENCE_FORMATS,
  RESET_PERIODS,
  CODE_PATTERN_STATUS,
  CODE_MODULE_LABELS,
  PATTERN_COMPONENT_LABELS,
  RESET_PERIOD_LABELS,
  CODE_PATTERN_STATUS_LABELS
}

// Main Schema Export for Transaction Engine
export { CODE_MANAGEMENT_SCHEMA }

// Main Export (Default)
export default {
  CODE_MANAGEMENT_SCHEMA,
  CODE_MODULES,
  PATTERN_COMPONENTS,
  RESET_PERIODS,
  DEFAULT_CODE_PATTERNS,
  CODE_MODULE_LABELS,
  business: CODE_MANAGEMENT_LOGIC,
  utils: {
    generate: generateCode,
    getPattern: getCodePattern,
    validate: validateCode,
    generateExample: generateCodeExample
  }
}
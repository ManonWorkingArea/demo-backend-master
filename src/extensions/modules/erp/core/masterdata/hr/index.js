/**
 * HR Module Entry Point
 * จุดเข้าใช้งานสำหรับ HR module masterdata
 */

// Export schema constants
export {
  EMPLOYEE_TYPES,
  EMPLOYEE_STATUS,
  POSITION_LEVELS,
  DEPARTMENT_STATUS,
  USER_ROLES,
  USER_STATUS,
  ATTENDANCE_TYPES,
  PAYROLL_STATUS,
  LEAVE_TYPES,
  LEAVE_STATUS,
  EVALUATION_TYPES,
  EVALUATION_RESULTS,
  EDUCATION_LEVELS,
  SKILL_LEVELS,
  PERMISSION_TYPES,
  EMPLOYEE_TYPE_LABELS,
  EMPLOYEE_STATUS_LABELS,
  POSITION_LEVEL_LABELS,
  LEAVE_TYPE_LABELS,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  HR_CONFIG,
  HR_DEFAULTS,
  EMPLOYEE_SCHEMA,
  DEPARTMENT_SCHEMA,
  POSITION_SCHEMA,
  USER_SCHEMA,
  ATTENDANCE_SCHEMA,
  PAYROLL_SCHEMA,
  HR_STORAGE_KEYS
} from './schema.js'

// Export data management
export {
  SAMPLE_HR_DATA,
  HRDataManager,
  hrDataManager,
  HR_CODE_CONFIG
} from './data.js'

// Re-export everything for easy access
export * from './schema.js'
export * from './data.js'

// Export default data manager instance
export { hrDataManager as default } from './data.js'
/**
 * Work Order Module Entry Point
 * จุดเข้าใช้งานสำหรับ work order module
 */

// Export ค่าคงที่และ schema
export {
  WORK_ORDER_TYPES,
  WORK_ORDER_STATUS,
  PRIORITY_LEVELS,
  JOB_TYPES,
  TASK_STATUS,
  RESOURCE_TYPES,
  TIME_UNITS,
  COST_TYPES,
  HOLD_REASONS,
  INSPECTION_TYPES,
  INSPECTION_RESULTS,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  PRIORITY_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  TASK_STATUS_LABELS,
  RESOURCE_TYPE_LABELS,
  TIME_UNIT_LABELS,
  COST_TYPE_LABELS,
  HOLD_REASON_LABELS,
  INSPECTION_TYPE_LABELS,
  INSPECTION_RESULT_LABELS,
  WORK_ORDER_CONFIG,
  WORK_ORDER_DEFAULTS,
  WORK_ORDER_TEMPLATES
} from './schema.js'

// Export ข้อมูลและฟังก์ชัน
export {
  WORKORDER_CODE_CONFIG,
  WorkOrderMasterData,
  WorkOrderUtils
} from './data.js'

// Export default
export { default } from './data.js'
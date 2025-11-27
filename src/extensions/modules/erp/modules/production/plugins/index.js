// ==========================================
// Production Module - Index Configuration
// ==========================================

import { TRANSACTION_TYPES, TRANSACTION_STATES } from '../../../core'

// Re-export for components
export { TRANSACTION_TYPES, TRANSACTION_STATES }

// Production States จาก Core
export const PRODUCTION_STATES = TRANSACTION_STATES[TRANSACTION_TYPES.PRODUCTION]

// Production State Labels (Thai)
export const PRODUCTION_STATE_LABELS = {
  'planned': 'วางแผน',
  'released': 'ปล่อยใบสั่งผลิต',
  'in_progress': 'กำลังผลิต',
  'completed': 'ผลิตเสร็จ',
  'closed': 'ปิดงาน'
}

// Production State Colors
export const PRODUCTION_STATE_COLORS = {
  'planned': '#6b7280',
  'released': '#3b82f6',  
  'in_progress': '#f59e0b',
  'completed': '#10b981',
  'closed': '#059669'
}// Production Module Configuration
export const PRODUCTION_MODULE = {
  name: 'production',
  title: 'Production Management',
  description: 'ระบบจัดการการผลิต',
  version: '1.0.0',
  transactionType: TRANSACTION_TYPES.PRODUCTION,
  states: PRODUCTION_STATES,
  stateLabels: PRODUCTION_STATE_LABELS,
  stateColors: PRODUCTION_STATE_COLORS,
  // Export constants for easy access
  PRODUCTION_STATES,
  PRODUCTION_STATE_LABELS,
  PRODUCTION_STATE_COLORS,
  features: {
    bomManagement: true,
    materialConsumption: true,
    finishedGoodsProduction: true,
    inventoryIntegration: true,
    costTracking: true,
    qualityControl: true,
    workOrderTracking: true,
    resourcePlanning: true
  }
}

// BOM Types
export const BOM_TYPES = {
  STANDARD: 'standard',
  ALTERNATIVE: 'alternative',
  PHANTOM: 'phantom'
}

// BOM Type Labels
export const BOM_TYPE_LABELS = {
  [BOM_TYPES.STANDARD]: 'มาตรฐาน',
  [BOM_TYPES.ALTERNATIVE]: 'ทางเลือก',
  [BOM_TYPES.PHANTOM]: 'ชั่วคราว'
}

// Production Order Types
export const PRODUCTION_ORDER_TYPES = {
  MAKE_TO_STOCK: 'make_to_stock',
  MAKE_TO_ORDER: 'make_to_order',
  ASSEMBLY: 'assembly',
  REWORK: 'rework'
}

// Production Order Type Labels
export const PRODUCTION_ORDER_TYPE_LABELS = {
  [PRODUCTION_ORDER_TYPES.MAKE_TO_STOCK]: 'ผลิตเก็บสต๊อก',
  [PRODUCTION_ORDER_TYPES.MAKE_TO_ORDER]: 'ผลิตตามใบสั่ง',
  [PRODUCTION_ORDER_TYPES.ASSEMBLY]: 'ประกอบ',
  [PRODUCTION_ORDER_TYPES.REWORK]: 'ทำใหม่'
}

// Material Consumption Methods
export const CONSUMPTION_METHODS = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  BACKFLUSH: 'backflush'
}

// Consumption Method Labels
export const CONSUMPTION_METHOD_LABELS = {
  [CONSUMPTION_METHODS.MANUAL]: 'แมนนวล',
  [CONSUMPTION_METHODS.AUTOMATIC]: 'อัตโนมัติ',
  [CONSUMPTION_METHODS.BACKFLUSH]: 'ย้อนหลัง'
}

// Quality Control Status
export const QC_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
  REWORK: 'rework'
}

// QC Status Labels
export const QC_STATUS_LABELS = {
  [QC_STATUS.PENDING]: 'รอตรวจสอบ',
  [QC_STATUS.PASSED]: 'ผ่าน',
  [QC_STATUS.FAILED]: 'ไม่ผ่าน',
  [QC_STATUS.REWORK]: 'ต้องทำใหม่'
}

// Default BOM Structure
export const DEFAULT_BOM = {
  id: null,
  bomNumber: '',
  productId: '',
  productName: '',
  productCode: '',
  version: '1.0',
  bomType: BOM_TYPES.STANDARD,
  description: '',
  baseQuantity: 1,
  unitOfMeasure: 'PCS',
  materials: [],
  operations: [],
  totalCost: 0,
  laborCost: 0,
  overheadCost: 0,
  effectiveDate: new Date().toISOString().split('T')[0],
  expiryDate: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Default Production Order Structure
export const DEFAULT_PRODUCTION_ORDER = {
  id: null,
  orderNumber: '',
  bomId: '',
  bomNumber: '',
  productId: '',
  productName: '',
  productCode: '',
  orderType: PRODUCTION_ORDER_TYPES.MAKE_TO_STOCK,
  plannedQuantity: 0,
  producedQuantity: 0,
  scrapQuantity: 0,
  unitOfMeasure: 'PCS',
  state: 'planned',
  priority: 'normal',
  description: '',
  plannedStartDate: new Date().toISOString().split('T')[0],
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: null,
  consumptionMethod: CONSUMPTION_METHODS.AUTOMATIC,
  materialConsumptions: [],
  operations: [],
  qualityChecks: [],
  costs: {
    materialCost: 0,
    laborCost: 0,
    overheadCost: 0,
    totalCost: 0
  },
  notes: '',
  createdBy: '',
  assignedTo: '',
  workCenter: '',
  salesOrderId: null,
  customerRef: '',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stateHistory: []
}

// State Transition Rules
export const STATE_TRANSITIONS = {
  [PRODUCTION_STATES.PLANNED]: [PRODUCTION_STATES.RELEASED],
  [PRODUCTION_STATES.RELEASED]: [PRODUCTION_STATES.IN_PROGRESS, PRODUCTION_STATES.PLANNED],
  [PRODUCTION_STATES.IN_PROGRESS]: [PRODUCTION_STATES.COMPLETED, PRODUCTION_STATES.RELEASED],
  [PRODUCTION_STATES.COMPLETED]: [PRODUCTION_STATES.CLOSED, PRODUCTION_STATES.IN_PROGRESS],
  [PRODUCTION_STATES.CLOSED]: [] // Final state
}

// State Actions
export const STATE_ACTIONS = {
  [PRODUCTION_STATES.PLANNED]: {
    onEnter: [],
    onExit: []
  },
  [PRODUCTION_STATES.RELEASED]: {
    onEnter: ['reserveMaterials', 'validateBOM', 'checkAvailability'],
    onExit: ['unreserveMaterials']
  },
  [PRODUCTION_STATES.IN_PROGRESS]: {
    onEnter: ['consumeMaterials', 'startTimeTracking', 'lockBOM'],
    onExit: ['pauseTimeTracking']
  },
  [PRODUCTION_STATES.COMPLETED]: {
    onEnter: ['receiveFinishedGoods', 'calculateActualCosts', 'runQualityChecks'],
    onExit: ['reverseFinishedGoods']
  },
  [PRODUCTION_STATES.CLOSED]: {
    onEnter: ['finalizeTransaction', 'lockAllChanges', 'updateCosting'],
    onExit: [] // Cannot exit from closed state
  }
}

// Export Components
export { default as ProductionManager } from '../shared/ProductionManager.vue'

// Export Configuration
export default PRODUCTION_MODULE
/**
 * Work Order Transaction Data
 * ข้อมูลหลักและฟังก์ชันสำหรับใบสั่งงาน
 */

import {
  WORK_ORDER_TYPES,
  WORK_ORDER_STATUS,
  PRIORITY_LEVELS,
  JOB_TYPES,
  TASK_STATUS,
  RESOURCE_TYPES,
  TIME_UNITS,
  COST_TYPES,
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

/**
 * Work Order Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Work Order Module
 */
export const WORKORDER_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    workOrder: {
      prefix: 'WO',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // WO202500001
    },
    maintenanceOrder: {
      prefix: 'MO',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // MO20250001
    },
    serviceRequest: {
      prefix: 'SRV',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // SRV20250001
    },
    jobCard: {
      prefix: 'JOB',
      year: true,
      month: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{month}{sequence}' // JOB2025100001
    },
    task: {
      prefix: 'TSK',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // TSK20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'workOrder',
    allowCustomCodes: true,
    validateUniqueCode: true,
    enableResourceTracking: true
  }
}

/**
 * ข้อมูลหลักสำหรับใบสั่งงาน
 */
export const WorkOrderMasterData = {
  // ฟังก์ชันสำหรับ Labels
  getWorkOrderTypeLabel(type) {
    return WORK_ORDER_TYPE_LABELS[type] || type
  },

  getWorkOrderStatusLabel(status) {
    return WORK_ORDER_STATUS_LABELS[status] || status
  },

  getPriorityLevelLabel(priority) {
    return PRIORITY_LEVEL_LABELS[priority] || priority
  },

  getJobTypeLabel(jobType) {
    return JOB_TYPE_LABELS[jobType] || jobType
  },

  getTaskStatusLabel(status) {
    return TASK_STATUS_LABELS[status] || status
  },

  getResourceTypeLabel(resourceType) {
    return RESOURCE_TYPE_LABELS[resourceType] || resourceType
  },

  getTimeUnitLabel(unit) {
    return TIME_UNIT_LABELS[unit] || unit
  },

  getCostTypeLabel(costType) {
    return COST_TYPE_LABELS[costType] || costType
  },

  getHoldReasonLabel(reason) {
    return HOLD_REASON_LABELS[reason] || reason
  },

  getInspectionTypeLabel(type) {
    return INSPECTION_TYPE_LABELS[type] || type
  },

  getInspectionResultLabel(result) {
    return INSPECTION_RESULT_LABELS[result] || result
  },

  // ฟังก์ชันสำหรับ Options
  getWorkOrderTypeOptions() {
    return Object.keys(WORK_ORDER_TYPES).map(key => ({
      value: WORK_ORDER_TYPES[key],
      label: WORK_ORDER_TYPE_LABELS[WORK_ORDER_TYPES[key]],
      key
    }))
  },

  getWorkOrderStatusOptions() {
    return Object.keys(WORK_ORDER_STATUS).map(key => ({
      value: WORK_ORDER_STATUS[key],
      label: WORK_ORDER_STATUS_LABELS[WORK_ORDER_STATUS[key]],
      key
    }))
  },

  getPriorityLevelOptions() {
    return Object.keys(PRIORITY_LEVELS).map(key => ({
      value: PRIORITY_LEVELS[key],
      label: PRIORITY_LEVEL_LABELS[PRIORITY_LEVELS[key]],
      key
    }))
  },

  getJobTypeOptions() {
    return Object.keys(JOB_TYPES).map(key => ({
      value: JOB_TYPES[key],
      label: JOB_TYPE_LABELS[JOB_TYPES[key]],
      key
    }))
  },

  getTaskStatusOptions() {
    return Object.keys(TASK_STATUS).map(key => ({
      value: TASK_STATUS[key],
      label: TASK_STATUS_LABELS[TASK_STATUS[key]],
      key
    }))
  },

  getResourceTypeOptions() {
    return Object.keys(RESOURCE_TYPES).map(key => ({
      value: RESOURCE_TYPES[key],
      label: RESOURCE_TYPE_LABELS[RESOURCE_TYPES[key]],
      key
    }))
  },

  getTimeUnitOptions() {
    return Object.keys(TIME_UNITS).map(key => ({
      value: TIME_UNITS[key],
      label: TIME_UNIT_LABELS[TIME_UNITS[key]],
      key
    }))
  },

  getCostTypeOptions() {
    return Object.keys(COST_TYPES).map(key => ({
      value: COST_TYPES[key],
      label: COST_TYPE_LABELS[COST_TYPES[key]],
      key
    }))
  },

  // ฟังก์ชันสำหรับสร้างเลขที่เอกสาร
  generateDocumentNumber(documentType, sequence, date = new Date()) {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const format = WORK_ORDER_CONFIG.DOCUMENT_NUMBER_FORMAT[documentType.toUpperCase()]
    
    if (!format) {
      throw new Error(`Unsupported document type: ${documentType}`)
    }
    
    return format
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{number:5}', sequence.toString().padStart(5, '0'))
      .replace('{number:6}', sequence.toString().padStart(6, '0'))
      .replace('{number:4}', sequence.toString().padStart(4, '0'))
  },

  generateWorkOrderNumber(sequence, date) {
    return this.generateDocumentNumber('work_order', sequence, date)
  },

  generateTaskNumber(sequence, date) {
    return this.generateDocumentNumber('task', sequence, date)
  },

  generateInspectionNumber(sequence, date) {
    return this.generateDocumentNumber('inspection', sequence, date)
  },

  // ฟังก์ชันคำนวณเวลา
  convertTimeToHours(value, unit) {
    switch (unit) {
      case TIME_UNITS.MINUTES:
        return value / 60
      case TIME_UNITS.HOURS:
        return value
      case TIME_UNITS.DAYS:
        return value * WORK_ORDER_CONFIG.STANDARD_WORK_HOURS
      case TIME_UNITS.WEEKS:
        return value * WORK_ORDER_CONFIG.STANDARD_WORK_HOURS * 5
      default:
        return value
    }
  },

  convertHoursToUnit(hours, unit) {
    switch (unit) {
      case TIME_UNITS.MINUTES:
        return hours * 60
      case TIME_UNITS.HOURS:
        return hours
      case TIME_UNITS.DAYS:
        return hours / WORK_ORDER_CONFIG.STANDARD_WORK_HOURS
      case TIME_UNITS.WEEKS:
        return hours / (WORK_ORDER_CONFIG.STANDARD_WORK_HOURS * 5)
      default:
        return hours
    }
  },

  // ฟังก์ชันคำนวณค่าใช้จ่าย
  calculateLaborCost(hours, rate) {
    return hours * rate
  },

  calculateTotalCost(costs) {
    return costs.reduce((total, cost) => {
      return total + (cost.amount || 0)
    }, 0)
  },

  calculateCostByType(costs) {
    return costs.reduce((summary, cost) => {
      const type = cost.type || COST_TYPES.OTHER
      if (!summary[type]) {
        summary[type] = 0
      }
      summary[type] += cost.amount || 0
      return summary
    }, {})
  },

  // ฟังก์ชันคำนวณ SLA
  calculateSLADeadline(createdDate, priority) {
    const slaHours = WORK_ORDER_CONFIG.SLA_HOURS[priority] || WORK_ORDER_CONFIG.SLA_HOURS[PRIORITY_LEVELS.NORMAL]
    const deadline = new Date(createdDate)
    deadline.setHours(deadline.getHours() + slaHours)
    return deadline
  },

  isSLABreached(createdDate, priority, currentDate = new Date()) {
    const deadline = this.calculateSLADeadline(createdDate, priority)
    return currentDate > deadline
  },

  getSLAStatus(createdDate, priority, currentDate = new Date()) {
    const deadline = this.calculateSLADeadline(createdDate, priority)
    const now = currentDate
    const totalTime = deadline - new Date(createdDate)
    const remainingTime = deadline - now
    
    if (remainingTime <= 0) {
      return {
        status: 'breached',
        percentage: 100,
        remainingHours: 0
      }
    }
    
    const percentage = ((totalTime - remainingTime) / totalTime) * 100
    const remainingHours = Math.ceil(remainingTime / (1000 * 60 * 60))
    
    if (percentage >= 90) {
      return { status: 'critical', percentage, remainingHours }
    } else if (percentage >= 75) {
      return { status: 'warning', percentage, remainingHours }
    } else {
      return { status: 'on_track', percentage, remainingHours }
    }
  },

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  validateWorkOrderData(data) {
    const errors = []
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!data.title || data.title.trim().length === 0) {
      errors.push('กรุณาระบุหัวข้องาน')
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('กรุณาระบุรายละเอียดงาน')
    }
    
    if (!data.assigned_to) {
      errors.push('กรุณาระบุผู้รับผิดชอบ')
    }
    
    if (!data.scheduled_date) {
      errors.push('กรุณาระบุวันที่กำหนดเสร็จ')
    } else {
      const scheduledDate = new Date(data.scheduled_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (scheduledDate < today) {
        errors.push('วันที่กำหนดเสร็จไม่สามารถเป็นวันที่ผ่านมาแล้ว')
      }
    }
    
    // ตรวจสอบประเภทงาน
    if (!Object.values(WORK_ORDER_TYPES).includes(data.type)) {
      errors.push('ประเภทงานไม่ถูกต้อง')
    }
    
    // ตรวจสอบสถานะ
    if (!Object.values(WORK_ORDER_STATUS).includes(data.status)) {
      errors.push('สถานะไม่ถูกต้อง')
    }
    
    // ตรวจสอบระดับความสำคัญ
    if (!Object.values(PRIORITY_LEVELS).includes(data.priority)) {
      errors.push('ระดับความสำคัญไม่ถูกต้อง')
    }
    
    // ตรวจสอบเวลาประมาณ
    if (!data.estimated_hours || data.estimated_hours <= 0) {
      errors.push('กรุณาระบุเวลาประมาณการทำงาน')
    }
    
    // ตรวจสอบงานย่อย (ถ้ามี)
    if (data.tasks && Array.isArray(data.tasks)) {
      data.tasks.forEach((task, index) => {
        if (!task.title || task.title.trim().length === 0) {
          errors.push(`งานย่อยที่ ${index + 1}: กรุณาระบุหัวข้อ`)
        }
        
        if (!task.assigned_to) {
          errors.push(`งานย่อยที่ ${index + 1}: กรุณาระบุผู้รับผิดชอบ`)
        }
        
        if (task.estimated_hours && task.estimated_hours <= 0) {
          errors.push(`งานย่อยที่ ${index + 1}: เวลาประมาณการทำงานไม่ถูกต้อง`)
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // ฟังก์ชันตรวจสอบการเปลี่ยนสถานะ
  canUpdateStatus(currentStatus, newStatus) {
    const validTransitions = {
      [WORK_ORDER_STATUS.DRAFT]: [WORK_ORDER_STATUS.SUBMITTED, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.SUBMITTED]: [WORK_ORDER_STATUS.APPROVED, WORK_ORDER_STATUS.REJECTED, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.APPROVED]: [WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.SCHEDULED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.ON_HOLD, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.IN_PROGRESS]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.ON_HOLD, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.ON_HOLD]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED],
      [WORK_ORDER_STATUS.COMPLETED]: [WORK_ORDER_STATUS.CLOSED],
      [WORK_ORDER_STATUS.CANCELLED]: [],
      [WORK_ORDER_STATUS.REJECTED]: [WORK_ORDER_STATUS.DRAFT],
      [WORK_ORDER_STATUS.CLOSED]: []
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  },

  // ฟังก์ชันตรวจสอบสิทธิ์การอนุมัติ
  getRequiredApprovalLevel(totalCost) {
    if (totalCost <= WORK_ORDER_CONFIG.APPROVAL_LEVELS.SUPERVISOR) {
      return 'SUPERVISOR'
    } else if (totalCost <= WORK_ORDER_CONFIG.APPROVAL_LEVELS.MANAGER) {
      return 'MANAGER'
    } else if (totalCost <= WORK_ORDER_CONFIG.APPROVAL_LEVELS.DIRECTOR) {
      return 'DIRECTOR'
    } else {
      return 'EXECUTIVE'
    }
  },

  // ฟังก์ชันสร้างข้อมูลเริ่มต้น
  createDefaultWorkOrderData(overrides = {}) {
    return {
      ...WORK_ORDER_DEFAULTS,
      created_date: new Date().toISOString().split('T')[0],
      scheduled_date: null,
      tasks: [],
      resources: [],
      costs: [],
      inspections: [],
      timeline: [],
      ...overrides
    }
  },

  // ฟังก์ชันสร้างจากเทมเพลต
  createFromTemplate(templateName, overrides = {}) {
    const template = WORK_ORDER_TEMPLATES[templateName]
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }
    
    const workOrder = this.createDefaultWorkOrderData({
      ...template,
      ...overrides
    })
    
    // สร้างงานย่อยจากเทมเพลต
    if (template.tasks && Array.isArray(template.tasks)) {
      workOrder.tasks = template.tasks.map((taskTitle, index) => ({
        title: taskTitle,
        description: '',
        status: TASK_STATUS.PENDING,
        sequence: index + 1,
        estimated_hours: 0.5,
        assigned_to: null
      }))
    }
    
    return workOrder
  },

  // ฟังก์ชันค้นหาและกรองข้อมูล
  filterWorkOrdersByStatus(workOrders, status) {
    return workOrders.filter(wo => wo.status === status)
  },

  filterWorkOrdersByPriority(workOrders, priority) {
    return workOrders.filter(wo => wo.priority === priority)
  },

  filterWorkOrdersByAssignee(workOrders, assigneeId) {
    return workOrders.filter(wo => wo.assigned_to === assigneeId)
  },

  filterWorkOrdersByDateRange(workOrders, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return workOrders.filter(wo => {
      const scheduledDate = new Date(wo.scheduled_date)
      return scheduledDate >= start && scheduledDate <= end
    })
  },

  filterOverdueWorkOrders(workOrders, currentDate = new Date()) {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false
      const scheduledDate = new Date(wo.scheduled_date)
      return scheduledDate < currentDate && 
             ![WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.CANCELLED, WORK_ORDER_STATUS.CLOSED].includes(wo.status)
    })
  },

  // ฟังก์ชันสำหรับรายงาน
  calculateWorkOrderStats(workOrders) {
    const stats = {
      total: workOrders.length,
      by_status: {},
      by_priority: {},
      by_type: {},
      overdue: 0,
      completed_on_time: 0,
      average_completion_time: 0,
      total_cost: 0,
      total_hours: 0
    }
    
    // นับตามสถานะ
    Object.values(WORK_ORDER_STATUS).forEach(status => {
      stats.by_status[status] = 0
    })
    
    // นับตามความสำคัญ
    Object.values(PRIORITY_LEVELS).forEach(priority => {
      stats.by_priority[priority] = 0
    })
    
    // นับตามประเภท
    Object.values(WORK_ORDER_TYPES).forEach(type => {
      stats.by_type[type] = 0
    })
    
    workOrders.forEach(wo => {
      // นับสถานะ
      stats.by_status[wo.status]++
      
      // นับความสำคัญ
      stats.by_priority[wo.priority]++
      
      // นับประเภท
      stats.by_type[wo.type]++
      
      // นับเกินกำหนด
      if (wo.scheduled_date) {
        const scheduledDate = new Date(wo.scheduled_date)
        const today = new Date()
        if (scheduledDate < today && wo.status !== WORK_ORDER_STATUS.COMPLETED) {
          stats.overdue++
        }
      }
      
      // รวมค่าใช้จ่ายและเวลา
      stats.total_cost += wo.total_cost || 0
      stats.total_hours += wo.actual_hours || wo.estimated_hours || 0
    })
    
    return stats
  },

  // ฟังก์ชันจัดกลุ่มตามผู้รับผิดชอบ
  groupWorkOrdersByAssignee(workOrders) {
    return workOrders.reduce((groups, wo) => {
      const assigneeId = wo.assigned_to || 'unassigned'
      if (!groups[assigneeId]) {
        groups[assigneeId] = {
          assignee_id: assigneeId,
          count: 0,
          total_hours: 0,
          total_cost: 0,
          work_orders: []
        }
      }
      
      groups[assigneeId].count++
      groups[assigneeId].total_hours += wo.estimated_hours || 0
      groups[assigneeId].total_cost += wo.total_cost || 0
      groups[assigneeId].work_orders.push(wo)
      
      return groups
    }, {})
  }
}

// ฟังก์ชันยูทิลิตี้
export const WorkOrderUtils = {
  formatDuration(hours) {
    if (hours < 1) {
      return `${Math.round(hours * 60)} นาที`
    } else if (hours < 8) {
      return `${hours.toFixed(1)} ชั่วโมง`
    } else {
      const days = Math.floor(hours / 8)
      const remainingHours = hours % 8
      if (remainingHours === 0) {
        return `${days} วัน`
      }
      return `${days} วัน ${remainingHours.toFixed(1)} ชั่วโมง`
    }
  },

  formatPriority(priority) {
    const colors = {
      [PRIORITY_LEVELS.LOW]: '#28a745',
      [PRIORITY_LEVELS.NORMAL]: '#17a2b8',
      [PRIORITY_LEVELS.HIGH]: '#ffc107',
      [PRIORITY_LEVELS.URGENT]: '#fd7e14',
      [PRIORITY_LEVELS.CRITICAL]: '#dc3545',
      [PRIORITY_LEVELS.EMERGENCY]: '#6f42c1'
    }
    
    return {
      label: PRIORITY_LEVEL_LABELS[priority] || priority,
      color: colors[priority] || '#6c757d'
    }
  },

  calculateProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0
    
    const completedTasks = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length
    return Math.round((completedTasks / tasks.length) * 100)
  },

  getNextSequence(tasks) {
    if (!tasks || tasks.length === 0) return 1
    
    const maxSequence = Math.max(...tasks.map(task => task.sequence || 0))
    return maxSequence + 1
  },

  generateTaskId(workOrderId, sequence) {
    return `${workOrderId}-T${sequence.toString().padStart(3, '0')}`
  },

  isWorkingHours(date = new Date()) {
    const hour = date.getHours()
    const day = date.getDay()
    
    // วันจันทร์-ศุกร์ 08:00-17:00
    return day >= 1 && day <= 5 && hour >= 8 && hour < 17
  },

  calculateBusinessHours(startDate, endDate) {
    let current = new Date(startDate)
    let hours = 0
    
    while (current < endDate) {
      if (this.isWorkingHours(current)) {
        hours++
      }
      current.setHours(current.getHours() + 1)
    }
    
    return hours
  }
}

export default WorkOrderMasterData
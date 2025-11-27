/**
 * Production Transaction Data
 * ข้อมูลหลักและฟังก์ชันสำหรับการผลิต
 */

import {
  PRODUCTION_TYPES,
  PRODUCTION_STATUS,
  PROCESS_TYPES,
  PROCESS_STATUS,
  PRIORITY_LEVELS,
  QUALITY_CHECK_TYPES,
  MACHINE_TYPES,
  PRODUCTION_UNITS,
  COSTING_METHODS,
  PRODUCTION_TYPE_LABELS,
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_ORDER_STATUS_LABELS,
  PROCESS_TYPE_LABELS,
  PROCESS_STATUS_LABELS,
  PRIORITY_LEVEL_LABELS,
  SCRAP_TYPE_LABELS,
  QUALITY_CHECK_TYPE_LABELS,
  QUALITY_RESULT_LABELS,
  MACHINE_TYPE_LABELS,
  MACHINE_STATUS_LABELS,
  PRODUCTION_UNIT_LABELS,
  COSTING_METHOD_LABELS,
  PRODUCTION_CONFIG,
  PRODUCTION_DEFAULTS,
  PRODUCTION_TEMPLATES
} from './schema.js'

/**
 * Production Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Production Module
 */
export const PRODUCTION_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    productionOrder: {
      prefix: 'MO',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // MO202500001
    },
    bom: {
      prefix: 'BOM',
      year: false,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: false
      },
      format: '{prefix}{sequence}' // BOM0001
    },
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
    qualityControl: {
      prefix: 'QC',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // QC20250001
    },
    batch: {
      prefix: 'BAT',
      year: true,
      month: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{month}{sequence}' // BAT2025100001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'productionOrder',
    allowCustomCodes: true,
    validateUniqueCode: true,
    enableBatchTracking: true
  }
}

/**
 * ข้อมูลหลักสำหรับการผลิต
 */
export const ProductionMasterData = {
  // ฟังก์ชันสำหรับ Labels
  getProductionTypeLabel(type) {
    return PRODUCTION_TYPE_LABELS[type] || type
  },

  getProductionStatusLabel(status) {
    return PRODUCTION_STATUS_LABELS[status] || status
  },

  getProductionOrderStatusLabel(status) {
    return PRODUCTION_ORDER_STATUS_LABELS[status] || status
  },

  getProcessTypeLabel(type) {
    return PROCESS_TYPE_LABELS[type] || type
  },

  getProcessStatusLabel(status) {
    return PROCESS_STATUS_LABELS[status] || status
  },

  getPriorityLevelLabel(priority) {
    return PRIORITY_LEVEL_LABELS[priority] || priority
  },

  getScrapTypeLabel(type) {
    return SCRAP_TYPE_LABELS[type] || type
  },

  getQualityCheckTypeLabel(type) {
    return QUALITY_CHECK_TYPE_LABELS[type] || type
  },

  getQualityResultLabel(result) {
    return QUALITY_RESULT_LABELS[result] || result
  },

  getMachineTypeLabel(type) {
    return MACHINE_TYPE_LABELS[type] || type
  },

  getMachineStatusLabel(status) {
    return MACHINE_STATUS_LABELS[status] || status
  },

  getProductionUnitLabel(unit) {
    return PRODUCTION_UNIT_LABELS[unit] || unit
  },

  getCostingMethodLabel(method) {
    return COSTING_METHOD_LABELS[method] || method
  },

  // ฟังก์ชันสำหรับ Options
  getProductionTypeOptions() {
    return Object.keys(PRODUCTION_TYPES).map(key => ({
      value: PRODUCTION_TYPES[key],
      label: PRODUCTION_TYPE_LABELS[PRODUCTION_TYPES[key]],
      key
    }))
  },

  getProductionStatusOptions() {
    return Object.keys(PRODUCTION_STATUS).map(key => ({
      value: PRODUCTION_STATUS[key],
      label: PRODUCTION_STATUS_LABELS[PRODUCTION_STATUS[key]],
      key
    }))
  },

  getProcessTypeOptions() {
    return Object.keys(PROCESS_TYPES).map(key => ({
      value: PROCESS_TYPES[key],
      label: PROCESS_TYPE_LABELS[PROCESS_TYPES[key]],
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

  getQualityCheckTypeOptions() {
    return Object.keys(QUALITY_CHECK_TYPES).map(key => ({
      value: QUALITY_CHECK_TYPES[key],
      label: QUALITY_CHECK_TYPE_LABELS[QUALITY_CHECK_TYPES[key]],
      key
    }))
  },

  getMachineTypeOptions() {
    return Object.keys(MACHINE_TYPES).map(key => ({
      value: MACHINE_TYPES[key],
      label: MACHINE_TYPE_LABELS[MACHINE_TYPES[key]],
      key
    }))
  },

  getProductionUnitOptions() {
    return Object.keys(PRODUCTION_UNITS).map(key => ({
      value: PRODUCTION_UNITS[key],
      label: PRODUCTION_UNIT_LABELS[PRODUCTION_UNITS[key]],
      key
    }))
  },

  getCostingMethodOptions() {
    return Object.keys(COSTING_METHODS).map(key => ({
      value: COSTING_METHODS[key],
      label: COSTING_METHOD_LABELS[COSTING_METHODS[key]],
      key
    }))
  },

  // ฟังก์ชันสำหรับสร้างเลขที่เอกสาร
  generateDocumentNumber(documentType, sequence, date = new Date()) {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const format = PRODUCTION_CONFIG.DOCUMENT_NUMBER_FORMAT[documentType.toUpperCase()]
    
    if (!format) {
      throw new Error(`Unsupported document type: ${documentType}`)
    }
    
    return format
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{day}', day)
      .replace('{number:5}', sequence.toString().padStart(5, '0'))
      .replace('{number:4}', sequence.toString().padStart(4, '0'))
      .replace('{number:3}', sequence.toString().padStart(3, '0'))
  },

  generateProductionOrderNumber(sequence, date) {
    return this.generateDocumentNumber('production_order', sequence, date)
  },

  generateWorkOrderNumber(sequence, date) {
    return this.generateDocumentNumber('work_order', sequence, date)
  },

  generateBatchNumber(sequence, date) {
    return this.generateDocumentNumber('batch', sequence, date)
  },

  generateLotNumber(sequence, date) {
    return this.generateDocumentNumber('lot', sequence, date)
  },

  generateQualityCheckNumber(sequence, date) {
    return this.generateDocumentNumber('quality_check', sequence, date)
  },

  // ฟังก์ชันคำนวณ OEE (Overall Equipment Effectiveness)
  calculateOEE(availability, performance, quality) {
    return (availability / 100) * (performance / 100) * (quality / 100) * 100
  },

  calculateAvailability(plannedTime, downtime) {
    if (plannedTime <= 0) return 0
    const operatingTime = plannedTime - downtime
    return (operatingTime / plannedTime) * 100
  },

  calculatePerformance(actualOutput, theoreticalOutput) {
    if (theoreticalOutput <= 0) return 0
    return (actualOutput / theoreticalOutput) * 100
  },

  calculateQuality(goodOutput, totalOutput) {
    if (totalOutput <= 0) return 0
    return (goodOutput / totalOutput) * 100
  },

  // ฟังก์ชันคำนวณประสิทธิภาพ
  calculateEfficiency(actualOutput, standardOutput) {
    if (standardOutput <= 0) return 0
    return (actualOutput / standardOutput) * 100
  },

  calculateScrapRate(scrapQuantity, totalQuantity) {
    if (totalQuantity <= 0) return 0
    return (scrapQuantity / totalQuantity) * 100
  },

  calculateYield(outputQuantity, inputQuantity) {
    if (inputQuantity <= 0) return 0
    return (outputQuantity / inputQuantity) * 100
  },

  // ฟังก์ชันคำนวณเวลา
  calculateCycleTime(totalTime, quantity) {
    if (quantity <= 0) return 0
    return totalTime / quantity
  },

  calculateTaktTime(availableTime, customerDemand) {
    if (customerDemand <= 0) return 0
    return availableTime / customerDemand
  },

  calculateLeadTime(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return (end - start) / (1000 * 60 * 60 * 24) // วัน
  },

  // ฟังก์ชันคำนวณต้นทุน
  calculateLaborCost(hours, rate) {
    return hours * rate
  },

  calculateMaterialCost(quantity, unitCost) {
    return quantity * unitCost
  },

  calculateOverheadCost(directCost, overheadRate) {
    return directCost * (overheadRate / 100)
  },

  calculateTotalProductionCost(laborCost, materialCost, overheadCost) {
    return laborCost + materialCost + overheadCost
  },

  calculateUnitCost(totalCost, quantity) {
    if (quantity <= 0) return 0
    return totalCost / quantity
  },

  // ฟังก์ชันคำนวณกำลังการผลิต
  calculateCapacity(machines, hoursPerDay, daysPerWeek, efficiency = 100) {
    return machines * hoursPerDay * daysPerWeek * (efficiency / 100)
  },

  calculateUtilization(actualTime, availableTime) {
    if (availableTime <= 0) return 0
    return (actualTime / availableTime) * 100
  },

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  validateProductionOrderData(data) {
    const errors = []
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!data.product_id) {
      errors.push('กรุณาระบุสินค้าที่จะผลิต')
    }
    
    if (!data.quantity || data.quantity <= 0) {
      errors.push('กรุณาระบุจำนวนที่จะผลิต')
    }
    
    if (!data.planned_start_date) {
      errors.push('กรุณาระบุวันที่เริ่มผลิต')
    }
    
    if (!data.planned_end_date) {
      errors.push('กรุณาระบุวันที่สิ้นสุดการผลิต')
    } else if (data.planned_start_date && new Date(data.planned_end_date) <= new Date(data.planned_start_date)) {
      errors.push('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น')
    }
    
    // ตรวจสอบประเภทการผลิต
    if (!Object.values(PRODUCTION_TYPES).includes(data.type)) {
      errors.push('ประเภทการผลิตไม่ถูกต้อง')
    }
    
    // ตรวจสอบสถานะ
    if (!Object.values(PRODUCTION_STATUS).includes(data.status)) {
      errors.push('สถานะไม่ถูกต้อง')
    }
    
    // ตรวจสอบกระบวนการผลิต
    if (data.processes && Array.isArray(data.processes)) {
      data.processes.forEach((process, index) => {
        if (!process.name || process.name.trim().length === 0) {
          errors.push(`กระบวนการที่ ${index + 1}: กรุณาระบุชื่อกระบวนการ`)
        }
        
        if (!process.duration || process.duration <= 0) {
          errors.push(`กระบวนการที่ ${index + 1}: กรุณาระบุระยะเวลา`)
        }
        
        if (!Object.values(PROCESS_TYPES).includes(process.type)) {
          errors.push(`กระบวนการที่ ${index + 1}: ประเภทกระบวนการไม่ถูกต้อง`)
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
      [PRODUCTION_STATUS.DRAFT]: [PRODUCTION_STATUS.PLANNED, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.PLANNED]: [PRODUCTION_STATUS.SCHEDULED, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.SCHEDULED]: [PRODUCTION_STATUS.RELEASED, PRODUCTION_STATUS.ON_HOLD, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.RELEASED]: [PRODUCTION_STATUS.IN_PROGRESS, PRODUCTION_STATUS.ON_HOLD, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.IN_PROGRESS]: [PRODUCTION_STATUS.QUALITY_CHECK, PRODUCTION_STATUS.COMPLETED, PRODUCTION_STATUS.ON_HOLD, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.ON_HOLD]: [PRODUCTION_STATUS.IN_PROGRESS, PRODUCTION_STATUS.CANCELLED],
      [PRODUCTION_STATUS.QUALITY_CHECK]: [PRODUCTION_STATUS.COMPLETED, PRODUCTION_STATUS.IN_PROGRESS],
      [PRODUCTION_STATUS.COMPLETED]: [PRODUCTION_STATUS.CLOSED],
      [PRODUCTION_STATUS.CANCELLED]: [],
      [PRODUCTION_STATUS.CLOSED]: []
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  },

  // ฟังก์ชันตรวจสอบสิทธิ์การอนุมัติ
  getRequiredApprovalLevel(totalCost) {
    if (totalCost <= PRODUCTION_CONFIG.APPROVAL_LEVELS.SUPERVISOR) {
      return 'SUPERVISOR'
    } else if (totalCost <= PRODUCTION_CONFIG.APPROVAL_LEVELS.MANAGER) {
      return 'MANAGER'
    } else if (totalCost <= PRODUCTION_CONFIG.APPROVAL_LEVELS.DIRECTOR) {
      return 'DIRECTOR'
    } else {
      return 'EXECUTIVE'
    }
  },

  // ฟังก์ชันสร้างข้อมูลเริ่มต้น
  createDefaultProductionOrderData(overrides = {}) {
    return {
      ...PRODUCTION_DEFAULTS,
      created_date: new Date().toISOString().split('T')[0],
      planned_start_date: null,
      planned_end_date: null,
      processes: [],
      materials: [],
      labor: [],
      quality_checks: [],
      costs: [],
      ...overrides
    }
  },

  // ฟังก์ชันสร้างจากเทมเพลต
  createFromTemplate(templateName, overrides = {}) {
    const template = PRODUCTION_TEMPLATES[templateName]
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }
    
    const productionOrder = this.createDefaultProductionOrderData({
      name: template.name,
      type: template.type,
      ...overrides
    })
    
    // สร้างกระบวนการจากเทมเพลต
    if (template.processes && Array.isArray(template.processes)) {
      productionOrder.processes = template.processes.map((process, index) => ({
        ...process,
        sequence: index + 1,
        status: PROCESS_STATUS.PENDING,
        actual_duration: 0,
        setup_time: 0,
        run_time: 0
      }))
    }
    
    return productionOrder
  },

  // ฟังก์ชันค้นหาและกรองข้อมูล
  filterProductionOrdersByStatus(orders, status) {
    return orders.filter(order => order.status === status)
  },

  filterProductionOrdersByPriority(orders, priority) {
    return orders.filter(order => order.priority === priority)
  },

  filterProductionOrdersByProduct(orders, productId) {
    return orders.filter(order => order.product_id === productId)
  },

  filterProductionOrdersByDateRange(orders, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return orders.filter(order => {
      const plannedStart = new Date(order.planned_start_date)
      return plannedStart >= start && plannedStart <= end
    })
  },

  filterOverdueOrders(orders, currentDate = new Date()) {
    return orders.filter(order => {
      if (!order.planned_end_date) return false
      const plannedEnd = new Date(order.planned_end_date)
      return plannedEnd < currentDate && 
             ![PRODUCTION_STATUS.COMPLETED, PRODUCTION_STATUS.CANCELLED, PRODUCTION_STATUS.CLOSED].includes(order.status)
    })
  },

  // ฟังก์ชันสำหรับรายงาน
  calculateProductionStats(orders) {
    const stats = {
      total: orders.length,
      by_status: {},
      by_priority: {},
      by_type: {},
      overdue: 0,
      completed_on_time: 0,
      average_efficiency: 0,
      total_quantity: 0,
      total_cost: 0,
      average_scrap_rate: 0
    }
    
    // นับตามสถานะ
    Object.values(PRODUCTION_STATUS).forEach(status => {
      stats.by_status[status] = 0
    })
    
    // นับตามความสำคัญ
    Object.values(PRIORITY_LEVELS).forEach(priority => {
      stats.by_priority[priority] = 0
    })
    
    // นับตามประเภท
    Object.values(PRODUCTION_TYPES).forEach(type => {
      stats.by_type[type] = 0
    })
    
    let totalEfficiency = 0
    let totalScrapRate = 0
    let efficiencyCount = 0
    let scrapRateCount = 0
    
    orders.forEach(order => {
      // นับสถานะ
      stats.by_status[order.status]++
      
      // นับความสำคัญ
      stats.by_priority[order.priority]++
      
      // นับประเภท
      stats.by_type[order.type]++
      
      // นับเกินกำหนด
      if (order.planned_end_date) {
        const plannedEnd = new Date(order.planned_end_date)
        const today = new Date()
        if (plannedEnd < today && order.status !== PRODUCTION_STATUS.COMPLETED) {
          stats.overdue++
        }
      }
      
      // รวมจำนวนและต้นทุน
      stats.total_quantity += order.quantity || 0
      stats.total_cost += order.total_cost || 0
      
      // คำนวณประสิทธิภาพเฉลี่ย
      if (order.efficiency) {
        totalEfficiency += order.efficiency
        efficiencyCount++
      }
      
      // คำนวณอัตราของเสียเฉลี่ย
      if (order.scrap_rate !== undefined) {
        totalScrapRate += order.scrap_rate
        scrapRateCount++
      }
    })
    
    // คำนวณค่าเฉลี่ย
    stats.average_efficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0
    stats.average_scrap_rate = scrapRateCount > 0 ? totalScrapRate / scrapRateCount : 0
    
    return stats
  },

  // ฟังก์ชันจัดกลุ่มตามผลิตภัณฑ์
  groupOrdersByProduct(orders) {
    return orders.reduce((groups, order) => {
      const productId = order.product_id || 'unknown'
      if (!groups[productId]) {
        groups[productId] = {
          product_id: productId,
          count: 0,
          total_quantity: 0,
          total_cost: 0,
          orders: []
        }
      }
      
      groups[productId].count++
      groups[productId].total_quantity += order.quantity || 0
      groups[productId].total_cost += order.total_cost || 0
      groups[productId].orders.push(order)
      
      return groups
    }, {})
  },

  // ฟังก์ชันคำนวณแผนการผลิต
  calculateProductionSchedule(orders, workHoursPerDay = 8) {
    const schedule = []
    let currentDate = new Date()
    
    // เรียงลำดับตามความสำคัญและวันที่กำหนด
    const sortedOrders = orders.sort((a, b) => {
      const priorityOrder = {
        [PRIORITY_LEVELS.CRITICAL]: 5,
        [PRIORITY_LEVELS.URGENT]: 4,
        [PRIORITY_LEVELS.HIGH]: 3,
        [PRIORITY_LEVELS.NORMAL]: 2,
        [PRIORITY_LEVELS.LOW]: 1
      }
      
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(a.planned_end_date) - new Date(b.planned_end_date)
    })
    
    sortedOrders.forEach(order => {
      const totalHours = order.processes?.reduce((sum, process) => sum + (process.duration || 0), 0) || 1
      const days = Math.ceil(totalHours / workHoursPerDay)
      
      const startDate = new Date(currentDate)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + days)
      
      schedule.push({
        order_id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        scheduled_start: startDate,
        scheduled_end: endDate,
        total_hours: totalHours,
        days_required: days
      })
      
      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1) // เผื่อเวลาเปลี่ยนงาน
    })
    
    return schedule
  }
}

// ฟังก์ชันยูทิลิตี้
export const ProductionUtils = {
  formatEfficiency(efficiency) {
    return `${efficiency.toFixed(1)}%`
  },

  formatScrapRate(scrapRate) {
    return `${scrapRate.toFixed(2)}%`
  },

  formatOEE(oee) {
    const level = oee >= 85 ? 'ดีเยี่ยม' : oee >= 65 ? 'ดี' : oee >= 40 ? 'ปานกลาง' : 'ต้องปรับปรุง'
    return `${oee.toFixed(1)}% (${level})`
  },

  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} นาที`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours} ชั่วโมง ${remainingMinutes} นาที` : `${hours} ชั่วโมง`
    } else {
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      return remainingHours > 0 ? `${days} วัน ${remainingHours} ชั่วโมง` : `${days} วัน`
    }
  },

  calculateProgressPercentage(completedProcesses, totalProcesses) {
    if (totalProcesses === 0) return 0
    return Math.round((completedProcesses / totalProcesses) * 100)
  },

  getStatusColor(status) {
    const colors = {
      [PRODUCTION_STATUS.DRAFT]: '#6c757d',
      [PRODUCTION_STATUS.PLANNED]: '#17a2b8',
      [PRODUCTION_STATUS.SCHEDULED]: '#007bff',
      [PRODUCTION_STATUS.RELEASED]: '#28a745',
      [PRODUCTION_STATUS.IN_PROGRESS]: '#ffc107',
      [PRODUCTION_STATUS.ON_HOLD]: '#fd7e14',
      [PRODUCTION_STATUS.COMPLETED]: '#28a745',
      [PRODUCTION_STATUS.CANCELLED]: '#dc3545',
      [PRODUCTION_STATUS.CLOSED]: '#6c757d',
      [PRODUCTION_STATUS.QUALITY_CHECK]: '#6f42c1'
    }
    
    return colors[status] || '#6c757d'
  },

  getPriorityColor(priority) {
    const colors = {
      [PRIORITY_LEVELS.LOW]: '#28a745',
      [PRIORITY_LEVELS.NORMAL]: '#17a2b8',
      [PRIORITY_LEVELS.HIGH]: '#ffc107',
      [PRIORITY_LEVELS.URGENT]: '#fd7e14',
      [PRIORITY_LEVELS.CRITICAL]: '#dc3545'
    }
    
    return colors[priority] || '#6c757d'
  },

  isOverdue(plannedEndDate, currentDate = new Date()) {
    if (!plannedEndDate) return false
    return new Date(plannedEndDate) < currentDate
  },

  getDaysOverdue(plannedEndDate, currentDate = new Date()) {
    if (!plannedEndDate) return 0
    const planned = new Date(plannedEndDate)
    const current = new Date(currentDate)
    const diffTime = current - planned
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  },

  calculateWorkingDays(startDate, endDate) {
    let count = 0
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // ไม่ใช่วันเสาร์-อาทิตย์
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }
}

export default ProductionMasterData
/**
 * Returns Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Returns
 */

/**
 * Returns Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Returns Module
 */
export const RETURNS_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    salesReturn: {
      prefix: 'RTN',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // RTN202500001
    },
    purchaseReturn: {
      prefix: 'PRT',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PRT20250001
    },
    warranty: {
      prefix: 'WAR',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // WAR20250001
    },
    rma: {
      prefix: 'RMA',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // RMA202500001
    },
    exchange: {
      prefix: 'EXC',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // EXC20250001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'salesReturn',
    allowCustomCodes: true,
    validateUniqueCode: true,
    requireReasonCode: true
  }
}

// Default Values - ค่าเริ่มต้น

import {
  RETURN_TYPES,
  RETURN_STATUS,
  RETURN_REASONS,
  RETURN_CONDITIONS,
  RETURN_ACTIONS,
  COMPENSATION_TYPES,
  PRIORITY_LEVELS,
  INSPECTION_RESULTS,
  RETURN_CHANNELS,
  REFUND_METHODS,
  RETURN_TYPE_LABELS,
  RETURN_STATUS_LABELS,
  RETURN_REASON_LABELS,
  RETURN_CONDITION_LABELS,
  RETURN_ACTION_LABELS,
  COMPENSATION_TYPE_LABELS,
  PRIORITY_LEVEL_LABELS,
  INSPECTION_RESULT_LABELS,
  RETURN_CHANNEL_LABELS,
  COST_TYPE_LABELS,
  REFUND_STATUS_LABELS,
  REFUND_METHOD_LABELS,
  RETURN_CONFIG,
  RETURN_DEFAULTS,
  RETURN_TEMPLATES
} from './schema.js'

/**
 * ข้อมูลหลักสำหรับการคืนสินค้า
 */
export const ReturnsMasterData = {
  // ฟังก์ชันสำหรับ Labels
  getReturnTypeLabel(type) {
    return RETURN_TYPE_LABELS[type] || type
  },

  getReturnStatusLabel(status) {
    return RETURN_STATUS_LABELS[status] || status
  },

  getReturnReasonLabel(reason) {
    return RETURN_REASON_LABELS[reason] || reason
  },

  getReturnConditionLabel(condition) {
    return RETURN_CONDITION_LABELS[condition] || condition
  },

  getReturnActionLabel(action) {
    return RETURN_ACTION_LABELS[action] || action
  },

  getCompensationTypeLabel(type) {
    return COMPENSATION_TYPE_LABELS[type] || type
  },

  getPriorityLevelLabel(priority) {
    return PRIORITY_LEVEL_LABELS[priority] || priority
  },

  getInspectionResultLabel(result) {
    return INSPECTION_RESULT_LABELS[result] || result
  },

  getReturnChannelLabel(channel) {
    return RETURN_CHANNEL_LABELS[channel] || channel
  },

  getCostTypeLabel(costType) {
    return COST_TYPE_LABELS[costType] || costType
  },

  getRefundStatusLabel(status) {
    return REFUND_STATUS_LABELS[status] || status
  },

  getRefundMethodLabel(method) {
    return REFUND_METHOD_LABELS[method] || method
  },

  // ฟังก์ชันสำหรับ Options
  getReturnTypeOptions() {
    return Object.keys(RETURN_TYPES).map(key => ({
      value: RETURN_TYPES[key],
      label: RETURN_TYPE_LABELS[RETURN_TYPES[key]],
      key
    }))
  },

  getReturnStatusOptions() {
    return Object.keys(RETURN_STATUS).map(key => ({
      value: RETURN_STATUS[key],
      label: RETURN_STATUS_LABELS[RETURN_STATUS[key]],
      key
    }))
  },

  getReturnReasonOptions() {
    return Object.keys(RETURN_REASONS).map(key => ({
      value: RETURN_REASONS[key],
      label: RETURN_REASON_LABELS[RETURN_REASONS[key]],
      key
    }))
  },

  getReturnConditionOptions() {
    return Object.keys(RETURN_CONDITIONS).map(key => ({
      value: RETURN_CONDITIONS[key],
      label: RETURN_CONDITION_LABELS[RETURN_CONDITIONS[key]],
      key
    }))
  },

  getReturnActionOptions() {
    return Object.keys(RETURN_ACTIONS).map(key => ({
      value: RETURN_ACTIONS[key],
      label: RETURN_ACTION_LABELS[RETURN_ACTIONS[key]],
      key
    }))
  },

  getCompensationTypeOptions() {
    return Object.keys(COMPENSATION_TYPES).map(key => ({
      value: COMPENSATION_TYPES[key],
      label: COMPENSATION_TYPE_LABELS[COMPENSATION_TYPES[key]],
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

  getReturnChannelOptions() {
    return Object.keys(RETURN_CHANNELS).map(key => ({
      value: RETURN_CHANNELS[key],
      label: RETURN_CHANNEL_LABELS[RETURN_CHANNELS[key]],
      key
    }))
  },

  getRefundMethodOptions() {
    return Object.keys(REFUND_METHODS).map(key => ({
      value: REFUND_METHODS[key],
      label: REFUND_METHOD_LABELS[REFUND_METHODS[key]],
      key
    }))
  },

  // ฟังก์ชันสำหรับสร้างเลขที่เอกสาร
  generateDocumentNumber(documentType, sequence, date = new Date()) {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const format = RETURN_CONFIG.DOCUMENT_NUMBER_FORMAT[documentType.toUpperCase()]
    
    if (!format) {
      throw new Error(`Unsupported document type: ${documentType}`)
    }
    
    return format
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{number:5}', sequence.toString().padStart(5, '0'))
  },

  generateReturnRequestNumber(sequence, date) {
    return this.generateDocumentNumber('return_request', sequence, date)
  },

  generateReturnAuthorizationNumber(sequence, date) {
    return this.generateDocumentNumber('return_authorization', sequence, date)
  },

  generateCreditNoteNumber(sequence, date) {
    return this.generateDocumentNumber('credit_note', sequence, date)
  },

  generateRefundNumber(sequence, date) {
    return this.generateDocumentNumber('refund', sequence, date)
  },

  // ฟังก์ชันตรวจสอบระยะเวลาการคืนสินค้า
  isWithinReturnPeriod(purchaseDate, productCategory, currentDate = new Date()) {
    const purchase = new Date(purchaseDate)
    const current = new Date(currentDate)
    const daysDiff = Math.floor((current - purchase) / (1000 * 60 * 60 * 24))
    
    const returnPeriod = RETURN_CONFIG.RETURN_PERIODS[productCategory] || RETURN_CONFIG.RETURN_PERIODS.STANDARD
    
    return daysDiff <= returnPeriod
  },

  getRemainingReturnDays(purchaseDate, productCategory, currentDate = new Date()) {
    const purchase = new Date(purchaseDate)
    const current = new Date(currentDate)
    const daysDiff = Math.floor((current - purchase) / (1000 * 60 * 60 * 24))
    
    const returnPeriod = RETURN_CONFIG.RETURN_PERIODS[productCategory] || RETURN_CONFIG.RETURN_PERIODS.STANDARD
    
    return Math.max(0, returnPeriod - daysDiff)
  },

  // ฟังก์ชันคำนวณค่าธรรมเนียม
  calculateRestockingFee(originalAmount, condition, customPercentage = null) {
    let feePercentage = customPercentage
    
    if (feePercentage === null) {
      switch (condition) {
        case RETURN_CONDITIONS.NEW:
          feePercentage = RETURN_CONFIG.RESTOCKING_FEES.STANDARD
          break
        case RETURN_CONDITIONS.OPENED:
          feePercentage = RETURN_CONFIG.RESTOCKING_FEES.OPENED
          break
        case RETURN_CONDITIONS.USED:
          feePercentage = RETURN_CONFIG.RESTOCKING_FEES.USED
          break
        default:
          feePercentage = RETURN_CONFIG.RESTOCKING_FEES.STANDARD
      }
    }
    
    return originalAmount * (feePercentage / 100)
  },

  calculateRefundAmount(originalAmount, restockingFee = 0, shippingCost = 0, otherDeductions = 0) {
    return Math.max(0, originalAmount - restockingFee - shippingCost - otherDeductions)
  },

  calculateReturnCost(items, shippingCost = 0, processingCost = 0) {
    const itemsCost = items.reduce((total, item) => {
      return total + ((item.unit_price || 0) * (item.quantity || 0))
    }, 0)
    
    return itemsCost + shippingCost + processingCost
  },

  // ฟังก์ชันคำนวณเวลาดำเนินการ
  calculateExpectedCompletionDate(status, startDate = new Date()) {
    const start = new Date(startDate)
    const processingDays = RETURN_CONFIG.PROCESSING_TIMES[status] || 1
    
    const completionDate = new Date(start)
    completionDate.setDate(completionDate.getDate() + processingDays)
    
    return completionDate
  },

  calculateTotalProcessingTime(currentStatus) {
    const statusOrder = [
      RETURN_STATUS.REQUESTED,
      RETURN_STATUS.APPROVED,
      RETURN_STATUS.RECEIVED,
      RETURN_STATUS.INSPECTED,
      RETURN_STATUS.PROCESSED
    ]
    
    const currentIndex = statusOrder.indexOf(currentStatus)
    if (currentIndex === -1) return 0
    
    let totalDays = 0
    for (let i = 0; i <= currentIndex; i++) {
      totalDays += RETURN_CONFIG.PROCESSING_TIMES[statusOrder[i]] || 1
    }
    
    return totalDays
  },

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  validateReturnData(data) {
    const errors = []
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!data.customer_id) {
      errors.push('กรุณาระบุลูกค้า')
    }
    
    if (!data.original_order_id) {
      errors.push('กรุณาระบุเลขที่ใบสั่งซื้อเดิม')
    }
    
    if (!data.reason) {
      errors.push('กรุณาระบุสาเหตุการคืนสินค้า')
    }
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('กรุณาระบุรายการสินค้าที่ต้องการคืน')
    } else {
      // ตรวจสอบรายการสินค้า
      data.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุสินค้า`)
        }
        
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนที่ถูกต้อง`)
        }
        
        if (!item.condition) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุสภาพสินค้า`)
        }
      })
    }
    
    // ตรวจสอบประเภทการคืนสินค้า
    if (!Object.values(RETURN_TYPES).includes(data.type)) {
      errors.push('ประเภทการคืนสินค้าไม่ถูกต้อง')
    }
    
    // ตรวจสอบสถานะ
    if (!Object.values(RETURN_STATUS).includes(data.status)) {
      errors.push('สถานะไม่ถูกต้อง')
    }
    
    // ตรวจสอบสาเหตุ
    if (!Object.values(RETURN_REASONS).includes(data.reason)) {
      errors.push('สาเหตุการคืนสินค้าไม่ถูกต้อง')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // ฟังก์ชันตรวจสอบการเปลี่ยนสถานะ
  canUpdateStatus(currentStatus, newStatus) {
    const validTransitions = {
      [RETURN_STATUS.REQUESTED]: [RETURN_STATUS.APPROVED, RETURN_STATUS.REJECTED, RETURN_STATUS.CANCELLED],
      [RETURN_STATUS.APPROVED]: [RETURN_STATUS.IN_TRANSIT, RETURN_STATUS.RECEIVED, RETURN_STATUS.CANCELLED],
      [RETURN_STATUS.REJECTED]: [],
      [RETURN_STATUS.IN_TRANSIT]: [RETURN_STATUS.RECEIVED, RETURN_STATUS.CANCELLED],
      [RETURN_STATUS.RECEIVED]: [RETURN_STATUS.INSPECTED, RETURN_STATUS.ON_HOLD],
      [RETURN_STATUS.INSPECTED]: [RETURN_STATUS.PROCESSED, RETURN_STATUS.ON_HOLD],
      [RETURN_STATUS.PROCESSED]: [RETURN_STATUS.COMPLETED],
      [RETURN_STATUS.COMPLETED]: [],
      [RETURN_STATUS.CANCELLED]: [],
      [RETURN_STATUS.ON_HOLD]: [RETURN_STATUS.INSPECTED, RETURN_STATUS.PROCESSED, RETURN_STATUS.CANCELLED]
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  },

  // ฟังก์ชันตรวจสอบสิทธิ์การอนุมัติ
  getRequiredApprovalLevel(totalAmount) {
    if (totalAmount <= RETURN_CONFIG.APPROVAL_LEVELS.SUPERVISOR) {
      return 'SUPERVISOR'
    } else if (totalAmount <= RETURN_CONFIG.APPROVAL_LEVELS.MANAGER) {
      return 'MANAGER'
    } else if (totalAmount <= RETURN_CONFIG.APPROVAL_LEVELS.DIRECTOR) {
      return 'DIRECTOR'
    } else {
      return 'EXECUTIVE'
    }
  },

  // ฟังก์ชันแนะนำการดำเนินการ
  suggestReturnAction(reason, condition, inspectionResult) {
    // ตามสาเหตุ
    if (reason === RETURN_REASONS.DEFECTIVE || reason === RETURN_REASONS.DAMAGED) {
      if (condition === RETURN_CONDITIONS.REPAIRABLE) {
        return RETURN_ACTIONS.REPAIR
      } else {
        return RETURN_ACTIONS.DISPOSE
      }
    }
    
    if (reason === RETURN_REASONS.WRONG_ITEM) {
      return RETURN_ACTIONS.EXCHANGE
    }
    
    if (reason === RETURN_REASONS.CUSTOMER_CHANGED_MIND) {
      if (condition === RETURN_CONDITIONS.NEW) {
        return RETURN_ACTIONS.RESTOCK
      } else {
        return RETURN_ACTIONS.REFURBISH
      }
    }
    
    // ตามสภาพสินค้า
    if (condition === RETURN_CONDITIONS.NEW) {
      return RETURN_ACTIONS.RESTOCK
    } else if (condition === RETURN_CONDITIONS.USED && inspectionResult === INSPECTION_RESULTS.ACCEPTABLE) {
      return RETURN_ACTIONS.REFURBISH
    } else if (condition === RETURN_CONDITIONS.DEFECTIVE) {
      return RETURN_ACTIONS.RETURN_TO_VENDOR
    } else {
      return RETURN_ACTIONS.DISPOSE
    }
  },

  // ฟังก์ชันสร้างข้อมูลเริ่มต้น
  createDefaultReturnData(overrides = {}) {
    return {
      ...RETURN_DEFAULTS,
      return_date: new Date().toISOString().split('T')[0],
      expected_completion_date: this.calculateExpectedCompletionDate(RETURN_STATUS.REQUESTED).toISOString().split('T')[0],
      items: [],
      costs: [],
      timeline: [],
      ...overrides
    }
  },

  // ฟังก์ชันสร้างจากเทมเพลต
  createFromTemplate(templateName, overrides = {}) {
    const template = RETURN_TEMPLATES[templateName]
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }
    
    return this.createDefaultReturnData({
      ...template,
      ...overrides
    })
  },

  // ฟังก์ชันค้นหาและกรองข้อมูล
  filterReturnsByStatus(returns, status) {
    return returns.filter(returnItem => returnItem.status === status)
  },

  filterReturnsByReason(returns, reason) {
    return returns.filter(returnItem => returnItem.reason === reason)
  },

  filterReturnsByCustomer(returns, customerId) {
    return returns.filter(returnItem => returnItem.customer_id === customerId)
  },

  filterReturnsByDateRange(returns, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return returns.filter(returnItem => {
      const returnDate = new Date(returnItem.return_date)
      return returnDate >= start && returnDate <= end
    })
  },

  filterOverdueReturns(returns, currentDate = new Date()) {
    return returns.filter(returnItem => {
      if (!returnItem.expected_completion_date) return false
      const expectedDate = new Date(returnItem.expected_completion_date)
      return expectedDate < currentDate && 
             ![RETURN_STATUS.COMPLETED, RETURN_STATUS.CANCELLED].includes(returnItem.status)
    })
  },

  // ฟังก์ชันสำหรับรายงาน
  calculateReturnStats(returns) {
    const stats = {
      total: returns.length,
      by_status: {},
      by_reason: {},
      by_type: {},
      by_compensation: {},
      total_amount: 0,
      total_refund: 0,
      total_restocking_fees: 0,
      average_processing_time: 0,
      overdue: 0
    }
    
    // นับตามสถานะ
    Object.values(RETURN_STATUS).forEach(status => {
      stats.by_status[status] = 0
    })
    
    // นับตามสาเหตุ
    Object.values(RETURN_REASONS).forEach(reason => {
      stats.by_reason[reason] = 0
    })
    
    // นับตามประเภท
    Object.values(RETURN_TYPES).forEach(type => {
      stats.by_type[type] = 0
    })
    
    // นับตามการชดเชย
    Object.values(COMPENSATION_TYPES).forEach(compensation => {
      stats.by_compensation[compensation] = 0
    })
    
    let totalProcessingTime = 0
    let completedReturns = 0
    
    returns.forEach(returnItem => {
      // นับสถานะ
      stats.by_status[returnItem.status]++
      
      // นับสาเหตุ
      stats.by_reason[returnItem.reason]++
      
      // นับประเภท
      stats.by_type[returnItem.type]++
      
      // นับการชดเชย
      stats.by_compensation[returnItem.compensation_type]++
      
      // รวมยอดเงิน
      stats.total_amount += returnItem.total_amount || 0
      stats.total_refund += returnItem.refund_amount || 0
      stats.total_restocking_fees += returnItem.restocking_fee || 0
      
      // คำนวณเวลาดำเนินการเฉลี่ย
      if (returnItem.status === RETURN_STATUS.COMPLETED && returnItem.return_date && returnItem.completion_date) {
        const returnDate = new Date(returnItem.return_date)
        const completionDate = new Date(returnItem.completion_date)
        const processingTime = (completionDate - returnDate) / (1000 * 60 * 60 * 24) // วัน
        totalProcessingTime += processingTime
        completedReturns++
      }
      
      // นับเกินกำหนด
      if (returnItem.expected_completion_date) {
        const expectedDate = new Date(returnItem.expected_completion_date)
        const today = new Date()
        if (expectedDate < today && ![RETURN_STATUS.COMPLETED, RETURN_STATUS.CANCELLED].includes(returnItem.status)) {
          stats.overdue++
        }
      }
    })
    
    // คำนวณเวลาดำเนินการเฉลี่ย
    stats.average_processing_time = completedReturns > 0 ? totalProcessingTime / completedReturns : 0
    
    return stats
  },

  // ฟังก์ชันจัดกลุ่มตามลูกค้า
  groupReturnsByCustomer(returns) {
    return returns.reduce((groups, returnItem) => {
      const customerId = returnItem.customer_id || 'unknown'
      if (!groups[customerId]) {
        groups[customerId] = {
          customer_id: customerId,
          count: 0,
          total_amount: 0,
          total_refund: 0,
          returns: []
        }
      }
      
      groups[customerId].count++
      groups[customerId].total_amount += returnItem.total_amount || 0
      groups[customerId].total_refund += returnItem.refund_amount || 0
      groups[customerId].returns.push(returnItem)
      
      return groups
    }, {})
  },

  // ฟังก์ชันจัดกลุ่มตามสินค้า
  groupReturnsByProduct(returns) {
    const productGroups = {}
    
    returns.forEach(returnItem => {
      if (returnItem.items && Array.isArray(returnItem.items)) {
        returnItem.items.forEach(item => {
          const productId = item.product_id || 'unknown'
          if (!productGroups[productId]) {
            productGroups[productId] = {
              product_id: productId,
              return_count: 0,
              total_quantity: 0,
              reasons: {},
              conditions: {}
            }
          }
          
          productGroups[productId].return_count++
          productGroups[productId].total_quantity += item.quantity || 0
          
          // นับสาเหตุ
          const reason = returnItem.reason || 'unknown'
          productGroups[productId].reasons[reason] = (productGroups[productId].reasons[reason] || 0) + 1
          
          // นับสภาพ
          const condition = item.condition || 'unknown'
          productGroups[productId].conditions[condition] = (productGroups[productId].conditions[condition] || 0) + 1
        })
      }
    })
    
    return productGroups
  }
}

// ฟังก์ชันยูทิลิตี้
export const ReturnsUtils = {
  formatReturnPeriod(days) {
    if (days === 0) {
      return 'หมดเวลาคืนสินค้าแล้ว'
    } else if (days === 1) {
      return 'เหลือ 1 วัน'
    } else {
      return `เหลือ ${days} วัน`
    }
  },

  getStatusColor(status) {
    const colors = {
      [RETURN_STATUS.REQUESTED]: '#17a2b8',
      [RETURN_STATUS.APPROVED]: '#28a745',
      [RETURN_STATUS.REJECTED]: '#dc3545',
      [RETURN_STATUS.IN_TRANSIT]: '#ffc107',
      [RETURN_STATUS.RECEIVED]: '#007bff',
      [RETURN_STATUS.INSPECTED]: '#6f42c1',
      [RETURN_STATUS.PROCESSED]: '#fd7e14',
      [RETURN_STATUS.COMPLETED]: '#28a745',
      [RETURN_STATUS.CANCELLED]: '#6c757d',
      [RETURN_STATUS.ON_HOLD]: '#fd7e14'
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

  isOverdue(expectedDate, currentDate = new Date()) {
    if (!expectedDate) return false
    return new Date(expectedDate) < currentDate
  },

  getDaysOverdue(expectedDate, currentDate = new Date()) {
    if (!expectedDate) return 0
    const expected = new Date(expectedDate)
    const current = new Date(currentDate)
    const diffTime = current - expected
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  },

  calculateReturnRate(totalReturns, totalSales) {
    if (totalSales === 0) return 0
    return (totalReturns / totalSales) * 100
  },

  generateReturnSummary(returnData) {
    const items = returnData.items || []
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0)
    
    return {
      return_number: returnData.return_number,
      customer_id: returnData.customer_id,
      total_items: items.length,
      total_quantity: totalQuantity,
      total_value: totalValue,
      reason: returnData.reason,
      status: returnData.status,
      return_date: returnData.return_date
    }
  }
}

export default ReturnsMasterData
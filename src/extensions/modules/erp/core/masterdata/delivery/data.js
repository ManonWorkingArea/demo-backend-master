/**
 * Delivery Transaction Data
 * ข้อมูลหลักและฟังก์ชันสำหรับการจัดส่ง
 */

import {
  DELIVERY_TYPES,
  DELIVERY_STATUS,
  SHIPPING_METHODS,
  VEHICLE_TYPES,
  PRIORITY_LEVELS,
  DELIVERY_ZONES,
  TIME_SLOTS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  VEHICLE_TYPE_LABELS,
  PRIORITY_LEVEL_LABELS,
  DELIVERY_ZONE_LABELS,
  FAILURE_REASON_LABELS,
  TIME_SLOT_LABELS,
  DELIVERY_CONFIG,
  DELIVERY_DEFAULTS
} from './schema.js'

/**
 * Delivery Module Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Delivery Module
 */
export const DELIVERY_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    deliveryOrder: {
      prefix: 'DO',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // DO202500001
    },
    deliveryNote: {
      prefix: 'DN',
      year: true,
      sequence: {
        digits: 5,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // DN202500001
    },
    pickingList: {
      prefix: 'PL',
      year: true,
      sequence: {
        digits: 4,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // PL20250001
    },
    shippingLabel: {
      prefix: 'SL',
      year: true,
      month: true,
      sequence: {
        digits: 3,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{month}{sequence}' // SL2025100001
    },
    trackingNumber: {
      prefix: 'TRK',
      year: true,
      sequence: {
        digits: 6,
        start: 1,
        resetOnYearChange: true
      },
      format: '{prefix}{year}{sequence}' // TRK2025000001
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'deliveryOrder',
    allowCustomCodes: true,
    validateUniqueCode: true,
    enableTrackingIntegration: true
  }
}

/**
 * ข้อมูลหลักสำหรับการจัดส่ง
 */
export const DeliveryMasterData = {
  // ฟังก์ชันสำหรับ Labels
  getDeliveryTypeLabel(type) {
    return DELIVERY_TYPE_LABELS[type] || type
  },

  getDeliveryStatusLabel(status) {
    return DELIVERY_STATUS_LABELS[status] || status
  },

  getShippingMethodLabel(method) {
    return SHIPPING_METHOD_LABELS[method] || method
  },

  getVehicleTypeLabel(vehicleType) {
    return VEHICLE_TYPE_LABELS[vehicleType] || vehicleType
  },

  getPriorityLevelLabel(priority) {
    return PRIORITY_LEVEL_LABELS[priority] || priority
  },

  getDeliveryZoneLabel(zone) {
    return DELIVERY_ZONE_LABELS[zone] || zone
  },

  getFailureReasonLabel(reason) {
    return FAILURE_REASON_LABELS[reason] || reason
  },

  getTimeSlotLabel(timeSlot) {
    return TIME_SLOT_LABELS[timeSlot] || timeSlot
  },

  // ฟังก์ชันสำหรับ Options
  getDeliveryTypeOptions() {
    return Object.keys(DELIVERY_TYPES).map(key => ({
      value: DELIVERY_TYPES[key],
      label: DELIVERY_TYPE_LABELS[DELIVERY_TYPES[key]],
      key
    }))
  },

  getDeliveryStatusOptions() {
    return Object.keys(DELIVERY_STATUS).map(key => ({
      value: DELIVERY_STATUS[key],
      label: DELIVERY_STATUS_LABELS[DELIVERY_STATUS[key]],
      key
    }))
  },

  getShippingMethodOptions() {
    return Object.keys(SHIPPING_METHODS).map(key => ({
      value: SHIPPING_METHODS[key],
      label: SHIPPING_METHOD_LABELS[SHIPPING_METHODS[key]],
      key
    }))
  },

  getVehicleTypeOptions() {
    return Object.keys(VEHICLE_TYPES).map(key => ({
      value: VEHICLE_TYPES[key],
      label: VEHICLE_TYPE_LABELS[VEHICLE_TYPES[key]],
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

  getDeliveryZoneOptions() {
    return Object.keys(DELIVERY_ZONES).map(key => ({
      value: DELIVERY_ZONES[key],
      label: DELIVERY_ZONE_LABELS[DELIVERY_ZONES[key]],
      key
    }))
  },

  getTimeSlotOptions() {
    return Object.keys(TIME_SLOTS).map(key => ({
      value: TIME_SLOTS[key],
      label: TIME_SLOT_LABELS[TIME_SLOTS[key]],
      key
    }))
  },

  // ฟังก์ชันสำหรับสร้างเลขที่เอกสาร
  generateDocumentNumber(documentType, sequence, date = new Date()) {
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const format = DELIVERY_CONFIG.DOCUMENT_NUMBER_FORMAT[documentType.toUpperCase()]
    
    if (!format) {
      throw new Error(`Unsupported document type: ${documentType}`)
    }
    
    return format
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{day}', day)
      .replace('{number:4}', sequence.toString().padStart(4, '0'))
      .replace('{number:6}', sequence.toString().padStart(6, '0'))
      .replace('{number:3}', sequence.toString().padStart(3, '0'))
  },

  generateDeliveryNoteNumber(sequence, date) {
    return this.generateDocumentNumber('delivery_note', sequence, date)
  },

  generateTrackingNumber(sequence, date) {
    return this.generateDocumentNumber('tracking', sequence, date)
  },

  generateRouteNumber(sequence, date) {
    return this.generateDocumentNumber('route', sequence, date)
  },

  // ฟังก์ชันคำนวณค่าจัดส่ง
  calculateShippingCost(zone, weight, deliveryType, distance = 0) {
    let baseCost = DELIVERY_CONFIG.DEFAULT_SHIPPING_RATES[zone] || 100
    
    // คำนวณตามน้ำหนัก (เพิ่มค่าส่งทุก 1 กิโลกรัม)
    if (weight > 1) {
      baseCost += (weight - 1) * 10
    }
    
    // คำนวณตามประเภทการจัดส่ง
    switch (deliveryType) {
      case DELIVERY_TYPES.EXPRESS:
        baseCost *= 1.5
        break
      case DELIVERY_TYPES.SAME_DAY:
        baseCost *= 2
        break
      case DELIVERY_TYPES.NEXT_DAY:
        baseCost *= 1.3
        break
    }
    
    // คำนวณตามระยะทาง (ถ้ามี)
    if (distance > 0) {
      baseCost += distance * 2 // 2 บาทต่อกิโลเมตร
    }
    
    return Math.round(baseCost)
  },

  // ฟังก์ชันคำนวณเวลาจัดส่ง
  calculateDeliveryDate(orderDate, deliveryType, zone) {
    const date = new Date(orderDate)
    let days = DELIVERY_CONFIG.DEFAULT_DELIVERY_TIME[deliveryType] || 3
    
    // เพิ่มเวลาตามโซน
    switch (zone) {
      case DELIVERY_ZONES.PROVINCE:
        days += 1
        break
      case DELIVERY_ZONES.REGION:
        days += 2
        break
      case DELIVERY_ZONES.COUNTRY:
        days += 3
        break
      case DELIVERY_ZONES.INTERNATIONAL:
        days += 7
        break
    }
    
    date.setDate(date.getDate() + days)
    return date
  },

  // ฟังก์ชันเลือกยานพาหนะที่เหมาะสม
  suggestVehicleType(weight, volume, zone, priority) {
    // ตรวจสอบน้ำหนัก
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.MOTORCYCLE]) {
      if (zone === DELIVERY_ZONES.LOCAL && priority === PRIORITY_LEVELS.URGENT) {
        return VEHICLE_TYPES.MOTORCYCLE
      }
    }
    
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.CAR]) {
      return VEHICLE_TYPES.CAR
    }
    
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.VAN]) {
      return VEHICLE_TYPES.VAN
    }
    
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.PICKUP]) {
      return VEHICLE_TYPES.PICKUP
    }
    
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.TRUCK_6W]) {
      return VEHICLE_TYPES.TRUCK_6W
    }
    
    if (weight <= DELIVERY_CONFIG.VEHICLE_WEIGHT_LIMITS[VEHICLE_TYPES.TRUCK_10W]) {
      return VEHICLE_TYPES.TRUCK_10W
    }
    
    return VEHICLE_TYPES.TRUCK_18W
  },

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  validateDeliveryData(data) {
    const errors = []
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!data.customer_id) {
      errors.push('กรุณาระบุลูกค้า')
    }
    
    if (!data.delivery_address || !data.delivery_address.address) {
      errors.push('กรุณาระบุที่อยู่จัดส่ง')
    }
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('กรุณาระบุรายการสินค้า')
    } else {
      // ตรวจสอบรายการสินค้า
      data.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุสินค้า`)
        }
        
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนที่ถูกต้อง`)
        }
        
        if (item.weight && item.weight < 0) {
          errors.push(`รายการที่ ${index + 1}: น้ำหนักไม่ถูกต้อง`)
        }
      })
    }
    
    // ตรวจสอบประเภทการจัดส่ง
    if (!Object.values(DELIVERY_TYPES).includes(data.type)) {
      errors.push('ประเภทการจัดส่งไม่ถูกต้อง')
    }
    
    // ตรวจสอบสถานะ
    if (!Object.values(DELIVERY_STATUS).includes(data.status)) {
      errors.push('สถานะไม่ถูกต้อง')
    }
    
    // ตรวจสอบวิธีการจัดส่ง
    if (!Object.values(SHIPPING_METHODS).includes(data.method)) {
      errors.push('วิธีการจัดส่งไม่ถูกต้อง')
    }
    
    // ตรวจสอบวันที่จัดส่ง
    if (data.scheduled_date) {
      const scheduledDate = new Date(data.scheduled_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (scheduledDate < today) {
        errors.push('วันที่กำหนดจัดส่งไม่สามารถเป็นวันที่ผ่านมาแล้ว')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // ฟังก์ชันตรวจสอบสถานะการจัดส่ง
  canUpdateStatus(currentStatus, newStatus) {
    const validTransitions = {
      [DELIVERY_STATUS.PENDING]: [DELIVERY_STATUS.PREPARING, DELIVERY_STATUS.CANCELLED],
      [DELIVERY_STATUS.PREPARING]: [DELIVERY_STATUS.READY, DELIVERY_STATUS.CANCELLED],
      [DELIVERY_STATUS.READY]: [DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.CANCELLED],
      [DELIVERY_STATUS.PICKED_UP]: [DELIVERY_STATUS.IN_TRANSIT, DELIVERY_STATUS.FAILED],
      [DELIVERY_STATUS.IN_TRANSIT]: [DELIVERY_STATUS.OUT_FOR_DELIVERY, DELIVERY_STATUS.FAILED],
      [DELIVERY_STATUS.OUT_FOR_DELIVERY]: [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.FAILED],
      [DELIVERY_STATUS.FAILED]: [DELIVERY_STATUS.PREPARING, DELIVERY_STATUS.RETURNED],
      [DELIVERY_STATUS.DELIVERED]: [],
      [DELIVERY_STATUS.RETURNED]: [],
      [DELIVERY_STATUS.CANCELLED]: []
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || false
  },

  // ฟังก์ชันคำนวณน้ำหนักรวม
  calculateTotalWeight(items) {
    return items.reduce((total, item) => {
      return total + ((item.weight || 0) * (item.quantity || 0))
    }, 0)
  },

  // ฟังก์ชันคำนวณปริมาตรรวม
  calculateTotalVolume(items) {
    return items.reduce((total, item) => {
      const volume = (item.length || 0) * (item.width || 0) * (item.height || 0)
      return total + (volume * (item.quantity || 0))
    }, 0)
  },

  // ฟังก์ชันสร้างข้อมูลเริ่มต้น
  createDefaultDeliveryData(overrides = {}) {
    return {
      ...DELIVERY_DEFAULTS,
      delivery_date: new Date().toISOString().split('T')[0],
      scheduled_date: null,
      items: [],
      delivery_address: {
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Thailand',
        phone: '',
        contact_person: ''
      },
      tracking_events: [],
      ...overrides
    }
  },

  // ฟังก์ชันเพิ่มเหตุการณ์ติดตาม
  addTrackingEvent(deliveryData, status, description, location = null) {
    const event = {
      timestamp: new Date().toISOString(),
      status,
      description,
      location,
      recorded_by: 'system'
    }
    
    if (!deliveryData.tracking_events) {
      deliveryData.tracking_events = []
    }
    
    deliveryData.tracking_events.push(event)
    deliveryData.status = status
    
    return deliveryData
  },

  // ฟังก์ชันค้นหาและกรองข้อมูล
  filterDeliveriesByStatus(deliveries, status) {
    return deliveries.filter(delivery => delivery.status === status)
  },

  filterDeliveriesByZone(deliveries, zone) {
    return deliveries.filter(delivery => delivery.zone === zone)
  },

  filterDeliveriesByMethod(deliveries, method) {
    return deliveries.filter(delivery => delivery.method === method)
  },

  filterDeliveriesByDateRange(deliveries, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.delivery_date)
      return deliveryDate >= start && deliveryDate <= end
    })
  },

  // ฟังก์ชันสำหรับรายงาน
  calculateDeliveryStats(deliveries) {
    const stats = {
      total_deliveries: deliveries.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      success_rate: 0,
      average_delivery_time: 0,
      total_weight: 0,
      total_cost: 0
    }
    
    deliveries.forEach(delivery => {
      // นับสถานะ
      switch (delivery.status) {
        case DELIVERY_STATUS.PENDING:
        case DELIVERY_STATUS.PREPARING:
        case DELIVERY_STATUS.READY:
          stats.pending++
          break
        case DELIVERY_STATUS.PICKED_UP:
        case DELIVERY_STATUS.IN_TRANSIT:
        case DELIVERY_STATUS.OUT_FOR_DELIVERY:
          stats.in_progress++
          break
        case DELIVERY_STATUS.DELIVERED:
          stats.completed++
          break
        case DELIVERY_STATUS.FAILED:
        case DELIVERY_STATUS.RETURNED:
          stats.failed++
          break
        case DELIVERY_STATUS.CANCELLED:
          stats.cancelled++
          break
      }
      
      // รวมน้ำหนักและค่าใช้จ่าย
      stats.total_weight += delivery.total_weight || 0
      stats.total_cost += delivery.shipping_cost || 0
    })
    
    // คำนวณอัตราความสำเร็จ
    const completedAndFailed = stats.completed + stats.failed
    if (completedAndFailed > 0) {
      stats.success_rate = (stats.completed / completedAndFailed) * 100
    }
    
    return stats
  },

  // ฟังก์ชันจัดกลุ่มการจัดส่งตามโซน
  groupDeliveriesByZone(deliveries) {
    return deliveries.reduce((groups, delivery) => {
      const zone = delivery.zone || DELIVERY_ZONES.LOCAL
      if (!groups[zone]) {
        groups[zone] = {
          zone,
          count: 0,
          total_weight: 0,
          total_cost: 0,
          deliveries: []
        }
      }
      
      groups[zone].count++
      groups[zone].total_weight += delivery.total_weight || 0
      groups[zone].total_cost += delivery.shipping_cost || 0
      groups[zone].deliveries.push(delivery)
      
      return groups
    }, {})
  }
}

// ฟังก์ชันยูทิลิตี้
export const DeliveryUtils = {
  formatWeight(weight) {
    if (weight < 1000) {
      return `${weight} กรัม`
    }
    return `${(weight / 1000).toFixed(2)} กิโลกรัม`
  },

  formatVolume(volume) {
    if (volume < 1000000) {
      return `${(volume / 1000).toFixed(2)} ลิตร`
    }
    return `${(volume / 1000000).toFixed(2)} ลูกบาศก์เมตร`
  },

  formatDistance(distance) {
    if (distance < 1000) {
      return `${distance} เมตร`
    }
    return `${(distance / 1000).toFixed(2)} กิโลเมตร`
  },

  generateTrackingUrl(trackingNumber, carrier) {
    const trackingUrls = {
      [SHIPPING_METHODS.EMS]: `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`,
      [SHIPPING_METHODS.KERRY]: `https://th.kerryexpress.com/track/?track=${trackingNumber}`,
      [SHIPPING_METHODS.DHL]: `https://www.dhl.com/th-th/home/tracking.html?tracking-id=${trackingNumber}`,
      [SHIPPING_METHODS.FEDEX]: `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`,
      [SHIPPING_METHODS.FLASH]: `https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`
    }
    
    return trackingUrls[carrier] || `#tracking/${trackingNumber}`
  },

  isDeliveryOverdue(deliveryData) {
    if (!deliveryData.scheduled_date) return false
    
    const scheduledDate = new Date(deliveryData.scheduled_date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    return scheduledDate < today && 
           ![DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.CANCELLED].includes(deliveryData.status)
  },

  getDaysOverdue(scheduledDate) {
    const scheduled = new Date(scheduledDate)
    const today = new Date()
    const diffTime = today - scheduled
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  estimateDeliveryTime(zone, deliveryType) {
    const baseTime = DELIVERY_CONFIG.DEFAULT_DELIVERY_TIME[deliveryType] || 3
    
    switch (zone) {
      case DELIVERY_ZONES.LOCAL:
        return baseTime
      case DELIVERY_ZONES.CITY:
        return baseTime + 1
      case DELIVERY_ZONES.PROVINCE:
        return baseTime + 2
      case DELIVERY_ZONES.REGION:
        return baseTime + 3
      case DELIVERY_ZONES.COUNTRY:
        return baseTime + 5
      case DELIVERY_ZONES.INTERNATIONAL:
        return baseTime + 10
      default:
        return baseTime
    }
  }
}

export default DeliveryMasterData
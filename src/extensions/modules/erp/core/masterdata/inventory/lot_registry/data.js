/**
 * Lot Registry Master Data Configuration
 * ข้อมูลหลักและฟังก์ชันสำหรับระบบ Lot Registry สิ่งทอ
 */

import * as Schema from './schema.js'

/**
 * Lot Registry Code Configuration
 * การตั้งค่ารหัสเฉพาะของ Lot Registry Module
 */
export const LOT_REGISTRY_CODE_CONFIG = {
  // Code Pattern Configuration
  patterns: {
    lotId: {
      format: '{model}-{color}-{width}-{sequence}',
      separator: '-',
      components: {
        model: { digits: 3, type: 'number' },      // 402
        color: { digits: 3, type: 'number' },      // 177
        width: { digits: 3, type: 'number' },      // 152
        sequence: { digits: 5, type: 'number' }    // 08883
      }
    }
  },
  
  // Default settings
  settings: {
    defaultPattern: 'lotId',
    allowCustomCodes: false,
    validateUniqueCode: true,
    enableAutoGenerate: true
  }
}

// Default Values - ค่าเริ่มต้น
export const LOT_REGISTRY_DEFAULTS = {
  LOT_STATUS: Schema.LOT_STATUS.ACTIVE,
  FABRIC_TYPE: Schema.FABRIC_TYPES.COTTON,
  QUALITY_GRADE: Schema.FABRIC_QUALITY_GRADES.STANDARD,
  ROLL_CONDITION: Schema.ROLL_CONDITIONS.GOOD,
  CURRENCY: 'THB',
  GSM_MIN: 80,
  GSM_MAX: 500,
  WEIGHT_PER_METER_MIN: 0.1,
  WEIGHT_PER_METER_MAX: 2.0,
  WIDTH_MIN: 50,
  WIDTH_MAX: 300
}

// Validation Rules - กฎการตรวจสอบ
export const LOT_VALIDATION_RULES = {
  LOT_ID_PATTERN: /^[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{5}$/,
  MODEL_CODE_PATTERN: /^[0-9]{3}$/,
  COLOR_CODE_PATTERN: /^[0-9]{3}$/,
  SEQUENCE_PATTERN: /^[0-9]{5}$/,
  
  MIN_WEIGHT: 0.001,
  MAX_WEIGHT: 1000,
  MIN_METERS: 0.001,
  MAX_METERS: 10000,
  MIN_WIDTH: 50,
  MAX_WIDTH: 500,
  MIN_GSM: 50,
  MAX_GSM: 1000,
  
  REQUIRED_FIELDS: {
    CREATE: ['lot_id', 'model_code', 'color_code', 'width_cm', 'lot_sequence', 'original_weight_kg', 'weight_per_meter'],
    UPDATE: ['current_weight_kg', 'current_meters']
  },
  
  BUSINESS_RULES: {
    CURRENT_WEIGHT_CANNOT_EXCEED_ORIGINAL: true,
    CURRENT_METERS_CANNOT_EXCEED_CALCULATED: true,
    LOT_ID_MUST_BE_UNIQUE: true,
    WEIGHT_PER_METER_MUST_MATCH_CALCULATION: true
  }
}

/**
 * ข้อมูลหลักสำหรับ Lot Registry
 */
export const INITIAL_LOT_REGISTRY_DATA = [
  // ตัวอย่างข้อมูล Lot Registry เริ่มต้น
  {
    lot_id: '402-177-152-00001',
    model_code: '402',
    color_code: '177',
    width_cm: 152,
    lot_sequence: '00001',
    product_name: 'ผ้าฝ้าย 100% ความกว้าง 152 ซม. สีกรม',
    original_weight_kg: 25.5,
    current_weight_kg: 25.5,
    calculated_meters: 85,
    current_meters: 85,
    weight_per_meter: 0.3,
    fabric_type: 'cotton',
    fabric_composition: 'Cotton 100%',
    gsm: 180,
    quality_grade: 'standard',
    roll_condition: 'new',
    lot_status: 'active',
    color_name: 'กรมท่า',
    supplier_name: 'บริษัท ผ้าไทย จำกัด',
    current_location: 'WH01-A-01-01',
    notes: 'Lot ตัวอย่างสำหรับทดสอบระบบ',
    created_at: new Date(),
    state: 'active',
    active: true,
    deleted: false
  }
]

// Form Field Options - ตัวเลือกสำหรับฟอร์ม
export const LOT_REGISTRY_FORM_OPTIONS = {
  lotStatuses: Object.values(Schema.LOT_STATUS),
  fabricTypes: Object.values(Schema.FABRIC_TYPES),
  qualityGrades: Object.values(Schema.FABRIC_QUALITY_GRADES),
  rollConditions: Object.values(Schema.ROLL_CONDITIONS),
  operations: Object.values(Schema.LOT_OPERATIONS),
  
  // Dropdown options with labels
  fabricTypeOptions: [
    { value: 'cotton', label: 'ผ้าฝ้าย' },
    { value: 'polyester', label: 'ผ้าโพลีเอสเตอร์' },
    { value: 'silk', label: 'ผ้าไหม' },
    { value: 'wool', label: 'ผ้าขนสัตว์' },
    { value: 'linen', label: 'ผ้าลินิน' },
    { value: 'blend', label: 'ผ้าผสม' },
    { value: 'synthetic', label: 'ผ้าสังเคราะห์' },
    { value: 'natural', label: 'ผ้าธรรมชาติ' },
    { value: 'denim', label: 'ผ้ายีนส์' },
    { value: 'jersey', label: 'ผ้าเจอร์ซีย์' }
  ],
  
  qualityGradeOptions: [
    { value: 'premium', label: 'พรีเมียม' },
    { value: 'grade_a', label: 'เกรด A' },
    { value: 'grade_b', label: 'เกรด B' },
    { value: 'grade_c', label: 'เกรด C' },
    { value: 'standard', label: 'มาตรฐาน' },
    { value: 'economy', label: 'ประหยัด' }
  ],
  
  lotStatusOptions: [
    { value: 'active', label: 'ใช้งานได้' },
    { value: 'partial', label: 'ใช้บางส่วน' },
    { value: 'consumed', label: 'ใช้หมด' },
    { value: 'reserved', label: 'จองไว้' },
    { value: 'on_hold', label: 'หยุดใช้ชั่วคราว' },
    { value: 'damaged', label: 'เสียหาย' },
    { value: 'expired', label: 'หมดอายุ' }
  ]
}

/**
 * Lot Registry Helper Functions
 * ฟังก์ชันช่วยเหลือสำหรับ Lot Registry
 */
export const LotRegistryHelpers = {
  /**
   * Generate Lot ID
   * สร้างรหัส Lot ตามรูปแบบ 402-177-152-08883
   */
  generateLotId(modelCode, colorCode, widthCm, sequence) {
    const model = String(modelCode).padStart(3, '0')
    const color = String(colorCode).padStart(3, '0') 
    const width = String(Math.round(widthCm)).padStart(3, '0')
    const seq = String(sequence).padStart(5, '0')
    
    return `${model}-${color}-${width}-${seq}`
  },

  /**
   * Parse Lot ID
   * แยกส่วนประกอบของรหัส Lot
   */
  parseLotId(lotId) {
    const parts = lotId.split('-')
    if (parts.length !== 4) {
      throw new Error('Invalid lot ID format')
    }
    
    return {
      modelCode: parts[0],
      colorCode: parts[1],
      widthCm: parseInt(parts[2]),
      sequence: parts[3],
      fullLotId: lotId
    }
  },

  /**
   * Calculate meters from weight
   * คำนวณเมตรจากน้ำหนัก
   */
  calculateMetersFromWeight(weightKg, weightPerMeter) {
    if (weightPerMeter <= 0) {
      throw new Error('Weight per meter must be greater than 0')
    }
    return Math.round((weightKg / weightPerMeter) * 100) / 100
  },

  /**
   * Calculate weight from meters
   * คำนวณน้ำหนักจากเมตร
   */
  calculateWeightFromMeters(meters, weightPerMeter) {
    return Math.round((meters * weightPerMeter) * 1000) / 1000
  },

  /**
   * Validate lot ID format
   * ตรวจสอบรูปแบบรหัส Lot
   */
  validateLotId(lotId) {
    return LOT_VALIDATION_RULES.LOT_ID_PATTERN.test(lotId)
  },

  /**
   * Calculate GSM from weight and dimensions
   * คำนวณ GSM จากน้ำหนักและขนาด
   */
  calculateGSM(weightKg, meters, widthM) {
    const areaM2 = meters * widthM
    const weightG = weightKg * 1000
    return Math.round(weightG / areaM2)
  },

  /**
   * Generate next sequence number
   * สร้างหมายเลขลำดับถัดไป
   */
  generateNextSequence(existingLots, modelCode, colorCode, widthCm) {
    const prefix = `${modelCode}-${colorCode}-${String(widthCm).padStart(3, '0')}`
    
    // Filter lots with same prefix
    const samePrefixLots = existingLots.filter(lot => lot.lot_id.startsWith(prefix))
    
    // Extract sequence numbers and find max
    const sequences = samePrefixLots.map(lot => {
      const parts = lot.lot_id.split('-')
      return parseInt(parts[3])
    })
    
    const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0
    return maxSequence + 1
  },

  /**
   * Format lot display name
   * จัดรูปแบบชื่อแสดงของ Lot
   */
  formatLotDisplayName(lot) {
    const { fabric_type, color_name, width_cm, quality_grade } = lot
    const fabricLabel = LOT_REGISTRY_FORM_OPTIONS.fabricTypeOptions.find(f => f.value === fabric_type)?.label || fabric_type
    const gradeLabel = LOT_REGISTRY_FORM_OPTIONS.qualityGradeOptions.find(g => g.value === quality_grade)?.label || quality_grade
    
    return `${fabricLabel} ${color_name || ''} ${width_cm}cm ${gradeLabel}`
  },

  /**
   * Calculate lot utilization percentage
   * คำนวณเปอร์เซ็นต์การใช้งาน Lot
   */
  calculateUtilization(originalWeight, currentWeight) {
    if (originalWeight <= 0) return 0
    const used = originalWeight - currentWeight
    return Math.round((used / originalWeight) * 10000) / 100 // 2 decimal places
  },

  /**
   * Get lot status color
   * ได้สีสำหรับแสดงสถานะ Lot
   */
  getLotStatusColor(status) {
    const colorMap = {
      active: 'success',
      partial: 'warning', 
      consumed: 'info',
      reserved: 'primary',
      on_hold: 'warning',
      damaged: 'danger',
      expired: 'danger',
      returned: 'secondary'
    }
    return colorMap[status] || 'secondary'
  },

  /**
   * Generate lot barcode
   * สร้างบาร์โค้ดสำหรับ Lot
   */
  generateLotBarcode(lotId) {
    // Remove dashes for barcode
    return lotId.replace(/-/g, '')
  },

  /**
   * Generate lot QR code data
   * สร้างข้อมูล QR Code สำหรับ Lot
   */
  generateLotQRCodeData(lot) {
    return JSON.stringify({
      lot_id: lot.lot_id,
      product_name: lot.product_name,
      fabric_type: lot.fabric_type,
      current_weight_kg: lot.current_weight_kg,
      current_meters: lot.current_meters,
      quality_grade: lot.quality_grade,
      location: lot.current_location,
      created_at: lot.created_at
    })
  },

  /**
   * Validate lot consistency
   * ตรวจสอบความสอดคล้องของข้อมูล Lot
   */
  validateLotConsistency(lot) {
    const errors = []

    // Check if current weight doesn't exceed original
    if (lot.current_weight_kg > lot.original_weight_kg) {
      errors.push('น้ำหนักปัจจุบันไม่สามารถมากกว่าน้ำหนักเดิมได้')
    }

    // Check if current meters doesn't exceed calculated
    if (lot.current_meters > lot.calculated_meters) {
      errors.push('เมตรปัจจุบันไม่สามารถมากกว่าเมตรที่คำนวณได้')
    }

    // Check weight per meter calculation
    const expectedMeters = this.calculateMetersFromWeight(lot.original_weight_kg, lot.weight_per_meter)
    if (Math.abs(lot.calculated_meters - expectedMeters) > 0.1) {
      errors.push('การคำนวณน้ำหนักต่อเมตรไม่ถูกต้อง')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default {
  LOT_REGISTRY_CODE_CONFIG,
  LOT_REGISTRY_DEFAULTS,
  LOT_VALIDATION_RULES,
  INITIAL_LOT_REGISTRY_DATA,
  LOT_REGISTRY_FORM_OPTIONS,
  LotRegistryHelpers
}
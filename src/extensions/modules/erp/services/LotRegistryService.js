/**
 * Lot Registry Service Helper
 * ฟังก์ชันช่วยเหลือสำหรับการจัดการ Lot Registry สิ่งทอ
 */

import { LotRegistryHelpers } from '../masterdata/inventory/lot_registry/data.js'

/**
 * Lot Registry Service Class
 * คลาสสำหรับจัดการ Lot Registry ในระบบ ERP
 */
export class LotRegistryService {
  constructor(apiRequest = null) {
    this.apiRequest = apiRequest
    this.helpers = LotRegistryHelpers
  }

  /**
   * Initialize service with API request instance
   */
  initialize(apiRequest) {
    this.apiRequest = apiRequest
  }

  /**
   * Create new lot registry
   * สร้าง Lot Registry ใหม่
   */
  async createLotRegistry(lotData) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    // Validate lot data
    const validation = this.validateLotData(lotData)
    if (!validation.isValid) {
      throw new Error(`Invalid lot data: ${validation.errors.join(', ')}`)
    }

    // Generate lot ID if not provided
    if (!lotData.lot_id) {
      const sequence = await this.getNextSequence(lotData.model_code, lotData.color_code, lotData.width_cm)
      lotData.lot_id = this.helpers.generateLotId(lotData.model_code, lotData.color_code, lotData.width_cm, sequence)
    }

    // Calculate meters from weight
    if (!lotData.calculated_meters && lotData.original_weight_kg && lotData.weight_per_meter) {
      lotData.calculated_meters = this.helpers.calculateMetersFromWeight(lotData.original_weight_kg, lotData.weight_per_meter)
    }

    // Set current values same as original for new lots
    if (!lotData.current_weight_kg) {
      lotData.current_weight_kg = lotData.original_weight_kg
    }
    if (!lotData.current_meters) {
      lotData.current_meters = lotData.calculated_meters
    }

    // Set default values
    const lotRegistryData = {
      ...lotData,
      transaction_type: 'lot_registry',
      subtype: 'textile_lot',
      lot_status: lotData.lot_status || 'active',
      created_at: new Date().toISOString(),
      state: 'active',
      active: true,
      deleted: false
    }

    try {
      const result = await this.apiRequest.post('/api/engine/transactions', {
        type: 'LOT_REGISTRY',
        data: lotRegistryData,
        context: 'lot_registry_system'
      })

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error creating lot registry:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Update lot registry
   * อัปเดต Lot Registry
   */
  async updateLotRegistry(lotId, updateData) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    try {
      // Get current lot data first
      const currentLot = await this.getLotRegistry(lotId)
      if (!currentLot.success) {
        throw new Error('Lot not found')
      }

      // Merge with update data
      const mergedData = { ...currentLot.data, ...updateData }

      // Validate consistency
      const validation = this.helpers.validateLotConsistency(mergedData)
      if (!validation.isValid) {
        throw new Error(`Lot consistency error: ${validation.errors.join(', ')}`)
      }

      const result = await this.apiRequest.put(`/api/engine/transactions/${currentLot.data.id}`, {
        type: 'LOT_REGISTRY',
        data: {
          ...updateData,
          updated_at: new Date().toISOString()
        }
      })

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error updating lot registry:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get lot registry by ID
   * ดึง Lot Registry ตาม ID
   */
  async getLotRegistry(lotId) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    try {
      const result = await this.apiRequest.get('/api/engine/transactions', {
        params: {
          type: 'LOT_REGISTRY',
          filter: { lot_id: lotId },
          limit: 1
        }
      })

      if (result.data?.data?.length > 0) {
        return {
          success: true,
          data: result.data.data[0]
        }
      } else {
        return {
          success: false,
          error: 'Lot not found'
        }
      }
    } catch (error) {
      console.error('Error getting lot registry:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Search lot registries
   * ค้นหา Lot Registry
   */
  async searchLotRegistries(searchParams = {}) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    try {
      const result = await this.apiRequest.get('/api/engine/transactions', {
        params: {
          type: 'LOT_REGISTRY',
          filter: searchParams.filter || {},
          sort: searchParams.sort || { created_at: -1 },
          limit: searchParams.limit || 50,
          page: searchParams.page || 1
        }
      })

      return {
        success: true,
        data: result.data?.data || [],
        total: result.data?.total || 0
      }
    } catch (error) {
      console.error('Error searching lot registries:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  /**
   * Split lot into smaller lots
   * แบ่ง Lot ให้เป็น Lot เล็กลง
   */
  async splitLot(parentLotId, splitData) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    try {
      // Get parent lot
      const parentLot = await this.getLotRegistry(parentLotId)
      if (!parentLot.success) {
        throw new Error('Parent lot not found')
      }

      const parent = parentLot.data
      const childLots = []
      let totalSplitWeight = 0
      let totalSplitMeters = 0

      // Validate and create child lots
      for (const split of splitData) {
        const childSequence = await this.getNextSequence(parent.model_code, parent.color_code, parent.width_cm)
        const childLotId = this.helpers.generateLotId(parent.model_code, parent.color_code, parent.width_cm, childSequence)

        const childLotData = {
          ...parent,
          lot_id: childLotId,
          lot_sequence: String(childSequence).padStart(5, '0'),
          original_weight_kg: split.weight_kg,
          current_weight_kg: split.weight_kg,
          calculated_meters: this.helpers.calculateMetersFromWeight(split.weight_kg, parent.weight_per_meter),
          current_meters: this.helpers.calculateMetersFromWeight(split.weight_kg, parent.weight_per_meter),
          parent_lot_id: parentLotId,
          is_split_lot: true,
          split_reason: split.reason || 'Manual split',
          notes: split.notes || `Split from ${parentLotId}`,
          created_at: new Date().toISOString()
        }

        // Create child lot
        const childResult = await this.createLotRegistry(childLotData)
        if (!childResult.success) {
          throw new Error(`Failed to create child lot: ${childResult.error}`)
        }

        childLots.push(childResult.data)
        totalSplitWeight += split.weight_kg
        totalSplitMeters += childLotData.calculated_meters
      }

      // Update parent lot
      const remainingWeight = parent.current_weight_kg - totalSplitWeight
      const remainingMeters = parent.current_meters - totalSplitMeters

      if (remainingWeight < 0 || remainingMeters < 0) {
        throw new Error('Split amount exceeds available quantity')
      }

      const childLotIds = childLots.map(child => child.lot_id)
      
      await this.updateLotRegistry(parentLotId, {
        current_weight_kg: remainingWeight,
        current_meters: remainingMeters,
        lot_status: remainingWeight > 0 ? 'partial' : 'consumed',
        child_lot_ids: [...(parent.child_lot_ids || []), ...childLotIds]
      })

      return {
        success: true,
        data: {
          parent: parentLotId,
          children: childLots,
          remaining: {
            weight_kg: remainingWeight,
            meters: remainingMeters
          }
        }
      }
    } catch (error) {
      console.error('Error splitting lot:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Consume lot (use partial or full lot)
   * ใช้ Lot (บางส่วนหรือทั้งหมด)
   */
  async consumeLot(lotId, consumeData) {
    if (!this.apiRequest) {
      throw new Error('LotRegistryService not initialized')
    }

    try {
      const lot = await this.getLotRegistry(lotId)
      if (!lot.success) {
        throw new Error('Lot not found')
      }

      const current = lot.data
      const { weight_kg, meters, reason, reference_id } = consumeData

      // Validate consumption amounts
      if (weight_kg > current.current_weight_kg || meters > current.current_meters) {
        throw new Error('Consume amount exceeds available quantity')
      }

      const newWeight = current.current_weight_kg - weight_kg
      const newMeters = current.current_meters - meters
      const newStatus = newWeight <= 0 ? 'consumed' : 'partial'

      // Update lot registry
      const updateResult = await this.updateLotRegistry(lotId, {
        current_weight_kg: newWeight,
        current_meters: newMeters,
        lot_status: newStatus,
        last_movement_date: new Date().toISOString()
      })

      if (!updateResult.success) {
        throw new Error('Failed to update lot registry')
      }

      // Create movement record if needed
      // TODO: Create stock movement record

      return {
        success: true,
        data: {
          lot_id: lotId,
          consumed: { weight_kg, meters },
          remaining: { weight_kg: newWeight, meters: newMeters },
          status: newStatus
        }
      }
    } catch (error) {
      console.error('Error consuming lot:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get next sequence number for lot generation
   * ดึงหมายเลขลำดับถัดไปสำหรับการสร้าง Lot
   */
  async getNextSequence(modelCode, colorCode, widthCm) {
    try {
      const existingLots = await this.searchLotRegistries({
        filter: { model_code: modelCode, color_code: colorCode, width_cm: widthCm }
      })

      if (existingLots.success) {
        return this.helpers.generateNextSequence(existingLots.data, modelCode, colorCode, widthCm)
      } else {
        return 1 // First lot
      }
    } catch (error) {
      console.error('Error getting next sequence:', error)
      return 1
    }
  }

  /**
   * Validate lot data
   * ตรวจสอบข้อมูล Lot
   */
  validateLotData(lotData) {
    const errors = []

    // Required fields
    if (!lotData.model_code) errors.push('Model code is required')
    if (!lotData.color_code) errors.push('Color code is required')
    if (!lotData.width_cm) errors.push('Width is required')
    if (!lotData.original_weight_kg) errors.push('Original weight is required')
    if (!lotData.weight_per_meter) errors.push('Weight per meter is required')

    // Format validation
    if (lotData.model_code && !/^[0-9]{3}$/.test(lotData.model_code)) {
      errors.push('Model code must be 3 digits')
    }
    if (lotData.color_code && !/^[0-9]{3}$/.test(lotData.color_code)) {
      errors.push('Color code must be 3 digits')
    }

    // Range validation
    if (lotData.width_cm && (lotData.width_cm < 50 || lotData.width_cm > 500)) {
      errors.push('Width must be between 50-500 cm')
    }
    if (lotData.original_weight_kg && lotData.original_weight_kg <= 0) {
      errors.push('Original weight must be greater than 0')
    }
    if (lotData.weight_per_meter && lotData.weight_per_meter <= 0) {
      errors.push('Weight per meter must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get lot utilization summary
   * ดึงสรุปการใช้งาน Lot
   */
  async getLotUtilizationSummary(filters = {}) {
    try {
      const lots = await this.searchLotRegistries({ filter: filters, limit: 1000 })
      
      if (!lots.success) {
        throw new Error('Failed to get lots data')
      }

      const summary = {
        total_lots: lots.data.length,
        active_lots: 0,
        partial_lots: 0,
        consumed_lots: 0,
        total_weight_kg: 0,
        remaining_weight_kg: 0,
        total_meters: 0,
        remaining_meters: 0,
        utilization_percentage: 0
      }

      lots.data.forEach(lot => {
        // Count by status
        switch (lot.lot_status) {
          case 'active': summary.active_lots++; break
          case 'partial': summary.partial_lots++; break
          case 'consumed': summary.consumed_lots++; break
        }

        // Sum weights and meters
        summary.total_weight_kg += lot.original_weight_kg || 0
        summary.remaining_weight_kg += lot.current_weight_kg || 0
        summary.total_meters += lot.calculated_meters || 0
        summary.remaining_meters += lot.current_meters || 0
      })

      // Calculate utilization percentage
      if (summary.total_weight_kg > 0) {
        const usedWeight = summary.total_weight_kg - summary.remaining_weight_kg
        summary.utilization_percentage = Math.round((usedWeight / summary.total_weight_kg) * 10000) / 100
      }

      return {
        success: true,
        data: summary
      }
    } catch (error) {
      console.error('Error getting lot utilization summary:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const lotRegistryService = new LotRegistryService()

export default lotRegistryService
/**
 * Inventory Balance Data Management
 * 
 * ข้อมูลเริ่มต้นและ helper functions สำหรับการจัดการ Balance
 * 
 * หลักการ: Balance เป็น derived data ที่คำนวณจาก Movement
 * ไม่ควรมีข้อมูลตัวอย่างแบบ hardcode แต่ใช้ functions ในการคำนวณ
 */

// Initial Data - ใช้เฉพาะกรณีจำเป็น (เช่น migration หรือ demo)
export const INITIAL_BALANCE_DATA = []

// Balance Management Functions - Product-Centric
export const BalanceHelpers = {
  /**
   * คำนวณ Balance รวมจาก Movement Log ทั้งหมด (ทุก location)
   * @param {string} productId - รหัสสินค้า
   * @param {Array} movements - รายการ movement ทั้งหมด
   * @returns {Object} balance record
   */
  calculateBalanceFromMovements: (productId, movements) => {
    // กรอง movements ที่เกี่ยวข้องกับ product นี้ (ทุก location)
    const relevantMovements = movements.filter(m => 
      m.product_id === productId &&
      m.status === 'completed'
    ).sort((a, b) => new Date(a.movement_date) - new Date(b.movement_date))

    let qtyOnHand = 0
    let totalCostValue = 0
    let totalMovementsIn = 0
    let totalMovementsOut = 0
    let reservedQty = 0
    let availableQty = 0

    // คำนวณจาก movements ทีละรายการ (รวมทุก location)
    relevantMovements.forEach(movement => {
      const qty = parseFloat(movement.quantity) || 0
      const cost = parseFloat(movement.unit_cost) || 0

      if (movement.movement_type === 'IN') {
        qtyOnHand += qty
        totalCostValue += (qty * cost)
        totalMovementsIn += qty
      } else if (movement.movement_type === 'OUT') {
        qtyOnHand -= qty
        totalMovementsOut += qty
        // ไม่หัก cost ตอน OUT (ใช้ weighted average cost)
      }
    })

    // คำนวณ weighted average cost
    const weightedAvgCost = totalMovementsIn > 0 ? totalCostValue / totalMovementsIn : 0
    
    // Available quantity = On hand - Reserved
    availableQty = qtyOnHand - reservedQty

    // สร้าง location summary
    const locationSummary = this.generateLocationSummary(relevantMovements)

    return {
      qty_on_hand: Math.max(0, qtyOnHand),
      weighted_avg_cost: weightedAvgCost,
      total_cost_value: weightedAvgCost * Math.max(0, qtyOnHand),
      qty_reserved: reservedQty,
      qty_available: Math.max(0, availableQty),
      total_movements_in: totalMovementsIn,
      total_movements_out: totalMovementsOut,
      total_locations: locationSummary.length,
      location_summary: locationSummary,
      last_movement_date: relevantMovements.length > 0 ? 
        relevantMovements[relevantMovements.length - 1].movement_date : null
    }
  },

  /**
   * อัปเดต Balance จาก Movement ใหม่
   * @param {Object} currentBalance - Balance ปัจจุบัน
   * @param {Object} newMovement - Movement ใหม่
   * @returns {Object} updated balance
   */
  updateBalanceFromMovement: (currentBalance, newMovement) => {
    const qty = parseFloat(newMovement.quantity) || 0
    const cost = parseFloat(newMovement.unit_cost) || 0
    
    let newQtyOnHand = currentBalance.qty_on_hand || 0
    let currentTotalValue = (currentBalance.weighted_avg_cost || 0) * newQtyOnHand
    let newTotalMovementsIn = currentBalance.total_movements_in || 0
    let newTotalMovementsOut = currentBalance.total_movements_out || 0

    if (newMovement.movement_type === 'IN') {
      newQtyOnHand += qty
      currentTotalValue += (qty * cost)
      newTotalMovementsIn += qty
    } else if (newMovement.movement_type === 'OUT') {
      newQtyOnHand -= qty
      newTotalMovementsOut += qty
    }

    // คำนวณ weighted average cost ใหม่
    const newWeightedAvgCost = newTotalMovementsIn > 0 ? 
      currentTotalValue / newTotalMovementsIn : 0
    const reservedQty = currentBalance.qty_reserved || 0
    const newAvailableQty = Math.max(0, newQtyOnHand - reservedQty)

    // อัปเดต location summary (จำลอง - ควรคำนวณจาก movements จริง)
    const currentLocationSummary = currentBalance.location_summary || []
    const locationCode = newMovement.location_code || 'UNKNOWN'
    
    // หา location ใน summary หรือสร้างใหม่
    const locationIndex = currentLocationSummary.findIndex(loc => loc.location_code === locationCode)
    let updatedLocationSummary = [...currentLocationSummary]
    
    if (locationIndex >= 0) {
      // อัปเดต location ที่มีอยู่
      const locationData = { ...updatedLocationSummary[locationIndex] }
      if (newMovement.movement_type === 'IN') {
        locationData.qty_on_hand += qty
      } else if (newMovement.movement_type === 'OUT') {
        locationData.qty_on_hand -= qty
      }
      locationData.last_updated = newMovement.movement_date
      
      if (locationData.qty_on_hand <= 0) {
        // ถ้าเหลือ 0 ให้ลบออก
        updatedLocationSummary.splice(locationIndex, 1)
      } else {
        updatedLocationSummary[locationIndex] = locationData
      }
    } else if (newMovement.movement_type === 'IN') {
      // เพิ่ม location ใหม่ (เฉพาะ movement IN)
      updatedLocationSummary.push({
        location_code: locationCode,
        qty_on_hand: qty,
        last_updated: newMovement.movement_date
      })
    }

    // Create updated balance data with only valid schema fields
    const updatedBalance = {
      // Keep original balance structure but update specific fields
      ...currentBalance,
      qty_on_hand: Math.max(0, newQtyOnHand),
      weighted_avg_cost: newWeightedAvgCost,
      total_cost_value: newWeightedAvgCost * Math.max(0, newQtyOnHand),
      qty_available: newAvailableQty,
      total_movements_in: newTotalMovementsIn,
      total_movements_out: newTotalMovementsOut,
      total_locations: updatedLocationSummary.length,
      location_summary: updatedLocationSummary,
      last_movement_date: newMovement.movement_date,
      updated_date: new Date().toISOString(),
      updated_by: newMovement.created_by || 'system'
    }

    // Remove any invalid fields that might exist in old balance records
    delete updatedBalance.available_qty
    delete updatedBalance.avg_cost
    delete updatedBalance.total_cost
    delete updatedBalance.min_qty
    delete updatedBalance.max_qty
    delete updatedBalance.reorder_qty
    delete updatedBalance.state

    return updatedBalance
  },

  /**
   * สร้าง location summary จาก movements
   * @param {Array} movements - รายการ movements
   * @returns {Array} location summary
   */
  generateLocationSummary: (movements) => {
    const locationMap = new Map()
    
    movements.forEach(movement => {
      const location = movement.location_code || 'UNKNOWN'
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location_code: location,
          qty_on_hand: 0,
          last_updated: movement.movement_date
        })
      }
      
      const locationData = locationMap.get(location)
      const qty = parseFloat(movement.quantity) || 0
      
      if (movement.movement_type === 'IN') {
        locationData.qty_on_hand += qty
      } else if (movement.movement_type === 'OUT') {
        locationData.qty_on_hand -= qty
      }
      
      locationData.last_updated = movement.movement_date
    })
    
    // กรองเฉพาะ location ที่มีสต็อก > 0
    return Array.from(locationMap.values()).filter(loc => loc.qty_on_hand > 0)
  },

  /**
   * สร้าง Balance record ใหม่ (Product-Centric)
   * @param {string} productId - รหัสสินค้า
   * @param {string} productCode - รหัสสินค้า (code)
   * @param {string} createdBy - ผู้สร้าง
   * @returns {Object} new balance record
   */
  createNewBalance: (productId, productCode, createdBy = 'system') => {
    const now = new Date().toISOString()
    
    return {
      id: `BAL_${productId}_${Date.now()}`,
      product_id: productId,
      product_code: productCode,
      qty_on_hand: 0,
      qty_reserved: 0,
      qty_available: 0,
      qty_allocated: 0,
      qty_in_transit: 0,
      weighted_avg_cost: 0,
      total_cost_value: 0,
      cost_method: 'WEIGHTED_AVERAGE',
      total_movements_in: 0,
      total_movements_out: 0,
      total_locations: 0,
      location_summary: [],
      last_movement_id: null,
      last_movement_date: null,
      last_calculated: now,
      min_stock_level: 0,
      max_stock_level: 0,
      reorder_point: 0,
      reorder_quantity: 0,
      is_active: true,
      is_negative_allowed: false,
      lock_status: 'UNLOCKED',
      created_by: createdBy,
      updated_by: createdBy,
      created_date: now,
      updated_date: now,
      version: 1,
      notes: `Balance created for product ${productCode}`,
      tags: []
    }
  },

  /**
   * อัปเดต Reserved Quantity
   * @param {Object} balance - Balance record
   * @param {number} reservedQty - จำนวนที่จอง
   * @returns {Object} updated balance
   */
  updateReservedQuantity: (balance, reservedQty) => {
    const newReservedQty = Math.max(0, parseFloat(reservedQty) || 0)
    const qtyOnHand = balance.qty_on_hand || 0
    const newAvailableQty = Math.max(0, qtyOnHand - newReservedQty)

    return {
      ...balance,
      qty_reserved: newReservedQty,
      qty_available: newAvailableQty,
      updated_date: new Date().toISOString(),
      updated_by: 'system'
    }
  },

  /**
   * ตรวจสอบการแจ้งเตือน Stock (Product-Level)
   * @param {Object} balance - Balance record
   * @returns {Array} array of alerts
   */
  checkStockAlerts: (balance) => {
    const alerts = []
    const qtyOnHand = balance.qty_on_hand || 0
    const availableQty = balance.qty_available || 0
    const minStockLevel = balance.min_stock_level || 0
    const maxStockLevel = balance.max_stock_level || 0
    const reorderPoint = balance.reorder_point || 0

    // Stock ต่ำกว่า minimum
    if (qtyOnHand < minStockLevel && minStockLevel > 0) {
      alerts.push({
        type: 'low_stock',
        severity: 'warning',
        message: `Total stock below minimum level (${qtyOnHand} < ${minStockLevel})`,
        product_id: balance.product_id,
        product_code: balance.product_code,
        current_qty: qtyOnHand,
        threshold: minStockLevel
      })
    }

    // Stock เกิน maximum
    if (maxStockLevel > 0 && qtyOnHand > maxStockLevel) {
      alerts.push({
        type: 'overstock',
        severity: 'warning',
        message: `Total stock above maximum level (${qtyOnHand} > ${maxStockLevel})`,
        product_id: balance.product_id,
        product_code: balance.product_code,
        current_qty: qtyOnHand,
        threshold: maxStockLevel
      })
    }

    // Stock ถึงจุด reorder
    if (availableQty <= reorderPoint && reorderPoint > 0) {
      alerts.push({
        type: 'reorder_point',
        severity: 'info',
        message: `Available stock reached reorder point (${availableQty} <= ${reorderPoint})`,
        product_id: balance.product_id,
        product_code: balance.product_code,
        current_qty: availableQty,
        threshold: reorderPoint,
        suggested_order_qty: balance.reorder_quantity || 0
      })
    }

    // Stock หมด
    if (qtyOnHand <= 0) {
      alerts.push({
        type: 'out_of_stock',
        severity: 'error',
        message: 'Product is completely out of stock',
        product_id: balance.product_id,
        product_code: balance.product_code,
        current_qty: qtyOnHand
      })
    }

    // Available stock หมด (แต่ยัง on hand อยู่)
    if (qtyOnHand > 0 && availableQty <= 0) {
      alerts.push({
        type: 'no_available_stock',
        severity: 'warning',
        message: 'No available stock (all reserved)',
        product_id: balance.product_id,
        product_code: balance.product_code,
        qty_on_hand: qtyOnHand,
        qty_reserved: balance.qty_reserved || 0
      })
    }

    return alerts
  },

  /**
   * สรุป Balance ตาม Product (ใช้ใน Product-Centric จะเป็นการดึงข้อมูล balance เดียว)
   * @param {Array} balances - Balance records
   * @param {string} productId - รหัสสินค้า
   * @returns {Object} summary (จะเป็น balance record ตัวเดียว)
   */
  summarizeByProduct: (balances, productId) => {
    const productBalance = balances.find(b => b.product_id === productId)
    
    if (!productBalance) {
      return {
        product_id: productId,
        found: false,
        message: 'No balance record found for this product'
      }
    }

    // ใน Product-Centric แล้ว balance จะเก็บข้อมูลรวมไว้แล้ว
    return {
      product_id: productId,
      product_code: productBalance.product_code,
      found: true,
      qty_on_hand: productBalance.qty_on_hand || 0,
      qty_reserved: productBalance.qty_reserved || 0,
      qty_available: productBalance.qty_available || 0,
      weighted_avg_cost: productBalance.weighted_avg_cost || 0,
      total_cost_value: productBalance.total_cost_value || 0,
      total_locations: productBalance.total_locations || 0,
      location_summary: productBalance.location_summary || [],
      last_movement_date: productBalance.last_movement_date,
      stock_alerts: this.checkStockAlerts(productBalance)
    }
  },

  /**
   * ตรวจสอบความถูกต้องของ Balance (Product-Centric)
   * @param {Object} balance - Balance record
   * @returns {Object} validation result
   */
  validateBalance: (balance) => {
    const errors = []
    const warnings = []

    // ตรวจสอบ required fields
    if (!balance.product_id) errors.push('product_id is required')
    if (!balance.product_code) errors.push('product_code is required')

    // ตรวจสอบ quantities
    if (balance.qty_on_hand < 0 && !balance.is_negative_allowed) {
      errors.push('qty_on_hand cannot be negative')
    }
    if (balance.qty_reserved < 0) errors.push('qty_reserved cannot be negative')
    if (balance.qty_available < 0) warnings.push('qty_available is negative')

    // ตรวจสอบ consistency
    const expectedAvailable = (balance.qty_on_hand || 0) - (balance.qty_reserved || 0)
    if (Math.abs(expectedAvailable - (balance.qty_available || 0)) > 0.01) {
      errors.push('qty_available calculation inconsistent')
    }

    // ตรวจสอบ cost calculations
    const expectedTotalCost = (balance.qty_on_hand || 0) * (balance.weighted_avg_cost || 0)
    if (Math.abs(expectedTotalCost - (balance.total_cost_value || 0)) > 0.01) {
      warnings.push('total_cost_value calculation may be inconsistent')
    }

    // ตรวจสอบ location summary consistency
    if (balance.location_summary && Array.isArray(balance.location_summary)) {
      const summaryTotal = balance.location_summary.reduce((sum, loc) => 
        sum + (loc.qty_on_hand || 0), 0
      )
      if (Math.abs(summaryTotal - (balance.qty_on_hand || 0)) > 0.01) {
        warnings.push('location_summary total does not match qty_on_hand')
      }
      
      if (balance.location_summary.length !== balance.total_locations) {
        warnings.push('location_summary count does not match total_locations')
      }
    }

    // ตรวจสอบ thresholds
    if (balance.min_stock_level > balance.max_stock_level && balance.max_stock_level > 0) {
      warnings.push('min_stock_level should not exceed max_stock_level')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        total_errors: errors.length,
        total_warnings: warnings.length,
        passed_validation: errors.length === 0
      }
    }
  },

  /**
   * คำนวณ Balance ใหม่ทั้งหมดจาก Movement Log (สำหรับ recalculation)
   * @param {string} productId - รหัสสินค้า
   * @param {Array} allMovements - Movement Log ทั้งหมด
   * @returns {Object} recalculated balance
   */
  recalculateCompleteBalance: (productId, allMovements) => {
    const baseBalance = BalanceHelpers.calculateBalanceFromMovements(productId, allMovements)
    const locationSummary = BalanceHelpers.generateLocationSummary(
      allMovements.filter(m => m.product_id === productId)
    )

    return {
      ...baseBalance,
      location_summary: locationSummary,
      total_locations: locationSummary.length,
      last_calculated: new Date().toISOString(),
      recalculated: true
    }
  }
}

// Export helper functions
export default BalanceHelpers
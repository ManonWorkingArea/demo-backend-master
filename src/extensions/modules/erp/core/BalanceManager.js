/**
 * Balance Manager - Core Service (Product-Centric)
 * 
 * ระบบจัดการ Balance แบบกลางที่เป็น Product-Centric
 * 
 * หลักการใหม่: Balance เป็น derived data รวมของสินค้าแต่ละตัว
 * - คำนวณจาก Movement ทุก location
 * - เก็บข้อมูลสรุป location ใน location_summary
 * - ไม่ผูกติดกับ location เฉพาะ
 */

import { TransactionEngine } from './Engine.js'
import { TRANSACTION_TYPES } from './Types.js'
import BalanceHelpers from './masterdata/inventory/balance/data.js'

export class BalanceManager {
  constructor(engine = null) {
    this.engine = engine || new TransactionEngine() // รับ engine จากภายนอก หรือสร้างใหม่
    console.log('[BalanceManager] 🚀 Initialized with', engine ? 'custom engine' : 'default engine')
  }
  
  /**
   * Set engine instance (for API driver support)
   */
  setEngine(engine) {
    this.engine = engine
    console.log('[BalanceManager] 🔄 Engine updated:', engine?.driverType || 'unknown')
  }

  /**
   * ตรวจสอบและสร้าง Balance สำหรับ Product (Product-Centric)
   * @param {Object} product - ข้อมูล Product
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @returns {Promise<Object>} Balance record
   */
  async ensureProductBalance(product, options = {}) {
    try {
      const {
        forceCreate = false,
        updatedBy = 'system'
      } = options

      console.log('🔍 [BalanceManager] Ensuring balance for product:', product.sku || product.id)

      // ตรวจสอบ Balance ที่มีอยู่ (product เดียว)
      const existingBalance = await this.findProductBalance(product.id)
      
      if (existingBalance && !forceCreate) {
        console.log('✅ [BalanceManager] Balance already exists, updating...', existingBalance.id)
        return await this.updateProductBalance(existingBalance.id, product, updatedBy)
      }

      // สร้าง Balance ใหม่
      console.log('➕ [BalanceManager] Creating new balance for product:', product.sku)
      return await this.createProductBalance(product, { updatedBy })

    } catch (error) {
      console.error('❌ [BalanceManager] Error ensuring product balance:', error)
      throw error
    }
  }

  /**
   * ค้นหา Balance สำหรับ Product
   * @param {string} productId - รหัส Product
   * @param {string} locationId - รหัส Stock Location (optional)
   * @returns {Promise<Object|null>} Balance record หรือ null
   */
  async findProductBalance(productId, locationId = null) {
    try {
      // ✅ เปลี่ยนจาก TRANSACTION_TYPES.INVENTORY_BALANCE เป็น string
      const result = await this.engine.list('inventory_balance')
      const balances = result?.data || []

      if (locationId) {
        // หา Balance สำหรับ Product และ Location ที่ระบุ
        return balances.find(balance => 
          balance.product_id === productId && 
          balance.stock_location_id === locationId
        ) || null
      } else {
        // หา Balance แรกสำหรับ Product นี้
        return balances.find(balance => 
          balance.product_id === productId
        ) || null
      }
    } catch (error) {
      console.error('❌ [BalanceManager] Error finding product balance:', error)
      return null
    }
  }

  /**
   * สร้าง Balance ใหม่สำหรับ Product
   * @param {Object} product - ข้อมูล Product
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} Balance record ที่สร้างใหม่
   */
  async createProductBalance(product, options = {}) {
    try {
      const {
        locationId = null,
        locationCode = null,
        initialQuantity = 0,
        initialCost = 0,
        updatedBy = 'system'
      } = options

      // หา Default Stock Location ถ้าไม่ได้ระบุ
      const location = await this.getOrCreateDefaultLocation(locationId, locationCode)
      
      const balanceData = BalanceHelpers.createNewBalance(
        product.id,
        product.product_code || product.sku,
        location.id,
        location.code,
        updatedBy
      )

      // ปรับแต่งข้อมูลเพิ่มเติม
      Object.assign(balanceData, {
        qty_on_hand: initialQuantity,
        qty_available: initialQuantity,
        weighted_avg_cost: product.unit_price || initialCost,
        total_cost_value: initialQuantity * (product.unit_price || initialCost),
        min_stock_level: product.min_stock || 0,
        max_stock_level: (product.min_stock || 0) * 10,
        reorder_point: Math.max(product.min_stock || 0, 5),
        reorder_quantity: Math.max((product.min_stock || 0) * 2, 10),
        notes: `Balance created for product ${product.sku} - ${product.product_name}`
      })

      const result = await this.engine.create('inventory_balance', balanceData, updatedBy)
      
      if (result?.success) {
        console.log('✅ [BalanceManager] Created balance:', result.data.id)
        return result.data
      } else {
        throw new Error(result?.error || 'Failed to create balance')
      }

    } catch (error) {
      console.error('❌ [BalanceManager] Error creating product balance:', error)
      throw error
    }
  }

  /**
   * อัปเดต Balance ที่มีอยู่
   * @param {string} balanceId - รหัส Balance
   * @param {Object} product - ข้อมูล Product ใหม่
   * @param {string} updatedBy - ผู้อัปเดต
   * @returns {Promise<Object>} Balance record ที่อัปเดตแล้ว
   */
  async updateProductBalance(balanceId, product, updatedBy = 'system') {
    try {
      const updateData = {
        product_code: product.product_code || product.sku,
        min_stock_level: product.min_stock || 0,
        max_stock_level: (product.min_stock || 0) * 10,
        reorder_point: Math.max(product.min_stock || 0, 5),
        reorder_quantity: Math.max((product.min_stock || 0) * 2, 10),
        updated_date: new Date().toISOString(),
        updated_by: updatedBy
      }

      const result = await this.engine.update('inventory_balance', balanceId, updateData, updatedBy)
      
      if (result?.success) {
        console.log('✅ [BalanceManager] Updated balance:', balanceId)
        return result.data
      } else {
        throw new Error(result?.error || 'Failed to update balance')
      }

    } catch (error) {
      console.error('❌ [BalanceManager] Error updating balance:', error)
      throw error
    }
  }

  /**
   * อัปเดต Balance จาก Movement
   * @param {string} productId - รหัส Product
   * @param {string} locationId - รหัส Stock Location
   * @param {Object} movement - ข้อมูล Movement
   * @param {string} updatedBy - ผู้อัปเดต
   * @returns {Promise<Object>} Balance record ที่อัปเดตแล้ว
   */
  async updateBalanceFromMovement(productId, locationId, movement, updatedBy = 'system') {
    try {
      // For Product-Centric Balance, ignore locationId and find by productId only
      const balance = await this.findProductBalance(productId)
      
      if (!balance) {
        console.warn(`⚠️ [BalanceManager] No balance found for product ${productId} - movement update skipped`)
        return null
      }

      const updatedBalance = BalanceHelpers.updateBalanceFromMovement(balance, movement)
      
      const result = await this.engine.update(
        'inventory_balance', 
        balance.id, 
        updatedBalance, 
        updatedBy
      )
      
      if (result?.success) {
        console.log('✅ [BalanceManager] Updated balance from movement:', balance.id)
        return result.data
      } else {
        throw new Error(result?.error || 'Failed to update balance from movement')
      }

    } catch (error) {
      console.error('❌ [BalanceManager] Error updating balance from movement:', error)
      throw error
    }
  }

  /**
   * คำนวณ Balance ใหม่จาก Movement Log ทั้งหมด
   * @param {string} productId - รหัส Product
   * @param {string} locationId - รหัส Stock Location
   * @param {string} updatedBy - ผู้อัปเดต
   * @returns {Promise<Object>} Balance record ที่คำนวณใหม่
   */
  async recalculateBalance(productId, locationId, updatedBy = 'system') {
    try {
      console.log('🔄 [BalanceManager] Recalculating balance for:', productId, 'at', locationId)

      // ดึง Movement Log ทั้งหมด
      const movementResult = await this.engine.list(TRANSACTION_TYPES.INVENTORY)
      const movements = movementResult?.data?.filter(m => 
        m.subtype === 'stock_movement' &&
        m.product_id === productId &&
        m.location_code === locationId &&
        m.status === 'completed'
      ) || []

      // คำนวณ Balance ใหม่
      const calculatedBalance = BalanceHelpers.calculateBalanceFromMovements(
        productId, 
        locationId, 
        movements
      )

      // หา Balance record ที่มีอยู่
      const existingBalance = await this.findProductBalance(productId, locationId)
      
      if (existingBalance) {
        // อัปเดต Balance ที่มีอยู่
        const updateData = {
          ...calculatedBalance,
          updated_date: new Date().toISOString(),
          updated_by: updatedBy,
          last_calculated: new Date().toISOString()
        }

        const result = await this.engine.update(
          'inventory_balance', 
          existingBalance.id, 
          updateData, 
          updatedBy
        )
        
        if (result?.success) {
          console.log('✅ [BalanceManager] Recalculated balance:', existingBalance.id)
          return result.data
        } else {
          throw new Error(result?.error || 'Failed to update recalculated balance')
        }
      } else {
        console.warn('⚠️ [BalanceManager] No existing balance found for recalculation')
        return null
      }

    } catch (error) {
      console.error('❌ [BalanceManager] Error recalculating balance:', error)
      throw error
    }
  }

  /**
   * ตรวจสอบและสร้าง Default Stock Location
   * @param {string} locationId - รหัส Location ที่ต้องการ
   * @param {string} locationCode - รหัส Location Code
   * @returns {Promise<Object>} Stock Location record
   */
  async getOrCreateDefaultLocation(locationId = null, locationCode = null) {
    try {
      // ถ้าระบุ locationId มา ให้ค้นหาก่อน
      if (locationId) {
        const result = await this.engine.list(TRANSACTION_TYPES.STOCK_LOCATION)
        const location = result?.data?.find(loc => loc.id === locationId)
        if (location) {
          return {
            id: location.id,
            code: location.location_code || location.code || locationCode || 'WH01'
          }
        }
      }

      // หา Default Location ที่มีอยู่
      const locationsResult = await this.engine.list(TRANSACTION_TYPES.STOCK_LOCATION)
      const locations = locationsResult?.data || []

      if (locations.length > 0) {
        const defaultLocation = locations.find(loc => 
          loc.is_default || 
          loc.location_type === 'warehouse' ||
          loc.status === 'active'
        ) || locations[0]

        return {
          id: defaultLocation.id,
          code: defaultLocation.location_code || defaultLocation.code || 'WH01'
        }
      }

      // ถ้าไม่มี Location เลย ให้ใช้ค่า default
      console.warn('⚠️ [BalanceManager] No stock locations found, using default values')
      return {
        id: 'MAIN_WAREHOUSE',
        code: locationCode || 'WH01'
      }

    } catch (error) {
      console.error('❌ [BalanceManager] Error getting default location:', error)
      // ใช้ค่า fallback
      return {
        id: 'MAIN_WAREHOUSE',
        code: locationCode || 'WH01'
      }
    }
  }

  /**
   * ดึงรายงานสรุป Balance สำหรับ Product
   * @param {string} productId - รหัส Product
   * @returns {Promise<Object>} สรุป Balance ทุก Location
   */
  async getProductBalanceSummary(productId) {
    try {
      const result = await this.engine.list('inventory_balance')
      const balances = result?.data || []

      return BalanceHelpers.summarizeByProduct(balances, productId)

    } catch (error) {
      console.error('❌ [BalanceManager] Error getting balance summary:', error)
      throw error
    }
  }

  /**
   * ตรวจสอบ Stock Alerts สำหรับ Product
   * @param {string} productId - รหัส Product (optional)
   * @returns {Promise<Array>} รายการ alerts
   */
  async checkStockAlerts(productId = null) {
    try {
      const result = await this.engine.list('inventory_balance')
      const balances = result?.data || []

      const targetBalances = productId 
        ? balances.filter(b => b.product_id === productId)
        : balances

      const allAlerts = []
      
      for (const balance of targetBalances) {
        const alerts = BalanceHelpers.checkStockAlerts(balance)
        allAlerts.push(...alerts)
      }

      return allAlerts

    } catch (error) {
      console.error('❌ [BalanceManager] Error checking stock alerts:', error)
      throw error
    }
  }

  /**
   * ตรวจสอบความถูกต้องของ Balance
   * @param {string} balanceId - รหัส Balance
   * @returns {Promise<Object>} ผลการตรวจสอบ
   */
  async validateBalance(balanceId) {
    try {
      const result = await this.engine.list('inventory_balance')
      const balance = result?.data?.find(b => b.id === balanceId)

      if (!balance) {
        return {
          isValid: false,
          errors: ['Balance not found'],
          warnings: []
        }
      }

      return BalanceHelpers.validateBalance(balance)

    } catch (error) {
      console.error('❌ [BalanceManager] Error validating balance:', error)
      throw error
    }
  }
}

// ไม่ export singleton - ให้แต่ละ ERP_CORE instance สร้างเอง
// export const balanceManager = new BalanceManager() // ❌ ลบออก

// Export class for custom instances
export default BalanceManager
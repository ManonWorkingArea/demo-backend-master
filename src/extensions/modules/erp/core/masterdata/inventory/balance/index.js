/**
 * Inventory Balance Transaction Type Configuration
 * 
 * การกำหนดค่า TRANSACTION_TYPE สำหรับ Inventory Balance
 * แบบ Product-Centric: เก็บสต็อครวมของสินค้าแต่ละตัว (ทุก location)
 */

import { INVENTORY_BALANCE_SCHEMA, INVENTORY_BALANCE_INDEXES, INVENTORY_BALANCE_RULES } from './schema.js'
import { INITIAL_BALANCE_DATA, BalanceHelpers } from './data.js'

// Transaction Type Definition
export const INVENTORY_BALANCE_CONFIG = {
  // Transaction Type Information
  type: 'INVENTORY_BALANCE',
  name: 'Product Stock Balance',
  description: 'สต็อครวมของสินค้าแต่ละรายการ (ทุก location รวมกัน)',
  
  // Schema and Validation
  schema: INVENTORY_BALANCE_SCHEMA,
  indexes: INVENTORY_BALANCE_INDEXES,
  rules: INVENTORY_BALANCE_RULES,
  
  // Data Management
  initialData: INITIAL_BALANCE_DATA,
  helpers: BalanceHelpers,
  
  // Business Configuration
  business: {
    // การกำหนดสิทธิ์
    permissions: {
      create: ['inventory_manager', 'warehouse_manager', 'system'],
      read: ['inventory_user', 'inventory_manager', 'warehouse_user', 'warehouse_manager'],
      update: ['inventory_manager', 'warehouse_manager', 'system'],
      delete: ['system'], // ปกติไม่ควรลบ balance records
    },
    
    // กฎทางธุรกิจ
    businessRules: {
      // การคำนวณอัตโนมัติ
      autoCalculation: {
        enabled: true,
        triggers: [
          'INVENTORY_MOVEMENT_CREATED',
          'INVENTORY_MOVEMENT_UPDATED', 
          'INVENTORY_MOVEMENT_DELETED'
        ],
        description: 'คำนวณ balance ใหม่เมื่อมี movement เปลี่ยนแปลง'
      },
      
      // การล็อคข้อมูล
      lockingRules: {
        preventDirectEdit: true,
        allowSystemUpdate: true,
        description: 'ป้องกันการแก้ไขโดยตรง ให้คำนวณจาก movement เท่านั้น'
      },
      
      // การแจ้งเตือน
      alertSystem: {
        enabled: true,
        types: ['LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'REORDER_NEEDED'],
        description: 'ระบบแจ้งเตือนสต็อก'
      }
    },
    
    // การผูกกับ modules อื่น - Product-Centric
    integrations: {
      movements: {
        relationship: 'one-to-many',
        description: 'Balance คำนวณจาก movements ทั้งหมด (ทุก location) ของสินค้า'
      },
      products: {
        relationship: 'one-to-one', 
        foreignKey: 'product_id',
        description: 'เชื่อมโยงกับ product master แบบ 1:1'
      },
      stock_locations: {
        relationship: 'many-to-many',
        description: 'ข้อมูล location ดูจาก location_summary (derived)'
      },
      reservations: {
        relationship: 'one-to-many',
        description: 'การจองสต็อกรวมมีผลต่อ qty_available'
      }
    }
  },
  
  // API Endpoints Configuration
  api: {
    endpoints: {
      // Standard CRUD
      list: '/api/inventory/balance',
      create: '/api/inventory/balance',
      read: '/api/inventory/balance/:id',
      update: '/api/inventory/balance/:id',
      delete: '/api/inventory/balance/:id',
      
      // Business-specific endpoints
      recalculate: '/api/inventory/balance/:productId/recalculate',
      summary: '/api/inventory/balance/summary',
      alerts: '/api/inventory/balance/alerts',
      byProduct: '/api/inventory/balance/product/:productId',
      locations: '/api/inventory/balance/:productId/locations'
    },
    
    // Query parameters - Product-Centric
    queryParams: {
      product_id: 'string',
      product_code: 'string', 
      low_stock: 'boolean',
      out_of_stock: 'boolean',
      overstock: 'boolean',
      active_only: 'boolean',
      has_locations: 'boolean'
    }
  },
  
  // Event System
  events: {
    // Events ที่ balance จะ emit
    emits: [
      'BALANCE_UPDATED',
      'STOCK_ALERT_TRIGGERED',
      'REORDER_POINT_REACHED',
      'NEGATIVE_STOCK_DETECTED'
    ],
    
    // Events ที่ balance จะ listen
    listens: [
      'INVENTORY_MOVEMENT_CREATED',
      'INVENTORY_MOVEMENT_UPDATED',
      'INVENTORY_MOVEMENT_DELETED',
      'STOCK_RESERVATION_CREATED',
      'STOCK_RESERVATION_CANCELLED'
    ]
  },
  
  // Reporting Configuration
  reports: {
    stockSummary: {
      name: 'Stock Summary Report',
      description: 'รายงานสรุปสต็อกแยกตามสินค้าและคลัง',
      groupBy: ['product_code', 'warehouse_code'],
      aggregations: ['sum', 'avg', 'min', 'max']
    },
    
    lowStockAlert: {
      name: 'Low Stock Alert Report', 
      description: 'รายงานสินค้าที่ใกล้หมด',
      filters: ['qty_available <= min_stock_level'],
      sorting: ['qty_available ASC']
    },
    
    stockValuation: {
      name: 'Stock Valuation Report',
      description: 'รายงานมูลค่าสต็อก',
      calculations: ['total_cost', 'unit_cost'],
      groupBy: ['warehouse_code']
    }
  }
}

// Workflow Handlers
export const BALANCE_WORKFLOWS = {
  /**
   * Recalculate Balance from Movements (Product-Centric)
   */
  recalculateFromMovements: async (engine, productId) => {
    try {
      // ดึง movements ทั้งหมดของ product นี้ (ทุก location)
      const movementResult = await engine.list('inventory', {
        filters: {
          product_id: productId,
          subtype: 'stock_movement',
          status: 'completed'
        },
        sort: { movement_date: 1 }
      })
      
      const movements = movementResult?.data || []
      
      // คำนวณ balance ใหม่ (รวมทุก location)
      const calculatedBalance = BalanceHelpers.recalculateCompleteBalance(productId, movements)
      
      // หา balance record ปัจจุบัน (product เดียว)
      const existingResult = await engine.list('inventory_balance', {
        filters: { product_id: productId }
      })
      
      const existing = existingResult?.data?.[0]
      
      if (existing) {
        // อัพเดต existing record
        const updated = await engine.update('inventory_balance', existing.id, {
          ...calculatedBalance,
          id: existing.id,
          product_id: productId,
          product_code: existing.product_code,
          created_by: existing.created_by,
          created_date: existing.created_date,
          updated_by: 'system',
          updated_date: new Date().toISOString()
        }, 'system')
        
        return { success: true, data: updated.data, message: 'Balance recalculated successfully' }
      } else {
        // สร้าง record ใหม่
        const newBalance = BalanceHelpers.createNewBalance(
          productId,
          calculatedBalance.product_code || productId,
          'system'
        )
        
        const created = await engine.create('inventory_balance', {
          ...newBalance,
          ...calculatedBalance
        }, 'system')
        
        return { success: true, data: created.data, message: 'New balance created' }
      }
      
    } catch (error) {
      console.error('Error recalculating balance:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update Balance after Movement (Product-Centric)
   */
  updateFromMovement: async (engine, movementData) => {
    try {
      const { product_id } = movementData
      
      // หา balance ปัจจุบัน (product เดียว)
      const balanceResult = await engine.list('inventory_balance', {
        filters: { product_id }
      })
      
      let balance = balanceResult?.data?.[0]
      
      if (!balance) {
        // สร้าง balance ใหม่ถ้าไม่มี
        balance = BalanceHelpers.createNewBalance(
          product_id,
          movementData.product_code || movementData.sku || product_id,
          'system'
        )
      }
      
      // อัพเดต balance
      const updatedBalance = BalanceHelpers.updateBalanceFromMovement(balance, movementData)
      
      // บันทึกกลับ
      const result = balance.id 
        ? await engine.update('inventory_balance', balance.id, updatedBalance, 'system')
        : await engine.create('inventory_balance', updatedBalance, 'system')
      
      // ตรวจสอบ alerts
      const alerts = BalanceHelpers.checkStockAlerts(result.data || updatedBalance)
      if (alerts.length > 0) {
        // Emit alert events
        alerts.forEach(alert => {
          engine.triggerHook('stockAlert', 'inventory_balance', {
            ...alert,
            balance: updatedBalance
          })
        })
      }
      
      return { success: true, data: result.data || updatedBalance, alerts }
      
    } catch (error) {
      console.error('Error updating balance from movement:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get Location Distribution for Product
   */
  getLocationDistribution: async (engine, productId) => {
    try {
      const balanceResult = await engine.list('inventory_balance', {
        filters: { product_id: productId }
      })
      
      const balance = balanceResult?.data?.[0]
      
      if (!balance) {
        return { 
          success: false, 
          error: 'No balance found for product',
          data: null 
        }
      }
      
      return {
        success: true,
        data: {
          product_id: productId,
          product_code: balance.product_code,
          total_qty: balance.qty_on_hand,
          total_locations: balance.total_locations,
          locations: balance.location_summary || []
        }
      }
      
    } catch (error) {
      console.error('Error getting location distribution:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export Configuration
export default {
  config: INVENTORY_BALANCE_CONFIG,
  workflows: BALANCE_WORKFLOWS
}
/**
 * Work Order Schema
 * กำหนดโครงสร้างข้อมูลสำหรับ Work Order
 */

import { BASE_SCHEMA_STRUCTURE } from '../base/schema.js'

// Work Order Schema Structure
export const WORK_ORDER_SCHEMA = {
  // Inherit base schema
  ...BASE_SCHEMA_STRUCTURE,
  
  // Work Order specific fields
  order_number: { type: 'string', required: false },
  sales_order_id: { type: 'string', required: false },
  
  // Customer information (copied from sales order)
  customer_name: { type: 'string', required: false },
  customer_phone: { type: 'string', required: false },
  customer_email: { type: 'string', required: false },
  
  // Work Order details
  due_date: { type: 'date', required: false },
  priority: { type: 'string', required: false, enum: ['low', 'normal', 'high', 'urgent'] },
  warehouse: { type: 'string', required: false },
  
  // Items array for picking
  items: {
    type: 'array',
    required: false,
    items: {
      properties: {
        id: { type: 'string', required: false },
        product_id: { type: 'string', required: false },
        product_name: { type: 'string', required: false },
        sku: { type: 'string', required: false },
        required_quantity: { type: 'number', required: false, min: 0 },
        picked_quantity: { type: 'number', required: false, min: 0 },
        unit: { type: 'string', required: false },
        status: { type: 'string', required: false, enum: ['pending', 'picking', 'picked', 'ready'] }
      }
    }
  },
  
  // Inventory reservations for stock control
  inventory_reservations: {
    type: 'array',
    required: false,
    items: {
      properties: {
        inventory_id: { type: 'string', required: false },
        product_id: { type: 'string', required: false },
        product_name: { type: 'string', required: false },
        sku: { type: 'string', required: false },
        reserved_quantity: { type: 'number', required: false, min: 0 },
        picked_quantity: { type: 'number', required: false, min: 0 },
        unit: { type: 'string', required: false },
        status: { type: 'string', required: false, enum: ['reserved', 'pending', 'picking', 'picked', 'complete'] },
        notes: { type: 'string', required: false },
        created_date: { type: 'date', required: false },
        work_order_id: { type: 'string', required: false }
      }
    }
  },
  
  // Workflow
  workflow_status: { type: 'string', required: false },
  assigned_to: { type: 'string', required: false },
  
  // Timing fields - additional timestamps for work order lifecycle
  picking_started_at: { type: 'date', required: false },
  picking_completed_at: { type: 'date', required: false },
  ready_at: { type: 'date', required: false },
  completed_at: { type: 'date', required: false },
  
  // Activity log (using BASE_SCHEMA pattern)
  activityLog: {
    type: 'array',
    required: false,
    items: {
      properties: {
        timestamp: { type: 'date', required: false },
        user: { type: 'string', required: false },
        action: { type: 'string', required: false },
        description: { type: 'string', required: false },
        notes: { type: 'string', required: false },
        from_status: { type: 'string', required: false },
        to_status: { type: 'string', required: false }
      }
    }
  },
  
  // Local activity log (client-side only)
  _localActivityLog: {
    type: 'array',
    required: false,
    items: {
      properties: {
        timestamp: { type: 'date', required: false },
        user: { type: 'string', required: false },
        action: { type: 'string', required: false },
        description: { type: 'string', required: false },
        notes: { type: 'string', required: false },
        from_status: { type: 'string', required: false },
        to_status: { type: 'string', required: false }
      }
    }
  }
}

// Work Order transaction states
export const WORK_ORDER_STATES = ['pending', 'picking', 'picked', 'ready', 'complete']

// Work Order state transitions
export const WORK_ORDER_TRANSITIONS = {
  'pending': ['picking'],
  'picking': ['picked'],
  'picked': ['ready'],
  'ready': ['complete'],
  'complete': []
}

// Initial state
export const WORK_ORDER_INITIAL_STATE = 'pending'

// Export default schema
export default WORK_ORDER_SCHEMA
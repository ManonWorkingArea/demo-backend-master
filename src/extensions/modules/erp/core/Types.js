/**
 * Transaction Types Configuration
 * Constants และ State Machine สำหรับ ERP Core
 * Import จาก masterdata modules (SOT)
 */

// Import States จาก masterdata modules
import {
  INVENTORY_STATES,
  INVENTORY_TRANSITIONS,
  INVENTORY_INITIAL_STATE,
  INVENTORY_STORAGE_KEY
} from './masterdata/inventory/schema.js'

// Import Stock Location sub-module states
import {
  STOCK_LOCATION_STATES,
  STOCK_LOCATION_TRANSITIONS,
  STOCK_LOCATION_INITIAL_STATE,
  STOCK_LOCATION_STORAGE_KEY
} from './masterdata/inventory/stock_locations/schema.js'

// Import Lot Registry sub-module states
import {
  LOT_REGISTRY_STATES,
  LOT_REGISTRY_TRANSITIONS,
  LOT_REGISTRY_INITIAL_STATE,
  LOT_REGISTRY_STORAGE_KEY
} from './masterdata/inventory/lot_registry/schema.js'

// Import Customer states
import {
  CUSTOMER_STATES,
  CUSTOMER_TRANSITIONS,
  CUSTOMER_INITIAL_STATE,
  CUSTOMER_STORAGE_KEY
} from './masterdata/customer/schema.js'

// Import HR states
// HR_STORAGE_KEYS available but not used in this file

// Import Inventory Balance sub-module states
// Schema มีให้ใช้แต่ไม่ต้อง import ตรงนี้ เพราะใช้ใน TransactionEngine แทน

import {
  PURCHASE_STATES,
  PURCHASE_TRANSITIONS,
  PURCHASE_INITIAL_STATE,
  PURCHASE_STORAGE_KEY
} from './masterdata/purchase/schema.js'

import {
  SALES_STATES,
  SALES_TRANSITIONS,
  SALES_INITIAL_STATE,
  SALES_STORAGE_KEY
} from './masterdata/sales/schema.js'

import {
  DELIVERY_STATES,
  DELIVERY_TRANSITIONS,
  DELIVERY_INITIAL_STATE,
  DELIVERY_STORAGE_KEY
} from './masterdata/delivery/schema.js'

import {
  WORKORDER_STATES,
  WORKORDER_TRANSITIONS,
  WORKORDER_INITIAL_STATE,
  WORKORDER_STORAGE_KEY
} from './masterdata/workorder/schema.js'

import {
  PRODUCTION_STATES,
  PRODUCTION_TRANSITIONS,
  PRODUCTION_INITIAL_STATE,
  PRODUCTION_STORAGE_KEY
} from './masterdata/production/schema.js'

import {
  RETURNS_STATES,
  RETURNS_TRANSITIONS,
  RETURNS_INITIAL_STATE,
  RETURNS_STORAGE_KEY
} from './masterdata/returns/schema.js'

import {
  QUOTATION_STATES,
  QUOTATION_TRANSITIONS,
  QUOTATION_INITIAL_STATE,
  QUOTATION_STORAGE_KEY
} from './masterdata/quotation/schema.js'

import {
  PAYMENT_STATES,
  PAYMENT_TRANSITIONS,
  PAYMENT_INITIAL_STATE,
  PAYMENT_STORAGE_KEY
} from './masterdata/payment/schema.js'

import {
  SUPPLIER_STATUS
} from './masterdata/supplier/schema.js'

// ประเภทธุรกรรมหลัก (Fix Master)
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  PRODUCTION: 'production',
  WORK_ORDER: 'work-order',
  SALES: 'sales',
  SALES_ORDER: 'sales-order',
  PRODUCT: 'product', // ✅ Product Master Data
  INVENTORY: 'inventory', // ✅ Inventory Transaction Log
  STOCK_LOCATION: 'stock_location', // ✅ Stock Location Sub-module
  INVENTORY_BALANCE: 'inventory_balance', // ✅ Inventory Balance Sub-module
  LOT_REGISTRY: 'lot_registry', // ✅ Lot Registry Sub-module
  DELIVERY: 'delivery',
  RETURNS: 'returns',
  QUOTATION: 'quotation',
  PAYMENT: 'payment',
  FINANCE: 'finance',
  RECEIPT: 'receipt',
  INVOICE: 'invoice',
  TAX_INVOICE: 'tax-invoice',
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer', // ✅ Customer Master Data
  HR: 'hr', // ✅ HR Master Data
  HR_EMPLOYEE: 'hr_employee',
  HR_USER: 'hr_user',
  HR_DEPARTMENT: 'hr_department',
  HR_POSITION: 'hr_position',
  CODE_MANAGEMENT: 'codeManagement',
  CODE_SEQUENCE: 'code_sequence'
}

// State Machine สำหรับแต่ละประเภทธุรกรรม (จาก masterdata SOT)
export const TRANSACTION_STATES = {
  [TRANSACTION_TYPES.PURCHASE]: PURCHASE_STATES,
  [TRANSACTION_TYPES.PRODUCTION]: PRODUCTION_STATES,
  [TRANSACTION_TYPES.WORK_ORDER]: WORKORDER_STATES,
  [TRANSACTION_TYPES.SALES]: SALES_STATES,
  [TRANSACTION_TYPES.SALES_ORDER]: SALES_STATES, // ใช้ร่วมกับ SALES
  [TRANSACTION_TYPES.PRODUCT]: ['draft', 'active', 'inactive', 'discontinued'], // ✅ Product Master States
  [TRANSACTION_TYPES.INVENTORY]: INVENTORY_STATES, // ✅ Inventory Transaction States
  [TRANSACTION_TYPES.STOCK_LOCATION]: STOCK_LOCATION_STATES, // ✅ Stock Location Sub-module States
  [TRANSACTION_TYPES.INVENTORY_BALANCE]: ['active', 'recalculating', 'locked'], // ✅ Balance States
  [TRANSACTION_TYPES.LOT_REGISTRY]: LOT_REGISTRY_STATES, // ✅ Lot Registry Sub-module States
  [TRANSACTION_TYPES.DELIVERY]: DELIVERY_STATES,
  [TRANSACTION_TYPES.RETURNS]: RETURNS_STATES,
  [TRANSACTION_TYPES.QUOTATION]: QUOTATION_STATES,
  [TRANSACTION_TYPES.PAYMENT]: PAYMENT_STATES,
  [TRANSACTION_TYPES.FINANCE]: ['draft', 'verified', 'approved', 'posted', 'locked', 'cancelled'],
  [TRANSACTION_TYPES.RECEIPT]: ['draft', 'issued', 'paid', 'cancelled'],
  [TRANSACTION_TYPES.INVOICE]: ['draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled', 'voided'],
  [TRANSACTION_TYPES.TAX_INVOICE]: ['draft', 'issued', 'paid', 'cancelled'],
  [TRANSACTION_TYPES.SUPPLIER]: Object.keys(SUPPLIER_STATUS),
  [TRANSACTION_TYPES.CUSTOMER]: CUSTOMER_STATES, // ✅ Customer Master States
  [TRANSACTION_TYPES.HR]: ['active', 'inactive'], // ✅ HR Master States
  [TRANSACTION_TYPES.HR_EMPLOYEE]: ['active', 'inactive', 'on_leave', 'suspended', 'terminated', 'resigned'],
  [TRANSACTION_TYPES.HR_USER]: ['active', 'inactive', 'locked', 'pending', 'suspended'],
  [TRANSACTION_TYPES.HR_DEPARTMENT]: ['active', 'inactive', 'reorganizing', 'dissolved'],
  [TRANSACTION_TYPES.HR_POSITION]: ['active', 'inactive', 'deprecated'],
  [TRANSACTION_TYPES.CODE_MANAGEMENT]: ['draft', 'active', 'inactive'],
  [TRANSACTION_TYPES.CODE_SEQUENCE]: ['active', 'inactive']
}

// State Transitions - การเปลี่ยน state ที่อนุญาต (จาก masterdata SOT)
export const TRANSACTION_TRANSITIONS = {
  [TRANSACTION_TYPES.PURCHASE]: PURCHASE_TRANSITIONS,
  [TRANSACTION_TYPES.PRODUCTION]: PRODUCTION_TRANSITIONS,
  [TRANSACTION_TYPES.WORK_ORDER]: WORKORDER_TRANSITIONS,
  [TRANSACTION_TYPES.SALES]: SALES_TRANSITIONS,
  [TRANSACTION_TYPES.SALES_ORDER]: SALES_TRANSITIONS, // ใช้ร่วมกับ SALES
  [TRANSACTION_TYPES.PRODUCT]: { // ✅ Product Master Transitions
    'draft': ['active', 'inactive'],
    'active': ['inactive', 'discontinued'],
    'inactive': ['active', 'discontinued'],
    'discontinued': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.INVENTORY]: INVENTORY_TRANSITIONS, // ✅ Inventory Transaction Transitions
  [TRANSACTION_TYPES.STOCK_LOCATION]: STOCK_LOCATION_TRANSITIONS, // ✅ Stock Location Sub-module Transitions
  [TRANSACTION_TYPES.INVENTORY_BALANCE]: { // ✅ Inventory Balance Sub-module Transitions
    'active': ['recalculating', 'locked'],
    'recalculating': ['active', 'locked'],
    'locked': ['active']
  },
  [TRANSACTION_TYPES.LOT_REGISTRY]: LOT_REGISTRY_TRANSITIONS, // ✅ Lot Registry Sub-module Transitions
  [TRANSACTION_TYPES.DELIVERY]: DELIVERY_TRANSITIONS,
  [TRANSACTION_TYPES.RETURNS]: RETURNS_TRANSITIONS,
  [TRANSACTION_TYPES.QUOTATION]: QUOTATION_TRANSITIONS,
  [TRANSACTION_TYPES.PAYMENT]: PAYMENT_TRANSITIONS,
  [TRANSACTION_TYPES.FINANCE]: {
    'draft': ['verified', 'cancelled'],
    'verified': ['approved', 'cancelled'],
    'approved': ['posted', 'cancelled'],
    'posted': ['locked'],
    'locked': [], // สถานะสุดท้าย ไม่สามารถแก้ไขได้
    'cancelled': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.RECEIPT]: {
    'draft': ['issued', 'cancelled'],
    'issued': ['paid'],
    'paid': [], // สถานะสุดท้าย
    'cancelled': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.INVOICE]: {
    'draft': ['sent', 'cancelled'],
    'sent': ['viewed', 'paid', 'overdue', 'voided'],
    'viewed': ['partial_paid', 'paid', 'overdue', 'voided'],
    'partial_paid': ['paid', 'overdue', 'voided'],
    'paid': [], // สถานะสุดท้าย
    'overdue': ['partial_paid', 'paid', 'cancelled'],
    'cancelled': [], // สถานะสุดท้าย
    'voided': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.TAX_INVOICE]: {
    'draft': ['issued', 'cancelled'],
    'issued': ['paid'],
    'paid': [], // สถานะสุดท้าย
    'cancelled': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.SUPPLIER]: {
    'active': ['inactive', 'suspended'],
    'inactive': ['active'],
    'suspended': ['active', 'inactive']
  },
  [TRANSACTION_TYPES.CUSTOMER]: CUSTOMER_TRANSITIONS, // ✅ Customer Master Transitions
  [TRANSACTION_TYPES.HR]: { // ✅ HR Master Transitions
    'active': ['inactive'],
    'inactive': ['active']
  },
  [TRANSACTION_TYPES.HR_EMPLOYEE]: { // ✅ HR Employee Transitions
    'active': ['inactive', 'on_leave', 'suspended', 'terminated', 'resigned'],
    'inactive': ['active'],
    'on_leave': ['active', 'inactive'],
    'suspended': ['active', 'terminated'],
    'terminated': [], // สถานะสุดท้าย
    'resigned': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.HR_USER]: { // ✅ HR User Transitions
    'pending': ['active', 'inactive'],
    'active': ['inactive', 'locked', 'suspended'],
    'inactive': ['active'],
    'locked': ['active'],
    'suspended': ['active', 'inactive']
  },
  [TRANSACTION_TYPES.HR_DEPARTMENT]: { // ✅ HR Department Transitions
    'active': ['inactive', 'reorganizing'],
    'inactive': ['active'],
    'reorganizing': ['active', 'dissolved'],
    'dissolved': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.HR_POSITION]: { // ✅ HR Position Transitions
    'active': ['inactive', 'deprecated'],
    'inactive': ['active'],
    'deprecated': [] // สถานะสุดท้าย
  },
  [TRANSACTION_TYPES.CODE_MANAGEMENT]: {
    'draft': ['active', 'inactive'],
    'active': ['inactive'],
    'inactive': ['active']
  },
  [TRANSACTION_TYPES.CODE_SEQUENCE]: {
    'active': ['inactive'],
    'inactive': ['active']
  }
}



// Initial states สำหรับแต่ละประเภทธุรกรรม (จาก masterdata SOT)
export const INITIAL_STATES = {
  [TRANSACTION_TYPES.PURCHASE]: PURCHASE_INITIAL_STATE,
  [TRANSACTION_TYPES.PRODUCTION]: PRODUCTION_INITIAL_STATE,
  [TRANSACTION_TYPES.WORK_ORDER]: WORKORDER_INITIAL_STATE,
  [TRANSACTION_TYPES.SALES]: SALES_INITIAL_STATE,
  [TRANSACTION_TYPES.SALES_ORDER]: SALES_INITIAL_STATE,
  [TRANSACTION_TYPES.PRODUCT]: 'active', // ✅ Product Master Initial State
  [TRANSACTION_TYPES.INVENTORY]: INVENTORY_INITIAL_STATE, // ✅ Inventory Transaction Initial State
  [TRANSACTION_TYPES.STOCK_LOCATION]: STOCK_LOCATION_INITIAL_STATE, // ✅ Stock Location Sub-module Initial State
  [TRANSACTION_TYPES.INVENTORY_BALANCE]: 'active', // ✅ Inventory Balance Sub-module Initial State
  [TRANSACTION_TYPES.LOT_REGISTRY]: LOT_REGISTRY_INITIAL_STATE, // ✅ Lot Registry Sub-module Initial State
  [TRANSACTION_TYPES.DELIVERY]: DELIVERY_INITIAL_STATE,
  [TRANSACTION_TYPES.RETURNS]: RETURNS_INITIAL_STATE,
  [TRANSACTION_TYPES.QUOTATION]: QUOTATION_INITIAL_STATE,
  [TRANSACTION_TYPES.PAYMENT]: PAYMENT_INITIAL_STATE,
  [TRANSACTION_TYPES.FINANCE]: 'draft',
  [TRANSACTION_TYPES.RECEIPT]: 'issued',
  [TRANSACTION_TYPES.INVOICE]: 'draft',
  [TRANSACTION_TYPES.TAX_INVOICE]: 'issued',
  [TRANSACTION_TYPES.SUPPLIER]: 'active',
  [TRANSACTION_TYPES.CUSTOMER]: CUSTOMER_INITIAL_STATE, // ✅ Customer Master Initial State
  [TRANSACTION_TYPES.HR]: 'active', // ✅ HR Master Initial State
  [TRANSACTION_TYPES.HR_EMPLOYEE]: 'active', // ✅ HR Employee Initial State
  [TRANSACTION_TYPES.HR_USER]: 'pending', // ✅ HR User Initial State
  [TRANSACTION_TYPES.HR_DEPARTMENT]: 'active', // ✅ HR Department Initial State
  [TRANSACTION_TYPES.HR_POSITION]: 'active', // ✅ HR Position Initial State
  [TRANSACTION_TYPES.CODE_MANAGEMENT]: 'active',
  [TRANSACTION_TYPES.CODE_SEQUENCE]: 'active'
}

// Storage keys สำหรับแต่ละประเภทธุรกรรม (จาก masterdata SOT)
export const STORAGE_KEYS = {
  [TRANSACTION_TYPES.PURCHASE]: PURCHASE_STORAGE_KEY,
  [TRANSACTION_TYPES.PRODUCTION]: PRODUCTION_STORAGE_KEY,
  [TRANSACTION_TYPES.WORK_ORDER]: WORKORDER_STORAGE_KEY,
  [TRANSACTION_TYPES.SALES]: SALES_STORAGE_KEY,
  [TRANSACTION_TYPES.SALES_ORDER]: 'erp_sales_order_transactions',
  [TRANSACTION_TYPES.PRODUCT]: 'erp_product_masterdata', // ✅ Product Master Storage
  [TRANSACTION_TYPES.INVENTORY]: INVENTORY_STORAGE_KEY, // ✅ Inventory Transaction Storage
  [TRANSACTION_TYPES.STOCK_LOCATION]: STOCK_LOCATION_STORAGE_KEY, // ✅ Stock Location Sub-module Storage
  [TRANSACTION_TYPES.INVENTORY_BALANCE]: 'erp_inventory_balance_data', // ✅ Inventory Balance Sub-module Storage
  [TRANSACTION_TYPES.LOT_REGISTRY]: LOT_REGISTRY_STORAGE_KEY, // ✅ Lot Registry Sub-module Storage
  [TRANSACTION_TYPES.DELIVERY]: DELIVERY_STORAGE_KEY,
  [TRANSACTION_TYPES.RETURNS]: RETURNS_STORAGE_KEY,
  [TRANSACTION_TYPES.QUOTATION]: QUOTATION_STORAGE_KEY,
  [TRANSACTION_TYPES.PAYMENT]: PAYMENT_STORAGE_KEY,
  [TRANSACTION_TYPES.FINANCE]: 'erp_finance_transactions',
  [TRANSACTION_TYPES.RECEIPT]: 'erp_receipt_transactions',
  [TRANSACTION_TYPES.INVOICE]: 'erp_invoice_transactions',
  [TRANSACTION_TYPES.TAX_INVOICE]: 'erp_tax_invoice_transactions',
  [TRANSACTION_TYPES.SUPPLIER]: 'erp_supplier_masterdata',
  [TRANSACTION_TYPES.CUSTOMER]: CUSTOMER_STORAGE_KEY, // ✅ Customer Master Storage
  [TRANSACTION_TYPES.CODE_MANAGEMENT]: 'erp_code_management_masterdata',
  [TRANSACTION_TYPES.CODE_SEQUENCE]: 'erp_code_sequence_data'
}

// Helper Functions
export function isValidTransactionType(type) {
  return Object.values(TRANSACTION_TYPES).includes(type)
}

export function isValidState(type, state) {
  return TRANSACTION_STATES[type] && TRANSACTION_STATES[type].includes(state)
}

export function canTransitionTo(type, currentState, newState) {
  const transitions = TRANSACTION_TRANSITIONS[type]
  return transitions && transitions[currentState] && transitions[currentState].includes(newState)
}
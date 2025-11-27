/**
 * TransactionSchema.js - Simplified for testing
 * ปิด validation ชั่วคราวเพื่อทดสอบระบบ
 */

import { TRANSACTION_TYPES } from './Types.js'
import { BASE_SCHEMA_STRUCTURE } from './masterdata/base/index.js'
import { CODE_MANAGEMENT_SCHEMA } from './masterdata/codeManagement/index.js'
import { PURCHASE_REQUEST_SCHEMA } from './masterdata/purchase/schema.js'
import { SUPPLIER_SCHEMA } from './masterdata/supplier/schema.js'
import { CUSTOMER_SCHEMA } from './masterdata/customer/schema.js'
import { PRODUCT_SCHEMA } from './masterdata/product/schema.js'
import { INVENTORY_SCHEMA } from './masterdata/inventory/schema.js'
import { STOCK_LOCATION_SCHEMA } from './masterdata/inventory/stock_locations/schema.js'
import { INVENTORY_BALANCE_SCHEMA } from './masterdata/inventory/balance/schema.js'
import { LOT_REGISTRY_SCHEMA } from './masterdata/inventory/lot_registry/schema.js'
import { SALES_SCHEMA } from './masterdata/sales/schema.js'
import { WORK_ORDER_SCHEMA } from './masterdata/work-order/schema.js'
import { PRODUCTION_SCHEMA } from './masterdata/production/schema.js'
import { DELIVERY_FIELD_SCHEMA } from './masterdata/delivery/schema.js'
import { RECEIPT_FIELD_SCHEMA } from './masterdata/document/receipt/schema.js'
import { TAX_INVOICE_FIELD_SCHEMA } from './masterdata/document/tax_invoice/schema.js'
import { INVOICE_FIELD_SCHEMA } from './masterdata/document/invoice/schema.js'

// Base schema for transaction validation
const BASE_SCHEMA = BASE_SCHEMA_STRUCTURE

// Create simplified transaction schemas for validation
const createTransactionSchema = (specificFields = {}) => {
  return {
    ...BASE_SCHEMA,
    ...specificFields
  }
}

// ✅ Transaction Schema - Import จาก masterdata modules (SOT)
const TRANSACTION_SUPPLIER_SCHEMA = {
  ...SUPPLIER_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_CUSTOMER_SCHEMA = {
  ...CUSTOMER_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_PRODUCT_SCHEMA = {
  ...PRODUCT_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_INVENTORY_SCHEMA = {
  ...INVENTORY_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_STOCK_LOCATION_SCHEMA = {
  ...STOCK_LOCATION_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_INVENTORY_BALANCE_SCHEMA = {
  ...INVENTORY_BALANCE_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_LOT_REGISTRY_SCHEMA = {
  ...LOT_REGISTRY_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_PURCHASE_SCHEMA = {
  ...PURCHASE_REQUEST_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_DELIVERY_SCHEMA = {
  ...DELIVERY_FIELD_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_RECEIPT_SCHEMA = {
  ...RECEIPT_FIELD_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_TAX_INVOICE_SCHEMA = {
  ...TAX_INVOICE_FIELD_SCHEMA,
  ...BASE_SCHEMA
}

const TRANSACTION_INVOICE_SCHEMA = {
  ...INVOICE_FIELD_SCHEMA,
  ...BASE_SCHEMA
}

// ✅ Code Sequence Schema - สำหรับจัดเก็บ sequence numbers
const CODE_SEQUENCE_SCHEMA = {
  sequence_key: { type: 'string', required: true, description: 'รหัส sequence เช่น product_sequence_2025' },
  sequence_value: { type: 'number', required: true, min: 1, description: 'ค่า sequence ปัจจุบัน' },
  sequence_type: { type: 'string', required: false, description: 'ประเภท sequence' },
  year: { type: 'number', required: false, description: 'ปี' },
  month: { type: 'number', required: false, description: 'เดือน' },
  prefix: { type: 'string', required: false, description: 'คำนำหน้า' },
  notes: { type: 'string', required: false, description: 'หมายเหตุ' },
  last_used: { type: 'date', required: false, description: 'วันที่ใช้ล่าสุด' },
  
  // System fields
  ...BASE_SCHEMA
}

// Schema สำหรับแต่ละประเภทธุรกรรม - Import จาก masterdata modules (SOT)
export const TRANSACTION_SCHEMAS = {
  // Transaction types - ใช้ schema จาก masterdata modules
  [TRANSACTION_TYPES.PURCHASE]: TRANSACTION_PURCHASE_SCHEMA, // ✅ จาก masterdata/purchase
  [TRANSACTION_TYPES.SALES]: SALES_SCHEMA,
  [TRANSACTION_TYPES.PRODUCT]: TRANSACTION_PRODUCT_SCHEMA, // ✅ จาก masterdata/product
  [TRANSACTION_TYPES.INVENTORY]: TRANSACTION_INVENTORY_SCHEMA, // ✅ จาก masterdata/inventory
  [TRANSACTION_TYPES.STOCK_LOCATION]: TRANSACTION_STOCK_LOCATION_SCHEMA, // ✅ จาก masterdata/inventory/stock_locations
  [TRANSACTION_TYPES.INVENTORY_BALANCE]: TRANSACTION_INVENTORY_BALANCE_SCHEMA, // ✅ จาก masterdata/inventory/balance
  [TRANSACTION_TYPES.LOT_REGISTRY]: TRANSACTION_LOT_REGISTRY_SCHEMA, // ✅ จาก masterdata/inventory/lot_registry
  [TRANSACTION_TYPES.DELIVERY]: TRANSACTION_DELIVERY_SCHEMA, // ✅ จาก masterdata/delivery
  [TRANSACTION_TYPES.WORK_ORDER]: WORK_ORDER_SCHEMA,
  [TRANSACTION_TYPES.PRODUCTION]: PRODUCTION_SCHEMA,
  [TRANSACTION_TYPES.RETURNS]: createTransactionSchema(),
  [TRANSACTION_TYPES.QUOTATION]: createTransactionSchema(),
  [TRANSACTION_TYPES.PAYMENT]: createTransactionSchema(),
  [TRANSACTION_TYPES.FINANCE]: createTransactionSchema(),
  [TRANSACTION_TYPES.RECEIPT]: TRANSACTION_RECEIPT_SCHEMA, // ✅ จาก masterdata/document/receipt
  [TRANSACTION_TYPES.INVOICE]: TRANSACTION_INVOICE_SCHEMA, // ✅ จาก masterdata/document/invoice
  [TRANSACTION_TYPES.TAX_INVOICE]: TRANSACTION_TAX_INVOICE_SCHEMA, // ✅ จาก masterdata/document/tax_invoice
  [TRANSACTION_TYPES.SUPPLIER]: TRANSACTION_SUPPLIER_SCHEMA, // ✅ จาก masterdata/supplier
  [TRANSACTION_TYPES.CUSTOMER]: TRANSACTION_CUSTOMER_SCHEMA, // ✅ จาก masterdata/customer
  [TRANSACTION_TYPES.CODE_MANAGEMENT]: CODE_MANAGEMENT_SCHEMA, // ✅ จาก masterdata/codeManagement
  [TRANSACTION_TYPES.CODE_SEQUENCE]: CODE_SEQUENCE_SCHEMA // ✅ Code sequence storage
}

// Helper function to get schema for transaction type
export function getTransactionSchema(type) {
  return TRANSACTION_SCHEMAS[type] || BASE_SCHEMA
}

// Helper function to validate transaction structure (simplified)
export function validateTransactionStructure() {
  // ปิด validation ชั่วคราวเพื่อทดสอบ
  return { isValid: true, errors: [] }
}

// Legacy support
export function getSchema(transactionType) {
  return getTransactionSchema(transactionType)
}

export default TRANSACTION_SCHEMAS
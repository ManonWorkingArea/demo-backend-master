/**
 * Purchase Module Index - CORE COMPLIANT VERSION
 * ปฏิบัติตาม AI Guidelines: Core-Only Access Pattern
 * ❌ NO direct imports from core
 * ✅ ALL operations through ERP_CORE only
 */

// Import Purchase Components
import PurchaseManager from '../components/request/List.vue'

// Export Manager Component
export {
  PurchaseManager
}

/**
 * ✅ CORE-ONLY ACCESS WRAPPER
 * เข้าถึง ERP_CORE ผ่าน global window object เท่านั้น 
 * ตาม AI Guidelines Rule #1: NO direct module imports
 */
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[Purchase Module] ERP_CORE not available - must use Core-Only Access pattern')
}

// === HELPER FUNCTIONS ===

/**
 * กรองฟิลด์ที่ห้ามแก้ไขออกจาก update data
 * @param {Object} data - ข้อมูลที่ต้องการกรอง
 * @returns {Object} - ข้อมูลที่กรองแล้ว
 */
const filterProtectedFields = (data) => {
  // ✅ สำหรับ create อนุญาตให้ส่ง id และ type ได้
  const protectedFields = ['createdAt', 'createdBy']
  const filteredData = { ...data }
  
  protectedFields.forEach(field => {
    delete filteredData[field]
  })
  
  console.log('[Purchase] filterProtectedFields:', {
    input: Object.keys(data),
    output: Object.keys(filteredData),
    removed: protectedFields
  })
  
  return filteredData
}

/**
 * เตรียมข้อมูลสำหรับสร้าง transaction ใหม่
 * @param {Object} data - ข้อมูลดิบ
 * @param {string} subtype - ประเภทย่อยของ transaction
 * @param {string} createdBy - ผู้สร้าง
 * @returns {Object} - ข้อมูลที่เตรียมแล้ว
 */
const prepareTransactionData = (data, subtype = 'purchase_request', createdBy = 'system') => {
  const cleanData = filterProtectedFields(data)
  
  console.log('[Purchase] prepareTransactionData input:', data)
  console.log('[Purchase] prepareTransactionData filtered:', cleanData)
  
  const preparedData = {
    ...cleanData,
    type: 'purchase', // ✅ เพิ่ม type field สำหรับ engine
    subtype,
    created_at: new Date().toISOString(),
    created_by: createdBy,
    updated_at: new Date().toISOString(),
    updated_by: createdBy
  }
  
  console.log('[Purchase] prepareTransactionData output:', preparedData)
  return preparedData
}

/**
 * เตรียมข้อมูลสำหรับ update transaction
 * @param {Object} data - ข้อมูลที่ต้องการ update
 * @param {string} updatedBy - ผู้แก้ไข
 * @returns {Object} - ข้อมูลที่เตรียมแล้ว
 */
const prepareUpdateData = (data, updatedBy = 'system') => {
  const cleanData = filterProtectedFields(data)
  
  return {
    ...cleanData,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy
  }
}

// === PURCHASE FLOW FUNCTIONS ===

/**
 * ✅ CORE COMPLIANT: สร้างใบขอซื้อสินค้า (Purchase Request)
 * ใช้ ERP_CORE.engine.create ตาม AI Guidelines Rule #1
 * @param {Object} requestData - ข้อมูลใบขอซื้อ
 * @returns {Promise<Object>} - ผลลัพธ์การสร้าง PR
 */
export const createPurchaseRequest = async (requestData) => {
  try {
    console.log('[Purchase] Creating Purchase Request with data:', requestData)
    
    const core = getCore()
    
    // เตรียมข้อมูลสำหรับสร้าง transaction
    const prData = prepareTransactionData(requestData, 'purchase_request', requestData.created_by || 'system')
    
    // ✅ ใช้ค่าจาก requestData หรือ default เป็น draft
    prData.status = requestData.status || 'draft'
    prData.workflow_state = requestData.workflow_state || 'draft'
    prData.state = requestData.state || requestData.workflow_state || 'draft'
    
    // เพิ่ม fields ที่จำเป็นสำหรับ purchase transaction
    if (!prData.purchase_request_code && requestData.purchase_request_code) {
      prData.purchase_request_code = requestData.purchase_request_code
    }
    
    // สร้างรหัสอัตโนมัติถ้ายังไม่มี
    if (!prData.purchase_request_code && core.codeManager) {
      try {
        const generatedCode = await core.codeManager.generateCode('purchase')
        if (generatedCode) {
          prData.purchase_request_code = generatedCode
        }
      } catch (codeError) {
        console.warn('[Purchase] Code generation failed, using fallback:', codeError)
        prData.purchase_request_code = `PR${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
      }
    }
    
    console.log('[Purchase] Prepared PR data:', prData)
    
    // ✅ ใช้ Core-Only Access ผ่าน engine.create
    const result = await core.engine.create('purchase', prData, prData.created_by || 'system')
    
    console.log('[Purchase] Create result FULL:', result)
    console.log('[Purchase] Create result.data:', result?.data)
    console.log('[Purchase] Create result keys:', result ? Object.keys(result) : 'null')
    if (result?.data) {
      console.log('[Purchase] Create result.data keys:', Object.keys(result.data))
    }
    
    if (result && result.success !== false) {
      // ✅ หา ID จากหลายๆ ที่ที่เป็นไปได้
      const transactionId = result.id || result.data?.id || result.data?._id || result.transactionId || result.data?.transactionId
      
      console.log('[Purchase] Transaction ID found:', transactionId)
      
      return {
        success: true,
        data: {
          id: transactionId,
          _id: transactionId,
          ...result.data,
          purchase_request_code: prData.purchase_request_code
        },
        message: 'สร้างใบขอซื้อสินค้าเรียบร้อยแล้ว'
      }
    } else {
      throw new Error(result?.message || result?.error || 'ไม่สามารถสร้างใบขอซื้อได้')
    }
    
  } catch (error) {
    console.error('[Purchase] Error creating Purchase Request:', error)
    return {
      success: false,
      error: error.message,
      message: 'เกิดข้อผิดพลาดในการสร้างใบขอซื้อ: ' + error.message
    }
  }
}

/**
 * ✅ CORE COMPLIANT: ยืนยัน Purchase Order
 * ใช้ executeModuleFunction ตาม AI Guidelines Rule #2
 * @param {string} poId - ID ของ Purchase Order
 * @param {Object} approvalData - ข้อมูลการอนุมัติ
 * @returns {Promise<Object>} - ผลลัพธ์การอนุมัติ PO
 */
export const approvePurchaseOrder = async (poId, approvalData) => {
  try {
    const core = getCore()
    
    // ✅ ดึงข้อมูล PO เดิมผ่าน Core-Only Access
    const listResult = await core.executeModuleFunction('transactionEngine', 'list', 'purchase')
    const allPOs = listResult.success ? listResult.data : []
    const existingPO = allPOs.find(po => po.id === poId)
    if (!existingPO) {
      throw new Error('ไม่พบ Purchase Order ที่ระบุ')
    }

    // อัปเดตสถานะเป็น approved - ให้ system สร้าง approved_date อัตโนมัติ
    const approvedBy = approvalData.approved_by || 'system'
    const approvedDate = new Date().toISOString()
    
    const updatedData = prepareUpdateData({
      workflow_state: 'approved',
      status: 'approved',
      state: 'approved', // ✅ เพิ่ม state field
      notes: approvalData.notes || approvalData.approval_notes || 'อนุมัติโดยระบบ'
    }, approvedBy)
    
    // เพิ่ม system-generated fields ที่ readonly
    updatedData.approved_by = approvedBy
    updatedData.approved_date = approvedDate
    
    // ✅ อัปเดตผ่าน Core-Only Access
    const updateResult = await core.executeModuleFunction('transactionEngine', 'update', 'purchase', poId, updatedData)
    
    // Log transaction
    console.log('[Purchase] Approved Purchase Order:', poId)
    
    return {
      success: true,
      data: updateResult,
      message: 'อนุมัติ Purchase Order เรียบร้อยแล้ว'
    }
  } catch (error) {
    console.error('[Purchase] Error approving Purchase Order:', error)
    return {
      success: false,
      error: error.message,
      message: 'เกิดข้อผิดพลาดในการอนุมัติ PO'
    }
  }
}

/**
 * ✅ CORE COMPLIANT: รับของเข้าคลัง - แก้ไขตาม AI Guidelines Rule #4
 * ❌ ห้าม: Purchase module เข้าถึง INVENTORY transactions โดยตรง  
 * ✅ แก้ไข: ใช้ Core orchestration ผ่าน executeModuleFunction
 * @param {string} poId - ID ของ Purchase Order
 * @param {Object} receiptData - ข้อมูลการรับสินค้า
 * @returns {Promise<Object>} - ผลลัพธ์การรับสินค้า
 */
export const receiveGoods = async (poId, receiptData) => {
  try {
    const core = getCore()
    
    // ✅ ดึงข้อมูล PO ผ่าน Core-Only Access
    const poListResult = await core.executeModuleFunction('transactionEngine', 'list', 'purchase')
    const allPOs = poListResult.success ? poListResult.data : []
    const purchaseOrder = allPOs.find(po => po.id === poId)
    if (!purchaseOrder) {
      throw new Error('ไม่พบ Purchase Order ที่ระบุ')
    }

    // ✅ สร้าง Goods Receipt Note (GRN) ผ่าน Core-Only Access
    const grnData = {
      subtype: 'goods_receipt',
      reference_po_id: poId,
      status: 'completed',
      workflow_state: 'received',
      items: receiptData.items || [],
      received_date: receiptData.received_date || new Date().toISOString(),
      received_by: receiptData.received_by || 'system',
      warehouse_location: receiptData.warehouse_location || 'default',
      receipt_notes: receiptData.notes || ''
    }

    const grnResult = await core.executeModuleFunction('transactionEngine', 'create', 'purchase', grnData)

    // ✅ CRITICAL FIX: ใช้ Core orchestration แทนการเข้าถึง inventory โดยตรง
    // เรียก Core เพื่อจัดการ inventory transactions ผ่าน cross-module coordination
    const inventoryOperations = {
      po_id: poId,
      grn_id: grnResult.id,
      items: receiptData.items || [],
      warehouse_location: receiptData.warehouse_location || 'default',
      received_by: receiptData.received_by || 'system',
      received_date: receiptData.received_date || new Date().toISOString()
    }
    
    // ✅ ใช้ Core สำหรับ cross-module operations (Purchase → Inventory)
    const inventoryResult = await core.executeModuleFunction('crossModule', 'handleInventoryReceipt', inventoryOperations)

    // ✅ อัปเดตสถานะ PO ผ่าน Core-Only Access
    const updatedPOData = prepareUpdateData({
      workflow_state: 'received',
      received_date: new Date().toISOString(),
      received_by: receiptData.received_by || 'system',
      receipt_notes: receiptData.receipt_notes || ''
    }, receiptData.received_by || 'system')
    
    await core.executeModuleFunction('transactionEngine', 'update', 'purchase', poId, updatedPOData)

    // Log transaction
    console.log('[Purchase] Received Goods for PO:', poId, 'GRN ID:', grnResult.id)
    
    return {
      success: true,
      data: {
        grn: grnResult,
        inventory_result: inventoryResult,
        updated_po: purchaseOrder
      },
      message: 'รับสินค้าเข้าคลังเรียบร้อยแล้ว'
    }
  } catch (error) {
    console.error('[Purchase] Error receiving goods:', error)
    return {
      success: false,
      error: error.message,
      message: 'เกิดข้อผิดพลาดในการรับสินค้า'
    }
  }
}

/**
 * ✅ CORE COMPLIANT: บันทึกใบแจ้งหนี้ผู้ขาย - แก้ไขตาม AI Guidelines Rule #4
 * ❌ ห้าม: Purchase module เข้าถึง FINANCE transactions โดยตรง
 * ✅ แก้ไข: ใช้ Core cross-module coordination
 * @param {string} poId - ID ของ Purchase Order
 * @param {Object} invoiceData - ข้อมูลใบแจ้งหนี้
 * @returns {Promise<Object>} - ผลลัพธ์การสร้างใบแจ้งหนี้
 */
export const createAPInvoice = async (poId, invoiceData) => {
  try {
    const core = getCore()
    
    // ✅ ดึงข้อมูล PO ผ่าน Core-Only Access
    const invoiceListResult = await core.executeModuleFunction('transactionEngine', 'list', 'purchase')
    const allPOs = invoiceListResult.success ? invoiceListResult.data : []
    const purchaseOrder = allPOs.find(po => po.id === poId)
    if (!purchaseOrder) {
      throw new Error('ไม่พบ Purchase Order ที่ระบุ')
    }

    // ✅ สร้าง AP Invoice ผ่าน Core-Only Access
    const apInvoiceData = {
      subtype: 'ap_invoice',
      reference_po_id: poId,
      status: 'pending_payment',
      workflow_state: 'invoice_created',
      vendor_id: purchaseOrder.vendor_id,
      vendor_invoice_number: invoiceData.vendor_invoice_number,
      invoice_date: invoiceData.invoice_date || new Date().toISOString(),
      due_date: invoiceData.due_date,
      items: invoiceData.items || [],
      subtotal: invoiceData.subtotal || 0,
      tax_amount: invoiceData.tax_amount || 0,
      total_amount: invoiceData.total_amount || 0,
      payment_terms: invoiceData.payment_terms || '30 days',
      invoice_notes: invoiceData.notes || '',
      created_by: invoiceData.created_by || 'system'
    }

    const apResult = await core.executeModuleFunction('transactionEngine', 'create', 'purchase', apInvoiceData)

    // ✅ CRITICAL FIX: ใช้ Core orchestration แทนการเข้าถึง finance โดยตรง
    const financeOperations = {
      po_id: poId,
      invoice_id: apResult.id,
      vendor_id: purchaseOrder.vendor_id,
      amount: invoiceData.total_amount || 0,
      due_date: invoiceData.due_date,
      created_by: invoiceData.created_by || 'system'
    }
    
    // ✅ ใช้ Core สำหรับ cross-module operations (Purchase → Finance)
    const financeResult = await core.executeModuleFunction('crossModule', 'handleAccountsPayable', financeOperations)

    // ✅ อัปเดตสถานะ PO ผ่าน Core-Only Access
    const updatedInvoiceData = prepareUpdateData({
      workflow_state: 'invoiced',
      invoice_number: invoiceData.invoice_number,
      invoice_date: invoiceData.invoice_date || new Date().toISOString(),
      invoice_amount: invoiceData.invoice_amount
    }, invoiceData.created_by || 'system')
    
    await core.executeModuleFunction('transactionEngine', 'update', 'purchase', poId, updatedInvoiceData)

    // Log transaction
    console.log('[Purchase] Created AP Invoice for PO:', poId, 'Invoice ID:', apResult.id)
    
    return {
      success: true,
      data: {
        ap_invoice: apResult,
        finance_result: financeResult,
        updated_po: purchaseOrder
      },
      message: 'บันทึกใบแจ้งหนี้ผู้ขายเรียบร้อยแล้ว'
    }
  } catch (error) {
    console.error('[Purchase] Error creating AP Invoice:', error)
    return {
      success: false,
      error: error.message,
      message: 'เกิดข้อผิดพลาดในการสร้างใบแจ้งหนี้'
    }
  }
}

// Purchase Module Configuration
export const PurchaseConfig = {
  module: 'purchase',
  version: '1.0.0',
  dependencies: ['erp-core'],
  features: [
    'create_purchase_request',
    'approve_purchase_order',
    'receive_goods',
    'create_ap_invoice',
    'create_purchase_order',
    'edit_purchase_order', 
    'delete_purchase_order',
    'list_purchase_orders',
    'search_purchase_orders',
    'inventory_integration',
    'finance_integration'
  ]
}

// Default export (Main Manager Component)
export default PurchaseManager
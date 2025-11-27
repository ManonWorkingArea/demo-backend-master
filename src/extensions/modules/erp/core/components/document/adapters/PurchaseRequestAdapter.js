/**
 * Purchase Request Document Adapter
 * 
 * แปลงข้อมูลจากฐานข้อมูล (ใบขอซื้อ) เป็น Standard Document Schema
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

import { createEmptyDocument, calculateFinancials } from '../schemas/StandardDocumentSchema.js'

/**
 * แปลงข้อมูลใบขอซื้อจาก Database เป็น Standard Document
 * @param {Object} purchaseRequestData - ข้อมูลจาก Database
 * @returns {Object} Standard Document Object
 */
export function adaptPurchaseRequest(purchaseRequestData) {
  if (!purchaseRequestData) {
    console.warn('⚠️ Purchase Request data is null or undefined')
    return createEmptyDocument('purchase_request')
  }
  
  try {
    // สร้าง document พื้นฐาน
    const document = createEmptyDocument('purchase_request')
    
    // ===== DOCUMENT METADATA =====
    document.documentNumber = purchaseRequestData.purchase_request_code 
      || purchaseRequestData.document_number 
      || purchaseRequestData.requestNumber 
      || ''
    
    document.documentDate = purchaseRequestData.request_date 
      || purchaseRequestData.createdAt 
      || purchaseRequestData.created_at 
      || new Date().toISOString()
    
    document.documentStatus = purchaseRequestData.status 
      || purchaseRequestData.workflow_state 
      || 'draft'
    
    // ===== COMPANY INFORMATION =====
    document.company.name = purchaseRequestData.company_name 
      || purchaseRequestData.company?.name 
      || 'บริษัท (ไม่ระบุ)'
    
    document.company.address = purchaseRequestData.company_address 
      || purchaseRequestData.company?.address 
      || ''
    
    document.company.taxId = purchaseRequestData.tax_id 
      || purchaseRequestData.company?.tax_id 
      || ''
    
    document.company.phone = purchaseRequestData.company_phone 
      || purchaseRequestData.company?.phone 
      || ''
    
    document.company.email = purchaseRequestData.company_email 
      || purchaseRequestData.company?.email 
      || ''
    
    document.company.logo = purchaseRequestData.company_logo 
      || purchaseRequestData.company?.logo 
      || 'https://vue-project.sgp1.digitaloceanspaces.com/2025/10/1759901167254.png'
    
    // ===== ISSUER INFORMATION (ผู้ขอซื้อ) =====
    document.issuer.name = purchaseRequestData.requester 
      || purchaseRequestData.requested_by 
      || purchaseRequestData.requesterName 
      || ''
    
    document.issuer.department = purchaseRequestData.department 
      || purchaseRequestData.dept 
      || ''
    
    document.issuer.position = purchaseRequestData.requester_position 
      || purchaseRequestData.position 
      || ''
    
    document.issuer.email = purchaseRequestData.requester_email 
      || ''
    
    document.issuer.phone = purchaseRequestData.requester_phone 
      || ''
    
    // ===== PARTNER INFORMATION (Vendor) =====
    if (purchaseRequestData.vendor || purchaseRequestData.supplier) {
      const vendor = purchaseRequestData.vendor || purchaseRequestData.supplier
      
      document.partner.type = 'vendor'
      document.partner.code = vendor.code || vendor.vendor_code || ''
      document.partner.name = vendor.name || vendor.vendor_name || ''
      document.partner.address = vendor.address || ''
      document.partner.taxId = vendor.tax_id || ''
      document.partner.phone = vendor.phone || ''
      document.partner.email = vendor.email || ''
      document.partner.contactPerson = vendor.contact_person || ''
    }
    
    // ===== DOCUMENT ITEMS =====
    const rawItems = purchaseRequestData.items 
      || purchaseRequestData.request_items 
      || []
    
    document.items = rawItems.map((item, index) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price || item.price) || 0
      const discount = parseFloat(item.discount) || 0
      const discountAmount = parseFloat(item.discount_amount) || 0
      
      const amount = quantity * unitPrice
      const finalAmount = amount - discountAmount
      const taxRate = parseFloat(item.tax_rate) || 0
      const taxAmount = finalAmount * (taxRate / 100)
      const total = finalAmount + taxAmount
      
      return {
        lineNumber: index + 1,
        productCode: item.product_code || item.sku || item.code || '',
        productName: item.product_name || item.name || item.description || '',
        description: item.description || item.specifications || item.remarks || '',
        quantity: quantity,
        unit: item.unit || item.uom || 'ชิ้น',
        unitPrice: unitPrice,
        discount: discount,
        discountAmount: discountAmount,
        amount: Math.round(amount * 100) / 100,
        taxRate: taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round((item.total || total) * 100) / 100,
        remarks: item.remarks || item.note || item.specifications || '',
      }
    })
    
    // ===== FINANCIAL SUMMARY =====
    // ใช้ข้อมูลจาก Database ถ้ามี
    if (purchaseRequestData.subtotal !== undefined || purchaseRequestData.total_amount !== undefined) {
      document.financial.subtotal = parseFloat(purchaseRequestData.subtotal) || 0
      document.financial.vatAmount = parseFloat(purchaseRequestData.tax_amount) || 0
      document.financial.grandTotal = parseFloat(purchaseRequestData.total_amount) || 0
      document.financial.amountBeforeVat = document.financial.subtotal
      document.financial.vatRate = 7 // Default VAT rate
      
      // คำนวณ VAT rate จาก tax_amount และ subtotal ถ้ามี
      if (document.financial.subtotal > 0 && document.financial.vatAmount > 0) {
        const calculatedRate = (document.financial.vatAmount / document.financial.subtotal) * 100
        document.financial.vatRate = Math.round(calculatedRate * 100) / 100
      }
    } else {
      // ถ้าไม่มีข้อมูลการเงิน ให้คำนวณจาก items
      const vatRate = purchaseRequestData.vat_rate || 7
      document.financial = calculateFinancials(document.items, vatRate)
    }
    
    // ===== DELIVERY INFORMATION =====
    document.delivery.expectedDate = purchaseRequestData.required_date 
      || purchaseRequestData.expected_delivery_date 
      || purchaseRequestData.requiredDate 
      || ''
    
    document.delivery.address = purchaseRequestData.delivery_address 
      || purchaseRequestData.shipping_address 
      || ''
    
    document.delivery.contactPerson = purchaseRequestData.delivery_contact 
      || ''
    
    document.delivery.contactPhone = purchaseRequestData.delivery_phone 
      || ''
    
    // ===== WORKFLOW/APPROVAL =====
    document.workflow.currentState = purchaseRequestData.workflow_state 
      || purchaseRequestData.status 
      || 'draft'
    
    if (purchaseRequestData.approval_history || purchaseRequestData.approvalHistory) {
      const approvals = purchaseRequestData.approval_history || purchaseRequestData.approvalHistory
      document.workflow.approvalHistory = approvals.map((approval, index) => ({
        step: index + 1,
        approverName: approval.approver_name || approval.approverName || '',
        approverPosition: approval.approver_position || approval.position || '',
        action: approval.action || approval.status || '',
        date: approval.date || approval.approved_at || '',
        comments: approval.comments || approval.note || '',
      }))
    }
    
    // ===== ADDITIONAL INFORMATION =====
    document.additional.referenceNumber = purchaseRequestData.reference_number 
      || purchaseRequestData.ref_number 
      || ''
    
    document.additional.projectCode = purchaseRequestData.project_code 
      || purchaseRequestData.project 
      || ''
    
    document.additional.costCenter = purchaseRequestData.cost_center 
      || ''
    
    document.additional.remarks = purchaseRequestData.remarks 
      || purchaseRequestData.note 
      || purchaseRequestData.notes 
      || purchaseRequestData.comments 
      || purchaseRequestData.description
      || purchaseRequestData.justification
      || ''
    
    document.additional.notes = purchaseRequestData.notes 
      || purchaseRequestData.internal_notes 
      || ''
    
    // เพิ่มข้อมูลเฉพาะของ Purchase Request
    if (purchaseRequestData.priority) {
      document.additional.priority = purchaseRequestData.priority
    }
    
    if (purchaseRequestData.purchase_type) {
      document.additional.purchaseType = purchaseRequestData.purchase_type
    }
    
    if (purchaseRequestData.category) {
      document.additional.category = purchaseRequestData.category
    }
    
    if (purchaseRequestData.budget_code) {
      document.additional.budgetCode = purchaseRequestData.budget_code
    }
    
    if (purchaseRequestData.payment_terms) {
      document.payment.terms = purchaseRequestData.payment_terms
    }
    
    if (purchaseRequestData.supplier_suggestion) {
      document.partner.name = purchaseRequestData.supplier_suggestion
    }
    
    // ===== PAGINATION CALCULATION =====
    // คำนวณจำนวนหน้าที่ต้องใช้ (5 รายการต่อหน้า)
    const ITEMS_PER_PAGE = 5
    const totalItems = document.items.length
    const calculatedPages = totalItems > 0 ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 1
    
    // เพิ่มข้อมูลการแบ่งหน้าใน metadata
    document.metadata.pagination = {
      itemsPerPage: ITEMS_PER_PAGE,
      totalItems: totalItems,
      totalPages: calculatedPages,
      calculatedAt: new Date().toISOString()
    }
    
    // ===== SYSTEM METADATA =====
    document.metadata.createdAt = purchaseRequestData.createdAt 
      || purchaseRequestData.created_at 
      || new Date().toISOString()
    
    document.metadata.createdBy = purchaseRequestData.created_by 
      || purchaseRequestData.createdBy 
      || ''
    
    document.metadata.updatedAt = purchaseRequestData.updatedAt 
      || purchaseRequestData.updated_at 
      || new Date().toISOString()
    
    document.metadata.updatedBy = purchaseRequestData.updated_by 
      || purchaseRequestData.updatedBy 
      || ''
    
    document.metadata.version = purchaseRequestData.version || 1
    document.metadata.source = purchaseRequestData.source || 'web'
    
    console.log('✅ Purchase Request adapted successfully:', {
      documentNumber: document.documentNumber,
      itemsCount: document.items.length,
      totalPages: calculatedPages,
      grandTotal: document.financial.grandTotal
    })
    
    return document
    
  } catch (error) {
    console.error('❌ Error adapting Purchase Request:', error)
    return createEmptyDocument('purchase_request')
  }
}

/**
 * Reverse adapter: แปลง Standard Document กลับเป็นรูปแบบ Database
 * @param {Object} standardDocument - Standard Document Object
 * @returns {Object} Database format
 */
export function reverseAdaptPurchaseRequest(standardDocument) {
  return {
    purchase_request_code: standardDocument.documentNumber,
    request_date: standardDocument.documentDate,
    status: standardDocument.documentStatus,
    
    company_name: standardDocument.company.name,
    company_address: standardDocument.company.address,
    tax_id: standardDocument.company.taxId,
    
    requester: standardDocument.issuer.name,
    department: standardDocument.issuer.department,
    
    items: standardDocument.items.map(item => ({
      product_code: item.productCode,
      product_name: item.productName,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      total: item.total,
    })),
    
    total_amount: standardDocument.financial.grandTotal,
    vat_rate: standardDocument.financial.vatRate,
    
    required_date: standardDocument.delivery.expectedDate,
    remarks: standardDocument.additional.remarks,
    
    created_at: standardDocument.metadata.createdAt,
    created_by: standardDocument.metadata.createdBy,
  }
}

export default {
  adaptPurchaseRequest,
  reverseAdaptPurchaseRequest,
}

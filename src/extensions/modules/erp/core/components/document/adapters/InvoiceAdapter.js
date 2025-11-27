/**
 * Invoice Document Adapter
 * 
 * แปลงข้อมูลจากฐานข้อมูล (ใบแจ้งหนี้) เป็น Standard Document Schema
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

import { createEmptyDocument, calculateFinancials } from '../schemas/StandardDocumentSchema.js'

/**
 * แปลงข้อมูลใบแจ้งหนี้จาก Database เป็น Standard Document
 * @param {Object} invoiceData - ข้อมูลจาก Database
 * @returns {Object} Standard Document Object
 */
export function adaptInvoice(invoiceData) {
  if (!invoiceData) {
    console.warn('⚠️ Invoice data is null or undefined')
    return createEmptyDocument('invoice')
  }
  
  try {
    const document = createEmptyDocument('invoice')
    
    // Document metadata
    document.documentNumber = invoiceData.invoice_number || invoiceData.invoice_code || ''
    document.documentDate = invoiceData.invoice_date || invoiceData.created_at || new Date().toISOString()
    document.documentStatus = invoiceData.status || 'draft'
    
    // Company
    document.company.name = invoiceData.company_name || ''
    document.company.address = invoiceData.company_address || ''
    document.company.taxId = invoiceData.company_tax_id || ''
    document.company.phone = invoiceData.company_phone || ''
    document.company.email = invoiceData.company_email || ''
    
    // Issuer (ผู้ออกใบแจ้งหนี้)
    document.issuer.name = invoiceData.issued_by || ''
    document.issuer.department = invoiceData.issuer_department || ''
    
    // Partner (ลูกค้า)
    document.partner.type = 'customer'
    document.partner.code = invoiceData.customer_code || ''
    document.partner.name = invoiceData.customer_name || ''
    document.partner.address = invoiceData.customer_address || ''
    document.partner.taxId = invoiceData.customer_tax_id || ''
    document.partner.phone = invoiceData.customer_phone || ''
    document.partner.email = invoiceData.customer_email || ''
    
    // Items
    const rawItems = invoiceData.items || invoiceData.invoice_items || []
    document.items = rawItems.map((item, index) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      const discount = parseFloat(item.discount) || 0
      const total = (item.total) || (quantity * unitPrice * (1 - discount / 100))
      
      return {
        lineNumber: index + 1,
        productCode: item.product_code || '',
        productName: item.product_name || '',
        description: item.description || '',
        quantity,
        unit: item.unit || 'ชิ้น',
        unitPrice,
        discount,
        amount: quantity * unitPrice,
        total: Math.round(total * 100) / 100,
      }
    })
    
    // Financial
    document.financial = calculateFinancials(document.items, invoiceData.vat_rate || 7)
    if (invoiceData.total_amount) {
      document.financial.grandTotal = parseFloat(invoiceData.total_amount)
    }
    
    // Payment
    document.payment.method = invoiceData.payment_method || ''
    document.payment.terms = invoiceData.payment_terms || ''
    document.payment.dueDate = invoiceData.due_date || ''
    
    // Additional
    document.additional.referenceNumber = invoiceData.reference_number || ''
    document.additional.remarks = invoiceData.remarks || ''
    
    // Metadata
    document.metadata.createdAt = invoiceData.created_at || new Date().toISOString()
    document.metadata.createdBy = invoiceData.created_by || ''
    
    return document
  } catch (error) {
    console.error('❌ Error adapting Invoice:', error)
    return createEmptyDocument('invoice')
  }
}

export default {
  adaptInvoice,
}

/**
 * Quotation Document Adapter
 * 
 * แปลงข้อมูลจากฐานข้อมูล (ใบเสนอราคา) เป็น Standard Document Schema
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

import { createEmptyDocument, calculateFinancials } from '../schemas/StandardDocumentSchema.js'

/**
 * แปลงข้อมูลใบเสนอราคาจาก Database เป็น Standard Document
 * @param {Object} quotationData - ข้อมูลจาก Database
 * @returns {Object} Standard Document Object
 */
export function adaptQuotation(quotationData) {
  if (!quotationData) {
    console.warn('⚠️ Quotation data is null or undefined')
    return createEmptyDocument('quotation')
  }
  
  try {
    const document = createEmptyDocument('quotation')
    
    // Document metadata
    document.documentNumber = quotationData.quotation_number || quotationData.quote_number || ''
    document.documentDate = quotationData.quotation_date || quotationData.created_at || new Date().toISOString()
    document.documentStatus = quotationData.status || 'draft'
    
    // Company
    document.company.name = quotationData.company_name || ''
    document.company.address = quotationData.company_address || ''
    document.company.taxId = quotationData.company_tax_id || ''
    
    // Issuer (ผู้เสนอราคา)
    document.issuer.name = quotationData.sales_person || quotationData.prepared_by || ''
    document.issuer.department = quotationData.department || 'Sales'
    
    // Partner (ลูกค้า)
    document.partner.type = 'customer'
    document.partner.code = quotationData.customer_code || ''
    document.partner.name = quotationData.customer_name || ''
    document.partner.address = quotationData.customer_address || ''
    document.partner.contactPerson = quotationData.contact_person || ''
    
    // Items
    const rawItems = quotationData.items || quotationData.quotation_items || []
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
    document.financial = calculateFinancials(document.items, quotationData.vat_rate || 7)
    
    // Payment
    document.payment.terms = quotationData.payment_terms || quotationData.credit_terms || ''
    
    // Delivery
    document.delivery.expectedDate = quotationData.delivery_date || ''
    document.delivery.method = quotationData.delivery_method || ''
    
    // Additional
    document.additional.remarks = quotationData.remarks || quotationData.terms_conditions || ''
    document.additional.notes = quotationData.notes || ''
    
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
    
    // Metadata
    document.metadata.createdAt = quotationData.created_at || new Date().toISOString()
    document.metadata.createdBy = quotationData.created_by || ''
    
    console.log('✅ Quotation adapted successfully:', {
      documentNumber: document.documentNumber,
      itemsCount: document.items.length,
      totalPages: calculatedPages,
      grandTotal: document.financial.grandTotal
    })
    
    return document
  } catch (error) {
    console.error('❌ Error adapting Quotation:', error)
    return createEmptyDocument('quotation')
  }
}

export default {
  adaptQuotation,
}

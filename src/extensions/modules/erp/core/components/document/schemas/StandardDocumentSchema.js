/**
 * Standard Document Schema
 * 
 * โครงสร้างข้อมูลมาตรฐานสำหรับทุกประเภทเอกสาร
 * ทำให้ Document Components รับข้อมูลในรูปแบบเดียวกันทั้งหมด
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

/**
 * Standard Document Schema Interface
 * @typedef {Object} StandardDocument
 */
export const StandardDocumentSchema = {
  // ===== DOCUMENT METADATA =====
  documentType: '',            // 'purchase_request', 'invoice', 'quotation', etc.
  documentNumber: '',          // เลขที่เอกสาร (PR-2024-001, INV-2024-001)
  documentDate: '',            // วันที่ออกเอกสาร (ISO format)
  documentStatus: '',          // สถานะเอกสาร (draft, pending, approved, etc.)
  
  // ===== COMPANY INFORMATION =====
  company: {
    name: '',                  // ชื่อบริษัท
    address: '',               // ที่อยู่
    taxId: '',                 // เลขประจำตัวผู้เสียภาษี
    phone: '',                 // เบอร์โทรศัพท์
    email: '',                 // อีเมล
    logo: '',                  // URL โลโก้
  },
  
  // ===== ISSUER INFORMATION (ผู้ออกเอกสาร) =====
  issuer: {
    name: '',                  // ชื่อผู้ออกเอกสาร
    department: '',            // แผนก
    position: '',              // ตำแหน่ง
    email: '',                 // อีเมล
    phone: '',                 // เบอร์โทรศัพท์
  },
  
  // ===== CUSTOMER/VENDOR INFORMATION (คู่ค้า) =====
  partner: {
    type: '',                  // 'customer' หรือ 'vendor'
    code: '',                  // รหัสคู่ค้า
    name: '',                  // ชื่อคู่ค้า
    address: '',               // ที่อยู่
    taxId: '',                 // เลขประจำตัวผู้เสียภาษี
    phone: '',                 // เบอร์โทรศัพท์
    email: '',                 // อีเมล
    contactPerson: '',         // ชื่อผู้ติดต่อ
  },
  
  // ===== DOCUMENT ITEMS (รายการสินค้า/บริการ) =====
  items: [
    {
      lineNumber: 0,           // ลำดับรายการ
      productCode: '',         // รหัสสินค้า
      productName: '',         // ชื่อสินค้า
      description: '',         // รายละเอียด
      quantity: 0,             // จำนวน
      unit: '',                // หน่วย
      unitPrice: 0,            // ราคาต่อหน่วย
      discount: 0,             // ส่วนลด (%)
      discountAmount: 0,       // จำนวนเงินส่วนลด
      amount: 0,               // จำนวนเงินรวม (ก่อนภาษี)
      taxRate: 0,              // อัตราภาษี (%)
      taxAmount: 0,            // จำนวนภาษี
      total: 0,                // จำนวนเงินรวมสุทธิ
      remarks: '',             // หมายเหตุ
    }
  ],
  
  // ===== FINANCIAL SUMMARY (สรุปการเงิน) =====
  financial: {
    subtotal: 0,               // ยอดรวมก่อนหัก
    discountTotal: 0,          // ส่วนลดรวม
    amountBeforeVat: 0,        // ยอดก่อน VAT
    vatRate: 7,                // อัตรา VAT (%)
    vatAmount: 0,              // จำนวน VAT
    grandTotal: 0,             // ยอดรวมสุทธิ
    currency: 'THB',           // สกุลเงิน
  },
  
  // ===== PAYMENT INFORMATION =====
  payment: {
    method: '',                // วิธีการชำระเงิน (cash, transfer, credit)
    terms: '',                 // เงื่อนไขการชำระเงิน (30 days, 60 days)
    dueDate: '',               // วันครบกำหนดชำระ
    bankAccount: '',           // เลขที่บัญชี
    bankName: '',              // ชื่อธนาคาร
  },
  
  // ===== DELIVERY/SHIPPING INFORMATION =====
  delivery: {
    method: '',                // วิธีการจัดส่ง
    address: '',               // ที่อยู่จัดส่ง
    expectedDate: '',          // วันที่คาดว่าจะได้รับ
    contactPerson: '',         // ผู้รับสินค้า
    contactPhone: '',          // เบอร์โทรผู้รับ
  },
  
  // ===== APPROVAL/WORKFLOW INFORMATION =====
  workflow: {
    currentState: '',          // สถานะปัจจุบัน (pending_approval, approved, rejected)
    approvalHistory: [         // ประวัติการอนุมัติ
      {
        step: 0,               // ขั้นตอนที่
        approverName: '',      // ชื่อผู้อนุมัติ
        approverPosition: '',  // ตำแหน่ง
        action: '',            // การดำเนินการ (approved, rejected)
        date: '',              // วันที่อนุมัติ
        comments: '',          // หมายเหตุ
      }
    ],
  },
  
  // ===== ADDITIONAL INFORMATION =====
  additional: {
    referenceNumber: '',       // เลขที่อ้างอิง
    projectCode: '',           // รหัสโปรเจ็กต์
    costCenter: '',            // Cost Center
    remarks: '',               // หมายเหตุทั่วไป
    notes: '',                 // บันทึกเพิ่มเติม
    attachments: [],           // ไฟล์แนบ
  },
  
  // ===== SYSTEM METADATA =====
  metadata: {
    createdAt: '',             // วันที่สร้าง
    createdBy: '',             // ผู้สร้าง
    updatedAt: '',             // วันที่อัปเดต
    updatedBy: '',             // ผู้อัปเดต
    version: 1,                // เวอร์ชันเอกสาร
    source: '',                // แหล่งที่มา (web, mobile, api)
  },
}

/**
 * Create empty standard document
 * @param {string} documentType - ประเภทเอกสาร
 * @returns {Object} Standard document object
 */
export function createEmptyDocument(documentType = '') {
  return {
    documentType,
    documentNumber: '',
    documentDate: new Date().toISOString(),
    documentStatus: 'draft',
    
    company: {
      name: '',
      address: '',
      taxId: '',
      phone: '',
      email: '',
      logo: '',
    },
    
    issuer: {
      name: '',
      department: '',
      position: '',
      email: '',
      phone: '',
    },
    
    partner: {
      type: '',
      code: '',
      name: '',
      address: '',
      taxId: '',
      phone: '',
      email: '',
      contactPerson: '',
    },
    
    items: [],
    
    financial: {
      subtotal: 0,
      discountTotal: 0,
      amountBeforeVat: 0,
      vatRate: 7,
      vatAmount: 0,
      grandTotal: 0,
      currency: 'THB',
    },
    
    payment: {
      method: '',
      terms: '',
      dueDate: '',
      bankAccount: '',
      bankName: '',
    },
    
    delivery: {
      method: '',
      address: '',
      expectedDate: '',
      contactPerson: '',
      contactPhone: '',
    },
    
    workflow: {
      currentState: 'draft',
      approvalHistory: [],
    },
    
    additional: {
      referenceNumber: '',
      projectCode: '',
      costCenter: '',
      remarks: '',
      notes: '',
      attachments: [],
    },
    
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: '',
      updatedAt: new Date().toISOString(),
      updatedBy: '',
      version: 1,
      source: 'web',
    },
  }
}

/**
 * Validate standard document
 * @param {Object} document - Document to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateDocument(document) {
  const errors = []
  
  if (!document.documentType) {
    errors.push('Document type is required')
  }
  
  if (!document.documentNumber) {
    errors.push('Document number is required')
  }
  
  if (!document.documentDate) {
    errors.push('Document date is required')
  }
  
  if (!Array.isArray(document.items)) {
    errors.push('Items must be an array')
  } else if (document.items.length === 0) {
    errors.push('Document must have at least one item')
  }
  
  // Validate items
  document.items.forEach((item, index) => {
    if (!item.productName) {
      errors.push(`Item ${index + 1}: Product name is required`)
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Invalid quantity`)
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      errors.push(`Item ${index + 1}: Invalid unit price`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate financial totals from items
 * @param {Array} items - Document items
 * @param {number} vatRate - VAT rate percentage (default 7)
 * @returns {Object} Financial summary
 */
export function calculateFinancials(items = [], vatRate = 7) {
  const subtotal = items.reduce((sum, item) => {
    const itemAmount = (item.quantity || 0) * (item.unitPrice || 0)
    return sum + itemAmount
  }, 0)
  
  const discountTotal = items.reduce((sum, item) => {
    return sum + (item.discountAmount || 0)
  }, 0)
  
  const amountBeforeVat = subtotal - discountTotal
  const vatAmount = amountBeforeVat * (vatRate / 100)
  const grandTotal = amountBeforeVat + vatAmount
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    amountBeforeVat: Math.round(amountBeforeVat * 100) / 100,
    vatRate,
    vatAmount: Math.round(vatAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    currency: 'THB',
  }
}

export default {
  StandardDocumentSchema,
  createEmptyDocument,
  validateDocument,
  calculateFinancials,
}

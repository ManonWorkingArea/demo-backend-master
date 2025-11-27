/**
 * ERP Document Universal Composable
 * 
 * JavaScript/Vue composable กลางสำหรับเอกสารทุกประเภทในระบบ ERP
 * - ใบขอซื้อ (Purchase Request)
 * - ใบเสนอราคา (Quotation)
 * - ใบแจ้งหนี้ (Invoice)
 * - ใบส่งของ (Delivery Order)
 * - และอื่นๆ
 * 
 * @version 1.0.0
 * @date 2024-11-24
 */

import { computed } from 'vue'

/**
 * Composable สำหรับเอกสาร ERP ทั่วไป
 * @param {Object} props - Vue props
 * @param {Object} documentMapping - Configuration สำหรับแปลงข้อมูล
 * @returns {Object} Reactive properties และ methods
 */
export function useERPDocument(props, documentMapping = {}) {
  
  // ===== PAGINATION =====
  const currentPage = computed(() => props.options?.currentPage || 1)
  
  const itemsPerPage = computed(() => {
    // ใช้ค่าจาก metadata.pagination ก่อน
    if (props.data?.metadata?.pagination?.itemsPerPage) {
      return props.data.metadata.pagination.itemsPerPage
    }
    return props.options?.itemsPerPage || 5
  })
  
  const totalPages = computed(() => {
    // ใช้ค่าจาก metadata.pagination ก่อน
    if (props.data?.metadata?.pagination?.totalPages) {
      return props.data.metadata.pagination.totalPages
    }
    if (props.options?.totalPages) {
      return props.options.totalPages
    }
    return Math.max(1, Math.ceil(displayItems.value.length / itemsPerPage.value))
  })
  
  const isLastPage = computed(() => currentPage.value === totalPages.value)
  
  // ===== DOCUMENT DATA =====
  const currentDocument = computed(() => {
    if (!props.data) {
      return documentMapping.emptyDocument || {}
    }
    
    // ใช้ mapping function ถ้ามี
    if (documentMapping.mapDocument && typeof documentMapping.mapDocument === 'function') {
      return documentMapping.mapDocument(props.data)
    }
    
    // Default mapping
    return {
      document_number: props.data.documentNumber || '',
      document_date: props.data.documentDate || new Date().toISOString(),
      company_name: props.data.company?.name || '',
      company_address: props.data.company?.address || '',
      tax_id: props.data.company?.taxId || '',
      remarks: props.data.additional?.remarks || '',
      items: props.data.items || []
    }
  })
  
  // ===== ITEMS =====
  const displayItems = computed(() => {
    if (!props.data?.items) {
      return []
    }
    
    return props.data.items.map(item => ({
      product_code: item.productCode || '',
      product_name: item.productName || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'ชิ้น',
      unit_price: item.unitPrice || 0,
      total: item.total || 0
    }))
  })
  
  const currentPageItems = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return displayItems.value.slice(startIndex, endIndex)
  })
  
  const emptyRowsCount = computed(() => {
    return Math.max(0, itemsPerPage.value - currentPageItems.value.length)
  })
  
  // ===== FINANCIAL =====
  const totalAmount = computed(() => {
    if (props.data?.financial?.grandTotal) {
      return props.data.financial.grandTotal
    }
    
    return displayItems.value.reduce((sum, item) => {
      const total = parseFloat(item.total)
      return sum + (Number.isFinite(total) ? total : 0)
    }, 0)
  })
  
  const vatRate = computed(() => {
    if (props.data?.financial?.vatRate) {
      return props.data.financial.vatRate
    }
    
    const opt = props.options || {}
    const rate = typeof opt.vatRate === 'number' ? opt.vatRate : 0.07
    return rate >= 0 ? rate * 100 : 7
  })
  
  const preVatAmount = computed(() => {
    if (props.data?.financial?.amountBeforeVat) {
      return props.data.financial.amountBeforeVat
    }
    
    const total = totalAmount.value || 0
    const pre = total / (1 + (vatRate.value / 100))
    return Math.round(pre * 100) / 100
  })
  
  const vatAmount = computed(() => {
    if (props.data?.financial?.vatAmount) {
      return props.data.financial.vatAmount
    }
    
    const vat = (totalAmount.value || 0) - preVatAmount.value
    return Math.round(vat * 100) / 100
  })
  
  // ===== CSS VARIABLES =====
  const cssVars = computed(() => {
    const opt = props.options || {}
    return {
      '--row-line-height': opt.rowLineHeight || opt.rowHeight || '8mm',
      '--cell-vpad': opt.cellVPad || '1mm'
    }
  })
  
  // ===== HELPER FUNCTIONS =====
  const getGlobalItemIndex = (localIndex) => {
    return ((currentPage.value - 1) * itemsPerPage.value) + localIndex + 1
  }
  
  // ===== FORMATTERS =====
  const formatNumber = (number) => {
    return new Intl.NumberFormat('th-TH').format(number || 0)
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0)
  }
  
  const formatDate = (date) => {
    if (!date) return 'ไม่ระบุ'
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatDateTime = (date) => {
    if (!date) return 'ไม่ระบุ'
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const numberToThai = (num) => {
    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
    const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
    
    if (num === 0) return 'ศูนย์บาทถ้วน'
    if (num >= 10000000) return 'มากกว่าสิบล้านบาท'
    
    let result = ''
    let numStr = Math.floor(num).toString()
    let len = numStr.length
    
    for (let i = 0; i < len; i++) {
      let digit = parseInt(numStr[i])
      let place = len - i - 1
      
      if (digit !== 0) {
        if (place === 1 && digit === 1 && len > 1) {
          result += 'สิบ'
        } else if (place === 1 && digit === 2) {
          result += 'ยี่สิบ'
        } else if (place === 0 && digit === 1 && len > 1 && parseInt(numStr[i-1]) !== 0) {
          result += 'เอ็ด'
        } else {
          result += ones[digit]
          if (place > 0) result += places[place]
        }
      }
    }
    
    return result + 'บาทถ้วน'
  }
  
  // ===== RETURN ALL =====
  return {
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    isLastPage,
    
    // Data
    currentDocument,
    displayItems,
    currentPageItems,
    emptyRowsCount,
    
    // Financial
    totalAmount,
    vatRate,
    preVatAmount,
    vatAmount,
    
    // Helpers
    getGlobalItemIndex,
    cssVars,
    
    // Formatters
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    numberToThai
  }
}

/**
 * Default document mappings สำหรับเอกสารแต่ละประเภท
 */
export const documentMappings = {
  // ใบขอซื้อ (Purchase Request)
  purchaseRequest: {
    emptyDocument: {
      document_number: 'PR-XXXX-XXXX',
      request_date: new Date().toISOString(),
      company_name: 'บริษัท (ไม่ระบุ)',
      company_address: '',
      tax_id: '',
      requester: '',
      department: '',
      required_date: '',
      remarks: '',
      items: []
    },
    mapDocument: (data) => ({
      document_number: data.documentNumber,
      request_date: data.documentDate,
      company_name: data.company?.name || '',
      company_address: data.company?.address || '',
      tax_id: data.company?.taxId || '',
      requester: data.issuer?.name || '',
      department: data.issuer?.department || '',
      required_date: data.delivery?.expectedDate || '',
      remarks: data.additional?.remarks || '',
      items: data.items || []
    })
  },
  
  // ใบเสนอราคา (Quotation)
  quotation: {
    emptyDocument: {
      document_number: 'QT-XXXX-XXXX',
      quotation_date: new Date().toISOString(),
      company_name: 'บริษัท (ไม่ระบุ)',
      company_address: '',
      tax_id: '',
      customer_name: '',
      customer_address: '',
      contact_person: '',
      remarks: '',
      items: []
    },
    mapDocument: (data) => ({
      document_number: data.documentNumber,
      quotation_date: data.documentDate,
      company_name: data.company?.name || '',
      company_address: data.company?.address || '',
      tax_id: data.company?.taxId || '',
      customer_name: data.partner?.name || '',
      customer_address: data.partner?.address || '',
      contact_person: data.partner?.contactPerson || '',
      remarks: data.additional?.remarks || '',
      items: data.items || []
    })
  },
  
  // ใบแจ้งหนี้ (Invoice)
  invoice: {
    emptyDocument: {
      document_number: 'INV-XXXX-XXXX',
      invoice_date: new Date().toISOString(),
      company_name: 'บริษัท (ไม่ระบุ)',
      company_address: '',
      tax_id: '',
      customer_name: '',
      customer_address: '',
      due_date: '',
      remarks: '',
      items: []
    },
    mapDocument: (data) => ({
      document_number: data.documentNumber,
      invoice_date: data.documentDate,
      company_name: data.company?.name || '',
      company_address: data.company?.address || '',
      tax_id: data.company?.taxId || '',
      customer_name: data.partner?.name || '',
      customer_address: data.partner?.address || '',
      due_date: data.payment?.dueDate || '',
      remarks: data.additional?.remarks || '',
      items: data.items || []
    })
  }
}

export default {
  useERPDocument,
  documentMappings
}

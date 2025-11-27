<template>
  <!-- Purchase Request Document with Internal Data - Complete CSS Isolation -->
  <div 
    class="erp-document a4-document" 
    data-document-isolated="true" 
    :data-no-signatures="!isLastPage"
    :style="cssVars"
  >
    
    <!-- Document Content with Flex Layout -->
    <div class="document-content">
      
      <!-- HEAD: Header Section (Top Fixed) -->
      <div class="document-head">
        <!-- Header Container -->
        <div class="header-container">
          <!-- Top Row: Logo + Title -->
          <div class="header-top-row">
            <div class="header-logo-section">
              <img src="https://vue-project.sgp1.digitaloceanspaces.com/2025/10/1759901167254.png" class="header-logo" alt="Logo">
            </div>
            <div class="header-title-section">
              ใบขอซื้อ (PURCHASE REQUEST)
            </div>
          </div>
          
          <!-- Bottom Row: Code + Date -->
          <div class="header-bottom-row">
            <div class="header-code-section">
              หมายเลขเอกสาร : {{ currentDocument.document_number || 'PR-XXXX-XXXX' }}
              <span v-if="totalPages > 1" style="font-size: 8pt; color: #666; margin-left: 10mm;">
                ({{ displayItems.length }} รายการ, {{ totalPages }} หน้า)
              </span>
            </div>
            <div class="header-date-section">
              วันที่ออกเอกสาร : {{ formatDate(currentDocument.request_date) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- SUB-HEAD: Company & Requester Information (Top Fixed) -->
      <div class="document-sub-head">
        <div class="contact-info-grid">
          <div class="company-info-section">
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">ข้อมูลบริษัท</h3>
            <div class="space-y-1 text-xs">
              <div><span class="text-gray-600">บริษัท:</span> {{ currentDocument.company_name || 'บริษัท ABC จำกัด' }}</div>
              <div><span class="text-gray-600">ที่อยู่:</span> {{ currentDocument.company_address || '123 ถนนสุขุมวิท กรุงเทพฯ 10110' }}</div>
              <div><span class="text-gray-600">เลขประจำตัวผู้เสียภาษี:</span> {{ currentDocument.tax_id || '0000000000000' }}</div>
            </div>
          </div>
          
          <div class="requester-info-section">
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">ผู้ขอซื้อ</h3>
            <div class="space-y-1 text-xs">
              <div><span class="text-gray-600">ชื่อ:</span> {{ currentDocument.requester || 'ไม่ระบุ' }}</div>
              <div><span class="text-gray-600">แผนก:</span> {{ currentDocument.department || 'ไม่ระบุ' }}</div>
              <div><span class="text-gray-600">วันที่ต้องการ:</span> {{ formatDate(currentDocument.required_date) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTENT: Items Table (Flexible Content) -->
      <div class="document-main-content">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <div class="th-wrap">
                    <div class="th-th">ลำดับ</div>
                    <div class="th-en">No.</div>
                  </div>
                </th>
                <th>
                  <div class="th-wrap">
                    <div class="th-th">รหัสสินค้า</div>
                    <div class="th-en">Product Code</div>
                  </div>
                </th>
                <th>
                  <div class="th-wrap">
                    <div class="th-th">ชื่อสินค้า</div>
                    <div class="th-en">Product Name</div>
                  </div>
                </th>
                <th style="text-align: center;">
                  <div class="th-wrap">
                    <div class="th-th">จำนวน</div>
                    <div class="th-en">Qty</div>
                  </div>
                </th>
                <th style="text-align: center;">
                  <div class="th-wrap">
                    <div class="th-th">หน่วย</div>
                    <div class="th-en">Unit</div>
                  </div>
                </th>
                <th style="text-align: right;">
                  <div class="th-wrap th-right">
                    <div class="th-th">ราคา/หน่วย</div>
                    <div class="th-en">Unit Price</div>
                  </div>
                </th>
                <th style="text-align: right;">
                  <div class="th-wrap th-right">
                    <div class="th-th">รวม</div>
                    <div class="th-en">Amount</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in currentPageItems" :key="index">
                <td style="text-align: center;">{{ getGlobalItemIndex(index) }}</td>
                <td>{{ item.product_code || 'N/A' }}</td>
                <td>{{ item.product_name || item.description || 'ไม่ระบุ' }}</td>
                <td style="text-align: center;">{{ formatNumber(item.quantity) }}</td>
                <td style="text-align: center;">{{ item.unit || 'ชิ้น' }}</td>
                <td style="text-align: right;">{{ formatCurrency(item.unit_price) }}</td>
                <td style="text-align: right; font-weight: bold;">{{ formatCurrency(item.total) }}</td>
              </tr>
              
              <!-- Empty rows to fill exactly rows per page total -->
              <tr v-for="n in emptyRowsCount" :key="`empty-${n}`">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
            
            <!-- Total Summary Section - Only on last page -->
            <tfoot v-if="isLastPage">
              <!-- Notes / Remarks Row under items table -->
              <tr>
                <td colspan="7" style="padding: 2mm; font-size: 8pt; text-align: left;">
                  <div class="notes-title">หมายเหตุ / Remarks</div>
                  <div class="notes-content">{{ currentDocument.remarks || currentDocument.note || '' }}</div>
                </td>
              </tr>
              <!-- Pre-VAT Amount Row -->
              <tr>
                <td colspan="6" style="text-align: right; padding: 2mm; font-size: 8pt;">ราคาสุทธิก่อนภาษีมูลค่าเพิ่ม (บาท) / Pre-VAT Amount</td>
                <td style="text-align: right; padding: 2mm; font-size: 8pt; font-weight: bold;">{{ formatCurrency(preVatAmount) }}</td>
              </tr>
              
              <!-- VAT Row -->
              <tr>
                <td colspan="6" style="text-align: right; padding: 2mm; font-size: 8pt;">ภาษีมูลค่าเพิ่ม (บาท) / VAT</td>
                <td style="text-align: right; padding: 2mm; font-size: 8pt; font-weight: bold;">{{ formatCurrency(vatAmount) }}</td>
              </tr>
              
              <!-- Grand Total Row with Thai amount on the left -->
              <tr style="border-top: 2pt solid #000000;">
                <!-- Amount in Thai words on the left -->
                <td colspan="3" style="text-align: center; padding: 2mm; font-size: 8pt; font-weight: 500;">
                  ( {{ numberToThai(totalAmount) }} )
                </td>
                <!-- Grand Total label in the middle-right -->
                <td colspan="3" style="text-align: right; padding: 2mm; font-size: 9pt; font-weight: bold;">
                  จำนวนเงินรวมทั้งสิ้น (บาท) / Grand Total
                </td>
                <!-- Amount on the far right -->
                <td style="text-align: right; padding: 2mm; font-size: 9pt; font-weight: bold;">
                  {{ formatCurrency(totalAmount) }}
                </td>
              </tr>
            </tfoot>
            <!-- Continue on next page notice - Only on non-last pages -->
            <tfoot v-else>
              <tr>
                <td colspan="7" style="text-align: center; padding: 5mm; font-size: 9pt; border-top: 2pt solid #000000;">
                  <div class="flex justify-between items-center">
                    <span style="font-style: italic;">... ต่อหน้าถัดไป / Continued on next page ...</span>
                    <span style="font-weight: bold; font-size: 8pt;">
                      ({{ displayItems.length - (currentPage * itemsPerPage) }} รายการที่เหลือ)
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <!-- SUB-FOOTER: Signature Only (Bottom Fixed) - Only on last page -->
      <div v-if="isLastPage" class="document-sub-footer">
        <!-- Signature Row -->
        <div class="signature-row">
          <!-- Document Issuer Signature -->
          <div class="signature-section">
            <div class="text-xs text-center mb-2" style="font-size: 9pt;">ผู้ออกเอกสาร</div>
            <div class="signature-space">
              <div class="signature-dots">.............................</div>
              <div class="signature-name">(ชื่อจริง-นามสกุล)</div>
            </div>
          </div>
          
          <!-- Approver Signature -->
          <div class="signature-section">
            <div class="text-xs text-center mb-2" style="font-size: 9pt;">ผู้อนุมัติ</div>
            <div class="signature-space">
              <div class="signature-dots">.............................</div>
              <div class="signature-name">(ชื่อจริง-นามสกุล)</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- FOOTER: Closing Statement (Bottom Fixed) -->
      <div class="document-footer">
        <div class="text-center border-t border-gray-300 pt-1">
          <div class="text-xs text-gray-600">
            เอกสารฉบับนี้สร้างโดยระบบ ERP • พิมพ์เมื่อ {{ formatDateTime(new Date()) }}
            <span v-if="totalPages > 1">• หน้า {{ currentPage }} จาก {{ totalPages }}</span>
            <span v-if="currentPage === 1 && totalPages > 1"> • (เลื่อนดูหน้าถัดไป)</span>
            <span v-if="isLastPage && totalPages > 1"> • (หน้าสุดท้าย)</span>
          </div>
          <div class="text-xs font-semibold text-gray-700 mt-1">
            *** เอกสารนี้มีผลใช้เมื่อได้รับการอนุมัติจากผู้มีอำนาจแล้วเท่านั้น ***
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PurchaseRequestDocument',
  props: {
    // ✅ รับข้อมูล Standard Document Schema
    data: {
      type: Object,
      required: false,  // ไม่บังคับเพื่อ backward compatibility
      default: null
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Use currentPage from options if provided, otherwise default to 1
    const currentPage = computed(() => props.options?.currentPage || 1)
    
    // ===== ✅ USE STANDARD DOCUMENT SCHEMA =====
    // Get current document from props.data (Standard Document Schema)
    const currentDocument = computed(() => {
      if (props.data) {
        // ✅ ใช้ข้อมูลจาก Standard Document Schema
        return {
          document_number: props.data.documentNumber,
          request_date: props.data.documentDate,
          company_name: props.data.company?.name || '',
          company_address: props.data.company?.address || '',
          tax_id: props.data.company?.taxId || '',
          requester: props.data.issuer?.name || '',
          department: props.data.issuer?.department || '',
          required_date: props.data.delivery?.expectedDate || '',
          remarks: props.data.additional?.remarks || '',
          items: props.data.items || []
        }
      }
      
      // Fallback: ข้อมูลเปล่า
      return {
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
      }
    })
    
    // Get items from Standard Document Schema
    const displayItems = computed(() => {
      if (props.data && props.data.items) {
        // ✅ แปลง Standard Schema items เป็นรูปแบบที่ template ต้องการ
        return props.data.items.map(item => ({
          product_code: item.productCode,
          product_name: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.total
        }))
      }
      return []
    })
    
    // Multi-page support
    const itemsPerPage = computed(() => props.options?.itemsPerPage || 12)
    const totalPages = computed(() => {
      // Use totalPages from options if provided, otherwise calculate from items
      if (props.options?.totalPages) {
        return props.options.totalPages
      }
      return Math.ceil(displayItems.value.length / itemsPerPage.value)
    })
    const isLastPage = computed(() => currentPage.value === totalPages.value)
    
    // Current page items
    const currentPageItems = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      return displayItems.value.slice(startIndex, endIndex)
    })
    
    // Empty rows count for current page
    const emptyRowsCount = computed(() => {
      return Math.max(0, itemsPerPage.value - currentPageItems.value.length)
    })
    
    // Get global item index (continuous numbering across pages)
    const getGlobalItemIndex = (localIndex) => {
      return ((currentPage.value - 1) * itemsPerPage.value) + localIndex + 1
    }
    
    const totalAmount = computed(() => {
      // ✅ ใช้ข้อมูลจาก Standard Document Schema
      if (props.data && props.data.financial) {
        return props.data.financial.grandTotal || 0
      }
      
      // Fallback: คำนวณจาก items
      return displayItems.value.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.unit_price) || 0
        const rowTotal = parseFloat(item.total)
        return sum + (Number.isFinite(rowTotal) ? rowTotal : qty * price)
      }, 0)
    })

    // VAT handling: derive cleanly from a rate (defaults to 7%)
    const vatRate = computed(() => {
      // ✅ ใช้จาก Standard Document Schema
      if (props.data && props.data.financial) {
        return props.data.financial.vatRate || 7
      }
      
      // Fallback
      const opt = props.options || {}
      const rate = typeof opt.vatRate === 'number' ? opt.vatRate : 0.07
      return rate >= 0 ? rate * 100 : 7
    })

    const preVatAmount = computed(() => {
      // ✅ ใช้จาก Standard Document Schema
      if (props.data && props.data.financial) {
        return props.data.financial.amountBeforeVat || 0
      }
      
      // Fallback: คำนวณ
      const total = totalAmount.value || 0
      const pre = total / (1 + (vatRate.value / 100))
      return Math.round(pre * 100) / 100
    })

    const vatAmount = computed(() => {
      // ✅ ใช้จาก Standard Document Schema
      if (props.data && props.data.financial) {
        return props.data.financial.vatAmount || 0
      }
      
      // Fallback: คำนวณ
      const vat = (totalAmount.value || 0) - preVatAmount.value
      return Math.round(vat * 100) / 100
    })

    // Expose CSS variables to allow row height tuning from options
    const cssVars = computed(() => {
      const opt = props.options || {}
      const line = opt.rowLineHeight || opt.rowHeight || '8mm'
      const vpad = opt.cellVPad || '1mm'
      return { '--row-line-height': line, '--cell-vpad': vpad }
    })
    
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
    
    // Navigation functions
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const selectDocument = (index) => {
      console.log('selectDocument called with index:', index)
      // ✅ ไม่ต้องทำอะไร เพราะใช้ props.data แทน
    }
    
    // ✅ ไม่ต้อง initialize data อีกต่อไป
    // onMounted(() => {
    //   // ใช้ข้อมูลจาก props.data แทน
    // })

    return {
      // Data from Standard Document Schema
      currentDocument,
      displayItems,
      totalAmount,
      vatRate,
      preVatAmount,
      vatAmount,
      
      // Pagination
      currentPage,
      totalPages,
      itemsPerPage,
      isLastPage,
      currentPageItems,
      emptyRowsCount,
      
      // Functions
      formatNumber,
      formatCurrency,
      formatDate,
      formatDateTime,
      numberToThai,
      getGlobalItemIndex,
      nextPage,
      previousPage,
      goToPage,
      selectDocument,
      cssVars
    }
  }
}
</script>

<style scoped>
/* ===== HARDCODED A4 PORTRAIT LAYOUT ===== */

/* Document CSS Isolation - Override Everything */
[data-document-isolated="true"] {
  /* Complete CSS Reset and Isolation */
  all: revert;
  
  /* Force A4 Portrait: 210mm x 297mm - ULTIMATE OVERRIDE */
  width: 210mm !important;
  height: 297mm !important;
  min-width: 210mm !important;
  min-height: 297mm !important;
  max-width: 210mm !important;
  max-height: 297mm !important;
  
  /* Typography Reset */
  font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif !important;
  font-size: 11pt !important;
  line-height: 1.2 !important;
  color: #000000 !important;
  
  /* Layout - NUCLEAR OVERRIDE */
  background: #ffffff !important;
  margin: 0 auto !important;
  padding: 0 !important;
  position: relative !important;
  box-sizing: border-box !important;
  
  /* Remove all external influences */
  display: block !important;
  overflow: visible !important;
  flex: none !important;
  
  /* Print ready */
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  
  /* Isolation containment */
  contain: none !important;
  
  /* Debug - Make sure it's visible */
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 1 !important;
}

/* A4 Document Structure - Absolute Positioning */
.a4-document {
  width: 210mm;
  height: 297mm;
  background: #ffffff;
  position: relative;
  
  /* Remove grid - use absolute positioning instead */
  display: block;
  overflow: visible;
  box-sizing: border-box;
}

/* Document Content - Minimal Margins for Terminal Printing */
.document-content {
  /* Content area with safe margins */
  position: absolute;
  top: 5mm;
  left: 5mm;
  right: 5mm;
  bottom: 5mm;

  width: 200mm;
  height: 287mm;

  /* Dynamic grid layout based on page type */
  display: grid;
  /* Grid rows adjust based on content: head, sub-head, table, [optional signatures], footer */
  grid-template-rows: var(--grid-rows, 24mm 26mm 1fr 35mm 20mm);
  /* Remove vertical gap so table can touch the sub-head divider */
  grid-row-gap: 0mm;

  background: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
}

/* SIMPLE HEADER BOX - Terminal Printer Friendly */
.document-head {
  /* Grid row 1 */
  position: relative !important;
  width: 100% !important;
  height: 24mm !important;

  background: #ffffff !important;
  padding: 0mm 0mm 3mm 0mm !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  z-index: 1 !important;
  display: block !important;
  border-bottom: var(--divider, 1pt) solid #dcdcdc !important;
}

/* Header Container - Simple Lines Only */
.header-container {
  width: 100% !important;
  height: 100% !important;
  background: #ffffff !important;
  box-sizing: border-box !important;
  /* No outer border */
}

/* Header Top Row */
.header-top-row {
  width: 100% !important;
  height: 70% !important;
  display: flex !important;
  box-sizing: border-box !important;
  padding-bottom: 2mm !important;
}

.header-logo-section {
  width: 30% !important;
  padding: 0mm !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  box-sizing: border-box !important;
}

.header-logo {
  height: 20mm !important;
  width: auto !important;
  max-width: 100% !important;
  object-fit: contain !important;
}

.header-title-section {
  width: 70% !important;
  padding: 2mm !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  font-size: 12pt !important;
  font-weight: bold !important;
  color: #000000 !important;
  box-sizing: border-box !important;
}

/* Header Bottom Row */
.header-bottom-row {
  width: 100% !important;
  height: 30% !important;
  display: flex !important;
  box-sizing: border-box !important;
  padding-top: 2mm !important;
  padding-bottom: 2mm !important;
}

.header-code-section {
  width: 50% !important;
  padding: 0 !important;
  padding-right: 4mm !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  font-size: 10pt !important;
  color: #000000 !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* No vertical divider */

.header-date-section {
  width: 50% !important;
  padding: 0 !important;
  padding-left: 4mm !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  font-size: 10pt !important;
  color: #000000 !important;
  box-sizing: border-box !important;
}

.document-sub-head {
  /* Grid row 2 */
  position: relative !important;
  width: 100% !important;
  height: 26mm !important;

  background: #ffffff !important;
  padding: 5mm 0mm !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  border-bottom: var(--divider, 1pt) solid #000000 !important;
}

/* Contact Info Grid */
.contact-info-grid {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  box-sizing: border-box !important;
}

.company-info-section {
  width: 50% !important;
  padding: 0 !important;
  padding-right: 4mm !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  box-sizing: border-box !important;
  position: relative !important;
  border-right: 0.5pt solid #e5e5e5 !important;
}

.requester-info-section {
  width: 50% !important;
  padding: 0 !important;
  padding-left: 4mm !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  box-sizing: border-box !important;
}

/* No contact divider */

.document-main-content {
  /* Grid row 3 - flexible */
  position: relative !important;
  width: 100% !important;
  height: 100% !important;

  background: #ffffff !important;
  padding: 0mm !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.document-sub-footer {
  /* Grid row 4 */
  position: relative !important;
  width: 100% !important;
  height: 35mm !important;

  background: #ffffff !important;
  padding: 0mm 0mm !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

.document-footer {
  /* Grid row 5 */
  position: relative !important;
  width: 100% !important;
  height: 20mm !important;

  background: #ffffff !important;
  padding: 2mm 3mm !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* Hardcoded Typography - No Responsive */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
  font-weight: bold;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  color: #000000;
}

h1 { 
  font-size: 18pt;
  text-align: center;
  margin-bottom: 2mm;
}

h2 { 
  font-size: 14pt;
  text-align: center;
  margin-bottom: 3mm;
  font-weight: normal;
}

h3 { 
  font-size: 11pt;
  margin-bottom: 2mm;
}

h4 {
  font-size: 9pt;
  margin-bottom: 1mm;
}



/* Minimal Grid - Terminal Printer Friendly */
.grid {
  position: relative;
  width: 100%;
  height: 100%;
}

.grid-cols-2 {
  position: relative;
  width: 100%;
  height: 100%;
}

.grid-cols-2 > div:nth-child(1) {
  position: absolute;
  top: 0mm;
  left: 0mm;
  width: 97mm;
  height: 100%;
}

.grid-cols-2 > div:nth-child(2) {
  position: absolute;
  top: 0mm;
  left: 100mm;
  width: 97mm;
  height: 100%;
}

/* Header Info Row Grid */
.header-info-row.grid-cols-2 > div:nth-child(1) {
  width: 50%;
  flex: 1;
}

.header-info-row.grid-cols-2 > div:nth-child(2) {
  width: 50%;
  flex: 1;
}

.grid-cols-3 {
  position: relative;
  width: 100%;
  height: 100%;
}

.grid-cols-3 > div:nth-child(1) {
  position: absolute;
  top: 0mm;
  left: 0mm;
  width: 64mm;
  height: 100%;
}

.grid-cols-3 > div:nth-child(2) {
  position: absolute;
  top: 0mm;
  left: 66mm;
  width: 64mm;
  height: 100%;
}

.grid-cols-3 > div:nth-child(3) {
  position: absolute;
  top: 0mm;
  left: 132mm;
  width: 62mm;
  height: 100%;
}

/* Minimal Information Boxes - Terminal Style */
.grid > div {
  background: #ffffff;
  padding: 1mm;
  border: none;
  font-size: 9pt;
  line-height: 1.1;
  box-sizing: border-box;
}

/* Table Container - Full Width for Terminal */
.table-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}

/* Table with borders like the design - force compact */
table {
  width: 100%;
  height: auto !important;
  border-collapse: collapse;
  font-size: 8pt;
  table-layout: fixed !important;
  /* Only top/bottom border; remove left/right */
  border-top: var(--divider, 1pt) solid #000000;
  border-bottom: var(--divider, 1pt) solid #000000;
  border-left: 0;
  border-right: 0;
  /* Pull the table up to overlap the divider above */
  margin-top: calc(-1 * var(--divider, 1pt));
}

/* Table Structure - Force ultra compact */
table thead {
  background: #ffffff !important;
  height: auto !important;
}

table tbody {
  background: #ffffff !important;
  height: auto !important;
}

table tfoot {
  background: #f8f8f8 !important;
  height: auto !important;
  min-height: 25mm !important;
  font-weight: bold !important;
}

/* Table Cells - With borders like the design */
table th,
table td {
  border: 0.5pt solid #000000 !important;
  padding: 1px 4px !important;
  vertical-align: middle;
  text-align: left;
  line-height: 1.0;
  font-size: 8pt;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Row heights - driven by variables for clear control */
tbody tr,
table tbody tr { height: calc(var(--row-line-height, 8mm) + (2 * var(--cell-vpad, 1mm))) !important; }
tbody td {
  padding: var(--cell-vpad, 1mm) 6px !important;
  line-height: var(--row-line-height, 8mm) !important;
  font-size: 8pt !important;
  vertical-align: middle !important;
}

table tfoot td {
  padding: 1.5mm 2mm !important;
  line-height: 1.2 !important;
}

/* Footer cells need special handling for long text */
table tfoot td[colspan] {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: visible !important;
  height: auto !important;
  min-height: 8mm !important;
}

table th {
  font-weight: bold !important;
  text-align: center !important;
  color: #000000 !important;
  background: #ffffff !important;
  vertical-align: middle;
}

table td {
  background: #ffffff !important;
}

/* Header bilingual labels */
table th .th-wrap { display: inline-flex; flex-direction: column; align-items: inherit; line-height: 1.1; }
table th .th-th { font-size: 8.5pt; color: #000000; }
table th .th-en { font-size: 7pt; color: #666666; font-weight: 600; margin-top: 1px; }
table th .th-right { align-items: flex-end; }

/* Force table borders with high specificity */
.table-container table {
  /* Ensure only top and bottom borders are shown */
  border-top: var(--divider, 1pt) solid #000000 !important;
  border-bottom: var(--divider, 1pt) solid #000000 !important;
  border-left: 0 !important;
  border-right: 0 !important;
}

.table-container table th,
.table-container table td {
  border: 0.5pt solid #000000 !important;
}

/* Remove outermost left and right cell borders to match table sides */
.table-container table th:first-child,
.table-container table td:first-child { border-left: 0 !important; }
.table-container table th:last-child,
.table-container table td:last-child { border-right: 0 !important; }

/* ITEMS BODY: remove all horizontal borders (keep vertical only) */
.table-container table tbody td {
  border-top: 0 !important;
  border-bottom: 0 !important;
}

/* Footer summary styling */
table tfoot td {
  background: #ffffff !important;
  font-size: 8pt !important;
  padding: 2mm 2mm !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: visible !important;
}

table tfoot tr:last-child td {
  font-weight: bold !important;
  font-size: 9pt !important;
  background: #f8f8f8 !important;
}

/* Notes area styling */
.notes-title { font-weight: 600; margin-bottom: 1mm; }
.notes-content { min-height: 12mm; white-space: pre-wrap; }

/* Remove extreme compact overrides to avoid clipping text */

table td {
  color: #000000;
  background: #ffffff;
}

/* Controlled Row Heights */
table thead tr { height: 10mm; }
table tbody tr { height: calc(var(--row-line-height, 8mm) + (2 * var(--cell-vpad, 1mm))); }

table tfoot tr {
  height: auto;
  min-height: 30px;
}

/* Column Widths - percentage to adapt with safe mm layout */
table th:nth-child(1), table td:nth-child(1) { width: 9%; }
table th:nth-child(2), table td:nth-child(2) { width: 15%; }
table th:nth-child(3), table td:nth-child(3) { width: 33%; }
table th:nth-child(4), table td:nth-child(4) { width: 11%; }
table th:nth-child(5), table td:nth-child(5) { width: 8%; }
table th:nth-child(6), table td:nth-child(6) { width: 12%; }
table th:nth-child(7), table td:nth-child(7) { width: 12%; }

/* Terminal Style - Allow table background colors */
table .bg-gray-50,
table thead { 
  background-color: #ffffff !important; 
}
.bg-gray-100 { 
  background-color: #f5f5f5; 
}

/* A4 Border System - Table borders enabled */
.border { border: 1px solid #000000; }
.border-gray-300 { border-color: #000000; }
.border-b-2 { border: none; }
.border-t { border: none; }

/* Status Badge System */
.rounded-full { border-radius: 50px; }
.px-2 { padding-left: 0.2cm; padding-right: 0.2cm; }
.py-1 { padding-top: 0.1cm; padding-bottom: 0.1cm; }

/* Minimal spacing for terminal printing */
.p-3, .p-4 { padding: 1mm; }
.pt-4 { padding-top: 1mm; }
.pb-4 { padding-bottom: 1mm; }
.pb-6 { padding-bottom: 1mm; }
.mt-4 { margin-top: 1mm; }
.mt-6 { margin-top: 1mm; }
.mt-12 { margin-top: 2mm; }

/* Clean Borders - Table borders enabled */
table .border, 
table .border-gray-300, 
table .border-gray-200 {
  border: 0.5pt solid #000000 !important;
}

.border-b-2 {
  border: none;
  page-break-after: avoid;
}

.border-t {
  border: none;
}

.rounded {
  border-radius: 0;
}

/* Signature sections - Thai Style with Dots - Expanded */
.signature-row {
  margin-top: 3mm !important;
  border-top: var(--divider, 1pt) solid #000000 !important;
  padding-top: 4mm !important;
  height: 28mm !important;
  width: 100% !important;
  display: flex !important;
}

.signature-section {
  width: 50% !important;
  padding: 3mm !important;
  text-align: center !important;
  background: #ffffff !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
}

.signature-space {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-top: 2mm !important;
}

.signature-dots {
  font-size: 12pt !important;
  line-height: 1.2 !important;
  margin-bottom: 3mm !important;
  letter-spacing: 1.5pt !important;
  width: 80% !important;
  color: #000000 !important;
  font-weight: 700 !important;
}

.signature-name {
  font-size: 9pt !important;
  line-height: 1.2 !important;
  color: #000000 !important;
  margin-top: 1mm !important;
  font-weight: 600 !important;
}

/* Document footer - Ultra Compact */
.document-footer {
  margin-top: 1rem;
  page-break-inside: avoid;
  border-top: var(--divider, 1pt) solid #000000;
  padding-top: 0.2rem;
  font-size: 8px;
  text-align: center;
}

/* Make signature section headings darker */
.document-sub-footer .text-xs {
  color: #000000 !important;
  font-weight: 700 !important;
}

/* Hardcoded Utility Classes - No Variables */
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-left { text-align: left; }

.font-semibold { font-weight: 600; }
.font-bold { font-weight: bold; }
.font-mono { font-family: 'Courier New', Monaco, monospace; }

/* Fixed Font Sizes */
.text-2xl { font-size: 14pt; line-height: 1.1; }
.text-xl { font-size: 12pt; line-height: 1.1; }
.text-lg { font-size: 11pt; line-height: 1.2; }
.text-sm { font-size: 9pt; line-height: 1.2; }
.text-xs { font-size: 8pt; line-height: 1.1; }

/* Fixed Spacing */
.space-y-1 > * + * { margin-top: 1mm; }

.mb-1 { margin-bottom: 1mm; }
.mb-2 { margin-bottom: 2mm; }
.mt-1 { margin-top: 1mm; }
.mt-2 { margin-top: 2mm; }
.mt-3 { margin-top: 3mm; }
.mt-4 { margin-top: 4mm; }
.ml-2 { margin-left: 2mm; }

/* Fixed Layout */
.max-w-md { max-width: 80mm; }
.w-full { width: 100%; }

/* Fixed Colors */
.text-gray-600 { color: #666666; }
.text-gray-700 { color: #333333; }
.text-gray-900 { color: #000000; }

.min-h-20 { min-height: 2rem; }

/* ===== SCREEN DISPLAY ===== */
.erp-document {
  /* Always center on screen */
  margin: 10mm auto;
  box-shadow: 0 4pt 16pt rgba(0, 0, 0, 0.1);
  border: 0.5pt solid #cccccc;
  /* Adjustable row sizing */
  --row-line-height: 8mm;   /* increase for taller rows */
  --cell-vpad: 1mm;         /* vertical padding */
  /* Consistent divider thickness across the document */
  --divider: 1pt;
  /* Dynamic grid layout based on page content */
  --grid-rows: 24mm 26mm 1fr 35mm 20mm; /* default: with signatures */
}

/* Conditional grid layout for pages without signatures */
.erp-document[data-no-signatures="true"] {
  --grid-rows: 24mm 26mm 1fr 20mm; /* head, sub-head, table, footer only */
}

.erp-document[data-no-signatures="true"] .document-content {
  grid-template-rows: 24mm 26mm 1fr 20mm;
}

/* ===== PRINT OPTIMIZATION ===== */
@media print {
  @page {
    size: A4 portrait;
    margin: 0mm;
  }
  
  .erp-document {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  .a4-document {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* Grid remains stable on print; avoid fixed positioning to prevent overlaps */
  .document-footer,
  .document-sub-footer {
    position: relative !important;
    page-break-inside: avoid !important;
  }
}
</style>
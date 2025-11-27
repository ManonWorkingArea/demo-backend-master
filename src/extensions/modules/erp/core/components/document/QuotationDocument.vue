<template>
  <!-- Quotation Document with Internal Data - Complete CSS Isolation -->
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
              ใบเสนอราคา (QUOTATION)
            </div>
          </div>
          
          <!-- Bottom Row: Code + Date -->
          <div class="header-bottom-row">
            <div class="header-code-section">
              หมายเลขเอกสาร : {{ currentDocument.document_number || 'QT-XXXX-XXXX' }}
              <span v-if="totalPages > 1" style="font-size: 8pt; color: #666; margin-left: 10mm;">
                ({{ displayItems.length }} รายการ, {{ totalPages }} หน้า)
              </span>
            </div>
            <div class="header-date-section">
              วันที่ออกเอกสาร : {{ formatDate(currentDocument.quotation_date) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- SUB-HEAD: Company & Customer Information (Top Fixed) -->
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
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">ข้อมูลลูกค้า</h3>
            <div class="space-y-1 text-xs">
              <div><span class="text-gray-600">ชื่อ:</span> {{ currentDocument.customer_name || 'ไม่ระบุ' }}</div>
              <div><span class="text-gray-600">ที่อยู่:</span> {{ currentDocument.customer_address || 'ไม่ระบุ' }}</div>
              <div><span class="text-gray-600">ผู้ติดต่อ:</span> {{ currentDocument.contact_person || 'ไม่ระบุ' }}</div>
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
            <div class="text-xs text-center mb-2" style="font-size: 9pt;">ผู้เสนอราคา</div>
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
            *** ใบเสนอราคานี้มีผลภายในระยะเวลาที่กำหนด ***
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { useERPDocument, documentMappings } from './composables/useERPDocument.js'

export default {
  name: 'QuotationDocument',
  props: {
    data: {
      type: Object,
      required: false,
      default: null
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    return useERPDocument(props, documentMappings.quotation)
  }
}
</script>

<style src="./styles/DocumentStyles.css" scoped></style>

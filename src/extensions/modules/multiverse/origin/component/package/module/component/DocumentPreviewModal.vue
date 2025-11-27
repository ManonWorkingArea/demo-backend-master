<template>
  <!-- Document Preview Modal (Invoice & Receipt) -->
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div :class="headerClasses" class="px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <h3 :class="headerTextClasses" class="text-lg font-medium">
            {{ documentIcon }} {{ documentTitle }}
          </h3>
          <button 
            @click="$emit('close')"
            :class="closeButtonClasses"
            class="p-2 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Document Content -->
      <div v-if="document" class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Document Header -->
        <div class="text-center mb-6 pb-4 border-b">
          <h2 class="text-2xl font-bold text-gray-900">{{ documentTitle }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ documentSubtitle }}</p>
        </div>

        <!-- Document Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Left Column -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">{{ documentInfoTitle }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">เลขที่:</span>
                <span class="font-medium">{{ documentNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">วันที่ออก:</span>
                <span>{{ formatDate(documentDate) }}</span>
              </div>
              
              <!-- Invoice specific fields -->
              <div v-if="isInvoice && document.dueDate" class="flex justify-between">
                <span class="text-gray-600">กำหนดชำระ:</span>
                <span>{{ formatDate(document.dueDate) }}</span>
              </div>
              
              <!-- Receipt specific fields -->
              <div v-if="isReceipt" class="flex justify-between">
                <span class="text-gray-600">วันที่ชำระ:</span>
                <span class="text-green-600">{{ formatDate(document.paymentDate) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">สถานะ:</span>
                <span :class="statusClasses">
                  {{ getStatusText(document.status) }}
                </span>
              </div>
              
              <div v-if="document.paidAt" class="flex justify-between">
                <span class="text-gray-600">วันที่ชำระ:</span>
                <span class="text-green-600">{{ formatDate(document.paidAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">ข้อมูลลูกค้า</h4>
            
            <!-- Customer Info -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ชื่อ:</span>
                <span class="ml-2 font-medium">{{ customerInfo.name }}</span>
              </div>
              <div v-if="customerInfo.email" class="flex justify-between">
                <span class="text-gray-600">อีเมล:</span>
                <span class="ml-2">{{ customerInfo.email }}</span>
              </div>
              <div v-if="customerInfo.phone" class="flex justify-between">
                <span class="text-gray-600">เบอร์โทร:</span>
                <span class="ml-2">{{ customerInfo.phone }}</span>
              </div>
              <div v-if="customerInfo.taxId" class="flex justify-between">
                <span class="text-gray-600">เลขประจำตัวผู้เสียภาษี:</span>
                <span class="ml-2 font-mono">{{ customerInfo.taxId }}</span>
              </div>
            </div>

            <!-- No Customer Info Warning -->
            <div v-if="!customerInfo.name || customerInfo.name === 'FTI Asset'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <span class="text-sm text-yellow-800">ไม่พบข้อมูลลูกค้า</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Details -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3">รายการบริการ</h4>
          
          <!-- Simple Service Display (No Additional Items) -->
          <div v-if="!hasAdditionalItems" :class="simpleDisplayClasses" class="rounded-lg p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-medium">{{ document.description || defaultDescription }}</p>
                <p class="text-sm text-gray-600">
                  {{ serviceDetails }}
                </p>
                <p v-if="document.metadata?.remainingDaysBonus > 0" class="text-sm text-green-600 mt-1">
                  🎁 วันคงเหลือโบนัส: {{ document.metadata.remainingDaysBonus }} วัน
                </p>
              </div>
              <div class="text-right">
                <p :class="amountClasses" class="text-2xl font-bold">฿{{ formatPrice(document.amount) }}</p>
                <p class="text-sm text-gray-500">{{ document.currency || 'THB' }}</p>
              </div>
            </div>
          </div>

          <!-- Detailed Items Table (With Additional Items) -->
          <div v-else>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายการ</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่อหน่วย</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">รวม</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in document.items || []" :key="index"
                      :class="index > 0 ? 'bg-blue-50' : ''">
                    <td class="px-4 py-3">
                      <div class="flex items-center">
                        <span v-if="index === 0" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                          {{ isReceipt ? '🧊' : '📦' }} หลัก
                        </span>
                        <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          ➕ เพิ่มเติม
                        </span>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ item.description }}</p>
                          <p v-if="index === 0 && document.metadata?.subscriptionPeriodNumber" 
                             class="text-xs text-gray-500">Period #{{ document.metadata.subscriptionPeriodNumber }}</p>
                          <p v-if="index === 0 && isReceipt && document.metadata?.packageName" 
                             class="text-xs text-gray-500">{{ document.metadata.packageName }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-gray-900">{{ item.quantity || 1 }}</td>
                    <td class="px-4 py-3 text-right text-sm text-gray-900">฿{{ formatPrice(item.unitPrice || item.amount || 0) }}</td>
                    <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">฿{{ formatPrice(item.amount || item.totalPrice || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary Section (Only for Additional Items) -->
            <div class="mt-4 bg-gray-50 rounded-lg p-4">
              <div class="space-y-2">
                <!-- Base Package Cost -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ค่าบริการหลัก ({{ document.metadata?.packageName || 'Package' }}):</span>
                  <span class="font-medium">฿{{ formatPrice(basePackageAmount) }}</span>
                </div>
                
                <!-- Additional Items Cost -->
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ค่าบริการเพิ่มเติม ({{ additionalItemsCount }} รายการ):</span>
                  <span class="font-medium text-blue-600">฿{{ formatPrice(additionalItemsAmount) }}</span>
                </div>
                
                <!-- Bonus Days Info -->
                <div v-if="document.metadata?.remainingDaysBonus > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">วันคงเหลือโบนัส:</span>
                  <span class="text-green-600">{{ document.metadata.remainingDaysBonus }} วัน</span>
                </div>
                
                <div class="border-t pt-2 mt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-base font-medium text-gray-900">ยอดรวมทั้งสิ้น:</span>
                    <span :class="totalAmountClasses" class="text-xl font-bold">฿{{ formatPrice(document.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div v-if="showPaymentInfo" class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3">ข้อมูลการชำระเงิน</h4>
          <div :class="paymentInfoClasses" class="rounded-lg p-4 border">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ช่องทางการชำระ:</span>
                <span>{{ document.paymentMethod || 'ไม่ระบุ' }}</span>
              </div>
              <div v-if="document.paymentReference" class="flex justify-between">
                <span class="text-gray-600">หมายเลขอ้างอิง:</span>
                <span class="font-mono">{{ document.paymentReference }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">วันที่ชำระ:</span>
                <span class="text-green-600 font-medium">{{ formatDate(paymentDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Receipt specific total -->
        <div v-if="isReceipt" class="border-t pt-4">
          <div class="flex justify-between items-center text-lg font-bold">
            <span>จำนวนเงินที่ได้รับ:</span>
            <span class="text-2xl text-green-600">฿{{ formatPrice(document.amount) }}</span>
          </div>
        </div>

        <!-- Receipt Footer -->
        <div v-if="isReceipt" class="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <p>ขอบคุณสำหรับการใช้บริการ</p>
          <p>ใบเสร็จนี้เป็นหลักฐานการชำระเงิน</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t">
        <div class="flex justify-between items-center">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ปิด
          </button>
          
          <div class="flex space-x-2">
            <button
              @click="printDocument"
              :class="printButtonClasses"
              class="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              🖨️ พิมพ์
            </button>
            
            <button
              v-if="isInvoice && document.status !== 'paid'"
              @click="$emit('manage-payment', document)"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              💳 จัดการการชำระ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceManager from '../function/ServiceManager.js';

export default {
  name: 'DocumentPreviewModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: null
    },
    documentType: {
      type: String,
      default: 'invoice', // 'invoice' or 'receipt'
      validator: (value) => ['invoice', 'receipt'].includes(value)
    },
    ownershipInfo: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'manage-payment'],

  computed: {
    /**
     * ตรวจสอบว่าเป็น Invoice หรือไม่
     */
    isInvoice() {
      return this.documentType === 'invoice';
    },

    /**
     * ตรวจสอบว่าเป็น Receipt หรือไม่
     */
    isReceipt() {
      return this.documentType === 'receipt';
    },

    /**
     * ไอคอนของเอกสาร
     */
    documentIcon() {
      return this.isInvoice ? '📄' : '🧾';
    },

    /**
     * ชื่อเอกสาร
     */
    documentTitle() {
      return this.isInvoice ? 'ใบแจ้งหนี้' : 'ใบเสร็จรับเงิน';
    },

    /**
     * ชื่อเอกสารย่อย
     */
    documentSubtitle() {
      return this.isInvoice ? 'INVOICE' : 'RECEIPT';
    },

    /**
     * ชื่อหัวข้อข้อมูลเอกสาร
     */
    documentInfoTitle() {
      return this.isInvoice ? 'ข้อมูลใบแจ้งหนี้' : 'ข้อมูลใบเสร็จ';
    },

    /**
     * เลขที่เอกสาร
     */
    documentNumber() {
      return this.isInvoice ? this.document?.invoiceNumber : this.document?.receiptNumber;
    },

    /**
     * วันที่เอกสาร
     */
    documentDate() {
      return this.isInvoice ? this.document?.createdAt : this.document?.issuedAt;
    },

    /**
     * คำอธิบายเริ่มต้น
     */
    defaultDescription() {
      return this.isInvoice ? 'Package Subscription' : 'Package Subscription Payment';
    },

    /**
     * รายละเอียดบริการ
     */
    serviceDetails() {
      const periodText = this.document?.metadata?.subscriptionPeriodNumber 
        ? `Period: ${this.document.metadata.subscriptionPeriodNumber}` 
        : 'Period: 1';
      
      if (this.isReceipt && this.document?.metadata?.packageName) {
        return `${this.document.metadata.packageName} - ${periodText}`;
      }
      
      return periodText;
    },

    /**
     * วันที่ชำระเงิน
     */
    paymentDate() {
      return this.document?.paidAt || this.document?.paymentDate;
    },

    /**
     * แสดงข้อมูลการชำระเงินหรือไม่
     */
    showPaymentInfo() {
      return (this.isInvoice && this.document?.status === 'paid') || this.isReceipt;
    },

    /**
     * CSS Classes สำหรับ Header
     */
    headerClasses() {
      return this.isInvoice ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
    },

    /**
     * CSS Classes สำหรับข้อความ Header
     */
    headerTextClasses() {
      return this.isInvoice ? 'text-blue-900' : 'text-green-900';
    },

    /**
     * CSS Classes สำหรับปุ่มปิด
     */
    closeButtonClasses() {
      return this.isInvoice ? 'text-blue-400 hover:text-blue-600' : 'text-green-400 hover:text-green-600';
    },

    /**
     * CSS Classes สำหรับสถานะ
     */
    statusClasses() {
      const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
      
      if (this.isReceipt) {
        return `${baseClasses} bg-green-100 text-green-700`;
      }
      
      // Invoice status classes
      switch (this.document?.status) {
        case 'paid':
          return `${baseClasses} bg-green-100 text-green-700`;
        case 'pending_payment':
          return `${baseClasses} bg-yellow-100 text-yellow-700`;
        case 'draft':
          return `${baseClasses} bg-gray-100 text-gray-700`;
        default:
          return `${baseClasses} bg-red-100 text-red-700`;
      }
    },

    /**
     * CSS Classes สำหรับการแสดงผลแบบง่าย
     */
    simpleDisplayClasses() {
      return this.isInvoice ? 'bg-gray-50' : 'bg-green-50 border border-green-200';
    },

    /**
     * CSS Classes สำหรับจำนวนเงิน
     */
    amountClasses() {
      return this.isInvoice ? 'text-gray-900' : 'text-green-600';
    },

    /**
     * CSS Classes สำหรับยอดรวม
     */
    totalAmountClasses() {
      return this.isInvoice ? 'text-gray-900' : 'text-green-600';
    },

    /**
     * CSS Classes สำหรับข้อมูลการชำระเงิน
     */
    paymentInfoClasses() {
      return this.isInvoice ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
    },

    /**
     * CSS Classes สำหรับปุ่มพิมพ์
     */
    printButtonClasses() {
      return this.isInvoice 
        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    },

    /**
     * ข้อมูลลูกค้าที่จัดรูปแบบแล้ว
     */
    customerInfo() {
      return ServiceManager.prepareCustomerInfo(this.document, this.ownershipInfo);
    },

    /**
     * ตรวจสอบว่ามีรายการเพิ่มเติมหรือไม่
     */
    hasAdditionalItems() {
      return ServiceManager.hasAdditionalItems(this.document?.items);
    },

    /**
     * ยอดรายการหลัก (Package)
     */
    basePackageAmount() {
      return ServiceManager.getBasePackageAmount(this.document?.items);
    },

    /**
     * ยอดรายการเพิ่มเติม
     */
    additionalItemsAmount() {
      return ServiceManager.getAdditionalItemsAmount(this.document?.items);
    },

    /**
     * จำนวนรายการเพิ่มเติม
     */
    additionalItemsCount() {
      return this.hasAdditionalItems ? (this.document?.items?.length || 0) - 1 : 0;
    }
  },

  methods: {
    /**
     * จัดรูปแบบราคา
     */
    formatPrice(price) {
      return ServiceManager.formatPrice(price);
    },

    /**
     * จัดรูปแบบวันที่
     */
    formatDate(dateString) {
      return ServiceManager.formatDate(dateString);
    },

    /**
     * แปลงสถานะเป็นข้อความ
     */
    getStatusText(status) {
      return ServiceManager.getStatusText(status);
    },

    /**
     * พิมพ์เอกสาร
     */
    printDocument() {
      if (!this.document) return;

      const printData = {
        title: this.documentTitle,
        documentNumber: this.documentNumber,
        customerInfo: this.customerInfo,
        documentDate: this.documentDate,
        dueDate: this.isInvoice ? this.document.dueDate : null,
        items: this.document.items || [],
        totalAmount: this.document.amount,
        status: this.document.status,
        additionalInfo: {
          paymentDate: this.paymentDate,
          paymentMethod: this.document.paymentMethod
        }
      };

      const printHTML = ServiceManager.generatePrintHTML(printData);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }
};
</script>

<style scoped>
/* Additional custom styles if needed */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style> 
<template>
  <!-- Contract Document Modal -->
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">
            📄 ใบสัญญาบริการ (Service Agreement)
          </h3>
          <button 
            @click="$emit('close')"
            class="p-2 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Document Content -->
      <div v-if="contract" class="p-8 overflow-y-auto max-h-[calc(90vh-140px)] bg-white" id="contract-document">
        <!-- Contract Header -->
        <div class="mb-8 pb-6 border-b">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Left Column - Thai Title -->
            <div class="text-left">
              <h1 class="text-3xl font-bold mb-2">สัญญาบริการ</h1>
              <h2 class="text-xl mb-2">SERVICE AGREEMENT</h2>
            </div>
            
            <!-- Right Column - Contract Details -->
            <div class="text-right">
              <p class="text-lg font-semibold">{{ contract.contractNumber }}</p>
              <p class="text-sm mt-2">วันที่ทำสัญญา: {{ formatDate(contract.contractStartDate) }}</p>
            </div>
          </div>
        </div>

        <!-- Party Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Service Provider (คู่สัญญาฝ่ายที่ 1) -->
          <div>
            <h3 class="font-bold mb-2">คู่สัญญาฝ่ายที่ 1 (ผู้ให้บริการ)</h3>
            <div class="space-y-1 text-sm">
              <div><strong>ชื่อบริษัท:</strong> {{ serviceProviderInfo.companyName }}</div>
              <div><strong>ที่อยู่:</strong> {{ serviceProviderInfo.address }}</div>
              <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {{ serviceProviderInfo.taxId }}</div>
              <div><strong>โทรศัพท์:</strong> {{ serviceProviderInfo.phone }}</div>
              <div><strong>อีเมล:</strong> {{ serviceProviderInfo.email }}</div>
            </div>
          </div>

          <!-- Customer (คู่สัญญาฝ่ายที่ 2) -->
          <div>
            <h3 class="font-bold mb-2">คู่สัญญาฝ่ายที่ 2 (ผู้รับบริการ)</h3>
            <div class="space-y-1 text-sm">
              <div><strong>ชื่อ-นามสกุล:</strong> {{ customerInfo.name || 'ยังไม่ระบุ' }}</div>
              <div v-if="customerInfo.organizationName"><strong>ชื่อองค์กร:</strong> {{ customerInfo.organizationName }}</div>
              <div><strong>ที่อยู่:</strong> {{ customerInfo.address || 'ยังไม่ระบุ' }}</div>
              <div v-if="customerInfo.taxId"><strong>เลขประจำตัวผู้เสียภาษี:</strong> {{ customerInfo.taxId }}</div>
              <div><strong>โทรศัพท์:</strong> {{ customerInfo.phone || 'ยังไม่ระบุ' }}</div>
              <div><strong>อีเมล:</strong> {{ customerInfo.email || 'ยังไม่ระบุ' }}</div>
            </div>
            
            <!-- Warning for incomplete info -->
            <div v-if="!isCustomerInfoComplete" class="mt-2 text-xs">
              <strong>หมายเหตุ:</strong> ข้อมูลลูกค้ายังไม่ครบถ้วน กรุณาตรวจสอบก่อนพิมพ์สัญญา
            </div>
          </div>
        </div>

        <!-- Contract Details -->
        <div class="mb-6">
          <h3 class="font-bold mb-3 border-b pb-2">รายละเอียดการให้บริการ</h3>
          
          <!-- Service Package -->
          <div class="mb-4">
            <h4 class="font-bold mb-2">{{ contract.packageName }}</h4>
            <p class="text-sm mb-3">{{ contract.packageDescription || 'แพ็กเกจบริการมาตรฐาน' }}</p>
            
            <!-- Simple Table -->
            <table class="w-full border-collapse border text-sm">
              <tbody>
                <tr>
                  <td class="border p-2 font-semibold w-1/4">ค่าบริการ</td>
                  <td class="border p-2">฿{{ formatPrice(contract.basePrice) }} {{ getBillingCycleText(contract.billingCycle) }}</td>
                </tr>
                <tr>
                  <td class="border p-2 font-semibold">ระยะเวลาสัญญา</td>
                  <td class="border p-2">{{ contract.contractTerms?.duration || 12 }} {{ contract.contractTerms?.durationType === 'months' ? 'เดือน' : 'ปี' }}</td>
                </tr>
                <tr>
                  <td class="border p-2 font-semibold">ต่ออายุอัตโนมัติ</td>
                  <td class="border p-2">{{ contract.contractTerms?.autoRenewal ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</td>
                </tr>
                <tr>
                  <td class="border p-2 font-semibold">เงื่อนไขการชำระ</td>
                  <td class="border p-2">{{ contract.contractTerms?.paymentTerms || 30 }} วัน</td>
                </tr>
                <tr>
                  <td class="border p-2 font-semibold">สกุลเงิน</td>
                  <td class="border p-2">{{ contract.currency || 'THB' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="mb-8">
          <h3 class="font-bold mb-4 border-b pb-2">เงื่อนไขและข้อตกลง</h3>
          
          <div class="space-y-6 text-sm leading-relaxed">
            <!-- ข้อ 1: ระยะเวลาสัญญา -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 1. ระยะเวลาการให้บริการ</h4>
              <p class="ml-4">
                สัญญานี้มีผลตั้งแต่วันที่ {{ formatDate(contract.contractStartDate) }} 
                เป็นระยะเวลา {{ contract.contractTerms?.duration || 12 }} 
                {{ contract.contractTerms?.durationType === 'months' ? 'เดือน' : 'ปี' }}
                {{ contract.contractTerms?.autoRenewal ? ' และจะต่ออายุอัตโนมัติ' : '' }}
              </p>
            </div>

            <!-- ข้อ 2: ค่าบริการและการชำระเงิน -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 2. ค่าบริการและการชำระเงิน</h4>
              <div class="ml-4 space-y-1">
                <p>2.1 ผู้รับบริการตกลงชำระค่าบริการเป็นจำนวนเงิน {{ formatPrice(contract.basePrice) }} บาท {{ getBillingCycleText(contract.billingCycle) }}</p>
                <p>2.2 กำหนดการชำระเงิน: ภายใน {{ contract.contractTerms?.paymentTerms || 30 }} วัน นับจากวันที่ได้รับใบแจ้งหนี้</p>
                <p>2.3 ค่าบริการไม่รวมภาษีมูลค่าเพิ่ม (หากมี)</p>
              </div>
            </div>

            <!-- ข้อ 3: การให้บริการ -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 3. การให้บริการ</h4>
              <div class="ml-4 space-y-1">
                <p>3.1 ผู้ให้บริการจะให้บริการตามแพ็กเกจ "{{ contract.packageName }}" ที่ได้ตกลงกัน</p>
                <p>3.2 การบริการจะเริ่มดำเนินการหลังจากได้รับการชำระเงินครั้งแรกแล้ว</p>
                <p>3.3 ผู้ให้บริการมีสิทธิ์ปรับปรุงหรือเปลี่ยนแปลงรายละเอียดการบริการเพื่อให้เหมาะสมกับสถานการณ์</p>
              </div>
            </div>

            <!-- ข้อ 4: การยกเลิกสัญญา -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 4. การยกเลิกสัญญา</h4>
              <div class="ml-4 space-y-1">
                <p>4.1 คู่สัญญาใดฝ่ายหนึ่งสามารถยกเลิกสัญญานี้ได้โดยแจ้งให้อีกฝ่ายทราบล่วงหน้าเป็นลายลักษณ์อักษรไม่น้อยกว่า 30 วัน</p>
                <p>4.2 กรณีผู้รับบริการผิดนัดชำระค่าบริการเกิน 30 วัน ผู้ให้บริการมีสิทธิ์ยกเลิกสัญญาได้ทันที</p>
                <p>4.3 การยกเลิกสัญญาไม่ส่งผลกระทบต่อภาระหนี้ที่เกิดขึ้นก่อนการยกเลิก</p>
              </div>
            </div>

            <!-- ข้อ 5: ความรับผิดชอบ -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 5. ความรับผิดชอบ</h4>
              <div class="ml-4 space-y-1">
                <p>5.1 ผู้ให้บริการจะดำเนินการให้บริการด้วยความระมัดระวังและเป็นมืออาชีพ</p>
                <p>5.2 ผู้รับบริการมีหน้าที่ให้ความร่วมมือและข้อมูลที่จำเป็นแก่ผู้ให้บริการ</p>
                <p>5.3 คู่สัญญาทั้งสองฝ่ายตกลงรักษาความลับของข้อมูลที่ได้รับทราบจากการให้บริการ</p>
              </div>
            </div>

            <!-- ข้อ 6: กฎหมายที่ใช้บังคับ -->
            <div>
              <h4 class="font-semibold mb-2">ข้อ 6. กฎหมายที่ใช้บังคับ</h4>
              <p class="ml-4">
                สัญญานี้จะใช้กฎหมายไทยเป็นหลักในการตีความและบังคับใช้ และหากเกิดข้อพิพาทจะนำเรื่องไปสู่การไกล่เกลี่ยหรือศาลไทย
              </p>
            </div>
          </div>
        </div>

        <!-- Contract Metadata -->
        <div class="mb-8">
          <h3 class="font-bold mb-4 border-b pb-2">ข้อมูลเพิ่มเติม</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border p-4 text-sm">
              <h4 class="font-semibold mb-2">ข้อมูลทางเทคนิค</h4>
              <div class="space-y-1">
                <div>Contract ID: {{ contract._id?.slice(-8) || 'N/A' }}</div>
                <div>Collection ID: {{ contract.collectionId?.slice(-8) || 'N/A' }}</div>
                <div>Package ID: {{ contract.packageId?.slice(-8) || 'N/A' }}</div>
                <div>สกุลเงิน: {{ contract.currency || 'THB' }}</div>
              </div>
            </div>
            
            <div class="border p-4 text-sm">
              <h4 class="font-semibold mb-2">การดำเนินการ</h4>
              <div class="space-y-1">
                <div>สร้างโดย: {{ contract.createdBy || 'ระบบ' }}</div>
                <div>วันที่สร้าง: {{ formatDate(contract.created_at) }}</div>
                <div>สถานะ: {{ getStatusText(contract.status) }}</div>
                <div v-if="contract.activatedBy">เปิดใช้โดย: {{ contract.activatedBy }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="border-t pt-8">
          <h3 class="font-bold mb-6 text-center">ลายเซ็นคู่สัญญา</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Service Provider Signature -->
            <div class="text-center">
              <div class="mb-6">
                <h4 class="font-semibold mb-2">คู่สัญญาฝ่ายที่ 1 (ผู้ให้บริการ)</h4>
                <div class="border h-24 flex items-center justify-center">
                  <span class="text-sm">ลายเซ็น</span>
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <div class="border-b pb-1">{{ serviceProviderInfo.signatureName }}</div>
                <div>{{ serviceProviderInfo.position }}</div>
                <div>วันที่: .........................</div>
              </div>
            </div>

            <!-- Customer Signature -->
            <div class="text-center">
              <div class="mb-6">
                <h4 class="font-semibold mb-2">คู่สัญญาฝ่ายที่ 2 (ผู้รับบริการ)</h4>
                <div class="border h-24 flex items-center justify-center">
                  <span class="text-sm">ลายเซ็น</span>
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <div class="border-b pb-1">{{ customerInfo.name || '.............................' }}</div>
                <div>{{ customerInfo.position || 'ผู้รับบริการ' }}</div>
                <div>วันที่: .........................</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contract Footer -->
        <div class="mt-8 pt-6 border-t text-center text-xs">
          <p>สัญญานี้ทำขึ้นเป็นสองฉบับ มีข้อความตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความในสัญญาโดยตลอดแล้ว</p>
          <p>จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน</p>
          <p class="mt-2">เอกสารออกจากระบบเมื่อ: {{ formatDate(new Date()) }}</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t">
        <div class="flex justify-between items-center">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium border rounded-md"
          >
            ปิด
          </button>
          
          <div class="flex space-x-2">
            <button
              v-if="!isCustomerInfoComplete"
              @click="$emit('edit-customer-info')"
              class="px-4 py-2 text-sm font-medium border rounded-md"
            >
              ✏️ แก้ไขข้อมูลลูกค้า
            </button>
            
            <button
              @click="printContract"
              class="px-4 py-2 text-sm font-medium border rounded-md"
            >
              🖨️ พิมพ์สัญญา
            </button>
            
            <button
              v-if="contract.status === 'inactive'"
              @click="$emit('activate-contract', contract)"
              class="px-4 py-2 text-sm font-medium border rounded-md"
            >
              ✅ เปิดใช้งานสัญญา
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
  name: 'ContractDocumentModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    contract: {
      type: Object,
      default: null
    },
    ownershipInfo: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'edit-customer-info', 'activate-contract'],

  computed: {
    /**
     * ข้อมูลผู้ให้บริการ (ปรับแต่งตามองค์กรของคุณ)
     */
    serviceProviderInfo() {
      return {
        companyName: 'บริษัท เทคโนโลยีและบริการ จำกัด',
        address: '123 ถนนเทคโนโลยี แขวงนวัตกรรม เขตดิจิทัล กรุงเทพฯ 10900',
        taxId: '0-1234-56789-12-3',
        phone: '02-123-4567',
        email: 'contact@company.com',
        signatureName: 'นายเทคโนโลยี นวัตกรรม',
        position: 'ผู้อำนวยการ'
      };
    },

    /**
     * ข้อมูลลูกค้าที่จัดรูปแบบแล้ว
     */
    customerInfo() {
      if (!this.ownershipInfo) {
        return {
          name: 'ยังไม่ระบุ',
          organizationName: null,
          address: 'ยังไม่ระบุ',
          taxId: null,
          phone: 'ยังไม่ระบุ',
          email: 'ยังไม่ระบุ',
          position: 'ผู้รับบริการ'
        };
      }

      const customerData = ServiceManager.prepareCustomerInfo(this.contract, this.ownershipInfo);
      
      return {
        name: customerData.name || 'ยังไม่ระบุ',
        organizationName: this.ownershipInfo.organization?.name || null,
        address: this.ownershipInfo.billingAddress?.fullAddress || 
                 `${this.ownershipInfo.billingAddress?.street || ''} ${this.ownershipInfo.billingAddress?.city || ''} ${this.ownershipInfo.billingAddress?.province || ''} ${this.ownershipInfo.billingAddress?.postalCode || ''}`.trim() || 
                 'ยังไม่ระบุ',
        taxId: customerData.taxId || null,
        phone: customerData.phone || 'ยังไม่ระบุ',
        email: customerData.email || 'ยังไม่ระบุ',
        position: this.ownershipInfo.organization?.position || 'ผู้รับบริการ'
      };
    },

    /**
     * ตรวจสอบข้อมูลลูกค้าครบถ้วนหรือไม่
     */
    isCustomerInfoComplete() {
      const info = this.customerInfo;
      return info.name !== 'ยังไม่ระบุ' && 
             info.phone !== 'ยังไม่ระบุ' && 
             info.email !== 'ยังไม่ระบุ' && 
             info.address !== 'ยังไม่ระบุ';
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
     * แปลงรอบการเรียกเก็บเงิน
     */
    getBillingCycleText(cycle) {
      return ServiceManager.getBillingCycleText(cycle);
    },

    /**
     * พิมพ์สัญญา
     */
    printContract() {
      if (!this.contract) return;

      // เตือนถ้าข้อมูลลูกค้าไม่ครบ
      if (!this.isCustomerInfoComplete) {
        const confirmPrint = confirm('ข้อมูลลูกค้ายังไม่ครบถ้วน คุณต้องการพิมพ์สัญญาต่อไปหรือไม่?');
        if (!confirmPrint) {
          return;
        }
      }

      // สร้าง HTML สำหรับการพิมพ์
      const contractElement = document.getElementById('contract-document');
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>สัญญาบริการ - ${this.contract.contractNumber}</title>
          <style>
            body { 
              font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .border { border: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .rounded-lg { border-radius: 0.5rem; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-blue-50 { background-color: #eff6ff; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .ml-4 { margin-left: 1rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            .text-blue-600 { color: #2563eb; }
            .text-green-600 { color: #16a34a; }
            .leading-relaxed { line-height: 1.625; }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 3rem;
              margin-top: 2rem;
            }
            .signature-box {
              text-align: center;
              padding: 1rem;
            }
            .signature-area {
              height: 6rem;
              border: 2px dashed #d1d5db;
              margin-bottom: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
            }
            .signature-line {
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 0.25rem;
              margin-bottom: 0.5rem;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${contractElement.innerHTML}
        </body>
        </html>
      `;

      // เปิดหน้าต่างใหม่สำหรับการพิมพ์
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }
};
</script>

<style scoped>
/* Custom styles for contract document */
.contract-document {
  background: white;
  color: #333;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white !important;
  }
}
</style> 
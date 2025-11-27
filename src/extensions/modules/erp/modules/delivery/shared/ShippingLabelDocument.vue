<template>
  <div class="shipping-label-document">
    <!-- Label Header -->
    <div class="label-header">
      <div class="carrier-section">
        <div class="carrier-logo">
          <i class="fas fa-truck"></i>
        </div>
        <div class="carrier-info">
          <h2 class="carrier-name">{{ delivery.selected_carrier || 'ขนส่งมาตรฐาน' }}</h2>
          <div class="service-type">Express Delivery Service</div>
        </div>
      </div>
      
      <div class="tracking-section">
        <div class="tracking-number">
          <div class="tracking-label">Tracking Number</div>
          <div class="tracking-code">{{ delivery.tracking_number || generateTrackingNumber() }}</div>
        </div>
        <div class="label-number">
          <div class="label-text">Label #</div>
          <div class="label-code">{{ delivery.shipping_label_number }}</div>
        </div>
      </div>
    </div>

    <!-- Shipping Info -->
    <div class="shipping-info">
      <div class="from-section">
        <div class="section-title">
          <i class="fas fa-warehouse"></i>
          FROM / จากผู้ส่ง
        </div>
        <div class="address-block">
          <div class="company-name">บริษัท ตัวอย่าง จำกัด</div>
          <div class="address-line">123 ถนนตัวอย่าง แขวงตัวอย่าง</div>
          <div class="address-line">เขตตัวอย่าง กรุงเทพฯ 10100</div>
          <div class="contact-info">
            <span><i class="fas fa-phone"></i> 02-123-4567</span>
            <span><i class="fas fa-envelope"></i> shipping@company.com</span>
          </div>
        </div>
      </div>

      <div class="to-section">
        <div class="section-title">
          <i class="fas fa-home"></i>
          TO / ถึงผู้รับ
        </div>
        <div class="address-block recipient">
          <div class="recipient-name">{{ delivery.customer_name }}</div>
          <div v-if="delivery.customer_phone" class="recipient-phone">
            <i class="fas fa-phone"></i> {{ delivery.customer_phone }}
          </div>
          <div v-if="delivery.shipping_address" class="recipient-address">
            <div v-if="delivery.shipping_address.company" class="company">{{ delivery.shipping_address.company }}</div>
            <div class="address-line">{{ delivery.shipping_address.address1 }}</div>
            <div v-if="delivery.shipping_address.address2" class="address-line">{{ delivery.shipping_address.address2 }}</div>
            <div class="location">
              {{ delivery.shipping_address.district || '' }}
              {{ delivery.shipping_address.amphoe || '' }}
              {{ delivery.shipping_address.province || '' }}
              {{ delivery.shipping_address.postal_code || '' }}
            </div>
          </div>
          <div v-else class="no-address">ไม่มีที่อยู่จัดส่ง</div>
        </div>
      </div>
    </div>

    <!-- Package Details -->
    <div class="package-details">
      <div class="package-info">
        <h3><i class="fas fa-box"></i> Package Information</h3>
        <div class="package-grid">
          <div class="package-item">
            <label>Delivery Number:</label>
            <span class="value">{{ delivery.delivery_number }}</span>
          </div>
          <div class="package-item" v-if="delivery.work_order_number">
            <label>Work Order:</label>
            <span class="value">{{ delivery.work_order_number }}</span>
          </div>
          <div class="package-item">
            <label>Items Count:</label>
            <span class="value">{{ getItemsCount() }} รายการ</span>
          </div>
          <div class="package-item">
            <label>Weight (Estimated):</label>
            <span class="value">{{ calculateWeight() }} kg</span>
          </div>
          <div class="package-item">
            <label>Service Type:</label>
            <span class="value">{{ getServiceType() }}</span>
          </div>
          <div class="package-item">
            <label>COD Amount:</label>
            <span class="value cod-amount">฿{{ formatNumber(getTotalAmount()) }}</span>
          </div>
        </div>
      </div>

      <div class="delivery-instructions">
        <h4><i class="fas fa-clipboard-list"></i> Delivery Instructions</h4>
        <ul class="instructions-list">
          <li>กรุณาตรวจสอบชื่อผู้รับและที่อยู่ให้ถูกต้อง</li>
          <li>ต้องมีบุคคลรับของ และแสดงบัตรประชาชน</li>
          <li v-if="delivery.notes">หมายเหตุพิเศษ: {{ delivery.notes }}</li>
          <li>กรณีไม่พบผู้รับ กรุณาโทรกลับที่หมายเลข {{ delivery.customer_phone || '02-123-4567' }}</li>
        </ul>
      </div>
    </div>

    <!-- Barcode Section -->
    <div class="barcode-section">
      <div class="barcode-container">
        <div class="barcode-placeholder">
          <div class="barcode-lines">
            <div class="line" v-for="n in 60" :key="n" :style="{ height: Math.random() * 80 + 20 + 'px' }"></div>
          </div>
        </div>
        <div class="barcode-number">{{ delivery.shipping_label_number }}</div>
      </div>
      
      <div class="qr-code">
        <div class="qr-placeholder">
          <div class="qr-pattern">
            <div class="qr-row" v-for="row in 12" :key="row">
              <div class="qr-cell" v-for="col in 12" :key="col" :class="{ 'filled': Math.random() > 0.5 }"></div>
            </div>
          </div>
        </div>
        <div class="qr-label">Scan for Tracking</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="label-footer">
      <div class="footer-info">
        <div class="date-info">
          <div><strong>Ship Date:</strong> {{ formatDate(new Date()) }}</div>
          <div><strong>Expected Delivery:</strong> {{ formatDate(getExpectedDeliveryDate()) }}</div>
        </div>
        
        <div class="signature-area">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">ลงชื่อผู้รับ / Recipient Signature</div>
            <div class="signature-date">Date: _______________</div>
          </div>
        </div>
      </div>
      
      <div class="footer-notes">
        <p><strong>Terms & Conditions:</strong> Please check items before accepting delivery. 
           Report any damage within 24 hours. Keep this label for tracking reference.</p>
        <p><strong>เงื่อนไข:</strong> กรุณาตรวจสอบสินค้าก่อนรับ แจ้งความเสียหายภายใน 24 ชั่วโมง 
           เก็บใบปะหน้าไว้สำหรับอ้างอิง</p>
      </div>
    </div>

    <!-- Print Actions -->
    <div class="print-actions" v-if="!isPrintMode">
      <button class="btn btn-primary" @click="printLabel">
        <i class="fas fa-print"></i>
        พิมพ์ใบปะหน้า
      </button>
      <button class="btn btn-success" @click="downloadLabel">
        <i class="fas fa-download"></i>
        ดาวน์โหลด
      </button>
      <button class="btn btn-info" @click="trackPackage">
        <i class="fas fa-search"></i>
        ติดตามพัสดุ
      </button>
      <button class="btn btn-outline" @click="$emit('close')">
        <i class="fas fa-times"></i>
        ปิด
      </button>
    </div>
  </div>
</template>

<script>
// Vue composition API functions imported as needed

export default {
  name: 'ShippingLabelDocument',
  props: {
    delivery: {
      type: Object,
      required: true
    },
    isPrintMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props) {
    
    const getItemsCount = () => {
      return props.delivery.items ? props.delivery.items.length : 0
    }
    
    const getTotalAmount = () => {
      const subtotal = props.delivery.total_amount || 0
      const shipping = props.delivery.shipping_cost || 0
      return subtotal + shipping
    }
    
    const calculateWeight = () => {
      // Estimate weight based on item count (for demo)
      const itemCount = getItemsCount()
      const estimatedWeight = itemCount * 0.5 + 0.2 // 0.5kg per item + 0.2kg packaging
      return estimatedWeight.toFixed(1)
    }
    
    const getServiceType = () => {
      const method = props.delivery.shipping_method
      const typeMap = {
        'pickup': 'Pick up at Store',
        'delivery': 'Standard Delivery',
        'post': 'Thailand Post',
        'ems': 'EMS Express',
        'kerry': 'Kerry Express',
        'dhl': 'DHL Express',
        'fedex': 'FedEx International',
        'flash': 'Flash Express',
        'j_and_t': 'J&T Express',
        'ninja_van': 'Ninja Van',
      }
      return typeMap[method] || 'Standard Delivery'
    }
    
    const generateTrackingNumber = () => {
      // Generate a tracking number if not exists
      return 'TH' + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    }
    
    const getExpectedDeliveryDate = () => {
      const today = new Date()
      const deliveryDate = new Date(today)
      
      // Add delivery days based on shipping method
      const method = props.delivery.shipping_method
      let daysToAdd = 2 // default
      
      if (method === 'express' || method === 'ems' || method === 'flash') {
        daysToAdd = 1
      } else if (method === 'post') {
        daysToAdd = 3
      } else if (method === 'dhl' || method === 'fedex') {
        daysToAdd = 1
      }
      
      deliveryDate.setDate(today.getDate() + daysToAdd)
      return deliveryDate
    }
    
    const formatDate = (dateValue) => {
      if (!dateValue) return '-'
      try {
        const date = new Date(dateValue)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return dateValue
      }
    }
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0)
    }
    
    const printLabel = () => {
      window.print()
    }
    
    const downloadLabel = () => {
      alert('ฟีเจอร์ดาวน์โหลดจะพัฒนาในเฟสถัดไป')
    }
    
    const trackPackage = () => {
      const trackingNumber = props.delivery.tracking_number || generateTrackingNumber()
      alert(`🔍 ติดตามพัสดุหมายเลข: ${trackingNumber}\n\nเปิดในระบบติดตามของ ${props.delivery.selected_carrier || 'ขนส่ง'}`)
    }
    
    return {
      getItemsCount,
      getTotalAmount,
      calculateWeight,
      getServiceType,
      generateTrackingNumber,
      getExpectedDeliveryDate,
      formatDate,
      formatNumber,
      printLabel,
      downloadLabel,
      trackPackage
    }
  }
}
</script>

<style scoped>
.shipping-label-document {
  max-width: 100mm;
  min-height: 150mm;
  margin: 0 auto;
  padding: 8mm;
  background: white;
  font-family: 'Sarabun', Arial, sans-serif;
  font-size: 10px;
  line-height: 1.2;
  color: #000;
  border: 2px dashed #ccc;
  position: relative;
}

/* Label Header */
.label-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #000;
}

.carrier-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.carrier-logo {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.carrier-info {
  flex: 1;
}

.carrier-name {
  font-size: 12px;
  font-weight: bold;
  margin: 0 0 2px 0;
  color: #000;
}

.service-type {
  font-size: 8px;
  color: #666;
  font-style: italic;
}

.tracking-section {
  text-align: right;
  font-size: 8px;
}

.tracking-number,
.label-number {
  margin-bottom: 4px;
}

.tracking-label,
.label-text {
  font-weight: bold;
  color: #666;
}

.tracking-code,
.label-code {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 9px;
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  margin-top: 2px;
}

/* Shipping Info */
.shipping-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-weight: bold;
  font-size: 9px;
  color: #000;
  background: #e0e0e0;
  padding: 3px 6px;
  border-radius: 3px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-title i {
  font-size: 8px;
}

.address-block {
  font-size: 9px;
  line-height: 1.3;
}

.company-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.address-line {
  margin-bottom: 1px;
}

.contact-info {
  margin-top: 4px;
  font-size: 7px;
  color: #666;
}

.contact-info span {
  display: block;
  margin-bottom: 1px;
}

.contact-info i {
  width: 10px;
}

.recipient {
  background: #f8f9fa;
  padding: 6px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.recipient-name {
  font-weight: bold;
  font-size: 11px;
  color: #000;
  margin-bottom: 3px;
}

.recipient-phone {
  font-size: 9px;
  color: #333;
  margin-bottom: 3px;
}

.recipient-address .company {
  font-weight: bold;
  margin-bottom: 2px;
}

.location {
  font-weight: bold;
  color: #000;
}

.no-address {
  color: #dc3545;
  font-style: italic;
}

/* Package Details */
.package-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.package-info h3,
.delivery-instructions h4 {
  font-size: 9px;
  font-weight: bold;
  margin: 0 0 6px 0;
  color: #000;
  display: flex;
  align-items: center;
  gap: 4px;
}

.package-info h3 i,
.delivery-instructions h4 i {
  font-size: 8px;
}

.package-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3px;
}

.package-item {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  padding: 2px 0;
  border-bottom: 1px dotted #ccc;
}

.package-item:last-child {
  border-bottom: none;
}

.package-item label {
  font-weight: bold;
  color: #666;
}

.package-item .value {
  font-weight: bold;
  color: #000;
}

.cod-amount {
  color: #28a745;
  font-weight: bold;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 7px;
  line-height: 1.4;
}

.instructions-list li {
  margin-bottom: 3px;
  padding-left: 8px;
  position: relative;
}

.instructions-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #FF6B35;
  font-weight: bold;
}

/* Barcode Section */
.barcode-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 6px;
  background: #f8f9fa;
  border-radius: 4px;
}

.barcode-container {
  flex: 1;
  text-align: center;
}

.barcode-placeholder {
  width: 120px;
  height: 30px;
  margin: 0 auto 4px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 2px;
  overflow: hidden;
}

.barcode-lines {
  display: flex;
  height: 100%;
  align-items: flex-end;
  justify-content: space-evenly;
  padding: 2px;
}

.line {
  width: 2px;
  background: #000;
  margin-right: 1px;
}

.barcode-number {
  font-family: 'Courier New', monospace;
  font-size: 7px;
  font-weight: bold;
  color: #000;
}

.qr-code {
  text-align: center;
}

.qr-placeholder {
  width: 40px;
  height: 40px;
  margin: 0 auto 4px;
  border: 1px solid #ccc;
  border-radius: 2px;
  background: #fff;
}

.qr-pattern {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  width: 100%;
  height: 100%;
  gap: 1px;
  padding: 2px;
}

.qr-cell {
  background: #fff;
}

.qr-cell.filled {
  background: #000;
}

.qr-label {
  font-size: 6px;
  color: #666;
  font-weight: bold;
}

/* Footer */
.label-footer {
  border-top: 1px solid #ccc;
  padding-top: 8px;
}

.footer-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 6px;
}

.date-info {
  font-size: 8px;
}

.date-info div {
  margin-bottom: 2px;
}

.signature-area {
  text-align: center;
}

.signature-box {
  width: 100%;
}

.signature-line {
  width: 80px;
  height: 20px;
  border-bottom: 1px solid #000;
  margin: 0 auto 3px;
}

.signature-label,
.signature-date {
  font-size: 7px;
  color: #666;
  margin-bottom: 2px;
}

.footer-notes {
  background: #fffacd;
  padding: 4px;
  border-radius: 3px;
  border: 1px solid #f0e68c;
}

.footer-notes p {
  margin: 0 0 3px 0;
  font-size: 6px;
  line-height: 1.3;
  color: #666;
}

.footer-notes p:last-child {
  margin-bottom: 0;
}

/* Print Actions */
.print-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #FF6B35;
  color: white;
}

.btn-primary:hover {
  background: #e55a2d;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-outline {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Print Styles */
@media print {
  .shipping-label-document {
    max-width: none;
    width: 100mm;
    min-height: 150mm;
    padding: 5mm;
    margin: 0;
    box-shadow: none;
    border: none;
    page-break-inside: avoid;
  }
  
  .print-actions {
    display: none !important;
  }
  
  .barcode-lines .line {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  
  .qr-cell.filled {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .shipping-label-document {
    max-width: 100%;
    padding: 15px;
    font-size: 12px;
  }
  
  .shipping-info,
  .package-details,
  .footer-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .label-header {
    flex-direction: column;
    gap: 10px;
    text-align: left;
  }
  
  .tracking-section {
    text-align: left;
  }
  
  .print-actions {
    flex-wrap: wrap;
  }
}
</style>
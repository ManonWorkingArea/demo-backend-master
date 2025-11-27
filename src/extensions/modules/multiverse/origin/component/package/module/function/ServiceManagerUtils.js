/**
 * ServiceManagerUtils - Utility Functions Collection
 * 
 * 🎯 รวบรวม Utility Functions ที่ใช้ร่วมกันใน ServiceManager และ Components อื่นๆ
 * ✅ แยกออกจาก ServiceManager.js เพื่อลดขนาดไฟล์และจัดระเบียบโค้ด
 * 🔧 ฟังก์ชั่นทั้งหมดเป็น static methods สามารถเรียกใช้ได้โดยตรง
 * 🚫 ไม่มี dependencies กับ ServiceManager class
 */

class ServiceManagerUtils {
  
  // ===== 🎨 UI HELPER UTILITIES =====

  /**
   * 🎨 Get CSS class for status display
   * @param {string} status - Status value
   * @returns {string} CSS class
   */
  static getStatusClass(status) {
    return status ? 'text-green-600' : 'text-red-600';
  }

  /**
   * 🎨 Get lifecycle status text in Thai
   * @param {string} status - Lifecycle status
   * @returns {string} Thai status text
   */
  static getLifecycleStatusText(status) {
    const statusMap = {
      'active': 'ใช้งานอยู่',
      'trial': 'ทดลองใช้',
      'expired': 'หมดอายุ',
      'inactive': 'ไม่ใช้งาน',
      'no_subscription': 'ไม่มี Subscription',
      'pending': 'รอดำเนินการ',
      'error': 'ข้อผิดพลาด'
    };
    return statusMap[status] || status;
  }

  /**
   * 🎨 Get color class for remaining days
   * @param {number} remainingDays - Number of remaining days
   * @returns {string} CSS color class
   */
  static getRemainingDaysColor(remainingDays) {
    if (remainingDays <= 7) return 'text-red-600';
    if (remainingDays <= 30) return 'text-orange-600';
    if (remainingDays <= 90) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * 🎨 Get color class for health score
   * @param {number} score - Health score (0-100)
   * @returns {string} CSS color class
   */
  static getHealthScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * 🎨 Get badge class for health status
   * @param {string} status - Health status (healthy, warning, critical)
   * @returns {string} CSS badge class
   */
  static getHealthStatusBadgeClass(status) {
    const classes = {
      'healthy': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'critical': 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  // ===== 🎨 DOCUMENT FORMATTING UTILITIES =====

  /**
   * 🎨 จัดรูปแบบราคา (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {number} price - ราคาที่ต้องการจัดรูปแบบ
   * @returns {string} ราคาที่จัดรูปแบบแล้ว
   */
  static formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
      return '0.00';
    }
    
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * 🎨 จัดรูปแบบวันที่ (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {string} dateString - วันที่ในรูปแบบ string
   * @returns {string} วันที่ที่จัดรูปแบบแล้ว
   */
  static formatDate(dateString) {
    if (!dateString) return 'ไม่ระบุ';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  }

  /**
   * 🎨 แปลงสถานะเป็นข้อความ (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {string} status - สถานะ
   * @returns {string} ข้อความสถานะ
   */
  static getStatusText(status) {
    const statusMap = {
      // Contract Status
      'active': 'ใช้งาน',
      'inactive': 'ไม่ใช้งาน',
      'expired': 'หมดอายุ',
      'cancelled': 'ยกเลิก',
      'draft': 'ร่าง',
      
      // Subscription Status
      'trial': 'ทดลองใช้',
      'pending_payment': 'รอชำระเงิน',
      'paused': 'หยุดชั่วคราว',
      'suspended': 'ระงับการใช้งาน',
      
      // Invoice Status
      'paid': 'ชำระแล้ว',
      'overdue': 'เกินกำหนด',
      'refunded': 'คืนเงินแล้ว',
      'partially_refunded': 'คืนเงินบางส่วน',
      'payment_failed': 'ชำระเงินล้มเหลว',
      'payment_failed_final': 'ชำระเงินล้มเหลวสุดท้าย',
      'credit_applied': 'เครดิตถูกใช้',
      
      // Receipt Status
      'issued': 'ออกแล้ว',
      'voided': 'ยกเลิก'
    };
    
    return statusMap[status] || status || 'ไม่ทราบสถานะ';
  }

  // ===== 📅 DATE & TIME UTILITIES =====

  /**
   * 📅 คำนวณอายุ Subscription (วันตั้งแต่เริ่มต้น)
   * @param {string} periodStart - วันที่เริ่ม period
   * @returns {number} จำนวนวันที่ผ่านไป
   */
  static getSubscriptionAge(periodStart) {
    if (!periodStart) return 0;
    
    const startDate = new Date(periodStart);
    const today = new Date();
    const diffTime = today - startDate;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * 📅 คำนวณวันคงเหลือจนถึงวันสิ้นสุด period
   * @param {string} periodEnd - วันที่สิ้นสุด period
   * @returns {number} จำนวนวันคงเหลือ
   */
  static getRemainingDays(periodEnd) {
    if (!periodEnd) return 0;
    
    const endDate = new Date(periodEnd);
    const today = new Date();
    const diffTime = endDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * 📅 จัดรูปแบบข้อความอายุ Subscription
   * @param {string} periodStart - วันที่เริ่ม period
   * @returns {string} ข้อความอายุ Subscription
   */
  static formatSubscriptionAge(periodStart) {
    const age = ServiceManagerUtils.getSubscriptionAge(periodStart);
    if (age === 0) return 'เริ่มวันนี้';
    if (age === 1) return '1 วัน';
    return `${age} วัน`;
  }

  /**
   * 📅 จัดรูปแบบข้อความวันคงเหลือ
   * @param {string} periodEnd - วันที่สิ้นสุด period
   * @returns {string} ข้อความวันคงเหลือ
   */
  static formatRemainingDays(periodEnd) {
    const remaining = ServiceManagerUtils.getRemainingDays(periodEnd);
    if (remaining === 0) return 'หมดอายุแล้ว';
    if (remaining === 1) return 'เหลือ 1 วัน';
    return `เหลือ ${remaining} วัน`;
  }

  /**
   * 📅 หาวันที่ต่ออายุถัดไปของ Contract
   * @param {Object} contract - ข้อมูล Contract พร้อม subscriptions
   * @returns {string|null} วันที่ต่ออายุถัดไป หรือ null
   */
  static getContractNextRenewal(contract) {
    if (!contract.subscriptions || contract.subscriptions.length === 0) {
      return null;
    }

    // หา active subscription หรือ trial subscription
    const activeSubscription = contract.subscriptions.find(sub => 
      sub.status === 'active' || sub.status === 'trial'
    );

    if (activeSubscription && activeSubscription.periodEnd) {
      return activeSubscription.periodEnd;
    }

    // ถ้าไม่มี active subscription ให้หา subscription ล่าสุด
    const latestSubscription = contract.subscriptions
      .filter(sub => sub.periodEnd)
      .sort((a, b) => new Date(b.periodEnd) - new Date(a.periodEnd))[0];

    return latestSubscription?.periodEnd || null;
  }

  /**
   * 📅 จัดรูปแบบข้อมูลการต่ออายุ Contract
   * @param {Object} contract - ข้อมูล Contract
   * @returns {string} ข้อความข้อมูลการต่ออายุ
   */
  static formatContractRenewalInfo(contract) {
    const nextRenewal = ServiceManagerUtils.getContractNextRenewal(contract);
    if (!nextRenewal) return 'ไม่มีข้อมูลการต่ออายุ';
    
    const remaining = ServiceManagerUtils.getRemainingDays(nextRenewal);
    const renewalDate = ServiceManagerUtils.formatDate(nextRenewal);
    
    if (remaining === 0) return `ครบรอบแล้ว (${renewalDate})`;
    if (remaining === 1) return `ครบรอบพรุ่งนี้ (${renewalDate})`;
    if (remaining <= 7) return `ครบรอบใน ${remaining} วัน (${renewalDate})`;
    if (remaining <= 30) return `ครบรอบใน ${remaining} วัน (${renewalDate})`;
    return `ครบรอบ ${renewalDate}`;
  }

  /**
   * 📅 จัดรูปแบบช่วงวันที่
   * @param {string} startDate - วันที่เริ่มต้น
   * @param {string} endDate - วันที่สิ้นสุด
   * @returns {string} ช่วงวันที่ที่จัดรูปแบบแล้ว
   */
  static formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startStr = start.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const endStr = end.toLocaleDateString('th-TH', {
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    return `${startStr} - ${endStr}`;
  }

  // ===== 📦 PACKAGE CONFIGURATION UTILITIES =====

  /**
   * 📦 แปลง billing cycle เป็นข้อความภาษาไทย
   * @param {string} cycle - billing cycle
   * @returns {string} ข้อความ billing cycle ภาษาไทย
   */
  static getBillingCycleText(cycle) {
    const cycleMap = {
      'monthly': 'รายเดือน',
      'quarterly': 'รายไตรมาส',
      'yearly': 'รายปี'
    };
    return cycleMap[cycle] || cycle;
  }

  /**
   * 📦 คำนวณวันสิ้นสุดระยะทดลองใช้
   * @param {string} contractStartDate - วันที่เริ่มสัญญา
   * @param {number} trialDays - จำนวนวันทดลองใช้
   * @returns {string|null} วันสิ้นสุดระยะทดลองใช้
   */
  static getTrialEndDate(contractStartDate, trialDays) {
    if (!contractStartDate || trialDays === 0) {
      return null;
    }
    
    const startDate = new Date(contractStartDate);
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    
    return trialEndDate.toISOString().split('T')[0];
  }

  /**
   * 📦 คำนวณวันเริ่มเก็บเงิน (หลังจากระยะทดลองใช้)
   * @param {string} contractStartDate - วันที่เริ่มสัญญา
   * @param {number} trialDays - จำนวนวันทดลองใช้
   * @returns {string} วันเริ่มเก็บเงิน
   */
  static getBillingStartDate(contractStartDate, trialDays) {
    if (trialDays === 0) {
      return contractStartDate;
    }
    
    return ServiceManagerUtils.getTrialEndDate(contractStartDate, trialDays);
  }

  // ===== 👤 CUSTOMER INFO UTILITIES =====

  /**
   * 👤 ดึงชื่อลูกค้าจากข้อมูล ownership
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @param {Object} collection - ข้อมูล collection (fallback)
   * @returns {string} ชื่อลูกค้า
   */
  static getCustomerName(ownershipInfo, collection = null) {
    // Priority: ownership > collection fallback
    if (ownershipInfo?.customerInfo?.name) {
      return ownershipInfo.customerInfo.name;
    }
    
    if (collection?.ownershipInfo?.customerInfo?.name) {
      return collection.ownershipInfo.customerInfo.name;
    }
    
    return collection?.siteName || '';
  }

  /**
   * 👤 ดึงอีเมลลูกค้าจากข้อมูล ownership
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @param {Object} collection - ข้อมูล collection (fallback)
   * @returns {string} อีเมลลูกค้า
   */
  static getCustomerEmail(ownershipInfo, collection = null) {
    // Priority: ownership > collection fallback
    if (ownershipInfo?.customerInfo?.email) {
      return ownershipInfo.customerInfo.email;
    }
    
    if (collection?.ownershipInfo?.customerInfo?.email) {
      return collection.ownershipInfo.customerInfo.email;
    }
    
    return collection?.contactEmail || '';
  }

  /**
   * 👤 ดึงเบอร์โทรศัพท์ลูกค้าจากข้อมูล ownership
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @param {Object} collection - ข้อมูล collection (fallback)
   * @returns {string} เบอร์โทรศัพท์ลูกค้า
   */
  static getCustomerPhone(ownershipInfo, collection = null) {
    // Priority: ownership > collection fallback
    if (ownershipInfo?.customerInfo?.phone) {
      return ownershipInfo.customerInfo.phone;
    }
    
    if (collection?.ownershipInfo?.customerInfo?.phone) {
      return collection.ownershipInfo.customerInfo.phone;
    }
    
    return collection?.contactPhone || '';
  }

  /**
   * 👤 ดึงเลขประจำตัวผู้เสียภาษีจากข้อมูล ownership
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @param {Object} collection - ข้อมูล collection (fallback)
   * @returns {string} เลขประจำตัวผู้เสียภาษี
   */
  static getCustomerTaxId(ownershipInfo, collection = null) {
    // Priority: organization tax ID > customer tax ID
    if (ownershipInfo?.organization?.taxId) {
      return ownershipInfo.organization.taxId;
    }
    
    if (ownershipInfo?.customerInfo?.taxId) {
      return ownershipInfo.customerInfo.taxId;
    }
    
    if (collection?.ownershipInfo?.organization?.taxId) {
      return collection.ownershipInfo.organization.taxId;
    }
    
    if (collection?.ownershipInfo?.customerInfo?.taxId) {
      return collection.ownershipInfo.customerInfo.taxId;
    }
    
    return '';
  }

  /**
   * 👤 ดึงชื่อที่แสดงของเจ้าของ
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @returns {string} ชื่อที่แสดง
   */
  static getOwnershipDisplayName(ownershipInfo) {
    if (!ownershipInfo) return 'ไม่ระบุ';
    
    if (ownershipInfo.organization?.name) {
      return ownershipInfo.organization.name;
    }
    
    if (ownershipInfo.customerInfo?.name) {
      return ownershipInfo.customerInfo.name;
    }
    
    return 'ไม่ระบุ';
  }

  /**
   * 👤 ดึงที่อยู่จากข้อมูล ownership
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @returns {string} ที่อยู่
   */
  static getOwnershipAddress(ownershipInfo) {
    if (!ownershipInfo) return '';
    
    if (ownershipInfo.billingAddress) {
      const addr = ownershipInfo.billingAddress;
      return `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.postalCode || ''} ${addr.country || ''}`.trim();
    }
    
    return '';
  }

  /**
   * 👤 ตรวจสอบว่าข้อมูล ownership พร้อมสำหรับการออกเอกสารหรือไม่
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @returns {boolean} พร้อมสำหรับการออกเอกสารหรือไม่
   */
  static isOwnershipCompleteForBilling(ownershipInfo) {
    if (!ownershipInfo) return false;
    
    // ใช้ billing status จาก ServiceManager
    return ownershipInfo.billingStatus?.isReady || false;
  }

  /**
   * 👤 สร้างข้อมูล ownership สำหรับเอกสาร
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @returns {Object|null} ข้อมูล ownership สำหรับเอกสาร
   */
  static getOwnershipForDocuments(ownershipInfo) {
    if (!ownershipInfo) return null;
    
    return {
      customerName: ServiceManagerUtils.getOwnershipDisplayName(ownershipInfo),
      customerEmail: ownershipInfo.customerInfo?.email || '',
      customerPhone: ownershipInfo.customerInfo?.phone || '',
      customerAddress: ServiceManagerUtils.getOwnershipAddress(ownershipInfo),
      taxId: ServiceManagerUtils.getCustomerTaxId(ownershipInfo),
      organizationName: ownershipInfo.organization?.name || '',
      billingAddress: ownershipInfo.billingAddress,
      organization: ownershipInfo.organization,
      billingStatus: ownershipInfo.billingStatus
    };
  }

  // ===== 🎨 DOCUMENT ITEM UTILITIES =====

  /**
   * 🎨 คำนวณยอดรวมรายการเพิ่มเติม (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {Array} items - รายการทั้งหมด
   * @returns {number} ยอดรวมรายการเพิ่มเติม
   */
  static getAdditionalItemsAmount(items) {
    if (!items || !Array.isArray(items) || items.length <= 1) {
      return 0;
    }
    
    // รายการแรกเป็น package หลัก, รายการที่เหลือเป็นรายการเพิ่มเติม
    return items.slice(1).reduce((total, item) => {
      return total + (item.amount || item.totalPrice || 0);
    }, 0);
  }

  /**
   * 🎨 คำนวณยอดรายการหลัก (Package) (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {Array} items - รายการทั้งหมด
   * @returns {number} ยอดรายการหลัก
   */
  static getBasePackageAmount(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return 0;
    }
    
    // รายการแรกเป็น package หลัก
    const baseItem = items[0];
    return baseItem.amount || baseItem.totalPrice || 0;
  }

  /**
   * 🎨 ตรวจสอบว่ามีรายการเพิ่มเติมหรือไม่ (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {Array} items - รายการทั้งหมด
   * @returns {boolean} มีรายการเพิ่มเติมหรือไม่
   */
  static hasAdditionalItems(items) {
    return items && Array.isArray(items) && items.length > 1;
  }

  /**
   * 🎨 ดึงข้อมูลลูกค้าสำหรับเอกสาร (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {Object} documentData - ข้อมูลเอกสาร (Invoice หรือ Receipt)
   * @param {Object} ownershipInfo - ข้อมูลเจ้าของ
   * @returns {Object} ข้อมูลลูกค้าที่จัดรูปแบบแล้ว
   */
  static prepareCustomerInfo(documentData, ownershipInfo) {
    // Priority: documentData.customerInfo → ownershipInfo.customerInfo → fallback
    let customerInfo = {};
    
    if (documentData?.customerInfo?.name) {
      customerInfo = documentData.customerInfo;
    } else if (ownershipInfo?.customerInfo?.name) {
      customerInfo = ownershipInfo.customerInfo;
    } else {
      customerInfo = {
        name: 'FTI Asset',
        email: '',
        phone: '',
        taxId: ''
      };
    }
    
    return {
      name: customerInfo.name || 'ไม่ระบุ',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
      taxId: customerInfo.taxId || '',
      taxType: customerInfo.taxType || 'individual'
    };
  }

  /**
   * 🎨 สร้าง HTML สำหรับการพิมพ์เอกสาร (ใช้ร่วมกันใน Invoice และ Receipt Modal)
   * @param {Object} printData - ข้อมูลสำหรับการพิมพ์
   * @returns {string} HTML สำหรับการพิมพ์
   */
  static generatePrintHTML(printData) {
    const {
      title,
      documentNumber,
      customerInfo,
      documentDate,
      dueDate,
      items,
      totalAmount,
      status,
      additionalInfo = {}
    } = printData;

    const itemsHTML = items.map((item, index) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ${index === 0 ? '🧊' : '➕'} ${item.description || 'รายการ'}
        </td>
        <td style="text-align: center; padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ${item.quantity || 1}
        </td>
        <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ฿${ServiceManagerUtils.formatPrice(item.unitPrice || item.amount || 0)}
        </td>
        <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ฿${ServiceManagerUtils.formatPrice(item.amount || item.totalPrice || 0)}
        </td>
      </tr>
    `).join('');

    const baseAmount = ServiceManagerUtils.getBasePackageAmount(items);
    const additionalAmount = ServiceManagerUtils.getAdditionalItemsAmount(items);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .document-info { margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #d1d5db; }
          .items-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .summary { margin-top: 20px; text-align: right; }
          .total { font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <h2>${documentNumber}</h2>
        </div>
        
        <div class="document-info">
          <p><strong>วันที่เอกสาร:</strong> ${ServiceManagerUtils.formatDate(documentDate)}</p>
          ${dueDate ? `<p><strong>กำหนดชำระ:</strong> ${ServiceManagerUtils.formatDate(dueDate)}</p>` : ''}
          <p><strong>สถานะ:</strong> ${ServiceManagerUtils.getStatusText(status)}</p>
        </div>
        
        <div class="customer-info">
          <h3>ข้อมูลลูกค้า</h3>
          <p><strong>ชื่อ:</strong> ${customerInfo.name}</p>
          ${customerInfo.email ? `<p><strong>อีเมล:</strong> ${customerInfo.email}</p>` : ''}
          ${customerInfo.phone ? `<p><strong>โทรศัพท์:</strong> ${customerInfo.phone}</p>` : ''}
          ${customerInfo.taxId ? `<p><strong>เลขประจำตัวผู้เสียภาษี:</strong> ${customerInfo.taxId}</p>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th style="text-align: center;">จำนวน</th>
              <th style="text-align: right;">ราคาต่อหน่วย</th>
              <th style="text-align: right;">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="summary">
          ${baseAmount > 0 ? `<p>Package หลัก: ฿${ServiceManagerUtils.formatPrice(baseAmount)}</p>` : ''}
          ${additionalAmount > 0 ? `<p style="color: #2563eb;">รายการเพิ่มเติม: ฿${ServiceManagerUtils.formatPrice(additionalAmount)}</p>` : ''}
          <p class="total">ยอดรวมทั้งหมด: ฿${ServiceManagerUtils.formatPrice(totalAmount)}</p>
          ${additionalInfo.paymentDate ? `<p><strong>วันที่ชำระ:</strong> ${ServiceManagerUtils.formatDate(additionalInfo.paymentDate)}</p>` : ''}
          ${additionalInfo.paymentMethod ? `<p><strong>วิธีชำระ:</strong> ${additionalInfo.paymentMethod}</p>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // ===== 📋 BUSINESS RULES VALIDATION UTILITIES =====

  /**
   * 📋 ตรวจสอบกฎธุรกิจสำหรับ Invoice
   * @param {Object} invoice - ข้อมูล Invoice
   * @param {Object} ownershipInfo - ข้อมูล ownership
   * @returns {Object} ผลการตรวจสอบ
   */
  static validateInvoiceBusinessRules(invoice, ownershipInfo) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic invoice validation
    if (!invoice.amount || invoice.amount <= 0) {
      validation.errors.push('จำนวนเงินใน Invoice ต้องมากกว่า 0');
      validation.isValid = false;
    }

    if (!invoice.dueDate) {
      validation.errors.push('วันครบกำหนดชำระจำเป็น');
      validation.isValid = false;
    }

    if (!invoice.description) {
      validation.warnings.push('ไม่มีคำอธิบาย Invoice');
    }

    // Ownership validation for billing documents
    if (!ownershipInfo) {
      validation.errors.push('ไม่พบข้อมูลเจ้าของ - จำเป็นสำหรับการออกเอกสารทางการเงิน');
      validation.isValid = false;
    } else {
      // Check ownership completeness
      if (!ServiceManagerUtils.isOwnershipCompleteForBilling(ownershipInfo)) {
        validation.errors.push('ข้อมูลเจ้าของไม่ครบถ้วนสำหรับการออกใบแจ้งหนี้');
        validation.isValid = false;
        
        // Use billing status missing info if available
        if (ownershipInfo.billingStatus?.missingInfo?.length) {
          ownershipInfo.billingStatus.missingInfo.forEach(missing => {
            validation.suggestions.push(`เพิ่ม${missing}`);
          });
        } else {
          // Fallback to manual checks
          if (!ownershipInfo.customerInfo?.email) {
            validation.suggestions.push('เพิ่มอีเมลติดต่อสำหรับการส่งใบแจ้งหนี้');
          }
          if (!ServiceManagerUtils.getCustomerTaxId(ownershipInfo)) {
            validation.suggestions.push('เพิ่มเลขประจำตัวผู้เสียภาษีหรือเลขประจำตัวประชาชน');
          }
          if (!ServiceManagerUtils.getOwnershipAddress(ownershipInfo)) {
            validation.suggestions.push('เพิ่มที่อยู่สำหรับการออกเอกสาร');
          }
        }
      }
      
      // Additional ownership checks
      if (!ownershipInfo.organization?.name && !ownershipInfo.customerInfo?.name) {
        validation.warnings.push('ไม่มีชื่อลูกค้าที่ชัดเจน');
      }
    }

    return validation;
  }
}

export default ServiceManagerUtils; 
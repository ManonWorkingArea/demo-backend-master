/**
 * ServiceManager - Main Orchestrator (Refactored)
 * 
 * 🎯 Main orchestrator that delegates to specialized managers
 * 🏭 Uses Factory Pattern for service creation and management
 * 📦 Modular architecture with BusinessFlowManager, LifecycleManager, and DataAnalyticsManager
 * ✅ Maintains 100% backward compatibility
 */

import ServiceFactory from './ServiceFactory.js';
import ServiceManagerUtils from './ServiceManagerUtils.js';
import ErrorHandler from './utils/ErrorHandler.js';
import BusinessFlowManager from './modules/BusinessFlowManager.js';
import LifecycleManager from './modules/LifecycleManager.js';
import DataAnalyticsManager from './modules/DataAnalyticsManager.js';

class ServiceManager {
  constructor(hostkey, options = {}) {
    this.hostkey = hostkey;
    
    // 🏭 ใช้ Factory Pattern สร้าง services ทั้งหมด
    const services = ServiceFactory.createAllServices(hostkey, {
      environment: options.environment || 'production',
      enableLogging: options.enableLogging || false,
      enableMetrics: options.enableMetrics || false,
      ...options
    });
    
    // Assign services to instance
    Object.assign(this, services);

    // 📦 Initialize specialized managers
    this.businessFlow = new BusinessFlowManager(services);
    this.lifecycle = new LifecycleManager(services);
    this.analytics = new DataAnalyticsManager(services);
  }

  // ===== 📊 OWNERSHIP INTEGRATION METHODS =====
  // Delegate to BusinessFlowManager

  /**
   * 📊 ดึงข้อมูลเจ้าของสำหรับการออกเอกสาร
   */
  async getOwnershipForDocuments(collectionId) {
    return await this.businessFlow.getOwnershipForDocuments(collectionId);
  }

  /**
   * 📋 ตรวจสอบความพร้อมของข้อมูลเจ้าของก่อนสร้าง Contract
   */
  async validateOwnershipForContract(collectionId) {
    return await this.businessFlow.validateOwnershipForContract(collectionId);
  }

  // ===== 🔥 BUSINESS FLOW METHODS =====
  // Delegate to BusinessFlowManager

  /**
   * 🔥 BUSINESS FLOW: ต่ออายุ Subscription
   */
  async renewSubscription(renewalData) {
    return await this.businessFlow.renewSubscription(renewalData);
  }

  /**
   * 🔥 BUSINESS FLOW: กำหนด Package ให้กับ Collection
   */
  async assignPackageToCollection(assignmentData) {
    return await this.businessFlow.assignPackageToCollection(assignmentData);
  }

  // ===== ✅ SUBSCRIPTION ACTIVATION METHODS =====
  // Delegate to BusinessFlowManager

  /**
   * ✅ ยืนยันและเปิดใช้งาน Subscription
   */
  async activateSubscription(subscriptionId, activationData = {}) {
    return await this.businessFlow.activateSubscription(subscriptionId, activationData);
  }

  /**
   * ✅ ยืนยันและเปิดใช้งาน Contract
   */
  async activateContract(contractId, activationData = {}) {
    return await this.businessFlow.activateContract(contractId, activationData);
  }

  // ===== 🔄 RENEWAL ACTIVATION METHODS =====
  // Complex method that stays in ServiceManager for now

  /**
   * 🔄 ยืนยันและเปิดใช้งาน Renewal Subscription
   * Flow: Activate New Subscription + Cancel Old Subscription + Create Receipt + Transfer Remaining Days
   */
  async activateRenewalSubscription(subscriptionId, renewalActivationData = {}) {
    try {
      const results = {
        success: false,
        activatedSubscription: null,
        cancelledSubscription: null,
        receipt: null,
        steps: []
      };

      // Step 1: Get new subscription details
      const newSubscriptionResult = await this.subscription.getById(subscriptionId);
      
      // Check if result is the subscription object directly or wrapped in success/data structure
      let newSubscription;
      if (newSubscriptionResult.success !== undefined) {
        if (!newSubscriptionResult.success) {
          throw new Error(`New subscription not found. ID: ${subscriptionId}, Result: ${JSON.stringify(newSubscriptionResult)}`);
        }
        newSubscription = newSubscriptionResult.data;
      } else if (newSubscriptionResult._id) {
        newSubscription = newSubscriptionResult;
      } else {
        throw new Error(`New subscription not found. ID: ${subscriptionId}, Result: ${JSON.stringify(newSubscriptionResult)}`);
      }
      results.steps.push('✅ New subscription retrieved');

      // Step 2: Get old subscription and calculate remaining days
      let oldSubscription = null;
      let actualRemainingDays = 0;
      
      if (renewalActivationData.previousSubscriptionId) {
        try {
          const oldSubscriptionResult = await this.subscription.getById(renewalActivationData.previousSubscriptionId);
          
          if (oldSubscriptionResult.success !== undefined) {
            if (oldSubscriptionResult.success) {
              oldSubscription = oldSubscriptionResult.data;
            }
          } else if (oldSubscriptionResult._id) {
            oldSubscription = oldSubscriptionResult;
          }
          
          if (oldSubscription) {
            // Calculate actual remaining days
            if (oldSubscription.periodEnd) {
              const today = new Date();
              const endDate = new Date(oldSubscription.periodEnd);
              const diffTime = endDate - today;
              actualRemainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            
            results.steps.push(`✅ Old subscription processed (${actualRemainingDays} วันคงเหลือ)`);
          }
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'ServiceManager.activateRenewalSubscription - old subscription processing',
            subscriptionId,
            previousSubscriptionId: renewalActivationData.previousSubscriptionId,
            severity: 'MEDIUM'
          });
          results.steps.push('⚠️ Old subscription processing failed (continuing anyway)');
        }
      }

      // Step 3: Update new subscription period end with remaining days
      if (actualRemainingDays > 0) {
        const currentPeriodEnd = new Date(newSubscription.periodEnd);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + actualRemainingDays);
        
        await this.subscription.update(subscriptionId, {
          periodEnd: currentPeriodEnd.toISOString(),
          'metadata.actualRemainingDaysAdded': actualRemainingDays,
          'metadata.periodEndUpdated': new Date().toISOString()
        });
        
        results.steps.push(`✅ เพิ่ม ${actualRemainingDays} วันคงเหลือให้ subscription ใหม่`);
      }

      // Step 4: Activate new subscription
      const activationUpdateData = {
        status: newSubscription.trialDays > 0 ? 'trial' : 'active',
        activatedAt: new Date().toISOString(),
        
        // Payment information
        'metadata.paymentMethod': renewalActivationData.paymentMethod,
        'metadata.paymentReference': renewalActivationData.paymentReference,
        'metadata.paymentDate': renewalActivationData.paymentDate,
        'metadata.paymentAmount': renewalActivationData.paymentAmount,
        
        // Customer information
        'metadata.customerName': renewalActivationData.customerName,
        'metadata.customerEmail': renewalActivationData.customerEmail,
        'metadata.customerPhone': renewalActivationData.customerPhone,
        'metadata.taxId': renewalActivationData.taxId,
        
        // Service configuration
        'metadata.serviceStartDate': renewalActivationData.serviceStartDate,
        'metadata.autoRenewal': renewalActivationData.autoRenewal,
        'metadata.emailNotifications': renewalActivationData.emailNotifications,
        'metadata.smsNotifications': renewalActivationData.smsNotifications,
        
        // Renewal-specific metadata
        'metadata.isRenewalActivation': true,
        'metadata.renewalActivatedAt': new Date().toISOString(),
        'metadata.renewalActivatedBy': renewalActivationData.activatedBy,
        'metadata.notes': renewalActivationData.notes
      };

      results.activatedSubscription = await this.subscription.update(subscriptionId, activationUpdateData);
      results.steps.push('✅ New subscription activated');

      // Step 5: Cancel old subscription
      if (oldSubscription) {
        try {
          const cancellationData = {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            'metadata.cancelReason': 'Replaced by renewal subscription',
            'metadata.cancelledBy': 'system_renewal',
            'metadata.replacedBySubscriptionId': subscriptionId,
            'metadata.transferredRemainingDays': actualRemainingDays
          };

          results.cancelledSubscription = await this.subscription.update(
            renewalActivationData.previousSubscriptionId, 
            cancellationData
          );
          results.steps.push('✅ Old subscription cancelled');
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'ServiceManager.activateRenewalSubscription - old subscription cancellation',
            subscriptionId,
            previousSubscriptionId: renewalActivationData.previousSubscriptionId,
            severity: 'HIGH'
          });
          results.steps.push('❌ Old subscription cancellation failed');
        }
      }

      // Step 6: Update related invoice status
      if (newSubscription.invoiceId) {
        try {
          await this.invoice.update(newSubscription.invoiceId, {
            status: 'paid',
            paidAt: new Date().toISOString(),
            paymentMethod: renewalActivationData.paymentMethod,
            paymentReference: renewalActivationData.paymentReference,
            'metadata.activatedSubscriptionId': subscriptionId
          });
          results.steps.push('✅ Invoice marked as paid');
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'ServiceManager.activateRenewalSubscription - invoice update',
            subscriptionId,
            invoiceId: newSubscription.invoiceId,
            severity: 'MEDIUM'
          });
          results.steps.push('❌ Invoice update failed');
        }
      }

      // Step 7: Create receipt
      try {
        let invoiceItems = [];
        if (newSubscription.invoiceId) {
          try {
            const invoiceData = await this.invoice.getById(newSubscription.invoiceId);
            if (invoiceData && invoiceData.items && invoiceData.items.length > 0) {
              invoiceItems = invoiceData.items;
            } else {
              invoiceItems = [{
                description: `${newSubscription.packageName} Renewal - Period #${newSubscription.periodNumber}`,
                quantity: 1,
                unitPrice: renewalActivationData.paymentAmount || newSubscription.basePrice,
                totalPrice: renewalActivationData.paymentAmount || newSubscription.basePrice
              }];
            }
          } catch (error) {
            ErrorHandler.handle(error, {
              context: 'ServiceManager.activateRenewalSubscription - invoice items loading',
              subscriptionId,
              invoiceId: newSubscription.invoiceId,
              severity: 'LOW'
            });
            invoiceItems = [{
              description: `${newSubscription.packageName} Renewal - Period #${newSubscription.periodNumber}`,
              quantity: 1,
              unitPrice: renewalActivationData.paymentAmount || newSubscription.basePrice,
              totalPrice: renewalActivationData.paymentAmount || newSubscription.basePrice
            }];
          }
        } else {
          invoiceItems = [{
            description: `${newSubscription.packageName} Renewal - Period #${newSubscription.periodNumber}`,
            quantity: 1,
            unitPrice: renewalActivationData.paymentAmount || newSubscription.basePrice,
            totalPrice: renewalActivationData.paymentAmount || newSubscription.basePrice
          }];
        }
        
        const receiptData = {
          subscriptionId: subscriptionId,
          contractId: newSubscription.contractId,
          collectionId: newSubscription.collectionId,
          invoiceId: newSubscription.invoiceId,
          
          receiptNumber: await this.generateReceiptNumber(),
          description: `Payment for ${newSubscription.packageName} Renewal - Period #${newSubscription.periodNumber}`,
          
          amount: renewalActivationData.paymentAmount || newSubscription.basePrice,
          currency: 'THB',
          
          paymentMethod: renewalActivationData.paymentMethod,
          paymentReference: renewalActivationData.paymentReference,
          paymentDate: renewalActivationData.paymentDate,
          
          // Customer info
          customerInfo: {
            name: renewalActivationData.customerName || '',
            email: renewalActivationData.customerEmail || '',
            phone: renewalActivationData.customerPhone || '',
            taxId: renewalActivationData.taxId || ''
          },
          
          // Items from invoice
          items: invoiceItems,
          
          status: 'issued',
          issuedAt: new Date().toISOString(),
          
          metadata: {
            subscriptionPeriodNumber: newSubscription.periodNumber,
            packageName: newSubscription.packageName,
            isRenewalReceipt: true,
            previousSubscriptionId: renewalActivationData.previousSubscriptionId,
            transferredRemainingDays: actualRemainingDays,
            customerName: renewalActivationData.customerName,
            customerEmail: renewalActivationData.customerEmail,
            customerPhone: renewalActivationData.customerPhone,
            taxId: renewalActivationData.taxId,
            itemsCount: invoiceItems.length
          }
        };

        results.receipt = await this.receipt.create(receiptData);
        results.steps.push('✅ Receipt created with items');
      } catch (error) {
        ErrorHandler.handle(error, {
          context: 'ServiceManager.activateRenewalSubscription - receipt creation',
          subscriptionId,
          renewalData: {
            packageName: newSubscription.packageName,
            periodNumber: newSubscription.periodNumber
          },
          severity: 'MEDIUM'
        });
        results.steps.push('❌ Receipt creation failed');
      }

      // Step 8: Clear caches
      this.clearCacheForCollection(newSubscription.collectionId);
      results.steps.push('✅ Caches cleared');

      results.success = true;
      return results;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'ServiceManager.activateRenewalSubscription',
        subscriptionId,
        renewalActivationData: {
          previousSubscriptionId: renewalActivationData.previousSubscriptionId,
          paymentMethod: renewalActivationData.paymentMethod,
          paymentAmount: renewalActivationData.paymentAmount
        },
        severity: 'CRITICAL'
      });
      throw error;
    }
  }

  // ===== 🗑️ CONTRACT CANCELLATION METHODS =====
  // Delegate to LifecycleManager

  /**
   * 🗑️ ยกเลิก Contract และลบข้อมูลที่เกี่ยวข้องทั้งหมด
   */
  async cancelContractAndRelatedData(contractId) {
    return await this.lifecycle.cancelContractAndRelatedData(contractId);
  }

  /**
   * 🗑️ ยกเลิก Contract (Soft Delete)
   */
  async cancelContract(contractId, cancellationData = {}) {
    return await this.lifecycle.cancelContract(contractId, cancellationData);
  }

  // ===== 📊 CONTRACT LIFECYCLE METHODS =====
  // Delegate to LifecycleManager

  /**
   * 📊 คำนวณข้อมูลอายุและสถานะของ Contract
   */
  async calculateContractLifecycle(contractId) {
    return await this.lifecycle.calculateContractLifecycle(contractId);
  }

  // ===== 🔧 CONTRACT MODIFICATION METHODS =====
  // Delegate to LifecycleManager

  /**
   * 🔧 แก้ไข Contract (สร้าง version history)
   */
  async editContract(contractId, updateData) {
    return await this.lifecycle.editContract(contractId, updateData);
  }

  /**
   * 🔧 เปลี่ยนราคา Contract
   */
  async updateContractPricing(contractId, pricingData) {
    return await this.lifecycle.updateContractPricing(contractId, pricingData);
  }

  // ===== 🔄 SUBSCRIPTION PAUSE/RESUME METHODS =====
  // Delegate to LifecycleManager

  /**
   * ⏸️ หยุด Subscription ชั่วคราว
   */
  async pauseSubscription(subscriptionId, pauseData = {}) {
    return await this.lifecycle.pauseSubscription(subscriptionId, pauseData);
  }

  /**
   * ▶️ เริ่ม Subscription ใหม่หลังหยุด
   */
  async resumeSubscription(subscriptionId, resumeData = {}) {
    return await this.lifecycle.resumeSubscription(subscriptionId, resumeData);
  }

  // ===== 📊 DATA ACCESS METHODS =====
  // Would delegate to DataAnalyticsManager when available

  /**
   * 📊 ดึงข้อมูล Contract พร้อม Subscriptions
   */
  async getContractWithSubscriptions(collectionId) {
    return await this.analytics.getContractWithSubscriptions(collectionId);
  }

  /**
   * 📊 ดึงข้อมูล Contract เดียวพร้อม Subscriptions
   */
  async getSingleContractWithSubscriptions(contractId) {
    return await this.lifecycle.getSingleContractWithSubscriptions(contractId);
  }

  // ===== 🧹 UTILITY METHODS =====

  /**
   * 🧹 Clear all caches
   */
  clearAllCaches() {
    this.package.clearCache();
    this.contract.clearAllCaches();
    this.subscription.clearAllCaches();
    this.invoice.clearAllCaches();
    this.receipt.clearAllCaches();
    this.ownership.clearAllCaches();
    this.collection.clearAllCaches();
  }

  /**
   * 🧹 Clear cache for specific collection
   */
  clearCacheForCollection(collectionId) {
    this.contract.clearCacheForCollection(collectionId);
    this.subscription.clearCacheForCollection(collectionId);
    this.invoice.clearCacheForCollection(collectionId);
    this.receipt.clearCacheForCollection(collectionId);
    this.ownership.clearCacheForCollection(collectionId);
    this.collection.clearCacheForCollection(collectionId);
  }

  // ===== 🏭 FACTORY PATTERN UTILITIES =====

  /**
   * 🏭 Get Factory statistics
   */
  getFactoryStats() {
    return ServiceFactory.getStats();
  }

  /**
   * 🔄 Recreate a specific service with new options
   */
  recreateService(serviceType, options = {}) {
    const newService = ServiceFactory.createService(serviceType, this.hostkey, options);
    this[serviceType] = newService;
    return newService;
  }

  /**
   * 🎛️ Update service configurations
   */
  updateServiceConfigs(newOptions = {}) {
    const services = ServiceFactory.createAllServices(this.hostkey, newOptions);
    Object.assign(this, services);
    
    // Reinitialize managers with new services
    this.businessFlow = new BusinessFlowManager(services);
    this.lifecycle = new LifecycleManager(services);
    this.analytics = new DataAnalyticsManager(services);
  }

  /**
   * 📊 Get current environment info
   */
  getEnvironmentInfo() {
    return {
      hostkey: this.hostkey,
      factoryStats: this.getFactoryStats(),
      availableServices: ServiceFactory.getAvailableServices(),
      timestamp: new Date().toISOString()
    };
  }

  // ===== 🎨 STATIC UTILITY METHODS =====
  // All static methods delegate to ServiceManagerUtils

  static getStatusClass(status) {
    return ServiceManagerUtils.getStatusClass(status);
  }

  static getLifecycleStatusText(status) {
    return ServiceManagerUtils.getLifecycleStatusText(status);
  }

  static getRemainingDaysColor(remainingDays) {
    return ServiceManagerUtils.getRemainingDaysColor(remainingDays);
  }

  static getHealthScoreColor(score) {
    return ServiceManagerUtils.getHealthScoreColor(score);
  }

  static getHealthStatusBadgeClass(status) {
    return ServiceManagerUtils.getHealthStatusBadgeClass(status);
  }

  static formatPrice(price) {
    return ServiceManagerUtils.formatPrice(price);
  }

  static getSubscriptionAge(periodStart) {
    return ServiceManagerUtils.getSubscriptionAge(periodStart);
  }

  static getRemainingDays(periodEnd) {
    return ServiceManagerUtils.getRemainingDays(periodEnd);
  }

  static formatSubscriptionAge(periodStart) {
    return ServiceManagerUtils.formatSubscriptionAge(periodStart);
  }

  static formatRemainingDays(periodEnd) {
    return ServiceManagerUtils.formatRemainingDays(periodEnd);
  }

  static getContractNextRenewal(contract) {
    return ServiceManagerUtils.getContractNextRenewal(contract);
  }

  static formatContractRenewalInfo(contract) {
    return ServiceManagerUtils.formatContractRenewalInfo(contract);
  }

  static formatDateRange(startDate, endDate) {
    return ServiceManagerUtils.formatDateRange(startDate, endDate);
  }

  static getBillingCycleText(cycle) {
    return ServiceManagerUtils.getBillingCycleText(cycle);
  }

  static getTrialEndDate(contractStartDate, trialDays) {
    return ServiceManagerUtils.getTrialEndDate(contractStartDate, trialDays);
  }

  static getBillingStartDate(contractStartDate, trialDays) {
    return ServiceManagerUtils.getBillingStartDate(contractStartDate, trialDays);
  }

  static getCustomerName(ownershipInfo, collection = null) {
    return ServiceManagerUtils.getCustomerName(ownershipInfo, collection);
  }

  static getCustomerEmail(ownershipInfo, collection = null) {
    return ServiceManagerUtils.getCustomerEmail(ownershipInfo, collection);
  }

  static getCustomerPhone(ownershipInfo, collection = null) {
    return ServiceManagerUtils.getCustomerPhone(ownershipInfo, collection);
  }

  static getCustomerTaxId(ownershipInfo, collection = null) {
    return ServiceManagerUtils.getCustomerTaxId(ownershipInfo, collection);
  }

  static getOwnershipDisplayName(ownershipInfo) {
    return ServiceManagerUtils.getOwnershipDisplayName(ownershipInfo);
  }

  static getOwnershipAddress(ownershipInfo) {
    return ServiceManagerUtils.getOwnershipAddress(ownershipInfo);
  }

  static isOwnershipCompleteForBilling(ownershipInfo) {
    return ServiceManagerUtils.isOwnershipCompleteForBilling(ownershipInfo);
  }

  static getOwnershipForDocuments(ownershipInfo) {
    return ServiceManagerUtils.getOwnershipForDocuments(ownershipInfo);
  }

  static validateInvoiceBusinessRules(invoice, ownershipInfo) {
    return ServiceManagerUtils.validateInvoiceBusinessRules(invoice, ownershipInfo);
  }

  static formatDate(dateString) {
    return ServiceManagerUtils.formatDate(dateString);
  }

  static getStatusText(status) {
    return ServiceManagerUtils.getStatusText(status);
  }

  static getAdditionalItemsAmount(items) {
    return ServiceManagerUtils.getAdditionalItemsAmount(items);
  }

  static getBasePackageAmount(items) {
    return ServiceManagerUtils.getBasePackageAmount(items);
  }

  static hasAdditionalItems(items) {
    return ServiceManagerUtils.hasAdditionalItems(items);
  }

  static prepareCustomerInfo(documentData, ownershipInfo) {
    return ServiceManagerUtils.prepareCustomerInfo(documentData, ownershipInfo);
  }

  static generatePrintHTML(printData) {
    return ServiceManagerUtils.generatePrintHTML(printData);
  }

  // ===== 🔧 NUMBER GENERATION UTILITIES =====

  async generateContractNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CON-${timestamp}-${random}`;
  }

  async generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  async generateReceiptNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${timestamp}-${random}`;
  }

  // ===== 📅 DATE CALCULATION UTILITIES =====

  calculatePeriodEnd(startDate, billingCycle) {
    const start = new Date(startDate || new Date());
    
    switch (billingCycle) {
      case 'monthly':
        start.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() + 1);
        break;
      default:
        start.setMonth(start.getMonth() + 1); // Default to monthly
    }
    
    return start.toISOString();
  }

  // ===== 📊 CACHE AND SERVICE UTILITIES =====

  getAllCacheStats() {
    return {
      package: this.package.getCacheStats(),
      contract: this.contract.getCacheStats(),
      subscription: this.subscription.getCacheStats(),
      invoice: this.invoice.getCacheStats(),
      receipt: this.receipt.getCacheStats(),
      ownership: this.ownership.getCacheStats(),
      collection: this.collection.getCacheStats()
    };
  }

  getServices() {
    return {
      package: this.package,
      contract: this.contract,
      subscription: this.subscription,
      invoice: this.invoice,
      receipt: this.receipt,
      ownership: this.ownership,
      collection: this.collection
    };
  }

  // ===== 📊 DATA ANALYTICS METHODS =====
  // Delegate to DataAnalyticsManager

  /**
   * 📊 คำนวณสถิติ Contract และ Subscription
   */
  calculateContractStatistics(contractData) {
    return this.analytics.calculateContractStatistics(contractData);
  }

  /**
   * 📊 ดึงสถิติ Contract สำหรับ Collection
   */
  async getContractStatistics(collectionId) {
    return await this.analytics.getContractStatistics(collectionId);
  }

  /**
   * 📊 รายงานสุขภาพทางการเงิน
   */
  async getFinancialHealthReport(collectionId) {
    return await this.analytics.getFinancialHealthReport(collectionId);
  }

  /**
   * 📊 คำนวณ lifecycle หลาย contracts
   */
  async calculateMultipleContractLifecycles(collectionId) {
    return await this.analytics.calculateMultipleContractLifecycles(collectionId);
  }

  /**
   * 📋 ตรวจสอบกฎธุรกิจ Contract
   */
  validateContractBusinessRules(contractData) {
    return this.analytics.validateContractBusinessRules(contractData);
  }

  /**
   * 📋 ตรวจสอบกฎธุรกิจ Subscription
   */
  async validateSubscriptionBusinessRules(subscriptionData) {
    return await this.analytics.validateSubscriptionBusinessRules(subscriptionData);
  }

  /**
   * 📊 โครงสร้างสถิติว่าง
   */
  getEmptyStats() {
    return this.analytics.getEmptyStats();
  }
}

export default ServiceManager; 
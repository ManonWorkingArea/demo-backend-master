/**
 * BusinessFlowManager - Core Business Logic and Flows
 * 
 * 🎯 Handles main business flows and processes
 * 🔥 Contains business logic for subscription renewal, package assignment, and activations
 * ✅ Uses InputValidator and ErrorHandler for validation and error management
 * 🏭 Depends on CRUD services through ServiceManager
 */

import InputValidator from '../utils/InputValidator.js';
import ErrorHandler from '../utils/ErrorHandler.js';

class BusinessFlowManager {
  constructor(services) {
    this.services = services;
    this.package = services.package;
    this.contract = services.contract;
    this.subscription = services.subscription;
    this.invoice = services.invoice;
    this.receipt = services.receipt;
    this.ownership = services.ownership;
    this.collection = services.collection;
  }

  // ===== 📊 OWNERSHIP INTEGRATION METHODS =====

  /**
   * 📊 ดึงข้อมูลเจ้าของสำหรับการออกเอกสาร
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ข้อมูลเจ้าของสำหรับการออกเอกสาร
   */
  async getOwnershipForDocuments(collectionId) {
    try {
      // Validate input
      const validation = InputValidator.validateRequiredString(collectionId, 'Collection ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid collection ID', validation.errors);
      }

      const ownershipInfo = await this.ownership.getOwnershipForBilling(collectionId);
      
      return {
        // Customer Details
        customerInfo: {
          name: ownershipInfo.customerName,
          email: ownershipInfo.customerEmail,
          phone: ownershipInfo.customerPhone,
          taxId: ownershipInfo.taxId,
          taxType: ownershipInfo.taxType
        },
        
        // Billing Address
        billingAddress: ownershipInfo.billingAddress,
        
        // Organization Info
        organization: ownershipInfo.organization,
        
        // Billing Status
        billingStatus: {
          isReady: ownershipInfo.isReadyForBilling,
          missingInfo: ownershipInfo.missingInfo,
          source: ownershipInfo.source,
          lastUpdated: ownershipInfo.lastUpdated
        }
      };
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.getOwnershipForDocuments',
        collectionId,
        severity: 'MEDIUM'
      });

      // Return fallback data for business continuity
      return {
        customerInfo: {
          name: 'ไม่ระบุ',
          email: '',
          phone: '',
          taxId: '',
          taxType: 'individual'
        },
        billingAddress: null,
        organization: null,
        billingStatus: {
          isReady: false,
          missingInfo: ['ข้อมูลเจ้าของไม่สมบูรณ์'],
          source: 'fallback',
          lastUpdated: null
        }
      };
    }
  }

  /**
   * 📋 ตรวจสอบความพร้อมของข้อมูลเจ้าของก่อนสร้าง Contract
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ผลลัพธ์การตรวจสอบ
   */
  async validateOwnershipForContract(collectionId) {
    try {
      // Validate input
      const validation = InputValidator.validateRequiredString(collectionId, 'Collection ID');
      if (!validation.isValid) {
        return {
          isValid: false,
          canProceed: false,
          errors: validation.errors,
          warnings: [],
          recommendations: ['กรุณาระบุ Collection ID ที่ถูกต้อง'],
          completenessScore: 0
        };
      }

      const ownershipValidation = await this.ownership.validateBillingReadiness(collectionId);
      
      return {
        isValid: ownershipValidation.isReady,
        canProceed: ownershipValidation.errors.length === 0,
        errors: ownershipValidation.errors,
        warnings: ownershipValidation.warnings,
        recommendations: ownershipValidation.recommendations,
        completenessScore: ownershipValidation.score
      };
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.validateOwnershipForContract',
        collectionId,
        severity: 'HIGH'
      });

      return {
        isValid: false,
        canProceed: false,
        errors: ['ไม่สามารถตรวจสอบข้อมูลเจ้าของได้'],
        warnings: [],
        recommendations: ['กรุณาตรวจสอบข้อมูลเจ้าของใน Collection'],
        completenessScore: 0
      };
    }
  }

  // ===== 🔥 BUSINESS FLOW METHODS =====

  /**
   * 🔥 BUSINESS FLOW: ต่ออายุ Subscription
   * Flow: Create New Subscription + Invoice (pending_payment) - ยกเลิก subscription เก่าตอนยืนยันการชำระเงิน
   */
  async renewSubscription(renewalData) {
    try {
      // Validate renewal data
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(renewalData.existingContractId, 'Contract ID'),
        InputValidator.validateRequiredString(renewalData.collectionId, 'Collection ID'),
        InputValidator.validateRequiredString(renewalData.packageId, 'Package ID'),
        InputValidator.validateRequiredString(renewalData.billingCycle, 'Billing Cycle'),
        InputValidator.validateNumber(renewalData.basePrice, 'Base Price', { min: 0 }),
        InputValidator.validateNumber(renewalData.periodNumber, 'Period Number', { min: 1 })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid renewal data', validation.errors);
      }

      const results = {
        success: false,
        newSubscription: null,
        invoice: null,
        steps: []
      };

      // Step 1: Calculate new period dates (รวมวันคงเหลือจาก subscription เดิม)
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      // คำนวณ period end ตาม billing cycle
      switch (renewalData.billingCycle) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
      }
      
      // รวมวันคงเหลือจาก subscription เดิม
      if (renewalData.remainingDays > 0) {
        endDate.setDate(endDate.getDate() + renewalData.remainingDays);
      }

      // Step 2: Create new subscription
      const subscriptionData = {
        contractId: renewalData.existingContractId,
        collectionId: renewalData.collectionId,
        packageId: renewalData.packageId,
        packageName: renewalData.packageName,
        packageDescription: renewalData.packageDescription,
        
        // Period information
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
        periodNumber: renewalData.periodNumber,
        
        // Pricing
        basePrice: renewalData.basePrice || 0,
        currency: 'THB',
        billingCycle: renewalData.billingCycle,
        
        // Status - เริ่มต้นเป็น inactive จนกว่าจะได้รับการยืนยัน
        status: 'inactive',
        
        // Metadata
        metadata: {
          source: 'subscription_renewal',
          autoRenewal: renewalData.autoRenewal || false,
          createdBy: renewalData.createdBy || 'user',
          renewedFrom: renewalData.previousSubscriptionId,
          remainingDaysTransferred: renewalData.remainingDays || 0,
          additionalItems: renewalData.additionalItems || [],
          notes: renewalData.notes || ''
        }
      };

      results.newSubscription = await this.subscription.create(subscriptionData);
      results.steps.push('✅ New subscription created');

      // Step 3: Create Invoice
      const invoiceItems = [
        {
          description: `${renewalData.packageName} - Period #${renewalData.periodNumber}`,
          quantity: 1,
          unitPrice: renewalData.basePrice || 0,
          amount: renewalData.basePrice || 0
        }
      ];

      // เพิ่ม additional items
      if (renewalData.additionalItems && renewalData.additionalItems.length > 0) {
        renewalData.additionalItems.forEach(item => {
          invoiceItems.push({
            description: item.description || 'รายการเพิ่มเติม',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            amount: (item.quantity || 1) * (item.unitPrice || 0)
          });
        });
      }

      const invoiceData = {
        subscriptionId: results.newSubscription._id,
        contractId: renewalData.existingContractId,
        collectionId: renewalData.collectionId,
        packageId: renewalData.packageId,
        
        // Invoice details
        invoiceNumber: await this.generateInvoiceNumber(),
        description: `${renewalData.packageName} Subscription Renewal - Period #${renewalData.periodNumber}`,
        
        // Amount
        amount: renewalData.totalAmount || 0,
        currency: 'THB',
        
        // Status - draft จนกว่าจะได้รับการยืนยัน
        status: 'draft',
        
        // Due date (30 days from now)
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Items
        items: invoiceItems,
        
        // Metadata
        metadata: {
          subscriptionPeriodNumber: renewalData.periodNumber,
          packageName: renewalData.packageName,
          billingCycle: renewalData.billingCycle,
          isRenewalInvoice: true,
          previousSubscriptionId: renewalData.previousSubscriptionId,
          remainingDaysTransferred: renewalData.remainingDays || 0,
          additionalItemsCount: renewalData.additionalItems ? renewalData.additionalItems.length : 0
        }
      };

      results.invoice = await this.invoice.create(invoiceData);
      results.steps.push('✅ Renewal invoice created');

      // Step 4: Update subscription with invoice reference
      await this.subscription.update(results.newSubscription._id, {
        invoiceId: results.invoice._id
      });
      
      results.success = true;
      return results;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.renewSubscription',
        renewalData: {
          contractId: renewalData.existingContractId,
          collectionId: renewalData.collectionId,
          packageId: renewalData.packageId,
          periodNumber: renewalData.periodNumber
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  /**
   * 🔥 BUSINESS FLOW: กำหนด Package ให้กับ Collection
   * Flow: Package Selection → Ownership Validation → Contract Creation → Subscription + Invoice (pending_payment)
   */
  async assignPackageToCollection(assignmentData) {
    try {
      // Validate assignment data
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(assignmentData.collectionId, 'Collection ID'),
        InputValidator.validateRequiredString(assignmentData.packageId, 'Package ID'),
        InputValidator.validateRequiredString(assignmentData.packageName, 'Package Name'),
        InputValidator.validateNumber(assignmentData.basePrice, 'Base Price', { min: 0 }),
        InputValidator.validateBillingCycle(assignmentData.billingCycle || 'monthly'),
        InputValidator.validateCurrency(assignmentData.currency || 'THB')
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid assignment data', validation.errors);
      }

      const results = {
        success: false,
        contract: null,
        subscription: null,
        invoice: null,
        ownershipInfo: null,
        steps: []
      };

      // Step 1: Get and validate ownership information
      try {
        results.ownershipInfo = await this.getOwnershipForDocuments(assignmentData.collectionId);
        results.steps.push('✅ Ownership information retrieved');
        
        if (!results.ownershipInfo.billingStatus.isReady) {
          results.steps.push('⚠️ Ownership information incomplete but proceeding');
        }
      } catch (error) {
        ErrorHandler.handle(error, {
          context: 'BusinessFlowManager.assignPackageToCollection - ownership retrieval',
          collectionId: assignmentData.collectionId,
          severity: 'MEDIUM'
        });
        results.steps.push('⚠️ Using fallback ownership data');
      }

      // Step 2: Create Contract
      const contractData = {
        collectionId: assignmentData.collectionId,
        packageId: assignmentData.packageId,
        packageName: assignmentData.packageName,
        packageDescription: assignmentData.packageDescription,
        
        // Contract terms
        contractNumber: await this.generateContractNumber(),
        contractType: 'package_subscription',
        status: 'inactive', // เริ่มต้นเป็น inactive จนกว่าจะได้รับการยืนยัน
        
        // Pricing
        basePrice: assignmentData.basePrice || 0,
        currency: assignmentData.currency || 'THB',
        billingCycle: assignmentData.billingCycle || 'monthly',
        
        // Terms
        contractTerms: {
          duration: assignmentData.duration || 12,
          durationType: assignmentData.durationType || 'months',
          autoRenewal: assignmentData.autoRenewal || false,
          cancellationPolicy: assignmentData.cancellationPolicy || 'standard',
          paymentTerms: assignmentData.paymentTerms || 30
        },
        
        // Customer Information from Ownership
        customerInfo: results.ownershipInfo ? {
          name: results.ownershipInfo.customerInfo.name,
          email: results.ownershipInfo.customerInfo.email,
          phone: results.ownershipInfo.customerInfo.phone,
          taxId: results.ownershipInfo.customerInfo.taxId,
          taxType: results.ownershipInfo.customerInfo.taxType
        } : null,
        
        // Billing Address
        billingAddress: results.ownershipInfo?.billingAddress || null,
        
        // Organization Info
        organizationInfo: results.ownershipInfo?.organization || null,
        
        contractStartDate: assignmentData.contractStartDate || new Date().toISOString(),
        contractEndDate: assignmentData.contractEndDate || null,
        createdBy: assignmentData.createdBy || 'system'
      };

      results.contract = await this.contract.create(contractData);
      results.steps.push('✅ Contract created');

      // Step 3: Create Subscription (pending_payment)
      const subscriptionData = {
        contractId: results.contract._id,
        collectionId: assignmentData.collectionId,
        packageId: assignmentData.packageId,
        packageName: assignmentData.packageName,
        packageDescription: assignmentData.packageDescription,
        
        // Period information
        periodStart: assignmentData.startDate || new Date().toISOString(),
        periodEnd: this.calculatePeriodEnd(assignmentData.startDate, assignmentData.billingCycle),
        periodNumber: 1,
        
        // Trial period information
        trialDays: assignmentData.trialDays || 0,
        hasTrialPeriod: assignmentData.hasTrialPeriod || false,
        trialStartDate: assignmentData.contractStartDate,
        trialEndDate: assignmentData.hasTrialPeriod ? assignmentData.startDate : null,
        
        // Pricing
        basePrice: assignmentData.basePrice || 0,
        currency: assignmentData.currency || 'THB',
        billingCycle: assignmentData.billingCycle || 'monthly',
        
        // Status - เริ่มต้นเป็น inactive จนกว่าจะได้รับการยืนยัน
        status: 'inactive',
        
        // Metadata
        metadata: {
          source: 'package_assignment',
          autoRenewal: assignmentData.autoRenewal || false,
          createdBy: assignmentData.createdBy || 'system',
          trialPeriod: assignmentData.hasTrialPeriod ? {
            days: assignmentData.trialDays,
            startDate: assignmentData.contractStartDate,
            endDate: assignmentData.startDate
          } : null
        }
      };

      results.subscription = await this.subscription.create(subscriptionData);
      results.steps.push('✅ Subscription created');

      // Step 4: Create Invoice
      let invoiceData = null;
      if (assignmentData.hasTrialPeriod) {
        // For trial subscriptions, create invoice with future due date (after trial ends)
        const trialEndDate = new Date(assignmentData.startDate);
        
        invoiceData = {
          subscriptionId: results.subscription._id,
          contractId: results.contract._id,
          collectionId: assignmentData.collectionId,
          packageId: assignmentData.packageId,
          
          // Invoice details
          invoiceNumber: await this.generateInvoiceNumber(),
          description: `${assignmentData.packageName} Subscription - Period #1 (หลังจากระยะทดลองใช้)`,
          
          // Amount
          amount: assignmentData.basePrice || 0,
          currency: assignmentData.currency || 'THB',
          
          // Status - draft during trial period
          status: 'draft',
          
          // Due date after trial period ends
          dueDate: new Date(trialEndDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          
          // Customer Information from Ownership
          customerInfo: results.ownershipInfo ? {
            name: results.ownershipInfo.customerInfo.name,
            email: results.ownershipInfo.customerInfo.email,
            phone: results.ownershipInfo.customerInfo.phone,
            taxId: results.ownershipInfo.customerInfo.taxId,
            taxType: results.ownershipInfo.customerInfo.taxType
          } : null,
          
          // Billing Address
          billingAddress: results.ownershipInfo?.billingAddress || null,
          
          // Organization Info
          organizationInfo: results.ownershipInfo?.organization || null,
          
          // Metadata
          metadata: {
            subscriptionPeriodNumber: 1,
            packageName: assignmentData.packageName,
            billingCycle: assignmentData.billingCycle,
            isTrialInvoice: true,
            trialEndDate: assignmentData.startDate,
            ownershipSource: results.ownershipInfo?.billingStatus.source || 'unknown'
          }
        };
      } else {
        // Regular subscription, invoice immediately
        invoiceData = {
          subscriptionId: results.subscription._id,
          contractId: results.contract._id,
          collectionId: assignmentData.collectionId,
          packageId: assignmentData.packageId,
          
          // Invoice details
          invoiceNumber: await this.generateInvoiceNumber(),
          description: `${assignmentData.packageName} Subscription - Period #1`,
          
          // Amount
          amount: assignmentData.basePrice || 0,
          currency: assignmentData.currency || 'THB',
          
          // Status - เริ่มต้นเป็น draft จนกว่า contract จะถูกยืนยัน
          status: 'draft',
          
          // Due date (30 days from now)
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          
          // Customer Information from Ownership
          customerInfo: results.ownershipInfo ? {
            name: results.ownershipInfo.customerInfo.name,
            email: results.ownershipInfo.customerInfo.email,
            phone: results.ownershipInfo.customerInfo.phone,
            taxId: results.ownershipInfo.customerInfo.taxId,
            taxType: results.ownershipInfo.customerInfo.taxType
          } : null,
          
          // Billing Address
          billingAddress: results.ownershipInfo?.billingAddress || null,
          
          // Organization Info
          organizationInfo: results.ownershipInfo?.organization || null,
          
          // Metadata
          metadata: {
            subscriptionPeriodNumber: 1,
            packageName: assignmentData.packageName,
            billingCycle: assignmentData.billingCycle,
            isTrialInvoice: false,
            ownershipSource: results.ownershipInfo?.billingStatus.source || 'unknown'
          }
        };
      }

      results.invoice = await this.invoice.create(invoiceData);
      results.steps.push(assignmentData.hasTrialPeriod ? '✅ Trial invoice created (draft)' : '✅ Invoice created');

      // Step 5: Update subscription with invoice reference
      await this.subscription.update(results.subscription._id, {
        invoiceId: results.invoice._id
      });
      results.steps.push('✅ Subscription linked to invoice');

      results.success = true;
      return results;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.assignPackageToCollection',
        assignmentData: {
          collectionId: assignmentData.collectionId,
          packageId: assignmentData.packageId,
          packageName: assignmentData.packageName,
          basePrice: assignmentData.basePrice
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  // ===== ✅ ACTIVATION METHODS =====

  /**
   * ✅ ยืนยันและเปิดใช้งาน Subscription
   * @param {string} subscriptionId - Subscription ID ที่ต้องการยืนยัน
   * @param {Object} activationData - ข้อมูลการยืนยัน
   * @returns {Promise<Object>} ผลลัพธ์การยืนยัน
   */
  async activateSubscription(subscriptionId, activationData = {}) {
    try {
      // Validate inputs
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(subscriptionId, 'Subscription ID'),
        InputValidator.validateEmail(activationData.customerEmail, { required: false }),
        InputValidator.validateNumber(activationData.paymentAmount, 'Payment Amount', { min: 0, required: false })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid activation data', validation.errors);
      }

      const result = {
        success: false,
        subscriptionId: subscriptionId,
        updatedData: {
          subscription: null,
          invoice: null
        },
        steps: []
      };

      // Step 1: ดึงข้อมูล Subscription ก่อน
      const subscription = await this.subscription.getById(subscriptionId);
      
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      if (subscription.status !== 'inactive') {
        throw new Error(`Subscription is not in inactive status. Current status: ${subscription.status}`);
      }

      result.steps.push('✅ Subscription data validated');

      // Step 2: กำหนดสถานะใหม่ตาม trial period และการชำระเงิน
      let newStatus = 'active'; // เปลี่ยนเป็น active เมื่อยืนยันแล้ว
      if (subscription.hasTrialPeriod && subscription.trialDays > 0) {
        newStatus = 'trial';
      }

      // Step 3: อัปเดตสถานะ Subscription
      const subscriptionUpdateData = {
        status: newStatus,
        activatedAt: new Date().toISOString(),
        activatedBy: activationData.activatedBy || 'system',
        activationNotes: activationData.notes || '',
        
        // Service Configuration
        serviceStartDate: activationData.serviceStartDate || new Date().toISOString(),
        autoRenewal: activationData.autoRenewal || false,
        
        // Customer Information
        customerInfo: {
          name: activationData.customerName || '',
          email: activationData.customerEmail || '',
          phone: activationData.customerPhone || '',
          taxId: activationData.taxId || ''
        },
        
        // Payment Information
        paymentInfo: {
          method: activationData.paymentMethod || '',
          reference: activationData.paymentReference || '',
          date: activationData.paymentDate || new Date().toISOString().split('T')[0],
          amount: activationData.paymentAmount || 0
        },
        
        // Notification Preferences
        notificationPreferences: {
          email: activationData.emailNotifications || false,
          sms: activationData.smsNotifications || false
        },
        
        updatedAt: new Date().toISOString()
      };

      const updatedSubscription = await this.subscription.update(subscriptionId, subscriptionUpdateData);
      result.updatedData.subscription = updatedSubscription;
      result.steps.push(`✅ Subscription status updated to ${newStatus}`);

      // Step 4: อัปเดตสถานะ Invoice และสร้าง Receipt
      if (subscription.invoiceId) {
        try {
          // เปลี่ยนสถานะ invoice เป็น paid เมื่อยืนยันการชำระเงินแล้ว
          const newInvoiceStatus = newStatus === 'trial' ? 'draft' : 'paid';
          
          const invoiceUpdateData = {
            status: newInvoiceStatus,
            paidAt: newStatus !== 'trial' ? new Date().toISOString() : null,
            paymentMethod: activationData.paymentMethod || '',
            paymentReference: activationData.paymentReference || '',
            updatedAt: new Date().toISOString()
          };
          
          const updatedInvoice = await this.invoice.update(subscription.invoiceId, invoiceUpdateData);
          result.updatedData.invoice = updatedInvoice;
          result.steps.push(`✅ Invoice status updated to ${newInvoiceStatus}`);

          // สร้าง Receipt ถ้า Invoice เป็น paid
          if (newInvoiceStatus === 'paid') {
            // ดึงข้อมูล Invoice เพื่อใช้ items
            let invoiceItems = [];
            try {
              const invoiceData = await this.invoice.getById(subscription.invoiceId);
              if (invoiceData && invoiceData.items && invoiceData.items.length > 0) {
                invoiceItems = invoiceData.items;
              } else {
                invoiceItems = [{
                  description: `${subscription.packageName || 'Package'} Subscription - Period #${subscription.periodNumber || 1}`,
                  quantity: 1,
                  unitPrice: activationData.paymentAmount || subscription.basePrice || 0,
                  totalPrice: activationData.paymentAmount || subscription.basePrice || 0
                }];
              }
            } catch (error) {
              ErrorHandler.handle(error, {
                context: 'BusinessFlowManager.activateSubscription - invoice items loading',
                subscriptionId,
                invoiceId: subscription.invoiceId,
                severity: 'LOW'
              });
              invoiceItems = [{
                description: `${subscription.packageName || 'Package'} Subscription - Period #${subscription.periodNumber || 1}`,
                quantity: 1,
                unitPrice: activationData.paymentAmount || subscription.basePrice || 0,
                totalPrice: activationData.paymentAmount || subscription.basePrice || 0
              }];
            }
            
            const receiptData = {
              subscriptionId: subscription._id,
              contractId: subscription.contractId,
              collectionId: subscription.collectionId,
              packageId: subscription.packageId,
              invoiceId: subscription.invoiceId,
              
              // Receipt details
              receiptNumber: await this.generateReceiptNumber(),
              description: `Payment for ${subscription.packageName || 'Package'} Subscription - Period #${subscription.periodNumber || 1}`,
              
              // Amount
              amount: activationData.paymentAmount || subscription.basePrice || 0,
              currency: subscription.currency || 'THB',
              
              // Payment details
              paymentMethod: activationData.paymentMethod || '',
              paymentReference: activationData.paymentReference || '',
              paymentDate: activationData.paymentDate || new Date().toISOString().split('T')[0],
              
              // Customer info
              customerInfo: {
                name: activationData.customerName || '',
                email: activationData.customerEmail || '',
                phone: activationData.customerPhone || '',
                taxId: activationData.taxId || ''
              },
              
              // Items from invoice (รายการเพิ่มเติมจะอยู่ในนี้)
              items: invoiceItems,
              
              // Status
              status: 'issued',
              issuedAt: new Date().toISOString(),
              
              // Metadata
              metadata: {
                subscriptionPeriodNumber: subscription.periodNumber || 1,
                packageName: subscription.packageName || 'Package',
                billingCycle: subscription.billingCycle || 'monthly',
                activationSource: 'subscription_activation',
                itemsCount: invoiceItems.length
              }
            };
            
            const receipt = await this.receipt.create(receiptData);
            result.updatedData.receipt = receipt;
            result.steps.push('✅ Receipt created');
          }
          
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'BusinessFlowManager.activateSubscription - invoice processing',
            subscriptionId,
            invoiceId: subscription.invoiceId,
            severity: 'MEDIUM'
          });
          result.steps.push(`⚠️ Warning: Could not process invoice ${subscription.invoiceId}`);
        }
      } else {
        result.steps.push('ℹ️ No invoice to process');
      }

      result.success = true;
      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.activateSubscription',
        subscriptionId,
        activationData: {
          customerEmail: activationData.customerEmail,
          paymentAmount: activationData.paymentAmount,
          paymentMethod: activationData.paymentMethod
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  /**
   * ✅ ยืนยันและเปิดใช้งาน Contract
   * @param {string} contractId - Contract ID ที่ต้องการยืนยัน
   * @param {Object} activationData - ข้อมูลการยืนยัน
   * @returns {Promise<Object>} ผลลัพธ์การยืนยัน
   */
  async activateContract(contractId, activationData = {}) {
    try {
      const result = {
        success: false,
        contractId: contractId,
        updatedData: {
          contract: null,
          subscriptions: []
        },
        steps: []
      };

      // Step 1: ดึงข้อมูล Contract ก่อน
      const contract = await this.contract.getById(contractId);
      
      if (!contract) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      if (contract.status !== 'inactive') {
        throw new Error(`Contract is not in inactive status. Current status: ${contract.status}`);
      }

      result.steps.push('✅ Contract data validated');

      // Step 2: อัปเดตสถานะ Contract เป็น active
      const contractUpdateData = {
        status: 'active',
        activatedAt: new Date().toISOString(),
        activatedBy: activationData.activatedBy || 'system',
        activationNotes: activationData.notes || '',
        updatedAt: new Date().toISOString()
      };

      const updatedContract = await this.contract.update(contractId, contractUpdateData);
      result.updatedData.contract = updatedContract;
      result.steps.push('✅ Contract status updated to active');

      // Step 3: อัปเดตสถานะ Subscriptions
      const subscriptions = await this.subscription.getByContractId(contractId);
      
      if (subscriptions && subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          if (subscription.status === 'inactive') {
            // กำหนดสถานะใหม่ตาม trial period
            let newStatus = 'pending_payment';
            if (subscription.hasTrialPeriod && subscription.trialDays > 0) {
              newStatus = 'trial';
            }

            const subscriptionUpdateData = {
              status: newStatus,
              activatedAt: new Date().toISOString(),
              activatedBy: activationData.activatedBy || 'system',
              updatedAt: new Date().toISOString()
            };

            const updatedSubscription = await this.subscription.update(subscription._id, subscriptionUpdateData);
            result.updatedData.subscriptions.push(updatedSubscription);
          }
        }
      }
      result.steps.push(`✅ Activated ${result.updatedData.subscriptions.length} subscriptions`);

      // Step 4: อัปเดตสถานะ Invoice (ถ้ามี)
      let invoiceUpdateCount = 0;
      for (const subscription of result.updatedData.subscriptions) {
        if (subscription.invoiceId) {
          try {
            // เปลี่ยนสถานะ invoice จาก draft เป็น pending_payment (ถ้าไม่ใช่ trial)
            const newInvoiceStatus = subscription.status === 'trial' ? 'draft' : 'pending_payment';
            
            await this.invoice.update(subscription.invoiceId, {
              status: newInvoiceStatus,
              updatedAt: new Date().toISOString()
            });
            invoiceUpdateCount++;
          } catch (error) {
            ErrorHandler.handle(error, {
              context: 'BusinessFlowManager.activateContract - invoice update',
              contractId,
              subscriptionId: subscription._id,
              invoiceId: subscription.invoiceId,
              severity: 'MEDIUM'
            });
          }
        }
      }
      result.steps.push(`✅ Updated ${invoiceUpdateCount} invoices`);

      result.success = true;
      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'BusinessFlowManager.activateContract',
        contractId,
        activationData: {
          activatedBy: activationData.activatedBy,
          notes: activationData.notes
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  // ===== 🔧 UTILITY METHODS =====

  /**
   * Generate contract number
   */
  async generateContractNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CON-${timestamp}-${random}`;
  }

  /**
   * Generate invoice number
   */
  async generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Generate receipt number
   */
  async generateReceiptNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${timestamp}-${random}`;
  }

  /**
   * Calculate period end date
   */
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
}

export default BusinessFlowManager; 
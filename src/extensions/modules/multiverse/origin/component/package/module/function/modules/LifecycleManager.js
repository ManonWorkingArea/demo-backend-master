/**
 * LifecycleManager - Contract Lifecycle and Payment Management
 * 
 * 🔄 Handles contract lifecycle operations (cancel, edit, pause, resume)
 * 💳 Manages payment operations (overdue, failed payments, refunds)
 * 📊 Calculates contract lifecycle information
 * ✅ Uses InputValidator and ErrorHandler for validation and error management
 */

import InputValidator from '../utils/InputValidator.js';
import ErrorHandler from '../utils/ErrorHandler.js';

class LifecycleManager {
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

  // ===== 🗑️ CONTRACT CANCELLATION METHODS =====

  /**
   * 🗑️ ยกเลิก Contract และลบข้อมูลที่เกี่ยวข้องทั้งหมด
   * @param {string} contractId - Contract ID ที่ต้องการยกเลิก
   * @returns {Promise<Object>} ผลลัพธ์การยกเลิก
   */
  async cancelContractAndRelatedData(contractId) {
    try {
      const validation = InputValidator.validateRequiredString(contractId, 'Contract ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid contract ID', validation.errors);
      }

      const result = {
        success: false,
        contractId: contractId,
        deletedData: {
          contract: null,
          subscriptions: [],
          invoices: [],
          receipts: []
        },
        steps: [],
        errors: []
      };

      // Step 1: ดึงข้อมูล Contract และ related data ก่อน
      const contractData = await this.getSingleContractWithSubscriptions(contractId);
      
      if (!contractData) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      result.steps.push('✅ Contract data fetched');

      // Step 2: ลบ Receipts ก่อน (เพราะ depend on invoices)
      if (contractData.subscriptions && contractData.subscriptions.length > 0) {
        for (const subscription of contractData.subscriptions) {
          if (subscription.receipts && subscription.receipts.length > 0) {
            for (const receipt of subscription.receipts) {
              try {
                await this.receipt.delete(receipt._id);
                result.deletedData.receipts.push(receipt);
              } catch (error) {
                ErrorHandler.handle(error, {
                  context: 'LifecycleManager.cancelContractAndRelatedData - receipt deletion',
                  contractId,
                  receiptId: receipt._id,
                  severity: 'MEDIUM'
                });
                result.errors.push(`Failed to delete receipt: ${receipt._id}`);
              }
            }
          }
        }
      }
      result.steps.push(`✅ Deleted ${result.deletedData.receipts.length} receipts`);

      // Step 3: ลบ Invoices
      if (contractData.subscriptions && contractData.subscriptions.length > 0) {
        for (const subscription of contractData.subscriptions) {
          if (subscription.invoices && subscription.invoices.length > 0) {
            for (const invoice of subscription.invoices) {
              try {
                await this.invoice.delete(invoice._id);
                result.deletedData.invoices.push(invoice);
              } catch (error) {
                ErrorHandler.handle(error, {
                  context: 'LifecycleManager.cancelContractAndRelatedData - invoice deletion',
                  contractId,
                  invoiceId: invoice._id,
                  severity: 'MEDIUM'
                });
                result.errors.push(`Failed to delete invoice: ${invoice._id}`);
              }
            }
          }
        }
      }
      result.steps.push(`✅ Deleted ${result.deletedData.invoices.length} invoices`);

      // Step 4: ลบ Subscriptions
      if (contractData.subscriptions && contractData.subscriptions.length > 0) {
        for (const subscription of contractData.subscriptions) {
          try {
            await this.subscription.delete(subscription._id);
            result.deletedData.subscriptions.push(subscription);
          } catch (error) {
            ErrorHandler.handle(error, {
              context: 'LifecycleManager.cancelContractAndRelatedData - subscription deletion',
              contractId,
              subscriptionId: subscription._id,
              severity: 'HIGH'
            });
            result.errors.push(`Failed to delete subscription: ${subscription._id}`);
          }
        }
      }
      result.steps.push(`✅ Deleted ${result.deletedData.subscriptions.length} subscriptions`);

      // Step 5: ลบ Contract (สุดท้าย)
      try {
        await this.contract.delete(contractId);
        result.deletedData.contract = contractData;
        result.steps.push('✅ Contract deleted');
      } catch (error) {
        ErrorHandler.handle(error, {
          context: 'LifecycleManager.cancelContractAndRelatedData - contract deletion',
          contractId,
          severity: 'CRITICAL'
        });
        result.errors.push(`Failed to delete contract: ${contractId}`);
        throw error; // Contract deletion is critical
      }

      result.success = true;
      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.cancelContractAndRelatedData',
        contractId,
        severity: 'CRITICAL'
      });
      throw error;
    }
  }

  /**
   * 🗑️ ยกเลิก Contract (Soft Delete) - เปลี่ยนสถานะเป็น cancelled
   * @param {string} contractId - Contract ID
   * @param {Object} cancellationData - ข้อมูลการยกเลิก
   * @returns {Promise<Object>} ผลลัพธ์การยกเลิก
   */
  async cancelContract(contractId, cancellationData = {}) {
    try {
      const validation = InputValidator.validateRequiredString(contractId, 'Contract ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid contract ID', validation.errors);
      }

      const result = {
        success: false,
        contractId: contractId,
        updatedData: {
          contract: null,
          subscriptions: []
        },
        steps: []
      };

      // Step 1: Update contract status to cancelled
      const contractUpdateData = {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: cancellationData.reason || 'User requested',
        cancelledBy: cancellationData.cancelledBy || 'system',
        cancellationNotes: cancellationData.notes || '',
        updatedAt: new Date().toISOString()
      };

      const updatedContract = await this.contract.update(contractId, contractUpdateData);
      result.updatedData.contract = updatedContract;
      result.steps.push('✅ Contract status updated to cancelled');

      // Step 2: Update all related subscriptions to cancelled
      const subscriptions = await this.subscription.getByContractId(contractId);
      
      if (subscriptions && subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          const subscriptionUpdateData = {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: cancellationData.reason || 'Contract cancelled',
            updatedAt: new Date().toISOString()
          };

          const updatedSubscription = await this.subscription.update(subscription._id, subscriptionUpdateData);
          result.updatedData.subscriptions.push(updatedSubscription);
        }
      }
      result.steps.push(`✅ Updated ${result.updatedData.subscriptions.length} subscriptions`);

      result.success = true;
      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.cancelContract',
        contractId,
        cancellationData: {
          reason: cancellationData.reason,
          cancelledBy: cancellationData.cancelledBy
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  // ===== 📊 CONTRACT LIFECYCLE CALCULATION =====

  /**
   * 📊 คำนวณข้อมูลอายุและสถานะของ Contract
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} Contract lifecycle information
   */
  async calculateContractLifecycle(contractId) {
    try {
      const validation = InputValidator.validateRequiredString(contractId, 'Contract ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid contract ID', validation.errors);
      }

      const result = {
        success: false,
        contractId: contractId,
        lifecycle: {
          startDate: null,        // วันที่เริ่มต้น contract
          currentEndDate: null,   // วันที่สิ้นสุดของ subscription ที่ active ปัจจุบัน
          lastUpdated: null,      // วันที่ subscription ปัจจุบันได้รับการยืนยัน
          totalDuration: 0,       // จำนวนวันรวมทั้งหมด
          remainingDays: 0,       // จำนวนวันคงเหลือ
          usedDays: 0,           // จำนวนวันที่ใช้ไปแล้ว
          status: 'unknown',      // สถานะปัจจุบัน: active, expired, trial, pending
          isExpiringSoon: false,  // หมดอายุใน 30 วันหรือไม่
          activeSubscription: null // subscription ที่ active ปัจจุบัน
        }
      };

      // Step 1: ดึงข้อมูล contract
      const contract = await this.contract.getById(contractId);
      if (!contract) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      // Step 2: ดึงข้อมูล subscriptions ทั้งหมดของ contract นี้
      const subscriptions = await this.subscription.getByContractId(contractId);
      if (!subscriptions || subscriptions.length === 0) {
        // ไม่มี subscription
        result.lifecycle.startDate = contract.contractStartDate;
        result.lifecycle.status = 'no_subscription';
        result.success = true;
        return result;
      }

      // Step 3: หา active subscription ปัจจุบัน
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'active' || sub.status === 'trial'
      );

      if (!activeSubscription) {
        // ไม่มี active subscription
        result.lifecycle.startDate = contract.contractStartDate;
        result.lifecycle.status = 'inactive';
        
        // หา subscription ล่าสุดที่เคยมี
        const latestSubscription = subscriptions
          .filter(sub => sub.activatedAt)
          .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))[0];
        
        if (latestSubscription) {
          result.lifecycle.lastUpdated = latestSubscription.activatedAt;
          result.lifecycle.currentEndDate = latestSubscription.periodEnd;
        }
        
        result.success = true;
        return result;
      }

      // Step 4: คำนวณข้อมูลอายุจาก active subscription
      const today = new Date();
      const contractStartDate = new Date(contract.contractStartDate);
      const subscriptionEndDate = new Date(activeSubscription.periodEnd);

      // กำหนดข้อมูลพื้นฐาน
      result.lifecycle.startDate = contract.contractStartDate;
      result.lifecycle.currentEndDate = activeSubscription.periodEnd;
      result.lifecycle.lastUpdated = activeSubscription.activatedAt || activeSubscription.createdAt;
      result.lifecycle.activeSubscription = {
        id: activeSubscription._id,
        status: activeSubscription.status,
        periodStart: activeSubscription.periodStart,
        periodEnd: activeSubscription.periodEnd,
        packageName: activeSubscription.packageName,
        billingCycle: activeSubscription.billingCycle
      };

      // คำนวณระยะเวลา
      const totalDurationMs = subscriptionEndDate - contractStartDate;
      const usedDurationMs = today - contractStartDate;
      const remainingDurationMs = subscriptionEndDate - today;

      result.lifecycle.totalDuration = Math.max(0, Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)));
      result.lifecycle.usedDays = Math.max(0, Math.ceil(usedDurationMs / (1000 * 60 * 60 * 24)));
      result.lifecycle.remainingDays = Math.max(0, Math.ceil(remainingDurationMs / (1000 * 60 * 60 * 24)));

      // กำหนดสถานะ
      if (activeSubscription.status === 'trial') {
        result.lifecycle.status = 'trial';
      } else if (today > subscriptionEndDate) {
        result.lifecycle.status = 'expired';
      } else if (activeSubscription.status === 'active') {
        result.lifecycle.status = 'active';
      } else {
        result.lifecycle.status = 'pending';
      }

      // ตรวจสอบว่าหมดอายุเร็วๆ นี้หรือไม่ (30 วัน)
      result.lifecycle.isExpiringSoon = result.lifecycle.remainingDays <= 30 && result.lifecycle.remainingDays > 0;

      result.success = true;
      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.calculateContractLifecycle',
        contractId,
        severity: 'MEDIUM'
      });
      throw error;
    }
  }

  // ===== 🔧 CONTRACT MODIFICATION METHODS =====

  /**
   * 🔧 แก้ไข Contract (สร้าง version history)
   * @param {string} contractId - Contract ID ที่ต้องการแก้ไข
   * @param {Object} updateData - ข้อมูลที่ต้องการแก้ไข
   * @returns {Promise<Object>} ผลลัพธ์การแก้ไข
   */
  async editContract(contractId, updateData) {
    try {
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(contractId, 'Contract ID'),
        InputValidator.validateNumber(updateData.basePrice, 'Base Price', { min: 0, required: false }),
        InputValidator.validateBillingCycle(updateData.billingCycle, { required: false }),
        InputValidator.validateCurrency(updateData.currency, { required: false })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid update data', validation.errors);
      }

      const result = {
        success: false,
        contractId: contractId,
        originalContract: null,
        updatedContract: null,
        versionHistory: null,
        steps: []
      };

      // Step 1: ดึงข้อมูล Contract เดิม
      const originalContract = await this.contract.getById(contractId);
      if (!originalContract) {
        throw new Error(`Contract not found: ${contractId}`);
      }
      result.originalContract = originalContract;
      result.steps.push('✅ Original contract retrieved');

      // Step 2: สร้าง version history
      const versionHistory = {
        contractId: contractId,
        version: (originalContract.version || 0) + 1,
        previousVersion: originalContract.version || 0,
        changes: updateData,
        changedAt: new Date().toISOString(),
        changedBy: updateData.modifiedBy || 'system',
        changeReason: updateData.changeReason || 'Contract modification',
        originalData: {
          basePrice: originalContract.basePrice,
          billingCycle: originalContract.billingCycle,
          contractTerms: originalContract.contractTerms,
          currency: originalContract.currency
        }
      };

      // Step 3: เตรียมข้อมูลสำหรับการอัพเดต
      const contractUpdateData = {
        ...updateData,
        version: versionHistory.version,
        lastModified: new Date().toISOString(),
        modifiedBy: updateData.modifiedBy || 'system',
        versionHistory: [...(originalContract.versionHistory || []), versionHistory]
      };

      // ลบข้อมูลที่ไม่ใช่ contract fields
      delete contractUpdateData.modifiedBy;
      delete contractUpdateData.changeReason;

      // Step 4: อัพเดต Contract
      result.updatedContract = await this.contract.update(contractId, contractUpdateData);
      result.versionHistory = versionHistory;
      result.steps.push('✅ Contract updated with version history');

      // Step 5: ตรวจสอบว่าการเปลี่ยนแปลงส่งผลต่อ active subscriptions หรือไม่
      if (updateData.basePrice || updateData.billingCycle) {
        const subscriptions = await this.subscription.getByContractId(contractId);
        const activeSubscriptions = subscriptions.filter(sub => 
          sub.status === 'active' || sub.status === 'trial'
        );

        if (activeSubscriptions.length > 0) {
          result.steps.push(`ℹ️ Found ${activeSubscriptions.length} active subscriptions that may be affected`);
          result.affectedSubscriptions = activeSubscriptions.map(sub => ({
            id: sub._id,
            status: sub.status,
            currentPrice: sub.basePrice,
            newPrice: updateData.basePrice,
            note: 'Changes will apply to next billing cycle'
          }));
        }
      }

      result.success = true;
      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.editContract',
        contractId,
        updateData: {
          basePrice: updateData?.basePrice,
          billingCycle: updateData?.billingCycle,
          currency: updateData?.currency
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  /**
   * 🔧 เปลี่ยนราคา Contract (มีผลตั้งแต่งวดถัดไป)
   * @param {string} contractId - Contract ID
   * @param {Object} pricingData - ข้อมูลราคาใหม่
   * @returns {Promise<Object>} ผลลัพธ์การเปลี่ยนราคา
   */
  async updateContractPricing(contractId, pricingData) {
    try {
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(contractId, 'Contract ID'),
        InputValidator.validateNumber(pricingData.basePrice, 'Base Price', { min: 0 }),
        InputValidator.validateBillingCycle(pricingData.billingCycle, { required: false }),
        InputValidator.validateCurrency(pricingData.currency, { required: false })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid pricing data', validation.errors);
      }

      const updateData = {
        basePrice: pricingData.basePrice,
        currency: pricingData.currency || 'THB',
        billingCycle: pricingData.billingCycle,
        modifiedBy: pricingData.modifiedBy || 'system',
        changeReason: `Price update: ${pricingData.basePrice} ${pricingData.currency || 'THB'} per ${pricingData.billingCycle}`
      };

      const result = await this.editContract(contractId, updateData);
      
      // เพิ่มข้อมูลเฉพาะการเปลี่ยนราคา
      result.pricingChange = {
        oldPrice: result.originalContract.basePrice,
        newPrice: pricingData.basePrice,
        effectiveDate: 'Next billing cycle',
        currency: pricingData.currency || 'THB'
      };

      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.updateContractPricing',
        contractId,
        pricingData: {
          basePrice: pricingData?.basePrice,
          currency: pricingData?.currency
        },
        severity: 'HIGH'
      });
      throw error;
    }
  }

  // ===== 🔄 SUBSCRIPTION PAUSE/RESUME METHODS =====

  /**
   * ⏸️ หยุด Subscription ชั่วคราว
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} pauseData - ข้อมูลการหยุด
   * @returns {Promise<Object>} ผลลัพธ์การหยุด
   */
  async pauseSubscription(subscriptionId, pauseData = {}) {
    try {
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(subscriptionId, 'Subscription ID'),
        InputValidator.validateDate(pauseData.pauseStartDate, { required: false }),
        InputValidator.validateDate(pauseData.pauseEndDate, { required: false })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid pause data', validation.errors);
      }

      const result = {
        success: false,
        subscriptionId: subscriptionId,
        pausedSubscription: null,
        pauseDetails: null,
        steps: []
      };

      // Step 1: ตรวจสอบ Subscription
      const subscription = await this.subscription.getById(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      if (subscription.status !== 'active' && subscription.status !== 'trial') {
        throw new Error(`Cannot pause subscription with status: ${subscription.status}`);
      }
      result.steps.push('✅ Subscription validated');

      // Step 2: คำนวณข้อมูลการหยุด
      const pauseStartDate = new Date(pauseData.pauseStartDate || new Date());
      const pauseEndDate = pauseData.pauseEndDate ? new Date(pauseData.pauseEndDate) : null;
      const remainingDays = Math.ceil((new Date(subscription.periodEnd) - pauseStartDate) / (1000 * 60 * 60 * 24));

      const pauseDetails = {
        pauseStartDate: pauseStartDate.toISOString(),
        pauseEndDate: pauseEndDate ? pauseEndDate.toISOString() : null,
        pauseReason: pauseData.reason || 'User requested',
        pausedBy: pauseData.pausedBy || 'system',
        originalPeriodEnd: subscription.periodEnd,
        remainingDaysAtPause: Math.max(0, remainingDays),
        pauseDuration: pauseEndDate ? Math.ceil((pauseEndDate - pauseStartDate) / (1000 * 60 * 60 * 24)) : null
      };

      // Step 3: อัพเดต Subscription
      const subscriptionUpdateData = {
        status: 'paused',
        pausedAt: pauseStartDate.toISOString(),
        'metadata.pauseDetails': pauseDetails,
        'metadata.originalStatus': subscription.status,
        'metadata.pauseHistory': [...(subscription.metadata?.pauseHistory || []), pauseDetails],
        updatedAt: new Date().toISOString()
      };

      result.pausedSubscription = await this.subscription.update(subscriptionId, subscriptionUpdateData);
      result.pauseDetails = pauseDetails;
      result.steps.push('✅ Subscription paused');

      // Step 4: จัดการ Invoice ที่เกี่ยวข้อง (ถ้ามี)
      if (subscription.invoiceId) {
        try {
          await this.invoice.update(subscription.invoiceId, {
            'metadata.subscriptionPaused': true,
            'metadata.pauseDate': pauseStartDate.toISOString(),
            updatedAt: new Date().toISOString()
          });
          result.steps.push('✅ Related invoice updated');
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'LifecycleManager.pauseSubscription - invoice update',
            subscriptionId,
            invoiceId: subscription.invoiceId,
            severity: 'LOW'
          });
          result.steps.push('⚠️ Invoice update failed');
        }
      }

      result.success = true;
      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.pauseSubscription',
        subscriptionId,
        pauseData: {
          reason: pauseData?.reason,
          pausedBy: pauseData?.pausedBy
        },
        severity: 'MEDIUM'
      });
      throw error;
    }
  }

  /**
   * ▶️ เริ่ม Subscription ใหม่หลังหยุด
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} resumeData - ข้อมูลการเริ่มใหม่
   * @returns {Promise<Object>} ผลลัพธ์การเริ่มใหม่
   */
  async resumeSubscription(subscriptionId, resumeData = {}) {
    try {
      const validation = InputValidator.combineValidationResults([
        InputValidator.validateRequiredString(subscriptionId, 'Subscription ID'),
        InputValidator.validateDate(resumeData.resumeDate, { required: false })
      ]);

      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid resume data', validation.errors);
      }

      const result = {
        success: false,
        subscriptionId: subscriptionId,
        resumedSubscription: null,
        newPeriodEnd: null,
        steps: []
      };

      // Step 1: ตรวจสอบ Subscription
      const subscription = await this.subscription.getById(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      if (subscription.status !== 'paused') {
        throw new Error(`Cannot resume subscription with status: ${subscription.status}`);
      }

      const pauseDetails = subscription.metadata?.pauseDetails;
      if (!pauseDetails) {
        throw new Error('Pause details not found');
      }
      result.steps.push('✅ Paused subscription validated');

      // Step 2: คำนวณ period end ใหม่
      const resumeDate = new Date(resumeData.resumeDate || new Date());
      const pauseStartDate = new Date(pauseDetails.pauseStartDate);
      const pauseDuration = Math.ceil((resumeDate - pauseStartDate) / (1000 * 60 * 60 * 24));
      
      // เพิ่มวันที่หยุดไปยัง period end เดิม
      const originalPeriodEnd = new Date(pauseDetails.originalPeriodEnd);
      const newPeriodEnd = new Date(originalPeriodEnd.getTime() + (pauseDuration * 24 * 60 * 60 * 1000));

      // Step 3: อัพเดต Subscription
      const subscriptionUpdateData = {
        status: subscription.metadata?.originalStatus || 'active',
        periodEnd: newPeriodEnd.toISOString(),
        resumedAt: resumeDate.toISOString(),
        'metadata.resumeDetails': {
          resumeDate: resumeDate.toISOString(),
          pauseDuration: pauseDuration,
          periodExtended: pauseDuration,
          resumedBy: resumeData.resumedBy || 'system'
        },
        'metadata.totalPauseDuration': (subscription.metadata?.totalPauseDuration || 0) + pauseDuration,
        updatedAt: new Date().toISOString()
      };

      result.resumedSubscription = await this.subscription.update(subscriptionId, subscriptionUpdateData);
      result.newPeriodEnd = newPeriodEnd.toISOString();
      result.pauseDuration = pauseDuration;
      result.steps.push('✅ Subscription resumed');

      // Step 4: จัดการ Invoice ที่เกี่ยวข้อง
      if (subscription.invoiceId) {
        try {
          await this.invoice.update(subscription.invoiceId, {
            'metadata.subscriptionResumed': true,
            'metadata.resumeDate': resumeDate.toISOString(),
            'metadata.newDueDate': newPeriodEnd.toISOString(),
            updatedAt: new Date().toISOString()
          });
          result.steps.push('✅ Related invoice updated');
        } catch (error) {
          ErrorHandler.handle(error, {
            context: 'LifecycleManager.resumeSubscription - invoice update',
            subscriptionId,
            invoiceId: subscription.invoiceId,
            severity: 'LOW'
          });
          result.steps.push('⚠️ Invoice update failed');
        }
      }

      result.success = true;
      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.resumeSubscription',
        subscriptionId,
        resumeData: {
          resumedBy: resumeData?.resumedBy,
          resumeDate: resumeData?.resumeDate
        },
        severity: 'MEDIUM'
      });
      throw error;
    }
  }

  // ===== 🔧 UTILITY METHODS =====

  /**
   * ดึงข้อมูล Contract เดียวพร้อม Subscriptions ทั้งหมด
   */
  async getSingleContractWithSubscriptions(contractId) {
    try {
      // Get contract details
      const contract = await this.contract.getById(contractId);
      if (!contract) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      const result = {
        ...contract,
        subscriptions: []
      };

      // Get subscriptions for this contract
      const subscriptions = await this.subscription.getByContractId(contractId);
      
      if (subscriptions && subscriptions.length > 0) {
        // For each subscription, get invoices and receipts
        for (const subscription of subscriptions) {
          const enrichedSubscription = {
            ...subscription,
            invoices: [],
            receipts: []
          };

          // Get invoices and receipts in parallel
          const [invoices, receipts] = await Promise.all([
            this.invoice.getBySubscriptionId(subscription._id),
            this.receipt.getBySubscriptionId(subscription._id)
          ]);

          if (invoices && invoices.length > 0) {
            enrichedSubscription.invoices = invoices;
          }

          if (receipts && receipts.length > 0) {
            enrichedSubscription.receipts = receipts;
          }

          result.subscriptions.push(enrichedSubscription);
        }
      }

      return result;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'LifecycleManager.getSingleContractWithSubscriptions',
        contractId,
        severity: 'MEDIUM'
      });
      throw error;
    }
  }
}

export default LifecycleManager; 
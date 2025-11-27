/**
 * DataAnalyticsManager - Data Analytics and Reporting
 * 
 * 📊 Handles data aggregation and analytics
 * 📈 Generates financial health reports and statistics
 * 🔍 Validates business rules and processes
 * ✅ Uses InputValidator and ErrorHandler for validation and error management
 */

import InputValidator from '../utils/InputValidator.js';
import ErrorHandler from '../utils/ErrorHandler.js';

class DataAnalyticsManager {
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

  // ===== 📊 DATA ACCESS METHODS =====

  /**
   * 📊 ดึงข้อมูล Contract พร้อม Subscriptions, Invoices และ Receipts ด้วย Single Aggregate
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} Contract data with nested subscriptions
   */
  async getContractWithSubscriptions(collectionId) {
    try {
      const validation = InputValidator.validateRequiredString(collectionId, 'Collection ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid collection ID', validation.errors);
      }

      const result = {
        success: false,
        contracts: [],
        totalContracts: 0,
        totalSubscriptions: 0,
        totalInvoices: 0,
        totalReceipts: 0
      };

      // Complete aggregate pipeline to get all data at once
      const pipeline = [
        // Step 1: Match contracts for this collection
        {
          $match: { collectionId: collectionId }
        },
        
        // Step 2: Lookup all subscriptions for each contract
        {
          $lookup: {
            from: 'subscription',
            let: { contractId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$contractId', '$$contractId'] },
                      { $eq: ['$contractId', { $toString: '$$contractId' }] }
                    ]
                  }
                }
              },
              // Lookup invoices for each subscription
              {
                $lookup: {
                  from: 'invoice',
                  let: { subscriptionId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $or: [
                            { $eq: ['$subscriptionId', '$$subscriptionId'] },
                            { $eq: ['$subscriptionId', { $toString: '$$subscriptionId' }] }
                          ]
                        }
                      }
                    },
                    { $sort: { createdAt: -1 } }
                  ],
                  as: 'invoices'
                }
              },
              // Lookup receipts for each subscription
              {
                $lookup: {
                  from: 'receipt',
                  let: { subscriptionId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $or: [
                            { $eq: ['$subscriptionId', '$$subscriptionId'] },
                            { $eq: ['$subscriptionId', { $toString: '$$subscriptionId' }] }
                          ]
                        }
                      }
                    },
                    { $sort: { createdAt: -1 } }
                  ],
                  as: 'receipts'
                }
              },
              { $sort: { createdAt: -1 } }
            ],
            as: 'subscriptions'
          }
        },
        
        // Step 3: Sort contracts by creation date
        {
          $sort: { createdAt: -1 }
        }
      ];

      const contracts = await this.contract.apiRequest.aggregateCall('contract', pipeline);
      
      if (!contracts || !Array.isArray(contracts)) {
        result.success = true;
        return result;
      }

      // Process results and calculate totals
      result.totalContracts = contracts.length;
      
      contracts.forEach(contract => {
        // Ensure subscriptions is an array
        if (!contract.subscriptions) {
          contract.subscriptions = [];
        }
        
        result.totalSubscriptions += contract.subscriptions.length;
        
        contract.subscriptions.forEach(subscription => {
          // Ensure invoices and receipts are arrays
          if (!subscription.invoices) subscription.invoices = [];
          if (!subscription.receipts) subscription.receipts = [];
          
          result.totalInvoices += subscription.invoices.length;
          result.totalReceipts += subscription.receipts.length;
        });
      });

      result.contracts = contracts;
      result.success = true;
      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.getContractWithSubscriptions',
        collectionId,
        severity: 'MEDIUM'
      });
      
      // Fallback to empty result
      return {
        success: true,
        contracts: [],
        totalContracts: 0,
        totalSubscriptions: 0,
        totalInvoices: 0,
        totalReceipts: 0
      };
    }
  }

  /**
   * 📊 สรุปสถิติ Contract และ Subscription (ใช้ข้อมูลที่มีอยู่แล้ว)
   * @param {Object} contractData - Contract data from getContractWithSubscriptions
   * @returns {Object} Statistics summary
   */
  calculateContractStatistics(contractData) {
    try {
      if (!contractData || !contractData.success || !contractData.contracts) {
        return this.getEmptyStats();
      }

      const stats = {
        contracts: {
          total: contractData.totalContracts,
          active: 0,
          expired: 0,
          cancelled: 0
        },
        subscriptions: {
          total: contractData.totalSubscriptions,
          trial: 0,
          active: 0,
          pending_payment: 0,
          cancelled: 0,
          expired: 0
        },
        invoices: {
          total: contractData.totalInvoices,
          draft: 0,
          pending_payment: 0,
          paid: 0,
          overdue: 0,
          cancelled: 0
        },
        receipts: {
          total: contractData.totalReceipts
        },
        financial: {
          totalRevenue: 0,
          pendingAmount: 0,
          overdueAmount: 0
        }
      };

      // Calculate statistics
      contractData.contracts.forEach(contract => {
        // Contract status
        if (contract.status === 'active') stats.contracts.active++;
        else if (contract.status === 'expired') stats.contracts.expired++;
        else if (contract.status === 'cancelled') stats.contracts.cancelled++;

        if (contract.subscriptions && Array.isArray(contract.subscriptions)) {
          contract.subscriptions.forEach(subscription => {
            // Subscription status
            if (subscription.status === 'trial') stats.subscriptions.trial++;
            else if (subscription.status === 'active') stats.subscriptions.active++;
            else if (subscription.status === 'pending_payment') stats.subscriptions.pending_payment++;
            else if (subscription.status === 'cancelled') stats.subscriptions.cancelled++;
            else if (subscription.status === 'expired') stats.subscriptions.expired++;

            if (subscription.invoices && Array.isArray(subscription.invoices)) {
              subscription.invoices.forEach(invoice => {
                // Invoice status
                if (invoice.status === 'draft') stats.invoices.draft++;
                else if (invoice.status === 'pending_payment') {
                  stats.invoices.pending_payment++;
                  stats.financial.pendingAmount += invoice.amount || 0;
                }
                else if (invoice.status === 'paid') {
                  stats.invoices.paid++;
                  stats.financial.totalRevenue += invoice.amount || 0;
                }
                else if (invoice.status === 'overdue') {
                  stats.invoices.overdue++;
                  stats.financial.overdueAmount += invoice.amount || 0;
                }
                else if (invoice.status === 'cancelled') stats.invoices.cancelled++;
              });
            }
          });
        }
      });

      return stats;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.calculateContractStatistics',
        severity: 'LOW'
      });
      return this.getEmptyStats();
    }
  }

  /**
   * 📊 สรุปสถิติ Contract และ Subscription (Wrapper method for backward compatibility)
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} Statistics summary
   */
  async getContractStatistics(collectionId) {
    try {
      const contractData = await this.getContractWithSubscriptions(collectionId);
      return this.calculateContractStatistics(contractData);
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.getContractStatistics',
        collectionId,
        severity: 'MEDIUM'
      });
      return this.getEmptyStats();
    }
  }

  /**
   * 📊 Empty statistics structure
   * @returns {Object} Empty stats
   */
  getEmptyStats() {
    return {
      contracts: {
        total: 0,
        active: 0,
        expired: 0,
        cancelled: 0
      },
      subscriptions: {
        total: 0,
        trial: 0,
        active: 0,
        pending_payment: 0,
        cancelled: 0,
        expired: 0
      },
      invoices: {
        total: 0,
        draft: 0,
        pending_payment: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0
      },
      receipts: {
        total: 0
      },
      financial: {
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0
      }
    };
  }

  /**
   * 📊 คำนวณข้อมูลอายุสำหรับ contracts หลายตัวพร้อมกัน
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} Multiple contracts lifecycle information
   */
  async calculateMultipleContractLifecycles(collectionId) {
    try {
      const validation = InputValidator.validateRequiredString(collectionId, 'Collection ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid collection ID', validation.errors);
      }

      const result = {
        success: false,
        collectionId: collectionId,
        contracts: [],
        summary: {
          total: 0,
          active: 0,
          trial: 0,
          expired: 0,
          expiringSoon: 0,
          inactive: 0,
          totalRemainingDays: 0,
          averageRemainingDays: 0
        }
      };

      // Step 1: ดึงข้อมูล contracts ทั้งหมดใน collection
      const contractsData = await this.getContractWithSubscriptions(collectionId);
      
      if (!contractsData.success || contractsData.contracts.length === 0) {
        result.success = true;
        return result;
      }

      // Step 2: คำนวณ lifecycle สำหรับแต่ละ contract
      // Note: This would need LifecycleManager instance to calculate individual lifecycles
      // For now, we'll return basic summary from contract data
      result.contracts = contractsData.contracts.map(contract => ({
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        packageName: contract.packageName,
        status: contract.status || 'unknown',
        subscriptionsCount: contract.subscriptions?.length || 0,
        activeSubscriptions: contract.subscriptions?.filter(sub => 
          sub.status === 'active' || sub.status === 'trial'
        ).length || 0
      }));

      // Step 3: คำนวณสรุปสถิติ
      result.summary.total = contractsData.contracts.length;
      
      contractsData.contracts.forEach(contract => {
        const hasActiveSubscription = contract.subscriptions?.some(sub => 
          sub.status === 'active' || sub.status === 'trial'
        );

        if (hasActiveSubscription) {
          const activeSubscription = contract.subscriptions.find(sub => 
            sub.status === 'active' || sub.status === 'trial'
          );
          
          if (activeSubscription?.status === 'trial') {
            result.summary.trial++;
          } else {
            result.summary.active++;
          }

          // Calculate remaining days if possible
          if (activeSubscription?.periodEnd) {
            const today = new Date();
            const endDate = new Date(activeSubscription.periodEnd);
            const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
            
            result.summary.totalRemainingDays += remainingDays;
            
            if (remainingDays <= 30 && remainingDays > 0) {
              result.summary.expiringSoon++;
            }
          }
        } else {
          if (contract.status === 'expired') {
            result.summary.expired++;
          } else {
            result.summary.inactive++;
          }
        }
      });

      // คำนวณค่าเฉลี่ยวันคงเหลือ
      const activeContracts = result.summary.active + result.summary.trial;
      if (activeContracts > 0) {
        result.summary.averageRemainingDays = Math.round(result.summary.totalRemainingDays / activeContracts);
      }

      result.success = true;
      return result;

    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.calculateMultipleContractLifecycles',
        collectionId,
        severity: 'MEDIUM'
      });
      throw error;
    }
  }

  /**
   * 📊 ตรวจสอบสถานะทางการเงิน
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} รายงานสถานะการเงิน
   */
  async getFinancialHealthReport(collectionId) {
    try {
      const validation = InputValidator.validateRequiredString(collectionId, 'Collection ID');
      if (!validation.isValid) {
        throw ErrorHandler.createValidationError('Invalid collection ID', validation.errors);
      }

      const contractData = await this.getContractWithSubscriptions(collectionId);
      const stats = this.calculateContractStatistics(contractData);
      
      const report = {
        collectionId: collectionId,
        generatedAt: new Date().toISOString(),
        overall: {
          healthScore: 0, // 0-100
          status: 'unknown', // healthy, warning, critical
          totalRevenue: stats.financial.totalRevenue,
          pendingAmount: stats.financial.pendingAmount,
          overdueAmount: stats.financial.overdueAmount
        },
        contracts: {
          total: stats.contracts.total,
          active: stats.contracts.active,
          activePercentage: stats.contracts.total > 0 ? Math.round((stats.contracts.active / stats.contracts.total) * 100) : 0,
          expired: stats.contracts.expired,
          cancelled: stats.contracts.cancelled
        },
        subscriptions: {
          total: stats.subscriptions.total,
          active: stats.subscriptions.active,
          trial: stats.subscriptions.trial,
          pendingPayment: stats.subscriptions.pending_payment,
          cancelled: stats.subscriptions.cancelled,
          expired: stats.subscriptions.expired
        },
        invoices: {
          total: stats.invoices.total,
          paid: stats.invoices.paid,
          paidPercentage: stats.invoices.total > 0 ? Math.round((stats.invoices.paid / stats.invoices.total) * 100) : 0,
          pending: stats.invoices.pending_payment,
          overdue: stats.invoices.overdue,
          overduePercentage: stats.invoices.total > 0 ? Math.round((stats.invoices.overdue / stats.invoices.total) * 100) : 0
        },
        alerts: [],
        recommendations: []
      };

      // คำนวณ Health Score
      let healthScore = 100;
      
      // ลดคะแนนตามอัตราการจ่ายเงิน
      if (report.invoices.overduePercentage > 20) {
        healthScore -= 30;
        report.alerts.push('High overdue payment rate');
      } else if (report.invoices.overduePercentage > 10) {
        healthScore -= 15;
        report.alerts.push('Moderate overdue payment rate');
      }

      // ลดคะแนนตามอัตราการยกเลิก
      const cancellationRate = stats.contracts.total > 0 ? (stats.contracts.cancelled / stats.contracts.total) * 100 : 0;
      if (cancellationRate > 20) {
        healthScore -= 25;
        report.alerts.push('High cancellation rate');
      } else if (cancellationRate > 10) {
        healthScore -= 10;
        report.alerts.push('Moderate cancellation rate');
      }

      // ลดคะแนนตามจำนวน pending payment
      if (stats.subscriptions.pending_payment > stats.subscriptions.active * 0.3) {
        healthScore -= 20;
        report.alerts.push('High pending payment subscriptions');
      }

      report.overall.healthScore = Math.max(0, healthScore);
      
      // กำหนดสถานะ
      if (report.overall.healthScore >= 80) {
        report.overall.status = 'healthy';
      } else if (report.overall.healthScore >= 60) {
        report.overall.status = 'warning';
      } else {
        report.overall.status = 'critical';
      }

      // คำแนะนำ
      if (report.invoices.overduePercentage > 10) {
        report.recommendations.push('Implement automated payment reminders');
        report.recommendations.push('Consider offering payment plans for overdue accounts');
      }

      if (cancellationRate > 15) {
        report.recommendations.push('Review contract terms and pricing');
        report.recommendations.push('Implement customer retention strategies');
      }

      if (stats.subscriptions.trial > stats.subscriptions.active) {
        report.recommendations.push('Focus on trial-to-paid conversion');
      }

      return report;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.getFinancialHealthReport',
        collectionId,
        severity: 'HIGH'
      });
      throw error;
    }
  }

  // ===== 📋 BUSINESS RULES VALIDATION =====

  /**
   * 📋 ตรวจสอบกฎธุรกิจก่อนสร้าง Contract
   * @param {Object} contractData - ข้อมูล Contract
   * @returns {Object} ผลลัพธ์การตรวจสอบ
   */
  validateContractBusinessRules(contractData) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };

      // Use InputValidator for comprehensive validation
      const inputValidation = InputValidator.validateContractData(contractData);
      
      if (!inputValidation.isValid) {
        validation.errors.push(...inputValidation.errors);
        validation.isValid = false;
      }

      // Additional business rules
      if (contractData.basePrice === 0) {
        validation.warnings.push('Base price is zero - this will be a free contract');
      }

      // Rule: ตรวจสอบวันที่
      if (contractData.startDate) {
        const startDate = new Date(contractData.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
          validation.warnings.push('Contract start date is in the past');
        }
      }

      // Suggestions
      if (!contractData.contractTerms) {
        validation.suggestions.push('Consider adding contract terms and conditions');
      }

      if (!contractData.description) {
        validation.suggestions.push('Consider adding a contract description');
      }

      return validation;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.validateContractBusinessRules',
        contractData: {
          collectionId: contractData?.collectionId,
          packageId: contractData?.packageId,
          basePrice: contractData?.basePrice
        },
        severity: 'MEDIUM'
      });

      return {
        isValid: false,
        errors: ['Validation error: ' + error.message],
        warnings: [],
        suggestions: []
      };
    }
  }

  /**
   * 📋 ตรวจสอบกฎธุรกิจก่อนสร้าง Subscription
   * @param {Object} subscriptionData - ข้อมูล Subscription
   * @returns {Promise<Object>} ผลลัพธ์การตรวจสอบ
   */
  async validateSubscriptionBusinessRules(subscriptionData) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };

      // Use InputValidator for comprehensive validation
      const inputValidation = InputValidator.validateSubscriptionData(subscriptionData);
      
      if (!inputValidation.isValid) {
        validation.errors.push(...inputValidation.errors);
        validation.isValid = false;
      }

      // Rule 1: ตรวจสอบ Contract ที่เกี่ยวข้อง
      if (subscriptionData.contractId) {
        const contract = await this.contract.getById(subscriptionData.contractId);
        if (!contract) {
          validation.errors.push('Associated contract not found');
          validation.isValid = false;
        } else if (contract.status !== 'active') {
          validation.errors.push('Cannot create subscription for inactive contract');
          validation.isValid = false;
        }
      }

      // Rule 2: ตรวจสอบ Package ที่เกี่ยวข้อง
      if (subscriptionData.packageId) {
        const packageData = await this.package.getById(subscriptionData.packageId);
        if (!packageData) {
          validation.errors.push('Associated package not found');
          validation.isValid = false;
        }
      }

      // Rule 3: ตรวจสอบ Trial Period
      if (subscriptionData.trialDays) {
        if (subscriptionData.trialDays < 0) {
          validation.errors.push('Trial days cannot be negative');
          validation.isValid = false;
        }
        
        if (subscriptionData.trialDays > 90) {
          validation.warnings.push('Trial period is longer than 90 days');
        }
      }

      // Rule 4: ตรวจสอบการซ้ำซ้อนของ Subscription
      if (subscriptionData.contractId) {
        const existingSubscriptions = await this.subscription.getByContractId(subscriptionData.contractId);
        const activeSubscriptions = existingSubscriptions.filter(sub => 
          sub.status === 'active' || sub.status === 'trial'
        );
        
        if (activeSubscriptions.length > 0) {
          validation.warnings.push('Contract already has active subscriptions');
        }
      }

      // Rule 5: ตรวจสอบวันที่
      if (subscriptionData.periodStart) {
        const startDate = new Date(subscriptionData.periodStart);
        const today = new Date();
        
        if (startDate < today) {
          validation.warnings.push('Subscription start date is in the past');
        }
      }

      return validation;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        context: 'DataAnalyticsManager.validateSubscriptionBusinessRules',
        subscriptionData: {
          contractId: subscriptionData?.contractId,
          packageId: subscriptionData?.packageId,
          collectionId: subscriptionData?.collectionId
        },
        severity: 'MEDIUM'
      });

      return {
        isValid: false,
        errors: ['Validation error: ' + error.message],
        warnings: [],
        suggestions: []
      };
    }
  }
}

export default DataAnalyticsManager; 
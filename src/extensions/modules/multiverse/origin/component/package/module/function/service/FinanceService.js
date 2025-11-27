import ApiRequest from '@/plugins/apiRequest.js';

/**
 * FinanceService - จัดการเอกสารทางการเงิน
 * รวมถึงใบแจ้งหนี้ ใบเสร็จรับเงิน การชำระเงิน และรายงานทางการเงิน
 */
class FinanceService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes (shorter for financial data)
  }

  // ===== INVOICE MANAGEMENT =====

  /**
   * สร้างใบแจ้งหนี้
   */
  async createInvoice(invoiceData) {
    try {
      console.log('=== CREATING INVOICE ===');
      console.log('Invoice Data:', invoiceData);
      
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = await this.generateInvoiceNumber();
      }
      
      // Set default values
      const invoice = {
        ...invoiceData,
        status: invoiceData.status || 'pending',
        issueDate: invoiceData.issueDate || new Date().toISOString(),
        dueDate: invoiceData.dueDate || this.calculateDueDate(invoiceData.paymentTerms),
        currency: invoiceData.currency || 'THB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await this.apiRequest.create('invoice', invoice);
      
      if (result && result._id) {
        // Clear cache
        this.clearCacheForCollection(invoiceData.collectionId);
        console.log('✅ Invoice created successfully:', result.invoiceNumber);
        return result;
      }
      
      throw new Error('Failed to create invoice');
      
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * อัปเดตใบแจ้งหนี้
   */
  async updateInvoice(invoiceId, updateData) {
    try {
      console.log('=== UPDATING INVOICE ===');
      console.log('Invoice ID:', invoiceId);
      
      const update = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await this.apiRequest.update('invoice', invoiceId, update);
      
      if (result) {
        // Clear cache
        this.clearCache();
        console.log('✅ Invoice updated successfully');
        return result;
      }
      
      throw new Error('Failed to update invoice');
      
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * เปลี่ยนสถานะใบแจ้งหนี้เป็น "ชำระแล้ว"
   */
  async markInvoiceAsPaid(invoiceId, paymentData = {}) {
    try {
      console.log('=== MARKING INVOICE AS PAID ===');
      console.log('Invoice ID:', invoiceId);
      
      const updateData = {
        status: 'paid',
        paidAt: paymentData.paidAt || new Date().toISOString(),
        paymentMethod: paymentData.paymentMethod || 'admin_confirmation',
        paymentAmount: paymentData.paymentAmount,
        paymentReference: paymentData.paymentReference,
        paymentNotes: paymentData.paymentNotes,
        paidBy: paymentData.paidBy || 'system'
      };
      
      const result = await this.updateInvoice(invoiceId, updateData);
      
      if (result) {
        console.log('✅ Invoice marked as paid successfully');
        return { success: true, data: result };
      }
      
      throw new Error('Failed to mark invoice as paid');
      
    } catch (error) {
      console.error('❌ Error marking invoice as paid:', error);
      throw error;
    }
  }

  /**
   * ยกเลิกใบแจ้งหนี้
   */
  async cancelInvoice(invoiceId, cancelData = {}) {
    try {
      console.log('=== CANCELLING INVOICE ===');
      console.log('Invoice ID:', invoiceId);
      
      const updateData = {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: cancelData.reason || 'Cancelled by user',
        cancelledBy: cancelData.cancelledBy || 'system'
      };
      
      const result = await this.updateInvoice(invoiceId, updateData);
      
      if (result) {
        console.log('✅ Invoice cancelled successfully');
        return { success: true, data: result };
      }
      
      throw new Error('Failed to cancel invoice');
      
    } catch (error) {
      console.error('❌ Error cancelling invoice:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลใบแจ้งหนี้
   */
  async getInvoiceById(invoiceId) {
    try {
      const cacheKey = `invoice_${invoiceId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      const result = await this.apiRequest.getById('invoice', invoiceId);
      
      if (result) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * ดึงใบแจ้งหนี้ทั้งหมดของ Collection
   */
  async getCollectionInvoices(collectionId, options = {}) {
    try {
      const cacheKey = `collection_invoices_${collectionId}_${JSON.stringify(options)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      const pipeline = [
        {
          $match: {
            collectionId: collectionId,
            ...(options.status && { status: options.status }),
            ...(options.subscriptionId && { subscriptionId: options.subscriptionId })
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ];
      
      if (options.limit) {
        pipeline.push({ $limit: options.limit });
      }
      
      const invoices = await this.apiRequest.aggregateCall('invoice', pipeline);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: invoices || [],
        timestamp: Date.now()
      });
      
      return invoices || [];
      
    } catch (error) {
      console.error('❌ Error getting collection invoices:', error);
      return [];
    }
  }

  // ===== RECEIPT MANAGEMENT =====

  /**
   * สร้างใบเสร็จรับเงิน
   */
  async createReceipt(receiptData) {
    try {
      console.log('=== CREATING RECEIPT ===');
      console.log('Receipt Data:', receiptData);
      console.log('🧾 Customer Info in Receipt:', receiptData.customerInfo);
      
      // Generate receipt number if not provided
      if (!receiptData.receiptNumber) {
        receiptData.receiptNumber = await this.generateReceiptNumber();
      }
      
      // Set default values
      const receipt = {
        ...receiptData,
        status: receiptData.status || 'issued',
        issueDate: receiptData.issueDate || new Date().toISOString(),
        currency: receiptData.currency || 'THB',
        receiptType: receiptData.receiptType || 'payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await this.apiRequest.create('receipt', receipt);
      
      if (result && result._id) {
        // Clear cache
        this.clearCacheForCollection(receiptData.collectionId);
        console.log('✅ Receipt created successfully:', result.receiptNumber);
        return result;
      }
      
      throw new Error('Failed to create receipt');
      
    } catch (error) {
      console.error('❌ Error creating receipt:', error);
      throw error;
    }
  }

  /**
   * สร้างใบเสร็จจากใบแจ้งหนี้
   */
  async createReceiptFromInvoice(invoiceId, paymentData = {}) {
    try {
      console.log('=== CREATING RECEIPT FROM INVOICE ===');
      console.log('Invoice ID:', invoiceId);
      
      // Get invoice data
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Create receipt data from invoice
      const receiptData = {
        collectionId: invoice.collectionId,
        subscriptionId: invoice.subscriptionId,
        invoiceId: invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        
        // Payment information
        amount: paymentData.amount || invoice.totalAmount || invoice.amount,
        currency: invoice.currency || 'THB',
        paymentMethod: paymentData.paymentMethod || 'admin_confirmation',
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
        
        // Receipt details
        receiptType: 'payment',
        description: paymentData.description || `Payment for invoice ${invoice.invoiceNumber}`,
        
        // Customer information
        customerInfo: invoice.customerInfo,
        
        // Items (copy from invoice)
        items: invoice.items || [{
          description: invoice.description || 'Package subscription payment',
          quantity: 1,
          unitPrice: paymentData.amount || invoice.totalAmount || invoice.amount,
          totalPrice: paymentData.amount || invoice.totalAmount || invoice.amount
        }],
        
        // Additional data
        notes: paymentData.notes,
        paidBy: paymentData.paidBy || 'customer'
      };
      
      const receipt = await this.createReceipt(receiptData);
      
      if (receipt) {
        console.log('✅ Receipt created from invoice successfully');
        return receipt;
      }
      
      throw new Error('Failed to create receipt from invoice');
      
    } catch (error) {
      console.error('❌ Error creating receipt from invoice:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลใบเสร็จ
   */
  async getReceiptById(receiptId) {
    try {
      const cacheKey = `receipt_${receiptId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      const result = await this.apiRequest.getById('receipt', receiptId);
      
      if (result) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error getting receipt:', error);
      throw error;
    }
  }

  /**
   * ดึงใบเสร็จทั้งหมดของ Collection
   */
  async getCollectionReceipts(collectionId, options = {}) {
    try {
      const cacheKey = `collection_receipts_${collectionId}_${JSON.stringify(options)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      const pipeline = [
        {
          $match: {
            collectionId: collectionId,
            ...(options.status && { status: options.status }),
            ...(options.invoiceId && { invoiceId: options.invoiceId }),
            ...(options.subscriptionId && { subscriptionId: options.subscriptionId })
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ];
      
      if (options.limit) {
        pipeline.push({ $limit: options.limit });
      }
      
      const receipts = await this.apiRequest.aggregateCall('receipt', pipeline);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: receipts || [],
        timestamp: Date.now()
      });
      
      return receipts || [];
      
    } catch (error) {
      console.error('❌ Error getting collection receipts:', error);
      return [];
    }
  }

  // ===== PAYMENT PROCESSING =====

  /**
   * ประมวลผลการชำระเงิน
   */
  async processPayment(paymentData) {
    try {
      console.log('=== PROCESSING PAYMENT ===');
      console.log('Payment Data:', paymentData);
      
      const results = {
        success: false,
        invoiceUpdated: false,
        receiptGenerated: false,
        invoiceId: paymentData.invoiceId,
        receiptId: null
      };
      
      // Step 1: Mark invoice as paid (if invoice ID provided)
      if (paymentData.invoiceId) {
        try {
          await this.markInvoiceAsPaid(paymentData.invoiceId, paymentData);
          results.invoiceUpdated = true;
          console.log('✅ Invoice marked as paid');
        } catch (invoiceError) {
          console.warn('❌ Failed to mark invoice as paid:', invoiceError);
        }
      }
      
      // Step 2: Generate receipt
      try {
        let receipt;
        if (paymentData.invoiceId) {
          receipt = await this.createReceiptFromInvoice(paymentData.invoiceId, paymentData);
        } else {
          receipt = await this.createReceipt(paymentData);
        }
        
        if (receipt) {
          results.receiptGenerated = true;
          results.receiptId = receipt._id;
          console.log('✅ Receipt generated');
        }
      } catch (receiptError) {
        console.warn('❌ Failed to generate receipt:', receiptError);
      }
      
      // Step 3: Update subscription (if subscription ID provided)
      if (paymentData.subscriptionId) {
        try {
          // This would typically be handled by SubscribeService
          console.log('📝 Subscription payment processed for:', paymentData.subscriptionId);
        } catch (subscriptionError) {
          console.warn('❌ Failed to update subscription:', subscriptionError);
        }
      }
      
      results.success = results.invoiceUpdated || results.receiptGenerated;
      
      console.log('=== PAYMENT PROCESSING COMPLETED ===');
      console.log('Results:', results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  // ===== DOCUMENT GENERATION =====

  /**
   * สร้างเลขที่ใบแจ้งหนี้
   */
  async generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    
    return `INV-${year}${month}-${timestamp}`;
  }

  /**
   * สร้างเลขที่ใบเสร็จ
   */
  async generateReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    
    return `REC-${year}${month}-${timestamp}`;
  }

  /**
   * คำนวณวันที่ครบกำหนดชำระ
   */
  calculateDueDate(paymentTerms = 30) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTerms);
    return dueDate.toISOString();
  }

  // ===== FINANCIAL REPORTS =====

  /**
   * ดึงรายงานการเงินของ Collection
   */
  async getFinancialSummary(collectionId, options = {}) {
    try {
      console.log('=== GENERATING FINANCIAL SUMMARY ===');
      console.log('Collection ID:', collectionId);
      
      const startDate = options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = options.endDate || new Date().toISOString();
      
      // Get invoices
      const invoices = await this.getCollectionInvoices(collectionId);
      
      // Get receipts
      const receipts = await this.getCollectionReceipts(collectionId);
      
      // Calculate summary
      const summary = {
        period: {
          startDate,
          endDate
        },
        invoices: {
          total: invoices.length,
          pending: invoices.filter(inv => inv.status === 'pending').length,
          paid: invoices.filter(inv => inv.status === 'paid').length,
          cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
          totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
        },
        receipts: {
          total: receipts.length,
          totalAmount: receipts.reduce((sum, rec) => sum + (rec.amount || 0), 0)
        },
        payments: {
          totalReceived: receipts.reduce((sum, rec) => sum + (rec.amount || 0), 0),
          totalOutstanding: invoices
            .filter(inv => inv.status === 'pending')
            .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)
        }
      };
      
      console.log('✅ Financial summary generated');
      return summary;
      
    } catch (error) {
      console.error('❌ Error generating financial summary:', error);
      throw error;
    }
  }

  /**
   * ดึงรายงานรายได้รายเดือน
   */
  async getMonthlyRevenue(collectionId, months = 12) {
    try {
      const pipeline = [
        {
          $match: {
            collectionId: collectionId,
            status: 'paid',
            paidAt: {
              $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: { $dateFromString: { dateString: '$paidAt' } } },
              month: { $month: { $dateFromString: { dateString: '$paidAt' } } }
            },
            totalRevenue: { $sum: '$totalAmount' },
            invoiceCount: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ];
      
      const revenue = await this.apiRequest.aggregateCall('invoice', pipeline);
      
      return revenue || [];
      
    } catch (error) {
      console.error('❌ Error getting monthly revenue:', error);
      return [];
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * ตรวจสอบสถานะการชำระเงิน
   */
  async checkPaymentStatus(invoiceId) {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        return { status: 'not_found' };
      }
      
      const receipts = await this.getCollectionReceipts(invoice.collectionId, {
        invoiceId: invoiceId
      });
      
      return {
        status: invoice.status,
        invoice: invoice,
        receipts: receipts,
        totalPaid: receipts.reduce((sum, rec) => sum + (rec.amount || 0), 0),
        amountDue: (invoice.totalAmount || invoice.amount || 0) - receipts.reduce((sum, rec) => sum + (rec.amount || 0), 0)
      };
      
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * ค้นหาเอกสารที่เกี่ยวข้อง
   */
  async findRelatedDocuments(documentId, documentType) {
    try {
      const related = {
        invoices: [],
        receipts: [],
        subscriptions: []
      };
      
      if (documentType === 'invoice') {
        // Find receipts for this invoice
        const receipts = await this.apiRequest.aggregateCall('receipt', [
          { $match: { invoiceId: documentId } }
        ]);
        related.receipts = receipts || [];
        
        // Find subscription
        const invoice = await this.getInvoiceById(documentId);
        if (invoice && invoice.subscriptionId) {
          related.subscriptions.push({ _id: invoice.subscriptionId });
        }
      } else if (documentType === 'receipt') {
        // Find invoice for this receipt
        const receipt = await this.getReceiptById(documentId);
        if (receipt && receipt.invoiceId) {
          const invoice = await this.getInvoiceById(receipt.invoiceId);
          if (invoice) {
            related.invoices.push(invoice);
          }
        }
      }
      
      return related;
      
    } catch (error) {
      console.error('❌ Error finding related documents:', error);
      return { invoices: [], receipts: [], subscriptions: [] };
    }
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * ล้าง cache สำหรับ collection
   */
  clearCacheForCollection(collectionId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(collectionId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * ล้าง cache ทั้งหมด
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * ตรวจสอบสถานะ cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default FinanceService; 
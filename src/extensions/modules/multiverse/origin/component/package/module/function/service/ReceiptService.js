/**
 * ReceiptService - Pure CRUD operations for Receipt data
 * 
 * ⚡ This service contains ONLY CRUD operations
 * 🚫 NO business logic or complex flows
 * ✅ Use ServiceManager for orchestrating business flows
 */

import ApiRequest from '@/plugins/apiRequest.js';

class ReceiptService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes (shorter for financial data)
  }

  /**
   * 📝 CREATE: สร้าง Receipt ใหม่
   */
  async create(receiptData) {
    try {
      console.log('ReceiptService.create():', receiptData);

      const receipt = {
        ...receiptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.create('receipt', receipt);
      
      if (result) {
        console.log('✅ Receipt created:', result._id);
        this.clearCacheForCollection(receiptData.collectionId);
        return result;
      } else {
        throw new Error('Failed to create receipt');
      }
    } catch (error) {
      console.error('❌ ReceiptService.create() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงข้อมูล Receipt ตาม ID
   */
  async getById(receiptId) {
    try {
      const cacheKey = `receipt_${receiptId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log('ReceiptService.getById():', receiptId);
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
      console.error('❌ ReceiptService.getById() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Receipt ทั้งหมดของ Collection
   */
  async getAllByCollectionId(collectionId, options = {}) {
    try {
      const cacheKey = `receipt_collection_${collectionId}_${JSON.stringify(options)}`;
      
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
        { $sort: { createdAt: -1 } }
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

      console.log('✅ ReceiptService.getAllByCollectionId():', receipts?.length || 0);
      return receipts || [];
    } catch (error) {
      console.error('❌ ReceiptService.getAllByCollectionId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Receipt ตาม Invoice ID
   */
  async getAllByInvoiceId(invoiceId) {
    try {
      const pipeline = [
        { $match: { invoiceId: invoiceId } },
        { $sort: { createdAt: -1 } }
      ];

      const receipts = await this.apiRequest.aggregateCall('receipt', pipeline);
      console.log('✅ ReceiptService.getAllByInvoiceId():', receipts?.length || 0);
      return receipts || [];
    } catch (error) {
      console.error('❌ ReceiptService.getAllByInvoiceId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Receipt ตาม Subscription ID
   */
  async getBySubscriptionId(subscriptionId) {
    try {
      const cacheKey = `receipt_subscription_${subscriptionId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const pipeline = [
        { $match: { subscriptionId: subscriptionId } },
        { $sort: { createdAt: -1 } }
      ];

      const receipts = await this.apiRequest.aggregateCall('receipt', pipeline);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: receipts || [],
        timestamp: Date.now()
      });

      console.log('✅ ReceiptService.getBySubscriptionId():', receipts?.length || 0);
      return receipts || [];
    } catch (error) {
      console.error('❌ ReceiptService.getBySubscriptionId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Receipt ตาม Subscription ID (Alias for backward compatibility)
   */
  async getAllBySubscriptionId(subscriptionId) {
    return this.getBySubscriptionId(subscriptionId);
  }

  /**
   * ✏️ UPDATE: อัปเดต Receipt
   */
  async update(receiptId, updateData) {
    try {
      console.log('ReceiptService.update():', receiptId, updateData);

      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.update('receipt', receiptId, updates);
      
      if (result) {
        console.log('✅ Receipt updated:', receiptId);
        this.clearAllCaches();
        return result;
      } else {
        throw new Error('Failed to update receipt');
      }
    } catch (error) {
      console.error('❌ ReceiptService.update() error:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DELETE: ลบ Receipt
   */
  async delete(receiptId) {
    try {
      console.log('ReceiptService.delete():', receiptId);

      const result = await this.apiRequest.delete('receipt', receiptId);
      this.clearAllCaches();

      console.log('✅ Receipt deleted:', receiptId);
      return result;
    } catch (error) {
      console.error('❌ ReceiptService.delete() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 SEARCH: ค้นหา Receipt ตามเงื่อนไข
   */
  async search(searchCriteria) {
    try {
      console.log('ReceiptService.search():', searchCriteria);

      const pipeline = [
        { $match: searchCriteria },
        { $sort: { createdAt: -1 } }
      ];

      const receipts = await this.apiRequest.aggregateCall('receipt', pipeline);
      console.log('✅ ReceiptService.search() found:', receipts?.length || 0);
      return receipts || [];
    } catch (error) {
      console.error('❌ ReceiptService.search() error:', error);
      return [];
    }
  }

  /**
   * 📊 READ: ดึงสถิติ Receipt
   */
  async getStats(collectionId) {
    try {
      const pipeline = [
        { $match: { collectionId: collectionId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ];

      const stats = await this.apiRequest.aggregateCall('receipt', pipeline);
      console.log('✅ ReceiptService.getStats():', stats);
      return stats || [];
    } catch (error) {
      console.error('❌ ReceiptService.getStats() error:', error);
      return [];
    }
  }

  /**
   * 🧹 UTILITY: Clear cache methods
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

  clearAllCaches() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * 🧹 UTILITY: Clear cache method
   */
  clearCache() {
    this.cache.clear();
  }
}

export default ReceiptService; 
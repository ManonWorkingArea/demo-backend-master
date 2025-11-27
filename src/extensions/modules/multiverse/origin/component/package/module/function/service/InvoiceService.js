/**
 * InvoiceService - Pure CRUD operations for Invoice data
 * 
 * ⚡ This service contains ONLY CRUD operations
 * 🚫 NO business logic or complex flows
 * ✅ Use ServiceManager for orchestrating business flows
 */

import ApiRequest from '@/plugins/apiRequest.js';

class InvoiceService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes (shorter for financial data)
  }

  /**
   * 📝 CREATE: สร้าง Invoice ใหม่
   */
  async create(invoiceData) {
    try {
      console.log('InvoiceService.create():', invoiceData);

      const invoice = {
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.create('invoice', invoice);
      
      if (result) {
        console.log('✅ Invoice created:', result._id);
        this.clearCacheForCollection(invoiceData.collectionId);
        return result;
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('❌ InvoiceService.create() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงข้อมูล Invoice ตาม ID
   */
  async getById(invoiceId) {
    try {
      const cacheKey = `invoice_${invoiceId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log('InvoiceService.getById():', invoiceId);
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
      console.error('❌ InvoiceService.getById() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Invoice ทั้งหมดของ Collection
   */
  async getAllByCollectionId(collectionId, options = {}) {
    try {
      const cacheKey = `invoice_collection_${collectionId}_${JSON.stringify(options)}`;
      
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
        { $sort: { createdAt: -1 } }
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

      console.log('✅ InvoiceService.getAllByCollectionId():', invoices?.length || 0);
      return invoices || [];
    } catch (error) {
      console.error('❌ InvoiceService.getAllByCollectionId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Invoice ตาม Subscription ID
   */
  async getBySubscriptionId(subscriptionId) {
    try {
      const cacheKey = `invoice_subscription_${subscriptionId}`;
      
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

      const invoices = await this.apiRequest.aggregateCall('invoice', pipeline);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: invoices || [],
        timestamp: Date.now()
      });

      console.log('✅ InvoiceService.getBySubscriptionId():', invoices?.length || 0);
      return invoices || [];
    } catch (error) {
      console.error('❌ InvoiceService.getBySubscriptionId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Invoice ตาม Subscription ID (Alias for backward compatibility)
   */
  async getAllBySubscriptionId(subscriptionId) {
    return this.getBySubscriptionId(subscriptionId);
  }

  /**
   * ✏️ UPDATE: อัปเดต Invoice
   */
  async update(invoiceId, updateData) {
    try {
      console.log('InvoiceService.update():', invoiceId, updateData);

      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.update('invoice', invoiceId, updates);
      
      if (result) {
        console.log('✅ Invoice updated:', invoiceId);
        this.clearAllCaches();
        return result;
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (error) {
      console.error('❌ InvoiceService.update() error:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DELETE: ลบ Invoice
   */
  async delete(invoiceId) {
    try {
      console.log('InvoiceService.delete():', invoiceId);

      const result = await this.apiRequest.delete('invoice', invoiceId);

      console.log('✅ Invoice deleted:', invoiceId);
      this.clearAllCaches();
      return result;
    } catch (error) {
      console.error('❌ InvoiceService.delete() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 SEARCH: ค้นหา Invoice ตามเงื่อนไข
   */
  async search(searchCriteria) {
    try {
      console.log('InvoiceService.search():', searchCriteria);

      const pipeline = [
        { $match: searchCriteria },
        { $sort: { createdAt: -1 } }
      ];

      const invoices = await this.apiRequest.aggregateCall('invoice', pipeline);
      console.log('✅ InvoiceService.search() found:', invoices?.length || 0);
      return invoices || [];
    } catch (error) {
      console.error('❌ InvoiceService.search() error:', error);
      return [];
    }
  }

  /**
   * 📊 READ: ดึงสถิติ Invoice
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

      const stats = await this.apiRequest.aggregateCall('invoice', pipeline);
      console.log('✅ InvoiceService.getStats():', stats);
      return stats || [];
    } catch (error) {
      console.error('❌ InvoiceService.getStats() error:', error);
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


}

export default InvoiceService; 
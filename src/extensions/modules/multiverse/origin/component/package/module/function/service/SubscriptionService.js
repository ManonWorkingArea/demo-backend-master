/**
 * SubscriptionService - Pure CRUD operations for Subscription data
 * 
 * ⚡ This service contains ONLY CRUD operations
 * 🚫 NO business logic or complex flows
 * ✅ Use ServiceManager for orchestrating business flows
 */

import ApiRequest from '@/plugins/apiRequest.js';

class SubscriptionService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * 📝 CREATE: สร้าง Subscription ใหม่
   */
  async create(subscriptionData) {
    try {
      console.log('SubscriptionService.create():', subscriptionData);

      const subscription = {
        ...subscriptionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.create('subscription', subscription);
      
      if (result) {
        console.log('✅ Subscription created:', result._id);
        this.clearCacheForCollection(subscriptionData.collectionId);
        return result;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('❌ SubscriptionService.create() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงข้อมูล Subscription ตาม ID
   */
  async getById(subscriptionId) {
    try {
      console.log('SubscriptionService.getById():', subscriptionId);
      return await this.apiRequest.getById('subscription', subscriptionId);
    } catch (error) {
      console.error('❌ SubscriptionService.getById() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึง Subscription ที่ active สำหรับ Collection
   */
  async getActiveByCollectionId(collectionId) {
    try {
      const cacheKey = `subscription_active_${collectionId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const pipeline = [
        { $match: { collectionId: collectionId, status: 'active' } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
      ];

      const subscriptions = await this.apiRequest.aggregateCall('subscription', pipeline);
      const subscription = subscriptions.length > 0 ? subscriptions[0] : null;

      // Cache result
      this.cache.set(cacheKey, {
        data: subscription,
        timestamp: Date.now()
      });

      console.log('✅ SubscriptionService.getActiveByCollectionId():', subscription?._id);
      return subscription;
    } catch (error) {
      console.error('❌ SubscriptionService.getActiveByCollectionId() error:', error);
      return null;
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Subscription ทั้งหมดของ Collection
   */
  async getAllByCollectionId(collectionId, options = {}) {
    try {
      const pipeline = [
        { $match: { collectionId: collectionId } },
        { $sort: { createdAt: -1 } }
      ];

      // Add status filter if specified
      if (options.status) {
        pipeline[0].$match.status = options.status;
      }

      // Add limit if specified
      if (options.limit) {
        pipeline.push({ $limit: options.limit });
      }

      const subscriptions = await this.apiRequest.aggregateCall('subscription', pipeline);
      console.log('✅ SubscriptionService.getAllByCollectionId():', subscriptions.length);
      return subscriptions;
    } catch (error) {
      console.error('❌ SubscriptionService.getAllByCollectionId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึง Subscription ตาม Contract ID
   */
  async getByContractId(contractId) {
    try {
      const cacheKey = `subscription_contract_${contractId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const pipeline = [
        { $match: { contractId: contractId } },
        { $sort: { periodNumber: 1, createdAt: -1 } }
      ];

      const subscriptions = await this.apiRequest.aggregateCall('subscription', pipeline);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: subscriptions,
        timestamp: Date.now()
      });

      console.log('✅ SubscriptionService.getByContractId():', subscriptions.length);
      return subscriptions;
    } catch (error) {
      console.error('❌ SubscriptionService.getByContractId() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึง Subscription ตาม Contract ID (Alias for backward compatibility)
   */
  async getAllByContractId(contractId) {
    return this.getByContractId(contractId);
  }

  /**
   * ✏️ UPDATE: อัปเดต Subscription
   */
  async update(subscriptionId, updateData) {
    try {
      console.log('SubscriptionService.update():', subscriptionId, updateData);

      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.update('subscription', subscriptionId, updates);
      
      if (result) {
        console.log('✅ Subscription updated:', subscriptionId);
        this.clearAllCaches();
        return result;
      } else {
        throw new Error('Failed to update subscription');
      }
    } catch (error) {
      console.error('❌ SubscriptionService.update() error:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DELETE: ลบ Subscription
   */
  async delete(subscriptionId) {
    try {
      console.log('SubscriptionService.delete():', subscriptionId);

      const result = await this.apiRequest.delete('subscription', subscriptionId);

      console.log('✅ Subscription deleted:', subscriptionId);
      this.clearAllCaches();
      return result;
    } catch (error) {
      console.error('❌ SubscriptionService.delete() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 SEARCH: ค้นหา Subscription ตามเงื่อนไข
   */
  async search(searchCriteria) {
    try {
      console.log('SubscriptionService.search():', searchCriteria);

      const pipeline = [
        { $match: searchCriteria },
        { $sort: { createdAt: -1 } }
      ];

      const subscriptions = await this.apiRequest.aggregateCall('subscription', pipeline);
      console.log('✅ SubscriptionService.search() found:', subscriptions.length);
      return subscriptions;
    } catch (error) {
      console.error('❌ SubscriptionService.search() error:', error);
      return [];
    }
  }

  /**
   * 📊 READ: ดึงสถิติ Subscription
   */
  async getStats(collectionId) {
    try {
      const pipeline = [
        { $match: { collectionId: collectionId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$basePrice' }
          }
        }
      ];

      const stats = await this.apiRequest.aggregateCall('subscription', pipeline);
      console.log('✅ SubscriptionService.getStats():', stats);
      return stats;
    } catch (error) {
      console.error('❌ SubscriptionService.getStats() error:', error);
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

export default SubscriptionService; 
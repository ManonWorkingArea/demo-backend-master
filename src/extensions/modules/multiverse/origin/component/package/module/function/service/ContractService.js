/**
 * ContractService - Pure CRUD operations for Contract data
 * 
 * ⚡ This service contains ONLY CRUD operations
 * 🚫 NO business logic or complex flows
 * ✅ Use ServiceManager for orchestrating business flows
 */

import ApiRequest from '@/plugins/apiRequest.js';

class ContractService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * 📝 CREATE: สร้าง Contract ใหม่
   */
  async create(contractData) {
    try {
      console.log('ContractService.create():', contractData);

      const contract = {
        ...contractData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.create('contract', contract);
      
      if (result) {
        console.log('✅ Contract created:', result._id);
        this.clearCacheForCollection(contractData.collectionId);
        return result;
      } else {
        throw new Error('Failed to create contract');
      }
    } catch (error) {
      console.error('❌ ContractService.create() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงข้อมูล Contract ตาม ID
   */
  async getById(contractId) {
    try {
      console.log('ContractService.getById():', contractId);
      return await this.apiRequest.getById('contract', contractId);
    } catch (error) {
      console.error('❌ ContractService.getById() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ค้นหา Contract ของ Collection (with cache)
   */
  async getByCollectionId(collectionId) {
    try {
      const cacheKey = `contract_collection_${collectionId}`;
      
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

      const contracts = await this.apiRequest.aggregateCall('contract', pipeline);
      const contract = contracts.length > 0 ? contracts[0] : null;

      // Cache result
      this.cache.set(cacheKey, {
        data: contract,
        timestamp: Date.now()
      });

      console.log('✅ ContractService.getByCollectionId():', contract?._id);
      return contract;
    } catch (error) {
      console.error('❌ ContractService.getByCollectionId() error:', error);
      return null;
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Contract ทั้งหมดของ Collection
   */
  async getAllByCollectionId(collectionId) {
    try {
      const pipeline = [
        { $match: { collectionId: collectionId } },
        { $sort: { createdAt: -1 } }
      ];

      const contracts = await this.apiRequest.aggregateCall('contract', pipeline);
      console.log('✅ ContractService.getAllByCollectionId():', contracts.length);
      return contracts;
    } catch (error) {
      console.error('❌ ContractService.getAllByCollectionId() error:', error);
      return [];
    }
  }

  /**
   * ✏️ UPDATE: อัปเดต Contract
   */
  async update(contractId, updateData) {
    try {
      console.log('ContractService.update():', contractId, updateData);

      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.update('contract', contractId, updates);
      
      if (result) {
        console.log('✅ Contract updated:', contractId);
        this.clearAllCaches();
        return result;
      } else {
        throw new Error('Failed to update contract');
      }
    } catch (error) {
      console.error('❌ ContractService.update() error:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DELETE: ลบ Contract
   */
  async delete(contractId) {
    try {
      console.log('ContractService.delete():', contractId);

      const result = await this.apiRequest.delete('contract', contractId);

      console.log('✅ Contract deleted:', contractId);
      this.clearAllCaches();
      return result;
    } catch (error) {
      console.error('❌ ContractService.delete() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 SEARCH: ค้นหา Contract ตามเงื่อนไข
   */
  async search(searchCriteria) {
    try {
      console.log('ContractService.search():', searchCriteria);

      const pipeline = [
        { $match: searchCriteria },
        { $sort: { createdAt: -1 } }
      ];

      const contracts = await this.apiRequest.aggregateCall('contract', pipeline);
      console.log('✅ ContractService.search() found:', contracts.length);
      return contracts;
    } catch (error) {
      console.error('❌ ContractService.search() error:', error);
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

export default ContractService; 
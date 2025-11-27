/**
 * CollectionService - Collection Data Management
 * 
 * 🎯 This service handles collection information from hostname endpoint
 * ✅ Provides collection data for ownership and package management
 * 🔧 Supports caching and error handling
 * 📊 Integrates with hostname-based collection storage
 */

import ApiRequest from '@/plugins/apiRequest.js';
import InputValidator from '../utils/InputValidator.js';
import ErrorHandler from '../utils/ErrorHandler.js';

class CollectionService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // ===== 📊 COLLECTION DATA RETRIEVAL METHODS =====

  /**
   * 📊 ดึงข้อมูล Collection จาก hostname
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ข้อมูล Collection
   */
  async getCollectionById(collectionId) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        // Input validation
        const validation = InputValidator.validateObjectId(collectionId, 'Collection ID');
        if (!validation.isValid) {
          throw ErrorHandler.createValidationError(validation.error, { 
            field: 'collectionId', 
            code: validation.code 
          });
        }

        // Check cache first
        const cacheKey = `collection_${collectionId}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          return cached;
        }

        // Get collection data from hostname endpoint
        const collections = await this.apiRequest.getById('hostname', collectionId);
        
        if (!collections || collections.length === 0) {
          throw ErrorHandler.createNotFoundError('Collection', collectionId);
        }

        const collectionData = collections[0];
        
        // Cache the result
        this.setCachedData(cacheKey, collectionData);
        
        return collectionData;
      },
      {
        context: { operation: 'getCollectionById', collectionId },
        maxRetries: 2,
        fallback: null
      }
    );
  }

  /**
   * 📊 ดึงข้อมูล Collection หลายตัวพร้อมกัน
   * @param {string[]} collectionIds - Array ของ Collection IDs
   * @returns {Promise<Object[]>} Array ของข้อมูล Collection
   */
  async getCollectionsByIds(collectionIds) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        // Input validation
        if (!Array.isArray(collectionIds)) {
          throw ErrorHandler.createValidationError('Collection IDs ต้องเป็น array');
        }

        if (collectionIds.length === 0) {
          return [];
        }

        // Validate each ID
        for (const id of collectionIds) {
          const validation = InputValidator.validateObjectId(id, 'Collection ID');
          if (!validation.isValid) {
            throw ErrorHandler.createValidationError(
              `Invalid Collection ID: ${id} - ${validation.error}`,
              { field: 'collectionIds', invalidId: id }
            );
          }
        }

        const collections = [];
        const errors = [];
        
        // Get each collection (with caching support)
        for (const collectionId of collectionIds) {
          try {
            const result = await this.getCollectionById(collectionId);
            if (result.success && result.data) {
              collections.push(result.data);
            }
          } catch (error) {
            errors.push({ collectionId, error: error.message });
          }
        }

        return {
          collections,
          totalRequested: collectionIds.length,
          totalFound: collections.length,
          errors: errors.length > 0 ? errors : undefined
        };
      },
      {
        context: { operation: 'getCollectionsByIds', count: collectionIds.length },
        fallback: { collections: [], totalRequested: collectionIds.length, totalFound: 0 }
      }
    );
  }

  /**
   * 📊 ดึงข้อมูล Collection พร้อมข้อมูลเจ้าของ
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ข้อมูล Collection พร้อม ownership info
   */
  async getCollectionWithOwnership(collectionId) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        const collectionResult = await this.getCollectionById(collectionId);
        
        if (!collectionResult.success || !collectionResult.data) {
          throw ErrorHandler.createNotFoundError('Collection', collectionId);
        }

        const collection = collectionResult.data;
        
        // Add ownership information structure
        return {
          ...collection,
          ownershipInfo: null,
          hasOwnership: !!collection.ownerId
        };
      },
      {
        context: { operation: 'getCollectionWithOwnership', collectionId },
        fallback: null
      }
    );
  }

  /**
   * 📊 ค้นหา Collection ตาม hostname
   * @param {string} hostname - Hostname to search for
   * @returns {Promise<Object>} ข้อมูล Collection
   */
  async getCollectionByHostname(hostname) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        // Input validation
        const validation = InputValidator.validateRequiredString(hostname, 'Hostname');
        if (!validation.isValid) {
          throw ErrorHandler.createValidationError(validation.error);
        }

        // Check cache first
        const cacheKey = `collection_hostname_${hostname}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
          return cached;
        }

        // Get collection data by hostname
        const collections = await this.apiRequest.aggregateCall('hostname', [
          { $match: { hostname: hostname } }
        ]);
        
        if (!collections || collections.length === 0) {
          throw ErrorHandler.createNotFoundError('Collection by hostname', hostname);
        }

        const collectionData = collections[0];
        
        // Cache the result
        this.setCachedData(cacheKey, collectionData);
        
        return collectionData;
      },
      {
        context: { operation: 'getCollectionByHostname', hostname },
        maxRetries: 2,
        fallback: null
      }
    );
  }

  /**
   * 📊 ดึงรายการ Collection ทั้งหมดที่มี package
   * @returns {Promise<Object[]>} Array ของ Collection ที่มี package
   */
  async getCollectionsWithPackages() {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        // Get all hostname records that have packageId
        const collections = await this.apiRequest.aggregateCall('hostname', [
          { $match: { packageId: { $exists: true, $ne: null } } }
        ]);
        
        return collections || [];
      },
      {
        context: { operation: 'getCollectionsWithPackages' },
        fallback: []
      }
    );
  }

  /**
   * 🔄 อัปเดตข้อมูล Collection
   * @param {string} collectionId - Collection ID
   * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
   * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
   */
  async updateCollection(collectionId, updateData) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        // Input validation
        const idValidation = InputValidator.validateObjectId(collectionId, 'Collection ID');
        if (!idValidation.isValid) {
          throw ErrorHandler.createValidationError(idValidation.error);
        }

        if (!updateData || typeof updateData !== 'object') {
          throw ErrorHandler.createValidationError('Update data ต้องเป็น object');
        }

        if (Object.keys(updateData).length === 0) {
          throw ErrorHandler.createValidationError('Update data ไม่สามารถเป็นค่าว่างได้');
        }

        // Validate specific fields if they exist
        if (updateData.hostname) {
          const hostnameValidation = InputValidator.validateRequiredString(updateData.hostname, 'Hostname');
          if (!hostnameValidation.isValid) {
            throw ErrorHandler.createValidationError(hostnameValidation.error);
          }
        }

        if (updateData.packageId) {
          const packageValidation = InputValidator.validateObjectId(updateData.packageId, 'Package ID');
          if (!packageValidation.isValid) {
            throw ErrorHandler.createValidationError(packageValidation.error);
          }
        }

        // Add timestamp
        const finalUpdateData = {
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        // Update the collection
        const result = await this.apiRequest.update('hostname', collectionId, finalUpdateData);
        
        // Clear related caches
        this.clearCacheForCollection(collectionId);
        
        return result;
      },
      {
        context: { operation: 'updateCollection', collectionId },
        fallback: null
      }
    );
  }

  /**
   * 📋 ตรวจสอบสถานะ Collection
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} สถานะ Collection
   */
  async getCollectionStatus(collectionId) {
    return await ErrorHandler.handleAsyncOperation(
      async () => {
        const collectionResult = await this.getCollectionById(collectionId);
        
        if (!collectionResult.success || !collectionResult.data) {
          throw ErrorHandler.createNotFoundError('Collection', collectionId);
        }

        const collection = collectionResult.data;
        
        // Determine collection status
        const status = {
          id: collection._id,
          hostname: collection.hostname,
          siteName: collection.siteName || 'ไม่ระบุ',
          siteType: collection.siteType || 'unknown',
          
          // Ownership status
          hasOwner: !!collection.ownerId,
          ownerId: collection.ownerId || null,
          
          // Package status
          hasPackage: !!collection.packageId,
          packageId: collection.packageId || null,
          
          // Activity status
          isActive: collection.status !== 'inactive',
          status: collection.status || 'unknown',
          
          // Timestamps
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          
          // Overall health
          isHealthy: !!(collection.ownerId && collection.packageId && collection.status !== 'inactive'),
          
          // Warnings
          warnings: []
        };
        
        // Add warnings
        if (!status.hasOwner) {
          status.warnings.push('ไม่มีข้อมูลเจ้าของ');
        }
        
        if (!status.hasPackage) {
          status.warnings.push('ไม่มี Package');
        }
        
        if (!status.isActive) {
          status.warnings.push('สถานะไม่ active');
        }
        
        return status;
      },
      {
        context: { operation: 'getCollectionStatus', collectionId },
        fallback: {
          id: collectionId,
          isHealthy: false,
          warnings: ['ไม่สามารถตรวจสอบสถานะได้']
        }
      }
    );
  }

  // ===== 🗄️ CACHE MANAGEMENT METHODS =====

  /**
   * 🗄️ ดึงข้อมูลจาก cache
   * @param {string} key - Cache key
   * @returns {Object|null} ข้อมูลจาก cache หรือ null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * 🗄️ บันทึกข้อมูลลง cache
   * @param {string} key - Cache key
   * @param {Object} data - ข้อมูลที่ต้องการ cache
   */
  setCachedData(key, data) {
    const expiry = Date.now() + this.cacheExpiry;
    this.cache.set(key, { data, expiry });
  }

  /**
   * 🧹 ล้าง cache สำหรับ collection เฉพาะ
   * @param {string} collectionId - Collection ID
   */
  clearCacheForCollection(collectionId) {
    const keysToDelete = [];
    
    for (const [key] of this.cache) {
      if (key.includes(collectionId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 🧹 ล้าง cache ทั้งหมด
   */
  clearAllCaches() {
    this.cache.clear();
  }

  /**
   * 📊 สถิติ cache
   * @returns {Object} สถิติการใช้งาน cache
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [, cached] of this.cache) {
      if (now > cached.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / Math.max(this.cache.size, 1),
      cacheExpiry: this.cacheExpiry
    };
  }
}

export default CollectionService; 
// Collection Service - จัดการ API calls และ business logic
// See CollectionService.md for complete API documentation and guidelines
import ApiRequest from '@/plugins/apiRequest.js';
import OwnershipService from './OwnershipService.js';

class CollectionService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.baseUrl = 'https://gateway.cloudrestfulapi.com/api';
    
    // Initialize API request handler
    this.apiRequest = new ApiRequest(hostkey, this.baseUrl);
    
    this.ownershipService = new OwnershipService(hostkey);
    this.cache = {
      collections: null,
      assets: new Map(),
      lastFetch: null
    };
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 นาที
  }

  // ตรวจสอบว่า cache ยังใช้ได้อยู่ไหม
  isCacheValid() {
    return this.cache.lastFetch && 
           (Date.now() - this.cache.lastFetch) < this.CACHE_DURATION;
  }

  /**
   * API method delegates - forward to ApiRequest instance
   */
  async apiCall(endpoint, methodOrOptions = {}, collection = null, body = null) {
    return await this.apiRequest.apiCall(endpoint, methodOrOptions, collection, body);
  }

  async aggregateCall(collection, pipeline) {
    return await this.apiRequest.aggregateCall(collection, pipeline);
  }

  async getById(collection, id) {
    return await this.apiRequest.getById(collection, id);
  }

  async create(collection, data) {
    return await this.apiRequest.create(collection, data);
  }

  async update(collection, id, data) {
    return await this.apiRequest.update(collection, id, data);
  }

  async delete(collection, id) {
    return await this.apiRequest.delete(collection, id);
  }

  // ดึงข้อมูล Collections พร้อม Assets count และ Package data
  async getCollectionsWithAssets() {
    try {
      // ใช้ cache ถ้ายังใหม่อยู่
      if (this.isCacheValid() && this.cache.collections) {
        return this.cache.collections;
      }

      // ดึงข้อมูล Collections
      const collections = await this.fetchCollections();
      
      // ดึงข้อมูล Assets ทั้งหมดในครั้งเดียว (แทนที่จะทีละ collection)
      const allAssets = await this.fetchAllAssets();
      
      // ดึงข้อมูล Packages ทั้งหมด
      const allPackages = await this.fetchAllPackages();
      
      // ดึงข้อมูลเจ้าของสำหรับ Collections ที่มี ownerId
      const ownerIds = collections
        .filter(collection => collection.ownerId)
        .map(collection => collection.ownerId);
      
      let ownersData = [];
      if (ownerIds.length > 0) {
        const ownersResult = await this.ownershipService.getOwnersByIds(ownerIds);
        if (ownersResult.success) {
          ownersData = ownersResult.data;
        }
      }

      // นับ Assets, เพิ่ม Package info และ Ownership info สำหรับแต่ละ Collection
      const collectionsWithData = collections.map(collection => {
        const assetsCount = allAssets.filter(asset => asset.parent === collection._id).length;
        const packageInfo = allPackages.find(pkg => pkg._id === collection.packageId);
        const ownershipInfo = ownersData.find(owner => owner._id === collection.ownerId);
        
        return {
          ...collection,
          assetsCount,
          package: packageInfo || null,
          ownershipInfo: ownershipInfo || null
        };
      });

      // บันทึก cache
      this.cache.collections = collectionsWithData;
      this.cache.lastFetch = Date.now();

      return collectionsWithData;
    } catch (error) {
      console.error('Error fetching collections with assets:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Collections
  async fetchCollections() {
    const pipeline = [
      {
        $match: { siteType: 'collection' }
      },
      {
        $sort: { createdAt: -1, siteName: 1 }
      }
    ];

    return await this.aggregateCall('hostname', pipeline);
  }

  // ดึงข้อมูล Assets ทั้งหมดในครั้งเดียว
  async fetchAllAssets() {
    const pipeline = [
      {
        $match: { siteType: 'asset' }
      },
      {
        $sort: { parent: 1, createdAt: -1 }
      }
    ];

    return await this.aggregateCall('hostname', pipeline);
  }

  // ดึงข้อมูล Packages ทั้งหมด
  async fetchAllPackages() {
    try {
      const pipeline = [
        {
          $match: { status: true }
        },
        {
          $sort: { order: 1, name: 1 }
        }
      ];

             // Use separate ApiRequest instance for package collection
       const ApiRequest = (await import('@/plugins/apiRequest.js')).default;
       const packageApiRequest = new ApiRequest(this.hostkey, 'https://gateway.cloudrestfulapi.com/api');
      return await packageApiRequest.aggregateCall('package', pipeline);
    } catch (error) {
      console.error('Error fetching packages:', error);
      return []; // Return empty array if packages can't be fetched
    }
  }

  // ลบ Collection
  async deleteCollection(id) {
    try {
      const result = await this.delete('hostname', id);
      
      // ล้าง cache หลังจากลบ
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Assets ของ Collection เฉพาะ
  async getAssetsByCollection(collectionId) {
    try {
      // ตรวจสอบ cache ก่อน
      if (this.cache.assets.has(collectionId)) {
        return this.cache.assets.get(collectionId);
      }

      const pipeline = [
        {
          $match: {
            $and: [
              { siteType: 'asset' },
              { parent: collectionId }
            ]
          }
        },
        {
          $sort: { createdAt: -1, siteName: 1 }
        }
      ];

      const assets = await this.aggregateCall('hostname', pipeline);
      
      // บันทึก cache
      this.cache.assets.set(collectionId, assets);
      
      return assets;
    } catch (error) {
      console.error('Error fetching assets for collection:', collectionId, error);
      throw error;
    }
  }

  // ล้าง cache
  clearCache() {
    this.cache.collections = null;
    this.cache.assets.clear();
    this.cache.lastFetch = null;
    this.ownershipService.clearCache();
  }

  // อัพเดท Collection ให้ผูกกับ Owner
  async assignOwnerToCollection(collectionId, ownerId) {
    try {
      const result = await this.update('hostname', collectionId, {
        data: {
          ownerId: ownerId,
          updatedAt: new Date().toISOString()
        }
      });

      // ล้าง cache
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error assigning owner to collection:', error);
      throw error;
    }
  }

  // ลบการผูก Owner จาก Collection
  async removeOwnerFromCollection(collectionId) {
    try {
      const result = await this.update('hostname', collectionId, {
        data: {
          ownerId: null,
          updatedAt: new Date().toISOString()
        }
      });

      // ล้าง cache
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error removing owner from collection:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Collection พร้อม Ownership แบบเจาะจง
  async getCollectionWithOwnership(collectionId) {
    try {
      const collection = await this.getById('hostname', collectionId);
      
      // ดึงข้อมูลเจ้าของถ้ามี
      if (collection.ownerId) {
        const ownerResult = await this.ownershipService.getOwnerById(collection.ownerId);
        if (ownerResult.success) {
          collection.ownershipInfo = ownerResult.data;
        }
      }

      return collection;
    } catch (error) {
      console.error('Error fetching collection with ownership:', error);
      throw error;
    }
  }

  // Refresh cache โดยบังคับ
  async refreshData() {
    this.clearCache();
    return await this.getCollectionsWithAssets();
  }

  // ตรวจสอบ Package limits
  async validatePackageLimits(collectionId, type = 'asset') {
    try {
      // ดึงข้อมูล Collection และ Package
      const collections = await this.getCollectionsWithAssets();
      const collection = collections.find(c => c._id === collectionId);
      
      if (!collection || !collection.package) {
        throw new Error('Collection หรือ Package ไม่พบ');
      }

      const packageLimits = collection.package.limits;
      const currentCounts = {
        assets: collection.assetsCount || 0,
        users: await this.getUserCount(collectionId)
      };

      // ตรวจสอบ limits
      const validation = {
        isValid: true,
        message: '',
        limits: packageLimits,
        current: currentCounts
      };

      if (type === 'asset' && packageLimits.maxAssets) {
        if (currentCounts.assets >= packageLimits.maxAssets) {
          validation.isValid = false;
          validation.message = `ไม่สามารถเพิ่ม Asset ได้ เนื่องจากเกินขีดจำกัด (${currentCounts.assets}/${packageLimits.maxAssets})`;
        }
      }

      if (type === 'user' && packageLimits.maxUsers) {
        if (currentCounts.users >= packageLimits.maxUsers) {
          validation.isValid = false;
          validation.message = `ไม่สามารถเพิ่ม User ได้ เนื่องจากเกินขีดจำกัด (${currentCounts.users}/${packageLimits.maxUsers})`;
        }
      }

      return validation;
    } catch (error) {
      console.error('Error validating package limits:', error);
      throw error;
    }
  }

  // ดึงจำนวน Users ใน Collection
  async getUserCount(collectionId) {
    try {
      const pipeline = [
        {
          $match: {
            collection: { $in: [collectionId] }
          }
        },
        {
          $count: "userCount"
        }
      ];

             // Use separate ApiRequest instance for user collection
       const ApiRequest = (await import('@/plugins/apiRequest.js')).default;
       const userApiRequest = new ApiRequest(this.hostkey, 'https://gateway.cloudrestfulapi.com/api');
      const result = await userApiRequest.aggregateCall('user', pipeline);
      
      return result && result.length > 0 ? result[0].userCount : 0;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }

  // ตรวจสอบ Storage usage
  async validateStorageLimits(collectionId, additionalSizeGB = 0) {
    try {
      const collections = await this.getCollectionsWithAssets();
      const collection = collections.find(c => c._id === collectionId);
      
      if (!collection || !collection.package) {
        throw new Error('Collection หรือ Package ไม่พบ');
      }

      const storageLimit = collection.package.limits.storageGB;
      if (!storageLimit) {
        return { isValid: true, message: 'ไม่มีขีดจำกัด Storage' };
      }

      // ดึงข้อมูล Storage usage ปัจจุบัน
      const currentUsage = await this.getStorageUsage(collectionId);
      const totalUsage = currentUsage + additionalSizeGB;

      const validation = {
        isValid: totalUsage <= storageLimit,
        message: totalUsage > storageLimit ? 
          `ไม่สามารถใช้ Storage ได้ เนื่องจากเกินขีดจำกัด (${totalUsage.toFixed(2)}/${storageLimit} GB)` : 
          `Storage ใช้งานได้ (${totalUsage.toFixed(2)}/${storageLimit} GB)`,
        limits: { storageGB: storageLimit },
        current: { storageGB: currentUsage },
        additional: additionalSizeGB
      };

      return validation;
    } catch (error) {
      console.error('Error validating storage limits:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Storage usage
  async getStorageUsage(collectionId) {
    try {
      const pipeline = [
        {
          $match: {
            parent: collectionId
          }
        },
        {
          $group: {
            _id: null,
            totalSize: { $sum: "$size" }
          }
        }
      ];

             // Use separate ApiRequest instance for storage collection
       const ApiRequest = (await import('@/plugins/apiRequest.js')).default;
       const storageApiRequest = new ApiRequest(this.hostkey, 'https://gateway.cloudrestfulapi.com/api');
      const result = await storageApiRequest.aggregateCall('storage', pipeline);
      
      const totalBytes = result[0]?.totalSize || 0;
      const totalGB = totalBytes / (1024 * 1024 * 1024); // Convert to GB
      
      return totalGB;
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return 0;
    }
  }
}

export default CollectionService;

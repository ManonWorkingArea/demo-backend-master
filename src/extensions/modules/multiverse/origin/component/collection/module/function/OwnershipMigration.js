// Ownership Migration Script - สำหรับ migrate ข้อมูลจากแบบ embedded ไปแบบ normalized
import OwnershipService from './module/function/OwnershipService.js';
import CollectionService from './module/function/CollectionService.js';
import ApiRequest from '@/plugins/apiRequest.js';

class OwnershipMigration {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.baseUrl = 'https://gateway.cloudrestfulapi.com/api';
    
    // Initialize services
    this.ownershipService = new OwnershipService(hostkey);
    this.collectionService = new CollectionService(hostkey);
    
    // Initialize API request handler
    try {
      this.apiRequest = new ApiRequest(hostkey, this.baseUrl);
      console.log('ApiRequest initialized for migration');
    } catch (error) {
      console.warn('Failed to initialize ApiRequest for migration:', error);
      this.apiRequest = null;
    }
    
    this.migrationLog = [];
  }

  /**
   * Fallback fetch method when ApiRequest is not available
   */
  async fallbackFetch(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-token-key': this.hostkey
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    if (finalOptions.body && typeof finalOptions.body !== 'string') {
      finalOptions.body = JSON.stringify(finalOptions.body);
    }

    console.log(`Migration fallback fetch: ${finalOptions.method} ${url}`);
    
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return response;
    }
  }

  /**
   * API method delegates - forward to ApiRequest instance or use fallback
   */
  async aggregateCall(collection, pipeline) {
    if (this.apiRequest) {
      return await this.apiRequest.aggregateCall(collection, pipeline);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}/aggregate`;
    return await this.fallbackFetch(url, {
      method: 'POST',
      body: { pipeline }
    });
  }

  async update(collection, id, data) {
    if (this.apiRequest) {
      return await this.apiRequest.update(collection, id, data);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}/${id}`;
    const body = {
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      }
    };
    return await this.fallbackFetch(url, {
      method: 'PUT',
      body
    });
  }

  // เริ่ม migration process
  async startMigration() {
    console.log('🚀 Starting Ownership Migration...');
    this.migrationLog = [];
    
    try {
      // 1. ดึงข้อมูล Collections ทั้งหมดที่มี ownershipInfo แบบ embedded
      const collectionsToMigrate = await this.getCollectionsWithEmbeddedOwnership();
      
      console.log(`📊 Found ${collectionsToMigrate.length} collections to migrate`);
      
      if (collectionsToMigrate.length === 0) {
        console.log('✅ No collections need migration');
        return { success: true, migrated: 0, log: this.migrationLog };
      }

      let migratedCount = 0;
      let errorCount = 0;

      // 2. Migrate แต่ละ Collection
      for (const collection of collectionsToMigrate) {
        try {
          await this.migrateCollection(collection);
          migratedCount++;
          this.log(`✅ Migrated collection: ${collection.siteName} (${collection._id})`);
        } catch (error) {
          errorCount++;
          this.log(`❌ Failed to migrate collection: ${collection.siteName} (${collection._id}) - ${error.message}`);
          console.error('Migration error for collection:', collection._id, error);
        }
      }

      console.log(`🎉 Migration completed! Migrated: ${migratedCount}, Errors: ${errorCount}`);
      
      return {
        success: true,
        migrated: migratedCount,
        errors: errorCount,
        log: this.migrationLog
      };

    } catch (error) {
      console.error('Migration failed:', error);
      this.log(`💥 Migration failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        log: this.migrationLog
      };
    }
  }

  // ดึงข้อมูล Collections ที่มี ownershipInfo แบบ embedded
  async getCollectionsWithEmbeddedOwnership() {
    try {
      const pipeline = [
        {
          $match: {
            $and: [
              { siteType: 'collection' },
              { ownershipInfo: { $exists: true } }, // มี ownershipInfo แบบ embedded
              { ownerId: { $exists: false } } // ยังไม่มี ownerId (ยังไม่ได้ migrate)
            ]
          }
        }
      ];

      return await this.aggregateCall('hostname', pipeline);
    } catch (error) {
      console.error('Error fetching collections for migration:', error);
      throw error;
    }
  }

  // Migrate Collection เดียว
  async migrateCollection(collection) {
    const { ownershipInfo } = collection;
    
    if (!ownershipInfo || !ownershipInfo.primaryOwner) {
      throw new Error('Invalid ownership info');
    }

    // 1. สร้าง ownership record ใหม่
    const ownershipResult = await this.ownershipService.createOwner(ownershipInfo);
    
    if (!ownershipResult.success) {
      throw new Error(`Failed to create ownership record: ${ownershipResult.message}`);
    }

    const ownerId = ownershipResult.data._id;

    // 2. อัพเดท Collection ให้ผูกกับ ownership record และลบ ownershipInfo เก่า
    await this.updateCollectionWithOwnerId(collection._id, ownerId);

    // 3. เพิ่ม migration history
    await this.ownershipService.addOwnershipHistory(
      ownerId,
      'Data Migration',
      `Migrated from embedded ownership data in collection ${collection.siteName}`
    );

    return ownerId;
  }

  // อัพเดท Collection ให้ผูกกับ Owner ID และลบข้อมูล embedded
  async updateCollectionWithOwnerId(collectionId, ownerId) {
    try {
      const updateData = {
        ownerId: ownerId,
        $unset: { ownershipInfo: "" }, // ลบ ownershipInfo เก่า
        migrationDate: new Date().toISOString()
      };

      return await this.update('hostname', collectionId, updateData);
    } catch (error) {
      console.error('Error updating collection with owner ID:', error);
      throw error;
    }
  }

  // ตรวจสอบสถานะ migration
  async checkMigrationStatus() {
    try {
      // นับ Collections ที่ยังไม่ได้ migrate
      const pendingMigration = await this.getCollectionsWithEmbeddedOwnership();
      
      // นับ Collections ที่ migrate แล้ว
      const migratedPipeline = [
        {
          $match: {
            $and: [
              { siteType: 'collection' },
              { ownerId: { $exists: true } }
            ]
          }
        }
      ];

      const migratedCollections = await this.aggregateCall('hostname', migratedPipeline);

      return {
        pendingMigration: pendingMigration.length,
        migrated: migratedCollections.length,
        needsMigration: pendingMigration.length > 0
      };

    } catch (error) {
      console.error('Error checking migration status:', error);
      throw error;
    }
  }

  // Rollback migration (ถ้าจำเป็น)
  async rollbackMigration(collectionId) {
    try {
      // ดึงข้อมูล Collection
      const collection = await this.collectionService.getCollectionWithOwnership(collectionId);
      
      if (!collection.ownerId) {
        throw new Error('Collection has not been migrated');
      }

      // ดึงข้อมูล ownership
      const ownershipResult = await this.ownershipService.getOwnerById(collection.ownerId);
      
      if (!ownershipResult.success) {
        throw new Error('Failed to get ownership data');
      }

      // อัพเดท Collection กลับไปเป็นแบบ embedded
      const rollbackData = {
        ownershipInfo: ownershipResult.data,
        $unset: { ownerId: "" },
        rollbackDate: new Date().toISOString()
      };

      await this.update('hostname', collectionId, rollbackData);

      // ลบ ownership record
      await this.ownershipService.deleteOwner(collection.ownerId);

      this.log(`🔄 Rolled back collection: ${collection.siteName} (${collectionId})`);
      
      return { success: true };

    } catch (error) {
      console.error('Rollback error:', error);
      this.log(`❌ Failed to rollback collection: ${collectionId} - ${error.message}`);
      throw error;
    }
  }

  // บันทึก log
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  // สร้าง migration report
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      log: this.migrationLog,
      summary: this.migrationLog.filter(entry => entry.includes('✅')).length + ' successful, ' +
               this.migrationLog.filter(entry => entry.includes('❌')).length + ' failed'
    };
  }

  // ทดสอบ migration (dry run)
  async dryRun() {
    console.log('🧪 Running migration dry run...');
    
    try {
      const collectionsToMigrate = await this.getCollectionsWithEmbeddedOwnership();
      
      const report = {
        totalCollections: collectionsToMigrate.length,
        collectionsToMigrate: collectionsToMigrate.map(collection => ({
          id: collection._id,
          siteName: collection.siteName,
          hasOwnership: !!collection.ownershipInfo,
          ownerName: collection.ownershipInfo?.primaryOwner?.name || 'Unknown',
          ownerEmail: collection.ownershipInfo?.primaryOwner?.email || 'Unknown'
        })),
        estimatedTime: Math.ceil(collectionsToMigrate.length * 2) + ' seconds'
      };

      console.log('📋 Dry run report:', report);
      return report;

    } catch (error) {
      console.error('Dry run failed:', error);
      throw error;
    }
  }
}

export default OwnershipMigration;
/**
 * PackageService - Pure CRUD operations for Package data
 * 
 * ⚡ This service contains ONLY CRUD operations
 * 🚫 NO business logic or complex flows
 * ✅ Use ServiceManager for orchestrating business flows
 */

import ApiRequest from '@/plugins/apiRequest.js';

class PackageService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * 📝 CREATE: สร้าง Package ใหม่
   */
  async create(packageData) {
    try {
      console.log('PackageService.create():', packageData);

      const packageObj = {
        ...packageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.create('package', packageObj);
      
      if (result) {
        console.log('✅ Package created:', result._id);
        this.clearCache();
        return result;
      } else {
        throw new Error('Failed to create package');
      }
    } catch (error) {
      console.error('❌ PackageService.create() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงข้อมูล Package ตาม ID
   */
  async getById(packageId) {
    try {
      const cacheKey = `package_${packageId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log('PackageService.getById():', packageId);
      const result = await this.apiRequest.getById('package', packageId);
      
      if (result) {
        // Normalize package data
        const normalizedPackage = this.normalizePackageData(result);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: normalizedPackage,
          timestamp: Date.now()
        });
        
        return normalizedPackage;
      }
      
      return result;
    } catch (error) {
      console.error('❌ PackageService.getById() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Package ทั้งหมดที่ active
   */
  async getAvailable() {
    try {
      const cacheKey = 'packages_available';
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log('PackageService.getAvailable()');

      // Method 1: Try aggregate pipeline
      let packages = [];
    try {
      const pipeline = [
          { $match: { status: true } },
          { $sort: { order: 1, name: 1 } }
        ];
        packages = await this.apiRequest.aggregateCall('package', pipeline);
        console.log('📦 Packages loaded via aggregate:', packages?.length || 0);
      } catch (aggregateError) {
        console.warn('Aggregate failed, trying fallback method:', aggregateError);
      }

      // Method 2: Fallback to simple aggregate if first method failed
      if (!packages || packages.length === 0) {
        try {
          const simplePipeline = [{ $match: { status: true } }];
          packages = await this.apiRequest.aggregateCall('package', simplePipeline);
          console.log('📦 Packages loaded via simple aggregate:', packages?.length || 0);
        } catch (fallbackError) {
          console.warn('Fallback aggregate also failed:', fallbackError);
          packages = [];
        }
      }

      // Normalize package data
      const normalizedPackages = packages.map(pkg => this.normalizePackageData(pkg));
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: normalizedPackages,
        timestamp: Date.now()
      });
      
      console.log('✅ Available packages retrieved:', normalizedPackages.length);
      return normalizedPackages;
    } catch (error) {
      console.error('❌ PackageService.getAvailable() error:', error);
      return [];
    }
  }

  /**
   * 🔍 READ: ดึงรายการ Package ทั้งหมด (รวม inactive)
   */
  async getAll() {
    try {
      console.log('PackageService.getAll()');

      const pipeline = [
        { $sort: { order: 1, name: 1 } }
      ];

      const packages = await this.apiRequest.aggregateCall('package', pipeline);
      const normalizedPackages = packages?.map(pkg => this.normalizePackageData(pkg)) || [];
      
      console.log('✅ All packages retrieved:', normalizedPackages.length);
      return normalizedPackages;
    } catch (error) {
      console.error('❌ PackageService.getAll() error:', error);
      return [];
    }
  }

  /**
   * ✏️ UPDATE: อัปเดต Package
   */
  async update(packageId, updateData) {
    try {
      console.log('PackageService.update():', packageId, updateData);

      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.apiRequest.update('package', packageId, updates);
      
      if (result) {
        console.log('✅ Package updated:', packageId);
        this.clearCache();
      return result;
      } else {
        throw new Error('Failed to update package');
      }
    } catch (error) {
      console.error('❌ PackageService.update() error:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DELETE: ลบ Package
   */
  async delete(packageId) {
    try {
      console.log('PackageService.delete():', packageId);

      const result = await this.apiRequest.delete('package', packageId);

      console.log('✅ Package deleted:', packageId);
      this.clearCache();
      return result;
    } catch (error) {
      console.error('❌ PackageService.delete() error:', error);
      throw error;
    }
  }

  /**
   * 🔍 SEARCH: ค้นหา Package ตามเงื่อนไข
   */
  async search(searchCriteria) {
    try {
      console.log('PackageService.search():', searchCriteria);

      const pipeline = [
        { $match: searchCriteria },
        { $sort: { order: 1, name: 1 } }
      ];

      const packages = await this.apiRequest.aggregateCall('package', pipeline);
      const normalizedPackages = packages?.map(pkg => this.normalizePackageData(pkg)) || [];
      
      console.log('✅ PackageService.search() found:', normalizedPackages.length);
      return normalizedPackages;
    } catch (error) {
      console.error('❌ PackageService.search() error:', error);
      return [];
    }
  }

  /**
   * 📊 READ: ดึงสถิติ Package
   */
  async getStats() {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricing.basePrice' }
          }
        }
      ];

      const stats = await this.apiRequest.aggregateCall('package', pipeline);
      console.log('✅ PackageService.getStats():', stats);
      return stats || [];
    } catch (error) {
      console.error('❌ PackageService.getStats() error:', error);
      return [];
    }
  }

  // ===== 🔧 UTILITY METHODS =====

  /**
   * Normalize package data to ensure consistent structure
   */
  normalizePackageData(pkg) {
    if (!pkg) return pkg;

    // Ensure the package has proper pricing structure
    if (!pkg.pricing) {
      pkg.pricing = {
        basePrice: pkg.price || 0,
        billingCycles: [
          {
            type: 'monthly',
            label: 'รายเดือน',
            price: pkg.price || 0,
            duration: pkg.duration || 30,
            discount: 0
          }
        ],
        defaultCycle: 'monthly',
        currency: pkg.currency || 'THB'
      };
    }

    // Ensure price property exists for backward compatibility
    if (!pkg.price && pkg.pricing?.basePrice) {
      pkg.price = pkg.pricing.basePrice;
    }

    // Ensure billingCycle exists
    if (!pkg.billingCycle) {
      pkg.billingCycle = pkg.pricing?.defaultCycle || 'monthly';
    }

    // Ensure limits structure
    if (!pkg.limits) {
      pkg.limits = {
        maxAssets: pkg.maxAssets || 0,
        maxUsers: pkg.maxUsers || 0,
        storageGB: pkg.storageGB || 0,
        bandwidthGB: pkg.bandwidthGB || 0
      };
    }

    return pkg;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ PackageService cache cleared');
  }

  // ===== 🔧 LEGACY COMPATIBILITY METHODS =====

  /**
   * @deprecated Use getAvailable() instead
   */
  async getAvailablePackages() {
    console.warn('⚠️ getAvailablePackages is deprecated. Use getAvailable() instead.');
    return await this.getAvailable();
  }

  /**
   * @deprecated Use getById() instead
   */
  async getPackageById(packageId) {
    console.warn('⚠️ getPackageById is deprecated. Use getById() instead.');
    return await this.getById(packageId);
  }
}

export default PackageService;
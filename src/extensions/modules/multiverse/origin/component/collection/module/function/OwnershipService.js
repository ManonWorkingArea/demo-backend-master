// Ownership Service - จัดการข้อมูลเจ้าของแยกจาก Collection
// See OwnershipService.md for complete API documentation and guidelines
import ApiRequest from '@/plugins/apiRequest.js';

class OwnershipService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.baseUrl = 'https://gateway.cloudrestfulapi.com/api';
    
    // Initialize API request handler
    try {
      this.apiRequest = new ApiRequest(hostkey, this.baseUrl);
      console.log('ApiRequest initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize ApiRequest:', error);
      this.apiRequest = null;
    }
    
    this.cache = {
      owners: new Map(),
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

    console.log(`Fallback fetch: ${finalOptions.method} ${url}`);
    
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
  async apiCall(endpoint, methodOrOptions = {}, collection = null, body = null) {
    if (this.apiRequest) {
      return await this.apiRequest.apiCall(endpoint, methodOrOptions, collection, body);
    }
    
    // Fallback implementation
    let url, options;
    if (typeof methodOrOptions === 'string') {
      const method = methodOrOptions;
      url = collection ? `${this.baseUrl}/${collection}${endpoint}` : `${this.baseUrl}${endpoint}`;
      options = { method, body };
    } else {
      const { method = 'GET', body: requestBody, collection: targetCollection } = methodOrOptions;
      url = targetCollection ? `${this.baseUrl}/${targetCollection}${endpoint}` : `${this.baseUrl}${endpoint}`;
      options = { method, body: requestBody };
    }
    
    return await this.fallbackFetch(url, options);
  }

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

  async getById(collection, id) {
    if (this.apiRequest) {
      return await this.apiRequest.getById(collection, id);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}/${id}`;
    return await this.fallbackFetch(url);
  }

  async create(collection, data) {
    if (this.apiRequest) {
      return await this.apiRequest.create(collection, data);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}`;
    return await this.fallbackFetch(url, {
      method: 'POST',
      body: data
    });
  }

  async update(collection, id, data) {
    if (this.apiRequest) {
      return await this.apiRequest.update(collection, id, data);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}/${id}`;
    const body = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    return await this.fallbackFetch(url, {
      method: 'PUT',
      body
    });
  }

  async delete(collection, id) {
    if (this.apiRequest) {
      return await this.apiRequest.delete(collection, id);
    }
    
    // Fallback implementation
    const url = `${this.baseUrl}/${collection}/${id}`;
    return await this.fallbackFetch(url, {
      method: 'DELETE'
    });
  }

  // สร้างเจ้าของใหม่
  async createOwner(ownershipData) {
    try {
      const data = {
        ...ownershipData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await this.create('ownership', { data });
      
      // บันทึก cache
      this.cache.owners.set(result._id, result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating owner:', error);
      return { success: false, message: error.message };
    }
  }

  // อัพเดทข้อมูลเจ้าของ
  async updateOwner(ownerId, ownershipData) {
    try {
      const data = {
        ...ownershipData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.update('ownership', ownerId, { data });
      
      // อัพเดท cache
      this.cache.owners.set(ownerId, result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating owner:', error);
      return { success: false, message: error.message };
    }
  }

  // ดึงข้อมูลเจ้าของตาม ID
  async getOwnerById(ownerId) {
    try {
      // ตรวจสอบ cache ก่อน
      if (this.cache.owners.has(ownerId)) {
        return { success: true, data: this.cache.owners.get(ownerId) };
      }

      const result = await this.getById('ownership', ownerId);
      
      // บันทึก cache
      this.cache.owners.set(ownerId, result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching owner:', error);
      return { success: false, message: error.message };
    }
  }

  // ดึงข้อมูลเจ้าของหลายคนพร้อมกัน
  async getOwnersByIds(ownerIds) {
    try {
      const owners = [];
      const uncachedIds = [];

      // ตรวจสอบ cache ก่อน
      for (const id of ownerIds) {
        if (this.cache.owners.has(id)) {
          owners.push(this.cache.owners.get(id));
        } else {
          uncachedIds.push(id);
        }
      }

      // ดึงข้อมูลที่ไม่มีใน cache
      if (uncachedIds.length > 0) {
        const pipeline = [
          {
            $match: {
              _id: { $in: uncachedIds }
            }
          }
        ];

        const fetchedOwners = await this.aggregateCall('ownership', pipeline);
        
        // บันทึก cache และเพิ่มเข้า result
        fetchedOwners.forEach(owner => {
          this.cache.owners.set(owner._id, owner);
          owners.push(owner);
        });
      }

      return { success: true, data: owners };
    } catch (error) {
      console.error('Error fetching owners:', error);
      return { success: false, message: error.message };
    }
  }

  // ค้นหาเจ้าของตามเงื่อนไข
  async searchOwners(searchCriteria) {
    try {
      const pipeline = [
        {
          $match: searchCriteria
        }
      ];

      const result = await this.aggregateCall('ownership', pipeline);
      
      // บันทึก cache สำหรับผลลัพธ์ที่ได้
      result.forEach(owner => {
        this.cache.owners.set(owner._id, owner);
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error searching owners:', error);
      return { success: false, message: error.message };
    }
  }

  // ลบเจ้าของ
  async deleteOwner(ownerId) {
    try {
      await this.delete('ownership', ownerId);

      // ลบจาก cache
      this.cache.owners.delete(ownerId);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting owner:', error);
      return { success: false, message: error.message };
    }
  }

  // ดึงรายการ Collection ที่เจ้าของคนนี้เป็นเจ้าของ
  async getCollectionsByOwner(ownerId) {
    try {
      const pipeline = [
        {
          $match: {
            $and: [
              { siteType: 'collection' },
              { ownerId: ownerId }
            ]
          }
        }
      ];

      const result = await this.aggregateCall('hostname', pipeline);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching collections by owner:', error);
      return { success: false, message: error.message };
    }
  }

  // เพิ่มประวัติการเปลี่ยนแปลง
  async addOwnershipHistory(ownerId, action, details, userId = null) {
    try {
      const data = {
        ownerId,
        action,
        details,
        userId,
        timestamp: new Date().toISOString()
      };

      const result = await this.create('ownership_history', { data });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding ownership history:', error);
      return { success: false, message: error.message };
    }
  }

  // ดึงประวัติการเปลี่ยนแปลง
  async getOwnershipHistory(ownerId, limit = 10) {
    try {
      const pipeline = [
        {
          $match: { ownerId: ownerId }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: limit
        }
      ];

      const result = await this.aggregateCall('ownership_history', pipeline);
      console.log('History query result:', result); // Debug log
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching ownership history:', error);
      return { success: false, message: error.message };
    }
  }

  // ล้าง cache
  clearCache() {
    this.cache.owners.clear();
    this.cache.lastFetch = null;
  }

  // สร้างข้อมูลเจ้าของเริ่มต้น
  createDefaultOwnershipData() {
    return {
      primaryOwner: {
        name: '',
        email: '',
        phone: '',
        position: '',
        ownerType: 'individual', // individual or corporate
        address: '',
        nationalId: '', // for individual
        taxId: '' // for corporate
      },
      billingContact: {
        name: '',
        email: '',
        phone: '',
        department: '',
        address: ''
      },
      technicalContact: {
        name: '',
        email: '',
        phone: '',
        expertise: '',
        address: ''
      },
      organization: {
        name: '',
        taxId: '',
        address: ''
      }
    };
  }

  // Validate ข้อมูลเจ้าของ
  validateOwnershipData(ownershipData) {
    const errors = [];
    
    if (!ownershipData.primaryOwner) {
      errors.push('ข้อมูลเจ้าของหลักจำเป็น');
      return { valid: false, errors };
    }

    const primary = ownershipData.primaryOwner;
    
    if (!primary.name || !primary.email) {
      errors.push('ชื่อและอีเมลของเจ้าของหลักจำเป็น');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (primary.email && !emailRegex.test(primary.email)) {
      errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }

    // Validate owner type
    if (!['individual', 'corporate'].includes(primary.ownerType)) {
      errors.push('ประเภทเจ้าของไม่ถูกต้อง');
    }

    // Validate national ID for individual
    if (primary.ownerType === 'individual' && primary.nationalId) {
      if (!/^\d{13}$/.test(primary.nationalId)) {
        errors.push('เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก');
      }
    }

    // Validate tax ID for corporate
    if (primary.ownerType === 'corporate' && primary.taxId) {
      if (!/^\d{13}$/.test(primary.taxId)) {
        errors.push('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default OwnershipService; 
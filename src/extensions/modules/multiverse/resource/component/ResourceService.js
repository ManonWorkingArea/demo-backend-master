import ApiRequest from '@/plugins/apiRequest.js';

class ResourceService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.baseUrl = 'https://gateway.cloudrestfulapi.com/api';
    
    // Initialize API request handler
    this.apiRequest = new ApiRequest(hostkey, this.baseUrl);
    
    this.cache = {
      clients: null,
      spaces: null,
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

  // ล้าง cache
  clearCache() {
    this.cache.clients = null;
    this.cache.spaces = null;
    this.cache.lastFetch = null;
  }

  // ==================== CLIENT METHODS ====================

  // ดึงข้อมูล Clients ทั้งหมด
  async getClients() {
    try {
      // ใช้ cache ถ้ายังใหม่อยู่
      if (this.isCacheValid() && this.cache.clients) {
        return this.cache.clients;
      }

      const pipeline = [
        {
          $match: {
            $and: [{}]
          }
        },
        {
          $sort: { createdAt: -1, clientId: 1 }
        }
      ];

      const clients = await this.aggregateCall('clients', pipeline);
      
      // บันทึก cache
      this.cache.clients = clients;
      this.cache.lastFetch = Date.now();

      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Client ตาม ID
  async getClientById(clientId) {
    try {
      return await this.getById('clients', clientId);
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  }

  // สร้าง Client ใหม่
  async createClient(clientData) {
    try {
      const result = await this.create('clients', { data: clientData });
      
      // ล้าง cache หลังจากสร้าง
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // อัปเดต Client
  async updateClient(clientId, clientData) {
    try {
      // Remove _id from data if it exists
      const dataWithoutId = { ...clientData };
      delete dataWithoutId._id;

      const result = await this.update('clients', clientId, {
        data: {
          ...dataWithoutId,
          updatedAt: new Date().toISOString()
        }
      });

      // ล้าง cache หลังจากอัปเดต
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // ลบ Client
  async deleteClient(clientId) {
    try {
      const result = await this.delete('clients', clientId);
      
      // ล้าง cache หลังจากลบ
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // ==================== SPACE METHODS ====================

  // ดึงข้อมูล Spaces พร้อม Storage data
  async getSpacesWithStorageData() {
    try {
      // ใช้ cache ถ้ายังใหม่อยู่
      if (this.isCacheValid() && this.cache.spaces) {
        return this.cache.spaces;
      }

      // ดึงข้อมูล Spaces
      const spaces = await this.fetchSpaces();
      
      // ดึงข้อมูล Storage data สำหรับแต่ละ space
      const spacesWithData = await Promise.all(
        spaces.map(async (space) => {
          const storageData = await this.getSpaceStorageData(space._id);
          return {
            ...space,
            size: storageData[0]?.totalSize || '0',
            count: storageData[0]?.itemCount || '0'
          };
        })
      );

      // บันทึก cache
      this.cache.spaces = spacesWithData;
      this.cache.lastFetch = Date.now();

      return spacesWithData;
    } catch (error) {
      console.error('Error fetching spaces with storage data:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Spaces
  async fetchSpaces() {
    const pipeline = [
      {
        $match: {
          $and: [{}]
        }
      },
      {
        $sort: { createdAt: -1, name: 1 }
      }
    ];

    return await this.aggregateCall('space', pipeline);
  }

  // ดึงข้อมูล Space ตาม ID
  async getSpaceById(spaceId) {
    try {
      return await this.getById('space', spaceId);
    } catch (error) {
      console.error('Error fetching space by ID:', error);
      throw error;
    }
  }

  // สร้าง Space ใหม่
  async createSpace(spaceData) {
    try {
      const result = await this.create('space', { data: spaceData });
      
      // ล้าง cache หลังจากสร้าง
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error creating space:', error);
      throw error;
    }
  }

  // อัปเดต Space
  async updateSpace(spaceId, spaceData) {
    try {
      // Remove _id from data if it exists
      const dataWithoutId = { ...spaceData };
      delete dataWithoutId._id;

      const result = await this.update('space', spaceId, {
        data: {
          ...dataWithoutId,
          updatedAt: new Date().toISOString()
        }
      });

      // ล้าง cache หลังจากอัปเดต
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
  }

  // ลบ Space
  async deleteSpace(spaceId) {
    try {
      const result = await this.delete('space', spaceId);
      
      // ล้าง cache หลังจากลบ
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  }

  // ดึงข้อมูล Storage statistics สำหรับ Space
  async getSpaceStorageData(targetSpaceId) {
    try {
      const pipeline = [
        {
          $match: {
            spaceId: targetSpaceId
          }
        },
        {
          $group: {
            _id: null,
            itemCount: { $sum: 1 },
            totalSize: { $sum: "$size" }
          }
        }
      ];

      // Use separate ApiRequest instance for storage collection
      const ApiRequest = (await import('@/plugins/apiRequest.js')).default;
      const storageApiRequest = new ApiRequest(this.hostkey, this.baseUrl);
      return await storageApiRequest.aggregateCall('storage', pipeline);
    } catch (error) {
      console.error('Error fetching space storage data:', error);
      return [{ itemCount: 0, totalSize: 0 }]; // Return default values
    }
  }

  // ==================== UTILITY METHODS ====================

  // เปลี่ยนสถานะ Resource (client หรือ space)
  async toggleResourceStatus(resourceType, resourceId, currentStatus) {
    try {
      const collection = resourceType === 'client' ? 'clients' : 'space';
      const newStatus = !currentStatus;

      const result = await this.update(collection, resourceId, {
        data: {
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      });

      // ล้าง cache หลังจากอัปเดต
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error(`Error toggling ${resourceType} status:`, error);
      throw error;
    }
  }

  // อัปเดต Resources หลายตัวพร้อมกัน
  async bulkUpdateResources(resourceType, resourceIds, updateData) {
    try {
      const promises = resourceIds.map(id => {
        if (resourceType === 'client') {
          return this.updateClient(id, updateData);
        } else if (resourceType === 'space') {
          return this.updateSpace(id, updateData);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error(`Error bulk updating ${resourceType}s:`, error);
      throw error;
    }
  }

  // ลบ Resources หลายตัวพร้อมกัน
  async bulkDeleteResources(resourceType, resourceIds) {
    try {
      const promises = resourceIds.map(id => {
        if (resourceType === 'client') {
          return this.deleteClient(id);
        } else if (resourceType === 'space') {
          return this.deleteSpace(id);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error(`Error bulk deleting ${resourceType}s:`, error);
      throw error;
    }
  }

  // Refresh cache โดยบังคับ
  async refreshData() {
    this.clearCache();
    return {
      clients: await this.getClients(),
      spaces: await this.getSpacesWithStorageData()
    };
  }


}

export default ResourceService; 
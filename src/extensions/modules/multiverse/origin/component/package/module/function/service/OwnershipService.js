/**
 * OwnershipService - Ownership Data Management
 * 
 * 🎯 This service handles ownership information for collections
 * ✅ Integrates with Collection and OwnershipMigration services
 * 🔧 Provides ownership data for contracts, invoices, and receipts
 * 📊 Validates ownership completeness for billing
 */

import ApiRequest from '@/plugins/apiRequest.js';
import CollectionService from './CollectionService.js';

class OwnershipService {
  constructor(hostkey) {
    this.hostkey = hostkey;
    this.apiRequest = new ApiRequest(hostkey);
    this.collectionService = new CollectionService(hostkey);
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // ===== 📊 OWNERSHIP DATA RETRIEVAL METHODS =====

  /**
   * 📊 ดึงข้อมูลเจ้าของของ Collection
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ข้อมูลเจ้าของ
   */
  async getOwnershipInfo(collectionId) {
    try {
      console.log('📊 OwnershipService.getOwnershipInfo():', collectionId);
      
      // Check cache first
      const cacheKey = `ownership_${collectionId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('📋 Returning cached ownership data');
        return cached;
      }

      // Step 1: Get collection data first to find ownerId
      console.log('📋 Step 1: Getting collection data from hostname...');
      let collectionData = null;
      try {
        collectionData = await this.collectionService.getCollectionById(collectionId);
        
        if (collectionData) {
          console.log('✅ Found collection data:', {
            id: collectionData._id,
            hostname: collectionData.hostname,
            siteName: collectionData.siteName,
            ownerId: collectionData.ownerId
          });
        } else {
          console.log('⚠️ No collection data found');
        }
      } catch (error) {
        console.log('⚠️ Error getting collection data:', error.message);
      }

      // Step 2: Get ownership record using ownerId from collection
      let ownershipData = null;
      if (collectionData && collectionData.ownerId) {
        console.log('📋 Step 2: Getting ownership record by ownerId:', collectionData.ownerId);
        try {
          const ownershipRecords = await this.apiRequest.apiCall('', 'GET', 'ownership', {
            _id: collectionData.ownerId
          });
          
          if (ownershipRecords && ownershipRecords.length > 0) {
            ownershipData = ownershipRecords[0];
            console.log('✅ Found ownership record:', {
              id: ownershipData._id,
              primaryOwner: ownershipData.primaryOwner?.name,
              organization: ownershipData.organization?.name
            });
          } else {
            console.log('📋 No ownership record found for ownerId:', collectionData.ownerId);
          }
        } catch (error) {
          console.log('⚠️ Error getting ownership record:', error.message);
        }
      } else {
        console.log('📋 No ownerId found in collection data, trying direct lookup...');
        
        // Fallback: try to find ownership record directly by collectionId
        try {
          const ownershipRecords = await this.apiRequest.apiCall('', 'GET', 'ownership', {
            _id: collectionId
          });
          
          if (ownershipRecords && ownershipRecords.length > 0) {
            ownershipData = ownershipRecords[0];
            console.log('✅ Found ownership record by direct collectionId lookup:', ownershipData._id);
          }
        } catch (error) {
          console.log('📋 No ownership record found by direct lookup either');
        }
      }

      const ownershipInfo = this.processOwnershipData(ownershipData, collectionData, collectionId);
      
      // Cache the result
      this.setCachedData(cacheKey, ownershipInfo);
      
      console.log('✅ Ownership info processed successfully:', {
        hasOwnershipData: !!ownershipData,
        hasCollectionData: !!collectionData,
        source: ownershipInfo.source
      });
      return ownershipInfo;
      
    } catch (error) {
      console.error('❌ OwnershipService.getOwnershipInfo() error:', error);
      
      // Return minimal fallback data instead of throwing error
      const fallbackOwnershipInfo = {
        collectionId: collectionId,
        collectionName: 'Unknown Collection',
        primaryOwner: null,
        organization: null,
        billingContact: null,
        technicalContact: null,
        taxId: null,
        phone: null,
        email: null,
        address: null,
        completeness: {
          score: 0,
          isComplete: false,
          missing: ['ไม่สามารถเชื่อมต่อกับระบบจัดการข้อมูลเจ้าของได้'],
          warnings: ['กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง']
        },
        lastUpdated: null,
        source: 'error_fallback'
      };
      
      console.log('🔄 Returning fallback ownership info due to error');
      return fallbackOwnershipInfo;
    }
  }

  /**
   * 🔄 ประมวลผลข้อมูลเจ้าของ
   * @param {Object} ownershipData - Ownership record data
   * @param {Object} collectionData - Collection data (fallback)
   * @param {string} collectionId - Collection ID
   * @returns {Object} Processed ownership information
   */
  processOwnershipData(ownershipData, collectionData, collectionId) {
    const ownershipInfo = {
      collectionId: collectionId,
      collectionName: collectionData?.name || 'Unknown Collection',
      
      // Primary Owner Information
      primaryOwner: null,
      
      // Organization Information
      organization: null,
      
      // Billing Contact
      billingContact: null,
      
      // Technical Contact
      technicalContact: null,
      
      // Tax Information
      taxId: null,
      
      // Contact Information
      phone: null,
      email: null,
      address: null,
      
      // Completeness Status
      completeness: {
        score: 0,
        isComplete: false,
        missing: [],
        warnings: []
      },
      
      // Metadata
      lastUpdated: null,
      source: 'ownership_record'
    };

    // Process ownership record data
    if (ownershipData) {
      // Primary Owner
      if (ownershipData.primaryOwner) {
        ownershipInfo.primaryOwner = {
          name: ownershipData.primaryOwner.name,
          email: ownershipData.primaryOwner.email,
          phone: ownershipData.primaryOwner.phone,
          position: ownershipData.primaryOwner.position,
          ownerType: ownershipData.primaryOwner.ownerType || 'individual',
          address: ownershipData.primaryOwner.address,
          nationalId: ownershipData.primaryOwner.nationalId,
          taxId: ownershipData.primaryOwner.taxId
        };
        
        // Set primary tax ID from primary owner
        ownershipInfo.taxId = ownershipData.primaryOwner.taxId;
      }
      
      // Billing Contact
      if (ownershipData.billingContact) {
        ownershipInfo.billingContact = {
          name: ownershipData.billingContact.name,
          email: ownershipData.billingContact.email,
          phone: ownershipData.billingContact.phone,
          position: ownershipData.billingContact.position,
          ownerType: ownershipData.billingContact.ownerType || 'individual',
          address: ownershipData.billingContact.address,
          nationalId: ownershipData.billingContact.nationalId,
          taxId: ownershipData.billingContact.taxId
        };
      } else {
        // Fallback to primary owner for billing
        ownershipInfo.billingContact = ownershipInfo.primaryOwner;
      }
      
      // Technical Contact
      if (ownershipData.technicalContact) {
        ownershipInfo.technicalContact = {
          name: ownershipData.technicalContact.name,
          email: ownershipData.technicalContact.email,
          phone: ownershipData.technicalContact.phone,
          position: ownershipData.technicalContact.position,
          ownerType: ownershipData.technicalContact.ownerType || 'individual',
          address: ownershipData.technicalContact.address,
          nationalId: ownershipData.technicalContact.nationalId,
          taxId: ownershipData.technicalContact.taxId
        };
      }
      
      // Organization Information
      if (ownershipData.organization) {
        ownershipInfo.organization = {
          name: ownershipData.organization.name,
          taxId: ownershipData.organization.taxId,
          address: ownershipData.organization.address
        };
        
        // Use organization tax ID if available and primary owner doesn't have one
        if (!ownershipInfo.taxId && ownershipData.organization.taxId) {
          ownershipInfo.taxId = ownershipData.organization.taxId;
        }
      }
      
      // Set primary contact information from billing contact
      if (ownershipInfo.billingContact) {
        ownershipInfo.email = ownershipInfo.billingContact.email;
        ownershipInfo.phone = ownershipInfo.billingContact.phone;
        ownershipInfo.address = ownershipInfo.billingContact.address;
      }
      
      // Metadata
      ownershipInfo.lastUpdated = ownershipData.updatedAt || ownershipData.createdAt;
      ownershipInfo.source = 'ownership_record';
    }

    // Fallback to collection creator information if no ownership record
    if (!ownershipInfo.primaryOwner && collectionData) {
      ownershipInfo.primaryOwner = {
        name: collectionData.created_by_name || 'Unknown User',
        email: collectionData.created_by_email || '',
        phone: '',
        position: '',
        ownerType: 'individual',
        address: '',
        nationalId: '',
        taxId: ''
      };
      
      ownershipInfo.billingContact = ownershipInfo.primaryOwner;
      ownershipInfo.email = ownershipInfo.primaryOwner.email;
      ownershipInfo.source = 'collection_creator';
    }

    // Calculate completeness
    ownershipInfo.completeness = this.calculateOwnershipCompleteness(ownershipInfo);
    
    return ownershipInfo;
  }

  /**
   * 📊 คำนวณความครบถ้วนของข้อมูลเจ้าของ
   * @param {Object} ownershipInfo - ข้อมูลเจ้าของ
   * @returns {Object} สถานะความครบถ้วน
   */
  calculateOwnershipCompleteness(ownershipInfo) {
    const completeness = {
      score: 0,
      isComplete: false,
      missing: [],
      warnings: []
    };

    let totalFields = 0;
    let completedFields = 0;

    // Required fields for billing
    const requiredFields = [
      { field: 'primaryOwner.name', label: 'ชื่อเจ้าของ' },
      { field: 'email', label: 'อีเมล' },
      { field: 'phone', label: 'เบอร์โทรศัพท์' }
    ];

    // Optional but recommended fields
    const recommendedFields = [
      { field: 'taxId', label: 'เลขประจำตัวผู้เสียภาษี' },
      { field: 'address', label: 'ที่อยู่' },
      { field: 'organization.name', label: 'ชื่อองค์กร' },
      { field: 'billingContact.name', label: 'ผู้ติดต่อการเงิน' },
      { field: 'primaryOwner.nationalId', label: 'เลขประจำตัวประชาชน' }
    ];

    // Check required fields
    requiredFields.forEach(({ field, label }) => {
      totalFields++;
      const value = this.getNestedValue(ownershipInfo, field);
      if (value && value.trim && value.trim() !== '') {
        completedFields++;
      } else {
        completeness.missing.push(label);
      }
    });

    // Check recommended fields
    recommendedFields.forEach(({ field, label }) => {
      totalFields++;
      const value = this.getNestedValue(ownershipInfo, field);
      if (value && value.trim && value.trim() !== '') {
        completedFields++;
      } else {
        completeness.warnings.push(`แนะนำให้เพิ่ม: ${label}`);
      }
    });

    // Calculate score
    completeness.score = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    completeness.isComplete = completeness.missing.length === 0;

    return completeness;
  }

  /**
   * 🔧 ดึงค่าจาก nested object
   * @param {Object} obj - Object
   * @param {string} path - Path (e.g., 'primaryOwner.name')
   * @returns {*} Value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // ===== 📋 OWNERSHIP DATA FOR BILLING =====

  /**
   * 📋 ดึงข้อมูลเจ้าของสำหรับออกบิล
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} ข้อมูลสำหรับออกบิล
   */
  async getOwnershipForBilling(collectionId) {
    try {
      console.log('📋 OwnershipService.getOwnershipForBilling():', collectionId);
      
      const ownershipInfo = await this.getOwnershipInfo(collectionId);
      
      // Determine customer information priority: primaryOwner > billingContact > fallback
      let customerName = 'ไม่ระบุ';
      let customerEmail = '';
      let customerPhone = '';
      let customerTaxId = '';
      let customerTaxType = 'individual';
      
      if (ownershipInfo.primaryOwner) {
        customerName = ownershipInfo.primaryOwner.name || 'ไม่ระบุ';
        customerEmail = ownershipInfo.primaryOwner.email || '';
        customerPhone = ownershipInfo.primaryOwner.phone || '';
        customerTaxId = ownershipInfo.primaryOwner.taxId || ownershipInfo.primaryOwner.nationalId || '';
        customerTaxType = ownershipInfo.primaryOwner.ownerType || 'individual';
      } else if (ownershipInfo.billingContact) {
        customerName = ownershipInfo.billingContact.name || 'ไม่ระบุ';
        customerEmail = ownershipInfo.billingContact.email || '';
        customerPhone = ownershipInfo.billingContact.phone || '';
        customerTaxId = ownershipInfo.billingContact.taxId || ownershipInfo.billingContact.nationalId || '';
        customerTaxType = ownershipInfo.billingContact.ownerType || 'individual';
      }
      
      // If organization exists and no primary owner tax ID, use organization tax ID
      if (!customerTaxId && ownershipInfo.organization?.taxId) {
        customerTaxId = ownershipInfo.organization.taxId;
        customerTaxType = 'corporate';
      }
      
      // Prepare billing address from primaryOwner or billingContact
      let billingAddress = null;
      const addressSource = ownershipInfo.primaryOwner?.address || ownershipInfo.billingContact?.address || ownershipInfo.organization?.address;
      if (addressSource) {
        // Handle both string and object address formats
        if (typeof addressSource === 'string') {
          billingAddress = {
            street: addressSource,
            city: '',
            state: '',
            postalCode: '',
            country: 'Thailand'
          };
        } else if (typeof addressSource === 'object') {
          billingAddress = {
            street: addressSource.street || addressSource,
            city: addressSource.city || '',
            state: addressSource.state || '',
            postalCode: addressSource.postalCode || '',
            country: addressSource.country || 'Thailand'
          };
        }
      }
      
      const billingInfo = {
        // Customer Information
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        
        // Tax Information
        taxId: customerTaxId,
        taxType: customerTaxType,
        
        // Address
        billingAddress: billingAddress,
        
        // Organization (if applicable)
        organization: ownershipInfo.organization ? {
          name: ownershipInfo.organization.name || '',
          type: ownershipInfo.organization.type || 'company',
          taxId: ownershipInfo.organization.taxId || '',
          address: ownershipInfo.organization.address || ''
        } : null,
        
        // Billing completeness
        isReadyForBilling: ownershipInfo.completeness.isComplete,
        missingInfo: ownershipInfo.completeness.missing,
        
        // Metadata
        source: ownershipInfo.source,
        lastUpdated: ownershipInfo.lastUpdated
      };
      
      console.log('✅ Billing info prepared successfully:', {
        customerName: billingInfo.customerName,
        hasEmail: !!billingInfo.customerEmail,
        hasPhone: !!billingInfo.customerPhone,
        hasTaxId: !!billingInfo.taxId,
        hasAddress: !!billingInfo.billingAddress,
        isReady: billingInfo.isReadyForBilling,
        source: billingInfo.source
      });
      
      return billingInfo;
      
    } catch (error) {
      console.error('❌ OwnershipService.getOwnershipForBilling() error:', error);
      
      // Return fallback billing info instead of throwing error
      const fallbackBillingInfo = {
        customerName: 'ไม่ระบุ',
        customerEmail: '',
        customerPhone: '',
        taxId: '',
        taxType: 'individual',
        billingAddress: null,
        organization: null,
        isReadyForBilling: false,
        missingInfo: ['ไม่สามารถเชื่อมต่อกับระบบจัดการข้อมูลเจ้าของได้'],
        source: 'error_fallback',
        lastUpdated: null
      };
      
      console.log('🔄 Returning fallback billing info due to error');
      return fallbackBillingInfo;
    }
  }

  /**
   * 📋 ดึงชื่อที่จะแสดงในเอกสาร
   * @param {Object} ownershipInfo - ข้อมูลเจ้าของ
   * @returns {string} ชื่อที่จะแสดง
   */
  getDisplayName(ownershipInfo) {
    if (ownershipInfo.organization?.name) {
      return ownershipInfo.organization.name;
    }
    
    if (ownershipInfo.primaryOwner?.name) {
      return ownershipInfo.primaryOwner.name;
    }
    
    return 'ไม่ระบุ';
  }

  /**
   * 📋 ตรวจสอบความพร้อมสำหรับออกบิล
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} สถานะความพร้อม
   */
  async validateBillingReadiness(collectionId) {
    try {
      console.log('📋 OwnershipService.validateBillingReadiness():', collectionId);
      
      const ownershipInfo = await this.getOwnershipInfo(collectionId);
      
      const validation = {
        isReady: ownershipInfo.completeness.isComplete,
        score: ownershipInfo.completeness.score,
        errors: [],
        warnings: ownershipInfo.completeness.warnings || [],
        recommendations: []
      };

      // Critical errors (prevent billing)
      if (ownershipInfo.completeness.missing.length > 0) {
        validation.errors = ownershipInfo.completeness.missing.map(field => 
          `ขาดข้อมูล: ${field}`
        );
      }

      // Additional validation based on actual data
      if (!ownershipInfo.primaryOwner?.name && !ownershipInfo.organization?.name) {
        validation.errors.push('ขาดข้อมูล: ชื่อลูกค้าหรือองค์กร');
      }

      if (!ownershipInfo.primaryOwner?.email && !ownershipInfo.billingContact?.email) {
        validation.errors.push('ขาดข้อมูล: อีเมลติดต่อ');
      }

      // Recommendations
      if (!ownershipInfo.taxId && !ownershipInfo.primaryOwner?.taxId && !ownershipInfo.organization?.taxId) {
        validation.recommendations.push('แนะนำให้เพิ่มเลขประจำตัวผู้เสียภาษีเพื่อการออกใบกำกับภาษี');
      }

      if (!ownershipInfo.primaryOwner?.address && !ownershipInfo.billingContact?.address && !ownershipInfo.organization?.address) {
        validation.recommendations.push('แนะนำให้เพิ่มที่อยู่สำหรับการจัดส่งเอกสาร');
      }

      if (!ownershipInfo.primaryOwner?.phone && !ownershipInfo.billingContact?.phone) {
        validation.recommendations.push('แนะนำให้เพิ่มเบอร์โทรศัพท์ติดต่อ');
      }

      if (!ownershipInfo.organization && ownershipInfo.primaryOwner?.ownerType === 'corporate') {
        validation.recommendations.push('แนะนำให้เพิ่มข้อมูลองค์กรสำหรับธุรกิจ');
      }

      // Recalculate readiness based on critical errors
      validation.isReady = validation.errors.length === 0;

      console.log('✅ Billing readiness validated:', {
        isReady: validation.isReady,
        score: validation.score,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length,
        recommendationsCount: validation.recommendations.length
      });
      
      return validation;
      
    } catch (error) {
      console.error('❌ OwnershipService.validateBillingReadiness() error:', error);
      
      // Return fallback validation instead of throwing error
      const fallbackValidation = {
        isReady: false,
        score: 0,
        errors: ['ไม่สามารถเชื่อมต่อกับระบบจัดการข้อมูลเจ้าของได้'],
        warnings: ['กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง'],
        recommendations: ['ตรวจสอบการตั้งค่าระบบและข้อมูลเจ้าของ']
      };
      
      console.log('🔄 Returning fallback validation due to error');
      return fallbackValidation;
    }
  }

  // ===== 🔄 OWNERSHIP UPDATE METHODS =====

  /**
   * 🔄 อัพเดทข้อมูลเจ้าของ
   * @param {string} collectionId - Collection ID
   * @param {Object} updateData - ข้อมูลที่ต้องการอัพเดท
   * @returns {Promise<Object>} ผลลัพธ์การอัพเดท
   */
  async updateOwnershipInfo(collectionId, updateData) {
    try {
      console.log('🔄 OwnershipService.updateOwnershipInfo():', collectionId, updateData);
      
      // Clear cache for this collection
      this.clearCacheForCollection(collectionId);
      
      // Prepare ownership data with proper structure
      const ownershipData = {
        collectionId: collectionId,
        primaryOwner: updateData.primaryOwner || {},
        billingContact: updateData.billingContact || updateData.primaryOwner || {},
        technicalContact: updateData.technicalContact || updateData.primaryOwner || {},
        organization: updateData.organization || { name: '', taxId: '', address: '' },
        updatedAt: new Date().toISOString(),
        history: updateData.history || []
      };

      // Try to update existing record first
      const existingOwnership = await this.apiRequest.apiCall('', 'PUT', 'ownership', {
        filter: { collectionId: collectionId },
        update: ownershipData
      });

      if (!existingOwnership.success) {
        // Create new ownership record if update failed
        ownershipData.createdAt = new Date().toISOString();
        const newOwnership = await this.apiRequest.apiCall('', 'POST', 'ownership', ownershipData);
        if (!newOwnership.success) {
          throw new Error('Failed to create ownership record');
        }
      }

      // Return updated ownership info
      const updatedOwnership = await this.getOwnershipInfo(collectionId);
      
      console.log('✅ Ownership info updated successfully');
      return updatedOwnership;
      
    } catch (error) {
      console.error('❌ OwnershipService.updateOwnershipInfo() error:', error);
      throw error;
    }
  }

  // ===== 🧹 CACHE MANAGEMENT =====

  /**
   * 📋 ดึงข้อมูลจาก cache
   * @param {string} key - Cache key
   * @returns {*} Cached data or null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * 💾 บันทึกข้อมูลลง cache
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 ล้าง cache สำหรับ collection
   * @param {string} collectionId - Collection ID
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

  /**
   * 🧹 ล้าง cache ทั้งหมด
   */
  clearAllCaches() {
    this.cache.clear();
  }

  /**
   * 📊 สถิติ cache
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default OwnershipService; 
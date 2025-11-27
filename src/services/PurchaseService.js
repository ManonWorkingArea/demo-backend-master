/**
 * Purchase Service
 * จัดการข้อมูล Suppliers, Purchase Requests, Purchase Orders
 * ผ่าน CorporateConfig API
 */

import inventoryService from './InventoryService.js'

class PurchaseService {
  constructor() {
    this.apiRequest = null
    this.clientKey = null // จะดึงจาก ERP_CORE ตอน initialize
    this.initialized = false
    this.cache = {
      suppliers: [],
      purchaseRequests: [],
      purchaseOrders: [],
      lastUpdated: null
    }
  }

  /**
   * Initialize with Vue app instance (for $Request service)
   * @param {Object} vueAppOrInstance - Vue app.config.globalProperties or component instance
   */
  initialize(vueAppOrInstance) {
    // ✅ ตั้งแต่ตอนเริ่มต้น ให้ดึง clientKey จาก ERP_CORE ก่อน
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    // Try to get $Request from various sources
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      
      // ✅ Backup: ถ้าไม่มี key จาก ERP_CORE จึงใช้ fallback
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.$Key || null
      }
      
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [PurchaseService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : (vueAppOrInstance.$Key ? 'vueApp.$Key' : 'fallback'),
        erpCoreKey: !!window.ERP_CORE?.clientKey,
        initialized: this.initialized
      })
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      
      // ✅ Backup: ถ้าไม่มี key จาก ERP_CORE จึงใช้ fallback
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.appContext.config.globalProperties.$Key || null
      }
      
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [PurchaseService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'appContext.$Key',
        erpCoreKey: !!window.ERP_CORE?.clientKey,
        initialized: this.initialized
      })
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      // ✅ Backup: ถ้าไม่มี key จาก ERP_CORE จึงใช้ fallback
      if (!this.clientKey) {
        this.clientKey = window.vueApp.$Key || null
      }
      this.apiRequest = window.vueApp.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || window.vueApp.$Key || null
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [PurchaseService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'window.vueApp.$Key',
        erpCoreKey: !!window.ERP_CORE?.clientKey,
        initialized: this.initialized
      })
    } else {
      console.error('❌ PurchaseService: No $Request service found!')
      console.log('Available properties:', Object.keys(vueAppOrInstance || {}))
      this.initialized = false
    }
  }

  // ==================== Suppliers ====================

  /**
   * Get all suppliers (exclude soft deleted)
   */
  async getAllSuppliers() {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized. Please call initialize(vueApp) first.')
    }

    // ✅ Refresh clientKey จาก ERP_CORE ก่อนใช้งาน
    this.refreshClientKey()

    try {
      const response = await this.apiRequest.POST('suppliers/aggregate', {
        pipeline: [
          { 
            $match: { 
              status: { $ne: 'deleted' }  // ✅ ไม่แสดงข้อมูลที่ถูก soft delete
            } 
          }
        ]
      }, this.clientKey)

      if (response && response.data) {
        // ✅ แปลง _id เป็น id สำหรับ Vue component
        const suppliers = response.data.map(supplier => ({
          ...supplier,
          id: supplier._id || supplier.id
        }))
        
        this.cache.suppliers = suppliers
        this.cache.lastUpdated = new Date()
        return suppliers
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get suppliers:', error)
      throw error
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(supplierId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`suppliers/${supplierId}`, this.clientKey)
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get supplier:', error)
      throw error
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(supplierData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.POST('suppliers', {
        data: supplierData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.suppliers = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to create supplier:', error)
      throw error
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(supplierId, supplierData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.PUT(`suppliers/${supplierId}`, {
        data: supplierData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.suppliers = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update supplier:', error)
      throw error
    }
  }

  /**
   * Delete supplier (Soft Delete - เปลี่ยนสถานะเป็น 'deleted')
   */
  async deleteSupplier(supplierId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for delete supplier operation')
    }

    try {
      console.log('🗑️ [PurchaseService] Soft deleting supplier:', supplierId, 'with key:', clientKey.slice(-4))
      
      // ✅ PUT method: เปลี่ยนสถานะเป็น deleted (Soft Delete)
      const deleteData = {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`suppliers/${supplierId}`, {
        data: deleteData
      }, clientKey)
      
      // Invalidate cache
      this.cache.suppliers = []
      this.cache.lastUpdated = null
      
      console.log('✅ [PurchaseService] Supplier soft deleted successfully:', supplierId)
      return response?.data || response
    } catch (error) {
      console.error('❌ Failed to soft delete supplier:', error)
      throw error
    }
  }

  /**
   * Restore soft deleted supplier (change status back from 'deleted')
   * ✅ กู้คืนซัพพลายเออร์ที่ถูก soft delete
   */
  async restoreSupplier(supplierId, newStatus = 'inactive') {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for restore supplier operation')
    }

    try {
      console.log('♻️ [PurchaseService] Restoring supplier:', supplierId, 'to status:', newStatus)
      
      const restoreData = {
        status: newStatus,
        deleted_at: null,
        restored_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`suppliers/${supplierId}`, {
        data: restoreData
      }, clientKey)
      
      // Invalidate cache
      this.cache.suppliers = []
      this.cache.lastUpdated = null
      
      console.log('✅ [PurchaseService] Supplier restored successfully:', supplierId)
      return response?.data || response
    } catch (error) {
      console.error('❌ Failed to restore supplier:', error)
      throw error
    }
  }

  /**
   * Get single supplier by ID (including deleted ones)
   * ✅ ดึงข้อมูล supplier เดี่ยวๆ โดย ID (รวมที่ถูก soft delete)
   */
  async getSupplierById(supplierId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    if (!supplierId) {
      throw new Error('Supplier ID is required')
    }

    // ✅ Refresh clientKey จาก ERP_CORE ก่อนใช้งาน
    this.refreshClientKey()

    try {
      console.log('🔍 [PurchaseService] Getting supplier by ID:', supplierId)
      
      // ✅ ใช้ GET endpoint เพื่อดึงข้อมูลเดี่ยว
      const response = await this.apiRequest.GET(`suppliers/${supplierId}`, this.clientKey)
      
      if (response && response.data) {
        const supplier = response.data
        return {
          ...supplier,
          id: supplier._id || supplier.id
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Failed to get supplier by ID:', supplierId, error)
      
      // ถ้า GET ไม่ได้ (ไม่มี endpoint) ให้ fallback ไป aggregate
      try {
        console.log('🔄 [PurchaseService] Fallback to aggregate method for supplier:', supplierId)
        
        const response = await this.apiRequest.POST('suppliers/aggregate', {
          pipeline: [
            { $match: { $or: [{ _id: supplierId }, { id: supplierId }] } },
            { $limit: 1 }
          ]
        }, this.clientKey)

        const suppliers = response?.data || []
        
        if (suppliers.length > 0) {
          const supplier = suppliers[0]
          return {
            ...supplier,
            id: supplier._id || supplier.id
          }
        }
        
        return null
      } catch (aggregateError) {
        console.error('❌ Aggregate fallback also failed:', aggregateError)
        throw aggregateError
      }
    }
  }

  /**
   * Get products supplied by a specific supplier
   * ✅ ดึงข้อมูล products ที่ supplier นี้จัดหา โดยใช้ InventoryService
   */
  async getSupplierProducts(supplierId) {
    if (!supplierId) {
      throw new Error('Supplier ID is required')
    }

    try {
      console.log('📦 [PurchaseService] Getting products for supplier via InventoryService:', supplierId)
      
      // ✅ ตรวจสอบว่า InventoryService พร้อมใช้งาน
      if (!inventoryService.isReady()) {
        console.log('🔧 [PurchaseService] Initializing InventoryService...')
        // ใช้ apiRequest เดียวกันกับ PurchaseService
        const dummyInstance = {
          $Request: this.apiRequest,
          $Key: this.clientKey
        }
        inventoryService.initialize(dummyInstance)
      }
      
      // ✅ ใช้ InventoryService.getAllProductsIncludingDeleted() เพื่อดึงทุก status รวม deleted
      const allProducts = await inventoryService.getAllProductsIncludingDeleted()
      
      // ✅ Filter products ที่เป็นของ supplier นี้
      const supplierProducts = allProducts.filter(product => {
        // ตรวจสอบหลาย field ที่อาจมี supplier_id
        return (
          product.supplier_id === supplierId ||
          (Array.isArray(product.suppliers) && product.suppliers.includes(supplierId)) ||
          product.supplier === supplierId ||
          product.preferred_supplier === supplierId
        )
      })
      
      // ✅ Map ข้อมูลให้ตรงกับ format ที่ Detail.vue ต้องการ
      const formattedProducts = supplierProducts.map(product => ({
        _id: product._id || product.id,
        id: product._id || product.id,
        product_code: product.product_code || product.sku || product.code,
        sku: product.sku || product.product_code,
        name: product.product_name || product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        unit: product.unit,
        cost_price: product.cost_price || product.unit_price,
        selling_price: product.selling_price || product.price,
        stock_quantity: product.balance?.quantity || product.stock_quantity || 0,
        min_stock_level: product.min_stock || product.min_stock_level,
        status: product.status,
        supplier_id: product.supplier_id,
        supplier: product.supplier,
        last_purchase_date: product.last_purchase_date,
        last_purchase_price: product.last_purchase_price,
        createdAt: product.createdAt || product.created_at,
        updatedAt: product.updatedAt || product.updated_at,
        deleted_at: product.deleted_at
      }))
      
      // ✅ Sort by name
      formattedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      
      console.log(`📦 [PurchaseService] Found ${formattedProducts.length} products for supplier ${supplierId}`)
      return formattedProducts
      
    } catch (error) {
      console.error('❌ Failed to get supplier products via InventoryService:', supplierId, error)
      throw error
    }
  }

  /**
   * Get supplier with products included
   * ✅ ดึงข้อมูล supplier พร้อม products ที่จัดหา
   */
  async getSupplierWithProducts(supplierId) {
    if (!supplierId) {
      throw new Error('Supplier ID is required')
    }

    try {
      console.log('🔍📦 [PurchaseService] Getting supplier with products:', supplierId)
      
      // ดึงข้อมูล supplier และ products พร้อมกัน
      const [supplier, products] = await Promise.all([
        this.getSupplierById(supplierId),
        this.getSupplierProducts(supplierId)
      ])
      
      if (!supplier) {
        return null
      }
      
      return {
        ...supplier,
        products: products,
        products_count: products.length,
        active_products_count: products.filter(p => p.status === 'active').length
      }
      
    } catch (error) {
      console.error('❌ Failed to get supplier with products:', supplierId, error)
      throw error
    }
  }

  /**
   * Get all suppliers including soft deleted (for admin/restore purposes)
   * ✅ ดึงข้อมูลซัพพลายเออร์ทั้งหมด รวมที่ถูก soft delete (สำหรับ admin)
   */
  async getAllSuppliersIncludingDeleted() {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      // Load all suppliers without status filter
      const response = await this.apiRequest.POST('suppliers/aggregate', {
        pipeline: [{ $match: {} }]  // ✅ ไม่กรอง status เพื่อแสดงทุก record
      }, this.clientKey)

      const suppliersData = response?.data || []

      return suppliersData.map(supplier => ({
        ...supplier,
        id: supplier._id || supplier.id
      }))
    } catch (error) {
      console.error('❌ Failed to get all suppliers including deleted:', error)
      throw error
    }
  }

  /**
   * Permanently delete supplier (DANGEROUS - admin only)
   * ✅ ลบจริงออกจาก database (สำหรับ admin เท่านั้น)
   */
  async permanentDeleteSupplier(supplierId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for permanent delete supplier operation')
    }

    try {
      console.log('💀 [PurchaseService] PERMANENT DELETE supplier:', supplierId, 'with key:', clientKey.slice(-4))
      console.warn('⚠️ [PurchaseService] This will permanently delete the supplier from database!')
      
      // ✅ DELETE method: ลบจริงออกจาก database
      const response = await this.apiRequest.DELETE(`suppliers/${supplierId}`, clientKey)
      
      // Invalidate cache
      this.cache.suppliers = []
      this.cache.lastUpdated = null
      
      console.log('💀 [PurchaseService] Supplier permanently deleted:', supplierId)
      return response
    } catch (error) {
      console.error('❌ Failed to permanently delete supplier:', error)
      throw error
    }
  }

  // ==================== Purchase Requests ====================

  /**
   * Get all purchase requests
   */
  async getAllPurchaseRequests() {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('purchase_requests/aggregate', {
        pipeline: [
          { $match: {} }
        ]
      }, this.clientKey)

      if (response && response.data) {
        const requests = response.data.map(request => ({
          ...request,
          id: request._id || request.id
        }))
        
        this.cache.purchaseRequests = requests
        this.cache.lastUpdated = new Date()
        return requests
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get purchase requests:', error)
      throw error
    }
  }

  /**
   * Get purchase request by ID
   */
  async getPurchaseRequest(requestId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`purchase_requests/${requestId}`, this.clientKey)
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get purchase request:', error)
      throw error
    }
  }

  /**
   * Create new Purchase Request
   */
  async createPurchaseRequest(requestData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    // ✅ Refresh clientKey จาก ERP_CORE ก่อนสร้าง Purchase Request
    this.refreshClientKey()

    try {
      console.log('📝 [PurchaseService] Creating new purchase request with clientKey:', this.clientKey)
      console.log('📊 Request Data:', requestData)

      // ✅ Wrap ข้อมูลด้วย data object ตามที่ API คาดหวัง
      const requestPayload = {
        data: requestData
      }

      const response = await this.apiRequest.POST('purchase_requests', requestPayload, this.clientKey)
      
      console.log('✅ [PurchaseService] Purchase request created successfully:', response)

      // ✅ Update sequence in database after successful creation
      if (response?.data && requestData.purchase_request_code) {
        console.log('🔄 [PurchaseService] Updating sequence after successful purchase request creation...')
        
        try {
          const sequenceUpdateResult = await this.updateSequenceInDatabase(requestData.purchase_request_code, 'purchase')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [PurchaseService] Sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [PurchaseService] Sequence update failed but purchase request was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [PurchaseService] Sequence update error (non-critical):', sequenceError)
          // ไม่ throw error เพราะ purchase request สร้างสำเร็จแล้ว
        }
      } else {
        console.warn('⚠️ [PurchaseService] No purchase_request_code found for sequence update')
      }
      
      // ✅ Return standardized format ที่ components คาดหวัง
      return {
        success: true,
        data: response.data,
        message: 'สร้างใบขอซื้อสินค้าเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ [PurchaseService] Failed to create purchase request:', error)
      throw error
    }
  }

  /**
   * Update purchase request
   */
  async updatePurchaseRequest(requestId, requestData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.PUT(`purchase_requests/${requestId}`, {
        data: requestData
      }, this.clientKey)
      
      this.cache.purchaseRequests = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update purchase request:', error)
      throw error
    }
  }

  /**
   * Delete purchase request
   */
  async deletePurchaseRequest(requestId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      // ✅ DELETE method: clientKey เป็น parameter ที่ 2
      const response = await this.apiRequest.DELETE(`purchase_requests/${requestId}`, this.clientKey)
      
      this.cache.purchaseRequests = []
      this.cache.lastUpdated = null
      
      return response
    } catch (error) {
      console.error('❌ Failed to delete purchase request:', error)
      throw error
    }
  }

  // ==================== Purchase Orders ====================

  /**
   * Get all purchase orders
   */
  async getAllPurchaseOrders() {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('purchase_orders/aggregate', {
        pipeline: [
          { $match: {} }
        ]
      }, this.clientKey)

      if (response && response.data) {
        const orders = response.data.map(order => ({
          ...order,
          id: order._id || order.id
        }))
        
        this.cache.purchaseOrders = orders
        this.cache.lastUpdated = new Date()
        return orders
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get purchase orders:', error)
      throw error
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(orderId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`purchase_orders/${orderId}`, this.clientKey)
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get purchase order:', error)
      throw error
    }
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(orderData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('purchase_orders', {
        data: orderData
      }, this.clientKey)
      
      this.cache.purchaseOrders = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to create purchase order:', error)
      throw error
    }
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(orderId, orderData) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      const response = await this.apiRequest.PUT(`purchase_orders/${orderId}`, {
        data: orderData
      }, this.clientKey)
      
      this.cache.purchaseOrders = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update purchase order:', error)
      throw error
    }
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(orderId) {
    if (!this.apiRequest) {
      throw new Error('PurchaseService not initialized')
    }

    try {
      // ✅ DELETE method: clientKey เป็น parameter ที่ 2
      const response = await this.apiRequest.DELETE(`purchase_orders/${orderId}`, this.clientKey)
      
      this.cache.purchaseOrders = []
      this.cache.lastUpdated = null
      
      return response
    } catch (error) {
      console.error('❌ Failed to delete purchase order:', error)
      throw error
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      suppliers: [],
      purchaseRequests: [],
      purchaseOrders: [],
      lastUpdated: null
    }
    console.log('🧹 PurchaseService cache cleared')
  }

  /**
   * Auto-initialize with ERP_CORE
   */
  async init() {
    if (this.initialized) {
      return true
    }

    try {
      // ตรวจสอบ ERP_CORE
      if (window.ERP_CORE && window.ERP_CORE.request) {
        this.apiRequest = window.ERP_CORE.request
        this.clientKey = window.ERP_CORE.clientKey
        this.initialized = true
        
        console.log('🔄 [PurchaseService] Auto-initialized with ERP_CORE')
        return true
      }
      
      // ถ้าไม่มี ERP_CORE ให้รอสักครู่แล้วลองใหม่
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (window.ERP_CORE && window.ERP_CORE.request) {
        this.apiRequest = window.ERP_CORE.request
        this.clientKey = window.ERP_CORE.clientKey
        this.initialized = true
        
        console.log('🔄 [PurchaseService] Auto-initialized with ERP_CORE (delayed)')
        return true
      }
      
      throw new Error('ERP_CORE not available')
    } catch (error) {
      console.error('❌ [PurchaseService] Init failed:', error)
      return false
    }
  }

  /**
   * ✅ Force refresh clientKey จาก ERP_CORE
   */
  refreshClientKey() {
    const oldKey = this.clientKey
    
    // ✅ ลำดับความสำคัญ: ERP_CORE มาก่อนเสมอ
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    console.log('🔄 [PurchaseService] refreshClientKey:', {
      oldKey: oldKey ? '***' + oldKey.slice(-4) : 'null',
      newKey: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
      changed: oldKey !== this.clientKey,
      source: this.clientKey ? 'ERP_CORE' : 'null',
      erpCoreAvailable: !!window.ERP_CORE,
      erpCoreClientKey: !!window.ERP_CORE?.clientKey
    })
    
    return this.clientKey
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.initialized && this.apiRequest !== null
  }

  // ==================== Sequence Management ====================

  /**
   * ✅ Update sequence in corporate_config database after successful purchase request creation
   * รูปแบบเดียวกับ InventoryService.updateSequenceInDatabase() แต่มีการ mapping ที่ชาญฉลาด
   */
  async updateSequenceInDatabase(generatedCode, moduleType = 'purchase') {
    if (!this.apiRequest) {
      console.warn('⚠️ [PurchaseService] updateSequenceInDatabase: Service not initialized')
      return { success: false, reason: 'service_not_initialized' }
    }

    if (!generatedCode) {
      console.warn('⚠️ [PurchaseService] updateSequenceInDatabase: No generated code provided')
      return { success: false, reason: 'no_generated_code' }
    }

    try {
      console.log(`🔄 [PurchaseService] Updating sequence for ${moduleType} after successful creation:`, generatedCode)

      // ✅ Extract sequence number from generated code
      const sequenceNumber = this.extractSequenceFromCode(generatedCode)
      
      if (!sequenceNumber) {
        console.warn('⚠️ [PurchaseService] Could not extract sequence number from code:', generatedCode)
        return { success: false, reason: 'sequence_extraction_failed' }
      }

      console.log(`🔢 [PurchaseService] Extracted sequence number: ${sequenceNumber} from code: ${generatedCode}`)

      // ✅ Smart mapping: ตรวจสอบว่ารหัสที่สร้างมาเป็นแบบไหน
      let targetConfigKey
      
      if (generatedCode.startsWith('PRX')) {
        // PRX = Purchase Request (ใช้ number_series.purchase.purchaseRequest)
        targetConfigKey = 'number_series.purchase.purchaseRequest'
        console.log('🎯 [PurchaseService] Detected PRX prefix → Using purchaseRequest config')
      } else if (generatedCode.startsWith('PR')) {
        // PR = Purchase Order (ใช้ number_series.purchase)
        targetConfigKey = 'number_series.purchase'
        console.log('🎯 [PurchaseService] Detected PR prefix → Using purchase config')
      } else {
        // Fallback: ใช้ purchase.purchaseRequest สำหรับ purchase request
        targetConfigKey = 'number_series.purchase.purchaseRequest'
        console.log('🎯 [PurchaseService] Unknown prefix → Fallback to purchaseRequest config')
      }

      // ✅ Use AccountingSettings.saveConfig instead of update_by_key
      const accountingSettings = window.ERP_CORE?.accounting
      if (!accountingSettings) {
        console.warn('⚠️ [PurchaseService] No accounting settings available')
        return { success: false, reason: 'no_accounting_settings' }
      }

      // ✅ Initialize if needed
      if (!accountingSettings.initialized) {
        if (window.vueApp?.$Request) {
          accountingSettings.initialize(window.vueApp)
        }
      }

      // ✅ Load current config first
      await accountingSettings.loadSettings()
      const currentConfig = await accountingSettings.getConfig(targetConfigKey)

      // ✅ Prepare updated config data
      let configToSave

      if (currentConfig) {
        // Update existing config
        configToSave = {
          ...currentConfig,
          sequence: {
            ...currentConfig.sequence,
            current: sequenceNumber,
            next: sequenceNumber + 1,
            lastUpdated: new Date().toISOString()
          },
          updatedAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        }
      } else {
        // Create new config (fallback)
        configToSave = {
          prefix: generatedCode.startsWith('PRX') ? 'PRX' : 'PR',
          format: '{prefix}{year}{sequence}',
          sequence: {
            digits: 5,
            start: 1,
            current: sequenceNumber,
            next: sequenceNumber + 1,
            resetOnYearChange: true,
            lastUpdated: new Date().toISOString()
          },
          resetPeriod: 'yearly',
          updatedAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        }
      }

      console.log('📝 [PurchaseService] Saving config:', { targetConfigKey, configToSave })

      // ✅ Use AccountingSettings.saveConfig (correct method!)
      await accountingSettings.saveConfig(targetConfigKey, configToSave, {
        name: `Number Series for Purchase Order - ใบสั่งซื้อ - ${targetConfigKey.includes('purchaseRequest') ? 'PurchaseRequest' : 'Purchase'}`,
        description: `รูปแบบเลขที่เอกสารสำหรับ Purchase Order - ใบสั่งซื้อ - ${targetConfigKey.includes('purchaseRequest') ? 'PurchaseRequest' : 'Purchase'}`
      })

      console.log(`✅ [PurchaseService] Successfully updated sequence to ${sequenceNumber} for ${targetConfigKey}`)
      return { 
        success: true, 
        updatedSequence: sequenceNumber,
        configKey: targetConfigKey,
        method: 'AccountingSettings.saveConfig'
      }

    } catch (error) {
      console.error('❌ [PurchaseService] Failed to update sequence in database:', error)
      return { success: false, reason: 'api_error', error: error.message }
    }
  }

  /**
   * ✅ Extract pure sequence number from generated code
   * รูปแบบเดียวกับ InventoryService.extractSequenceFromCode()
   */
  extractSequenceFromCode(generatedCode) {
    if (!generatedCode || typeof generatedCode !== 'string') {
      return null
    }

    try {
      console.log('🔍 [PurchaseService] Extracting sequence from code:', generatedCode)

      // ✅ Pattern 1: PRX2025XXXXX (ตรงกับ config ที่ user ให้มา - prefix: "PRX")
      const pattern1 = /^PRX\d{4}(\d+)$/
      const match1 = generatedCode.match(pattern1)
      if (match1) {
        const sequence = parseInt(match1[1], 10)
        console.log(`✅ [PurchaseService] PRX Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Pattern 2: PR2025XXXXX (fallback pattern สำหรับ number_series.purchase)
      const pattern2 = /^PR\d{4}(\d+)$/
      const match2 = generatedCode.match(pattern2)
      if (match2) {
        const sequence = parseInt(match2[1], 10)
        console.log(`✅ [PurchaseService] PR Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Pattern 3: Pure number at the end (อย่างน้อย 1 หลัก สำหรับ 5 digits)
      const pattern3 = /(\d{1,5})$/
      const match3 = generatedCode.match(pattern3)
      if (match3) {
        const sequence = parseInt(match3[1], 10)
        console.log(`✅ [PurchaseService] Number Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Pattern 4: Any number in the code (fallback)
      const pattern4 = /(\d+)/g
      const matches4 = generatedCode.match(pattern4)
      if (matches4 && matches4.length > 0) {
        // ใช้ตัวเลขตัวสุดท้าย (มักจะเป็น sequence)
        const sequence = parseInt(matches4[matches4.length - 1], 10)
        console.log(`🔄 [PurchaseService] Fallback Pattern match: ${sequence}`)
        return sequence
      }

      console.warn('⚠️ [PurchaseService] No sequence pattern matched for code:', generatedCode)
      return null

    } catch (error) {
      console.error('❌ [PurchaseService] Error extracting sequence from code:', generatedCode, error)
      return null
    }
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService()
export default purchaseService

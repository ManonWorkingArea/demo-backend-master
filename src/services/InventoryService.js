/**
 * Inventory Service
 * จัดการข้อมูล Stock Locations, Products, และ Inventory Transactions
 * ผ่าน CorporateConfig API
 */

class InventoryService {
  constructor() {
    this.apiRequest = null
    this.clientKey = null
    this.initialized = false
    this.cache = {
      stockLocations: [],
      products: [],
      lastUpdated: null
    }
  }

  /**
   * Initialize with Vue app instance (for $Request service)
   * @param {Object} vueAppOrInstance - Vue app.config.globalProperties or component instance
   */
  initialize(vueAppOrInstance) {
    // Try to get $Request from various sources
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || vueAppOrInstance.$Key || null
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [InventoryService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : (vueAppOrInstance.$Key ? 'vueApp.$Key' : 'fallback'),
        initialized: this.initialized
      })
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || vueAppOrInstance.appContext.config.globalProperties.$Key || null
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [InventoryService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'appContext.$Key',
        initialized: this.initialized
      })
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || window.vueApp.$Key || null
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [InventoryService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'window.vueApp.$Key',
        initialized: this.initialized
      })
    } else {
      console.error('❌ InventoryService: No $Request service found!')
      console.log('Available properties:', Object.keys(vueAppOrInstance || {}))
      this.initialized = false
    }
  }

  // ==================== Purchase Orders ====================

  /**
   * ✅ Get approved purchase orders ready for goods receipt
   * เปลี่ยนจาก purchase_requests เป็นใช้ purchase_orders API
   */
  async getApprovedPurchaseOrders() {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('🛒 [InventoryService] Fetching approved purchase requests for goods receipt...')
      
      // ✅ ใช้ purchase_requests API (ถูกต้องแล้ว)
      const response = await this.apiRequest.POST('purchase_requests/aggregate', {
        pipeline: [
          {
            $match: {
              // Purchase Request ที่ approved แล้วและยังไม่เสร็จสิ้น
              status: 'approved',
              state: { $nin: ['cancelled', 'complete', 'received'] }
            }
          },
          {
            $sort: { createdAt: -1 }
          }
        ]
      }, this.clientKey)

      const purchaseOrders = response?.data || []
      
      console.log(`✅ [InventoryService] Found ${purchaseOrders.length} approved purchase orders via Purchase API`)
      console.log('🔍 [InventoryService] Raw purchase orders data:', JSON.stringify(purchaseOrders, null, 2))
      
      // แปลงข้อมูลให้เป็นรูปแบบมาตรฐาน
      const normalizedPOs = purchaseOrders.map(po => {
        console.log(`🔍 [InventoryService] Processing PO:`, po.purchase_request_code, 'Items:', po.items?.length || 0)
        
        return {
          ...po,
          id: po._id || po.id,
          po_number: po.purchase_request_code || po.po_number || po.id,
          supplier_name: po.supplier_suggestion || po.supplier || 'ไม่ระบุ',
          created_date: po.createdAt || po.created_at,
          // Map items to normalized format with proper product_id
          items: (po.items || []).map(item => {
            console.log(`🔍 [InventoryService] Item product_id:`, item.product_id, 'SKU:', item.sku)
            return {
              ...item,
              product_id: item.product_id || null,
              sku: item.sku || item.product_code || '',
              product_name: item.product_name || item.description || '',
              quantity: item.quantity || 0,
              unit: item.unit || 'ชิ้น',
              unit_price: item.unit_price || 0,
              total: item.total || (item.quantity * item.unit_price) || 0,
              category: item.category || 'general'
            }
          })
        }
      })
      
      return normalizedPOs

    } catch (error) {
      console.error('❌ [InventoryService] Failed to get approved purchase orders:', error)
      throw error
    }
  }

  /**
   * Update Purchase Order status
   * อัปเดตสถานะใบขอซื้อ
   */
  async updatePurchaseOrderStatus(poId, status, additionalData = {}) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for update purchase order operation')
    }

    try {
      console.log(`📝 [InventoryService] Updating PO ${poId} status to: ${status} via Purchase API`)
      
      const updateData = {
        ...additionalData,
        status: status,
        workflow_state: status,
        updated_at: new Date().toISOString()
      }
      
      // ✅ ใช้ dedicated purchase_requests API แทน transaction API
      const response = await this.apiRequest.PUT(`purchase_requests/${poId}`, {
        data: updateData
      }, clientKey)
      
      console.log(`✅ [InventoryService] PO ${poId} status updated successfully via Purchase API`)
      return response?.data || response
    } catch (error) {
      console.error('❌ [InventoryService] Failed to update purchase order status:', error)
      throw error
    }
  }

  // ==================== Stock Locations ====================

  /**
   * Get all stock locations
   */
  async getAllStockLocations() {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized. Please call initialize(vueApp) first.')
    }

    try {
      const response = await this.apiRequest.POST('stock_locations/aggregate', {
        pipeline: [
          { $match: {} }
        ]
      }, this.clientKey)

      if (response && response.data) {
        // ✅ แปลง _id เป็น id สำหรับ Vue component
        const locations = response.data.map(location => ({
          ...location,
          id: location._id || location.id
        }))
        
        this.cache.stockLocations = locations
        this.cache.lastUpdated = new Date()
        return locations
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get stock locations:', error)
      throw error
    }
  }

  /**
   * Get stock location by ID
   */
  async getStockLocation(locationId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`stock_locations/${locationId}`, this.clientKey)
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get stock location:', error)
      throw error
    }
  }

  /**
   * Create new stock location
   */
  async createStockLocation(locationData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.POST('stock_locations', {
        data: locationData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.stockLocations = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to create stock location:', error)
      throw error
    }
  }

  /**
   * Update stock location
   */
  async updateStockLocation(locationId, locationData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.PUT(`stock_locations/${locationId}`, {
        data: locationData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.stockLocations = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update stock location:', error)
      throw error
    }
  }

  /**
   * Delete stock location
   */
  async deleteStockLocation(locationId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    // ✅ ตรวจสอบและดึง clientKey ก่อนใช้งาน
    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for delete stock location operation')
    }

    try {
      // ✅ DELETE method: clientKey เป็น parameter ที่ 2 (ไม่มี body)
      const response = await this.apiRequest.DELETE(`stock_locations/${locationId}`, clientKey)
      
      // Invalidate cache
      this.cache.stockLocations = []
      this.cache.lastUpdated = null
      
      return response
    } catch (error) {
      console.error('❌ Failed to delete stock location:', error)
      throw error
    }
  }

  // ==================== Products ====================

  /**
   * Get all products with inventory balance (exclude soft deleted)
   */
  async getAllProducts() {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // Load products and balance data in parallel
      // ✅ Soft Delete: ไม่แสดงสินค้าที่มี status = 'deleted'
      const [productsResponse, balanceResponse] = await Promise.all([
        this.apiRequest.POST('products/aggregate', {
          pipeline: [
            { 
              $match: { 
                status: { $ne: 'deleted' }  // ✅ ไม่รวมสินค้าที่ถูก soft delete
              } 
            }
          ]
        }, this.clientKey),
        this.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: [{ $match: {} }]
        }, this.clientKey)
      ])

      const productsData = productsResponse?.data || []
      const balanceData = balanceResponse?.data || []

      // ✅ แปลง _id เป็น id และรวมข้อมูล balance
      const products = productsData.map(product => {
        const balance = balanceData.find(b => 
          b.product_id === product._id || 
          b.product_id === product.id ||
          b.product_sku === product.sku ||
          b.sku === product.sku
        )

        return {
          ...product,
          id: product._id || product.id,
          balance: balance || null
        }
      })

      this.cache.products = products
      this.cache.lastUpdated = new Date()
      return products
    } catch (error) {
      console.error('❌ Failed to get products:', error)
      throw error
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`products/${productId}`, this.clientKey)
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to get product:', error)
      throw error
    }
  }

  /**
   * ✅ Get product with complete inventory data (Balance, Items, Movements)
   * ใช้ aggregate pipeline เพื่อดึงข้อมูลครบถ้วนในคำขอเดียว
   */
  async getProductWithInventoryData(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('📦 [InventoryService] Loading product with inventory data:', productId)

      // ขั้นตอนที่ 1: ดึงข้อมูล product ก่อน (แบบง่าย)
      const response = await this.apiRequest.POST('products/aggregate', {
        pipeline: [
          {
            $match: {
              _id: productId
            }
          }
        ]
      }, this.clientKey)

      const productData = response?.data?.[0]

      if (!productData) {
        console.warn('⚠️ [InventoryService] Product not found:', productId)
        return null
      }

      console.log('✅ [InventoryService] Product found:', productData.sku)

      // ขั้นตอนที่ 2: ดึงข้อมูล inventory แยกต่างหาก
      const [balanceData, itemsData, movementsData, lotReservationsData] = await Promise.all([
        // Balance data - ค้นหาด้วยหลายเงื่อนไข
        this.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { product_id: productId },
                  { product_id: productData._id },
                  { sku: productData.sku },
                  { product_code: productData.product_code },
                  { product_code: productData.sku }
                ]
              }
            }
          ]
        }, this.clientKey),
        // Items data - ค้นหาด้วยหลายเงื่อนไข
        this.apiRequest.POST('inventory_items/aggregate', {
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { product_id: productId },
                      { product_id: productData._id },
                      { sku: productData.sku },
                      { product_code: productData.product_code },
                      { product_code: productData.sku }
                    ]
                  },
                  { status: { $ne: 'deleted' } }
                ]
              }
            },
            {
              $sort: { location_code: 1, created_at: -1 }
            }
          ]
        }, this.clientKey),
        // Movements data - ค้นหาด้วยหลายเงื่อนไข
        this.apiRequest.POST('stock_movements/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { product_id: productId },
                  { product_id: productData._id },
                  { sku: productData.sku },
                  { product_code: productData.product_code }
                ]
              }
            },
            {
              $sort: { movement_date: -1, created_at: -1 }
            },
            {
              $limit: 20
            }
          ]
        }, this.clientKey),
        // ✅ Lot Reservations data - New lot-based reservation system
        this.apiRequest.POST('lot_reservations/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { product_id: productId },
                  { product_id: productData._id },
                  { product_code: productData.sku },
                  { product_code: productData.product_code }
                ]
              }
            },
            {
              $lookup: {
                from: 'lot_tracking',
                localField: 'lot_id',
                foreignField: 'lot_id',
                as: 'lot_info'
              }
            },
            {
              $unwind: {
                path: '$lot_info',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $sort: { created_at: -1 }
            }
          ]
        }, this.clientKey)
      ])

      const balance = balanceData?.data?.[0] || null
      const items = itemsData?.data || []
      const movements = movementsData?.data || []
      const lotReservations = lotReservationsData?.data || []

      // ✅ Debug: แสดงผลลัพธ์การ match
      console.log('🔍 [InventoryService] Match Results Debug:', {
        productId: productId,
        productData: {
          _id: productData._id,
          sku: productData.sku,
          product_code: productData.product_code
        },
        balance: {
          found: !!balance,
          data: balance ? {
            product_id: balance.product_id,
            sku: balance.sku,
            product_code: balance.product_code,
            qty_on_hand: balance.qty_on_hand
          } : null
        },
        items: {
          count: items.length,
          sample: items[0] ? {
            product_id: items[0].product_id,
            sku: items[0].sku,
            product_code: items[0].product_code,
            location_code: items[0].location_code
          } : null
        },
        movements: {
          count: movements.length,
          sample: movements[0] ? {
            product_id: movements[0].product_id,
            sku: movements[0].sku,
            movement_type: movements[0].movement_type
          } : null
        }
      })

      console.log('✅ [InventoryService] Inventory data loaded:', {
        balance: !!balance,
        items: items.length,
        movements: movements.length,
        lotReservations: lotReservations.length
      })

      // ✅ แสดงข้อมูลที่จะ return
      const resultData = {
        ...productData,
        id: productData._id || productData.id,
        // ข้อมูล summary
        current_stock: balance?.qty_on_hand || 0,
        available_stock: balance?.qty_available || 0,
        reserved_stock: balance?.qty_reserved || 0,
        total_locations: items.length,
        total_movements: movements.length,
        // ข้อมูลแยกตาม type
        balance: balance,
        locations: items,
        movements: movements,
        // ✅ Use new lot-based reservations instead of filtering from movements
        reservations: lotReservations
      }

      console.log('🔍 [InventoryService] Final Return Data Summary:', {
        id: resultData.id,
        sku: resultData.sku,
        current_stock: resultData.current_stock,
        available_stock: resultData.available_stock,
        reserved_stock: resultData.reserved_stock,
        total_locations: resultData.total_locations,
        total_movements: resultData.total_movements,
        hasBalance: !!resultData.balance,
        locationsCount: resultData.locations?.length || 0,
        movementsCount: resultData.movements?.length || 0,
        reservationsCount: resultData.reservations?.length || 0
      })

      // ✅ แสดงรายละเอียด locations และ movements
      if (resultData.locations.length > 0) {
        console.log('📍 [InventoryService] Locations Detail:', resultData.locations.map(loc => ({
          location_code: loc.location_code,
          quantity: loc.quantity,
          unit: loc.unit
        })))
      }

      if (resultData.movements.length > 0) {
        console.log('📈 [InventoryService] Movements Detail:', resultData.movements.map(move => ({
          movement_type: move.movement_type,
          quantity: move.quantity,
          movement_date: move.movement_date,
          location_code: move.location_code
        })))
      }

      return resultData

    } catch (error) {
      console.error('❌ [InventoryService] Failed to load product with inventory data:', error)
      throw error
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.POST('products', {
        data: productData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.products = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to create product:', error)
      throw error
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // ✅ ลบ _id ออกจาก productData ก่อนส่ง (MongoDB immutable field)
      const cleanData = { ...productData }
      if (cleanData._id !== undefined) {
        console.log('[InventoryService] Removing _id from product update data:', cleanData._id)
        delete cleanData._id
      }
      
      // ✅ Wrap data ตาม API format
      const response = await this.apiRequest.PUT(`products/${productId}`, {
        data: cleanData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.products = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update product:', error)
      throw error
    }
  }

  /**
   * Soft Delete product (change status to 'deleted' instead of actual deletion)
   * ✅ ป้องกันการลบโดยไม่ได้ตั้งใจ โดยการเปลี่ยน status แทนการลบจริง
   */
  async deleteProduct(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    // ✅ ตรวจสอบและดึง clientKey ก่อนใช้งาน
    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      console.error('❌ [InventoryService] No client key available for soft delete product request')
      throw new Error('Client key is required for soft delete product operation')
    }

    try {
      console.log('🗑️ [InventoryService] Soft deleting product:', productId, 'with key:', clientKey.slice(-4))
      
      // ✅ Soft Delete: อัปเดต status เป็น 'deleted' แทนการลบจริง
      const softDeleteData = {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // ✅ ใช้ PUT เพื่ออัปเดต status แทนการ DELETE
      const response = await this.apiRequest.PUT(`products/${productId}`, {
        data: softDeleteData
      }, clientKey)
      
      // Invalidate cache เพื่อให้ refresh ข้อมูล
      this.cache.products = []
      this.cache.lastUpdated = null
      
      console.log('✅ [InventoryService] Product soft deleted successfully:', productId)
      return response?.data || response
    } catch (error) {
      console.error('❌ Failed to soft delete product:', error)
      throw error
    }
  }

  // ==================== Inventory Balance ====================

  /**
   * Get inventory balance for a product
   */
  async getInventoryBalance(productId, locationId = null) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const matchCriteria = { product_id: productId }
      if (locationId) {
        matchCriteria.location_id = locationId
      }

      const response = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          { $match: matchCriteria }
        ]
      }, this.clientKey)

      return response?.data || []
    } catch (error) {
      console.error('❌ Failed to get inventory balance:', error)
      throw error
    }
  }

  /**
   * Get inventory balance by location
   */
  async getInventoryByLocation(locationId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          { $match: { location_id: locationId } },
          {
            $lookup: {
              from: 'products',
              localField: 'product_id',
              foreignField: 'id',
              as: 'product'
            }
          },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
        ]
      }, this.clientKey)

      return response?.data || []
    } catch (error) {
      console.error('❌ Failed to get inventory by location:', error)
      throw error
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      stockLocations: [],
      products: [],
      lastUpdated: null
    }
    console.log('🧹 InventoryService cache cleared')
  }

  /**
   * Restore soft deleted product (change status back from 'deleted')
   * ✅ กู้คืนสินค้าที่ถูก soft delete
   */
  async restoreProduct(productId, newStatus = 'inactive') {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for restore product operation')
    }

    try {
      console.log('♻️ [InventoryService] Restoring product:', productId, 'to status:', newStatus)
      
      const restoreData = {
        status: newStatus,
        deleted_at: null,
        restored_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`products/${productId}`, {
        data: restoreData
      }, clientKey)
      
      // Invalidate cache
      this.cache.products = []
      this.cache.lastUpdated = null
      
      console.log('✅ [InventoryService] Product restored successfully:', productId)
      return response?.data || response
    } catch (error) {
      console.error('❌ Failed to restore product:', error)
      throw error
    }
  }

  /**
   * Get all products including soft deleted (for admin/restore purposes)
   * ✅ ดึงข้อมูลสินค้าทั้งหมด รวมที่ถูก soft delete (สำหรับ admin)
   */
  async getAllProductsIncludingDeleted() {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // Load all products without status filter
      const [productsResponse, balanceResponse] = await Promise.all([
        this.apiRequest.POST('products/aggregate', {
          pipeline: [{ $match: {} }]  // ✅ ไม่กรอง status เพื่อแสดงทุก record
        }, this.clientKey),
        this.apiRequest.POST('inventory_balance/aggregate', {
          pipeline: [{ $match: {} }]
        }, this.clientKey)
      ])

      const productsData = productsResponse?.data || []
      const balanceData = balanceResponse?.data || []

      const products = productsData.map(product => {
        const balance = balanceData.find(b => 
          b.product_id === product._id || 
          b.product_id === product.id ||
          b.product_sku === product.sku ||
          b.sku === product.sku
        )

        return {
          ...product,
          id: product._id || product.id,
          balance: balance || null
        }
      })

      return products
    } catch (error) {
      console.error('❌ Failed to get all products including deleted:', error)
      throw error
    }
  }

  // ==================== LOT TRACKING MANAGEMENT ====================

  /**
   * ✅ เพิ่ม Lot Tracking ใหม่สำหรับสินค้า
   * @param {Object} lotData - ข้อมูล lot ที่จะสร้าง
   * @returns {Promise<Object>} ผลลัพธ์การสร้าง lot
   */
  async addLotTracking(lotData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for add lot tracking operation')
    }

    try {
      console.log('➕ [InventoryService] Adding new lot tracking:', lotData)

      // Validate required fields
      if (!lotData.product_id) {
        throw new Error('product_id is required')
      }
      if (!lotData.lot_code) {
        throw new Error('lot_code is required')
      }
      if (!lotData.calculated_meters || lotData.calculated_meters <= 0) {
        throw new Error('calculated_meters (ความยาว) must be greater than 0')
      }
      // weight_kg is now optional - if not provided, will calculate from product.weight_per_meter

      // Get product info for textile data
      const product = await this.getProduct(lotData.product_id)
      if (!product) {
        throw new Error('Product not found')
      }

      // Auto-generate lot_id if not provided
      const lotId = lotData.lot_id || this.generateLotId()
      
      // Generate full_lot_code
      const fullLotCode = lotData.full_lot_code || this.generateFullLotCode(
        product.model_code,
        product.color_code,
        product.fabric_width_cm,
        lotData.lot_code
      )

      // ✅ คำนวณน้ำหนักและ meters_per_kg
      let weightKg = lotData.weight_kg
      let metersPerKg = lotData.meters_per_kg

      if (!weightKg || weightKg <= 0) {
        // ไม่ได้ระบุน้ำหนัก → คำนวณจาก weight_per_meter ของสินค้า
        const weightPerMeter = product.weight_per_meter || 0.3 // default 0.3 kg/m
        weightKg = parseFloat((lotData.calculated_meters * weightPerMeter).toFixed(2))
        metersPerKg = weightPerMeter > 0 ? parseFloat((1 / weightPerMeter).toFixed(4)) : 0
        console.log(`📐 Calculated weight from product: ${weightKg} kg (${weightPerMeter} kg/m)`)
      } else {
        // ระบุน้ำหนักมา → คำนวณ meters_per_kg จากค่าจริง
        metersPerKg = parseFloat((lotData.calculated_meters / weightKg).toFixed(4))
        console.log(`📐 Using provided weight: ${weightKg} kg, meters_per_kg: ${metersPerKg}`)
      }

      const calculatedMeters = parseFloat(lotData.calculated_meters.toFixed(2))

      // Prepare lot tracking data
      const newLotData = {
        // Basic lot info
        lot_id: lotId,
        lot_code: lotData.lot_code,
        full_lot_code: fullLotCode,
        
        // Product reference
        product_id: lotData.product_id,
        sku: product.sku,
        product_name: product.product_name,
        
        // Textile data from product
        model_code: product.model_code,
        color_code: product.color_code,
        fabric_width_cm: product.fabric_width_cm,
        fabric_type: product.fabric_type,
        fabric_composition: product.fabric_composition,
        gsm: product.gsm,
        thread_count: product.thread_count,
        weight_per_meter: product.weight_per_meter,
        
        // Weight and meters
        weight_kg: weightKg,
        calculated_meters: calculatedMeters,
        remaining_meters: calculatedMeters,
        used_meters: 0,
        reserved_meters: 0,
        meters_per_kg: metersPerKg, // ✅ เพิ่มสำหรับการชั่งสต็อค
        
        // Location
        location_code: lotData.location_code || 'WH-01',
        rack_position: lotData.rack_position || '',
        rack_id: lotData.rack_id || '',
        
        // Receipt info
        supplier_name: lotData.supplier_name || product.supplier || 'ไม่ระบุ',
        purchase_order_id: lotData.purchase_order_id || null,
        inventory_item_id: lotData.inventory_item_id || null,
        received_date: lotData.received_date || new Date().toISOString().split('T')[0],
        received_by: lotData.received_by || 'system',
        
        // Status
        status: 'full',
        tracking_enabled: true,
        created_from: lotData.created_from || 'manual',
        created_by: lotData.created_by || 'system',
        
        // Notes
        notes: lotData.notes || '',
        
        // Usage history
        usage_history: [{
          date: lotData.received_date || new Date().toISOString().split('T')[0],
          action: 'received',
          used_meters: 0,
          remaining_meters: calculatedMeters,
          sale_id: null,
          notes: 'เพิ่ม Lot ใหม่'
        }],
        
        // Timestamps
        created_at: new Date(),
        updated_at: new Date()
      }

      // Create lot tracking record
      const response = await this.apiRequest.POST('lot_tracking', {
        data: newLotData
      }, clientKey)

      if (response?.data) {
        console.log('✅ [InventoryService] Lot tracking created:', response.data)
        
        // Update product balance
        try {
          await this.updateProductBalance({
            product_id: lotData.product_id,
            sku: product.sku,
            quantity_change: calculatedMeters,
            transaction_type: 'lot_added',
            unit_price: lotData.unit_price || product.unit_price || 0
          })
        } catch (balanceError) {
          console.warn('⚠️ Failed to update balance after adding lot:', balanceError)
        }
        
        return {
          success: true,
          data: response.data,
          message: `เพิ่ม Lot ${lotData.lot_code} สำเร็จ (${calculatedMeters} เมตร)`
        }
      }
      
      throw new Error('Failed to create lot tracking record')
      
    } catch (error) {
      console.error('❌ [InventoryService] Failed to add lot tracking:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }

  /**
   * ✅ แก้ไข Lot Tracking
   * @param {string} lotId - ID ของ lot ที่จะแก้ไข (_id)
   * @param {Object} updateData - ข้อมูลที่จะอัปเดต
   * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
   */
  async updateLotTracking(lotId, updateData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for update lot tracking operation')
    }

    try {
      console.log('📝 [InventoryService] Updating lot tracking:', lotId)

      // Get current lot data
      const currentLot = await this.apiRequest.GET(`lot_tracking/${lotId}`, clientKey)
      if (!currentLot?.data) {
        throw new Error('Lot not found')
      }

      const lot = currentLot.data

      // Prepare update data (only fields that can be updated)
      const updatableData = {
        notes: updateData.notes !== undefined ? updateData.notes : lot.notes,
        location_code: updateData.location_code !== undefined ? updateData.location_code : lot.location_code,
        rack_position: updateData.rack_position !== undefined ? updateData.rack_position : lot.rack_position,
        rack_id: updateData.rack_id !== undefined ? updateData.rack_id : lot.rack_id,
        supplier_name: updateData.supplier_name !== undefined ? updateData.supplier_name : lot.supplier_name,
        status: updateData.status !== undefined ? updateData.status : lot.status,
        updated_at: new Date()
      }

      // ✅ If meters or weight changed, recalculate meters_per_kg
      if ((updateData.calculated_meters !== undefined && updateData.calculated_meters !== lot.calculated_meters) ||
          (updateData.weight_kg !== undefined && updateData.weight_kg !== lot.weight_kg)) {
        
        const newMeters = updateData.calculated_meters !== undefined ? updateData.calculated_meters : lot.calculated_meters
        const newWeight = updateData.weight_kg !== undefined ? updateData.weight_kg : lot.weight_kg
        
        if (newWeight > 0) {
          const newMetersPerKg = parseFloat((newMeters / newWeight).toFixed(4))
          const metersDiff = newMeters - lot.calculated_meters
          
          updatableData.calculated_meters = newMeters
          updatableData.weight_kg = newWeight
          updatableData.meters_per_kg = newMetersPerKg
          updatableData.remaining_meters = lot.remaining_meters + metersDiff

          // Add to usage history
          const usageHistory = [...(lot.usage_history || [])]
          usageHistory.push({
            date: new Date().toISOString().split('T')[0],
            action: 'data_adjusted',
            used_meters: 0,
            remaining_meters: updatableData.remaining_meters,
            sale_id: null,
            notes: `ปรับข้อมูล: ${newMeters} ม., ${newWeight} กก., ${newMetersPerKg} ม./กก.`
          })
          updatableData.usage_history = usageHistory
        }
      }

      // Update lot tracking
      const response = await this.apiRequest.PUT(`lot_tracking/${lotId}`, {
        data: updatableData
      }, clientKey)

      if (response?.data) {
        console.log('✅ [InventoryService] Lot tracking updated:', response.data)
        return {
          success: true,
          data: response.data,
          message: 'อัปเดต Lot สำเร็จ'
        }
      }
      
      throw new Error('Failed to update lot tracking')
      
    } catch (error) {
      console.error('❌ [InventoryService] Failed to update lot tracking:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }

  /**
   * ✅ ลบ Lot Tracking
   * @param {string} lotId - ID ของ lot ที่จะลบ (_id)
   * @param {boolean} permanent - ลบถาวร (true) หรือ soft delete (false)
   * @returns {Promise<Object>} ผลลัพธ์การลบ
   */
  async deleteLotTracking(lotId, permanent = false) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for delete lot tracking operation')
    }

    try {
      console.log('🗑️ [InventoryService] Deleting lot tracking:', lotId, 'Permanent:', permanent)

      // Get lot data first
      const lotResponse = await this.apiRequest.GET(`lot_tracking/${lotId}`, clientKey)
      if (!lotResponse?.data) {
        throw new Error('Lot not found')
      }

      const lot = lotResponse.data

      // Check if lot has been used or reserved
      if (lot.used_meters > 0 && !permanent) {
        throw new Error('ไม่สามารถลบ Lot ที่มีการใช้งานแล้ว กรุณาใช้ permanent delete หรือปรับสถานะเป็น inactive')
      }

      if (lot.reserved_meters > 0 && !permanent) {
        throw new Error('ไม่สามารถลบ Lot ที่มีการจองแล้ว กรุณายกเลิกการจองก่อน')
      }

      let response

      if (permanent) {
        // Permanent delete
        response = await this.apiRequest.DELETE(`lot_tracking/${lotId}`, clientKey)
        console.log('🗑️ [InventoryService] Lot permanently deleted')
      } else {
        // Soft delete - change status to 'deleted'
        response = await this.apiRequest.PUT(`lot_tracking/${lotId}`, {
          data: {
            status: 'deleted',
            updated_at: new Date()
          }
        }, clientKey)
        console.log('🗑️ [InventoryService] Lot soft deleted (status changed to deleted)')
      }

      // Update product balance (subtract the lot meters)
      try {
        const product = await this.getProduct(lot.product_id)
        await this.updateProductBalance({
          product_id: lot.product_id,
          sku: lot.sku,
          quantity_change: -lot.remaining_meters,
          transaction_type: 'lot_deleted',
          unit_price: product.unit_price || 0
        })
      } catch (balanceError) {
        console.warn('⚠️ Failed to update balance after deleting lot:', balanceError)
      }

      return {
        success: true,
        data: response?.data || lot,
        message: permanent ? 'ลบ Lot ถาวรสำเร็จ' : 'ลบ Lot สำเร็จ (Soft Delete)'
      }
      
    } catch (error) {
      console.error('❌ [InventoryService] Failed to delete lot tracking:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }

  /**
   * ✅ กู้คืน Lot Tracking ที่ถูก soft delete
   * @param {string} lotId - ID ของ lot ที่จะกู้คืน
   * @returns {Promise<Object>} ผลลัพธ์การกู้คืน
   */
  async restoreLotTracking(lotId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for restore lot tracking operation')
    }

    try {
      console.log('♻️ [InventoryService] Restoring lot tracking:', lotId)

      // Get lot data
      const lotResponse = await this.apiRequest.GET(`lot_tracking/${lotId}`, clientKey)
      if (!lotResponse?.data) {
        throw new Error('Lot not found')
      }

      const lot = lotResponse.data

      if (lot.status !== 'deleted') {
        throw new Error('Lot is not in deleted status')
      }

      // Restore - change status back to 'full' or 'partial'
      const newStatus = lot.used_meters > 0 ? 'partial' : 'full'
      
      const response = await this.apiRequest.PUT(`lot_tracking/${lotId}`, {
        data: {
          status: newStatus,
          updated_at: new Date()
        }
      }, clientKey)

      // Update product balance (add back the lot meters)
      try {
        const product = await this.getProduct(lot.product_id)
        await this.updateProductBalance({
          product_id: lot.product_id,
          sku: lot.sku,
          quantity_change: lot.remaining_meters,
          transaction_type: 'lot_restored',
          unit_price: product.unit_price || 0
        })
      } catch (balanceError) {
        console.warn('⚠️ Failed to update balance after restoring lot:', balanceError)
      }

      console.log('✅ [InventoryService] Lot restored successfully')
      return {
        success: true,
        data: response?.data,
        message: 'กู้คืน Lot สำเร็จ'
      }
      
    } catch (error) {
      console.error('❌ [InventoryService] Failed to restore lot tracking:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }

  /**
   * ✅ Helper: Generate Lot ID
   */
  generateLotId() {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `LOT-${year}${month}${day}-${random}`
  }

  /**
   * ✅ Helper: Generate Full Lot Code
   */
  generateFullLotCode(modelCode, colorCode, fabricWidth, lotCode) {
    const model = String(modelCode || '000').padStart(3, '0')
    const color = String(colorCode || '000').padStart(3, '0')
    const width = String(fabricWidth || 0).padStart(3, '0')
    const lot = String(lotCode || '00000')
    return `${model}${color}${width}${lot}`
  }

  /**
   * ✅ ดึงข้อมูล Lot Tracking ของสินค้า พร้อมข้อมูลการจองแยกตามประเภท
   * @param {string} productId - ID ของสินค้า
   * @returns {Promise<Array>} รายการ lots พร้อมข้อมูลการจอง (temporary_reserved_meters, permanent_reserved_meters)
   */
  async getLotTracking(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null

    try {
      // Step 1: Get lot tracking data
      const response = await this.apiRequest.POST('lot_tracking/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: productId,
              status: { $ne: 'deleted' } // Exclude deleted by default
            }
          },
          { $sort: { received_date: -1, created_at: -1 } }
        ]
      }, clientKey)

      const lots = response?.data || []

      // Step 2: Get reservation breakdown by lot
      const reservationResponse = await this.apiRequest.POST('lot_reservations/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: productId,
              status: { $ne: 'cancelled' }
            }
          },
          {
            $group: {
              _id: '$lot_id',
              temporary_reserved: {
                $sum: {
                  $cond: [
                    { 
                      $or: [
                        { $in: ['$payment_status', ['unpaid', 'deposit']] },
                        { $eq: [{ $ifNull: ['$payment_status', 'unpaid'] }, 'unpaid'] },
                        { $eq: [{ $ifNull: ['$payment_status', 'unpaid'] }, 'deposit'] }
                      ]
                    },
                    '$reserved_meters',
                    0
                  ]
                }
              },
              permanent_reserved: {
                $sum: {
                  $cond: [
                    { $eq: ['$payment_status', 'paid'] },
                    '$reserved_meters',
                    0
                  ]
                }
              },
              total_reserved: { $sum: '$reserved_meters' }
            }
          }
        ]
      }, clientKey)

      const reservationsByLot = reservationResponse?.data || []

      // Step 3: Get scrap/sample/defective breakdown by lot
      const scrapResponse = await this.apiRequest.POST('stock_movements/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: productId,
              $or: [
                { is_scrap: true },
                { is_sample: true },
                { transaction_type: { $in: ['scrap_return', 'sample_return', 'defective_disposal'] } }
              ]
            }
          },
          {
            $group: {
              _id: {
                lot_id: '$lot_id',
                type: {
                  $cond: [
                    { $eq: ['$is_scrap', true] }, 'scrap',
                    { $cond: [
                      { $eq: ['$is_sample', true] }, 'sample',
                      'defective'
                    ]}
                  ]
                }
              },
              total_meters: { $sum: '$quantity' },
              location_code: { $first: '$location_code' }
            }
          },
          {
            $group: {
              _id: '$_id.lot_id',
              scrap_meters: {
                $sum: {
                  $cond: [{ $eq: ['$_id.type', 'scrap'] }, '$total_meters', 0]
                }
              },
              sample_meters: {
                $sum: {
                  $cond: [{ $eq: ['$_id.type', 'sample'] }, '$total_meters', 0]
                }
              },
              defective_meters: {
                $sum: {
                  $cond: [{ $eq: ['$_id.type', 'defective'] }, '$total_meters', 0]
                }
              }
            }
          }
        ]
      }, clientKey)

      const scrapDataByLot = scrapResponse?.data || []

      // Step 4: Merge reservation data and scrap data with lot data
      const lotsWithReservations = lots.map(lot => {
        const reservation = reservationsByLot.find(r => 
          String(r._id) === String(lot._id) || 
          String(r._id) === String(lot.lot_id)
        )

        const scrapData = scrapDataByLot.find(s =>
          String(s._id) === String(lot._id) ||
          String(s._id) === String(lot.lot_id)
        )

        return {
          ...lot,
          temporary_reserved_meters: reservation?.temporary_reserved || 0,
          permanent_reserved_meters: reservation?.permanent_reserved || 0,
          // ✅ ใช้ total_reserved จาก aggregation เป็นหลัก (อัปเดตตาม reservation จริงๆ)
          // ไม่ใช้ lot.reserved_meters ที่อาจจะไม่ sync
          reserved_meters: reservation?.total_reserved || 0,
          // ✅ เพิ่มข้อมูล scrap/sample/defective
          scrap_meters: scrapData?.scrap_meters || 0,
          sample_meters: scrapData?.sample_meters || 0,
          defective_meters: scrapData?.defective_meters || 0
        }
      })

      return lotsWithReservations
    } catch (error) {
      console.error('❌ Failed to get lot tracking:', error)
      return []
    }
  }

  /**
   * ✅ Search products by barcode, SKU, or product code
   * ค้นหาสินค้าจาก barcode, SKU หรือ product_code
   * หรือค้นหาจาก lot_tracking (lot_code, full_lot_code)
   */
  async searchProductByBarcode(barcode) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('🔍 [InventoryService] Searching product by barcode:', barcode)
      
      // Step 1: Try to find from products table first
      const productResponse = await this.apiRequest.POST('products/aggregate', {
        pipeline: [
          {
            $match: {
              $or: [
                { sku: barcode },
                { barcode: barcode },
                { product_code: barcode }
              ],
              status: { $ne: 'deleted' }
            }
          },
          { $limit: 1 }
        ]
      }, this.clientKey)

      let product = null
      let matchedLot = null
      const products = productResponse?.data || []
      
      if (products.length > 0) {
        product = products[0]
        console.log('✅ Found product from products table:', product.sku)
      } else {
        // Step 2: If not found in products, search in lot_tracking
        console.log('🔍 Searching in lot_tracking...')
        const lotResponse = await this.apiRequest.POST('lot_tracking/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { lot_code: barcode },
                  { full_lot_code: barcode },
                  { barcode: barcode }
                ]
              }
            },
            { $limit: 1 }
          ]
        }, this.clientKey)

        const lots = lotResponse?.data || []
        
        if (lots.length > 0) {
          matchedLot = lots[0]
          console.log('✅ Found lot:', matchedLot.lot_code, 'for product:', matchedLot.product_id)
          
          // Get product from lot's product_id
          const productByIdResponse = await this.apiRequest.GET(`products/${matchedLot.product_id}`, this.clientKey)
          product = productByIdResponse?.data || null
        }
      }

      if (!product) {
        console.log('❌ No product found for barcode:', barcode)
        return null
      }

      // Get product balance from lot_tracking (more accurate than inventory_balance)
      const productId = product._id || product.id
      const lotTrackingResponse = await this.apiRequest.POST('lot_tracking/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: productId,
              status: { $ne: 'deleted' }
            }
          },
          {
            $group: {
              _id: null,
              total_remaining: { $sum: { $ifNull: ['$remaining_meters', { $ifNull: ['$calculated_meters', 0] }] } },
              total_reserved: { $sum: { $ifNull: ['$reserved_meters', 0] } },
              lot_count: { $sum: 1 }
            }
          }
        ]
      }, this.clientKey)

      const lotSummary = lotTrackingResponse?.data?.[0] || null
      
      // Calculate balance from lot tracking
      const balance = {
        qty_on_hand: lotSummary?.total_remaining || 0,
        qty_reserved: lotSummary?.total_reserved || 0,
        qty_available: (lotSummary?.total_remaining || 0) - (lotSummary?.total_reserved || 0),
        lot_count: lotSummary?.lot_count || 0
      }

      const result = {
        ...product,
        id: product._id || product.id,
        balance: balance
      }

      // If found via lot, attach the matched lot info
      if (matchedLot) {
        result.matchedLot = matchedLot
      }

      console.log('✅ Search complete:', result.sku, matchedLot ? '(via lot)' : '(direct)', 'Balance:', balance)
      return result
    } catch (error) {
      console.error('❌ Failed to search product by barcode:', error)
      throw error
    }
  }

  /**
   * Permanently delete product (DANGEROUS - admin only)
   * ✅ ลบจริงออกจาก database (สำหรับ admin เท่านั้น)
   */
  async permanentDeleteProduct(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for permanent delete product operation')
    }

    try {
      console.log('💀 [InventoryService] PERMANENT DELETE product:', productId, 'with key:', clientKey.slice(-4))
      console.warn('⚠️ [InventoryService] This will permanently delete the product from database!')
      
      // ✅ DELETE method: ลบจริงออกจาก database
      const response = await this.apiRequest.DELETE(`products/${productId}`, clientKey)
      
      // Invalidate cache
      this.cache.products = []
      this.cache.lastUpdated = null
      
      console.log('💀 [InventoryService] Product permanently deleted:', productId)
      return response
    } catch (error) {
      console.error('❌ Failed to permanently delete product:', error)
      throw error
    }
  }

  /**
   * ✅ Process Goods Receipt - รับเข้าสินค้าจาก Purchase Order
   * สร้าง Inventory Items, Stock Movements และ Balance Records
   */
  async processGoodsReceipt(goodsReceiptData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('🔄 [InventoryService] Processing goods receipt:', goodsReceiptData)

    const { 
      purchase_order_id,
      po_number,
      received_date,
      received_by,
      notes: receipt_notes,
      items = []
    } = goodsReceiptData

    const results = {
      inventoryItems: [],
      stockMovements: [],
      balanceUpdates: [],
      errors: []
    }

    try {
      // Process each item that has received_quantity > 0
      for (const item of items) {
        if (item.received_quantity > 0 && item.location && item.product_id) {
          try {
            console.log(`🔄 Processing item: ${item.sku} - ${item.product_name}`)

            // 1. ✅ Create or Update Inventory Item
            const inventoryResult = await this.createOrUpdateInventoryItem({
              product_id: item.product_id,
              product_code: item.product_code || item.sku,
              sku: item.sku,
              product_name: item.product_name,
              quantity: item.received_quantity,
              unit: item.unit,
              unit_price: item.unit_price || 0,
              location_code: item.location,
              category: item.category || 'general',
              supplier_id: item.supplier_id,
              purchase_order_id,
              received_date,
              received_by,
              notes: item.notes || '',
              // 🔥 เพิ่มข้อมูล rack position
              rack_position: item.rack_position,
              rack_id: item.rack_id,
              // 🔥 เพิ่มข้อมูล lot tracking สำหรับสินค้าผ้า
              lots: item.lots || null,
              is_textile: item.is_textile || false,
              lot_tracking_enabled: item.lot_tracking_enabled || false
            })

            results.inventoryItems.push(inventoryResult)

            // 🔥 2.1. สร้าง Lot Records หากเป็น textile product ที่มี lot tracking
            if (item.lot_tracking_enabled && item.lots && item.lots.length > 0) {
              for (const lot of item.lots) {
                try {
                  const lotRecord = await this.createLotRecord({
                    inventory_item_id: inventoryResult.data._id,
                    product_id: item.product_id,
                    sku: item.sku,
                    product_name: item.product_name,
                    lot_code: lot.lot_code,
                    lot_id: lot.lot_id,
                    full_lot_code: lot.full_lot_code, // ✅ เพิ่มรหัส lot เต็ม
                    weight_kg: lot.weight_kg,
                    calculated_meters: lot.calculated_meters,
                    supplier_name: lot.supplier_name,
                    notes: lot.notes || '',
                    location_code: item.location,
                    // 🔥 เพิ่ม rack position สำหรับ lot tracking
                    rack_position: item.rack_position,
                    rack_id: item.rack_id,
                    purchase_order_id,
                    received_date: lot.received_date || received_date,
                    received_by,
                    status: lot.status || 'full', // ✅ เพิ่มสถานะม้วน
                    // ✅ เพิ่มข้อมูลสิ่งทอ
                    model_code: lot.model_code || item.model_code,
                    color_code: lot.color_code || item.color_code,
                    fabric_width_cm: lot.fabric_width_cm || item.fabric_width_cm,
                    fabric_type: lot.fabric_type || item.fabric_type,
                    fabric_composition: lot.fabric_composition || item.fabric_composition,
                    gsm: lot.gsm || item.gsm,
                    thread_count: lot.thread_count || item.thread_count,
                    weight_per_meter: lot.weight_per_meter || item.weight_per_meter
                  })
                  
                  // เพิ่ม lot record ลงใน results
                  if (!results.lotRecords) results.lotRecords = []
                  results.lotRecords.push(lotRecord)
                  
                  console.log(`✅ Created lot record with textile data: ${lot.lot_code} (${lot.full_lot_code}) for ${item.sku}`)
                  
                } catch (lotError) {
                  console.error(`❌ Failed to create lot record for ${lot.lot_code}:`, lotError)
                  results.errors.push({
                    item: `${item.sku} - Lot ${lot.lot_code}`,
                    error: lotError.message
                  })
                }
              }
            }

            // 2. ✅ Create Stock Movement Record
            const movementResult = await this.createStockMovement({
              product_id: item.product_id,
              sku: item.sku,
              product_name: item.product_name,
              movement_type: 'IN',
              transaction_type: 'goods_receipt',
              quantity: item.received_quantity,
              unit: item.unit,
              unit_price: item.unit_price || 0,
              location_code: item.location,
              reference_type: 'purchase_order',
              reference_id: purchase_order_id,
              reference_number: po_number,
              movement_date: received_date,
              created_by: received_by,
              notes: `Goods receipt from PO ${po_number || purchase_order_id}${item.notes ? ' - ' + item.notes : ''}${receipt_notes ? ' | Receipt notes: ' + receipt_notes : ''}`
            })

            results.stockMovements.push(movementResult)

            // 3. ✅ Update or Create Product Balance
            const balanceResult = await this.updateProductBalance({
              product_id: item.product_id,
              sku: item.sku,
              product_name: item.product_name,
              unit: item.unit,
              category: item.category || 'general',
              quantity_change: item.received_quantity,
              unit_cost: item.unit_price || 0,
              movement_type: 'IN',
              updated_by: received_by
            })

            results.balanceUpdates.push(balanceResult)

            console.log(`✅ Successfully processed item: ${item.sku}`)

          } catch (itemError) {
            console.error(`❌ Error processing item ${item.sku}:`, itemError)
            results.errors.push({
              item: item.sku,
              error: itemError.message
            })
          }
        }
      }

      console.log('✅ [InventoryService] Goods receipt processed successfully:', results)
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Failed to process goods receipt:', error)
      throw error
    }
  }

  /**
   * ✅ Create or Update Inventory Item
   */
  async createOrUpdateInventoryItem(itemData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // Check if inventory item already exists at this location
      const existingItems = await this.apiRequest.POST('inventory_items/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: itemData.product_id,
              location_code: itemData.location_code,
              status: { $ne: 'deleted' }
            }
          }
        ]
      }, this.clientKey)

      const existingItem = existingItems?.data?.[0]

      if (existingItem) {
        // Update existing inventory
        const updatedQuantity = (existingItem.quantity || 0) + itemData.quantity
        
        const updateData = {
          quantity: updatedQuantity,
          unit_price: itemData.unit_price,
          last_received_date: itemData.received_date,
          last_received_by: itemData.received_by,
          last_purchase_order_id: itemData.purchase_order_id,
          updated_by: itemData.received_by,
          updated_at: new Date().toISOString(),
          notes: `${existingItem.notes || ''} [Updated from PO: ${itemData.purchase_order_id} on ${itemData.received_date}]`.trim(),
          // 🔥 อัปเดต rack position หากมี
          rack_position: itemData.rack_position || existingItem.rack_position,
          rack_id: itemData.rack_id || existingItem.rack_id,
          // 🔥 อัปเดตข้อมูล Lot หากมี (merge หรือ replace ตามกรณี)
          lots: itemData.lots ? this.mergeLots(existingItem.lots, itemData.lots) : (existingItem.lots || null),
          is_textile: itemData.is_textile || existingItem.is_textile || false,
          lot_tracking_enabled: itemData.lot_tracking_enabled || existingItem.lot_tracking_enabled || false
        }

        const result = await this.apiRequest.PUT(`inventory_items/${existingItem._id}`, { data: updateData }, this.clientKey)
        console.log(`✅ Updated existing inventory item: ${itemData.sku}`)
        return { action: 'updated', data: result.data, item: itemData.sku }

      } else {
        // Create new inventory item
        const newItemData = {
          product_id: itemData.product_id,
          product_code: itemData.product_code,
          sku: itemData.sku,
          product_name: itemData.product_name,
          description: `${itemData.product_name} - Received from PO ${itemData.purchase_order_id}`,
          quantity: itemData.quantity,
          unit: itemData.unit,
          unit_price: itemData.unit_price,
          location_code: itemData.location_code,
          category: itemData.category,
          supplier_id: itemData.supplier_id,
          purchase_order_id: itemData.purchase_order_id,
          received_date: itemData.received_date,
          received_by: itemData.received_by,
          last_received_date: itemData.received_date,
          last_received_by: itemData.received_by,
          last_purchase_order_id: itemData.purchase_order_id,
          status: 'active',
          notes: itemData.notes,
          created_from: 'goods_receipt',
          created_by: itemData.received_by,
          created_at: new Date().toISOString(),
          // 🔥 เพิ่มข้อมูล rack position
          rack_position: itemData.rack_position,
          rack_id: itemData.rack_id,
          // 🔥 เพิ่มข้อมูล Lot Tracking สำหรับสินค้าผ้า
          lots: itemData.lots || null,
          is_textile: itemData.is_textile || false,
          lot_tracking_enabled: itemData.lot_tracking_enabled || false
        }

        console.log('📦 [InventoryService] Creating inventory item:', JSON.stringify(newItemData, null, 2))

        const result = await this.apiRequest.POST('inventory_items', { data: newItemData }, this.clientKey)
        console.log(`✅ Created new inventory item: ${itemData.sku}`)
        return { action: 'created', data: result.data, item: itemData.sku }
      }

    } catch (error) {
      console.error('❌ Failed to create/update inventory item:', error)
      throw error
    }
  }

  /**
   * ✅ Create Stock Movement Record
   */
  async createStockMovement(movementData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const stockMovementData = {
        product_id: movementData.product_id,
        sku: movementData.sku,
        product_name: movementData.product_name,
        movement_type: movementData.movement_type, // 'IN' or 'OUT'
        transaction_type: movementData.transaction_type, // 'goods_receipt', 'adjustment', etc.
        quantity: movementData.quantity,
        unit: movementData.unit,
        unit_price: movementData.unit_price,
        total_value: movementData.quantity * movementData.unit_price,
        location_code: movementData.location_code,
        reference_type: movementData.reference_type, // 'purchase_order', 'sales_order', etc.
        reference_id: movementData.reference_id,
        reference_number: movementData.reference_number,
        movement_date: movementData.movement_date,
        notes: movementData.notes,
        status: 'completed',
        created_by: movementData.created_by,
        created_at: new Date().toISOString()
      }

      const result = await this.apiRequest.POST('stock_movements', { data: stockMovementData }, this.clientKey)
      console.log(`✅ Created stock movement: ${movementData.sku} - ${movementData.movement_type}`)
      return { action: 'created', data: result.data, item: movementData.sku }

    } catch (error) {
      console.error('❌ Failed to create stock movement:', error)
      throw error
    }
  }

  /**
   * ✅ Update Product Balance
   */
  async updateProductBalance(balanceData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      // Check if balance record exists
      const existingBalance = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: balanceData.product_id
            }
          }
        ]
      }, this.clientKey)

      const balance = existingBalance?.data?.[0]

      if (balance) {
        // Update existing balance
        const newQtyOnHand = (balance.qty_on_hand || 0) + balanceData.quantity_change
        const newTotalCost = (balance.total_cost_value || 0) + (balanceData.quantity_change * balanceData.unit_cost)
        const newAvgCost = newQtyOnHand > 0 ? newTotalCost / newQtyOnHand : balanceData.unit_cost

        const updateData = {
          qty_on_hand: newQtyOnHand,
          qty_available: newQtyOnHand, // Assume all is available initially
          avg_unit_cost: newAvgCost,
          total_cost_value: newTotalCost,
          last_movement_date: new Date().toISOString(),
          updated_by: balanceData.updated_by,
          updated_date: new Date().toISOString()
        }

        const result = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, { data: updateData }, this.clientKey)
        console.log(`✅ Updated product balance: ${balanceData.sku}`)
        return { action: 'updated', data: result.data, item: balanceData.sku }

      } else {
        // Create new balance record
        const newBalanceData = {
          product_id: balanceData.product_id,
          product_code: balanceData.product_code || balanceData.sku, // ✅ ใช้ product_code ที่ถูกต้อง
          sku: balanceData.sku,
          product_name: balanceData.product_name,
          unit: balanceData.unit,
          category: balanceData.category,
          qty_on_hand: balanceData.quantity_change,
          qty_available: balanceData.quantity_change,
          qty_reserved: 0,
          qty_on_order: 0,
          min_stock_level: 0,
          max_stock_level: 0,
          reorder_point: 0,
          avg_unit_cost: balanceData.unit_cost,
          total_cost_value: balanceData.quantity_change * balanceData.unit_cost,
          last_movement_date: new Date().toISOString(),
          status: 'active',
          created_by: balanceData.updated_by,
          created_date: new Date().toISOString(),
          updated_by: balanceData.updated_by,
          updated_date: new Date().toISOString()
        }

        const result = await this.apiRequest.POST('inventory_balance', { data: newBalanceData }, this.clientKey)
        console.log(`✅ Created new product balance: ${balanceData.sku}`)
        return { action: 'created', data: result.data, item: balanceData.sku }
      }

    } catch (error) {
      console.error('❌ Failed to update product balance:', error)
      throw error
    }
  }

  /**
   * สร้าง Lot Record สำหรับการติดตาม lot
   * @param {Object} lotData - ข้อมูล lot ที่จะสร้าง
   * @returns {Promise<Object>} ผลลัพธ์การสร้าง lot record
   */
  async createLotRecord(lotData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const lotRecord = {
        inventory_item_id: lotData.inventory_item_id,
        product_id: lotData.product_id,
        sku: lotData.sku,
        product_name: lotData.product_name,
        lot_code: lotData.lot_code, // รหัส lot จากผู้ขาย
        lot_id: lotData.lot_id, // รหัส lot ภายในระบบ
        full_lot_code: lotData.full_lot_code, // ✅ รหัส lot เต็ม (รุ่น+สี+กว้าง+lot_code)
        weight_kg: lotData.weight_kg,
        calculated_meters: lotData.calculated_meters,
        remaining_meters: lotData.calculated_meters, // ✅ เริ่มต้นเท่ากับ calculated_meters
        used_meters: 0, // ✅ เริ่มต้นเป็น 0
        meters_per_kg: lotData.meters_per_kg || 0, // ✅ เพิ่มสำหรับการชั่งสต็อค
        supplier_name: lotData.supplier_name,
        location_code: lotData.location_code,
        // 🔥 เพิ่ม rack position สำหรับ lot tracking
        rack_position: lotData.rack_position,
        rack_id: lotData.rack_id,
        purchase_order_id: lotData.purchase_order_id,
        received_date: lotData.received_date,
        received_by: lotData.received_by,
        notes: lotData.notes || '',
        status: lotData.status || 'full', // ✅ full, partial, empty
        tracking_enabled: true,
        created_from: 'goods_receipt',
        created_by: lotData.received_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // ✅ เพิ่มข้อมูลสิ่งทอ
        model_code: lotData.model_code,
        color_code: lotData.color_code,
        fabric_width_cm: lotData.fabric_width_cm,
        fabric_type: lotData.fabric_type,
        fabric_composition: lotData.fabric_composition,
        gsm: lotData.gsm,
        thread_count: lotData.thread_count,
        weight_per_meter: lotData.weight_per_meter,
        // ✅ เพิ่ม usage history tracking
        usage_history: [{
          date: lotData.received_date,
          action: 'received',
          used_meters: 0,
          remaining_meters: lotData.calculated_meters,
          sale_id: null,
          notes: 'รับเข้าสินค้าใหม่'
        }]
      }

      console.log('📦 [InventoryService] Creating lot record:', JSON.stringify(lotRecord, null, 2))

      const result = await this.apiRequest.POST('lot_tracking', { data: lotRecord }, this.clientKey)
      
      console.log(`✅ Created lot record: ${lotData.lot_code} (${lotData.lot_id})`)
      
      return { action: 'created', data: result.data, lot_code: lotData.lot_code }

    } catch (error) {
      console.error('❌ Failed to create lot record:', error)
      throw error
    }
  }

  /**
   * รวมข้อมูล lots ใหม่กับ lots ที่มีอยู่
   * @param {Array} existingLots - lots ที่มีอยู่แล้ว
   * @param {Array} newLots - lots ใหม่ที่จะเพิ่ม
   * @returns {Array} รายการ lots ที่รวมแล้ว
   */
  mergeLots(existingLots, newLots) {
    if (!newLots || newLots.length === 0) {
      return existingLots || []
    }
    
    if (!existingLots || existingLots.length === 0) {
      return newLots
    }
    
    // รวม lots ใหม่กับ lots เดิม โดยไม่ซ้ำกัน (ใช้ lot_code เป็นตัวเปรียบเทียบ)
    const merged = [...existingLots]
    
    newLots.forEach(newLot => {
      const existingIndex = merged.findIndex(existing => 
        existing.lot_code === newLot.lot_code
      )
      
      if (existingIndex >= 0) {
        // ถ้า lot_code ซ้ำกัน ให้อัปเดต (รับเข้าใหม่)
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...newLot,
          weight_kg: (merged[existingIndex].weight_kg || 0) + (newLot.weight_kg || 0),
          calculated_meters: (merged[existingIndex].calculated_meters || 0) + (newLot.calculated_meters || 0),
          updated_at: new Date().toISOString()
        }
      } else {
        // ถ้าไม่ซ้ำกัน ให้เพิ่มใหม่
        merged.push({
          ...newLot,
          created_at: new Date().toISOString()
        })
      }
    })
    
    return merged
  }

  /**
   * Debug: ดึงข้อมูล inventory ทั้งหมดสำหรับการ debug
   * @returns {Promise<Array>} รายการ inventory ทั้งหมด
   */
  async getAllInventoryForDebug() {
    try {
      if (!this.isReady()) {
        throw new Error('InventoryService ยังไม่พร้อมใช้งาน')
      }

      console.log('🐛 [InventoryService] Loading all inventory for debug...')

      const response = await this.apiRequest.POST('inventory_items/aggregate', {
        pipeline: [
          { $sort: { created_at: -1 } },
          { $limit: 1000 } // จำกัดจำนวนเพื่อป้องกัน memory overflow
        ]
      }, this.clientKey)

      if (response && response.data) {
        const inventoryData = Array.isArray(response.data) ? response.data : [response.data]
        console.log('🐛 [InventoryService] Loaded inventory data for debug:', inventoryData.length, 'records')
        return inventoryData
      } else {
        console.log('⚠️ [InventoryService] No inventory data found for debug')
        return []
      }

    } catch (error) {
      console.error('❌ [InventoryService] Error loading debug inventory data:', error)
      throw error
    }
  }

  /**
   * อัปเดตสถิติ Product จากข้อมูล lots
   * @param {string} productId - ID ของสินค้า
   * @returns {Promise<Object>} สถิติที่อัปเดต
   */
  async updateProductStatistics(productId) {
    try {
      if (!this.isReady()) {
        throw new Error('InventoryService ยังไม่พร้อมใช้งาน')
      }

      console.log('📊 [InventoryService] Calculating product statistics for:', productId)

      // ดึงข้อมูล lots ทั้งหมดของสินค้า
      const lots = await this.getLotTracking(productId)

      // คำนวณสถิติ
      const statistics = {
        total_rolls: lots.length,
        full_rolls: lots.filter(lot => lot.status === 'full').length,
        partial_rolls: lots.filter(lot => lot.status === 'partial').length,
        empty_rolls: lots.filter(lot => lot.status === 'empty').length,
        
        total_meters: lots.reduce((sum, lot) => sum + (lot.calculated_meters || 0), 0),
        available_meters: lots.reduce((sum, lot) => sum + (lot.remaining_meters || 0), 0),
        used_meters: lots.reduce((sum, lot) => sum + (lot.used_meters || 0), 0),
        
        total_weight_kg: lots.reduce((sum, lot) => sum + (lot.weight_kg || 0), 0),
        
        last_updated: new Date().toISOString()
      }

      console.log('📊 [InventoryService] Product statistics calculated:', statistics)
      return { action: 'calculated', data: statistics }

    } catch (error) {
      console.error('❌ [InventoryService] Error calculating product statistics:', error)
      throw error
    }
  }

  /**
   * ตัดสต็อคจาก Lot (สำหรับการขาย) - คำนวณเท่านั้น
   * @param {string} lotId - ID ของ lot
   * @param {number} cutMeters - จำนวนเมตรที่ต้องการตัด
   * @returns {Promise<Object>} ผลลัพธ์การคำนวณ
   */
  async calculateStockCut(lotId, cutMeters) {
    try {
      if (!this.isReady()) {
        throw new Error('InventoryService ยังไม่พร้อมใช้งาน')
      }

      console.log(`🧮 [InventoryService] Calculating stock cut: ${cutMeters}m from lot ${lotId}`)

      // ดึงข้อมูล lot ปัจจุบัน
      const lotResponse = await this.apiRequest.GET(`lot_tracking/${lotId}`, this.clientKey)
      const lot = lotResponse.data

      if (!lot) {
        throw new Error(`ไม่พบข้อมูล lot: ${lotId}`)
      }

      if (lot.remaining_meters < cutMeters) {
        return {
          action: 'insufficient_stock',
          available_meters: lot.remaining_meters,
          required_meters: cutMeters,
          shortage: cutMeters - lot.remaining_meters
        }
      }

      // คำนวณค่าใหม่
      const newRemainingMeters = lot.remaining_meters - cutMeters
      const newUsedMeters = lot.used_meters + cutMeters
      let newStatus = lot.status

      // กำหนดสถานะใหม่
      if (newRemainingMeters === 0) {
        newStatus = 'empty'
      } else if (newRemainingMeters < lot.calculated_meters) {
        newStatus = 'partial'
      }

      return {
        action: 'stock_cut_calculated',
        lot_id: lotId,
        lot_code: lot.lot_code,
        full_lot_code: lot.full_lot_code,
        current_meters: lot.remaining_meters,
        cut_meters: cutMeters,
        new_remaining_meters: newRemainingMeters,
        new_used_meters: newUsedMeters,
        current_status: lot.status,
        new_status: newStatus,
        feasible: true
      }

    } catch (error) {
      console.error('❌ [InventoryService] Error calculating stock cut:', error)
      throw error
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.initialized && this.apiRequest !== null
  }

  // ==================== Stock Reservation (Lot-Based) ====================

  /**
   * ✅ Reserve stock from lots for Quotation (status: not_paid)
   * จองสต็อคจาก lots สำหรับ Quotation ที่ยืนยันแล้ว
   * @param {Object} reservationData - ข้อมูลการจอง
   * @returns {Promise<Object>} ผลลัพธ์การจอง
   */
  async reserveStockForQuotation(quotationId, items = []) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('🔒 [InventoryService] Reserving stock for quotation:', quotationId)
      console.log('📋 [InventoryService] Items to reserve:', items.length)
      
      if (items.length === 0) {
        console.warn('⚠️ [InventoryService] No items to reserve')
        return {
          success: true,
          reservations: [],
          errors: [],
          message: 'ไม่มีรายการสินค้าที่ต้องจอง'
        }
      }
      
      const reservations = []
      const errors = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(`🔍 [InventoryService] Processing item ${i + 1}/${items.length}:`, {
          product_id: item.product_id,
          product_code: item.product_code,
          sku: item.sku,
          product_name: item.product_name || item.name,
          quantity: item.quantity
        })

        try {
          // ✅ ตรวจสอบว่ามี product identifier หรือไม่
          const productIdentifier = item.product_id || item.product_code || item.sku
          
          if (!productIdentifier) {
            console.error('❌ [InventoryService] Missing product identifier for item:', item)
            errors.push({
              product_id: item.product_id,
              product_name: item.product_name || item.name,
              error: 'ไม่พบ product_id หรือ product_code'
            })
            continue
          }

          if (!item.quantity || item.quantity <= 0) {
            console.warn('⚠️ [InventoryService] Invalid quantity for item:', item)
            continue
          }

          // หา lot ที่มี available stock
          const matchCondition = {
            status: { $in: ['full', 'partial', 'active'] }  // ✅ รองรับทั้ง textile และ standard lot
          }

          // ✅ ใช้ product identifier ที่มี
          if (item.product_id) {
            matchCondition.product_id = item.product_id
          } else if (item.product_code) {
            matchCondition.product_code = item.product_code
          } else {
            matchCondition.sku = item.sku
          }

          // ✅ ต้องมี remaining_meters หรือ current_meters > 0
          matchCondition.$or = [
            { remaining_meters: { $gt: 0 } },  // textile_lot_tracking
            { current_meters: { $gt: 0 } }      // lot_tracking
          ]

          console.log('🔍 [InventoryService] Searching lots with condition:', matchCondition)

          // ✅ ลอง query จาก textile_lot_tracking ก่อน (สำหรับ textile products)
          let lotsResult = await this.apiRequest.POST('textile_lot_tracking/aggregate', {
            pipeline: [
              { $match: matchCondition },
              { 
                $addFields: {
                  current_meters: '$remaining_meters',  // Map remaining_meters → current_meters
                  available_meters: { $subtract: ['$remaining_meters', { $ifNull: ['$reserved_meters', 0] }] },
                  lot_status: {
                    $cond: {
                      if: { $eq: ['$status', 'full'] },
                      then: 'active',
                      else: { $cond: { if: { $eq: ['$status', 'partial'] }, then: 'partial', else: '$status' } }
                    }
                  },
                  _source_collection: { $literal: 'textile_lot_tracking' }  // ✅ จำ source collection
                }
              },
              { $sort: { created_at: 1 } } // FIFO
            ]
          }, this.clientKey)

          let lots = lotsResult?.data || []
          let sourceCollection = 'textile_lot_tracking'

          // ถ้าไม่เจอใน textile_lot_tracking ให้ลองใน lot_tracking
          if (lots.length === 0) {
            console.log('⚠️ [InventoryService] Not found in textile_lot_tracking, trying lot_tracking...')
            lotsResult = await this.apiRequest.POST('lot_tracking/aggregate', {
              pipeline: [
                { $match: matchCondition },
                { 
                  $addFields: {
                    _source_collection: { $literal: 'lot_tracking' }  // ✅ จำ source collection
                  }
                },
                { $sort: { created_at: 1 } } // FIFO
              ]
            }, this.clientKey)
            lots = lotsResult?.data || []
            sourceCollection = 'lot_tracking'
          }
          
          console.log(`📦 [InventoryService] Found ${lots.length} lots for product`)
          
          if (lots.length === 0) {
            errors.push({
              product_id: item.product_id || productIdentifier,
              product_name: item.product_name || item.name,
              error: 'ไม่พบ Lot ที่มีสต็อกเพียงพอ'
            })
            continue
          }

          let remainingQuantity = item.quantity
          
          // จองจาก lots ตามลำดับ FIFO
          for (const lot of lots) {
            if (remainingQuantity <= 0) break

            // ✅ รองรับทั้ง textile_lot_tracking และ lot_tracking
            const currentMeters = lot.current_meters || lot.remaining_meters || 0
            const reservedMeters = lot.reserved_meters || 0
            const availableMeters = currentMeters - reservedMeters
            const toReserve = Math.min(remainingQuantity, availableMeters)

            console.log(`📊 [InventoryService] Lot ${lot.lot_id || lot._id}: currentMeters=${currentMeters}, reserved=${reservedMeters}, available=${availableMeters}, toReserve=${toReserve}`)

            if (toReserve <= 0) continue

            // สร้าง lot_reservation record
            const reservationRecord = {
              lot_id: { $oid: lot._id }, // ✅ บังคับให้เป็น ObjectId reference
              lot_code: lot.lot_id || lot.lot_code, // เก็บ lot code สำหรับแสดงผล
              product_id: { $oid: item.product_id || lot.product_id }, // ✅ ObjectId reference
              product_code: item.product_code || item.sku || lot.product_code || lot.sku,
              product_name: item.product_name || item.name || lot.product_name,
              
              // Reference
              reference_type: 'quotation',
              reference_id: quotationId,
              reference_number: item.quotation_number || quotationId,
              
              // Reservation details
              reserved_meters: toReserve,
              reserved_weight_kg: toReserve * (lot.weight_per_meter || 0),
              
              // Status
              status: 'not_paid', // ✅ สถานะจอง: ยังไม่ชำระเงิน (ยกเลิกได้ใน 7 วัน)
              reservation_type: 'quotation',
              reserved_date: new Date().toISOString(),
              expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // หมดอายุใน 7 วัน
              
              // Location
              location: lot.current_location || lot.location_code,
              
              notes: `จองสต็อคสำหรับ Quotation (ยังไม่ชำระเงิน - ยกเลิกได้ใน 7 วัน)`,
              
              // Audit
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            console.log('💾 [InventoryService] Creating reservation record:', reservationRecord)

            const reservationResult = await this.apiRequest.POST('lot_reservations', {
              data: reservationRecord
            }, this.clientKey)

            if (reservationResult?.data) {
              console.log('✅ [InventoryService] Reservation created with ID:', reservationResult.data._id)

              // ✅ อัปเดต lot - ใช้ source collection ที่จำไว้
              const lotCollection = lot._source_collection || sourceCollection || 'lot_tracking'
              const updateData = {
                reserved_meters: reservedMeters + toReserve,
                updated_at: new Date().toISOString()
              }

              console.log(`🔄 [InventoryService] Updating ${lotCollection}/${lot._id} with reserved_meters=${reservedMeters + toReserve}`)

              await this.apiRequest.PUT(`${lotCollection}/${lot._id}`, {
                data: updateData
              }, this.clientKey)

              reservations.push({
                reservation_id: reservationResult.data._id,
                lot_id: lot._id, // ✅ ใช้ ObjectId เพื่อความง่ายในการ relate
                lot_code: lot.lot_id || lot.lot_code, // เก็บ lot code สำหรับแสดงผล
                product_id: item.product_id || lot.product_id,
                product_code: item.product_code || lot.product_code || lot.sku,
                reserved_meters: toReserve,
                status: 'not_paid'
              })

              console.log(`✅ จอง ${toReserve} เมตร จาก Lot ${lot.lot_id || lot._id} (สถานะ: not_paid)`)
            } else {
              console.error('❌ [InventoryService] Failed to create reservation, no data returned')
            }

            remainingQuantity -= toReserve
          }

          if (remainingQuantity > 0) {
            errors.push({
              product_id: item.product_id || productIdentifier,
              product_name: item.product_name || item.name,
              error: `สต็อก Lot ไม่เพียงพอ ขาดอีก ${remainingQuantity} เมตร`
            })
          }

        } catch (itemError) {
          console.error(`❌ Error reserving stock for product ${item.product_id || item.product_code}:`, itemError)
          console.error('❌ Error stack:', itemError.stack)
          errors.push({
            product_id: item.product_id,
            product_name: item.product_name || item.name,
            error: itemError.message
          })
        }
      }

      console.log(`✅ [InventoryService] จองสต็อคสำเร็จ ${reservations.length} รายการ, ล้มเหลว ${errors.length} รายการ`)

      return {
        success: errors.length === 0,
        reservations,
        errors,
        message: errors.length === 0 
          ? `จองสต็อคสำเร็จทั้งหมด ${reservations.length} รายการ`
          : `จองสต็อคสำเร็จ ${reservations.length} รายการ, มีข้อผิดพลาด ${errors.length} รายการ`
      }

    } catch (error) {
      console.error('❌ [InventoryService] Error reserving stock for quotation:', error)
      console.error('❌ [InventoryService] Error stack:', error.stack)
      throw error
    }
  }

  /**
   * ✅ Update reservation status to 'paid' when invoice is confirmed
   * เปลี่ยนสถานะการจองเป็น 'paid' เมื่อ Invoice ถูกยืนยัน (ชำระเงินแล้ว)
   * @param {string} quotationId - ID ของ Quotation
   * @param {string} invoiceId - ID ของ Invoice
   * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
   */
  async confirmReservationPayment(quotationId, invoiceId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('💳 [InventoryService] Confirming reservation payment:', { quotationId, invoiceId })

      // หา lot_reservations ที่เกี่ยวข้องกับ quotation นี้
      const reservationsResult = await this.apiRequest.POST('lot_reservations/aggregate', {
        pipeline: [
          {
            $match: {
              reference_type: 'quotation',
              reference_id: quotationId,
              status: 'not_paid'
            }
          }
        ]
      }, this.clientKey)

      const reservations = reservationsResult?.data || []

      if (reservations.length === 0) {
        console.warn('⚠️ ไม่พบการจองสำหรับ Quotation นี้')
        return {
          success: true,
          updated: 0,
          message: 'ไม่พบการจองที่ต้องอัปเดต'
        }
      }

      let updated = 0

      for (const reservation of reservations) {
        try {
          // อัปเดตสถานะเป็น 'paid'
          await this.apiRequest.PUT(`lot_reservations/${reservation._id}`, {
            data: {
              status: 'paid', // ✅ เปลี่ยนเป็น paid (ยกเลิกไม่ได้)
              reservation_type: 'invoice',
              invoice_id: invoiceId,
              confirmed_date: new Date().toISOString(),
              expiry_date: null, // ✅ ล้างวันหมดอายุ (ไม่หมดอายุแล้ว)
              notes: `ชำระเงินแล้ว - ยกเลิกไม่ได้ (Invoice: ${invoiceId})`,
              updated_at: new Date().toISOString()
            }
          }, this.clientKey)

          updated++
          console.log(`✅ อัปเดตการจอง Lot ${reservation.lot_id} เป็นสถานะ 'paid'`)

        } catch (updateError) {
          console.error(`❌ Error updating reservation ${reservation._id}:`, updateError)
        }
      }

      console.log(`✅ อัปเดตสถานะการจองสำเร็จ ${updated}/${reservations.length} รายการ`)

      return {
        success: true,
        updated,
        total: reservations.length,
        message: `อัปเดตสถานะการจองเป็น 'paid' สำเร็จ ${updated} รายการ`
      }

    } catch (error) {
      console.error('❌ [InventoryService] Error confirming reservation payment:', error)
      throw error
    }
  }

  /**
   * ✅ Cancel expired reservations (status: not_paid > 7 days)
   * ยกเลิกการจองที่หมดอายุ (สถานะ not_paid เกิน 7 วัน)
   * @returns {Promise<Object>} ผลลัพธ์การยกเลิก
   */
  async cancelExpiredReservations() {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('🔄 [InventoryService] Checking for expired reservations...')

      // หาการจองที่หมดอายุ
      const expiredResult = await this.apiRequest.POST('lot_reservations/aggregate', {
        pipeline: [
          {
            $match: {
              status: 'not_paid',
              expiry_date: { $lt: new Date().toISOString() }
            }
          }
        ]
      }, this.clientKey)

      const expiredReservations = expiredResult?.data || []

      if (expiredReservations.length === 0) {
        console.log('✅ ไม่พบการจองที่หมดอายุ')
        return {
          success: true,
          cancelled: 0,
          message: 'ไม่พบการจองที่หมดอายุ'
        }
      }

      console.log(`⚠️ พบการจองหมดอายุ ${expiredReservations.length} รายการ`)

      let cancelled = 0

      for (const reservation of expiredReservations) {
        try {
          // อัปเดตสถานะเป็น 'cancelled'
          await this.apiRequest.PUT(`lot_reservations/${reservation._id}`, {
            data: {
              status: 'cancelled',
              cancelled_date: new Date().toISOString(),
              cancelled_reason: 'หมดอายุ (ไม่ชำระเงินภายใน 7 วัน)',
              updated_at: new Date().toISOString()
            }
          }, this.clientKey)

          // คืนสต็อก lot
          const lotResult = await this.apiRequest.POST('lot_tracking/aggregate', {
            pipeline: [
              {
                $match: {
                  lot_id: reservation.lot_id
                }
              }
            ]
          }, this.clientKey)

          const lot = lotResult?.data?.[0]

          if (lot) {
            await this.apiRequest.PUT(`lot_tracking/${lot._id}`, {
              data: {
                reserved_meters: Math.max(0, (lot.reserved_meters || 0) - reservation.reserved_meters),
                updated_at: new Date().toISOString()
              }
            }, this.clientKey)
          }

          cancelled++
          console.log(`✅ ยกเลิกการจอง Lot ${reservation.lot_id} (หมดอายุ)`)

        } catch (cancelError) {
          console.error(`❌ Error cancelling reservation ${reservation._id}:`, cancelError)
        }
      }

      console.log(`✅ ยกเลิกการจองหมดอายุสำเร็จ ${cancelled}/${expiredReservations.length} รายการ`)

      return {
        success: true,
        cancelled,
        total: expiredReservations.length,
        message: `ยกเลิกการจองหมดอายุสำเร็จ ${cancelled} รายการ`
      }

    } catch (error) {
      console.error('❌ [InventoryService] Error cancelling expired reservations:', error)
      throw error
    }
  }

  /**
   * ✅ Get reservations for quotation/invoice
   * ดึงข้อมูลการจองสำหรับ Quotation/Invoice
   */
  async getReservations(referenceType, referenceId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const reservationsResult = await this.apiRequest.POST('lot_reservations/aggregate', {
        pipeline: [
          {
            $match: {
              reference_type: referenceType,
              reference_id: referenceId
            }
          },
          {
            $lookup: {
              from: 'lot_tracking',
              localField: 'lot_id',
              foreignField: '_id', // ✅ Join ด้วย _id เพราะ lot_id ใน lot_reservations เป็น ObjectId แล้ว
              as: 'lot_info'
            }
          }
        ]
      }, this.clientKey)

      return reservationsResult?.data || []

    } catch (error) {
      console.error('❌ [InventoryService] Error getting reservations:', error)
      throw error
    }
  }

  /**
   * ✅ Get lot tracking with reservations for a product
   * ดึง lot_tracking พร้อม join lot_reservations สำหรับสินค้าหนึ่งตัว
   */
  async getLotsWithReservations(productId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('[InventoryService] 📦 Getting lots with reservations for product:', productId)
      
      const result = await this.apiRequest.POST('lot_tracking/aggregate', {
        cache: false,
        pipeline: [
          // Match product_id
          {
            $match: {
              product_id: productId
            }
          },
          // Lookup lot_reservations (lot_id ใน lot_reservations เป็น string ของ _id)
          {
            $lookup: {
              from: 'lot_reservations',
              let: { lot_id_str: { $toString: '$_id' } }, // แปลง ObjectId เป็น string
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$lot_id', '$$lot_id_str'] }, // เปรียบเทียบ string กับ string
                        { $in: ['$status', ['not_paid', 'paid']] }
                      ]
                    }
                  }
                },
                {
                  $sort: { created_at: -1 }
                }
              ],
              as: 'reservations'
            }
          },
          // Add computed fields
          {
            $addFields: {
              total_reserved_meters: {
                $sum: '$reservations.reserved_meters'
              },
              available_meters: {
                $subtract: [
                  { $ifNull: ['$remaining_meters', 0] },
                  { $sum: '$reservations.reserved_meters' }
                ]
              },
              is_fully_reserved: {
                $lte: [
                  {
                    $subtract: [
                      { $ifNull: ['$remaining_meters', 0] },
                      { $sum: '$reservations.reserved_meters' }
                    ]
                  },
                  0
                ]
              }
            }
          },
          // Sort by created_at descending
          {
            $sort: { created_at: -1 }
          }
        ]
      }, this.clientKey)

      const lots = result?.data || []
      console.log(`[InventoryService] ✅ Found ${lots.length} lots for product ${productId}`)
      
      return lots

    } catch (error) {
      console.error('❌ [InventoryService] Error getting lots with reservations:', error)
      throw error
    }
  }

  /**
   * ✅ Get products with lot tracking and reservations (Advanced Pipeline)
   * ดึงสินค้าพร้อม lot_tracking และ lot_reservations nested ในคราวเดียว
   */
  async getProductsWithLotsAndReservations(filters = {}) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      console.log('[InventoryService] 📦 Getting products with lots and reservations:', filters)
      
      // Build match stage
      const matchStage = {}
      if (filters.product_ids && filters.product_ids.length > 0) {
        matchStage._id = { $in: filters.product_ids }
      }
      if (filters.category) {
        matchStage.category = filters.category
      }
      if (filters.status) {
        matchStage.status = filters.status
      }
      
      const result = await this.apiRequest.POST('products/aggregate', {
        cache: false,
        pipeline: [
          // Match products
          ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
          
          // Lookup lot_tracking
          {
            $lookup: {
              from: 'lot_tracking',
              let: { product_id: { $toString: '$_id' } }, // แปลง product _id เป็น string
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$product_id', '$$product_id']
                    }
                  }
                },
                // Nested lookup lot_reservations
                {
                  $lookup: {
                    from: 'lot_reservations',
                    let: { lot_id_str: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$lot_id', '$$lot_id_str'] },
                              { $in: ['$status', ['not_paid', 'paid']] }
                            ]
                          }
                        }
                      },
                      {
                        $sort: { created_at: -1 }
                      }
                    ],
                    as: 'reservations'
                  }
                },
                // Add computed fields to each lot
                {
                  $addFields: {
                    total_reserved_meters: {
                      $sum: '$reservations.reserved_meters'
                    },
                    available_meters: {
                      $subtract: [
                        { $ifNull: ['$remaining_meters', 0] },
                        { $sum: '$reservations.reserved_meters' }
                      ]
                    },
                    is_fully_reserved: {
                      $lte: [
                        {
                          $subtract: [
                            { $ifNull: ['$remaining_meters', 0] },
                            { $sum: '$reservations.reserved_meters' }
                          ]
                        },
                        0
                      ]
                    }
                  }
                },
                {
                  $sort: { created_at: -1 }
                }
              ],
              as: 'lots'
            }
          },
          
          // Add computed fields to product
          {
            $addFields: {
              total_lots: { $size: '$lots' },
              total_available_meters: {
                $sum: '$lots.available_meters'
              },
              total_reserved_meters: {
                $sum: '$lots.total_reserved_meters'
              }
            }
          },
          
          {
            $sort: { created_at: -1 }
          }
        ]
      }, this.clientKey)

      const products = result?.data || []
      console.log(`[InventoryService] ✅ Found ${products.length} products with lots and reservations`)
      
      return products

    } catch (error) {
      console.error('❌ [InventoryService] Error getting products with lots and reservations:', error)
      throw error
    }
  }

  // ==================== NEW LOT TRACKING SYSTEM ====================

  /**
   * 📦 ฟังก์ชันหลัก: รับเข้าสินค้าพร้อมสร้าง Lot, Stock Movement และ Balance
   * @param {Object} receiptData - ข้อมูลการรับเข้าสินค้า
   * @returns {Promise<Object>} ผลลัพธ์การรับเข้าสินค้า
   */
  async receiveGoodsWithLotTracking(receiptData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('📦 [InventoryService] ===== RECEIVE GOODS WITH LOT TRACKING =====')
    console.log('📥 Receipt Data:', JSON.stringify(receiptData, null, 2))

    const {
      product_id,
      sku,
      product_name,
      lot_code,
      quantity, // จำนวนเมตร
      weight_kg,
      unit = 'เมตร',
      unit_price = 0,
      location_code = 'WH-01',
      rack_position = '',
      supplier_name = '',
      purchase_order_id = null,
      received_date = new Date().toISOString().split('T')[0],
      received_by = 'system',
      notes = ''
    } = receiptData

    const results = {
      success: false,
      lot_tracking: null,
      stock_movement: null,
      inventory_balance: null,
      errors: []
    }

    try {
      // ========== 1. สร้าง LOT TRACKING ==========
      console.log('🏷️ Step 1: Creating lot tracking record...')
      
      const lotData = {
        product_id,
        sku,
        product_name,
        lot_code,
        lot_id: this.generateLotId(), // LOT-YYMMDD-XXXX
        
        // Quantity data
        weight_kg,
        calculated_meters: quantity,
        remaining_meters: quantity,
        used_meters: 0,
        reserved_meters: 0,
        
        // Location
        location_code,
        rack_position,
        
        // Receipt info
        supplier_name,
        purchase_order_id,
        received_date,
        received_by,
        
        // Status
        status: 'full', // full, partial, empty, deleted
        tracking_enabled: true,
        
        // Notes
        notes,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const lotResult = await this.apiRequest.POST('lot_tracking', {
        data: lotData
      }, this.clientKey)

      if (!lotResult?.data) {
        throw new Error('Failed to create lot tracking record')
      }

      results.lot_tracking = lotResult.data
      console.log('✅ Lot tracking created:', lotResult.data._id)

      // ========== 2. สร้าง STOCK MOVEMENT ==========
      console.log('📊 Step 2: Creating stock movement record...')
      
      const movementData = {
        product_id,
        sku,
        product_name,
        
        // Movement info
        movement_type: 'IN',
        transaction_type: 'goods_receipt',
        
        // Lot reference
        lot_code,
        lot_id: lotResult.data.lot_id,
        
        // Quantity & Value
        quantity,
        unit,
        unit_price,
        total_value: quantity * unit_price,
        
        // Location
        location_code,
        rack_position,
        
        // Reference
        reference_type: purchase_order_id ? 'purchase_order' : 'manual',
        reference_id: purchase_order_id,
        reference_number: purchase_order_id || 'MANUAL',
        
        // Date
        movement_date: received_date,
        
        // Notes
        notes: `รับเข้าสินค้า Lot ${lot_code}${notes ? ' - ' + notes : ''}`,
        status: 'completed',
        
        // Audit
        created_by: received_by,
        created_at: new Date().toISOString()
      }

      const movementResult = await this.apiRequest.POST('stock_movements', {
        data: movementData
      }, this.clientKey)

      if (!movementResult?.data) {
        throw new Error('Failed to create stock movement record')
      }

      results.stock_movement = movementResult.data
      console.log('✅ Stock movement created:', movementResult.data._id)

      // ========== 3. อัพเดต/สร้าง INVENTORY BALANCE ==========
      console.log('💰 Step 3: Updating inventory balance...')
      
      const balanceResult = await this.updateInventoryBalanceWithLot({
        product_id,
        sku,
        product_name,
        unit,
        quantity_change: quantity,
        unit_cost: unit_price,
        lot_details: {
          lot_id: lotResult.data._id,
          lot_code,
          full_lot_code: lotResult.data.full_lot_code || lot_code,
          qty_on_hand: quantity,
          qty_available: quantity,
          qty_reserved: 0,
          location_code,
          rack_position,
          weight_kg,
          last_movement_date: received_date
        },
        updated_by: received_by
      })

      results.inventory_balance = balanceResult
      console.log('✅ Inventory balance updated')

      // ========== สรุปผลลัพธ์ ==========
      results.success = true
      
      console.log('✅ ===== GOODS RECEIPT COMPLETED =====')
      console.log('📊 Summary:')
      console.log(`  - Lot ID: ${results.lot_tracking.lot_id}`)
      console.log(`  - Lot Code: ${lot_code}`)
      console.log(`  - Quantity: ${quantity} ${unit}`)
      console.log(`  - Weight: ${weight_kg} kg`)
      console.log(`  - Location: ${location_code} ${rack_position}`)
      
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Error receiving goods:', error)
      results.errors.push(error.message)
      throw error
    }
  }

  /**
   * 💰 อัพเดต Inventory Balance พร้อม Lot Details
   * @param {Object} data - ข้อมูลสำหรับอัพเดต balance
   * @returns {Promise<Object>} ผลลัพธ์การอัพเดต
   */
  async updateInventoryBalanceWithLot(data) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const {
        product_id,
        sku,
        product_name,
        unit,
        quantity_change,
        unit_cost,
        lot_details,
        updated_by
      } = data

      // ตรวจสอบว่ามี balance record อยู่แล้วหรือไม่
      const existingBalanceResult = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id
            }
          }
        ]
      }, this.clientKey)

      const existingBalance = existingBalanceResult?.data?.[0]

      if (existingBalance) {
        // ========== อัพเดต Balance ที่มีอยู่ ==========
        console.log('📝 Updating existing balance:', existingBalance._id)
        
        const currentLotDetails = existingBalance.lot_details || []
        
        // หา lot ที่ตรงกัน
        const lotIndex = currentLotDetails.findIndex(
          lot => lot.lot_id === lot_details.lot_id || lot.lot_code === lot_details.lot_code
        )

        let updatedLotDetails
        if (lotIndex >= 0) {
          // อัพเดต lot ที่มีอยู่
          updatedLotDetails = [...currentLotDetails]
          updatedLotDetails[lotIndex] = {
            ...updatedLotDetails[lotIndex],
            qty_on_hand: (updatedLotDetails[lotIndex].qty_on_hand || 0) + quantity_change,
            qty_available: (updatedLotDetails[lotIndex].qty_available || 0) + quantity_change,
            weight_kg: lot_details.weight_kg,
            last_movement_date: lot_details.last_movement_date
          }
        } else {
          // เพิ่ม lot ใหม่
          updatedLotDetails = [
            ...currentLotDetails,
            lot_details
          ]
        }

        // คำนวณยอดรวมใหม่
        const newQtyOnHand = (existingBalance.qty_on_hand || 0) + quantity_change
        const newTotalCost = (existingBalance.total_cost_value || 0) + (quantity_change * unit_cost)
        const newAvgCost = newQtyOnHand > 0 ? newTotalCost / newQtyOnHand : unit_cost

        const updateData = {
          qty_on_hand: newQtyOnHand,
          qty_available: newQtyOnHand - (existingBalance.qty_reserved || 0),
          lot_details: updatedLotDetails,
          avg_unit_cost: newAvgCost,
          total_cost_value: newTotalCost,
          last_movement_date: new Date().toISOString(),
          updated_by,
          updated_date: new Date().toISOString()
        }

        const result = await this.apiRequest.PUT(`inventory_balance/${existingBalance._id}`, {
          data: updateData
        }, this.clientKey)

        console.log('✅ Balance updated')
        return { action: 'updated', data: result.data }

      } else {
        // ========== สร้าง Balance ใหม่ ==========
        console.log('📝 Creating new balance record')
        
        const newBalanceData = {
          product_id,
          product_code: sku,
          sku,
          product_name,
          unit,
          category: 'textile', // จะต้องดึงจาก product
          
          // Quantities
          qty_on_hand: quantity_change,
          qty_available: quantity_change,
          qty_reserved: 0,
          qty_on_order: 0,
          
          // Lot details
          lot_details: [lot_details],
          
          // Stock levels
          min_stock_level: 0,
          max_stock_level: 0,
          reorder_point: 0,
          
          // Cost
          avg_unit_cost: unit_cost,
          total_cost_value: quantity_change * unit_cost,
          
          // Dates
          last_movement_date: new Date().toISOString(),
          
          // Status
          status: 'active',
          
          // Audit
          created_by: updated_by,
          created_date: new Date().toISOString(),
          updated_by,
          updated_date: new Date().toISOString()
        }

        const result = await this.apiRequest.POST('inventory_balance', {
          data: newBalanceData
        }, this.clientKey)

        console.log('✅ New balance created')
        return { action: 'created', data: result.data }
      }

    } catch (error) {
      console.error('❌ Failed to update inventory balance with lot:', error)
      throw error
    }
  }

  // ==================== LOT RESERVATION SYSTEM ====================

  /**
   * 🔒 จองสินค้าจาก Lot (Manual Reservation)
   * @param {Object} reservationData - ข้อมูลการจอง
   * @returns {Promise<Object>} ผลลัพธ์การจอง
   */
  async reserveLotStock(reservationData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('🔒 [InventoryService] ===== RESERVE LOT STOCK =====')
    console.log('📥 Reservation Data:', JSON.stringify(reservationData, null, 2))

    const {
      lot_id, // _id ของ lot_tracking
      product_id,
      product_code,
      product_name,
      lot_code,
      
      // Reservation type and quantity
      reservation_type = 'meters', // 'meters' หรือ 'whole_roll'
      reserved_meters,
      reserved_weight_kg = 0,
      
      // Payment status
      payment_status = 'unpaid', // 'unpaid', 'deposit', 'paid'
      status = 'not_paid',
      
      // Customer info
      customer_name = '',
      customer_id = null,
      
      // Reference
      reference_type = 'manual',
      reference_id = null,
      reference_number = '',
      
      // Location
      location = '',
      
      // Additional info
      notes = '',
      reserved_by = 'system'
    } = reservationData

    const results = {
      success: false,
      reservation: null,
      lot_updated: null,
      balance_updated: null,
      errors: []
    }

    try {
      // ========== 1. ตรวจสอบ Lot และสต็อกที่มี ==========
      console.log('🔍 Step 1: Checking lot availability...')
      
      const lotResult = await this.apiRequest.GET(`lot_tracking/${lot_id}`, this.clientKey)
      const lot = lotResult?.data

      if (!lot) {
        throw new Error('ไม่พบข้อมูล Lot')
      }

      const availableMeters = (lot.remaining_meters || 0) - (lot.reserved_meters || 0)
      
      if (availableMeters < reserved_meters) {
        throw new Error(`สต็อกไม่เพียงพอ มีเพียง ${availableMeters} เมตร แต่ต้องการจอง ${reserved_meters} เมตร`)
      }

      console.log(`✅ Lot ${lot.lot_code} has ${availableMeters} meters available`)

      // ========== 2. สร้าง Reservation Record ==========
      console.log('📝 Step 2: Creating reservation record...')
      
      // กำหนด expiry_date ตามสถานะ
      let expiryDate = null
      if (payment_status === 'unpaid') {
        expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      } else if (payment_status === 'deposit') {
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }
      // paid ไม่มี expiry
      
      const reservationRecord = {
        lot_id,
        lot_code: lot_code || lot.lot_code,
        full_lot_code: lot.full_lot_code,
        
        // Product info
        product_id: product_id || lot.product_id,
        product_code: product_code || lot.sku,
        product_name: product_name || lot.product_name,
        
        // Reservation details
        reservation_type, // 'meters' หรือ 'whole_roll'
        reserved_meters,
        reserved_weight_kg: reserved_weight_kg || (reserved_meters * (lot.weight_per_meter || 0)),
        unit: 'เมตร',
        
        // Customer info
        customer_id,
        customer_name,
        
        // Reference
        reference_type, // 'manual', 'quotation', 'sales_order', 'invoice'
        reference_id,
        reference_number,
        
        // Status
        payment_status, // 'unpaid', 'deposit', 'paid'
        status: status || (payment_status === 'paid' ? 'paid' : 'not_paid'), // not_paid, paid, cancelled, expired, completed
        
        // Dates
        reserved_date: new Date().toISOString(),
        expiry_date: expiryDate,
        
        // Location
        location: location || lot.location_code,
        location_code: lot.location_code,
        rack_position: lot.rack_position,
        
        // Notes
        notes: notes || `${reservation_type === 'whole_roll' ? 'จองทั้งม้วน' : 'จองสต็อค'} ${reserved_meters} เมตร จาก Lot ${lot.lot_code}`,
        
        // Audit
        created_by: reserved_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const reservationResult = await this.apiRequest.POST('lot_reservations', {
        data: reservationRecord
      }, this.clientKey)

      if (!reservationResult?.data) {
        throw new Error('Failed to create reservation record')
      }

      results.reservation = reservationResult.data
      console.log('✅ Reservation created:', reservationResult.data._id)

      // ========== 3. อัพเดต Lot (เพิ่ม reserved_meters) ==========
      console.log('📊 Step 3: Updating lot reserved_meters...')
      
      const newReservedMeters = (lot.reserved_meters || 0) + reserved_meters

      const lotUpdateResult = await this.apiRequest.PUT(`lot_tracking/${lot_id}`, {
        data: {
          reserved_meters: newReservedMeters,
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      results.lot_updated = lotUpdateResult?.data
      console.log(`✅ Lot updated: reserved_meters = ${newReservedMeters}`)

      // ========== 4. อัพเดต Inventory Balance (ลด qty_available) ==========
      console.log('💰 Step 4: Updating inventory balance...')
      
      const balanceResult = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: lot.product_id
            }
          }
        ]
      }, this.clientKey)

      const balance = balanceResult?.data?.[0]

      if (balance) {
        // อัพเดต lot_details และ qty_reserved
        const updatedLotDetails = (balance.lot_details || []).map(lotDetail => {
          if (lotDetail.lot_id === lot_id || lotDetail.lot_code === lot.lot_code) {
            return {
              ...lotDetail,
              qty_reserved: (lotDetail.qty_reserved || 0) + reserved_meters,
              qty_available: (lotDetail.qty_available || 0) - reserved_meters
            }
          }
          return lotDetail
        })

        const balanceUpdateResult = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, {
          data: {
            qty_reserved: (balance.qty_reserved || 0) + reserved_meters,
            qty_available: (balance.qty_available || 0) - reserved_meters,
            lot_details: updatedLotDetails,
            updated_date: new Date().toISOString()
          }
        }, this.clientKey)

        results.balance_updated = balanceUpdateResult?.data
        console.log('✅ Inventory balance updated')
      }

      // ========== สรุปผลลัพธ์ ==========
      results.success = true
      
      console.log('✅ ===== RESERVATION COMPLETED =====')
      console.log('📊 Summary:')
      console.log(`  - Reservation ID: ${results.reservation._id}`)
      console.log(`  - Lot Code: ${lot.lot_code}`)
      console.log(`  - Reserved: ${reserved_meters} เมตร`)
      console.log(`  - Status: ${results.reservation.status}`)
      console.log(`  - Expires: ${results.reservation.expiry_date}`)
      
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Error reserving lot:', error)
      results.errors.push(error.message)
      throw error
    }
  }

  /**
   * 🔓 ยกเลิกการจอง Lot
   * @param {string} reservationId - ID ของ reservation
   * @returns {Promise<Object>} ผลลัพธ์การยกเลิก
   */
  async cancelLotReservation(reservationId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('🔓 [InventoryService] ===== CANCEL RESERVATION =====')
    console.log('📥 Reservation ID:', reservationId)

    const results = {
      success: false,
      reservation: null,
      lot_updated: null,
      balance_updated: null,
      errors: []
    }

    try {
      // ========== 1. ดึงข้อมูล Reservation ==========
      console.log('🔍 Step 1: Getting reservation data...')
      
      const reservationResult = await this.apiRequest.GET(`lot_reservations/${reservationId}`, this.clientKey)
      const reservation = reservationResult?.data

      if (!reservation) {
        throw new Error('ไม่พบข้อมูลการจอง')
      }

      if (reservation.status === 'cancelled') {
        throw new Error('การจองนี้ถูกยกเลิกแล้ว')
      }

      if (reservation.status === 'completed') {
        throw new Error('ไม่สามารถยกเลิกการจองที่ตัดสต็อคแล้ว')
      }

      console.log(`✅ Found reservation: ${reservation.lot_code} - ${reservation.reserved_meters} meters`)

      // ========== 2. อัพเดตสถานะ Reservation ==========
      console.log('📝 Step 2: Updating reservation status to cancelled...')
      
      const cancelReservationResult = await this.apiRequest.PUT(`lot_reservations/${reservationId}`, {
        data: {
          status: 'cancelled',
          cancelled_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      results.reservation = cancelReservationResult?.data
      console.log('✅ Reservation cancelled')

      // ========== 3. คืนสต็อกที่ Lot (ลด reserved_meters) ==========
      console.log('📊 Step 3: Returning reserved stock to lot...')
      
      const lotResult = await this.apiRequest.POST('lot_tracking/aggregate', {
        pipeline: [
          {
            $match: {
              _id: reservation.lot_id
            }
          }
        ]
      }, this.clientKey)

      const lot = lotResult?.data?.[0]

      if (lot) {
        const newReservedMeters = Math.max(0, (lot.reserved_meters || 0) - reservation.reserved_meters)

        const lotUpdateResult = await this.apiRequest.PUT(`lot_tracking/${lot._id}`, {
          data: {
            reserved_meters: newReservedMeters,
            updated_at: new Date().toISOString()
          }
        }, this.clientKey)

        results.lot_updated = lotUpdateResult?.data
        console.log(`✅ Lot updated: reserved_meters = ${newReservedMeters}`)
      }

      // ========== 4. อัพเดต Inventory Balance (คืน qty_available) ==========
      console.log('💰 Step 4: Updating inventory balance...')
      
      const balanceResult = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: reservation.product_id
            }
          }
        ]
      }, this.clientKey)

      const balance = balanceResult?.data?.[0]

      if (balance) {
        // อัพเดต lot_details และ qty_reserved
        const updatedLotDetails = (balance.lot_details || []).map(lotDetail => {
          if (lotDetail.lot_id === reservation.lot_id || lotDetail.lot_code === reservation.lot_code) {
            return {
              ...lotDetail,
              qty_reserved: Math.max(0, (lotDetail.qty_reserved || 0) - reservation.reserved_meters),
              qty_available: (lotDetail.qty_available || 0) + reservation.reserved_meters
            }
          }
          return lotDetail
        })

        const balanceUpdateResult = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, {
          data: {
            qty_reserved: Math.max(0, (balance.qty_reserved || 0) - reservation.reserved_meters),
            qty_available: (balance.qty_available || 0) + reservation.reserved_meters,
            lot_details: updatedLotDetails,
            updated_date: new Date().toISOString()
          }
        }, this.clientKey)

        results.balance_updated = balanceUpdateResult?.data
        console.log('✅ Inventory balance updated')
      }

      // ========== สรุปผลลัพธ์ ==========
      results.success = true
      
      console.log('✅ ===== CANCELLATION COMPLETED =====')
      console.log('📊 Summary:')
      console.log(`  - Reservation ID: ${reservationId}`)
      console.log(`  - Returned: ${reservation.reserved_meters} เมตร`)
      
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Error cancelling reservation:', error)
      results.errors.push(error.message)
      throw error
    }
  }

  /**
   * 📋 ดูรายการจองทั้งหมดของ Lot
   * @param {string} lotId - ID ของ lot
   * @returns {Promise<Array>} รายการจอง
   */
  async getLotReservations(lotId) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    try {
      const result = await this.apiRequest.POST('lot_reservations/aggregate', {
        pipeline: [
          {
            $match: {
              lot_id: lotId,
              status: { $in: ['not_paid', 'paid'] } // เฉพาะที่ active
            }
          },
          {
            $sort: { created_at: -1 }
          }
        ]
      }, this.clientKey)

      return result?.data || []
    } catch (error) {
      console.error('❌ Error getting lot reservations:', error)
      return []
    }
  }

  /**
   * ✂️ ตัดสต็อคจากการจอง
   * Cut stock from reservation - confirm reservation, create stock movement, update inventory
   * @param {Object} cutData - ข้อมูลการตัดสต็อค
   * @returns {Promise<Object>} ผลลัพธ์การตัดสต็อค
   */
  async cutLotStock(cutData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('✂️ [InventoryService] ===== CUT LOT STOCK =====')
    console.log('📥 Cut Data:', JSON.stringify(cutData, null, 2))

    const {
      lot_id,
      reservation_id,
      cut_meters,
      notes = ''
    } = cutData

    const results = {
      success: false,
      reservation: null,
      lot_updated: null,
      balance_updated: null,
      movement_created: null,
      errors: []
    }

    try {
      // ========== 1. ดึงข้อมูล Reservation ==========
      console.log('🔍 Step 1: Getting reservation data...')
      
      const reservationResult = await this.apiRequest.GET(`lot_reservations/${reservation_id}`, this.clientKey)
      const reservation = reservationResult?.data

      if (!reservation) {
        throw new Error('ไม่พบข้อมูลการจอง')
      }

      if (reservation.payment_status !== 'paid') {
        throw new Error('การจองนี้ยังไม่ได้ชำระเงิน ไม่สามารถตัดสต็อคได้')
      }

      if (reservation.status === 'completed') {
        throw new Error('การจองนี้ถูกตัดสต็อคแล้ว')
      }

      if (reservation.status === 'cancelled') {
        throw new Error('การจองนี้ถูกยกเลิกแล้ว')
      }

      if (cut_meters > reservation.reserved_meters) {
        throw new Error(`ไม่สามารถตัดเกินจำนวนที่จองได้ (จอง: ${reservation.reserved_meters} ม.)`)
      }

      console.log(`✅ Found reservation: ${reservation.customer_name || 'Unknown'} - ${reservation.reserved_meters} meters`)

      // ========== 2. ดึงข้อมูล Lot ==========
      console.log('🔍 Step 2: Getting lot data...')
      
      const lotResult = await this.apiRequest.GET(`lot_tracking/${lot_id}`, this.clientKey)
      const lot = lotResult?.data

      if (!lot) {
        throw new Error('ไม่พบข้อมูล Lot')
      }

      if (cut_meters > lot.remaining_meters) {
        throw new Error(`Lot ไม่มีสต็อคเพียงพอ (คงเหลือ: ${lot.remaining_meters} ม.)`)
      }

      console.log(`✅ Lot ${lot.lot_code} has ${lot.remaining_meters} meters remaining`)

      // ========== 3. อัพเดตสถานะ Reservation ==========
      console.log('📝 Step 3: Updating reservation status...')
      
      const isFullCut = cut_meters === reservation.reserved_meters
      const newStatus = isFullCut ? 'completed' : 'paid'
      const remainingReservedMeters = isFullCut ? 0 : reservation.reserved_meters - cut_meters

      console.log(`   Reservation: ${reservation.customer_name}`)
      console.log(`   Reserved: ${reservation.reserved_meters} m, Cutting: ${cut_meters} m`)
      console.log(`   Is full cut: ${isFullCut}, New status: ${newStatus}`)

      // ⚠️ ต้องเอา _id ออก เพราะ MongoDB ไม่ให้แก้ไข immutable field
      // eslint-disable-next-line no-unused-vars
      const { _id: reservationId, ...reservationDataWithoutId } = reservation

      const reservationUpdateData = {
        ...reservationDataWithoutId,
        status: newStatus,
        cut_meters: (reservation.cut_meters || 0) + cut_meters,
        reserved_meters: remainingReservedMeters,
        completed_date: isFullCut ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      const reservationUpdateResult = await this.apiRequest.PUT(`lot_reservations/${reservation_id}`, {
        data: reservationUpdateData
      }, this.clientKey)

      results.reservation = reservationUpdateResult?.data
      console.log(`✅ Reservation updated: status=${newStatus}, remaining=${remainingReservedMeters}`)

      // ========== 4. อัพเดต Lot (ลดสต็อค) ==========
      console.log('📊 Step 4: Updating lot stock...')
      
      const newRemainingMeters = lot.remaining_meters - cut_meters
      const newLotReservedMeters = Math.max(0, (lot.reserved_meters || 0) - cut_meters)

      console.log(`   Current lot data:`)
      console.log(`     - remaining_meters: ${lot.remaining_meters}`)
      console.log(`     - reserved_meters: ${lot.reserved_meters} (type: ${typeof lot.reserved_meters})`)
      console.log(`   Cutting: ${cut_meters} meters`)
      console.log(`   Calculated new values:`)
      console.log(`     - remaining: ${newRemainingMeters}`)
      console.log(`     - reserved: ${newLotReservedMeters}`)

      // ⚠️ ต้องเอา _id ออก เพราะ MongoDB ไม่ให้แก้ไข immutable field
      // eslint-disable-next-line no-unused-vars
      const { _id, ...lotDataWithoutId } = lot

      const updatedLotData = {
        ...lotDataWithoutId,
        remaining_meters: newRemainingMeters,
        reserved_meters: newLotReservedMeters,
        updated_at: new Date().toISOString()
      }

      console.log(`   Sending PUT request with reserved_meters: ${updatedLotData.reserved_meters}`)

      const lotUpdateResult = await this.apiRequest.PUT(`lot_tracking/${lot_id}`, {
        data: updatedLotData
      }, this.clientKey)

      results.lot_updated = lotUpdateResult?.data
      console.log(`✅ Lot updated successfully`)
      console.log(`   Response data - remaining: ${lotUpdateResult?.data?.remaining_meters}, reserved: ${lotUpdateResult?.data?.reserved_meters}`)

      // ========== 5. สร้าง Stock Movement ==========
      console.log('📦 Step 5: Creating stock movement...')
      
      // คำนวณราคาและมูลค่า (ใช้ราคาจาก lot หรือ product)
      const unitPrice = lot.unit_cost || lot.unit_price || 0
      const totalValue = cut_meters * unitPrice
      
      const movementData = {
        product_id: lot.product_id,
        product_code: lot.sku,
        product_name: lot.product_name,
        lot_id: lot_id,
        lot_code: lot.lot_code,
        full_lot_code: lot.full_lot_code,
        movement_type: 'OUT',  // ✅ ใช้ uppercase เหมือนกับ IN
        transaction_type: 'sale',
        quantity: cut_meters,  // ✅ ใช้ quantity แทน quantity_meters
        unit: 'เมตร',
        unit_price: unitPrice,  // ✅ เพิ่ม unit_price
        total_value: totalValue,  // ✅ เพิ่ม total_value
        location_code: lot.location_code || 'WH-01',  // ✅ เพิ่ม location_code
        rack_position: lot.rack_position || '',  // ✅ เพิ่ม rack_position
        reference_type: 'reservation',
        reference_id: reservation_id,
        reference_number: reservation.reference_number || '',
        customer_name: reservation.customer_name || '',
        notes: notes || `ตัดสต็อคจากการจอง: ${reservation.customer_name || 'ไม่ระบุ'}`,
        movement_date: new Date().toISOString().split('T')[0],  // ✅ ใช้ YYYY-MM-DD
        status: 'completed',  // ✅ เพิ่ม status
        created_by: 'system',
        created_at: new Date().toISOString()
      }

      const movementResult = await this.apiRequest.POST('stock_movements', {
        data: movementData
      }, this.clientKey)

      results.movement_created = movementResult?.data
      console.log('✅ Stock movement created')

      // ========== 6. อัพเดต Inventory Balance ==========
      console.log('💰 Step 6: Updating inventory balance...')
      
      const balanceResult = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: lot.product_id
            }
          }
        ]
      }, this.clientKey)

      const balance = balanceResult?.data?.[0]

      if (balance) {
        // อัพเดต lot_details
        const updatedLotDetails = (balance.lot_details || []).map(lotDetail => {
          if (lotDetail.lot_id === lot_id || lotDetail.lot_code === lot.lot_code) {
            return {
              ...lotDetail,
              qty_reserved: Math.max(0, (lotDetail.qty_reserved || 0) - cut_meters),
              qty_available: Math.max(0, (lotDetail.qty_available || 0) - cut_meters)
            }
          }
          return lotDetail
        })

        const newQtyOnHand = Math.max(0, (balance.qty_on_hand || 0) - cut_meters)
        const newQtyReserved = Math.max(0, (balance.qty_reserved || 0) - cut_meters)
        const newQtyAvailable = Math.max(0, newQtyOnHand - newQtyReserved)

        const balanceUpdateResult = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, {
          data: {
            qty_on_hand: newQtyOnHand,
            qty_reserved: newQtyReserved,
            qty_available: newQtyAvailable,
            lot_details: updatedLotDetails,
            updated_date: new Date().toISOString()
          }
        }, this.clientKey)

        results.balance_updated = balanceUpdateResult?.data
        console.log('✅ Inventory balance updated')
      }

      // ========== สรุปผลลัพธ์ ==========
      results.success = true
      
      console.log('✅ ===== CUT STOCK COMPLETED =====')
      console.log('📊 Summary:')
      console.log(`  - Lot: ${lot.lot_code}`)
      console.log(`  - Cut: ${cut_meters} เมตร`)
      console.log(`  - Customer: ${reservation.customer_name || 'N/A'}`)
      console.log(`  - Reservation: ${isFullCut ? 'Completed' : 'Partial'}`)
      console.log(`  - Lot Remaining: ${newRemainingMeters} เมตร`)
      
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Error cutting stock:', error)
      results.errors.push(error.message)
      throw error
    }
  }

  /**
   * 🔄 รับสินค้าคืน (Return/Claim)
   * Handle product returns - return to stock (good condition) or mark as defective
   * @param {Object} returnData - ข้อมูลการคืนสินค้า
   * @returns {Promise<Object>} ผลลัพธ์การคืนสินค้า
   */
  async returnLotStock(returnData) {
    if (!this.apiRequest) {
      throw new Error('InventoryService not initialized')
    }

    console.log('🔄 [InventoryService] ===== RETURN LOT STOCK =====')
    console.log('📥 Return Data:', JSON.stringify(returnData, null, 2))

    const {
      lot_id,
      movement_id = null,          // reference ไปยัง stock_movement ที่ขายไป
      reservation_id = null,       // reference ไปยัง lot_reservation (ถ้ามี)
      return_meters,               // จำนวนที่คืน (เมตร)
      return_type,                 // 'refund' | 'exchange' | 'defective'
      reason = '',                 // เหตุผลการคืน
      customer_name = '',
      reference_number = '',
      notes = '',
      // ✅ เพิ่ม location fields
      return_location_code = '',   // คลังที่รับคืนเข้า
      location_type = 'warehouse', // ประเภทคลัง
      is_scrap_return = false,     // flag ของเสีย
      is_sample = false,           // flag ตัวอย่าง
      count_in_stock = true        // นับสต็อกหรือไม่ (scrap/sample = false)
    } = returnData

    const results = {
      success: false,
      lot_updated: null,
      balance_updated: null,
      movement_created: null,
      return_record: null,
      errors: []
    }

    try {
      // ========== 1. ดึงข้อมูล Lot ==========
      console.log('🔍 Step 1: Getting lot data...')
      
      const lotResult = await this.apiRequest.GET(`lot_tracking/${lot_id}`, this.clientKey)
      const lot = lotResult?.data

      if (!lot) {
        throw new Error('ไม่พบข้อมูล Lot')
      }

      console.log(`✅ Lot ${lot.lot_code} found`)

      // ========== 2. สร้าง Return Record ==========
      console.log('📝 Step 2: Creating return record...')
      
      const returnRecordData = {
        product_id: lot.product_id,
        product_code: lot.sku,
        product_name: lot.product_name,
        lot_id: lot_id,
        lot_code: lot.lot_code,
        full_lot_code: lot.full_lot_code,
        return_type: return_type,
        return_meters: return_meters,
        reason: reason,
        customer_name: customer_name,
        reference_movement_id: movement_id,
        reference_reservation_id: reservation_id,
        reference_number: reference_number,
        notes: notes,
        // ✅ เพิ่ม location info
        return_location_code: return_location_code,
        location_type: location_type,
        is_scrap_return: is_scrap_return,
        is_sample: is_sample,
        count_in_stock: count_in_stock,
        status: return_type === 'defective' ? 'defective' : 'returned',
        return_date: new Date().toISOString(),
        created_by: 'system',
        created_at: new Date().toISOString()
      }

      console.log('📍 Return location:', return_location_code, `(${location_type})`)
      console.log('📊 Count in stock:', count_in_stock)

      const returnRecordResult = await this.apiRequest.POST('stock_returns', {
        data: returnRecordData
      }, this.clientKey)

      results.return_record = returnRecordResult?.data
      console.log('✅ Return record created')

      // ========== 3. อัปเดต Stock Movement ที่ถูกคืน (ป้องกันการคืนซ้ำ) ==========
      if (movement_id) {
        console.log('📝 Step 3a: Updating original movement returned_meters...')
        console.log(`   Movement ID: ${movement_id}`)
        console.log(`   Return meters: ${return_meters}`)
        
        try {
          // ดึงข้อมูล movement เดิม
          const originalMovementResponse = await this.apiRequest.GET(`stock_movements/${movement_id}`, this.clientKey)
          const originalMovement = originalMovementResponse?.data
          
          if (!originalMovement) {
            console.error(`❌ Movement ${movement_id} not found!`)
            throw new Error(`ไม่พบรายการขาย ID: ${movement_id}`)
          }
          
          const currentReturnedMeters = originalMovement.returned_meters || 0
          const totalQuantity = originalMovement.quantity || originalMovement.quantity_meters || 0
          const newReturnedMeters = currentReturnedMeters + return_meters
          
          console.log(`   Current returned: ${currentReturnedMeters} ม.`)
          console.log(`   Total sold: ${totalQuantity} ม.`)
          console.log(`   New returned: ${newReturnedMeters} ม.`)
          
          // ตรวจสอบว่าคืนเกินไหม
          if (newReturnedMeters > totalQuantity) {
            throw new Error(`ไม่สามารถคืนได้ ${return_meters} เมตร เพราะขายไปแค่ ${totalQuantity} เมตร และคืนไปแล้ว ${currentReturnedMeters} เมตร`)
          }
          
          // อัปเดตจำนวนที่คืนไปแล้ว (ใช้ PUT แทน PATCH)
          // ⚠️ ต้องเอา _id ออก เพราะ MongoDB ไม่ให้แก้ไข immutable field
          // eslint-disable-next-line no-unused-vars
          const { _id, ...movementDataWithoutId } = originalMovement
          
          const updatedMovementData = {
            ...movementDataWithoutId,
            returned_meters: newReturnedMeters,
            has_returns: true,
            last_return_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          console.log('📤 Sending PUT request to update movement...')
          const updateResponse = await this.apiRequest.PUT(`stock_movements/${movement_id}`, {
            data: updatedMovementData
          }, this.clientKey)
          
          console.log(`✅ Updated movement ${movement_id} returned_meters: ${currentReturnedMeters} -> ${newReturnedMeters}`)
          console.log(`   Update response:`, updateResponse?.data ? 'Success' : 'Failed')
          
          if (!updateResponse?.data) {
            throw new Error('การอัปเดต stock_movements ล้มเหลว - ไม่ได้รับข้อมูลตอบกลับ')
          }
          
          results.movement_updated = updateResponse?.data
        } catch (error) {
          console.error('❌ Failed to update movement returned_meters:', error.message)
          // ต้อง fail ทั้งหมด เพื่อป้องกันการคืนซ้ำ
          throw new Error(`ไม่สามารถอัปเดตสถานะการคืนได้: ${error.message}`)
        }
      } else {
        console.warn('⚠️ No movement_id provided - cannot track return status')
      }

      // ========== 4. สร้าง Stock Movement ==========
      console.log('📦 Step 4: Creating stock movement...')
      
      // คำนวณราคาและมูลค่า
      const unitPrice = lot.unit_cost || lot.unit_price || 0
      const totalValue = return_meters * unitPrice

      // ✅ ถ้าเป็น scrap/sample หรือ defective จะไม่นับสต็อก
      const shouldCountInStock = count_in_stock && return_type !== 'defective'
      
      const movementType = shouldCountInStock ? 'IN' : 'OUT'
      const transactionType = return_type === 'defective' ? 'defective_disposal' : 
                             is_scrap_return ? 'scrap_return' :
                             is_sample ? 'sample_return' :
                             return_type === 'exchange' ? 'exchange_return' : 'refund_return'
      
      const movementData = {
        product_id: lot.product_id,
        product_code: lot.sku,
        product_name: lot.product_name,
        lot_id: lot_id,
        lot_code: lot.lot_code,
        full_lot_code: lot.full_lot_code,
        movement_type: movementType,
        transaction_type: transactionType,
        quantity: return_meters,
        unit: 'เมตร',
        unit_price: unitPrice,
        total_value: totalValue,
        // ✅ ใช้ location ที่เลือกในหน้ารับคืน
        location_code: return_location_code || lot.location_code || 'WH-01',
        location_type: location_type,
        rack_position: is_scrap_return ? 'SCRAP-AREA' : 
                      return_type === 'defective' ? 'DEFECTIVE-AREA' : 
                      lot.rack_position || '',
        // ✅ เพิ่ม flags
        is_scrap: is_scrap_return,
        is_sample: is_sample,
        count_in_stock: shouldCountInStock,
        reference_type: 'return',
        reference_id: results.return_record._id,
        reference_number: reference_number,
        customer_name: customer_name,
        notes: notes || `${return_type === 'refund' ? 'รับคืนสินค้า (เครม)' : 
                              return_type === 'exchange' ? 'รับคืนสินค้า (เปลี่ยน)' : 
                              'รับคืนสินค้า (ของเสีย)'}: ${reason}${
                                is_scrap_return ? ' [ของเสีย - ไม่นับสต็อก]' : 
                                is_sample ? ' [ตัวอย่าง - ไม่นับสต็อก]' : ''
                              }`,
        movement_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        created_by: 'system',
        created_at: new Date().toISOString()
      }

      console.log('📍 Movement will be recorded at:', return_location_code || lot.location_code)
      console.log('📊 Will count in stock:', shouldCountInStock)

      const movementResult = await this.apiRequest.POST('stock_movements', {
        data: movementData
      }, this.clientKey)

      results.movement_created = movementResult?.data
      console.log('✅ Stock movement created')

      // ========== 5. อัพเดต Lot (เพิ่มสต็อค หรือไม่เพิ่ม ขึ้นกับประเภท) ==========
      console.log('📊 Step 5: Updating lot stock...')
      
      // ✅ เฉพาะสินค้าที่ count_in_stock = true เท่านั้นที่จะเพิ่มกลับเข้า lot
      if (shouldCountInStock) {
        // กรณีสินค้าสภาพดี - เพิ่มกลับเข้า Lot
        console.log(`✅ Counting in stock - will add ${return_meters} meters back to lot`)
        const newRemainingMeters = lot.remaining_meters + return_meters

        const lotUpdateResult = await this.apiRequest.PUT(`lot_tracking/${lot_id}`, {
          data: {
            remaining_meters: newRemainingMeters,
            updated_at: new Date().toISOString()
          }
        }, this.clientKey)

        results.lot_updated = lotUpdateResult?.data
        console.log(`✅ Lot updated: remaining=${newRemainingMeters} (+${return_meters})`)
      } else {
        // กรณีของเสีย/ตัวอย่าง - ไม่เพิ่มกลับเข้า Lot (มีแต่ร่องรอยใน movement)
        if (is_scrap_return) {
          console.log('🗑️ Scrap return - not adding back to lot (audit trail only)')
          results.lot_updated = { message: 'Scrap return - no lot update (audit trail only)' }
        } else if (is_sample) {
          console.log('🧪 Sample return - not adding back to lot (audit trail only)')
          results.lot_updated = { message: 'Sample return - no lot update (audit trail only)' }
        } else {
          console.log('⚠️ Defective item - not adding back to lot')
          results.lot_updated = { message: 'Defective item - no lot update' }
        }
      }

      // ========== 6. อัพเดต Inventory Balance ==========
      console.log('💰 Step 6: Updating inventory balance...')
      
      const balanceResult = await this.apiRequest.POST('inventory_balance/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: lot.product_id
            }
          }
        ]
      }, this.clientKey)

      const balance = balanceResult?.data?.[0]

      if (balance) {
        // ✅ อัพเดต lot_details เฉพาะถ้า count_in_stock = true
        if (shouldCountInStock) {
          // อัพเดต lot_details - เพิ่ม qty_available กลับเข้าไป
          const updatedLotDetails = (balance.lot_details || []).map(lotDetail => {
            if (lotDetail.lot_id === lot_id || lotDetail.lot_code === lot.lot_code) {
              return {
                ...lotDetail,
                qty_available: (lotDetail.qty_available || 0) + return_meters
              }
            }
            return lotDetail
          })

          const newQtyOnHand = (balance.qty_on_hand || 0) + return_meters
          const newQtyAvailable = newQtyOnHand - (balance.qty_reserved || 0)

          const balanceUpdateResult = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, {
            data: {
              qty_on_hand: newQtyOnHand,
              qty_available: newQtyAvailable,
              lot_details: updatedLotDetails,
              updated_date: new Date().toISOString()
            }
          }, this.clientKey)

          results.balance_updated = balanceUpdateResult?.data
          console.log('✅ Inventory balance updated (added back)')
        } else {
          // ✅ กรณี scrap/sample/defective - บันทึกแยกตามประเภท
          let updateData = { updated_date: new Date().toISOString() }
          
          if (is_scrap_return) {
            const newScrapQty = (balance.scrap_qty || 0) + return_meters
            updateData.scrap_qty = newScrapQty
            console.log(`🗑️ Recording as scrap: ${newScrapQty} เมตร`)
          } else if (is_sample) {
            const newSampleQty = (balance.sample_qty || 0) + return_meters
            updateData.sample_qty = newSampleQty
            console.log(`🧪 Recording as sample: ${newSampleQty} เมตร`)
          } else {
            // defective
            const newDefectiveQty = (balance.defective_qty || 0) + return_meters
            updateData.defective_qty = newDefectiveQty
            console.log(`⚠️ Recording as defective: ${newDefectiveQty} เมตร`)
          }

          const balanceUpdateResult = await this.apiRequest.PUT(`inventory_balance/${balance._id}`, {
            data: updateData
          }, this.clientKey)

          results.balance_updated = balanceUpdateResult?.data
          console.log('✅ Inventory balance updated (non-stock item)')
        }
      }

      // ========== สรุปผลลัพธ์ ==========
      results.success = true
      
      console.log('✅ ===== RETURN COMPLETED =====')
      console.log('📊 Summary:')
      console.log(`  - Lot: ${lot.lot_code}`)
      console.log(`  - Return: ${return_meters} เมตร`)
      console.log(`  - Type: ${return_type}`)
      console.log(`  - Location: ${return_location_code || lot.location_code} (${location_type})`)
      console.log(`  - Customer: ${customer_name || 'N/A'}`)
      console.log(`  - Count in stock: ${shouldCountInStock ? 'YES' : 'NO'}`)
      console.log(`  - Scrap: ${is_scrap_return ? 'YES' : 'NO'}`)
      console.log(`  - Sample: ${is_sample ? 'YES' : 'NO'}`)
      
      return results

    } catch (error) {
      console.error('❌ [InventoryService] Error returning stock:', error)
      results.errors.push(error.message)
      throw error
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()
export default inventoryService

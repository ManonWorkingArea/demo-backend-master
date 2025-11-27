/**
 * Sales Service
 * จัดการข้อมูล Customers, Sales Orders, Quotations, และ Sales Transactions
 * ผ่าน CorporateConfig API
 */

class SalesService {
  constructor() {
    this.apiRequest = null
    this.clientKey = null
    this.initialized = false
    this.cache = {
      customers: [],
      quotations: [],
      salesOrders: [],
      invoices: [],
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
      console.log('🔑 [SalesService] Client Key Debug:', {
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
      console.log('🔑 [SalesService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'appContext.$Key',
        erpCoreKey: !!window.ERP_CORE?.clientKey,
        initialized: this.initialized
      })
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || window.vueApp.$Key || null
      this.initialized = true
      
      // ✅ Debug: ตรวจสอบ clientKey
      console.log('🔑 [SalesService] Client Key Debug:', {
        hasKey: !!this.clientKey,
        keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'window.vueApp.$Key',
        erpCoreKey: !!window.ERP_CORE?.clientKey,
        initialized: this.initialized
      })
    } else {
      console.error('❌ SalesService: No $Request service found!')
      console.log('Available properties:', Object.keys(vueAppOrInstance || {}))
      this.initialized = false
    }
  }

  // ==================== Customers ====================



  /**
   * Get all customers (exclude soft deleted)
   * ดึงข้อมูลลูกค้าทั้งหมดจาก customers collection
   */
  async getAllCustomers() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized. Please call initialize(vueApp) first.')
    }

    // ✅ Refresh clientKey จาก ERP_CORE ก่อนใช้งาน
    this.refreshClientKey()

    try {
      // ✅ ใช้ GET endpoint โดยตรงแทน aggregate
      const response = await this.apiRequest.GET('customers', this.clientKey)

      if (response && response.data) {
        // ✅ กรองเฉพาะลูกค้าที่ไม่ได้ถูกลบ และเรียงตาม created_at
        let customers = Array.isArray(response.data) ? response.data : []
        
        customers = customers
          .filter(customer => customer.status !== 'deleted') // ไม่รวมที่ถูก soft delete
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)) // เรียงจากใหม่ไปเก่า
          .map(customer => ({
            ...customer,
            id: customer._id || customer.id // แปลง _id เป็น id สำหรับ Vue component
          }))
        
        this.cache.customers = customers
        this.cache.lastUpdated = new Date()
        
        console.log(`📋 [SalesService] Loaded ${customers.length} customers successfully`)
        return customers
      }
      
      console.warn('⚠️ [SalesService] No customer data received')
      return []
    } catch (error) {
      console.error('❌ Failed to get customers:', error)
      
      // Return cached data if available during error
      if (this.cache.customers?.length > 0) {
        console.warn('🔄 [SalesService] Returning cached customer data due to error')
        return this.cache.customers
      }
      
      throw error
    }
  }

  /**
   * Get customer by ID
   * ดึงข้อมูลลูกค้าตาม ID จาก customers collection
   */
  async getCustomer(customerId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.GET(`customers/${customerId}`, this.clientKey)
      
      if (response?.data) {
        // ✅ แปลง _id เป็น id สำหรับ Vue component
        const customer = {
          ...response.data,
          id: response.data._id || response.data.id
        }
        
        console.log(`👤 [SalesService] Loaded customer: ${customer.customer_code || customer.name}`)
        return customer
      }
      
      console.warn('⚠️ [SalesService] Customer not found:', customerId)
      return null
    } catch (error) {
      console.error('❌ Failed to get customer:', error)
      throw error
    }
  }

  /**
   * ✅ Get customer with complete sales data (Orders, Quotations, Invoices)
   */
  async getCustomerWithSalesData(customerId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('👤 [SalesService] Loading customer with sales data:', customerId)

      // ขั้นตอนที่ 1: ดึงข้อมูล customer ก่อน
      const response = await this.apiRequest.POST('customers/aggregate', {
        pipeline: [
          {
            $match: {
              _id: customerId
            }
          }
        ]
      }, this.clientKey)

      const customerData = response?.data?.[0]

      if (!customerData) {
        console.warn('⚠️ [SalesService] Customer not found:', customerId)
        return null
      }

      console.log('✅ [SalesService] Customer found:', customerData.customer_name)

      // ขั้นตอนที่ 2: ดึงข้อมูล sales แยกต่างหาก
      const [salesOrdersData, quotationsData, invoicesData] = await Promise.all([
        // Sales Orders
        this.apiRequest.POST('sales_orders/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { customer_id: customerId },
                  { customer_id: customerData._id },
                  { customer_code: customerData.customer_code }
                ]
              }
            },
            {
              $sort: { order_date: -1 }
            }
          ]
        }, this.clientKey),
        // Quotations
        this.apiRequest.POST('quotations/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { customer_id: customerId },
                  { customer_id: customerData._id },
                  { customer_code: customerData.customer_code }
                ]
              }
            },
            {
              $sort: { quote_date: -1 }
            }
          ]
        }, this.clientKey),
        // Sales Invoices
        this.apiRequest.POST('sales_invoices/aggregate', {
          pipeline: [
            {
              $match: {
                $or: [
                  { customer_id: customerId },
                  { customer_id: customerData._id },
                  { customer_code: customerData.customer_code }
                ]
              }
            },
            {
              $sort: { invoice_date: -1 }
            }
          ]
        }, this.clientKey)
      ])

      const salesOrders = salesOrdersData?.data || []
      const quotations = quotationsData?.data || []
      const invoices = invoicesData?.data || []

      console.log('✅ [SalesService] Sales data loaded:', {
        salesOrders: salesOrders.length,
        quotations: quotations.length,
        invoices: invoices.length
      })

      // คำนวณสถิติ
      const totalSalesAmount = salesOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalQuoteAmount = quotations.reduce((sum, quote) => sum + (quote.total_amount || 0), 0)
      const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0)

      const resultData = {
        ...customerData,
        id: customerData._id || customerData.id,
        // ข้อมูล summary
        total_sales_orders: salesOrders.length,
        total_quotations: quotations.length,
        total_invoices: invoices.length,
        total_sales_amount: totalSalesAmount,
        total_quote_amount: totalQuoteAmount,
        total_invoice_amount: totalInvoiceAmount,
        // ข้อมูลแยกตาม type
        sales_orders: salesOrders,
        quotations: quotations,
        invoices: invoices
      }

      console.log('✅ [SalesService] Final Customer Data Summary:', {
        id: resultData.id,
        customer_name: resultData.customer_name,
        total_sales_orders: resultData.total_sales_orders,
        total_quotations: resultData.total_quotations,
        total_invoices: resultData.total_invoices,
        total_sales_amount: resultData.total_sales_amount
      })

      return resultData

    } catch (error) {
      console.error('❌ [SalesService] Failed to load customer with sales data:', error)
      throw error
    }
  }

  /**
   * Create new customer
   * บันทึกลงใน customers collection (ไม่ใช่ transaction)
   */
  async createCustomer(customerData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    // ✅ Refresh clientKey จาก ERP_CORE ก่อนสร้าง Customer
    this.refreshClientKey()

    try {
      console.log('📝 [SalesService] Creating new customer with clientKey:', this.clientKey)
      console.log('📊 Customer Data:', customerData)

      // ✅ สร้างรหัสลูกค้าอัตโนมัติถ้ายังไม่มี
      if (!customerData.customer_code && window.ERP_CORE?.codeManager) {
        try {
          const generatedCode = await window.ERP_CORE.codeManager.generateCode('customer')
          if (generatedCode) {
            customerData.customer_code = generatedCode
            console.log('🔢 [SalesService] Generated customer code:', generatedCode)
          }
        } catch (codeError) {
          console.warn('[SalesService] Customer code generation failed, using fallback:', codeError)
          customerData.customer_code = `CUS${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
        }
      }

      // ✅ เตรียมข้อมูลสำหรับบันทึก
      const customerToSave = {
        ...customerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: customerData.status || 'active',
        workflow_state: customerData.workflow_state || 'approved'
      }

      // ✅ บันทึกลงใน customers collection โดยตรง
      const response = await this.apiRequest.POST('customers', {
        data: customerToSave
      }, this.clientKey)
      
      console.log('✅ [SalesService] Customer created successfully:', response)

      // ✅ Update sequence in database after successful creation
      if (response?.data && customerData.customer_code) {
        console.log('🔄 [SalesService] Updating sequence after successful customer creation...')
        
        try {
          const sequenceUpdateResult = await this.updateSequenceInDatabase(customerData.customer_code, 'customer')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Customer sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Customer sequence update failed but customer was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Customer sequence update error (non-critical):', sequenceError)
          // ไม่ throw error เพราะ customer สร้างสำเร็จแล้ว
        }
      }
      
      // Invalidate cache
      this.cache.customers = []
      this.cache.lastUpdated = null
      
      // ✅ Return standardized format ที่ components คาดหวัง
      return {
        success: true,
        data: response?.data || customerToSave,
        message: 'สร้างลูกค้าเรียบร้อยแล้ว',
        id: response?.data?._id || response?.data?.id
      }
    } catch (error) {
      console.error('❌ Failed to create customer:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการสร้างลูกค้า'
      }
    }
  }

  /**
   * Update customer
   * อัปเดตข้อมูลลูกค้าใน customers collection
   */
  async updateCustomer(customerId, customerData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      // ✅ ลบ _id ออกจาก customerData ก่อนส่ง (MongoDB immutable field)
      const cleanData = { ...customerData }
      if (cleanData._id !== undefined) {
        console.log('[SalesService] Removing _id from customer update data:', cleanData._id)
        delete cleanData._id
      }
      
      // ✅ เพิ่ม updated timestamp
      cleanData.updated_at = new Date().toISOString()
      
      // ✅ บันทึกลงใน customers collection โดยตรง
      const response = await this.apiRequest.PUT(`customers/${customerId}`, {
        data: cleanData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.customers = []
      this.cache.lastUpdated = null
      
      return {
        success: true,
        data: response?.data || cleanData,
        message: 'อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to update customer:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า'
      }
    }
  }

  /**
   * Soft Delete customer (change status to 'deleted' instead of actual deletion)
   * ลบลูกค้าแบบ soft delete (เปลี่ยนสถานะเป็น deleted)
   */
  async deleteCustomer(customerId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      console.error('❌ [SalesService] No client key available for soft delete customer request')
      throw new Error('Client key is required for soft delete customer operation')
    }

    try {
      console.log('🗑️ [SalesService] Soft deleting customer:', customerId)
      
      // ✅ Soft Delete: อัปเดต status เป็น 'deleted' แทนการลบจริง
      const softDeleteData = {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`customers/${customerId}`, {
        data: softDeleteData
      }, clientKey)
      
      // Invalidate cache
      this.cache.customers = []
      this.cache.lastUpdated = null
      
      console.log('✅ [SalesService] Customer soft deleted successfully:', customerId)
      return {
        success: true,
        data: response?.data,
        message: 'ลบลูกค้าเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to soft delete customer:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการลบลูกค้า'
      }
    }
  }

  // ==================== Sales Orders ====================

  /**
   * Get all sales orders with customer information
   */
  async getAllSalesOrders() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('sales_orders/aggregate', {
        pipeline: [
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          },
          {
            $sort: { order_date: -1 }
          }
        ]
      }, this.clientKey)

      if (response && response.data) {
        const salesOrders = response.data.map(order => ({
          ...order,
          id: order._id || order.id,
          orderNumber: order.order_number || order.orderNumber,
          orderDate: order.order_date || order.orderDate,
          deliveryDate: order.delivery_date || order.deliveryDate,
          customerName: order.customer?.name || order.customer_name || order.customerName,
          customerPhone: order.customer?.phone || order.customer_phone || order.customerPhone,
          customerId: order.customer_id || order.customerId,
          totalAmount: order.total_amount || order.totalAmount,
          productionStatus: order.production_status || order.productionStatus,
          items: order.items || []
        }))
        
        this.cache.salesOrders = salesOrders
        this.cache.lastUpdated = new Date()
        return salesOrders
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get sales orders:', error)
      throw error
    }
  }

  /**
   * Get sales order by ID
   */
  async getSalesOrder(orderId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('sales_orders/aggregate', {
        pipeline: [
          {
            $match: { _id: orderId }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          }
        ]
      }, this.clientKey)

      const order = response?.data?.[0]
      if (order) {
        return {
          ...order,
          id: order._id || order.id,
          orderNumber: order.order_number || order.orderNumber,
          orderDate: order.order_date || order.orderDate,
          deliveryDate: order.delivery_date || order.deliveryDate,
          customerName: order.customer?.name || order.customer_name || order.customerName,
          customerPhone: order.customer?.phone || order.customer_phone || order.customerPhone,
          customerId: order.customer_id || order.customerId,
          totalAmount: order.total_amount || order.totalAmount,
          productionStatus: order.production_status || order.productionStatus,
          items: order.items || []
        }
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get sales order:', error)
      throw error
    }
  }

  /**
   * Create new sales order
   */
  async createSalesOrder(orderData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      // ✅ Generate sales order number if not provided
      if (!orderData.order_number) {
        orderData.order_number = await this.generateSalesOrderNumber(orderData)
      }

      const response = await this.apiRequest.POST('sales_orders', {
        data: orderData
      }, this.clientKey)
      
      // ✅ Update sequence in database after successful creation
      if (response?.data && orderData.order_number) {
        try {
          console.log('🔄 [SalesService] Updating sales order sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(orderData.order_number, 'sales_order')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Sales order sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Sales order sequence update failed but order was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Sales order sequence update error (non-critical):', sequenceError)
        }
      } else {
        console.warn('⚠️ [SalesService] No order_number found for sequence update')
      }
      
      // Invalidate cache
      this.cache.salesOrders = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to create sales order:', error)
      throw error
    }
  }

  /**
   * Update sales order
   */
  async updateSalesOrder(orderId, orderData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      // ✅ ลบ _id ออกจาก orderData ก่อนส่ง
      const cleanData = { ...orderData }
      if (cleanData._id !== undefined) {
        delete cleanData._id
      }
      
      const response = await this.apiRequest.PUT(`sales_orders/${orderId}`, {
        data: cleanData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.salesOrders = []
      this.cache.lastUpdated = null
      
      return response?.data || null
    } catch (error) {
      console.error('❌ Failed to update sales order:', error)
      throw error
    }
  }

  /**
   * Update Sales Order status and workflow
   */
  async updateSalesOrderStatus(orderId, status, additionalData = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for update sales order operation')
    }

    try {
      console.log(`📝 [SalesService] Updating Sales Order ${orderId} status to: ${status}`)
      
      const updateData = {
        ...additionalData,
        status: status,
        workflow_state: status,
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`sales_orders/${orderId}`, {
        data: updateData
      }, clientKey)
      
      console.log(`✅ [SalesService] Sales Order ${orderId} status updated successfully`)
      return response?.data || response
    } catch (error) {
      console.error('❌ [SalesService] Failed to update sales order status:', error)
      throw error
    }
  }

  // ==================== Quotations ====================

  /**
   * Get all quotations with customer information
   */
  async getAllQuotations() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('quotations/aggregate', {
        pipeline: [
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          },
          {
            $sort: { quote_date: -1 }
          }
        ]
      }, this.clientKey)

      if (response && response.data) {
        const quotations = response.data.map(quote => ({
          ...quote,
          id: quote._id || quote.id,
          quoteNumber: quote.quote_number || quote.quoteNumber,
          quoteDate: quote.quote_date || quote.quoteDate,
          validUntil: quote.valid_until || quote.validUntil,
          customerName: quote.customer?.name || quote.customer_name || quote.customerName,
          customerPhone: quote.customer?.phone || quote.customer_phone || quote.customerPhone,
          customerId: quote.customer_id || quote.customerId,
          totalAmount: quote.total_amount || quote.totalAmount,
          items: quote.items || []
        }))
        
        console.log('✅ [SalesService] Loaded quotations with customer info:', quotations.length)
        
        this.cache.quotations = quotations
        this.cache.lastUpdated = new Date()
        return quotations
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get quotations:', error)
      throw error
    }
  }

  /**
   * Get quotation by ID
   */
  async getQuotation(quoteId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('quotations/aggregate', {
        pipeline: [
          {
            $match: { _id: quoteId }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          }
        ]
      }, this.clientKey)

      const quote = response?.data?.[0]
      if (quote) {
        return {
          ...quote,
          id: quote._id || quote.id,
          quoteNumber: quote.quote_number || quote.quoteNumber,
          quoteDate: quote.quote_date || quote.quoteDate,
          validUntil: quote.valid_until || quote.validUntil,
          customerName: quote.customer?.name || quote.customer_name || quote.customerName,
          customerPhone: quote.customer?.phone || quote.customer_phone || quote.customerPhone,
          customerId: quote.customer_id || quote.customerId,
          totalAmount: quote.total_amount || quote.totalAmount,
          items: quote.items || []
        }
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get quotation:', error)
      throw error
    }
  }

  /**
   * Create new quotation
   */
  async createQuotation(quoteData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      // ✅ Generate quotation number if not provided
      if (!quoteData.quote_number) {
        quoteData.quote_number = await this.generateQuotationNumber(quoteData)
      }

      // ✅ เพิ่ม type และ subtype สำหรับ Transaction Engine
      const quotationData = {
        ...quoteData,
        type: 'sales',
        subtype: 'quotation',
        documentType: 'quotation' // เพิ่มเพื่อให้ชัดเจน
      }

      console.log('📝 [SalesService] Creating quotation with data:', {
        quote_number: quotationData.quote_number,
        type: quotationData.type,
        subtype: quotationData.subtype,
        documentType: quotationData.documentType,
        customer_id: quotationData.customer_id,
        status: quotationData.status
      })

      const response = await this.apiRequest.POST('quotations', {
        data: quotationData
      }, this.clientKey)
      
      // ✅ Update sequence in database after successful creation
      if (response?.data && quoteData.quote_number) {
        try {
          console.log('🔄 [SalesService] Updating quotation sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(quoteData.quote_number, 'quotation')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Quotation sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Quotation sequence update failed but quotation was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Quotation sequence update error (non-critical):', sequenceError)
        }
      } else {
        console.warn('⚠️ [SalesService] No quote_number found for sequence update')
      }
      
      // Invalidate cache
      this.cache.quotations = []
      this.cache.lastUpdated = null
      
      console.log('✅ [SalesService] Quotation created successfully')
      return {
        success: true,
        data: response?.data,
        message: 'สร้างใบเสนอราคาเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to create quotation:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา'
      }
    }
  }

  /**
   * Update quotation
   */
  async updateQuotation(quoteId, quoteData) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('📝 [SalesService] Updating quotation:', quoteId)
      
      // Prepare data for update - เพิ่ม type และ subtype
      const updateData = {
        ...quoteData,
        type: 'sales',
        subtype: 'quotation',
        documentType: 'quotation',
        updated_at: new Date().toISOString()
      }

      // Remove _id if present to avoid conflicts
      delete updateData._id
      delete updateData.id

      const response = await this.apiRequest.PUT(`quotations/${quoteId}`, {
        data: updateData
      }, this.clientKey)
      
      // Invalidate cache
      this.cache.quotations = []
      this.cache.lastUpdated = null
      
      console.log('✅ [SalesService] Quotation updated successfully')
      return {
        success: true,
        data: response?.data,
        message: 'อัปเดตใบเสนอราคาเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to update quotation:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการอัปเดตใบเสนอราคา'
      }
    }
  }

  /**
   * Create Invoice from Quotation
   * Clone quotation data and create invoice with reference
   */
  async createInvoiceFromQuotation(quotationId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔄 [SalesService] Creating invoice from quotation:', quotationId)

      // 1. Get quotation data
      const quotation = await this.getQuotation(quotationId)
      
      if (!quotation) {
        throw new Error('ไม่พบข้อมูลใบเสนอราคา')
      }

      // 2. Check if quotation already has invoice
      if (quotation.invoice_id) {
        throw new Error('ใบเสนอราคานี้สร้าง Invoice ไปแล้ว')
      }

      // 3. Ensure customer has customer_code (Code Manager Integration)
      let customerCode = quotation.customer_code
      
      if (!customerCode && quotation.customer_id) {
        console.log('🔄 [SalesService] Customer missing customer_code, checking database...')
        
        try {
          // Get customer data
          const customer = await this.getCustomer(quotation.customer_id)
          
          if (customer?.customer_code) {
            customerCode = customer.customer_code
            console.log('✅ [SalesService] Found existing customer_code:', customerCode)
          } else {
            // Generate new customer_code via Code Manager
            if (window.ERP_CORE?.codeManager) {
              console.log('🔄 [SalesService] Generating customer_code via Code Manager...')
              const generatedCode = await window.ERP_CORE.codeManager.generateCode('customer')
              
              if (generatedCode) {
                customerCode = generatedCode
                console.log('✅ [SalesService] Generated customer_code:', customerCode)
                
                // Update customer with new code
                await this.apiRequest.PUT(`customers/${quotation.customer_id}`, {
                  data: { customer_code: customerCode }
                }, this.clientKey)
                
                // Update sequence in database
                await this.updateSequenceInDatabase(customerCode, 'customer')
              }
            } else {
              // Fallback: Generate basic code
              customerCode = `CUS${new Date().getFullYear()}${String(Date.now()).slice(-5)}`
              console.log('⚠️ [SalesService] Using fallback customer_code:', customerCode)
            }
          }
        } catch (customerError) {
          console.warn('⚠️ [SalesService] Error getting customer_code:', customerError)
          customerCode = quotation.customer_code || null
        }
      }

      // 4. Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber()

      // 5. Clone quotation data to create invoice
      const invoiceData = {
        // Document metadata
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        type: 'sales',
        subtype: 'invoice',
        documentType: 'invoice',
        
        // Reference to quotation
        quotation_id: quotation._id,
        quotation_number: quotation.quote_number,
        
        // Clone customer data with customer_code
        customer_id: quotation.customer_id,
        customer_name: quotation.customer_name,
        customer_code: customerCode, // ✅ เพิ่ม customer_code
        
        // Clone items with lot tracking
        items: quotation.items.map(item => ({
          ...item,
          // Preserve lot tracking info
          lot_id: item.lot_id,
          lot_code: item.lot_code,
          is_full_roll: item.is_full_roll,
          max_quantity: item.max_quantity
        })),
        
        // Clone amounts
        subtotal: quotation.subtotal,
        vat_rate: quotation.vat_rate,
        vat_amount: quotation.vat_amount,
        total_amount: quotation.total_amount,
        discount: quotation.discount || 0,
        grand_total: quotation.grand_total || quotation.total_amount,
        
        // Clone notes
        notes: quotation.notes,
        
        // Invoice-specific fields
        status: 'pending_payment',
        payment_status: 'pending',
        paid_amount: 0,
        payment_date: null,
        due_date: null, // Can be set later
        
        // Audit
        created_at: new Date().toISOString(),
        created_by: quotation.created_by || 'system',
        updated_at: new Date().toISOString()
      }

      console.log('📝 [SalesService] Creating invoice with data:', {
        invoice_number: invoiceData.invoice_number,
        customer_code: invoiceData.customer_code,
        quotation_number: invoiceData.quotation_number,
        total_amount: invoiceData.total_amount
      })

      // 6. ✅ จองสต็อคก่อนสร้าง Invoice (CRITICAL - ต้องสำเร็จก่อน)
      console.log('🔒 [SalesService] Step 6: Reserving stock BEFORE creating invoice...')
      console.log('📋 [SalesService] Quotation items for reservation:', JSON.stringify(quotation.items, null, 2))
      
      let reservationResult = null
      let stockReservations = []
      
      try {
        // Import InventoryService
        const { inventoryService } = await import('./InventoryService.js')
        
        // Initialize if needed
        if (!inventoryService.isReady()) {
          console.log('🔄 [SalesService] Initializing InventoryService...')
          inventoryService.initialize(window.vueApp?.config?.globalProperties || { $Request: this.apiRequest, $Key: this.clientKey })
        }

        // จองสต็อคจาก quotation items
        console.log('🔄 [SalesService] Calling reserveStockForQuotation with:', {
          quotationId,
          itemsCount: quotation.items?.length || 0
        })

        reservationResult = await inventoryService.reserveStockForQuotation(
          quotationId,
          quotation.items || []
        )

        console.log('📊 [SalesService] Reservation result:', JSON.stringify(reservationResult, null, 2))

        // ✅ ตรวจสอบว่าการจองสำเร็จหรือไม่
        if (!reservationResult.success) {
          // มี errors - ต้องยกเลิก
          const errorMessages = reservationResult.errors?.map(err => {
            if (typeof err === 'string') return err
            if (err.error) return err.error
            if (err.message) return err.message
            return JSON.stringify(err)
          }).join(', ') || 'Unknown error'
          throw new Error(`ไม่สามารถจองสต็อคได้: ${errorMessages}`)
        }

        // ✅ ตรวจสอบว่าจองได้ทุกรายการหรือไม่
        if (!reservationResult.reservations || reservationResult.reservations.length === 0) {
          throw new Error('ไม่สามารถจองสต็อคได้เลย กรุณาตรวจสอบสต็อคคงเหลือ')
        }

        // ✅ ตรวจสอบว่ามี errors บางรายการหรือไม่
        if (reservationResult.errors && reservationResult.errors.length > 0) {
          const errorItems = reservationResult.errors.map(err => {
            const productName = err.product_name || err.lot_code || 'Unknown'
            const errorMsg = err.error || err.message || ''
            return `${productName} (${errorMsg})`
          }).join(', ')
          throw new Error(`จองสต็อคไม่สำเร็จสำหรับสินค้า: ${errorItems}`)
        }

        console.log('✅ [SalesService] Stock reserved successfully:', reservationResult.reservations.length, 'items')
        stockReservations = reservationResult.reservations

      } catch (reservationError) {
        console.error('❌ [SalesService] Stock reservation FAILED:', reservationError)
        console.error('❌ [SalesService] Error details:', {
          message: reservationError.message,
          stack: reservationError.stack,
          reservationResult: reservationResult
        })
        
        // ✅ ยกเลิกการสร้าง Invoice ทันทีเพราะจองสต็อคไม่สำเร็จ
        throw new Error(`ไม่สามารถสร้างใบแจ้งหนี้ได้ เนื่องจาก${reservationError.message}`)
      }

      // 7. เพิ่มข้อมูลการจองใน invoiceData
      invoiceData.stock_reservations = stockReservations
      invoiceData.reservation_status = 'not_paid'
      invoiceData.reservation_date = new Date().toISOString()
      
      console.log('📝 [SalesService] Step 7: Creating invoice after successful stock reservation...')

      // 8. Create invoice in database
      const response = await this.apiRequest.POST('sales_invoices', {
        data: invoiceData
      }, this.clientKey)

      const invoiceId = response?.data?._id || response?.data?.id

      if (!invoiceId) {
        // ❌ สร้าง Invoice ไม่สำเร็จ - ต้อง rollback การจอง
        console.error('❌ [SalesService] Invoice creation failed, need to rollback reservations')
        
        // TODO: Implement rollback - ควรลบ lot_reservations ที่สร้างไว้
        try {
          console.log('🔄 [SalesService] Rolling back stock reservations...')
          for (const reservation of stockReservations) {
            if (reservation.reservation_id) {
              console.log(`🔄 [SalesService] Rolling back reservation: ${reservation.reservation_id}`)
              // ลบการจองที่สร้างไว้
              await this.apiRequest.DELETE(`lot_reservations/${reservation.reservation_id}`, this.clientKey)
            }
          }
        } catch (rollbackError) {
          console.error('❌ [SalesService] Rollback failed:', rollbackError)
        }
        
        throw new Error('ไม่สามารถสร้าง Invoice ได้')
      }

      console.log('✅ [SalesService] Invoice created with ID:', invoiceId)

      // 9. Update sequence in database after successful creation
      if (invoiceNumber) {
        try {
          console.log('🔄 [SalesService] Updating invoice sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(invoiceNumber, 'invoice')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Invoice sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Invoice sequence update failed but invoice was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Invoice sequence update error (non-critical):', sequenceError)
        }
      }

      // 10. Update quotation status and link to invoice
      await this.apiRequest.PUT(`quotations/${quotationId}`, {
        data: {
          status: 'invoiced',
          invoice_id: invoiceId,
          invoice_number: invoiceNumber,
          invoiced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      // 10. Invalidate cache
      this.cache.quotations = []
      this.cache.invoices = []
      this.cache.customers = []
      this.cache.lastUpdated = null

      console.log('✅ [SalesService] Invoice created successfully:', {
        invoice_number: invoiceNumber,
        invoice_id: invoiceId,
        customer_code: customerCode,
        quotation_number: quotation.quote_number,
        reservations_count: stockReservations.length
      })

      return {
        success: true,
        _id: invoiceId,
        invoice_number: invoiceNumber,
        customer_code: customerCode,
        quotation_id: quotationId,
        quotation_number: quotation.quote_number,
        stock_reservations: stockReservations,
        data: response?.data,
        message: `สร้าง Invoice ${invoiceNumber} จาก ${quotation.quote_number} สำเร็จ (จองสต็อค ${stockReservations.length} รายการ)`
      }

    } catch (error) {
      console.error('❌ [SalesService] Failed to create invoice from quotation:', error)
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการสร้าง Invoice')
    }
  }

  /**
   * Record Payment for Invoice
   * Update invoice payment status to paid
   */
  async recordPayment(invoiceId, paymentData = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔄 [SalesService] Recording payment for invoice:', invoiceId)

      // 1. Get invoice data
      const invoice = await this.getInvoice(invoiceId)
      
      if (!invoice) {
        throw new Error('ไม่พบข้อมูล Invoice')
      }

      // 2. Check if already paid
      if (invoice.payment_status === 'paid') {
        throw new Error('Invoice นี้ชำระเงินครบแล้ว')
      }

      // 3. Prepare payment update data
      const paidAmount = paymentData.paid_amount || invoice.total_amount
      const paymentDate = paymentData.payment_date || new Date().toISOString()
      const paymentMethod = paymentData.payment_method || null
      const paymentSlip = paymentData.payment_slip || null
      const paymentNote = paymentData.payment_note || null

      const updateData = {
        payment_status: 'paid',
        paid_amount: paidAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        payment_slip: paymentSlip,
        payment_note: paymentNote,
        status: 'paid',
        updated_at: new Date().toISOString()
      }

      console.log('📝 [SalesService] Updating invoice payment:', {
        invoice_number: invoice.invoice_number,
        paid_amount: paidAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        has_slip: !!paymentSlip
      })

      // 4. Update invoice
      const response = await this.apiRequest.PUT(`sales_invoices/${invoiceId}`, {
        data: updateData
      }, this.clientKey)

      // 5. ✅ เปลี่ยนสถานะการจองเป็น 'paid' (ยกเลิกไม่ได้)
      try {
        console.log('💳 [SalesService] Updating reservation status to paid...')
        
        // Import InventoryService
        const { inventoryService } = await import('./InventoryService.js')
        
        // Initialize if needed
        if (!inventoryService.isReady()) {
          inventoryService.initialize(window.vueApp?.config?.globalProperties || { $Request: this.apiRequest, $Key: this.clientKey })
        }

        // เปลี่ยนสถานะการจองจาก not_paid เป็น paid
        if (invoice.quotation_id) {
          const confirmResult = await inventoryService.confirmReservationPayment(
            invoice.quotation_id,
            invoiceId
          )

          if (confirmResult.success) {
            console.log('✅ [SalesService] Reservation status updated to paid:', confirmResult.updated, 'items')
          }
        } else {
          console.warn('⚠️ [SalesService] No quotation_id found, skipping reservation confirmation')
        }

      } catch (confirmError) {
        console.error('❌ [SalesService] Reservation confirmation failed (non-critical):', confirmError)
        // ไม่ throw error เพราะ payment บันทึกสำเร็จแล้ว
      }

      // 6. Invalidate cache
      this.cache.invoices = []
      this.cache.lastUpdated = null

      console.log('✅ [SalesService] Payment recorded successfully')

      return {
        success: true,
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        paid_amount: paidAmount,
        payment_date: paymentDate,
        data: response?.data,
        message: `บันทึกการชำระเงิน ${invoice.invoice_number} สำเร็จ`
      }

    } catch (error) {
      console.error('❌ [SalesService] Failed to record payment:', error)
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน')
    }
  }

  /**
   * Create Sales Order from Invoice (After Payment)
   * Clone invoice data and create sales order with reference
   */
  async createSalesOrderFromInvoice(invoiceId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔄 [SalesService] Creating sales order from invoice:', invoiceId)

      // 1. Get invoice data
      const invoice = await this.getInvoice(invoiceId)
      
      if (!invoice) {
        throw new Error('ไม่พบข้อมูล Invoice')
      }

      // 2. Check payment status
      if (invoice.payment_status !== 'paid') {
        throw new Error('ต้องชำระเงินครบก่อนจึงสามารถสร้าง Sales Order ได้')
      }

      // 3. Check if invoice already has sales order
      if (invoice.sales_order_id) {
        throw new Error('Invoice นี้สร้าง Sales Order ไปแล้ว')
      }

      // 4. Generate sales order number
      const salesOrderNumber = await this.generateSalesOrderNumber()

      // 5. Clone invoice data to create sales order
      const salesOrderData = {
        // Document metadata
        order_number: salesOrderNumber,
        order_date: new Date().toISOString(),
        type: 'sales',
        subtype: 'sales_order',
        documentType: 'sales_order',
        
        // Reference to invoice and quotation
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number,
        quotation_id: invoice.quotation_id || null,
        quotation_number: invoice.quotation_number || null,
        
        // Clone customer data with customer_code
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name || invoice.customerName,
        customer_code: invoice.customer_code,
        
        // Clone items with lot tracking
        items: invoice.items.map(item => ({
          ...item,
          // Preserve lot tracking info for production
          lot_id: item.lot_id,
          lot_code: item.lot_code,
          is_full_roll: item.is_full_roll,
          max_quantity: item.max_quantity
        })),
        
        // Clone amounts
        subtotal: invoice.subtotal,
        vat_rate: invoice.vat_rate,
        vat_amount: invoice.vat_amount,
        total_amount: invoice.total_amount,
        discount: invoice.discount || 0,
        grand_total: invoice.grand_total || invoice.total_amount,
        
        // Clone notes
        notes: invoice.notes,
        
        // Sales Order specific fields
        status: 'confirmed',
        workflow_state: 'confirmed',
        production_status: 'pending',
        delivery_status: 'pending',
        delivery_date: null, // Can be set later
        
        // Payment info (already paid)
        payment_status: 'paid',
        paid_amount: invoice.paid_amount || invoice.total_amount,
        payment_date: invoice.payment_date,
        
        // Audit
        created_at: new Date().toISOString(),
        created_by: invoice.created_by || 'system',
        updated_at: new Date().toISOString()
      }

      console.log('📝 [SalesService] Creating sales order with data:', {
        order_number: salesOrderData.order_number,
        customer_code: salesOrderData.customer_code,
        invoice_number: salesOrderData.invoice_number,
        total_amount: salesOrderData.total_amount
      })

      // 6. Create sales order in database
      const response = await this.apiRequest.POST('sales_orders', {
        data: salesOrderData
      }, this.clientKey)

      const salesOrderId = response?.data?._id || response?.data?.id

      if (!salesOrderId) {
        throw new Error('ไม่สามารถสร้าง Sales Order ได้')
      }

      // 7. Update sequence in database after successful creation
      if (salesOrderNumber) {
        try {
          console.log('🔄 [SalesService] Updating sales order sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(salesOrderNumber, 'sales_order')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Sales order sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Sales order sequence update failed but order was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Sales order sequence update error (non-critical):', sequenceError)
        }
      }

      // 8. Update invoice to link sales order
      await this.apiRequest.PUT(`sales_invoices/${invoiceId}`, {
        data: {
          sales_order_id: salesOrderId,
          sales_order_number: salesOrderNumber,
          sales_order_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      // 9. Update quotation if exists
      if (invoice.quotation_id) {
        try {
          await this.apiRequest.PUT(`quotations/${invoice.quotation_id}`, {
            data: {
              sales_order_id: salesOrderId,
              sales_order_number: salesOrderNumber,
              status: 'converted',
              updated_at: new Date().toISOString()
            }
          }, this.clientKey)
        } catch (quotationError) {
          console.warn('⚠️ [SalesService] Could not update quotation:', quotationError)
        }
      }

      // 10. Invalidate cache
      this.cache.quotations = []
      this.cache.invoices = []
      this.cache.salesOrders = []
      this.cache.lastUpdated = null

      console.log('✅ [SalesService] Sales order created successfully:', {
        order_number: salesOrderNumber,
        sales_order_id: salesOrderId,
        invoice_number: invoice.invoice_number
      })

      return {
        success: true,
        _id: salesOrderId,
        order_number: salesOrderNumber,
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        quotation_id: invoice.quotation_id,
        quotation_number: invoice.quotation_number,
        data: response?.data,
        message: `สร้าง Sales Order ${salesOrderNumber} จาก Invoice ${invoice.invoice_number} สำเร็จ`
      }

    } catch (error) {
      console.error('❌ [SalesService] Failed to create sales order from invoice:', error)
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการสร้าง Sales Order')
    }
  }

  /**
   * Convert quotation to sales order
   */
  async convertQuotationToSalesOrder(quoteId, additionalData = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log(`🔄 [SalesService] Converting quotation ${quoteId} to sales order`)

      // Get quotation data
      const quotation = await this.getQuotation(quoteId)
      
      if (!quotation) {
        throw new Error('Quotation not found')
      }

      // Create sales order from quotation data
      const salesOrderData = {
        customer_id: quotation.customer_id,
        customer_name: quotation.customer_name,
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: quotation.delivery_date,
        items: quotation.items || [],
        subtotal: quotation.subtotal,
        tax_amount: quotation.tax_amount,
        total_amount: quotation.total_amount,
        notes: quotation.notes,
        status: 'pending',
        workflow_state: 'pending',
        reference_type: 'quotation',
        reference_id: quoteId,
        reference_number: quotation.quote_number,
        created_from: 'quotation_conversion',
        ...additionalData
      }

      // Create sales order
      const salesOrder = await this.createSalesOrder(salesOrderData)

      // Update quotation status
      await this.apiRequest.PUT(`quotations/${quoteId}`, {
        data: {
          status: 'converted',
          workflow_state: 'converted',
          converted_to_sales_order_id: salesOrder.id,
          converted_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      console.log(`✅ [SalesService] Quotation converted to sales order successfully`)
      return { salesOrder, quotation }

    } catch (error) {
      console.error('❌ [SalesService] Failed to convert quotation to sales order:', error)
      throw error
    }
  }

  // ==================== Sales Invoices ====================

  /**
   * Get all sales invoices
   */
  async getAllSalesInvoices() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('sales_invoices/aggregate', {
        pipeline: [
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          },
          {
            $sort: { invoice_date: -1 }
          }
        ]
      }, this.clientKey)

      if (response && response.data) {
        return response.data.map(invoice => ({
          ...invoice,
          id: invoice._id || invoice.id,
          invoiceNumber: invoice.invoice_number || invoice.invoiceNumber,
          invoiceDate: invoice.invoice_date || invoice.invoiceDate,
          dueDate: invoice.due_date || invoice.dueDate,
          customerName: invoice.customer?.name || invoice.customer_name || invoice.customerName,
          customerPhone: invoice.customer?.phone || invoice.customer_phone || invoice.customerPhone,
          customerId: invoice.customer_id || invoice.customerId,
          totalAmount: invoice.total_amount || invoice.totalAmount,
          paymentStatus: invoice.payment_status || invoice.paymentStatus,
          items: invoice.items || []
        }))
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get sales invoices:', error)
      throw error
    }
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(invoiceId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔄 [SalesService] Getting invoice:', invoiceId)
      
      // Use aggregation to get invoice with customer data
      const response = await this.apiRequest.POST('sales_invoices/aggregate', {
        pipeline: [
          {
            $match: {
              _id: invoiceId
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: {
              path: '$customer',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $limit: 1
          }
        ]
      }, this.clientKey)

      if (response?.data && response.data.length > 0) {
        const invoice = response.data[0]
        return {
          ...invoice,
          id: invoice._id || invoice.id,
          invoiceNumber: invoice.invoice_number || invoice.invoiceNumber,
          invoiceDate: invoice.invoice_date || invoice.invoiceDate,
          dueDate: invoice.due_date || invoice.dueDate,
          customerName: invoice.customer?.name || invoice.customer_name || invoice.customerName,
          customerPhone: invoice.customer?.phone || invoice.customer_phone || invoice.customerPhone,
          customerId: invoice.customer_id || invoice.customerId,
          totalAmount: invoice.total_amount || invoice.totalAmount,
          paymentStatus: invoice.payment_status || invoice.paymentStatus,
          paymentDate: invoice.payment_date || invoice.paymentDate,
          paymentMethod: invoice.payment_method || invoice.paymentMethod,
          paymentSlip: invoice.payment_slip || invoice.paymentSlip,
          paymentNote: invoice.payment_note || invoice.paymentNote,
          items: invoice.items || []
        }
      }

      console.log('⚠️ [SalesService] Invoice not found:', invoiceId)
      return null
    } catch (error) {
      console.error('❌ [SalesService] Failed to get invoice:', error)
      throw error
    }
  }

  /**
   * Create sales invoice from sales order
   */
  async createInvoiceFromSalesOrder(salesOrderId, additionalData = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log(`🧾 [SalesService] Creating invoice from sales order ${salesOrderId}`)

      // Get sales order data
      const salesOrder = await this.getSalesOrder(salesOrderId)
      
      if (!salesOrder) {
        throw new Error('Sales order not found')
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(additionalData)

      // Create invoice data from sales order
      const invoiceData = {
        invoice_number: invoiceNumber,
        customer_id: salesOrder.customer_id,
        customer_name: salesOrder.customer_name,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: additionalData.due_date,
        items: salesOrder.items || [],
        subtotal: salesOrder.subtotal,
        tax_amount: salesOrder.tax_amount,
        total_amount: salesOrder.total_amount,
        notes: salesOrder.notes,
        status: 'draft',
        workflow_state: 'draft',
        reference_type: 'sales_order',
        reference_id: salesOrderId,
        reference_number: salesOrder.order_number,
        created_from: 'sales_order_conversion',
        ...additionalData
      }

      const response = await this.apiRequest.POST('sales_invoices', {
        data: invoiceData
      }, this.clientKey)

      // ✅ Update sequence in database after successful creation
      if (response?.data && invoiceNumber) {
        try {
          console.log('🔄 [SalesService] Updating invoice sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(invoiceNumber, 'sales_invoice')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Invoice sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Invoice sequence update failed but invoice was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Invoice sequence update error (non-critical):', sequenceError)
        }
      }

      // Update sales order status
      await this.updateSalesOrderStatus(salesOrderId, 'invoiced', {
        invoice_id: response.data.id,
        invoiced_date: new Date().toISOString()
      })

      console.log(`✅ [SalesService] Invoice created from sales order successfully`)
      return response?.data || null

    } catch (error) {
      console.error('❌ [SalesService] Failed to create invoice from sales order:', error)
      throw error
    }
  }

  // ==================== Document Number Generation ====================

  /**
   * Generate quotation number using Code Manager
   */
  async generateQuotationNumber(customData = {}) {
    try {
      console.log('🔄 [SalesService] Generating quotation number via Code Manager...')
      
      // ตรวจสอบ Code Manager
      if (window.ERP_CORE?.codeManager) {
        const options = {
          module: 'quotation',
          customData: customData,
          fallbackToDate: true,
          ...customData
        }
        
        const quotationNumber = await window.ERP_CORE.codeManager.generateCode('quotation', null, options)
        
        if (quotationNumber) {
          console.log('✅ [SalesService] Generated quotation number via Code Manager:', quotationNumber)
          return quotationNumber
        }
      }
      
      // Fallback method
      const prefix = 'QT'
      const today = new Date()
      const year = today.getFullYear().toString().slice(-2)
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      
      const response = await this.apiRequest.POST('quotations/aggregate', {
        pipeline: [
          {
            $match: {
              quote_number: { $regex: `^${prefix}${year}${month}` }
            }
          },
          {
            $sort: { quote_number: -1 }
          },
          {
            $limit: 1
          }
        ]
      }, this.clientKey)

      let nextNumber = 1
      if (response?.data?.[0]?.quote_number) {
        const lastNumber = response.data[0].quote_number.slice(-4)
        nextNumber = parseInt(lastNumber) + 1
      }

      const fallbackNumber = `${prefix}${year}${month}${nextNumber.toString().padStart(4, '0')}`
      console.log('⚠️ [SalesService] Using fallback quotation number:', fallbackNumber)
      return fallbackNumber
      
    } catch (error) {
      console.error('❌ Failed to generate quotation number:', error)
      // Ultimate fallback
      return `QT${Date.now().toString().slice(-8)}`
    }
  }

  /**
   * Generate sales order number using Code Manager
   */
  async generateSalesOrderNumber(customData = {}) {
    try {
      console.log('🔄 [SalesService] Generating sales order number via Code Manager...')
      
      // ตรวจสอบ Code Manager
      if (window.ERP_CORE?.codeManager) {
        const options = {
          module: 'sales_order',
          customData: customData,
          fallbackToDate: true,
          ...customData
        }
        
        const orderNumber = await window.ERP_CORE.codeManager.generateCode('sales_order', null, options)
        
        if (orderNumber) {
          console.log('✅ [SalesService] Generated sales order number via Code Manager:', orderNumber)
          return orderNumber
        }
      }
      
      // Fallback method
      const prefix = 'SO'
      const today = new Date()
      const year = today.getFullYear().toString().slice(-2)
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      
      const response = await this.apiRequest.POST('sales_orders/aggregate', {
        pipeline: [
          {
            $match: {
              order_number: { $regex: `^${prefix}${year}${month}` }
            }
          },
          {
            $sort: { order_number: -1 }
          },
          {
            $limit: 1
          }
        ]
      }, this.clientKey)

      let nextNumber = 1
      if (response?.data?.[0]?.order_number) {
        const lastNumber = response.data[0].order_number.slice(-4)
        nextNumber = parseInt(lastNumber) + 1
      }

      const fallbackNumber = `${prefix}${year}${month}${nextNumber.toString().padStart(4, '0')}`
      console.log('⚠️ [SalesService] Using fallback sales order number:', fallbackNumber)
      return fallbackNumber
      
    } catch (error) {
      console.error('❌ Failed to generate sales order number:', error)
      // Ultimate fallback
      return `SO${Date.now().toString().slice(-8)}`
    }
  }

  /**
   * Generate sales invoice number using Code Manager
   */
  async generateInvoiceNumber(customData = {}) {
    try {
      console.log('🔄 [SalesService] Generating invoice number via Code Manager...')
      
      // ตรวจสอบ Code Manager
      if (window.ERP_CORE?.codeManager) {
        // ลองใช้ sales_invoice ก่อน (ตรงกับ database config)
        let invoiceNumber = await window.ERP_CORE.codeManager.generateCode('sales_invoice', null, {
          module: 'sales_invoice',
          customData: customData,
          fallbackToDate: true,
          ...customData
        })
        
        if (invoiceNumber) {
          console.log('✅ [SalesService] Generated invoice number via Code Manager (sales_invoice):', invoiceNumber)
          return invoiceNumber
        }
        
        // ถ้าไม่ได้ ลอง invoice
        invoiceNumber = await window.ERP_CORE.codeManager.generateCode('invoice', null, {
          module: 'invoice',
          customData: customData,
          fallbackToDate: true,
          ...customData
        })
        
        if (invoiceNumber) {
          console.log('✅ [SalesService] Generated invoice number via Code Manager (invoice):', invoiceNumber)
          return invoiceNumber
        }
      }
      
      // Fallback method
      const prefix = 'INV'
      const today = new Date()
      const year = today.getFullYear().toString().slice(-2)
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      
      const response = await this.apiRequest.POST('sales_invoices/aggregate', {
        pipeline: [
          {
            $match: {
              invoice_number: { $regex: `^${prefix}${year}${month}` }
            }
          },
          {
            $sort: { invoice_number: -1 }
          },
          {
            $limit: 1
          }
        ]
      }, this.clientKey)

      let nextNumber = 1
      if (response?.data?.[0]?.invoice_number) {
        const lastNumber = response.data[0].invoice_number.slice(-4)
        nextNumber = parseInt(lastNumber) + 1
      }

      const fallbackNumber = `${prefix}${year}${month}${nextNumber.toString().padStart(4, '0')}`
      console.log('⚠️ [SalesService] Using fallback invoice number:', fallbackNumber)
      return fallbackNumber
      
    } catch (error) {
      console.error('❌ Failed to generate invoice number:', error)
      // Ultimate fallback
      return `INV${Date.now().toString().slice(-8)}`
    }
  }

  /**
   * Generate tax invoice number using Code Manager (ใบกำกับภาษี)
   */
  async generateTaxInvoiceNumber(customData = {}) {
    try {
      console.log('🔄 [SalesService] Generating tax invoice number via Code Manager...')
      
      // ตรวจสอบ Code Manager
      if (window.ERP_CORE?.codeManager) {
        const options = {
          module: 'tax_invoice',
          customData: customData,
          fallbackToDate: true,
          ...customData
        }
        
        const taxInvoiceNumber = await window.ERP_CORE.codeManager.generateCode('tax_invoice', null, options)
        
        if (taxInvoiceNumber) {
          console.log('✅ [SalesService] Generated tax invoice number via Code Manager:', taxInvoiceNumber)
          return taxInvoiceNumber
        }
      }
      
      // Fallback method
      const prefix = 'TAX'
      const today = new Date()
      const year = today.getFullYear().toString().slice(-2)
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      
      const response = await this.apiRequest.POST('tax_invoices/aggregate', {
        pipeline: [
          {
            $match: {
              tax_invoice_number: { $regex: `^${prefix}${year}${month}` }
            }
          },
          {
            $sort: { tax_invoice_number: -1 }
          },
          {
            $limit: 1
          }
        ]
      }, this.clientKey)

      let nextNumber = 1
      if (response?.data?.[0]?.tax_invoice_number) {
        const lastNumber = response.data[0].tax_invoice_number.slice(-4)
        nextNumber = parseInt(lastNumber) + 1
      }

      const fallbackNumber = `${prefix}${year}${month}${nextNumber.toString().padStart(4, '0')}`
      console.log('⚠️ [SalesService] Using fallback tax invoice number:', fallbackNumber)
      return fallbackNumber
      
    } catch (error) {
      console.error('❌ Failed to generate tax invoice number:', error)
      // Ultimate fallback
      return `TAX${Date.now().toString().slice(-8)}`
    }
  }

  /**
   * ✅ Extract pure sequence number from generated code
   * รูปแบบเดียวกับ PurchaseService.extractSequenceFromCode()
   */
  extractSequenceFromCode(generatedCode) {
    if (!generatedCode || typeof generatedCode !== 'string') {
      return null
    }

    try {
      console.log('🔍 [SalesService] Extracting sequence from code:', generatedCode)

      // ✅ Customer Pattern: CUS + X + YYYY + XXX (Customer specific)
      // เช่น CUSX2025003 -> 3, CUSX2025010 -> 10
      const customerPattern = /^CUS[A-Z]?\d{4}(\d{1,4})$/
      const customerMatch = generatedCode.match(customerPattern)
      if (customerMatch && generatedCode.startsWith('CUS')) {
        const sequence = parseInt(customerMatch[1], 10)
        console.log(`✅ [SalesService] Customer Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Sales Pattern: QT/SO/INV/TAX + YYMM + XXXX 
      // เช่น QT2411001 -> 1, SO2411010 -> 10
      const salesPattern = /^(QT|SO|INV|TAX|DN|RCP)\d{4}(\d{1,4})$/
      const salesMatch = generatedCode.match(salesPattern)
      if (salesMatch) {
        const sequence = parseInt(salesMatch[2], 10)
        console.log(`✅ [SalesService] Sales Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Simple Pattern: CUS + XXX (แค่ 3 หลัก)
      // เช่น CUS001 -> 1, CUS010 -> 10
      const simplePattern = /^CUS(\d{1,4})$/
      const simpleMatch = generatedCode.match(simplePattern)
      if (simpleMatch) {
        const sequence = parseInt(simpleMatch[1], 10)
        console.log(`✅ [SalesService] Simple Pattern match: ${sequence}`)
        return sequence
      }

      // ✅ Last digits only (สำหรับการ fallback)
      // เอาเฉพาะตัวเลขหลังสุด 1-4 หลัก
      const digitPattern = /(\d{1,4})$/
      const digitMatch = generatedCode.match(digitPattern)
      if (digitMatch) {
        const lastNumber = parseInt(digitMatch[1], 10)
        // ตรวจสอบว่าตัวเลขหลังสุดเป็น sequence ที่สมเหตุสมผล (1-9999)
        if (lastNumber <= 9999) {
          console.log(`🔄 [SalesService] Last digits match: ${lastNumber}`)
          return lastNumber
        }
      }

      console.warn('⚠️ [SalesService] No valid sequence pattern matched for code:', generatedCode)
      return null

    } catch (error) {
      console.error('❌ [SalesService] Error extracting sequence from code:', generatedCode, error)
      return null
    }
  }

  /**
   * Update sequence in database after successful document creation
   * ✅ รูปแบบเดียวกับ PurchaseService.updateSequenceInDatabase()
   */
  async updateSequenceInDatabase(generatedCode, moduleType = 'sales') {
    if (!this.apiRequest) {
      console.warn('⚠️ [SalesService] updateSequenceInDatabase: Service not initialized')
      return { success: false, reason: 'service_not_initialized' }
    }

    if (!generatedCode) {
      console.warn('⚠️ [SalesService] updateSequenceInDatabase: No generated code provided')
      return { success: false, reason: 'no_generated_code' }
    }

    try {
      console.log(`🔄 [SalesService] Updating sequence for ${moduleType} after successful creation:`, generatedCode)

      // ✅ Extract sequence number from generated code
      const sequenceNumber = this.extractSequenceFromCode(generatedCode)
      
      if (!sequenceNumber || sequenceNumber <= 0) {
        console.warn('⚠️ [SalesService] Could not extract valid sequence number from code:', generatedCode)
        return { success: false, reason: 'sequence_extraction_failed' }
      }

      // ✅ Validate sequence number (ป้องกันตัวเลขใหญ่ผิดปกติ)
      if (sequenceNumber > 9999) {
        console.warn('⚠️ [SalesService] Sequence number too large, likely extraction error:', sequenceNumber, 'from code:', generatedCode)
        // ลองใช้เฉพาะ 1-4 หลักสุดท้าย
        const correctedSequence = parseInt(sequenceNumber.toString().slice(-4), 10)
        console.log('🔧 [SalesService] Using corrected sequence:', correctedSequence)
        return { success: false, reason: 'sequence_too_large', correctedSequence }
      }

      console.log(`🔢 [SalesService] Valid extracted sequence: ${sequenceNumber} from code: ${generatedCode}`)

      // ✅ Smart mapping: ตรวจสอบว่ารหัสที่สร้างมาเป็นแบบไหน
      let targetConfigKey
      
      if (generatedCode.startsWith('CUS')) {
        targetConfigKey = 'number_series.customer'
        console.log('🎯 [SalesService] Detected CUS prefix → Using customer config')
      } else if (generatedCode.startsWith('QT')) {
        targetConfigKey = 'number_series.quotation'
        console.log('🎯 [SalesService] Detected QT prefix → Using quotation config')
      } else if (generatedCode.startsWith('SO')) {
        targetConfigKey = 'number_series.sales_order'
        console.log('🎯 [SalesService] Detected SO prefix → Using sales_order config')
      } else if (generatedCode.startsWith('INV')) {
        targetConfigKey = 'number_series.sales_invoice'
        console.log('🎯 [SalesService] Detected INV prefix → Using sales_invoice config')
      } else if (generatedCode.startsWith('TAX')) {
        targetConfigKey = 'number_series.tax_invoice'
        console.log('🎯 [SalesService] Detected TAX prefix → Using tax_invoice config')
      } else {
        // Fallback: ใช้ moduleType
        targetConfigKey = `number_series.${moduleType}`
        console.log('🎯 [SalesService] Unknown prefix → Fallback to moduleType config:', targetConfigKey)
      }

      // ✅ Use AccountingSettings.saveConfig
      const accountingSettings = window.ERP_CORE?.accounting
      if (!accountingSettings) {
        console.warn('⚠️ [SalesService] No accounting settings available')
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
        const prefixMap = {
          'CUS': 'CUS',
          'QT': 'QT', 
          'SO': 'SO',
          'INV': 'INV',
          'TAX': 'TAX'
        }
        const detectedPrefix = Object.keys(prefixMap).find(p => generatedCode.startsWith(p)) || moduleType.toUpperCase().slice(0, 3)
        
        configToSave = {
          prefix: prefixMap[detectedPrefix] || detectedPrefix,
          format: '{prefix}{year}{month}{sequence}',
          sequence: {
            digits: 4,
            start: 1,
            current: sequenceNumber,
            next: sequenceNumber + 1,
            resetOnYearChange: true,
            resetOnMonthChange: false,
            lastUpdated: new Date().toISOString()
          },
          resetPeriod: 'yearly',
          updatedAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        }
      }

      console.log('📝 [SalesService] Saving config:', { targetConfigKey, configToSave })

      // ✅ Use AccountingSettings.saveConfig
      await accountingSettings.saveConfig(targetConfigKey, configToSave, {
        name: `Number Series for Sales - ${moduleType} - ${targetConfigKey}`,
        description: `รูปแบบเลขที่เอกสารสำหรับ ${moduleType} - ${targetConfigKey}`
      })

      console.log(`✅ [SalesService] Successfully updated sequence to ${sequenceNumber} for ${targetConfigKey}`)
      return { 
        success: true, 
        updatedSequence: sequenceNumber,
        configKey: targetConfigKey,
        method: 'AccountingSettings.saveConfig'
      }

    } catch (error) {
      console.error('❌ [SalesService] Failed to update sequence in database:', error)
      return { success: false, reason: 'api_error', error: error.message }
    }
  }

  // ==================== Tax Invoices (ใบกำกับภาษี) ====================

  /**
   * Get all tax invoices
   */
  async getAllTaxInvoices() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('tax_invoices/aggregate', {
        pipeline: [
          {
            $match: {
              status: { $ne: 'deleted' }
            }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          },
          {
            $sort: { tax_invoice_date: -1 }
          }
        ]
      }, this.clientKey)

      if (response && response.data) {
        return response.data.map(taxInvoice => ({
          ...taxInvoice,
          id: taxInvoice._id || taxInvoice.id
        }))
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get tax invoices:', error)
      throw error
    }
  }

  /**
   * Create tax invoice from sales invoice
   */
  async createTaxInvoiceFromSalesInvoice(salesInvoiceId, additionalData = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log(`📋 [SalesService] Creating tax invoice from sales invoice ${salesInvoiceId}`)

      // Get sales invoice data
      const salesInvoice = await this.apiRequest.GET(`sales_invoices/${salesInvoiceId}`, this.clientKey)
      
      if (!salesInvoice?.data) {
        throw new Error('Sales invoice not found')
      }

      const invoice = salesInvoice.data

      // Generate tax invoice number
      const taxInvoiceNumber = await this.generateTaxInvoiceNumber(additionalData)

      // Create tax invoice data from sales invoice
      const taxInvoiceData = {
        tax_invoice_number: taxInvoiceNumber,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        tax_invoice_date: new Date().toISOString().split('T')[0],
        items: invoice.items || [],
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        notes: invoice.notes,
        status: 'issued',
        workflow_state: 'issued',
        reference_type: 'sales_invoice',
        reference_id: salesInvoiceId,
        reference_number: invoice.invoice_number,
        created_from: 'sales_invoice_conversion',
        
        // Tax specific fields
        tax_rate: additionalData.tax_rate || 7, // Default 7% VAT
        tax_type: additionalData.tax_type || 'VAT',
        branch_code: additionalData.branch_code || '00000',
        seller_tax_id: additionalData.seller_tax_id,
        buyer_tax_id: additionalData.buyer_tax_id,
        
        ...additionalData
      }

      const response = await this.apiRequest.POST('tax_invoices', {
        data: taxInvoiceData
      }, this.clientKey)

      // ✅ Update sequence in database after successful creation
      if (response?.data && taxInvoiceNumber) {
        try {
          console.log('🔄 [SalesService] Updating tax invoice sequence after successful creation...')
          const sequenceUpdateResult = await this.updateSequenceInDatabase(taxInvoiceNumber, 'tax_invoice')
          
          if (sequenceUpdateResult.success) {
            console.log('✅ [SalesService] Tax invoice sequence updated successfully:', sequenceUpdateResult.updatedSequence)
          } else {
            console.warn('⚠️ [SalesService] Tax invoice sequence update failed but tax invoice was created:', sequenceUpdateResult.reason)
          }
        } catch (sequenceError) {
          console.error('❌ [SalesService] Tax invoice sequence update error (non-critical):', sequenceError)
        }
      }

      // Update sales invoice status
      await this.apiRequest.PUT(`sales_invoices/${salesInvoiceId}`, {
        data: {
          status: 'tax_issued',
          workflow_state: 'tax_issued',
          tax_invoice_id: response.data.id,
          tax_invoice_number: taxInvoiceNumber,
          tax_issued_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, this.clientKey)

      console.log(`✅ [SalesService] Tax invoice created from sales invoice successfully`)
      return response?.data || null

    } catch (error) {
      console.error('❌ [SalesService] Failed to create tax invoice from sales invoice:', error)
      throw error
    }
  }

  /**
   * Get tax invoice by ID
   */
  async getTaxInvoice(taxInvoiceId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('tax_invoices/aggregate', {
        pipeline: [
          {
            $match: { _id: taxInvoiceId }
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customer_id',
              foreignField: '_id',
              as: 'customer'
            }
          },
          {
            $unwind: { 
              path: '$customer', 
              preserveNullAndEmptyArrays: true 
            }
          }
        ]
      }, this.clientKey)

      return response?.data?.[0] || null
    } catch (error) {
      console.error('❌ Failed to get tax invoice:', error)
      throw error
    }
  }

  /**
   * Get sales summary for dashboard
   */
  async getSalesSummary(dateRange = {}) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('📊 [SalesService] Loading sales summary...')

      const { startDate, endDate } = dateRange
      let matchCriteria = { status: { $ne: 'deleted' } }

      if (startDate && endDate) {
        matchCriteria.created_at = {
          $gte: startDate,
          $lte: endDate
        }
      }

      const [salesOrdersData, quotationsData, invoicesData] = await Promise.all([
        // Sales Orders Summary
        this.apiRequest.POST('sales_orders/aggregate', {
          pipeline: [
            { $match: matchCriteria },
            {
              $group: {
                _id: null,
                total_orders: { $sum: 1 },
                total_amount: { $sum: '$total_amount' },
                pending_orders: { 
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                completed_orders: { 
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            }
          ]
        }, this.clientKey),
        // Quotations Summary
        this.apiRequest.POST('quotations/aggregate', {
          pipeline: [
            { $match: matchCriteria },
            {
              $group: {
                _id: null,
                total_quotes: { $sum: 1 },
                total_quote_amount: { $sum: '$total_amount' },
                pending_quotes: { 
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                converted_quotes: { 
                  $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
                }
              }
            }
          ]
        }, this.clientKey),
        // Invoices Summary
        this.apiRequest.POST('sales_invoices/aggregate', {
          pipeline: [
            { $match: matchCriteria },
            {
              $group: {
                _id: null,
                total_invoices: { $sum: 1 },
                total_invoice_amount: { $sum: '$total_amount' },
                paid_invoices: { 
                  $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
                },
                pending_invoices: { 
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                }
              }
            }
          ]
        }, this.clientKey)
      ])

      const salesOrders = salesOrdersData?.data?.[0] || {}
      const quotations = quotationsData?.data?.[0] || {}
      const invoices = invoicesData?.data?.[0] || {}

      const summary = {
        sales_orders: {
          total_orders: salesOrders.total_orders || 0,
          total_amount: salesOrders.total_amount || 0,
          pending_orders: salesOrders.pending_orders || 0,
          completed_orders: salesOrders.completed_orders || 0
        },
        quotations: {
          total_quotes: quotations.total_quotes || 0,
          total_quote_amount: quotations.total_quote_amount || 0,
          pending_quotes: quotations.pending_quotes || 0,
          converted_quotes: quotations.converted_quotes || 0
        },
        invoices: {
          total_invoices: invoices.total_invoices || 0,
          total_invoice_amount: invoices.total_invoice_amount || 0,
          paid_invoices: invoices.paid_invoices || 0,
          pending_invoices: invoices.pending_invoices || 0
        },
        summary_date: new Date().toISOString()
      }

      console.log('✅ [SalesService] Sales summary loaded:', summary)
      return summary

    } catch (error) {
      console.error('❌ [SalesService] Failed to load sales summary:', error)
      throw error
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      customers: [],
      salesOrders: [],
      quotations: [],
      lastUpdated: null
    }
    console.log('🧹 SalesService cache cleared')
  }

  /**
   * Restore soft-deleted customer
   * กู้คืนลูกค้าที่ถูก soft delete
   */
  async restoreCustomer(customerId, newStatus = 'active') {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    const clientKey = this.clientKey || window.ERP_CORE?.clientKey || null
    
    if (!clientKey) {
      throw new Error('Client key is required for restore customer operation')
    }

    try {
      console.log('♻️ [SalesService] Restoring customer:', customerId, 'to status:', newStatus)
      
      const restoreData = {
        status: newStatus,
        deleted_at: null,
        restored_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const response = await this.apiRequest.PUT(`customers/${customerId}`, {
        data: restoreData
      }, clientKey)
      
      // Invalidate cache
      this.cache.customers = []
      this.cache.lastUpdated = null
      
      console.log('✅ [SalesService] Customer restored successfully:', customerId)
      return {
        success: true,
        data: response?.data,
        message: 'กู้คืนลูกค้าเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ Failed to restore customer:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการกู้คืนลูกค้า'
      }
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.initialized && this.apiRequest !== null
  }

  /**
   * ✅ Force refresh clientKey จาก ERP_CORE
   */
  refreshClientKey() {
    const oldKey = this.clientKey
    
    // ✅ ลำดับความสำคัญ: ERP_CORE มาก่อนเสมอ
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    console.log('🔄 [SalesService] refreshClientKey:', {
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
   * Get all customers including soft deleted (for admin)
   */
  async getAllCustomersIncludingDeleted() {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      const response = await this.apiRequest.POST('customers/aggregate', {
        pipeline: [
          { $match: {} }, // ไม่กรอง status
          { $sort: { created_at: -1 } }
        ]
      }, this.clientKey)

      if (response && response.data) {
        return response.data.map(customer => ({
          ...customer,
          id: customer._id || customer.id
        }))
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get all customers including deleted:', error)
      throw error
    }
  }

  // ==================== Document Linking Helper Methods ====================

  /**
   * Get all linked documents for a Quotation
   * Returns: { quotation, invoice, salesOrder }
   */
  async getQuotationWithLinkedDocuments(quotationId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔍 [SalesService] Getting quotation with linked documents:', quotationId)

      // 1. Get Quotation
      const quotation = await this.getQuotation(quotationId)
      
      if (!quotation) {
        throw new Error('ไม่พบข้อมูล Quotation')
      }

      const result = {
        quotation: quotation,
        invoice: null,
        salesOrder: null,
        links: {
          hasInvoice: false,
          hasSalesOrder: false
        }
      }

      // 2. Get Invoice (if exists)
      if (quotation.invoice_id) {
        try {
          result.invoice = await this.getInvoice(quotation.invoice_id)
          result.links.hasInvoice = true
          console.log('✓ Invoice found:', result.invoice.invoice_number)
        } catch (err) {
          console.warn('⚠️ Invoice reference exists but not found:', err.message)
        }
      }

      // 3. Get Sales Order (if exists)
      if (quotation.sales_order_id) {
        try {
          result.salesOrder = await this.getSalesOrder(quotation.sales_order_id)
          result.links.hasSalesOrder = true
          console.log('✓ Sales Order found:', result.salesOrder.order_number || result.salesOrder.orderNumber)
        } catch (err) {
          console.warn('⚠️ Sales Order reference exists but not found:', err.message)
        }
      }

      console.log('✅ [SalesService] Quotation linked documents:', {
        quotation_number: quotation.quote_number,
        has_invoice: result.links.hasInvoice,
        has_sales_order: result.links.hasSalesOrder
      })

      return result

    } catch (error) {
      console.error('❌ [SalesService] Failed to get quotation linked documents:', error)
      throw error
    }
  }

  /**
   * Get all linked documents for an Invoice
   * Returns: { invoice, quotation, salesOrder }
   */
  async getInvoiceWithLinkedDocuments(invoiceId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔍 [SalesService] Getting invoice with linked documents:', invoiceId)

      // 1. Get Invoice
      const invoice = await this.getInvoice(invoiceId)
      
      if (!invoice) {
        throw new Error('ไม่พบข้อมูล Invoice')
      }

      const result = {
        invoice: invoice,
        quotation: null,
        salesOrder: null,
        links: {
          hasQuotation: false,
          hasSalesOrder: false
        }
      }

      // 2. Get Quotation (if exists)
      if (invoice.quotation_id) {
        try {
          result.quotation = await this.getQuotation(invoice.quotation_id)
          result.links.hasQuotation = true
          console.log('✓ Quotation found:', result.quotation.quote_number)
        } catch (err) {
          console.warn('⚠️ Quotation reference exists but not found:', err.message)
        }
      }

      // 3. Get Sales Order (if exists)
      if (invoice.sales_order_id) {
        try {
          result.salesOrder = await this.getSalesOrder(invoice.sales_order_id)
          result.links.hasSalesOrder = true
          console.log('✓ Sales Order found:', result.salesOrder.order_number || result.salesOrder.orderNumber)
        } catch (err) {
          console.warn('⚠️ Sales Order reference exists but not found:', err.message)
        }
      }

      console.log('✅ [SalesService] Invoice linked documents:', {
        invoice_number: invoice.invoice_number,
        has_quotation: result.links.hasQuotation,
        has_sales_order: result.links.hasSalesOrder
      })

      return result

    } catch (error) {
      console.error('❌ [SalesService] Failed to get invoice linked documents:', error)
      throw error
    }
  }

  /**
   * Get all linked documents for a Sales Order
   * Returns: { salesOrder, invoice, quotation }
   */
  async getSalesOrderWithLinkedDocuments(salesOrderId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔍 [SalesService] Getting sales order with linked documents:', salesOrderId)

      // 1. Get Sales Order
      const salesOrder = await this.getSalesOrder(salesOrderId)
      
      if (!salesOrder) {
        throw new Error('ไม่พบข้อมูล Sales Order')
      }

      const result = {
        salesOrder: salesOrder,
        invoice: null,
        quotation: null,
        links: {
          hasInvoice: false,
          hasQuotation: false
        }
      }

      // 2. Get Invoice (if exists)
      if (salesOrder.invoice_id) {
        try {
          result.invoice = await this.getInvoice(salesOrder.invoice_id)
          result.links.hasInvoice = true
          console.log('✓ Invoice found:', result.invoice.invoice_number)
        } catch (err) {
          console.warn('⚠️ Invoice reference exists but not found:', err.message)
        }
      }

      // 3. Get Quotation (if exists)
      if (salesOrder.quotation_id) {
        try {
          result.quotation = await this.getQuotation(salesOrder.quotation_id)
          result.links.hasQuotation = true
          console.log('✓ Quotation found:', result.quotation.quote_number)
        } catch (err) {
          console.warn('⚠️ Quotation reference exists but not found:', err.message)
        }
      }

      console.log('✅ [SalesService] Sales Order linked documents:', {
        order_number: salesOrder.order_number || salesOrder.orderNumber,
        has_invoice: result.links.hasInvoice,
        has_quotation: result.links.hasQuotation
      })

      return result

    } catch (error) {
      console.error('❌ [SalesService] Failed to get sales order linked documents:', error)
      throw error
    }
  }

  /**
   * Get complete document chain from any document ID
   * Automatically detects document type and returns full chain
   * Returns: { quotation, invoice, salesOrder, documentType, chain }
   */
  async getDocumentChain(documentId) {
    if (!this.apiRequest) {
      throw new Error('SalesService not initialized')
    }

    try {
      console.log('🔍 [SalesService] Getting complete document chain for:', documentId)

      let result = {
        quotation: null,
        invoice: null,
        salesOrder: null,
        documentType: null,
        chain: []
      }

      // Try Quotation first
      try {
        const quotationData = await this.getQuotationWithLinkedDocuments(documentId)
        result.quotation = quotationData.quotation
        result.invoice = quotationData.invoice
        result.salesOrder = quotationData.salesOrder
        result.documentType = 'quotation'
        
        result.chain.push({ type: 'quotation', data: quotationData.quotation })
        if (quotationData.invoice) result.chain.push({ type: 'invoice', data: quotationData.invoice })
        if (quotationData.salesOrder) result.chain.push({ type: 'salesOrder', data: quotationData.salesOrder })
        
        console.log('✅ Document chain from Quotation:', result.chain.map(d => d.type).join(' → '))
        return result
      } catch (quotationError) {
        // Not a quotation, try invoice
      }

      // Try Invoice
      try {
        const invoiceData = await this.getInvoiceWithLinkedDocuments(documentId)
        result.quotation = invoiceData.quotation
        result.invoice = invoiceData.invoice
        result.salesOrder = invoiceData.salesOrder
        result.documentType = 'invoice'
        
        if (invoiceData.quotation) result.chain.push({ type: 'quotation', data: invoiceData.quotation })
        result.chain.push({ type: 'invoice', data: invoiceData.invoice })
        if (invoiceData.salesOrder) result.chain.push({ type: 'salesOrder', data: invoiceData.salesOrder })
        
        console.log('✅ Document chain from Invoice:', result.chain.map(d => d.type).join(' → '))
        return result
      } catch (invoiceError) {
        // Not an invoice, try sales order
      }

      // Try Sales Order
      try {
        const salesOrderData = await this.getSalesOrderWithLinkedDocuments(documentId)
        result.quotation = salesOrderData.quotation
        result.invoice = salesOrderData.invoice
        result.salesOrder = salesOrderData.salesOrder
        result.documentType = 'salesOrder'
        
        if (salesOrderData.quotation) result.chain.push({ type: 'quotation', data: salesOrderData.quotation })
        if (salesOrderData.invoice) result.chain.push({ type: 'invoice', data: salesOrderData.invoice })
        result.chain.push({ type: 'salesOrder', data: salesOrderData.salesOrder })
        
        console.log('✅ Document chain from Sales Order:', result.chain.map(d => d.type).join(' → '))
        return result
      } catch (salesOrderError) {
        throw new Error('ไม่พบเอกสารในระบบ (Document not found)')
      }

    } catch (error) {
      console.error('❌ [SalesService] Failed to get document chain:', error)
      throw error
    }
  }

  // ==================== Customer Helper Methods ====================

  /**
   * Search customers by name or customer_code
   */
  async searchCustomers(searchTerm) {
    try {
      const allCustomers = await this.getAllCustomers()
      
      if (!searchTerm || searchTerm.trim() === '') {
        return allCustomers
      }
      
      const term = searchTerm.toLowerCase()
      return allCustomers.filter(customer => 
        (customer.name && customer.name.toLowerCase().includes(term)) ||
        (customer.customer_code && customer.customer_code.toLowerCase().includes(term)) ||
        (customer.email && customer.email.toLowerCase().includes(term)) ||
        (customer.phone && customer.phone.includes(term))
      )
    } catch (error) {
      console.error('❌ Failed to search customers:', error)
      throw error
    }
  }

  /**
   * Get customers by status
   */
  async getCustomersByStatus(status = 'active') {
    try {
      const allCustomers = await this.getAllCustomers()
      return allCustomers.filter(customer => customer.status === status)
    } catch (error) {
      console.error('❌ Failed to get customers by status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const salesService = new SalesService()
export default salesService
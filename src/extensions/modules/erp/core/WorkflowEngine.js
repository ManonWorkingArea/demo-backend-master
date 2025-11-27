/**
 * Workflow Engine
 * จัดการ Cross-Module Integration และ Business Logic
 * ระบบจะ auto-trigger เมื่อมีการเปลี่ยน state ของ transaction
 */

import { TRANSACTION_TYPES } from './Types.js'

export class WorkflowEngine {
  constructor(transactionEngine) {
    this.engine = transactionEngine
    this.workflowQueue = []
    this.failedWorkflows = []
    this.MAX_RETRIES = 3
    this.RETRY_DELAY = 2000 // 2 seconds
    this.isProcessingQueue = false
    this.setupHooks()
  }

  /**
   * Setup event hooks สำหรับ cross-module integration
   */
  setupHooks() {
    // Hook สำหรับการ update transaction
    this.engine.on('afterUpdate', async (type, transaction) => {
      await this.handleStateChange(type, transaction)
    })

    // Hook สำหรับการสร้าง transaction ใหม่
    this.engine.on('afterCreate', async (type, transaction) => {
      await this.handleNewTransaction(type, transaction)
    })
  }

  /**
   * Queue workflow for execution with retry
   */
  async queueWorkflow(workflowType, workflowData, options = {}) {
    const workflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: workflowType,
      data: workflowData,
      retries: 0,
      maxRetries: options.maxRetries || this.MAX_RETRIES,
      priority: options.priority || 'normal', // high, normal, low
      critical: options.critical || false, // Critical workflows must succeed
      createdAt: new Date().toISOString(),
      status: 'queued'
    }

    this.workflowQueue.push(workflow)
    console.log(`📋 [WorkflowEngine] Queued workflow: ${workflowType} (ID: ${workflow.id})`)

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      await this.processQueue()
    }

    return workflow.id
  }

  /**
   * Process workflow queue with retry mechanism
   */
  async processQueue() {
    if (this.isProcessingQueue) {
      return
    }

    this.isProcessingQueue = true

    while (this.workflowQueue.length > 0) {
      // Sort by priority: high > normal > low
      this.workflowQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      const workflow = this.workflowQueue.shift()
      
      try {
        workflow.status = 'processing'
        console.log(`⚙️ [WorkflowEngine] Processing workflow: ${workflow.type} (Attempt ${workflow.retries + 1}/${workflow.maxRetries})`)

        // Execute workflow
        await this.executeWorkflow(workflow)

        workflow.status = 'completed'
        workflow.completedAt = new Date().toISOString()
        console.log(`✅ [WorkflowEngine] Workflow completed: ${workflow.type}`)

      } catch (error) {
        workflow.retries++
        workflow.lastError = error.message
        workflow.lastErrorAt = new Date().toISOString()

        console.error(`❌ [WorkflowEngine] Workflow failed: ${workflow.type} - ${error.message}`)

        // Retry logic
        if (workflow.retries < workflow.maxRetries) {
          console.log(`🔄 [WorkflowEngine] Retrying workflow ${workflow.type} in ${this.RETRY_DELAY}ms...`)
          
          // Re-queue with delay
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
          workflow.status = 'retry'
          this.workflowQueue.unshift(workflow) // Add back to front of queue
          
        } else {
          // Max retries reached
          workflow.status = 'failed'
          workflow.failedAt = new Date().toISOString()
          this.failedWorkflows.push(workflow)

          console.error(`🚨 [WorkflowEngine] Workflow permanently failed: ${workflow.type} (ID: ${workflow.id})`)
          console.error(`📝 Error: ${workflow.lastError}`)

          // Critical workflow failure - attempt rollback
          if (workflow.critical) {
            console.error(`⚠️ [WorkflowEngine] CRITICAL WORKFLOW FAILED - Attempting rollback`)
            await this.rollbackWorkflow(workflow)
          }
        }
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow) {
    const { type, data } = workflow

    switch (type) {
      case 'add_inventory_from_purchase':
        return await this.addInventoryFromPurchase(data)
      
      case 'consume_raw_materials':
        return await this.consumeRawMaterials(data)
      
      case 'add_finished_goods':
        return await this.addFinishedGoods(data)
      
      case 'reserve_inventory_from_sales':
        return await this.reserveInventoryFromSales(data)
      
      case 'create_delivery_from_sales':
        return await this.createDeliveryFromSales(data)
      
      case 'create_finance_from_purchase':
        return await this.createFinanceFromPurchase(data)
      
      case 'create_finance_from_sales':
        return await this.createFinanceFromSales(data)
      
      case 'consume_inventory_from_delivery':
        return await this.consumeInventoryFromDelivery(data)
      
      case 'update_sales_from_delivery':
        return await this.updateSalesFromDelivery(data)
      
      case 'calculate_production_cost':
        return await this.calculateProductionCost(data)
      
      case 'create_journal_entries':
        return await this.createJournalEntries(data)
      
      default:
        throw new Error(`Unknown workflow type: ${type}`)
    }
  }

  /**
   * Rollback workflow on critical failure
   */
  async rollbackWorkflow(workflow) {
    try {
      console.log(`🔄 [WorkflowEngine] Rolling back workflow: ${workflow.type}`)

      // Rollback strategies based on workflow type
      switch (workflow.type) {
        case 'add_inventory_from_purchase':
          // Remove added inventory items
          if (workflow.data.addedItems) {
            for (const itemId of workflow.data.addedItems) {
              await this.engine.delete(TRANSACTION_TYPES.INVENTORY, itemId)
            }
          }
          break

        case 'reserve_inventory_from_sales':
          // Release reserved inventory
          if (workflow.data.reservedItems) {
            for (const itemId of workflow.data.reservedItems) {
              await this.engine.update(TRANSACTION_TYPES.INVENTORY, itemId, {
                state: 'available',
                reservedFor: null,
                reservedQuantity: null
              })
            }
          }
          break

        case 'create_delivery_from_sales':
          // Delete created delivery
          if (workflow.data.deliveryId) {
            await this.engine.delete(TRANSACTION_TYPES.DELIVERY, workflow.data.deliveryId)
          }
          break

        // Add more rollback strategies as needed
      }

      console.log(`✅ [WorkflowEngine] Rollback completed for ${workflow.type}`)
    } catch (rollbackError) {
      console.error(`❌ [WorkflowEngine] Rollback failed: ${rollbackError.message}`)
      console.error(`⚠️ MANUAL INTERVENTION REQUIRED for workflow ${workflow.id}`)
    }
  }

  /**
   * Retry failed workflow manually
   */
  async retryFailedWorkflow(workflowId) {
    const failedIndex = this.failedWorkflows.findIndex(wf => wf.id === workflowId)
    
    if (failedIndex === -1) {
      throw new Error(`Failed workflow not found: ${workflowId}`)
    }

    const workflow = this.failedWorkflows[failedIndex]
    workflow.retries = 0 // Reset retry count
    workflow.status = 'retry'
    
    this.failedWorkflows.splice(failedIndex, 1)
    this.workflowQueue.push(workflow)
    
    console.log(`🔄 [WorkflowEngine] Manually retrying workflow: ${workflow.type}`)
    
    if (!this.isProcessingQueue) {
      await this.processQueue()
    }
  }

  /**
   * Clear old failed workflows
   */
  clearFailedWorkflows(daysOld = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const before = this.failedWorkflows.length
    this.failedWorkflows = this.failedWorkflows.filter(wf => {
      const failedDate = new Date(wf.failedAt)
      return failedDate > cutoffDate
    })
    const cleared = before - this.failedWorkflows.length

    console.log(`🧹 [WorkflowEngine] Cleared ${cleared} old failed workflows (older than ${daysOld} days)`)
    return cleared
  }

  /**
   * Get workflow queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.workflowQueue.length,
      isProcessing: this.isProcessingQueue,
      failedCount: this.failedWorkflows.length,
      pendingWorkflows: this.workflowQueue.map(wf => ({
        id: wf.id,
        type: wf.type,
        status: wf.status,
        retries: wf.retries,
        priority: wf.priority
      })),
      recentFailures: this.failedWorkflows.slice(-5).map(wf => ({
        id: wf.id,
        type: wf.type,
        error: wf.lastError,
        failedAt: wf.failedAt,
        retries: wf.retries
      }))
    }
  }

  /**
   * จัดการเมื่อมีการเปลี่ยน state
   */
  async handleStateChange(type, transaction) {
    const { state } = transaction

    switch (type) {
      case TRANSACTION_TYPES.PURCHASE:
        await this.handlePurchaseStateChange(transaction, state)
        break
      
      case TRANSACTION_TYPES.PRODUCTION:
        await this.handleProductionStateChange(transaction, state)
        break
      
      case TRANSACTION_TYPES.SALES:
        await this.handleSalesStateChange(transaction, state)
        break
      
      case TRANSACTION_TYPES.DELIVERY:
        await this.handleDeliveryStateChange(transaction, state)
        break
        
      case TRANSACTION_TYPES.FINANCE:
        await this.handleFinanceStateChange(transaction, state)
        break
        
      case TRANSACTION_TYPES.INVENTORY:
        await this.handleInventoryStateChange(transaction, state)
        break
    }
  }

  /**
   * จัดการการสร้าง transaction ใหม่
   */
  async handleNewTransaction(type, transaction) {
    console.log(`📝 New ${type} transaction created: ${transaction.id}`)
  }

  /**
   * Purchase State Changes - FLOW 1
   */
  async handlePurchaseStateChange(transaction, state) {
    switch (state) {
      case 'approved':
        // Purchase Request → Purchase Order
        console.log(`📋 Purchase approved: ${transaction.id} - PO created`)
        break
        
      case 'received':
        // Goods Receipt → เพิ่ม stock ใน inventory พร้อม lot/roll tracking
        await this.queueWorkflow('add_inventory_from_purchase', transaction, { critical: true })
        console.log(`📦 Goods received: ${transaction.id} - Stock addition queued`)
        break
      
      case 'invoiced':
        // Purchase Invoice → สร้าง AP Invoice ใน finance
        await this.queueWorkflow('create_finance_from_purchase', transaction, { critical: true })
        console.log(`💰 Purchase invoiced: ${transaction.id} - AP Invoice creation queued`)
        break
        
      case 'complete':
        // Payment completed (optional)
        console.log(`✅ Purchase completed: ${transaction.id} - Payment processed`)
        break
    }
  }

  /**
   * Production State Changes - FLOW 3
   */
  async handleProductionStateChange(transaction, state) {
    switch (state) {
      case 'planned':
        // Work Order created from Sales or Planning
        console.log(`🏭 Production planned: ${transaction.id} - Work Order created`)
        break
        
      case 'released':
        // Production Order released to floor
        console.log(`🚀 Production released: ${transaction.id} - Released to production floor`)
        break
        
      case 'in_progress':
        // เริ่มผลิต → ตัด stock raw materials และ allocate resources
        await this.queueWorkflow('consume_raw_materials', transaction, { critical: true })
        console.log(`⚙️ Production started: ${transaction.id} - Raw materials consumption queued`)
        break
      
      case 'completed':
        // ผลิตเสร็จ → เพิ่ม finished goods + QC data
        await this.queueWorkflow('add_finished_goods', transaction, { critical: true })
        console.log(`✅ Production completed: ${transaction.id} - Finished goods addition queued`)
        break
        
      case 'closed':
        // ปิดงาน → final costing และ reports
        await this.queueWorkflow('calculate_production_cost', transaction, { priority: 'low' })
        console.log(`🔒 Production closed: ${transaction.id} - Cost calculation queued`)
        break
    }
  }

  /**
   * Sales State Changes - FLOW 4
   */
  async handleSalesStateChange(transaction, state) {
    switch (state) {
      case 'draft':
        // Sales Draft created
        console.log(`📝 Sales draft: ${transaction.id} - Initial quotation`)
        break
        
      case 'quoted':
        // Quotation sent to customer
        console.log(`💬 Sales quoted: ${transaction.id} - Quotation sent`)
        break
        
      case 'confirmed':
        // Sales Order confirmed → reserve stock + create delivery
        await this.queueWorkflow('reserve_inventory_from_sales', transaction, { critical: true, priority: 'high' })
        await this.queueWorkflow('create_delivery_from_sales', transaction, { critical: true, priority: 'high' })
        console.log(`✅ Sales confirmed: ${transaction.id} - Stock reservation and delivery creation queued`)
        break
      
      case 'delivered':
        // สินค้าส่งถึงลูกค้าแล้ว → update from delivery module
        console.log(`🚚 Sales delivered: ${transaction.id} - Goods delivered to customer`)
        break
        
      case 'invoiced':
        // ออก Sales Invoice → สร้าง AR Invoice
        await this.queueWorkflow('create_finance_from_sales', transaction, { critical: true })
        console.log(`💰 Sales invoiced: ${transaction.id} - AR Invoice creation queued`)
        break
        
      case 'complete':
        // Payment received
        console.log(`✅ Sales completed: ${transaction.id} - Payment received`)
        break
    }
  }

  /**
   * Delivery State Changes - FLOW 5
   */
  async handleDeliveryStateChange(transaction, state) {
    switch (state) {
      case 'scheduled':
        // Delivery Request created from Sales Order
        console.log(`📅 Delivery scheduled: ${transaction.id} - Shipment planned`)
        break
        
      case 'picking':
        // Picking list generated, preparing goods
        console.log(`📋 Delivery picking: ${transaction.id} - Goods being picked`)
        break
        
      case 'shipped':
        // ยืนยันจัดส่ง → ตัด stock ใน inventory (actual consumption)
        await this.queueWorkflow('consume_inventory_from_delivery', transaction, { critical: true })
        console.log(`🚛 Delivery shipped: ${transaction.id} - Stock consumption queued`)
        break
        
      case 'delivered':
        // ลูกค้าได้รับสินค้า → update sales status + close delivery
        await this.queueWorkflow('update_sales_from_delivery', transaction, { priority: 'high' })
        console.log(`✅ Delivery completed: ${transaction.id} - Sales update queued`)
        break
        
      case 'completed':
        // ปิดงาน delivery
        console.log(`🔒 Delivery closed: ${transaction.id} - All documentation complete`)
        break
    }
  }

  /**
   * Finance State Changes - FLOW 6
   */
  async handleFinanceStateChange(transaction, state) {
    switch (state) {
      case 'draft':
        // เอกสารทางการเงินสร้างใหม่
        console.log(`💰 Finance draft: ${transaction.id} - Document created`)
        break
        
      case 'verified':
        // ผ่านการตรวจสอบ
        console.log(`✓ Finance verified: ${transaction.id} - Document verified`)
        break
        
      case 'approved':
        // ผ่านการอนุมัติ  
        console.log(`✅ Finance approved: ${transaction.id} - Document approved`)
        break
        
      case 'posted':
        // ลงบัญชีแล้ว → auto journal entries
        await this.queueWorkflow('create_journal_entries', transaction, { priority: 'high' })
        console.log(`📊 Finance posted: ${transaction.id} - Journal entries queued`)
        break
        
      case 'locked':
        // ปิดเอกสาร → immutable, no further changes
        console.log(`🔒 Finance locked: ${transaction.id} - Document locked`)
        break
        
      case 'cancelled':
        // ยกเลิกเอกสาร
        console.log(`❌ Finance cancelled: ${transaction.id} - Document cancelled`)
        break
    }
  }

  /**
   * Inventory State Changes - FLOW 2
   */
  async handleInventoryStateChange(transaction, state) {
    switch (state) {
      case 'available':
        // สินค้าพร้อมใช้งาน
        console.log(`📦 Inventory available: ${transaction.id} - Stock ready`)
        break
        
      case 'reserved':
        // จองสินค้าสำหรับ sales order
        console.log(`🎯 Inventory reserved: ${transaction.id} - Stock reserved`)
        break
        
      case 'allocated':
        // จัดสรรสำหรับ production
        console.log(`🏭 Inventory allocated: ${transaction.id} - Stock allocated to production`)
        break
        
      case 'inactive':
        // สินค้าไม่พร้อมใช้งาน (damaged, expired, etc.)
        console.log(`⚠️ Inventory inactive: ${transaction.id} - Stock inactive`)
        break
    }
  }

  /**
   * เพิ่ม inventory จาก purchase
   */
  async addInventoryFromPurchase(purchaseTransaction) {
    try {
      const items = purchaseTransaction.items || []
      
      for (const item of items) {
        const inventoryData = {
          productId: item.productId,
          productName: item.productName,
          quantity: item.receivedQuantity || item.quantity,
          unitPrice: item.unitPrice,
          totalValue: (item.receivedQuantity || item.quantity) * item.unitPrice,
          sourceType: 'purchase',
          sourceTransactionId: purchaseTransaction.id,
          location: item.location || 'main-warehouse',
          state: 'available'
        }

        const result = await this.engine.create(TRANSACTION_TYPES.INVENTORY, inventoryData)
        if (result.success) {
          console.log(`📦 Added inventory from purchase: ${item.productName} (${item.quantity})`)
        }
      }
    } catch (error) {
      console.error('Failed to add inventory from purchase:', error.message)
    }
  }

  /**
   * ตัด raw materials สำหรับการผลิต
   */
  async consumeRawMaterials(productionTransaction) {
    try {
      const materials = productionTransaction.materials || []
      
      for (const material of materials) {
        // หา inventory ที่ available
        const inventoryResult = await this.engine.list(TRANSACTION_TYPES.INVENTORY, {
          productId: material.productId,
          state: 'available'
        })

        if (inventoryResult.success && inventoryResult.data.length > 0) {
          const inventory = inventoryResult.data[0]
          
          // Update inventory state เป็น allocated
          await this.engine.update(TRANSACTION_TYPES.INVENTORY, inventory.id, {
            state: 'allocated',
            allocatedTo: productionTransaction.id,
            allocatedQuantity: material.quantity
          })

          console.log(`🏭 Allocated material: ${material.productName} (${material.quantity})`)
        }
      }
    } catch (error) {
      console.error('Failed to consume raw materials:', error.message)
    }
  }

  /**
   * เพิ่ม finished goods หลังผลิตเสร็จ
   */
  async addFinishedGoods(productionTransaction) {
    try {
      const finishedGoods = productionTransaction.finishedGoods || []
      
      for (const product of finishedGoods) {
        const inventoryData = {
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          unitPrice: product.unitCost,
          totalValue: product.quantity * product.unitCost,
          sourceType: 'production',
          sourceTransactionId: productionTransaction.id,
          location: product.location || 'finished-goods-warehouse',
          state: 'available'
        }

        const result = await this.engine.create(TRANSACTION_TYPES.INVENTORY, inventoryData)
        if (result.success) {
          console.log(`📦 Added finished goods: ${product.productName} (${product.quantity})`)
        }
      }
    } catch (error) {
      console.error('Failed to add finished goods:', error.message)
    }
  }

  /**
   * Reserve inventory จาก sales
   */
  async reserveInventoryFromSales(salesTransaction) {
    try {
      const items = salesTransaction.items || []
      
      for (const item of items) {
        // หา inventory ที่ available
        const inventoryResult = await this.engine.list(TRANSACTION_TYPES.INVENTORY, {
          productId: item.productId,
          state: 'available'
        })

        if (inventoryResult.success && inventoryResult.data.length > 0) {
          const inventory = inventoryResult.data[0]
          
          // Update inventory state เป็น reserved
          await this.engine.update(TRANSACTION_TYPES.INVENTORY, inventory.id, {
            state: 'reserved',
            reservedFor: salesTransaction.id,
            reservedQuantity: item.quantity
          })

          console.log(`🎯 Reserved inventory: ${item.productName} (${item.quantity})`)
        }
      }
    } catch (error) {
      console.error('Failed to reserve inventory:', error.message)
    }
  }

  /**
   * สร้าง delivery จาก sales
   */
  async createDeliveryFromSales(salesTransaction) {
    try {
      const deliveryData = {
        sourceType: 'sales',
        sourceTransactionId: salesTransaction.id,
        customerId: salesTransaction.customerId,
        customerName: salesTransaction.customerName,
        deliveryAddress: salesTransaction.deliveryAddress,
        items: salesTransaction.items,
        state: 'scheduled'
      }

      const result = await this.engine.create(TRANSACTION_TYPES.DELIVERY, deliveryData)
      if (result.success) {
        console.log(`🚚 Created delivery from sales: ${result.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create delivery from sales:', error.message)
    }
  }

  /**
   * สร้าง finance transaction จาก purchase
   */
  async createFinanceFromPurchase(purchaseTransaction) {
    try {
      const financeData = {
        documentType: 'purchase-invoice',
        sourceType: 'purchase',
        sourceTransactionId: purchaseTransaction.id,
        partyId: purchaseTransaction.supplierId,
        partyName: purchaseTransaction.supplierName,
        amount: purchaseTransaction.totalAmount,
        dueDate: purchaseTransaction.dueDate,
        state: 'draft'
      }

      const result = await this.engine.create(TRANSACTION_TYPES.FINANCE, financeData)
      if (result.success) {
        console.log(`💰 Created finance from purchase: ${result.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create finance from purchase:', error.message)
    }
  }

  /**
   * สร้าง finance transaction จาก sales
   */
  async createFinanceFromSales(salesTransaction) {
    try {
      const financeData = {
        documentType: 'sales-invoice',
        sourceType: 'sales',
        sourceTransactionId: salesTransaction.id,
        partyId: salesTransaction.customerId,
        partyName: salesTransaction.customerName,
        amount: salesTransaction.totalAmount,
        dueDate: salesTransaction.dueDate,
        state: 'draft'
      }

      const result = await this.engine.create(TRANSACTION_TYPES.FINANCE, financeData)
      if (result.success) {
        console.log(`💰 Created finance from sales: ${result.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create finance from sales:', error.message)
    }
  }

  /**
   * Update sales จาก delivery
   */
  async updateSalesFromDelivery(deliveryTransaction) {
    try {
      if (deliveryTransaction.sourceType === 'sales' && deliveryTransaction.sourceTransactionId) {
        await this.engine.update(TRANSACTION_TYPES.SALES, deliveryTransaction.sourceTransactionId, {
          state: 'delivered',
          deliveredAt: new Date().toISOString()
        })

        console.log(`✅ Updated sales from delivery: ${deliveryTransaction.sourceTransactionId}`)
      }
    } catch (error) {
      console.error('Failed to update sales from delivery:', error.message)
    }
  }

  /**
   * ตัด stock จาก delivery (actual consumption)
   */
  async consumeInventoryFromDelivery(deliveryTransaction) {
    try {
      const items = deliveryTransaction.items || []
      
      for (const item of items) {
        // หา inventory ที่ reserved สำหรับ sales order นี้
        const inventoryResult = await this.engine.list(TRANSACTION_TYPES.INVENTORY, {
          productId: item.productId,
          state: 'reserved',
          reservedFor: deliveryTransaction.sourceTransactionId
        })

        if (inventoryResult.success && inventoryResult.data.length > 0) {
          const inventory = inventoryResult.data[0]
          
          // ตัด stock จริง (อาจจะลบหรือเปลี่ยนเป็น consumed)
          await this.engine.update(TRANSACTION_TYPES.INVENTORY, inventory.id, {
            state: 'inactive', // หรือ consumed
            consumedBy: deliveryTransaction.id,
            consumedQuantity: item.deliveredQuantity || item.quantity,
            consumedAt: new Date().toISOString()
          })

          console.log(`📤 Consumed inventory: ${item.productName} (${item.quantity})`)
        }
      }
    } catch (error) {
      console.error('Failed to consume inventory from delivery:', error.message)
    }
  }

  /**
   * คำนวณต้นทุนการผลิต
   */
  async calculateProductionCost(productionTransaction) {
    try {
      let totalCost = 0
      const materials = productionTransaction.materials || []
      
      // คำนวณต้นทุนจาก raw materials
      for (const material of materials) {
        const materialCost = (material.quantity || 0) * (material.unitCost || 0)
        totalCost += materialCost
      }
      
      // เพิ่มต้นทุนแรงงานและโอเวอร์เฮด
      const laborCost = productionTransaction.laborCost || 0
      const overheadCost = productionTransaction.overheadCost || 0
      totalCost += laborCost + overheadCost
      
      // Update production transaction ด้วยต้นทุนจริง
      await this.engine.update(TRANSACTION_TYPES.PRODUCTION, productionTransaction.id, {
        actualCost: totalCost,
        costCalculatedAt: new Date().toISOString()
      })
      
      console.log(`💰 Production cost calculated: ${productionTransaction.id} = ${totalCost}`)
    } catch (error) {
      console.error('Failed to calculate production cost:', error.message)
    }
  }

  /**
   * สร้าง Journal Entries อัตโนมัติ
   */
  async createJournalEntries(financeTransaction) {
    try {
      const journalEntries = []
      const documentType = financeTransaction.documentType
      const amount = financeTransaction.amount || 0
      
      // สร้าง journal entries ตามประเภทเอกสาร
      switch (documentType) {
        case 'sales-invoice':
          journalEntries.push({
            account: 'accounts-receivable',
            debit: amount,
            credit: 0,
            description: `AR from sales invoice ${financeTransaction.id}`
          })
          journalEntries.push({
            account: 'sales-revenue',
            debit: 0,
            credit: amount,
            description: `Sales revenue from invoice ${financeTransaction.id}`
          })
          break
          
        case 'purchase-invoice':
          journalEntries.push({
            account: 'inventory-asset',
            debit: amount,
            credit: 0,
            description: `Inventory from purchase ${financeTransaction.id}`
          })
          journalEntries.push({
            account: 'accounts-payable',
            debit: 0,
            credit: amount,
            description: `AP from purchase invoice ${financeTransaction.id}`
          })
          break
      }
      
      // บันทึก journal entries
      financeTransaction.journalEntries = journalEntries
      console.log(`📊 Journal entries created for ${financeTransaction.id}:`, journalEntries.length, 'entries')
      
    } catch (error) {
      console.error('Failed to create journal entries:', error.message)
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats() {
    const stats = {
      flows: {
        purchase: { total: 0, by_state: {} },
        production: { total: 0, by_state: {} },
        sales: { total: 0, by_state: {} },
        inventory: { total: 0, by_state: {} },
        delivery: { total: 0, by_state: {} },
        finance: { total: 0, by_state: {} }
      },
      integrations: {
        purchase_to_inventory: 0,
        production_to_inventory: 0, 
        sales_to_delivery: 0,
        sales_to_finance: 0,
        delivery_to_sales: 0
      },
      pending_workflows: this.workflowQueue.length,
      failed_workflows: this.failedWorkflows.length,
      queue_status: this.getQueueStatus()
    }

    // คำนวณ stats จากทุก transaction types
    for (const type of Object.values(TRANSACTION_TYPES)) {
      try {
        const result = await this.engine.getStats(type)
        if (result.success) {
          stats.flows[type] = {
            total: result.data.total || 0,
            by_state: result.data.by_state || {}
          }
        }
      } catch (error) {
        console.warn(`Failed to get stats for ${type}:`, error.message)
      }
    }

    return stats
  }
}

// Export singleton
export default WorkflowEngine
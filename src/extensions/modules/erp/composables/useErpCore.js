/**
 * useErpCore Composable
 * Helper composable สำหรับใช้งาน ERP Core ใน Composition API
 * 
 * Usage:
 * 
 * <script setup>
 * import { useErpCore } from '@/extensions/modules/erp/composables/useErpCore'
 * 
 * const { items, loading, loadItems, createItem } = useErpCore('inventory')
 * </script>
 */

import { ref, inject } from 'vue'

/**
 * Main composable for ERP Core operations
 */
export function useErpCore() {
  const erpCore = inject('erpCore')
  
  if (!erpCore) {
    throw new Error('erpCore not found. Did you install the plugin?')
  }
  
  const loading = ref(false)
  const error = ref(null)
  
  // Helper to handle async operations
  const handleAsync = async (operation) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await operation()
      return result
    } catch (err) {
      error.value = err.message
      erpCore.showNotification('error', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    erpCore,
    loading,
    error,
    handleAsync
  }
}

/**
 * Composable for managing a list of transactions
 */
export function useErpList(transactionType, initialFilters = {}) {
  const { erpCore, loading, error, handleAsync } = useErpCore()
  
  const items = ref([])
  const filters = ref(initialFilters)
  const total = ref(0)
  
  const loadItems = async (customFilters = {}) => {
    return handleAsync(async () => {
      const result = await erpCore.list(transactionType, {
        ...filters.value,
        ...customFilters
      })
      
      if (result.success) {
        items.value = result.data
        total.value = result.count || result.data.length
      }
      
      return result
    })
  }
  
  const createItem = async (data, userId) => {
    return handleAsync(async () => {
      const result = await erpCore.create(transactionType, data, userId)
      
      if (result.success) {
        items.value.push(result.data)
        erpCore.showNotification('success', 'สร้างข้อมูลสำเร็จ')
      }
      
      return result
    })
  }
  
  const updateItem = async (id, updates, userId) => {
    return handleAsync(async () => {
      const result = await erpCore.update(transactionType, id, updates, userId)
      
      if (result.success) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = result.data
        }
        erpCore.showNotification('success', 'อัพเดทสำเร็จ')
      }
      
      return result
    })
  }
  
  const deleteItem = async (id, userId) => {
    return handleAsync(async () => {
      const result = await erpCore.delete(transactionType, id, userId)
      
      if (result.success) {
        items.value = items.value.filter(item => item.id !== id)
        erpCore.showNotification('success', 'ลบสำเร็จ')
      }
      
      return result
    })
  }
  
  const refreshItems = () => loadItems()
  
  return {
    items,
    loading,
    error,
    filters,
    total,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    refreshItems
  }
}

/**
 * Composable for managing a single transaction
 */
export function useErpItem(transactionType, itemId = null) {
  const { erpCore, loading, error, handleAsync } = useErpCore()
  
  const item = ref(null)
  
  const loadItem = async (id = itemId) => {
    if (!id) {
      throw new Error('Item ID is required')
    }
    
    return handleAsync(async () => {
      const result = await erpCore.read(transactionType, id)
      
      if (result.success) {
        item.value = result.data
      }
      
      return result
    })
  }
  
  const saveItem = async (data, userId) => {
    return handleAsync(async () => {
      let result
      
      if (item.value?.id) {
        // Update existing
        result = await erpCore.update(transactionType, item.value.id, data, userId)
      } else {
        // Create new
        result = await erpCore.create(transactionType, data, userId)
      }
      
      if (result.success) {
        item.value = result.data
        erpCore.showNotification('success', 'บันทึกสำเร็จ')
      }
      
      return result
    })
  }
  
  const resetItem = () => {
    item.value = null
  }
  
  return {
    item,
    loading,
    error,
    loadItem,
    saveItem,
    resetItem
  }
}

/**
 * Composable for inventory balance management
 */
export function useErpBalance() {
  const { erpCore, loading, error, handleAsync } = useErpCore()
  
  const ensureBalance = async (productData, options = {}) => {
    return handleAsync(async () => {
      const result = await erpCore.balance.ensureProductBalance(productData, options)
      return result
    })
  }
  
  const findBalance = async (productId, locationId = null) => {
    return handleAsync(async () => {
      const result = await erpCore.balance.findProductBalance(productId, locationId)
      return result
    })
  }
  
  const updateBalance = async (movementData, options = {}) => {
    return handleAsync(async () => {
      const result = await erpCore.balance.updateBalanceFromMovement(movementData, options)
      return result
    })
  }
  
  const recalculate = async (productId, locationId, options = {}) => {
    return handleAsync(async () => {
      const result = await erpCore.balance.recalculateBalance(productId, locationId, options)
      return result
    })
  }
  
  const getSummary = async (productId) => {
    return handleAsync(async () => {
      const result = await erpCore.balance.getProductBalanceSummary(productId)
      return result
    })
  }
  
  return {
    loading,
    error,
    ensureBalance,
    findBalance,
    updateBalance,
    recalculate,
    getSummary
  }
}

/**
 * Composable for module functions
 */
export function useErpModule(moduleName) {
  const { erpCore, loading, error, handleAsync } = useErpCore()
  
  const execute = async (functionName, ...args) => {
    return handleAsync(async () => {
      const result = await erpCore.executeModuleFunction(moduleName, functionName, ...args)
      return result
    })
  }
  
  const calculate = async (functionName, ...args) => {
    return handleAsync(async () => {
      const result = await erpCore.calculate(moduleName, functionName, ...args)
      return result
    })
  }
  
  const validate = async (data) => {
    return handleAsync(async () => {
      const result = await erpCore.validate(moduleName, data)
      return result
    })
  }
  
  return {
    loading,
    error,
    execute,
    calculate,
    validate
  }
}

<template>
  <div class="stock-adjustment-create">
    <h2>Create Stock Adjustment</h2>
    <!-- Adjustment creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Adjustment Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockAdjustmentCreate',
  setup() {
    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const inventory = getInventoryModule()
    
    return {
      ADJUSTMENT_TYPES: inventory.ADJUSTMENT_TYPES || {}
    }
  }
}
</script>
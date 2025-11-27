<template>
  <div class="stock-adjustment-edit">
    <h2>Edit Stock Adjustment</h2>
    <!-- Adjustment edit form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Adjustment Edit
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockAdjustmentEdit',
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
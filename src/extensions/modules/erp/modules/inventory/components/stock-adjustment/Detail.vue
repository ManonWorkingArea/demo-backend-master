<template>
  <div class="stock-adjustment-detail">
    <h2>Stock Adjustment Detail</h2>
    <!-- Adjustment detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Adjustment Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockAdjustmentDetail',
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
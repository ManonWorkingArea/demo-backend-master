<template>
  <div class="stock-overview-detail">
    <h2>Stock Detail</h2>
    <!-- Detailed stock information -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Overview Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockOverviewDetail',
  setup() {
    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const inventory = getInventoryModule()
    
    return {
      INVENTORY_STATES: inventory.INVENTORY_STATES || {}
    }
  }
}
</script>
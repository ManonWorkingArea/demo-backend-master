<template>
  <div class="stock-count-create">
    <h2>Start Stock Count</h2>
    <!-- New stock count session -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Count Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockCountCreate',
  setup() {
    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const inventory = getInventoryModule()
    
    return {
      COUNT_STATES: inventory.COUNT_STATES || {}
    }
  }
}
</script>
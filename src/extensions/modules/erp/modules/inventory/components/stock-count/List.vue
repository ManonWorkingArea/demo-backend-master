<template>
  <div class="stock-count-list">
    <h2>Stock Count Sessions</h2>
    <!-- Stock count sessions -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Count List
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockCountList',
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
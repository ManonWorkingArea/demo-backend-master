<template>
  <div class="stock-count-detail">
    <h2>Stock Count Detail</h2>
    <!-- Stock count session detail -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Count Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockCountDetail',
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
<template>
  <div class="stock-movement-detail">
    <h2>Stock Movement Detail</h2>
    <!-- Movement detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Movement Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockMovementDetail',
  setup() {
    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const inventory = getInventoryModule()
    
    return {
      INVENTORY_MOVEMENT_TYPES: inventory.INVENTORY_MOVEMENT_TYPES || {}
    }
  }
}
</script>
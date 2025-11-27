<template>
  <div class="stock-movement-create">
    <h2>Create Stock Movement</h2>
    <!-- Movement creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Movement Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockMovementCreate',
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
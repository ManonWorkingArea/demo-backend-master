<template>
  <div class="work-order-materials">
    <h2>Work Order Materials</h2>
    <!-- Materials requirement and consumption -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Work Order Materials
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'WorkOrderMaterials',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const production = getProductionModule()
    const inventory = getInventoryModule()
    
    return {
      MATERIAL_STATES: production.MATERIAL_STATES || {},
      BOM_TYPES: production.BOM_TYPES || {},
      INVENTORY_STATES: inventory.INVENTORY_STATES || {}
    }
  }
}
</script>
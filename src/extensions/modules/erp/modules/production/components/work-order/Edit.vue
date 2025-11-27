<template>
  <div class="work-order-edit">
    <h2>Edit Work Order</h2>
    <!-- Work order edit form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Work Order Edit
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'WorkOrderEdit',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const production = getProductionModule()
    
    return {
      WORK_ORDER_STATES: production.WORK_ORDER_STATES || {},
      WORK_ORDER_TYPES: production.WORK_ORDER_TYPES || {}
    }
  }
}
</script>
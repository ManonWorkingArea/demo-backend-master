<template>
  <div class="work-order-create">
    <h2>Create Work Order</h2>
    <!-- Work order creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Work Order Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'WorkOrderCreate',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const getProductModule = () => {
      return window.ERP_CORE?.modules?.product || {}
    }

    const production = getProductionModule()
    const product = getProductModule()
    
    return {
      WORK_ORDER_STATES: production.WORK_ORDER_STATES || {},
      WORK_ORDER_TYPES: production.WORK_ORDER_TYPES || {},
      PRODUCT_TYPES: product.PRODUCT_TYPES || {}
    }
  }
}
</script>
<template>
  <div class="production-plan-create">
    <h2>Create Production Plan</h2>
    <!-- Production plan creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production Plan Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionPlanCreate',
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
      PRODUCTION_PLAN_STATES: production.PRODUCTION_PLAN_STATES || {},
      PLAN_TYPES: production.PLAN_TYPES || {},
      PRODUCT_TYPES: product.PRODUCT_TYPES || {}
    }
  }
}
</script>
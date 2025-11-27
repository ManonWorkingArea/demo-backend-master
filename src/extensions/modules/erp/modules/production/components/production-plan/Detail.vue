<template>
  <div class="production-plan-detail">
    <h2>Production Plan Detail</h2>
    <!-- Production plan detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production Plan Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionPlanDetail',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const production = getProductionModule()
    
    return {
      PRODUCTION_PLAN_STATES: production.PRODUCTION_PLAN_STATES || {},
      PLAN_TYPES: production.PLAN_TYPES || {}
    }
  }
}
</script>
<template>
  <div class="production-plan-edit">
    <h2>Edit Production Plan</h2>
    <!-- Production plan edit form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production Plan Edit
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionPlanEdit',
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